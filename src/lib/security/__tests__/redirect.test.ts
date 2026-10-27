import { describe, it, expect } from 'vitest';
import { sanitizeRedirectPath } from '../redirect';

describe('Open Redirect Sanitizer (SEC-AUTH-4)', () => {
  it('allows safe relative paths', () => {
    expect(sanitizeRedirectPath('/dashboard')).toBe('/dashboard');
    expect(sanitizeRedirectPath('/invoices/new')).toBe('/invoices/new');
    expect(sanitizeRedirectPath('/invoices/123?tab=preview')).toBe('/invoices/123?tab=preview');
    expect(sanitizeRedirectPath('/settings#billing')).toBe('/settings#billing');
  });

  it('rejects external URLs and returns fallback', () => {
    expect(sanitizeRedirectPath('https://evil.com')).toBe('/dashboard');
    expect(sanitizeRedirectPath('http://malicious.org/login')).toBe('/dashboard');
    expect(sanitizeRedirectPath('//attacker.com')).toBe('/dashboard');
    expect(sanitizeRedirectPath('/\\attacker.com')).toBe('/dashboard');
    expect(sanitizeRedirectPath('javascript:alert(1)')).toBe('/dashboard');
  });

  it('handles null, undefined, or empty inputs gracefully', () => {
    expect(sanitizeRedirectPath(null)).toBe('/dashboard');
    expect(sanitizeRedirectPath(undefined)).toBe('/dashboard');
    expect(sanitizeRedirectPath('')).toBe('/dashboard');
    expect(sanitizeRedirectPath('   ')).toBe('/dashboard');
  });

  it('respects custom fallback path', () => {
    expect(sanitizeRedirectPath('https://evil.com', '/onboarding')).toBe('/onboarding');
    expect(sanitizeRedirectPath('', '/login')).toBe('/login');
  });
});
