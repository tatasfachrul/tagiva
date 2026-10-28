/**
 * Tagiva - Public Invoice Query
 *
 * Implements SEC-PUB-2 (Scoped RPC lookup via get_public_invoice_by_token).
 * Returns null if token is invalid, disabled, or not found.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import {
  normalizeInvoiceData,
  type InvoiceTemplateData,
} from '@/components/invoice-templates';
import {
  resolveEffectiveInvoiceStatus,
  type InvoiceStatus,
} from '@/lib/domain/status';

export interface PublicInvoiceResult {
  invoice: InvoiceTemplateData;
  showPlatformFooter: boolean;
  token: string;
}

export async function getPublicInvoiceByToken(
  token: string,
): Promise<PublicInvoiceResult | null> {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return null;
  }

  try {
    const supabaseAdmin = createAdminClient();

    const { data, error } = await (
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
    )('get_public_invoice_by_token', { p_token: token.trim() });

    if (error || !data || !data.invoice) {
      return null;
    }

    const rawInvoice = data.invoice;
    const rawStatus = (rawInvoice.status as InvoiceStatus) || 'sent';
    const rawDueDate = String(rawInvoice.due_date || '');

    // Resolve dynamic overdue status (WIB timezone, D-15)
    const effectiveStatus = resolveEffectiveInvoiceStatus(rawStatus, rawDueDate);

    const normalizedInvoice = normalizeInvoiceData({
      ...rawInvoice,
      status: effectiveStatus,
      items: data.items ?? [],
    });

    return {
      invoice: normalizedInvoice,
      showPlatformFooter: Boolean(data.show_platform_footer),
      token: token.trim(),
    };
  } catch (err) {
    console.error('Error fetching public invoice by token:', err);
    return null;
  }
}
