'use server';

/**
 * Tagiva - Invoice Lifecycle Server Actions
 *
 * Implements:
 * - saveInvoiceDraftAction (D-12, D-30, D-33, D-55, NFR-4)
 * - issueInvoiceAction (D-13, D-30, D-56, FR-2.3)
 * - updateInvoiceStatusAction (D-15, D-28, A-16, A-18)
 * - deleteInvoiceAction (D-21, D-28, D-29, A-12)
 * - duplicateInvoiceAction (D-12, D-33)
 * - createOrTogglePublicLinkAction (FR-8, D-11, D-40)
 *
 * Delegated to InvoiceService (src/services/invoice-service.ts) for decoupled database operations.
 */

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { calculateInvoiceTotals } from '@/lib/domain/calculations';
import {
  canCreateInvoice,
  canDeleteInvoice,
  canEditInvoice,
  canChangeStatus,
  canUseProFeature,
} from '@/lib/domain/entitlements';
import { getTodayWibString, addDaysWib } from '@/lib/domain/timezone';
import {
  SaveInvoiceSchema,
  IssueInvoiceSchema,
  UpdateInvoiceStatusSchema,
  DeleteInvoiceSchema,
  DuplicateInvoiceSchema,
  CreateOrTogglePublicLinkSchema,
  type SaveInvoiceInput,
  type IssueInvoiceInput,
  type UpdateInvoiceStatusInput,
  type DeleteInvoiceInput,
  type DuplicateInvoiceInput,
  type CreateOrTogglePublicLinkInput,
} from '@/lib/validations/invoice';
import {
  ok,
  err,
  validationError,
  type ActionResult,
} from '@/lib/api/action-result';
import { InvoiceService } from '@/services/invoice-service';

/**
 * Creates or updates an invoice draft.
 * - Server strictly recalculates totals (NFR-4)
 * - Never trusts client-supplied invoice numbers (D-55)
 * - Enforces Free 3-invoice limit (D-12, D-33)
 * - Enforces Lapsed read-only rule (D-23, D-28)
 */
