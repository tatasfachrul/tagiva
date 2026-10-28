/**
 * Tagiva - Clients Actions Error Sanitization Tests
 *
 * Verifies that database or network errors during client CRUD operations
 * are caught and sanitized to user-friendly messages, never leaking raw DB errors.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveClientAction, deleteClientAction } from '../actions';

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
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(async () => {
                if (mockDbError) {
                  return { data: null, error: mockDbError };
                }
                return {
                  data: {
                    id: 'client-1',
                    user_id: 'user-1',
                    name: 'Acme Corp',
                    company: '',
                    email: 'acme@corp.com',
                    address: '',
                  },
                  error: null,
                };
              }),
            })),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => {
            if (mockDbError) {
              return { data: null, error: mockDbError };
            }
            return {
              data: {
                id: 'client-new',
                user_id: 'user-1',
                name: 'New Client',
                company: '',
                email: 'new@client.com',
                address: '',
              },
              error: null,
            };
          }),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(async () => {
            if (mockDbError) {
              return { error: mockDbError };
            }
            return { error: null };
          }),
        })),
      })),
    })),
  })),
}));

describe('Clients Actions Error Sanitization', () => {
  beforeEach(() => {
    mockUser = { id: 'user-1', email: 'test@tagiva.com' };
    mockDbError = null;
  });

  it('saveClientAction returns friendly error message when database fails on create', async () => {
    mockDbError = new Error('duplicate key value violates unique constraint "customers_pkey"');

    const result = await saveClientAction({
      name: 'Test Client',
      email: 'test@client.com',
      company: '',
      address: '',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INTERNAL_ERROR');
      expect(result.error.message).toBe('Failed to save new client. Please try again.');
      expect(result.error.message).not.toContain('duplicate key');
      expect(result.error.message).not.toContain('constraint');
    }
  });

  it('saveClientAction returns friendly error message when database fails on update', async () => {
    mockDbError = new Error('connection timeout to Postgres pool');

    const result = await saveClientAction({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated Client',
      email: 'updated@client.com',
      company: '',
      address: '',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INTERNAL_ERROR');
      expect(result.error.message).toBe('Failed to update client details. Please try again.');
      expect(result.error.message).not.toContain('timeout');
      expect(result.error.message).not.toContain('Postgres');
    }
  });

  it('deleteClientAction returns friendly error message when database fails on delete', async () => {
    mockDbError = new Error('foreign key constraint violation on invoices');

    const result = await deleteClientAction('00000000-0000-0000-0000-000000000001');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INTERNAL_ERROR');
      expect(result.error.message).toBe('Failed to delete client. Please try again.');
      expect(result.error.message).not.toContain('foreign key');
    }
  });
});
