/**
 * Tagiva - Billing Webhook & Subscription Lifecycle Tests
 *
 * Covers:
 * - TC-BILL-01: Manual payment before current_period_end extends period (A-14)
 * - TC-BILL-02: Webhook idempotency (duplicate delivery returns 200 without double-extension)
 * - TC-BILL-03: Failed auto-renewal charge moves to past_due with 3-day grace period (D-52)
 * - SECURITY.md 6.1: Server-side price authority check
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/billing/route';
import { CANONICAL_PRICING_IDR } from '../adapter';

// In-memory mock database
interface MockSubscription {
  id: string;
  user_id: string;
  plan_duration_months: number;
  billing_mode: string;
  status: 'active' | 'past_due' | 'expired' | 'cancelled';
  current_period_start: string;
  current_period_end: string;
  grace_period_end: string | null;
  gateway_provider: string;
  gateway_subscription_id: string;
}

interface MockBillingEvent {
  id: string;
  gateway_event_id: string;
  user_id: string;
  event_type: string;
  duration_months: number;
  amount_idr: number;
  raw_payload: unknown;
}

let mockSubscriptions: MockSubscription[] = [];
let mockBillingEvents: MockBillingEvent[] = [];

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'billing_events') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((_field: string, eventId: string) => ({
              maybeSingle: vi.fn(async () => {
                const found = mockBillingEvents.find(
                  (e) => e.gateway_event_id === eventId,
                );
                return { data: found ? { ...found } : null, error: null };
              }),
            })),
          })),
          insert: vi.fn(async (row: Record<string, unknown>) => {
            const newEvt: MockBillingEvent = {
              id: `evt-${mockBillingEvents.length + 1}`,
              gateway_event_id: String(row.gateway_event_id),
              user_id: String(row.user_id),
              event_type: String(row.event_type),
              duration_months: Number(row.duration_months || 1),
              amount_idr: Number(row.amount_idr || 0),
              raw_payload: row.raw_payload,
            };
            mockBillingEvents.push(newEvt);
            return { error: null };
          }),
        };
      }

      if (table === 'subscriptions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field1: string, val1: string) => ({
              in: vi.fn((field2: string, vals2: string[]) => ({
                gt: vi.fn((_field3: string, _val3: string) => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(() => ({
                      maybeSingle: vi.fn(async () => {
                        const found = mockSubscriptions.find(
                          (s) =>
                            s[field1 as keyof MockSubscription] === val1 &&
                            vals2.includes(s[field2 as keyof MockSubscription] as string),
                        );
                        return { data: found ? { ...found } : null, error: null };
                      }),
                    })),
                  })),
                })),
              })),
              eq: vi.fn((field2: string, val2: string) => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    maybeSingle: vi.fn(async () => {
                      const found = mockSubscriptions.find(
                        (s) =>
                          s[field1 as keyof MockSubscription] === val1 &&
                          s[field2 as keyof MockSubscription] === val2,
                      );
                      return { data: found ? { ...found } : null, error: null };
                    }),
                  })),
                })),
              })),
            })),
          })),
          insert: vi.fn((row: Record<string, unknown>) => {
            const newSub: MockSubscription = {
              id: `sub-${mockSubscriptions.length + 1}`,
              user_id: String(row.user_id),
              plan_duration_months: Number(row.plan_duration_months || 1),
              billing_mode: String(row.billing_mode || 'manual'),
              status: (row.status as MockSubscription['status']) || 'active',
              current_period_start: String(row.current_period_start),
              current_period_end: String(row.current_period_end),
              grace_period_end: row.grace_period_end ? String(row.grace_period_end) : null,
              gateway_provider: String(row.gateway_provider || 'xendit'),
              gateway_subscription_id: String(row.gateway_subscription_id || ''),
            };
            mockSubscriptions.push(newSub);
            return {
              select: vi.fn(() => ({
                single: vi.fn(async () => ({ data: newSub, error: null })),
              })),
            };
          }),
          update: vi.fn((updates: Record<string, unknown>) => ({
            eq: vi.fn((_field: string, id: string) => {
              const sub = mockSubscriptions.find((s) => s.id === id);
              if (sub) {
                Object.assign(sub, updates);
              }
              return { error: null };
            }),
          })),
        };
      }

      return {};
    }),
  })),
}));

describe('Billing Webhook & Subscription Lifecycle (TC-BILL-01, TC-BILL-02, TC-BILL-03)', () => {
  const TEST_USER_ID = '00000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    mockSubscriptions = [];
    mockBillingEvents = [];
  });

  it('TC-BILL-01: Manual payment before current_period_end adds duration onto existing end date (A-14)', async () => {
    // 1. User has an active 1-month subscription ending in 10 days
    const currentEnd = new Date();
    currentEnd.setDate(currentEnd.getDate() + 10);

    mockSubscriptions.push({
      id: 'sub-existing-1',
      user_id: TEST_USER_ID,
      plan_duration_months: 1,
      billing_mode: 'manual',
      status: 'active',
      current_period_start: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      current_period_end: currentEnd.toISOString(),
      grace_period_end: null,
      gateway_provider: 'xendit',
      gateway_subscription_id: 'sub_init_1',
    });

    const previousEndIso = currentEnd.toISOString();

    // 2. User purchases 3 months (Rp79.000)
    const webhookPayload = {
      id: 'evt_xendit_paid_1',
      event: 'invoice.paid',
      status: 'PAID',
      amount: CANONICAL_PRICING_IDR[3], // Rp79.000
      metadata: {
        userId: TEST_USER_ID,
        durationMonths: 3,
        billingMode: 'manual',
      },
    };

    const request = new Request('http://localhost/api/webhooks/billing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-callback-token': 'mock-webhook-secret',
      },
      body: JSON.stringify(webhookPayload),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // 3. Verify current_period_end was extended by exactly 3 months on top of previousEnd
    const sub = mockSubscriptions.find((s) => s.id === 'sub-existing-1');
    expect(sub).toBeDefined();

    const expectedEnd = new Date(previousEndIso);
    expectedEnd.setMonth(expectedEnd.getMonth() + 3);

    // Allow 1 second tolerance for test runtime
    const subEndDate = new Date(sub?.current_period_end || '');
    expect(subEndDate.getFullYear()).toBe(expectedEnd.getFullYear());
    expect(subEndDate.getMonth()).toBe(expectedEnd.getMonth());
    expect(subEndDate.getDate()).toBe(expectedEnd.getDate());

    // Verify 1 billing event recorded
    expect(mockBillingEvents.length).toBe(1);
    expect(mockBillingEvents[0]?.gateway_event_id).toBe('evt_xendit_paid_1');
  });

  it('TC-BILL-02: Duplicate webhook delivery with same gateway_event_id returns 200 without double extension', async () => {
    // 1. Initial subscription payment
    const webhookPayload = {
      id: 'evt_unique_123',
      status: 'PAID',
      amount: CANONICAL_PRICING_IDR[1], // Rp29.000
      metadata: {
        userId: TEST_USER_ID,
        durationMonths: 1,
        billingMode: 'manual',
      },
    };

    const req1 = new Request('http://localhost/api/webhooks/billing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-callback-token': 'mock-webhook-secret',
      },
      body: JSON.stringify(webhookPayload),
    });

    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    expect(mockSubscriptions.length).toBe(1);
    const recordedEnd = mockSubscriptions[0]?.current_period_end;

    // 2. Duplicate delivery (e.g. gateway network retry)
    const req2 = new Request('http://localhost/api/webhooks/billing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-callback-token': 'mock-webhook-secret',
      },
      body: JSON.stringify(webhookPayload),
    });

    const res2 = await POST(req2);
    expect(res2.status).toBe(200);

    const json2 = (await res2.json()) as { message?: string };
    expect(json2.message).toContain('already processed');

    // Ensure subscriptions and billing events were NOT duplicated or extended twice
    expect(mockSubscriptions.length).toBe(1);
    expect(mockSubscriptions[0]?.current_period_end).toBe(recordedEnd);
    expect(mockBillingEvents.length).toBe(1);
  });

  it('TC-BILL-03: Failed auto-renewal charge moves subscription to past_due with 3-day grace period (D-52)', async () => {
    // 1. Active auto-renew subscription
    const existingEnd = new Date(Date.now() + 1000);
    mockSubscriptions.push({
      id: 'sub-autorenew-1',
      user_id: TEST_USER_ID,
      plan_duration_months: 1,
      billing_mode: 'auto_renew',
      status: 'active',
      current_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      current_period_end: existingEnd.toISOString(),
      grace_period_end: null,
      gateway_provider: 'xendit',
      gateway_subscription_id: 'sub_recurring_1',
    });

    // 2. Gateway reports failed charge
    const failedPayload = {
      id: 'evt_failed_charge_1',
      status: 'FAILED',
      amount: CANONICAL_PRICING_IDR[1],
      metadata: {
        userId: TEST_USER_ID,
        durationMonths: 1,
        billingMode: 'auto_renew',
      },
    };

    const request = new Request('http://localhost/api/webhooks/billing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-callback-token': 'mock-webhook-secret',
      },
      body: JSON.stringify(failedPayload),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // 3. Verify status changed to past_due and grace_period_end is roughly now + 3 days
    const sub = mockSubscriptions.find((s) => s.id === 'sub-autorenew-1');
    expect(sub?.status).toBe('past_due');
    expect(sub?.grace_period_end).not.toBeNull();

    const graceDate = new Date(sub?.grace_period_end || '');
    const now = new Date();
    const diffDays = Math.round((graceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(3);
  });

  it('rejects tampered paid amount that does not match canonical pricing (SECURITY.md 6.1)', async () => {
    const tamperedPayload = {
      id: 'evt_tampered_amount',
      status: 'PAID',
      amount: 1000, // Attacker paid Rp1.000 instead of Rp29.000
      metadata: {
        userId: TEST_USER_ID,
        durationMonths: 1,
        billingMode: 'manual',
      },
    };

    const request = new Request('http://localhost/api/webhooks/billing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-callback-token': 'mock-webhook-secret',
      },
      body: JSON.stringify(tamperedPayload),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    // Ensure no subscription was created
    expect(mockSubscriptions.length).toBe(0);
  });
});
