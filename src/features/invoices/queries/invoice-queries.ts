import { createClient } from '@/lib/supabase/server';
import { resolveEffectiveInvoiceStatus } from '@/lib/domain/status';
import { InvoiceService } from '@/services/invoice-service';
import type { InvoiceDetailPageData, ClientOption } from '../types';

/**
 * Fetches an invoice by ID along with its line items, business profile, and user plan state.
 * Returns null if not found or not owned by the current authenticated user (SEC-AUTH-3).
 */
export async function getInvoiceById(invoiceId: string): Promise<InvoiceDetailPageData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Fetch invoice row and line items via InvoiceService
  const invoiceData = await InvoiceService.getInvoiceWithItems(invoiceId, user.id, supabase);
  if (!invoiceData) {
    return null;
  }
  const { invoice, items } = invoiceData;

  // 2. Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // 3. Resolve plan state via InvoiceService
  const planState = await InvoiceService.getUserPlanState(user.id, supabase);

  // 4. Evaluate effective status (e.g. sent -> overdue if due_date < today in WIB)
  const effectiveStatus = resolveEffectiveInvoiceStatus(invoice.status, invoice.due_date);
  const invoiceWithEffectiveStatus = {
    ...invoice,
    status: effectiveStatus,
    items: items ?? [],
  };

  // 5. Compute action permissions
  const isLapsed = planState === 'lapsed';
  const isReadOnly = isLapsed; // D-23, D-28: Lapsed is read-only on existing invoices
  const canMarkAsPaid = effectiveStatus === 'sent' || effectiveStatus === 'overdue';
  const canDelete =
    planState === 'pro' || (planState === 'free' && invoice.status === 'draft');

  return {
    invoice: invoiceWithEffectiveStatus,
    profile,
    planState,
    isReadOnly,
    canMarkAsPaid,
    canDelete,
  };
}

/**
 * Fetches saved clients for the customer picker dropdown (FR-5.11).
 */
export async function getSavedClients(): Promise<ClientOption[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: clients } = await supabase
    .from('customers')
    .select('id, name, company, email, address')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  return (clients as ClientOption[]) ?? [];
}

/**
 * Returns total count of saved invoices for the authenticated user.
 */
export async function getUserInvoiceCount(): Promise<number> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return count ?? 0;
}