export async function saveInvoiceDraftAction(
  rawInput: SaveInvoiceInput,
): Promise<ActionResult<{ invoiceId: string; status: string }>> {
  try {
    const parsed = SaveInvoiceSchema.safeParse(rawInput);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const input = parsed.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return err('UNAUTHENTICATED', 'You must be signed in to save an invoice.');
    }

    const planState = await InvoiceService.getUserPlanState(user.id, supabase);

    // 1. Deterministic Server-Side Money Calculations (NFR-4)
    const calcResult = calculateInvoiceTotals({
      items: input.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      discountType: input.discountType,
      discountValue: input.discountValue,
      taxRate: input.taxRate,
    });

    const itemsToPersist = calcResult.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    }));

    // 2. If Updating Existing Invoice (input.id exists)
    if (input.id) {
      const existing = await InvoiceService.getInvoiceById(input.id, user.id, supabase);

      if (!existing) {
        return err('NOT_FOUND', 'Invoice not found.');
      }

      // Check Lapsed read-only restriction (D-23, D-28, TC-ENT-06)
      if (!canEditInvoice(planState)) {
        return err(
          'LAPSED_READ_ONLY',
          'Your Pro subscription has ended. Existing invoices are read-only.',
        );
      }

      // If client requested saving customer to directory
      if (input.saveCustomerToDirectory && input.client.name) {
        await InvoiceService.upsertCustomer(
          user.id,
          {
            name: input.client.name,
            company: input.client.company,
            email: input.client.email,
            address: input.client.address,
          },
          supabase,
        );
      }

      // Update invoice row - never overwrite sequence number or status! (D-55)
      await InvoiceService.updateInvoice(
        input.id,
        user.id,
        {
          customer_id: input.customerId ?? null,
          language: input.language,
          currency: input.currency,
          issue_date: input.issueDate,
          due_date: input.dueDate,
          sender_name: input.sender.name,
          sender_email: input.sender.email,
          sender_phone: input.sender.phone,
          sender_address: input.sender.address,
          sender_tax_id: input.sender.taxId,
          payment_instructions: input.sender.paymentInstructions,
          client_name: input.client.name,
          client_company: input.client.company,
          client_email: input.client.email,
          client_address: input.client.address,
          subtotal: calcResult.subtotal,
          discount_type: input.discountType,
          discount_value: input.discountValue,
          discount_amount: calcResult.discountAmount,
          tax_label: input.taxLabel,
          tax_rate: input.taxRate,
          tax_amount: calcResult.taxAmount,
          total_amount: calcResult.totalAmount,
          notes: input.notes,
          updated_at: new Date().toISOString(),
        },
        itemsToPersist,
        supabase,
      );

      revalidatePath('/dashboard');
      revalidatePath(`/invoices/${input.id}`);

      return ok({ invoiceId: input.id, status: existing.status });
    }

    // 3. If Creating New Invoice (!input.id)
    const currentCount = await InvoiceService.countUserInvoices(user.id, supabase);

    // Enforce Free 3-invoice cap (D-12, D-33, TC-ENT-02, TC-ENT-09)
    if (!canCreateInvoice(planState, currentCount)) {
      return err(
        'PLAN_LIMIT_REACHED',
        'You have reached the 3-invoice limit on your plan. Upgrade to Pro for unlimited invoices.',
      );
    }

    // Snapshot logo only for Pro users (D-27, A-23)
    let logoUrlSnapshot: string | null = null;
    if (planState === 'pro') {
      logoUrlSnapshot = await InvoiceService.getUserLogo(user.id, supabase);
    }

    // Optional: save customer to directory
    let assignedCustomerId = input.customerId ?? null;
    if (input.saveCustomerToDirectory && input.client.name) {
      const customerId = await InvoiceService.upsertCustomer(
        user.id,
        {
          name: input.client.name,
          company: input.client.company,
          email: input.client.email,
          address: input.client.address,
        },
        supabase,
      );
      if (customerId) {
        assignedCustomerId = customerId;
      }
    }

    // Insert Draft Invoice (D-30: status = 'draft', invoice_number = NULL)
    const newInvoice = await InvoiceService.createDraftInvoice(
      {
        user_id: user.id,
        customer_id: assignedCustomerId,
        template_id: 'modern-minimalist',
        invoice_number: null, // Strictly NULL for draft (D-30)
        status: 'draft',
        language: input.language,
        currency: input.currency,
        issue_date: input.issueDate,
        due_date: input.dueDate,
        sender_name: input.sender.name,
        sender_email: input.sender.email,
        sender_phone: input.sender.phone,
        sender_address: input.sender.address,
        sender_tax_id: input.sender.taxId,
        logo_url: logoUrlSnapshot,
        payment_instructions: input.sender.paymentInstructions,
        client_name: input.client.name,
        client_company: input.client.company,
        client_email: input.client.email,
        client_address: input.client.address,
        subtotal: calcResult.subtotal,
        discount_type: input.discountType,
        discount_value: input.discountValue,
        discount_amount: calcResult.discountAmount,
        tax_label: input.taxLabel,
        tax_rate: input.taxRate,
        tax_amount: calcResult.taxAmount,
        total_amount: calcResult.totalAmount,
        notes: input.notes,
      },
      itemsToPersist,
      supabase,
    );

    revalidatePath('/dashboard');
    revalidatePath(`/invoices/${newInvoice.id}`);

    return ok({ invoiceId: newInvoice.id, status: newInvoice.status });
  } catch (error) {
    console.error('Unexpected error in saveInvoiceDraftAction:', error);
    return err('INTERNAL_ERROR', 'Failed to save invoice draft. Please try again.');
  }
}

/**
 * Issues a draft invoice, assigning permanent number via atomic RPC (D-13, D-30, D-56).
 */
export async function issueInvoiceAction(
  rawInput: IssueInvoiceInput,
): Promise<ActionResult<{ invoiceId: string; invoiceNumber: string; status: 'sent' }>> {
  try {
    const parsed = IssueInvoiceSchema.safeParse(rawInput);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { invoiceId } = parsed.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return err('UNAUTHENTICATED', 'You must be signed in to issue an invoice.');
    }

    // Verify ownership and draft status
    const invoice = await InvoiceService.getInvoiceById(invoiceId, user.id, supabase);

    if (!invoice) {
      return err('NOT_FOUND', 'Invoice not found.');
    }

    if (invoice.status !== 'draft') {
      return err(
        'INVALID_STATUS_TRANSITION',
        'This invoice has already been issued with a permanent number.',
      );
    }

    // Call Atomic issue_invoice RPC via service (D-56)
    const issuedNumber = await InvoiceService.issueInvoice(invoiceId, supabase);

    revalidatePath('/dashboard');
    revalidatePath(`/invoices/${invoiceId}`);

    return ok({
      invoiceId,
      invoiceNumber: issuedNumber,
      status: 'sent',
    });
  } catch (error) {
    console.error('Unexpected error in issueInvoiceAction:', error);
    return err('INTERNAL_ERROR', 'Failed to issue invoice. Please try again.');
  }
}

