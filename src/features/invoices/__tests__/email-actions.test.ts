/**
 * Tagiva - Invoice Email Actions & Rate-Limiting Integration Tests
 *
 * Covers:
 * - TC-SEC-03: Rate limits enforcement (50/day/account, 5/day/invoice) (D-57)
 * - D-11: Pro plan gate (PRO_REQUIRED on Free and Lapsed)
 * - FR-9.6: Draft auto-issuance on email dispatch
 * - FR-9.3 / FR-9.5: Public link token guarantee, Resend dispatch, and Reply-To header (D-51)
 * - FR-9.4: Bilingual EN/ID email template rendering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendInvoiceEmailAction } from '../email-actions';
import { renderInvoiceEmailHtml } from '@/lib/email/templates/invoice-email';

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Email Client
const mockSendEmail = vi.fn(async (_payload: unknown) => ({
  id: 'resend-test-msg-1',
}));

vi.mock('@/lib/email/client', () => ({
  sendEmail: (payload: unknown) => mockSendEmail(payload),
}));

// Mock Supabase Server Client
let mockUser: { id: string; email: string } | null = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'pro@tagiva.com',
};
let mockPlanState: 'free' | 'pro' | 'lapsed' = 'pro';
let mockInvoicesTable: Record<string, Record<string, unknown>> = {};
let mockEmailLogs: Array<{
  id: string;
  user_id: string;
  invoice_id: string;
  sent_date_wib: string;
  recipient_email: string;
}> = [];

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
      if (table === 'invoice_email_logs') {
        return {
          select: vi.fn((_cols: string, opts?: { count?: string; head?: boolean }) => {
            const filters: Record<string, string> = {};
            const chain = {
              eq: vi.fn((field: string, val: string) => {
                filters[field] = val;
                return chain;
              }),
              then: (resolve: (val: unknown) => void) => {
                const matched = mockEmailLogs.filter((log) => {
                  return Object.entries(filters).every(
                    ([k, v]) => log[k as keyof typeof log] === v,
                  );
                });
                if (opts?.count === 'exact') {
                  resolve({ count: matched.length, error: null });
                } else {
                  resolve({ data: matched, error: null });
                }
              },
            };
            return chain;
          }),
          insert: vi.fn(async (row: Record<string, unknown>) => {
            mockEmailLogs.push({
              id: `log-${mockEmailLogs.length + 1}`,
              user_id: String(row.user_id),
              invoice_id: String(row.invoice_id),
              sent_date_wib: String(row.sent_date_wib),
              recipient_email: String(row.recipient_email),
            });
            return { error: null };
          }),
        };
      }

      if (table === 'invoices') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field1: string, val1: string) => ({
              eq: vi.fn((field2: string, val2: string) => ({
                single: vi.fn(async () => {
                  const inv = Object.values(mockInvoicesTable).find(
                    (i) => i[field1] === val1 && i[field2] === val2,
                  );
                  return {
                    data: inv ? { ...inv } : null,
                    error: inv ? null : new Error('Not found'),
                  };
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

      if (table === 'invoice_items') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(async () => ({
                data: [
                  {
                    id: 'item-1',
                    description: 'Development Services',
                    quantity: 1,
                    unit_price: 10000000,
                    line_total: 10000000,
                    sort_order: 0,
                  },
                ],
                error: null,
              })),
            })),
          })),
        };
      }

      return {};
    }),
  })),
}));

describe('Invoice Email Delivery Action (sendInvoiceEmailAction — FR-9, D-11, D-51, D-57)', () => {
  const TEST_INVOICE_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    mockPlanState = 'pro';
    mockUser = {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'pro@tagiva.com',
    };
    mockEmailLogs = [];
    mockSendEmail.mockClear();

    mockInvoicesTable = {
      [TEST_INVOICE_ID]: {
        id: TEST_INVOICE_ID,
        user_id: '00000000-0000-4000-8000-000000000001',
        status: 'draft',
        invoice_number: null,
        language: 'en',
        currency: 'IDR',
        issue_date: '2026-10-28',
        due_date: '2026-11-11',
        sender_name: 'Studio Tagiva',
        sender_email: 'billing@tagivastudio.com',
        client_name: 'Alpha Corp',
        client_email: 'alpha@corp.com',
        total_amount: 10000000,
        subtotal: 10000000,
        discount_amount: 0,
        tax_amount: 0,
        public_token: null,
        public_link_enabled: false,
      },
    };
  });

  it('blocks Free and Lapsed users with PRO_REQUIRED (D-11)', async () => {
    mockPlanState = 'free';
    const freeRes = await sendInvoiceEmailAction({
      invoiceId: TEST_INVOICE_ID,
      recipientEmail: 'client@example.com',
      subject: 'Invoice for Services',
      message: 'Please review and pay.',
    });
    expect(freeRes.ok).toBe(false);
    if (!freeRes.ok) {
      expect(freeRes.error.code).toBe('PRO_REQUIRED');
    }

    mockPlanState = 'lapsed';
    const lapsedRes = await sendInvoiceEmailAction({
      invoiceId: TEST_INVOICE_ID,
      recipientEmail: 'client@example.com',
      subject: 'Invoice for Services',
      message: 'Please review and pay.',
    });
    expect(lapsedRes.ok).toBe(false);
    if (!lapsedRes.ok) {
      expect(lapsedRes.error.code).toBe('PRO_REQUIRED');
    }
  });

  it('auto-issues Draft to Sent, enables public link, and calls Resend with PDF attachment (FR-9.3, FR-9.6, D-51)', async () => {
    mockPlanState = 'pro';

    const res = await sendInvoiceEmailAction({
      invoiceId: TEST_INVOICE_ID,
      recipientEmail: 'alpha@corp.com',
      subject: 'Invoice INV-PRO-2026-10-0001 from Studio Tagiva',
      message: 'Thank you for your business!',
    });

    expect(res.ok).toBe(true);

    const inv = mockInvoicesTable[TEST_INVOICE_ID];
    expect(inv?.status).toBe('sent');
    expect(inv?.invoice_number).toBe('INV-PRO-2026-10-0001');
    expect(inv?.public_link_enabled).toBe(true);
    expect(inv?.public_token).toBeTruthy();

    // Verify Resend payload
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    const payload = mockSendEmail.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.from).toBe('Studio Tagiva via Tagiva <invoices@tagiva.com>');
    expect(payload.replyTo).toBe('billing@tagivastudio.com');
    expect(payload.to).toBe('alpha@corp.com');
    expect(payload.subject).toBe('Invoice INV-PRO-2026-10-0001 from Studio Tagiva');

    const attachments = payload.attachments as Array<{ filename: string; content: unknown }>;
    expect(attachments.length).toBe(1);
    expect(attachments[0]?.filename).toBe('INV-PRO-2026-10-0001.pdf');

    // Verify row logged in invoice_email_logs
    expect(mockEmailLogs.length).toBe(1);
    expect(mockEmailLogs[0]?.user_id).toBe('00000000-0000-4000-8000-000000000001');
    expect(mockEmailLogs[0]?.invoice_id).toBe(TEST_INVOICE_ID);
    expect(mockEmailLogs[0]?.recipient_email).toBe('alpha@corp.com');
  });

  it('enforces TC-SEC-03: daily limit of 50 emails per account (D-57)', async () => {
    // Populate 50 logs for user today
    for (let i = 0; i < 50; i++) {
      mockEmailLogs.push({
        id: `log-${i}`,
        user_id: '00000000-0000-4000-8000-000000000001',
        invoice_id: `other-inv-${i}`,
        sent_date_wib: '2026-10-28',
        recipient_email: `client${i}@example.com`,
      });
    }

    const res = await sendInvoiceEmailAction({
      invoiceId: TEST_INVOICE_ID,
      recipientEmail: 'client@example.com',
      subject: 'Invoice Attempt #51',
      message: 'Hello',
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(res.error.message).toContain('Daily limit of 50');
    }

    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('enforces TC-SEC-03: daily limit of 5 emails per invoice (D-57)', async () => {
    // Populate 5 logs for this specific invoice today
    for (let i = 0; i < 5; i++) {
      mockEmailLogs.push({
        id: `log-inv-${i}`,
        user_id: '00000000-0000-4000-8000-000000000001',
        invoice_id: TEST_INVOICE_ID,
        sent_date_wib: '2026-10-28',
        recipient_email: `client${i}@example.com`,
      });
    }

    const res = await sendInvoiceEmailAction({
      invoiceId: TEST_INVOICE_ID,
      recipientEmail: 'client@example.com',
      subject: 'Invoice Attempt #6',
      message: 'Hello',
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(res.error.message).toContain('already been emailed 5 times today');
    }

    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

describe('Bilingual Invoice Email Template (renderInvoiceEmailHtml — FR-9.4)', () => {
  it('renders English email HTML with invoice summary and public CTA', () => {
    const html = renderInvoiceEmailHtml({
      senderName: 'Design Studio',
      clientName: 'Acme Corp',
      invoiceNumber: 'INV-DES-2026-10-0001',
      issueDate: '2026-10-28',
      dueDate: '2026-11-11',
      currency: 'IDR',
      totalAmount: 15000000,
      message: 'Please find attached invoice for project milestone 1.',
      publicUrl: 'https://tagiva.com/i/sample-token',
      language: 'en',
    });

    expect(html).toContain('Invoice from Design Studio');
    expect(html).toContain('Hi Acme Corp,');
    expect(html).toContain('Please find attached invoice for project milestone 1.');
    expect(html).toContain('INV-DES-2026-10-0001');
    expect(html).toContain('Total Due');
    expect(html).toContain('Rp15.000.000');
    expect(html).toContain('View Invoice Online');
    expect(html).toContain('https://tagiva.com/i/sample-token');
    expect(html).toContain('The official invoice PDF is attached directly to this email.');
  });

  it('renders Indonesian email HTML with invoice summary and public CTA (FR-9.4)', () => {
    const html = renderInvoiceEmailHtml({
      senderName: 'Studio Desain',
      clientName: 'PT Maju Bersama',
      invoiceNumber: 'INV-DES-2026-10-0002',
      issueDate: '2026-10-28',
      dueDate: '2026-11-11',
      currency: 'IDR',
      totalAmount: 25000000,
      message: 'Terima kasih atas kerja samanya.',
      publicUrl: 'https://tagiva.com/i/sample-token-id',
      language: 'id',
    });

    expect(html).toContain('Faktur dari Studio Desain');
    expect(html).toContain('Halo PT Maju Bersama,');
    expect(html).toContain('Terima kasih atas kerja samanya.');
    expect(html).toContain('Nomor Faktur');
    expect(html).toContain('Total Tagihan');
    expect(html).toContain('Rp25.000.000');
    expect(html).toContain('Lihat Faktur Online');
    expect(html).toContain('https://tagiva.com/i/sample-token-id');
    expect(html).toContain('Dokumen PDF faktur resmi telah dilampirkan langsung pada email ini.');
  });
});
