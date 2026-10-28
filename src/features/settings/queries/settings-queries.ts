import { createClient, getAuthenticatedUser } from '@/lib/supabase/server';
import type { ProfileRow } from '@/types/database';
import type { UserPlanState } from '@/lib/domain/entitlements';

export interface SettingsData {
  profile: ProfileRow | null;
  planState: UserPlanState;
}

export async function getSettingsData(): Promise<SettingsData | null> {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: planStateRaw } = await (
    supabase.rpc as unknown as (
      fn: string,
      args: { p_user_id: string },
    ) => Promise<{ data: UserPlanState | null; error: unknown }>
  )('get_user_plan_state', { p_user_id: user.id });

  return {
    profile: (profile as ProfileRow | null) ?? null,
    planState: planStateRaw || 'free',
  };
}
