import { createClient } from '@/lib/supabase/server';
import { resolveEffectiveInvoiceStatus } from '@/lib/domain/status';
import type { UserPlanState } from '@/lib/domain/entitlements';
import type { SupportedCurrency } from '@/lib/domain/calculations';
import type { DashboardInvoiceItem, DashboardPageData, DashboardSummary } from '../types';

/**
 * Loads the dashboard data including all invoices with resolved effective statuses,
 * financial totals, and user plan state.
 */
export async function getDashboardData(): Promise<DashboardPageData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Fetch user's profile for default currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_currency')
    .eq('user_id', user.id)
    .single();

  const primaryCurrency: SupportedCurrency = profile?.default_currency ?? 'IDR';

  // 2. Fetch user's plan state
  const { data: planStateRaw } = await (
    supabase.rpc as unknown as (
      fn: string,
      args: { p_user_id: string },
    ) => Promise<{ data: UserPlanState | null; error: unknown }>
  )('get_user_plan_state', { p_user_id: user.id });

  const planState: UserPlanState = planStateRaw || 'free';

  // 3. Fetch all invoices for user
  const { data: rawInvoices, error: invoicesError } = await supabase
    .from('invoices')
    .select(
      'id, invoice_number, status, currency, issue_date, due_date, client_name, client_company, total_amount, created_at',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (invoicesError || !rawInvoices) {
    return {
      invoices: [],
      summary: {
        totalPaid: 0,
        totalOutstanding: 0,
        totalOverdue: 0,
        overdueCount: 0,
        draftCount: 0,
        totalCount: 0,
        primaryCurrency,
      },
      planState,
      userEmail: user.email,
    };
  }

  // 4. Transform invoices with effective status
  let totalPaid = 0;
  let totalOutstanding = 0;
  let totalOverdue = 0;
  let overdueCount = 0;
  let draftCount = 0;

  const invoices: DashboardInvoiceItem[] = rawInvoices.map((inv) => {
    const effectiveStatus = resolveEffectiveInvoiceStatus(inv.status, inv.due_date);

    if (effectiveStatus === 'paid') {
      totalPaid += inv.total_amount;
    } else if (effectiveStatus === 'sent') {
      totalOutstanding += inv.total_amount;
    } else if (effectiveStatus === 'overdue') {
      totalOverdue += inv.total_amount;
      overdueCount++;
    } else if (effectiveStatus === 'draft') {
      draftCount++;
    }

    return {
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      status: effectiveStatus,
      originalStatus: inv.status as 'draft' | 'sent' | 'paid',
      clientName: inv.client_name,
      clientCompany: inv.client_company,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      totalAmount: inv.total_amount,
      currency: inv.currency,
      createdAt: inv.created_at,
    };
  });

  const summary: DashboardSummary = {
    totalPaid,
    totalOutstanding,
    totalOverdue,
    overdueCount,
    draftCount,
    totalCount: invoices.length,
    primaryCurrency,
  };

  return {
    invoices,
    summary,
    planState,
    userEmail: user.email,
  };
}
