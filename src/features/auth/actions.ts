'use server';

/**
 * Tagiva - Authentication Server Actions
 *
 * Implements Google OAuth initiation (D-14) and sign-out.
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { sanitizeRedirectPath } from '@/lib/security/redirect';
import { ok, err, type ActionResult } from '@/lib/api/action-result';

export async function signInWithGoogleAction(
  targetNext?: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createClient();
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const proto = headersList.get('x-forwarded-proto') || 'http';
    const origin = `${proto}://${host}`;

    const safeNext = sanitizeRedirectPath(targetNext, '/dashboard');
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error || !data.url) {
      return err('INTERNAL_ERROR', error?.message || 'Failed to initialize Google Sign-In.');
    }

    return ok({ url: data.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during sign-in.';
    return err('INTERNAL_ERROR', message);
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
