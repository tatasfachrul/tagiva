/**
 * Tagiva - Route Protection Matchers
 *
 * Enforces Visitor Authentication Gate (D-24, D-31).
 * Protected routes require Google OAuth authentication.
 */

export const PROTECTED_ROUTE_PREFIXES = [
  '/onboarding',
  '/dashboard',
  '/invoices',
  '/clients',
  '/settings',
] as const;

/**
 * Checks whether a given request pathname requires an active authenticated session.
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Checks whether a route is an authentication entry point (e.g. /login),
 * which should redirect authenticated users directly to /dashboard.
 */
export function isAuthOnlyRoute(pathname: string): boolean {
  return pathname === '/login' || pathname.startsWith('/login/');
}
