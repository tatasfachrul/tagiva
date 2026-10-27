/**
 * Tagiva - Next.js Authentication & Route Protection Middleware
 *
 * Implements:
 * - Session token refresh via @supabase/ssr
 * - Protected route gate redirecting visitors to /login (D-24, D-31)
 * - Redirecting logged-in users away from /login to /dashboard
 * - Open redirect sanitization for ?next= (SEC-AUTH-4)
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isProtectedRoute, isAuthOnlyRoute } from '@/lib/security/routes';
import { sanitizeRedirectPath } from '@/lib/security/redirect';
import type { Database } from '@/types/database';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase environment variables are missing (e.g. during pre-render or initial setup), pass through
  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Parameters<typeof response.cookies.set>[2] }>) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Cryptographically verify session against Supabase Auth (SEC-AUTH-3)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Unauthenticated visitors accessing protected routes (D-24, D-31)
  if (!user && isProtectedRoute(pathname)) {
    const redirectUrl = new URL('/login', request.url);
    const search = request.nextUrl.search;
    const fullPath = search ? `${pathname}${search}` : pathname;
    redirectUrl.searchParams.set('next', fullPath);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Authenticated users accessing login page
  if (user && isAuthOnlyRoute(pathname)) {
    const rawNext = request.nextUrl.searchParams.get('next');
    const safeNext = sanitizeRedirectPath(rawNext, '/dashboard');
    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static image and font extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2)$).*)',
  ],
};
