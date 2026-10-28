/**
 * Tagiva - Invoice Actions Integration Tests
 *
 * Covers:
 * - TC-NUM-08: Sequential issuance and validation
 * - TC-ENT-02: Free user 3-invoice limit (D-12)
 * - TC-ENT-03: Free user deletes draft, slot restored (D-21)
 * - TC-ENT-04: Free user cannot delete non-draft invoices (D-29)
 * - TC-ENT-05: Pro feature gate for public links (D-11)
 * - TC-ENT-06: Lapsed user edit and delete restrictions (D-23, D-28)
 * - TC-ENT-07: Lapsed user marks Sent/Overdue as Paid (D-28, A-18)
 * - TC-ENT-08: Lapsed user cannot revert Paid to Sent (D-28)
 * - TC-ENT-09: Lapsed user creates up to 3 invoices (D-33, A-23)
 * - TC-SEC-01: Cross-tenant IDOR protection (NFR-2)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveInvoiceDraftAction,
  issueInvoiceAction,
  updateInvoiceStatusAction,
  deleteInvoiceAction,
  createOrTogglePublicLinkAction,
} from '../actions';
import type { SaveInvoiceInput } from '@/lib/validations/invoice';

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase server client
let mockUser: { id: string; email: string } | null = {
  id: 'user-free-1',
  email: 'free@tagiva.com',
};
let mockPlanState: 'free' | 'pro' | 'lapsed' = 'free';
let mockInvoiceCount = 0;
let mockInvoicesTable: Record<string, Record<string, unknown>> = {};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: mockUser },
        error: mockUser ? null : new Error('No user'),
      })),
    },
    rpc: vi.fn(async (fn: string, args: Record<string, unknown>) => {
      if (fn === 'get_user_plan_state') {
        return { data: mockPlanState, error: null };
      }
      if (fn === 'issue_invoice') {
        const inv = mockInvoicesTable[args.p_invoice_id as string];
        if (inv) {
          inv.status = 'sent';
          inv.invoice_number = 'INV-TAG-2026-10-0001';
          return { data: 'INV-TAG-2026-10-0001', error: null };
        }
        return { data: null, error: { message: 'Invoice not found' } };
      }
      return { data: null, error: null };
    }),
    from: vi.fn((table: string) => {
      if (table === 'invoices') {
        return {
          select: vi.fn((_cols: string, opts?: { count?: string; head?: boolean }) => {
            if (opts?.count === 'exact') {
              return {
                eq: vi.fn(() => Promise.resolve({ count: mockInvoiceCount, data: null, error: null })),
              };
            }
            return {
              eq: vi.fn((fieldA: string, valA: string) => ({
                eq: vi.fn((fieldB: string, valB: string) => ({
                  single: vi.fn(() => {
                    const id = fieldA === 'id' ? valA : valB;
                    const userId = fieldA === 'user_id' ? valA : valB;
                    const inv = mockInvoicesTable[id];
                    if (inv && inv.user_id === userId) {
                      return Promise.resolve({ data: inv, error: null });
                    }
                    return Promise.resolve({ data: null, error: new Error('Not found') });
                  }),
                })),
                single: vi.fn(() => {
                  const inv = mockInvoicesTable[valA];
                  return Promise.resolve({ data: inv ?? null, error: inv ? null : new Error('Not found') });
                }),
              })),
            };
          }),
          insert: vi.fn((row: Record<string, unknown>) => ({
            select: vi.fn(() => ({
              single: vi.fn(() => {
                const id = 'inv-' + Math.random().toString(36).substring(7);
                const created = { ...row, id };
                mockInvoicesTable[id] = created;
                mockInvoiceCount++;
                return Promise.resolve({ data: created, error: null });
              }),
            })),
          })),
          update: vi.fn((updates: Record<string, unknown>) => ({
            eq: vi.fn((fieldA: string, valA: string) => ({
              eq: vi.fn((fieldB: string, valB: string) => {
                const id = fieldA === 'id' ? valA : valB;
                const userId = fieldA === 'user_id' ? valA : valB;
                const inv = mockInvoicesTable[id];
                if (inv && inv.user_id === userId) {
                  Object.assign(inv, updates);
                  return Promise.resolve({ data: inv, error: null });
                }
                return Promise.resolve({ data: null, error: new Error('Not found') });
              }),
            })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn((fieldA: string, valA: string) => ({
              eq: vi.fn((fieldB: string, valB: string) => {
                const id = fieldA === 'id' ? valA : valB;
                const userId = fieldA === 'user_id' ? valA : valB;
                const inv = mockInvoicesTable[id];
                if (inv && inv.user_id === userId) {
                  delete mockInvoicesTable[id];
                  mockInvoiceCount = Math.max(0, mockInvoiceCount - 1);
                  return Promise.resolve({ data: null, error: null });
                }
                return Promise.resolve({ data: null, error: new Error('Not found') });
              }),
            })),
          })),
        };
      }

      if (table === 'invoice_items') {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        };
      }

      if (table === 'customers' || table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
          upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
        };
      }

      return {};
    }),
  })),
}));

const SAMPLE_PAYLOAD: SaveInvoiceInput = {
  language: 'en',
  currency: 'IDR',
  issueDate: '2026-10-28',
  dueDate: '2026-11-11',
  sender: {
    name: 'Sender Business',
    email: 'sender@business.com',
    phone: '',
    address: '',
    taxId: '',
    paymentInstructions: {},
  },
  client: {
    name: 'Client Acme',
    company: '',
    email: '',
    address: '',
  },
  items: [
    {
      description: 'Consulting',
      quantity: 1,
      unitPrice: 1000000,
    },
  ],
  discountType: 'percent',
  discountValue: 0,
  taxLabel: 'PPN',
  taxRate: 11,
  notes: '',
  saveCustomerToDirectory: false,
};

describe('Invoice Actions — TC-ENT & TC-SEC Suites', () => {
  beforeEach(() => {
    mockUser = { id: 'user-1', email: 'user@tagiva.com' };
    mockPlanState = 'free';
    mockInvoiceCount = 0;
    mockInvoicesTable = {};
  });

  it('TC-ENT-02: Free user creates 3 drafts, 4th fails with PLAN_LIMIT_REACHED (D-12)', async () => {
    mockPlanState = 'free';

    // 1st invoice
    mockInvoiceCount = 0;
    const res1 = await saveInvoiceDraftAction(SAMPLE_PAYLOAD);
    expect(res1.ok).toBe(true);

    // 2nd invoice
    mockInvoiceCount = 1;
    const res2 = await saveInvoiceDraftAction(SAMPLE_PAYLOAD);
    expect(res2.ok).toBe(true);

    // 3rd invoice
    mockInvoiceCount = 2;
    const res3 = await saveInvoiceDraftAction(SAMPLE_PAYLOAD);
    expect(res3.ok).toBe(true);

    // 4th invoice -> Should fail!
    mockInvoiceCount = 3;
    const res4 = await saveInvoiceDraftAction(SAMPLE_PAYLOAD);
    expect(res4.ok).toBe(false);
    if (!res4.ok) {
      expect(res4.error.code).toBe('PLAN_LIMIT_REACHED');
    }
  });

  it('TC-ENT-03: Free user deletes a Draft, slot is restored (D-21, D-29)', async () => {
    mockPlanState = 'free';
    const draftId = '11111111-1111-4111-8111-111111111111';
    mockInvoicesTable[draftId] = {
      id: draftId,
      user_id: 'user-1',
      status: 'draft',
      invoice_number: null,
    };
    mockInvoiceCount = 3;

    // Delete draft
    const deleteRes = await deleteInvoiceAction({ invoiceId: draftId });
    expect(deleteRes.ok).toBe(true);

    // Count drops, can create again
    expect(mockInvoiceCount).toBe(2);
    const createRes = await saveInvoiceDraftAction(SAMPLE_PAYLOAD);
    expect(createRes.ok).toBe(true);
  });

  it('TC-ENT-04: Free user cannot delete Sent, Overdue, or Paid invoices (D-29)', async () => {
    mockPlanState = 'free';
    const sentId = '22222222-2222-4222-8222-222222222222';
    mockInvoicesTable[sentId] = {
      id: sentId,
      user_id: 'user-1',
      status: 'sent',
      invoice_number: 'INV-TAG-2026-10-0001',
    };

    const res = await deleteInvoiceAction({ invoiceId: sentId });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('DELETE_NOT_ALLOWED_ON_FREE');
    }
  });

  it('TC-ENT-05: Free user cannot create public shareable links (D-11)', async () => {
    mockPlanState = 'free';
    const invId = '33333333-3333-4333-8333-333333333333';
    mockInvoicesTable[invId] = {
      id: invId,
      user_id: 'user-1',
      status: 'sent',
      public_token: null,
    };

    const res = await createOrTogglePublicLinkAction({
      invoiceId: invId,
      enabled: true,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('PRO_REQUIRED');
    }
  });

  it('TC-ENT-06: Lapsed user cannot edit line items or delete existing invoices (D-23, D-28)', async () => {
    mockPlanState = 'lapsed';
    const invId = '44444444-4444-4444-8444-444444444444';
    mockInvoicesTable[invId] = {
      id: invId,
      user_id: 'user-1',
      status: 'sent',
      invoice_number: 'INV-TAG-2026-10-0001',
    };

    // Attempting to update existing invoice
    const editRes = await saveInvoiceDraftAction({
      ...SAMPLE_PAYLOAD,
      id: invId,
    });
    expect(editRes.ok).toBe(false);
    if (!editRes.ok) {
      expect(editRes.error.code).toBe('LAPSED_READ_ONLY');
    }

    // Attempting to delete existing invoice
    const deleteRes = await deleteInvoiceAction({ invoiceId: invId });
    expect(deleteRes.ok).toBe(false);
    if (!deleteRes.ok) {
      expect(deleteRes.error.code).toBe('LAPSED_READ_ONLY');
    }
  });

  it('TC-ENT-07: Lapsed user marks Sent or Overdue invoice as Paid (D-28, A-18)', async () => {
    mockPlanState = 'lapsed';
    const invId = '55555555-5555-4555-8555-555555555555';
    mockInvoicesTable[invId] = {
      id: invId,
      user_id: 'user-1',
      status: 'sent',
      invoice_number: 'INV-TAG-2026-10-0001',
    };

    const res = await updateInvoiceStatusAction({
      invoiceId: invId,
      targetStatus: 'paid',
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.status).toBe('paid');
      expect(mockInvoicesTable[invId]?.status).toBe('paid');
    }
  });

  it('TC-ENT-08: Lapsed user cannot revert Paid back to Sent (D-28)', async () => {
    mockPlanState = 'lapsed';
    const invId = '66666666-6666-4666-8666-666666666666';
    mockInvoicesTable[invId] = {
      id: invId,
      user_id: 'user-1',
      status: 'paid',
      invoice_number: 'INV-TAG-2026-10-0001',
    };

    const res = await updateInvoiceStatusAction({
      invoiceId: invId,
      targetStatus: 'sent',
    });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('LAPSED_READ_ONLY');
    }
  });

  it('TC-ENT-09: Lapsed user with < 3 invoices can create new invoice (D-33, A-23)', async () => {
    mockPlanState = 'lapsed';
    mockInvoiceCount = 2; // has 2 saved invoices

    // Creating 3rd invoice succeeds
    const res = await saveInvoiceDraftAction(SAMPLE_PAYLOAD);
    expect(res.ok).toBe(true);

    // Creating 4th invoice fails
    mockInvoiceCount = 3;
    const res4 = await saveInvoiceDraftAction(SAMPLE_PAYLOAD);
    expect(res4.ok).toBe(false);
    if (!res4.ok) {
      expect(res4.error.code).toBe('PLAN_LIMIT_REACHED');
    }
  });

  it('TC-SEC-01: Cross-tenant IDOR attempt receives NOT_FOUND (NFR-2)', async () => {
    mockUser = { id: 'user-attacker', email: 'attacker@evil.com' };
    const victimInvoiceId = '77777777-7777-4777-8777-777777777777';
    mockInvoicesTable[victimInvoiceId] = {
      id: victimInvoiceId,
      user_id: 'user-victim',
      status: 'draft',
      invoice_number: null,
    };

    // Attacker attempts to update victim's invoice
    const editRes = await saveInvoiceDraftAction({
      ...SAMPLE_PAYLOAD,
      id: victimInvoiceId,
    });
    expect(editRes.ok).toBe(false);
    if (!editRes.ok) {
      expect(editRes.error.code).toBe('NOT_FOUND');
    }

    // Attacker attempts to issue victim's invoice
    const issueRes = await issueInvoiceAction({
      invoiceId: victimInvoiceId,
    });
    expect(issueRes.ok).toBe(false);
    if (!issueRes.ok) {
      expect(issueRes.error.code).toBe('NOT_FOUND');
    }

    // Attacker attempts to delete victim's invoice
    const deleteRes = await deleteInvoiceAction({
      invoiceId: victimInvoiceId,
    });
    expect(deleteRes.ok).toBe(false);
    if (!deleteRes.ok) {
      expect(deleteRes.error.code).toBe('NOT_FOUND');
    }
  });

  it('TC-NUM-08: Issue invoice transitions Draft to Sent and assigns number', async () => {
    mockPlanState = 'free';
    const draftId = '88888888-8888-4888-8888-888888888888';
    mockInvoicesTable[draftId] = {
      id: draftId,
      user_id: 'user-1',
      status: 'draft',
      invoice_number: null,
    };

    const res = await issueInvoiceAction({ invoiceId: draftId });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.status).toBe('sent');
      expect(res.data.invoiceNumber).toBe('INV-TAG-2026-10-0001');
    }
  });
});
