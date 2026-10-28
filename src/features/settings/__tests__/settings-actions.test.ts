/**
 * Tagiva - Settings Actions Error Sanitization Tests
 *
 * Verifies that profile updates, logo uploads, and storage errors
 * return user-friendly messages and never leak raw system/storage errors.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  updateBusinessProfileAction,
  skipOnboardingAction,
  removeBusinessLogoAction,
} from '../actions';

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

let mockUser: { id: string; email: string } | null = {
  id: 'user-1',
  email: 'test@tagiva.com',
};
let mockDbError: Error | null = null;

vi.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: vi.fn(async () => mockUser),
  createClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => {
          if (mockDbError) {
            return {
              select: vi.fn(() => ({
                single: vi.fn(async () => ({ data: null, error: mockDbError })),
              })),
              error: mockDbError,
            };
          }
          return {
            select: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: {
                  id: 'profile-1',
                  user_id: 'user-1',
                  business_name: 'Tagiva User',
                },
                error: null,
              })),
            })),
            error: null,
          };
        }),
      })),
    })),
  })),
}));

describe('Settings Actions Error Sanitization', () => {
  beforeEach(() => {
    mockUser = { id: 'user-1', email: 'test@tagiva.com' };
    mockDbError = null;
  });

  it('updateBusinessProfileAction returns friendly error message when database fails', async () => {
    mockDbError = new Error('FATAL: 53300: too many connections for role "authenticated"');

    const result = await updateBusinessProfileAction({
      businessName: 'My Business',
      email: 'biz@tagiva.com',
      phone: '',
      address: '',
      taxId: '',
      invoicePrefix: 'INV',
      defaultCurrency: 'IDR',
      defaultLanguage: 'id',
      bankDetails: {
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountHolder: 'John Doe',
        notes: '',
      },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INTERNAL_ERROR');
      expect(result.error.message).toBe('Failed to update business profile. Please try again.');
      expect(result.error.message).not.toContain('connections');
      expect(result.error.message).not.toContain('FATAL');
    }
  });

  it('skipOnboardingAction returns friendly error message when database fails', async () => {
    mockDbError = new Error('deadlock detected on profiles table');

    const result = await skipOnboardingAction();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INTERNAL_ERROR');
      expect(result.error.message).toBe('Failed to complete setup. Please try again.');
      expect(result.error.message).not.toContain('deadlock');
    }
  });

  it('removeBusinessLogoAction returns friendly error message when database fails', async () => {
    mockDbError = new Error('network socket disconnected');

    const result = await removeBusinessLogoAction();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INTERNAL_ERROR');
      expect(result.error.message).toBe('Failed to remove business logo. Please try again.');
      expect(result.error.message).not.toContain('socket');
    }
  });
});
