/**
 * Tagiva - Authentication Error Sanitization Unit Tests
 *
 * Verifies that internal system errors, missing environment variables,
 * and raw provider errors are never exposed to the end user.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { signInWithGoogleAction } from '../actions';
import { LoginPage } from '../page';

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers({ host: 'localhost:3000' })),
  cookies: vi.fn(async () => ({
    getAll: () => [],
    set: vi.fn(),
  })),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Auth Error Sanitization', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('signInWithGoogleAction returns user-friendly error when Supabase env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const result = await signInWithGoogleAction('/dashboard');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INTERNAL_ERROR');
      // Must NOT contain Supabase URLs, keys, or raw system error text
      expect(result.error.message).not.toContain('https://supabase.com');
      expect(result.error.message).not.toContain('API settings');
      expect(result.error.message).not.toContain('URL and Key are required');
      expect(result.error.message).toBe(
        'Authentication service is temporarily unavailable. Please try again later.',
      );
    }
  });

  it('LoginPage renders friendly message for known error query params and hides system details', async () => {
    // 1. auth_failed
    const pageAuthFailed = await LoginPage({
      searchParams: Promise.resolve({ error: 'auth_failed' }),
    });
    const htmlAuthFailed = renderToString(pageAuthFailed);
    expect(htmlAuthFailed).toContain('Sign-in could not be completed. Please try again.');

    // 2. config_missing
    const pageConfigMissing = await LoginPage({
      searchParams: Promise.resolve({ error: 'config_missing' }),
    });
    const htmlConfigMissing = renderToString(pageConfigMissing);
    expect(htmlConfigMissing).toContain(
      'Authentication service is temporarily unavailable. Please try again later.',
    );

    // 3. access_denied
    const pageAccessDenied = await LoginPage({
      searchParams: Promise.resolve({ error: 'access_denied' }),
    });
    const htmlAccessDenied = renderToString(pageAccessDenied);
    expect(htmlAccessDenied).toContain('Sign-in was canceled. Please try again when ready.');

    // 4. Arbitrary system error string passed in ?error=
    const pageRawSystemError = await LoginPage({
      searchParams: Promise.resolve({
        error: "Your project's URL and Key are required to create a Supabase client! Check your Supabase project's API settings",
      }),
    });
    const htmlRawSystem = renderToString(pageRawSystemError);
    // It should render safe fallback and NOT leak the URL or raw text
    expect(htmlRawSystem).toContain('An error occurred during authentication. Please try again.');
    expect(htmlRawSystem).not.toContain('Check your Supabase');
  });
});
