import { createClient, getAuthenticatedUser } from '@/lib/supabase/server';
import type { CustomerRow } from '@/types/database';

export async function getClients(): Promise<CustomerRow[]> {
  const user = await getAuthenticatedUser();
  if (!user) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}
