/**
 * Tagiva - Authenticated (app) Route Group Layout
 *
 * Implements:
 * - Server-side authentication verification (SEC-AUTH-3)
 * - Profile and plan state resolution
 * - Expiry reminder calculation in WIB
 * - Conditional layout: focused screen for /onboarding, full AppShell for dashboard/invoices/clients/settings
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedUser, createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';
import { getTodayWibString, getDaysUntilDateWib } from '@/lib/domain/timezone';
import type { UserPlanState } from '@/lib/domain/entitlements';
import type { ProfileRow } from '@/types/database';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  // 1. Fetch user's business profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // 2. Fetch current plan state via RPC
  const { data: planStateRaw } = await (
    supabase.rpc as unknown as (
      fn: string,
      args: { p_user_id: string },
    ) => Promise<{ data: UserPlanState | null; error: unknown }>
  )('get_user_plan_state', { p_user_id: user.id });

  const planState: UserPlanState = planStateRaw || 'free';

  // 3. Count total saved invoices for Free plan cap indicator (D-12)
  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const invoiceCount = count ?? 0;

  // 4. If Pro, check active subscription period end to calculate expiry banner
  let daysRemaining: number | null = null;

  if (planState === 'pro') {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('current_period_end')
      .eq('user_id', user.id)
      .order('current_period_end', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sub?.current_period_end) {
      const targetDate = sub.current_period_end.slice(0, 10);
      daysRemaining = getDaysUntilDateWib(targetDate, getTodayWibString());
    }
  }

  return (
    <AppShell
      userEmail={user.email}
      profile={profile as ProfileRow | null}
      planState={planState}
      invoiceCount={invoiceCount}
      daysRemaining={daysRemaining}
    >
      {children}
    </AppShell>
  );
}
