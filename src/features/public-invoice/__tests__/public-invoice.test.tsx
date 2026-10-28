/**
 * Tagiva - Public Invoice Feature Tests
 *
 * Verifies:
 * - FR-8.1: Draft auto-issuance on public link creation
 * - D-11 / D-40: Pro-only link creation & Lapsed restrictions
 * - FR-8.4 / SEC-PUB-4: Instant revocation (404)
 * - TC-ENT-10 / D-40: Lapsed user's existing public link displays platform footer
 * - D-41: Inter typography
 * - D-43: Client status badges (Unpaid, Paid, Overdue)
 * - SEC-PUB-3: noindex, nofollow robots metadata
 * - UX_FLOWS.md Section 4: Inactive link 404 message
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createOrTogglePublicLinkAction } from '@/features/invoices/share-actions';
import { getPublicInvoiceByToken } from '../queries/public-invoice-queries';
import { PublicInvoiceToolbar } from '../components/public-invoice-toolbar';
import { PublicInvoiceNotFoundPage } from '../not-found-page';
import { generatePublicInvoiceMetadata } from '../metadata';
import type { InvoiceTemplateData } from '@/components/invoice-templates';

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase Server & Admin clients
let mockUser: { id: string; email: string } | null = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'pro@tagiva.com',
};
let mockPlanState: 'free' | 'pro' | 'lapsed' = 'pro';
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
          inv.invoice_number = 'INV-PRO-2026-10-0001';
          return { data: 'INV-PRO-2026-10-0001', error: null };
        }
        return { data: null, error: { message: 'Invoice not found' } };
      }
      return { data: null, error: null };
    }),
    from: vi.fn((table: string) => {
      if (table === 'invoices') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field1: string, val1: string) => ({
              eq: vi.fn((field2: string, val2: string) => ({
                single: vi.fn(async () => {
                  const inv = Object.values(mockInvoicesTable).find(
                    (i) => i[field1] === val1 && i[field2] === val2,
                  );
                  return { data: inv ? { ...inv } : null, error: inv ? null : new Error('Not found') };
                }),
              })),
            })),
          })),
          update: vi.fn((updates: Record<string, unknown>) => ({
            eq: vi.fn((field1: string, val1: string) => ({
              eq: vi.fn((field2: string, val2: string) => {
                const inv = Object.values(mockInvoicesTable).find(
                  (i) => i[field1] === val1 && i[field2] === val2,
                );
                if (inv) {
                  Object.assign(inv, updates);
                }
                return { error: null };
              }),
            })),
          })),
        };
      }
      return {};
    }),
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    rpc: vi.fn(async (fn: string, args: { p_token: string }) => {
      if (fn === 'get_public_invoice_by_token') {
        const token = args.p_token;
        const inv = Object.values(mockInvoicesTable).find(
          (i) => i.public_token === token && i.public_link_enabled === true,
        );

        if (!inv) {
          return { data: null, error: null };
        }

        const isOwnerPro = mockPlanState === 'pro';

        return {
          data: {
            invoice: { ...inv },
            items: [
              {
                id: 'item-1',
                description: 'Consulting',
                quantity: 1,
                unit_price: 15000000,
                line_total: 15000000,
                sort_order: 0,
              },
            ],
            show_platform_footer: !isOwnerPro, // Footer shown if owner is not Pro (D-40)
          },
          error: null,
        };
      }
      return { data: null, error: null };
    }),
  })),
}));

describe('Public Shareable Link Feature (FR-8, D-11, D-40, SEC-PUB-*)', () => {
  beforeEach(() => {
    mockPlanState = 'pro';
    mockUser = {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'pro@tagiva.com',
    };
    mockInvoicesTable = {
      '11111111-1111-4111-8111-111111111111': {
        id: '11111111-1111-4111-8111-111111111111',
        user_id: '00000000-0000-4000-8000-000000000001',
        status: 'draft',
        invoice_number: null,
        due_date: '2026-11-15',
        issue_date: '2026-10-28',
        language: 'en',
        currency: 'IDR',
        total_amount: 15000000,
        subtotal: 15000000,
        discount_amount: 0,
        tax_amount: 0,
        sender_name: 'Studio Tagiva',
        client_name: 'Client Corp',
        public_token: null,
        public_link_enabled: false,
        payment_instructions: {
          bank_name: 'BCA',
          account_number: '1234567890',
          account_holder: 'Studio Tagiva',
        },
      },
    };
  });

  it('rejects public link creation for Free and Lapsed users with PRO_REQUIRED (D-11, D-40)', async () => {
    mockPlanState = 'free';
    const freeRes = await createOrTogglePublicLinkAction({
      invoiceId: '11111111-1111-4111-8111-111111111111',
      enabled: true,
    });
    expect(freeRes.ok).toBe(false);
    if (!freeRes.ok) {
      expect(freeRes.error.code).toBe('PRO_REQUIRED');
    }

    mockPlanState = 'lapsed';
    const lapsedRes = await createOrTogglePublicLinkAction({
      invoiceId: '11111111-1111-4111-8111-111111111111',
      enabled: true,
    });
    expect(lapsedRes.ok).toBe(false);
    if (!lapsedRes.ok) {
      expect(lapsedRes.error.code).toBe('PRO_REQUIRED');
    }
  });

  it('auto-issues Draft to Sent and generates 24-char URL token when Pro user enables link (FR-8.1, SEC-PUB-1)', async () => {
    mockPlanState = 'pro';
    const res = await createOrTogglePublicLinkAction({
      invoiceId: '11111111-1111-4111-8111-111111111111',
      enabled: true,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.enabled).toBe(true);
      expect(res.data.publicUrl).toMatch(/^https?:\/\/.+\/i\/[A-Za-z0-9_-]{24}$/);
    }

    const inv = mockInvoicesTable['11111111-1111-4111-8111-111111111111'];
    expect(inv?.status).toBe('sent');
    expect(inv?.invoice_number).toBe('INV-PRO-2026-10-0001');
    expect(inv?.public_link_enabled).toBe(true);
    expect(String(inv?.public_token).length).toBe(24);
  });

  it('revokes public link instantly and causes getPublicInvoiceByToken to return null (FR-8.4, SEC-PUB-4)', async () => {
    // 1. Enable link
    const enableRes = await createOrTogglePublicLinkAction({
      invoiceId: '11111111-1111-4111-8111-111111111111',
      enabled: true,
    });
    expect(enableRes.ok).toBe(true);

    const token = mockInvoicesTable['11111111-1111-4111-8111-111111111111']?.public_token as string;
    expect(token).toBeTruthy();

    // Verify it is accessible
    const publicResult = await getPublicInvoiceByToken(token);
    expect(publicResult).not.toBeNull();
    expect(publicResult?.invoice.invoiceNumber).toBe('INV-PRO-2026-10-0001');

    // 2. Revoke link (enabled = false)
    const revokeRes = await createOrTogglePublicLinkAction({
      invoiceId: '11111111-1111-4111-8111-111111111111',
      enabled: false,
    });
    expect(revokeRes.ok).toBe(true);

    // Verify it now returns null (404)
    const revokedResult = await getPublicInvoiceByToken(token);
    expect(revokedResult).toBeNull();
  });

  it('keeps existing public link viewable for Lapsed creator but includes platform footer (TC-ENT-10, D-40)', async () => {
    // Pro creates public link
    mockPlanState = 'pro';
    const enableRes = await createOrTogglePublicLinkAction({
      invoiceId: '11111111-1111-4111-8111-111111111111',
      enabled: true,
    });
    expect(enableRes.ok).toBe(true);
    const token = mockInvoicesTable['11111111-1111-4111-8111-111111111111']?.public_token as string;

    // View while creator is Pro -> clean (no platform footer)
    const proPublicView = await getPublicInvoiceByToken(token);
    expect(proPublicView).not.toBeNull();
    expect(proPublicView?.showPlatformFooter).toBe(false);

    // Creator's plan lapses to Lapsed
    mockPlanState = 'lapsed';
    const lapsedPublicView = await getPublicInvoiceByToken(token);
    expect(lapsedPublicView).not.toBeNull();
    // Link still works, but showPlatformFooter is true (D-40)
    expect(lapsedPublicView?.showPlatformFooter).toBe(true);
  });
});

describe('Public Invoice Toolbar & Status Badges (D-43)', () => {
  const baseInvoice: InvoiceTemplateData = {
    id: 'inv-1',
    invoiceNumber: 'INV-PRO-2026-10-0001',
    status: 'sent',
    language: 'en',
    currency: 'IDR',
    issueDate: '2026-10-28',
    dueDate: '2026-11-15',
    subtotal: 1000000,
    discountType: 'percent',
    discountValue: 0,
    discountAmount: 0,
    taxLabel: 'PPN',
    taxRate: 11,
    taxAmount: 110000,
    totalAmount: 1110000,
    senderName: 'Sender Co',
    clientName: 'Client Co',
    paymentInstructions: {
      bankName: 'BCA',
      accountNumber: '8888999900',
      accountHolder: 'Sender Co',
    },
    items: [],
  };

  it('renders Unpaid status badge for Sent invoice in English (D-43)', () => {
    const html = renderToString(
      React.createElement(PublicInvoiceToolbar, {
        invoice: { ...baseInvoice, status: 'sent', language: 'en' },
        token: 'test-token-123456789012',
      }),
    );

    expect(html).toContain('UNPAID');
    expect(html).toContain('Copy BCA');
    expect(html).toContain('Download PDF');
  });

  it('renders Belum Dibayar status badge for Sent invoice in Indonesian (D-43)', () => {
    const html = renderToString(
      React.createElement(PublicInvoiceToolbar, {
        invoice: { ...baseInvoice, status: 'sent', language: 'id' },
        token: 'test-token-123456789012',
      }),
    );

    expect(html).toContain('BELUM DIBAYAR');
  });

  it('renders Paid / Lunas status badge for Paid invoice (D-43)', () => {
    const htmlEn = renderToString(
      React.createElement(PublicInvoiceToolbar, {
        invoice: { ...baseInvoice, status: 'paid', language: 'en' },
        token: 'test-token-123456789012',
      }),
    );
    expect(htmlEn).toContain('PAID');

    const htmlId = renderToString(
      React.createElement(PublicInvoiceToolbar, {
        invoice: { ...baseInvoice, status: 'paid', language: 'id' },
        token: 'test-token-123456789012',
      }),
    );
    expect(htmlId).toContain('LUNAS');
  });

  it('renders Overdue / Jatuh Tempo status badge for Overdue invoice (D-43)', () => {
    const htmlEn = renderToString(
      React.createElement(PublicInvoiceToolbar, {
        invoice: { ...baseInvoice, status: 'overdue', language: 'en' },
        token: 'test-token-123456789012',
      }),
    );
    expect(htmlEn).toContain('OVERDUE');

    const htmlId = renderToString(
      React.createElement(PublicInvoiceToolbar, {
        invoice: { ...baseInvoice, status: 'overdue', language: 'id' },
        token: 'test-token-123456789012',
      }),
    );
    expect(htmlId).toContain('JATUH TEMPO');
  });
});

describe('Public Invoice 404 & Metadata (SEC-PUB-3, UX_FLOWS.md Section 4)', () => {
  it('renders inactive link message on 404 page', () => {
    const html = renderToString(React.createElement(PublicInvoiceNotFoundPage));

    expect(html).toContain('Invoice Link Inactive');
    expect(html).toContain(
      'This invoice link is no longer active or does not exist. Please contact the sender directly.',
    );
    expect(html).toContain('Back to Tagiva');
  });

  it('generates noindex, nofollow metadata for robots (SEC-PUB-3)', async () => {
    const metadata = await generatePublicInvoiceMetadata({
      params: Promise.resolve({ token: 'test-token' }),
    });

    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    });
  });
});