/**
 * Updates an issued invoice's status between 'sent' and 'paid' (D-15, D-28).
 */
export async function updateInvoiceStatusAction(
  rawInput: UpdateInvoiceStatusInput,
): Promise<ActionResult<{ invoiceId: string; status: 'sent' | 'paid' }>> {
  try {
    const parsed = UpdateInvoiceStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { invoiceId, targetStatus } = parsed.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return err('UNAUTHENTICATED', 'You must be signed in.');
    }

    const invoice = await InvoiceService.getInvoiceById(invoiceId, user.id, supabase);

    if (!invoice) {
      return err('NOT_FOUND', 'Invoice not found.');
    }

    const planState = await InvoiceService.getUserPlanState(user.id, supabase);

    // Validate status transition permissions
    const transitionCheck = canChangeStatus(planState, invoice.status, targetStatus);
    if (!transitionCheck.allowed) {
      if (planState === 'lapsed') {
        return err('LAPSED_READ_ONLY', transitionCheck.error ?? 'Action not permitted for lapsed account.');
      }
      return err('INVALID_STATUS_TRANSITION', transitionCheck.error ?? 'Invalid status transition.');
    }

    const isPaid = targetStatus === 'paid';
    await InvoiceService.updateInvoiceStatus(
      invoiceId,
      user.id,
      targetStatus,
      isPaid ? new Date().toISOString() : null,
      supabase,
    );

    revalidatePath('/dashboard');
    revalidatePath(`/invoices/${invoiceId}`);

    return ok({ invoiceId, status: targetStatus });
  } catch (error) {
    console.error('Unexpected error in updateInvoiceStatusAction:', error);
    return err('INTERNAL_ERROR', 'Failed to update invoice status. Please try again.');
  }
}

/**
 * Deletes an invoice (D-21, D-28, D-29).
 * - Free: ONLY drafts can be deleted; restores 1 slot (D-21, D-29)
 * - Pro: can delete any invoice (A-12)
 * - Lapsed: blocked (D-28)
 */
export async function deleteInvoiceAction(
  rawInput: DeleteInvoiceInput,
): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const parsed = DeleteInvoiceSchema.safeParse(rawInput);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { invoiceId } = parsed.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return err('UNAUTHENTICATED', 'You must be signed in.');
    }

    const invoice = await InvoiceService.getInvoiceById(invoiceId, user.id, supabase);

    if (!invoice) {
      return err('NOT_FOUND', 'Invoice not found.');
    }

    const planState = await InvoiceService.getUserPlanState(user.id, supabase);

    if (planState === 'lapsed') {
      return err('LAPSED_READ_ONLY', 'Existing invoices cannot be deleted on lapsed accounts.');
    }

    if (planState === 'free' && invoice.status !== 'draft') {
      return err(
        'DELETE_NOT_ALLOWED_ON_FREE',
        'Sent, Overdue, and Paid invoices cannot be deleted on the Free plan.',
      );
    }

    if (!canDeleteInvoice(planState, invoice.status)) {
      return err('DELETE_NOT_ALLOWED_ON_FREE', 'You are not permitted to delete this invoice.');
    }

    await InvoiceService.deleteInvoice(invoiceId, user.id, supabase);

    revalidatePath('/dashboard');

    return ok({ deletedId: invoiceId });
  } catch (error) {
    console.error('Unexpected error in deleteInvoiceAction:', error);
    return err('INTERNAL_ERROR', 'Failed to delete invoice. Please try again.');
  }
}

/**
 * Duplicates an existing invoice as a new Draft (D-12, D-33).
 */
