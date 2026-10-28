/**
 * Tagiva - Billing Queries
 */

import { createClient } from '@/lib/supabase/server';
import type { UserPlanState } from '@/lib/domain/entitlements';
import type { SubscriptionRow, BillingEventRow } from '@/types/database';

export interface BillingDetails {
  planState: UserPlanState;
  subscription: SubscriptionRow | null;
  history: BillingEventRow[];
}

export async function getBillingDetails(userId: string): Promise<BillingDetails> {
  const supabase = await createClient();

  // 1. Resolve plan state
  const { data: planStateData } = await (
    supabase.rpc as unknown as (
      fn: string,
      args: { p_user_id: string },
    ) => Promise<{ data: string | null; error: unknown }>
  )('get_user_plan_state', { p_user_id: userId });

  const planState = (planStateData as UserPlanState) || 'free';

  // 2. Fetch latest subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 3. Fetch billing events history
  const { data: history } = await supabase
    .from('billing_events')
    .select('*')
    .eq('user_id', userId)
    .order('processed_at', { ascending: false })
    .limit(20);

  return {
    planState,
    subscription: subscription ?? null,
    history: history ?? [],
  };
}
