'use server';

/**
 * Tagiva - Invoice Email Server Actions
 *
 * Implements:
 * - D-11: Pro-only email delivery with attached PDF
 * - D-51: Transactional emails from invoices@tagiva.com with Reply-To set to sender
 * - D-57: Rate limiting (50/day/account, 5/day/invoice in Asia/Jakarta)
 * - FR-9.1 - FR-9.6: Delivery lifecycle, draft auto-issuance, and public token guarantee
 */

import crypto from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  SendInvoiceEmailSchema,
  type SendInvoiceEmailInput,
} from '@/lib/validations/invoice';
import {
  ok,
  err,
  validationError,
  type ActionResult,
} from '@/lib/api/action-result';
import { canUseProFeature, type UserPlanState } from '@/lib/domain/entitlements';
import { getTodayWibString } from '@/lib/domain/timezone';
import { sendEmail } from '@/lib/email/client';
import { renderInvoiceEmailHtml } from '@/lib/email/templates/invoice-email';
import { normalizeInvoiceData } from '@/components/invoice-templates';
import { renderInvoicePdfToBuffer } from '@/components/invoice-templates/modern-minimalist/pdf-document';

async function resolvePlanState(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<UserPlanState> {
  const { data, error } = await (
    supabase.rpc as unknown as (
      fn: string,
      args: { p_user_id: string },
    ) => Promise<{ data: string | null; error: unknown }>
  )('get_user_plan_state', { p_user_id: userId });

  if (error || !data) {
    return 'free';
  }

  return data as UserPlanState;
}

export async function sendInvoiceEmailAction(
  rawInput: SendInvoiceEmailInput,
): Promise<ActionResult<{ messageId?: string; sentAt: string }>> {
  const parsed = SendInvoiceEmailSchema.safeParse(rawInput);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { invoiceId, recipientEmail, subject, message } = parsed.data;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return err('UNAUTHENTICATED', 'You must be signed in.');
  }

  // 1. Pro Entitlement Check (D-11)
  const planState = await resolvePlanState(supabase, user.id);
  if (!canUseProFeature(planState)) {
    return err('PRO_REQUIRED', 'Email delivery is a Pro feature.');
  }

  // 2. Daily Rate-Limit Check in Asia/Jakarta (D-57)
  const todayWib = getTodayWibString();

  // 2a. Account-level rate limit: max 50 emails/day
  const { count: userDailyCount, error: userCountError } = await supabase
    .from('invoice_email_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('sent_date_wib', todayWib);

  if (!userCountError && (userDailyCount ?? 0) >= 50) {
    return err('RATE_LIMIT_EXCEEDED', 'Daily limit of 50 invoice emails reached.');
  }

  // 2b. Invoice-level rate limit: max 5 emails/day per invoice
  const { count: invoiceDailyCount, error: invCountError } = await supabase
    .from('invoice_email_logs')
    .select('*', { count: 'exact', head: true })
    .eq('invoice_id', invoiceId)
    .eq('sent_date_wib', todayWib);

  if (!invCountError && (invoiceDailyCount ?? 0) >= 5) {
    return err('RATE_LIMIT_EXCEEDED', 'This invoice has already been emailed 5 times today.');
  }

  // 3. Fetch invoice and ensure ownership
  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !invoice) {
    return err('NOT_FOUND', 'Invoice not found.');
  }

  // 4. Auto-issue Draft if not yet issued (FR-9.6)
  let currentInvoiceNumber = invoice.invoice_number;
  let currentStatus = invoice.status;

  if (invoice.status === 'draft') {
    const { data: issuedNumber, error: issueError } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: { p_invoice_id: string },
      ) => Promise<{ data: string | null; error: unknown }>
    )('issue_invoice', { p_invoice_id: invoiceId });

    if (issueError || !issuedNumber) {
      return err('INTERNAL_ERROR', 'Failed to issue invoice prior to emailing.');
    }
    currentInvoiceNumber = issuedNumber;
    currentStatus = 'sent';
  }

  // 5. Ensure Public Token & Link Enabled (FR-9.3)
  const token =
    invoice.public_token ||
    crypto.randomBytes(18).toString('base64url').slice(0, 24);

  await supabase
    .from('invoices')
    .update({
      public_token: token,
      public_link_enabled: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)
    .eq('user_id', user.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tagiva.com';
  const publicUrl = `${appUrl}/i/${token}`;

  // 6. Fetch Items & Generate PDF Buffer
  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('sort_order', { ascending: true });

  const normalizedInvoice = normalizeInvoiceData({
    ...invoice,
    status: currentStatus,
    invoice_number: currentInvoiceNumber,
    items: items ?? [],
  });

  // Pro users never have platform watermark on PDF (FR-7.3)
  const pdfBuffer = await renderInvoicePdfToBuffer(normalizedInvoice, false);

  // 7. Render Bilingual HTML Email
  const emailHtml = renderInvoiceEmailHtml({
    senderName: invoice.sender_name || 'Tagiva Invoice',
    senderEmail: invoice.sender_email || user.email,
    clientName: invoice.client_name || 'Valued Client',
    invoiceNumber: currentInvoiceNumber || 'Invoice',
    dueDate: invoice.due_date,
    issueDate: invoice.issue_date,
    currency: invoice.currency || 'IDR',
    totalAmount: Number(invoice.total_amount || 0),
    message,
    publicUrl,
    language: invoice.language === 'id' ? 'id' : 'en',
  });

  // 8. Dispatch Email via Resend (D-51)
  const senderDisplayName = (invoice.sender_name || 'Invoicing').trim();
  const fromAddress = `${senderDisplayName} via Tagiva <invoices@tagiva.com>`;
  const replyToAddress = invoice.sender_email?.trim() || user.email || 'support@tagiva.com';

  const safeFilename = `${(currentInvoiceNumber || 'Invoice').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

  const emailRes = await sendEmail({
    from: fromAddress,
    to: recipientEmail,
    replyTo: replyToAddress,
    subject: subject.trim(),
    html: emailHtml,
    attachments: [
      {
        filename: safeFilename,
        content: pdfBuffer,
      },
    ],
  });

  if (emailRes.error) {
    return err('INTERNAL_ERROR', `Email dispatch failed: ${emailRes.error}`);
  }

  // 9. Log Email Dispatch (D-57)
  const sentAtIso = new Date().toISOString();
  await supabase.from('invoice_email_logs').insert({
    user_id: user.id,
    invoice_id: invoiceId,
    recipient_email: recipientEmail,
    sent_date_wib: todayWib,
    resend_message_id: emailRes.id || null,
    sent_at: sentAtIso,
  });

  // 10. Update Invoice Timestamps
  await supabase
    .from('invoices')
    .update({
      sent_at: sentAtIso,
      status: currentStatus,
      updated_at: sentAtIso,
    })
    .eq('id', invoiceId)
    .eq('user_id', user.id);

  revalidatePath('/dashboard');
  revalidatePath(`/invoices/${invoiceId}`);

  return ok({
    messageId: emailRes.id,
    sentAt: sentAtIso,
  });
}
