/**
 * Tagiva - Supabase Browser Client
 *
 * Implements client-side Supabase instance using @supabase/ssr.
 * Stores session in secure HttpOnly cookies (SEC-AUTH-2).
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
