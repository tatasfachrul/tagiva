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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Auth Action] Missing Supabase environment variables');
      return err('INTERNAL_ERROR', 'Authentication service is temporarily unavailable. Please try again later.');
    }

    const supabase = await createClient();
    const headersList = await headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000';
    const proto = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
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

    if (error || !data?.url) {
      console.error('[Auth Action] Failed to initialize Google Sign-In:', error);
      return err('INTERNAL_ERROR', 'Unable to initialize Google Sign-In. Please try again.');
    }

    return ok({ url: data.url });
  } catch (error) {
    console.error('[Auth Action] Unexpected error during Google sign-in:', error);
    return err('INTERNAL_ERROR', 'Unable to initialize Google Sign-In. Please try again.');
  }
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('[Auth Action] Failed to sign out:', error);
  }
  redirect('/login');
}
