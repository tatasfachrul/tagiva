import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  renderInvoicePdfToBuffer,
  normalizeInvoiceData,
} from '@/components/invoice-templates';

/**
 * GET /api/public/i/[token]/pdf
 *
 * Public Client PDF Download endpoint (API.md Section 4.2).
 * - Secured via unguessable 24-character cryptographic token (SEC-PUB-1)
 * - Queries strictly through get_public_invoice_by_token RPC (SEC-PUB-2)
 * - Protects client privacy via noindex headers (SEC-PUB-3)
 * - Immediate 404 on revoked or disabled public links (SEC-PUB-4)
 * - Inherits invoice owner's plan state for footer watermark (D-40)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    if (!token || typeof token !== 'string') {
      return new NextResponse('Not Found', { status: 404 });
    }

    const supabaseAdmin = createAdminClient();

    const { data: publicData, error } = await (
      supabaseAdmin.rpc as unknown as (
        fn: string,
        args: { p_token: string },
      ) => Promise<{
        data: {
          invoice: Record<string, unknown>;
          items: Array<Record<string, unknown>>;
          show_platform_footer: boolean;
        } | null;
        error: unknown;
      }>
    )('get_public_invoice_by_token', { p_token: token });

    if (error || !publicData || !publicData.invoice) {
      return new NextResponse('Invoice not found or link has been disabled', {
        status: 404,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      });
    }

    const normalizedInvoice = normalizeInvoiceData({
      ...publicData.invoice,
      items: publicData.items ?? [],
    });

    const showFooter = Boolean(publicData.show_platform_footer);

    const pdfBuffer = await renderInvoicePdfToBuffer(normalizedInvoice, showFooter);

    const invoiceNumber = normalizedInvoice.invoiceNumber;
    const safeFilename = `${(invoiceNumber ?? 'Invoice').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('Failed to generate public invoice PDF:', error);
    return new NextResponse('Failed to generate PDF', {
      status: 500,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  }
}
