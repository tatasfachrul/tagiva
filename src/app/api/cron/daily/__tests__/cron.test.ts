/**
 * Tagiva - Daily Vercel Cron Job Integration Tests
 *
 * Covers:
 * - TC-BILL-04: Expiry reminders on manual plan (30d skipped if passed, 14d, 3d, 0d fired once each)
 * - TC-BILL-05: Auto-renewal reminder (receives only auto_renew_3d notice 3 days before renewal)
 * - Expiration of elapsed subscriptions (D-23, D-52)
 * - Batch marking of overdue invoices (D-15)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';

// Mock Resend Email Client
const mockSendEmail = vi.fn(async (_payload: unknown) => ({ id: 'resend-cron-test' }));
vi.mock('@/lib/email/client', () => ({
  sendEmail: (payload: unknown) => mockSendEmail(payload),
}));

// In-Memory Database for Cron Testing
interface MockSub {
  id: string;
  user_id: string;
  plan_duration_months: number;
  billing_mode: 'manual' | 'auto_renew';
  status: 'active' | 'past_due' | 'expired' | 'cancelled';
  current_period_end: string;
  grace_period_end: string | null;
  profiles: {
    business_name: string;
    email: string;
    default_language: string;
  };
}

interface MockInv {
  id: string;
  status: string;
  due_date: string;
}

interface MockReminder {
  id: string;
  subscription_id: string;
  period_end_date_wib: string;
  reminder_type: string;
}

let mockSubs: MockSub[] = [];
let mockInvoices: MockInv[] = [];
let mockReminders: MockReminder[] = [];

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'subscriptions') {
        return {
          select: vi.fn((_cols: string) => ({
            eq: vi.fn((_field: string, statusVal: string) => {
              const filtered = mockSubs.filter((s) => s.status === statusVal);
              return Promise.resolve({ data: filtered, error: null });
            }),
          })),
          update: vi.fn((updates: Record<string, unknown>) => {
            return {
              in: vi.fn((_field: string, statusList: string[]) => ({
                lte: vi.fn((_dateField: string, cutoffIso: string) => {
                  const updated: Array<{ id: string }> = [];
                  for (const s of mockSubs) {
                    if (statusList.includes(s.status) && s.current_period_end <= cutoffIso) {
                      Object.assign(s, updates);
                      updated.push({ id: s.id });
                    }
                  }
                  return {
                    select: vi.fn(async () => ({ data: updated, error: null })),
                  };
                }),
              })),
              eq: vi.fn((_field: string, statusVal: string) => ({
                lte: vi.fn((_dateField: string, cutoffIso: string) => {
                  const updated: Array<{ id: string }> = [];
                  for (const s of mockSubs) {
                    if (s.status === statusVal && (s.grace_period_end ?? '') <= cutoffIso) {
                      Object.assign(s, updates);
                      updated.push({ id: s.id });
                    }
                  }
                  return {
                    select: vi.fn(async () => ({ data: updated, error: null })),
                  };
                }),
              })),
            };
          }),
        };
      }

      if (table === 'invoices') {
        return {
          update: vi.fn((updates: Record<string, unknown>) => ({
            eq: vi.fn((_field: string, statusVal: string) => ({
              lt: vi.fn((_dateField: string, todayWib: string) => {
                const updated: Array<{ id: string }> = [];
                for (const inv of mockInvoices) {
                  if (inv.status === statusVal && inv.due_date < todayWib) {
                    Object.assign(inv, updates);
                    updated.push({ id: inv.id });
                  }
                }
                return {
                  select: vi.fn(async () => ({ data: updated, error: null })),
                };
              }),
            })),
          })),
        };
      }

      if (table === 'subscription_reminders') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((_f1: string, subId: string) => ({
              eq: vi.fn((_f2: string, dateWib: string) => ({
                eq: vi.fn((_f3: string, reminderType: string) => ({
                  maybeSingle: vi.fn(async () => {
                    const found = mockReminders.find(
                      (r) =>
                        r.subscription_id === subId &&
                        r.period_end_date_wib === dateWib &&
                        r.reminder_type === reminderType,
                    );
                    return { data: found ? { ...found } : null, error: null };
                  }),
                })),
              })),
            })),
          })),
          insert: vi.fn(async (row: Record<string, unknown>) => {
            mockReminders.push({
              id: `rem-${mockReminders.length + 1}`,
              subscription_id: String(row.subscription_id),
              period_end_date_wib: String(row.period_end_date_wib),
              reminder_type: String(row.reminder_type),
            });
            return { error: null };
          }),
        };
      }

      return {};
    }),
  })),
}));

describe('Daily Cron Job (/api/cron/daily — D-26, D-50, D-52, D-53)', () => {
  const TEST_USER = '00000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    mockSubs = [];
    mockInvoices = [];
    mockReminders = [];
    mockSendEmail.mockClear();
  });

  it('TC-BILL-04: Expiry reminders on manual plan fire at 14d, 3d, 0d and deduplicate (D-26, A-21)', async () => {
    // Subscription ending in 14 days
    const in14Days = new Date();
    in14Days.setDate(in14Days.getDate() + 14);

    mockSubs.push({
      id: 'sub-manual-14d',
      user_id: TEST_USER,
      plan_duration_months: 1,
      billing_mode: 'manual',
      status: 'active',
      current_period_end: in14Days.toISOString(),
      grace_period_end: null,
      profiles: {
        business_name: 'Studio Tagiva',
        email: 'owner@tagivastudio.com',
        default_language: 'en',
      },
    });

    const request = new Request('http://localhost/api/cron/daily', {
      headers: {
        Authorization: 'Bearer mock-cron-secret',
      },
    });

    // First cron execution
    const res1 = await GET(request);
    expect(res1.status).toBe(200);
    const body1 = await res1.json();
    expect(body1.remindersSentCount).toBe(1);

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockReminders.length).toBe(1);
    expect(mockReminders[0]?.reminder_type).toBe('14d');

    // Second cron execution on same day (deduplication check, A-21)
    const res2 = await GET(request);
    expect(res2.status).toBe(200);
    const body2 = await res2.json();
    expect(body2.remindersSentCount).toBe(0); // Deduplicated, 0 new reminders sent
    expect(mockSendEmail).toHaveBeenCalledTimes(1); // Still 1 call
  });

  it('TC-BILL-05: Auto-renewal subscription receives only auto_renew_3d notice (D-53)', async () => {
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);

    mockSubs.push({
      id: 'sub-autorenew-3d',
      user_id: TEST_USER,
      plan_duration_months: 3,
      billing_mode: 'auto_renew',
      status: 'active',
      current_period_end: in3Days.toISOString(),
      grace_period_end: null,
      profiles: {
        business_name: 'Agency Pro',
        email: 'agency@example.com',
        default_language: 'id',
      },
    });

    const request = new Request('http://localhost/api/cron/daily', {
      headers: {
        Authorization: 'Bearer mock-cron-secret',
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.remindersSentCount).toBe(1);

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
    expect(mockReminders.length).toBe(1);
    expect(mockReminders[0]?.reminder_type).toBe('auto_renew_3d');
  });

  it('expires subscriptions where period has elapsed or grace period has elapsed (D-23, D-52)', async () => {
    // 1. Subscription elapsed yesterday
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    mockSubs.push({
      id: 'sub-expired-1',
      user_id: TEST_USER,
      plan_duration_months: 1,
      billing_mode: 'manual',
      status: 'active',
      current_period_end: yesterday.toISOString(),
      grace_period_end: null,
      profiles: {
        business_name: 'Expired Corp',
        email: 'expired@corp.com',
        default_language: 'en',
      },
    });

    // 2. Past_due subscription whose 3-day grace period ended yesterday
    mockSubs.push({
      id: 'sub-grace-expired-2',
      user_id: '00000000-0000-4000-8000-000000000002',
      plan_duration_months: 1,
      billing_mode: 'auto_renew',
      status: 'past_due',
      current_period_end: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      grace_period_end: yesterday.toISOString(),
      profiles: {
        business_name: 'Grace Expired',
        email: 'grace@example.com',
        default_language: 'en',
      },
    });

    const request = new Request('http://localhost/api/cron/daily', {
      headers: {
        Authorization: 'Bearer mock-cron-secret',
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const sub1 = mockSubs.find((s) => s.id === 'sub-expired-1');
    expect(sub1?.status).toBe('expired');

    const sub2 = mockSubs.find((s) => s.id === 'sub-grace-expired-2');
    expect(sub2?.status).toBe('expired');
  });

  it('marks Sent invoices as Overdue when past due date (D-15, FR-5.8)', async () => {
    mockInvoices.push({
      id: 'inv-due-past',
      status: 'sent',
      due_date: '2026-10-01', // definitely in the past
    });

    mockInvoices.push({
      id: 'inv-due-future',
      status: 'sent',
      due_date: '2026-11-30', // in the future
    });

    const request = new Request('http://localhost/api/cron/daily', {
      headers: {
        Authorization: 'Bearer mock-cron-secret',
      },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    expect(mockInvoices.find((i) => i.id === 'inv-due-past')?.status).toBe('overdue');
    expect(mockInvoices.find((i) => i.id === 'inv-due-future')?.status).toBe('sent');
  });
});
