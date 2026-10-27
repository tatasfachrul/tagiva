/**
 * Tagiva - Supabase Service-Role Admin Client
 *
 * Implements SEC-AUTH-3 / Service-Role Key Restriction:
 * Bypasses RLS and MUST ONLY be used in:
 * - src/app/api/webhooks/billing/route.ts (after webhook signature verification)
 * - src/app/api/cron/daily/route.ts (after CRON_SECRET verification)
 *
 * Strictly guarded against client-side bundling with `server-only`.
 */

import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
