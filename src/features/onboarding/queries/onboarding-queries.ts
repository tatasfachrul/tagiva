import { createClient, getAuthenticatedUser } from '@/lib/supabase/server';
import type { ProfileRow } from '@/types/database';

export async function getOnboardingProfile(): Promise<ProfileRow | null> {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return data ?? null;
}
