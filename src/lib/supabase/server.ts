/**
 * Tagiva - Supabase Server Client
 *
 * Implements server-side cookie-based Supabase instance using @supabase/ssr.
 * Enforces SEC-AUTH-3: getAuthenticatedUser() calls auth.getUser() to cryptographically
 * verify identity against Supabase Auth.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored because middleware refreshes user sessions.
          }
        },
      },
    },
  ) as unknown as SupabaseClient<Database>;
}

/**
 * Validates the caller's identity via Supabase Auth (SEC-AUTH-3).
 * Always calls auth.getUser() to verify JWT cryptographic validity,
 * never trusting unverified local cookie claims.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
