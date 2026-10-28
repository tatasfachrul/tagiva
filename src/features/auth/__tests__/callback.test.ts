import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/(auth)/auth/callback/route';

const mockExchangeCodeForSession = vi.fn();
const mockMaybeSingle = vi.fn();
const mockEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
    from: mockFrom,
  })),
}));

describe('OAuth Callback Handler (GET /auth/callback)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('redirects to /login?error=access_denied when provider sends error parameter', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?error=access_denied&error_description=User+cancelled');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?error=access_denied');
  });

  it('redirects to /login?error=missing_code when code query param is absent', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?error=missing_code');
  });

  it('redirects to /login?error=config_missing when Supabase env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const request = new NextRequest('http://localhost:3000/auth/callback?code=mock-code');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?error=config_missing');
  });

  it('redirects to /login?error=auth_failed when session code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid authorization code'),
    });

    const request = new NextRequest('http://localhost:3000/auth/callback?code=bad-code');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/login?error=auth_failed');
  });

  it('redirects first-time user (onboarding incomplete) to /onboarding', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: { user: { id: 'usr-123', email: 'alice@example.com' } },
      error: null,
    });
    mockMaybeSingle.mockResolvedValueOnce({
      data: { onboarding_completed: false },
    });

    const request = new NextRequest('http://localhost:3000/auth/callback?code=valid-code');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/onboarding');
  });

  it('redirects returning user with completed onboarding to /dashboard by default', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: { user: { id: 'usr-456', email: 'bob@example.com' } },
      error: null,
    });
    mockMaybeSingle.mockResolvedValueOnce({
      data: { onboarding_completed: true },
    });

    const request = new NextRequest('http://localhost:3000/auth/callback?code=valid-code');
    const response = await GET(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('redirects returning user to sanitized ?next= destination and rejects open redirect', async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      data: { user: { id: 'usr-789', email: 'charlie@example.com' } },
      error: null,
    });
    mockMaybeSingle.mockResolvedValue({
      data: { onboarding_completed: true },
    });

    // Valid relative path
    const req1 = new NextRequest('http://localhost:3000/auth/callback?code=valid-code&next=/invoices/new');
    const res1 = await GET(req1);
    expect(res1.headers.get('location')).toBe('http://localhost:3000/invoices/new');

    // Malicious open redirect attempt
    const req2 = new NextRequest('http://localhost:3000/auth/callback?code=valid-code&next=https://attacker.com');
    const res2 = await GET(req2);
    expect(res2.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });
});