export async function duplicateInvoiceAction(
  rawInput: DuplicateInvoiceInput,
): Promise<ActionResult<{ newInvoiceId: string }>> {
  try {
    const parsed = DuplicateInvoiceSchema.safeParse(rawInput);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { invoiceId } = parsed.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return err('UNAUTHENTICATED', 'You must be signed in.');
    }

    const sourceData = await InvoiceService.getInvoiceWithItems(invoiceId, user.id, supabase);

    if (!sourceData) {
      return err('NOT_FOUND', 'Source invoice not found.');
    }

    const { invoice: source, items: sourceItems } = sourceData;
    const planState = await InvoiceService.getUserPlanState(user.id, supabase);
    const count = await InvoiceService.countUserInvoices(user.id, supabase);

    if (!canCreateInvoice(planState, count)) {
      return err(
        'PLAN_LIMIT_REACHED',
        'Cannot duplicate: 3-invoice limit reached. Upgrade to Pro for unlimited invoices.',
      );
    }

    // Calculate new dates in Asia/Jakarta (WIB)
    const todayWib = getTodayWibString();
    const dueDateWib = addDaysWib(todayWib, 14);

    // Logo snapshot only if Pro (A-23)
    const logoUrlSnapshot = planState === 'pro' ? source.logo_url : null;

    const itemsToInsert = sourceItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      lineTotal: item.line_total,
    }));

    const newInvoice = await InvoiceService.createDraftInvoice(
      {
        user_id: user.id,
        customer_id: source.customer_id,
        template_id: source.template_id,
        invoice_number: null,
        status: 'draft',
        language: source.language,
        currency: source.currency,
        issue_date: todayWib,
        due_date: dueDateWib,
        sender_name: source.sender_name,
        sender_email: source.sender_email,
        sender_phone: source.sender_phone,
        sender_address: source.sender_address,
        sender_tax_id: source.sender_tax_id,
        logo_url: logoUrlSnapshot,
        payment_instructions: source.payment_instructions,
        client_name: source.client_name,
        client_company: source.client_company,
        client_email: source.client_email,
        client_address: source.client_address,
        subtotal: source.subtotal,
        discount_type: source.discount_type,
        discount_value: source.discount_value,
        discount_amount: source.discount_amount,
        tax_label: source.tax_label,
        tax_rate: source.tax_rate,
        tax_amount: source.tax_amount,
        total_amount: source.total_amount,
        notes: source.notes,
      },
      itemsToInsert,
      supabase,
    );

    revalidatePath('/dashboard');

    return ok({ newInvoiceId: newInvoice.id });
  } catch (error) {
    console.error('Unexpected error in duplicateInvoiceAction:', error);
    return err('INTERNAL_ERROR', 'Failed to duplicate invoice. Please try again.');
  }
}

/**
 * Creates or toggles public link sharing for an invoice (FR-8, D-11, D-40).
 * Requires active Pro subscription (D-11).
 */
export async function createOrTogglePublicLinkAction(
  rawInput: CreateOrTogglePublicLinkInput,
): Promise<ActionResult<{ publicUrl: string; enabled: boolean }>> {
  try {
    const parsed = CreateOrTogglePublicLinkSchema.safeParse(rawInput);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { invoiceId, enabled } = parsed.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return err('UNAUTHENTICATED', 'You must be signed in.');
    }

    const planState = await InvoiceService.getUserPlanState(user.id, supabase);
    if (!canUseProFeature(planState)) {
      return err('PRO_REQUIRED', 'Public link sharing is a Pro feature.');
    }

    const invoice = await InvoiceService.getInvoiceById(invoiceId, user.id, supabase);

    if (!invoice) {
      return err('NOT_FOUND', 'Invoice not found.');
    }

    // If draft and enabling, issue invoice first (FR-8.1)
    if (invoice.status === 'draft' && enabled) {
      await InvoiceService.issueInvoice(invoiceId, supabase);
    }

    // Generate 24-character URL-safe cryptographic token if not yet present (SEC-PUB-1)
    const token = invoice.public_token || crypto.randomBytes(18).toString('base64url').slice(0, 24);

    await InvoiceService.updatePublicLink(invoiceId, user.id, token, enabled, supabase);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tagiva.com';
    const publicUrl = `${appUrl}/i/${token}`;

    revalidatePath(`/invoices/${invoiceId}`);

    return ok({ publicUrl, enabled });
  } catch (error) {
    console.error('Unexpected error in createOrTogglePublicLinkAction:', error);
    return err('INTERNAL_ERROR', 'Failed to update public link. Please try again.');
  }
}
