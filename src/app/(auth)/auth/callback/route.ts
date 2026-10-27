/**
 * Tagiva - Google OAuth PKCE Callback Route Handler
 *
 * Implements SEC-AUTH-1 & SEC-AUTH-4:
 * - Exchanges temporary authorization code for session tokens
 * - Validates ?next= redirect path against open redirect vulnerabilities
 * - Directs users with onboarding_completed = false to /onboarding (D-38)
 * - Directs returning users to /dashboard or their intended ?next= target
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sanitizeRedirectPath } from '@/lib/security/redirect';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const rawNext = requestUrl.searchParams.get('next');
  const safeNext = sanitizeRedirectPath(rawNext, '/dashboard');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL('/login?error=config_missing', request.url));
  }

  const redirectResponse = NextResponse.redirect(new URL(safeNext, request.url));

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Parameters<typeof redirectResponse.cookies.set>[2] }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);

  if (authError || !authData.user) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }

  // Check onboarding status
  const { data: profile } = (await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('user_id', authData.user.id)
    .maybeSingle()) as { data: { onboarding_completed: boolean } | null };

  // First-time users are routed to /onboarding unless already completed (D-38)
  if (profile && !profile.onboarding_completed) {
    const onboardingResponse = NextResponse.redirect(new URL('/onboarding', request.url));
    redirectResponse.cookies.getAll().forEach((cookie) => {
      onboardingResponse.cookies.set(cookie.name, cookie.value);
    });
    return onboardingResponse;
  }

  return redirectResponse;
}
