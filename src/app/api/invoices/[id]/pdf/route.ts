import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  renderInvoicePdfToBuffer,
  normalizeInvoiceData,
} from '@/components/invoice-templates';
import type { UserPlanState } from '@/lib/domain/entitlements';

/**
 * GET /api/invoices/[id]/pdf
 *
 * Authenticated PDF Download endpoint (API.md Section 4.1).
 * Requires valid Supabase session owning the invoice.
 * Enforces Pro vs. Free/Lapsed footer rules (D-28, FR-7.3).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: invoiceId } = await params;
    if (!invoiceId) {
      return new NextResponse('Invoice ID required', { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 1. Fetch invoice row owned by this user
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    // 2. Fetch invoice line items
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('id', { ascending: true });

    if (itemsError) {
      return new NextResponse('Failed to load invoice items', { status: 500 });
    }

    // 3. Resolve user plan state (D-52, FR-7.3)
    const { data: planStateRaw } = await (
      supabase.rpc as unknown as (
        fn: string,
        args: { p_user_id: string },
      ) => Promise<{ data: UserPlanState | null; error: unknown }>
    )('get_user_plan_state', { p_user_id: user.id });

    const planState: UserPlanState = planStateRaw || 'free';
    const showFooter = planState !== 'pro';

    // 4. Normalize invoice data
    const normalizedInvoice = normalizeInvoiceData({
      ...invoice,
      items: items ?? [],
    });

    // 5. Render PDF buffer in memory
    const pdfBuffer = await renderInvoicePdfToBuffer(normalizedInvoice, showFooter);

    const safeFilename = `${(invoice.invoice_number ?? 'DRAFT-Invoice').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to generate authenticated invoice PDF:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
