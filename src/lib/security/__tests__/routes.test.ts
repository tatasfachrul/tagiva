import { describe, it, expect } from 'vitest';
import { isProtectedRoute, isAuthOnlyRoute } from '../routes';

describe('Route Protection Matcher (D-24, D-31)', () => {
  it('identifies protected routes', () => {
    expect(isProtectedRoute('/dashboard')).toBe(true);
    expect(isProtectedRoute('/dashboard/')).toBe(true);
    expect(isProtectedRoute('/invoices')).toBe(true);
    expect(isProtectedRoute('/invoices/new')).toBe(true);
    expect(isProtectedRoute('/invoices/some-uuid-123')).toBe(true);
    expect(isProtectedRoute('/clients')).toBe(true);
    expect(isProtectedRoute('/clients/abc')).toBe(true);
    expect(isProtectedRoute('/settings')).toBe(true);
    expect(isProtectedRoute('/settings/billing')).toBe(true);
    expect(isProtectedRoute('/onboarding')).toBe(true);
  });

  it('identifies public routes as NOT protected', () => {
    expect(isProtectedRoute('/')).toBe(false);
    expect(isProtectedRoute('/pricing')).toBe(false);
    expect(isProtectedRoute('/terms')).toBe(false);
    expect(isProtectedRoute('/privacy')).toBe(false);
    expect(isProtectedRoute('/i/token123456789012345678')).toBe(false);
    expect(isProtectedRoute('/api/public/i/token/pdf')).toBe(false);
    expect(isProtectedRoute('/api/webhooks/billing')).toBe(false);
    expect(isProtectedRoute('/api/cron/daily')).toBe(false);
    expect(isProtectedRoute('/auth/callback')).toBe(false);
    expect(isProtectedRoute('/login')).toBe(false);
  });

  it('identifies auth-only routes (/login)', () => {
    expect(isAuthOnlyRoute('/login')).toBe(true);
    expect(isAuthOnlyRoute('/login/')).toBe(true);
    expect(isAuthOnlyRoute('/dashboard')).toBe(false);
    expect(isAuthOnlyRoute('/')).toBe(false);
  });
});
