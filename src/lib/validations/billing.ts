/**
 * Tagiva - Subscription & Billing Validation Schemas
 *
 * Implements Zod validation schemas for subscription checkout and management
 * as specified in API.md Section 3.4 and PRD.md D-16, D-22.
 */

import { z } from 'zod';

export const PRO_PLAN_PRICING = {
  1: { months: 1, idrAmount: 29000, label: '1 Month' },
  3: { months: 3, idrAmount: 79000, label: '3 Months' },
  6: { months: 6, idrAmount: 150000, label: '6 Months' },
  12: { months: 12, idrAmount: 250000, label: '12 Months' },
} as const;

export type ProDurationMonths = keyof typeof PRO_PLAN_PRICING;

export const VALID_DURATIONS = [1, 3, 6, 12] as const;

export const CreateSubscriptionCheckoutSchema = z.object({
  durationMonths: z.union([
    z.literal(1),
    z.literal(3),
    z.literal(6),
    z.literal(12),
  ], {
    errorMap: () => ({ message: 'Duration must be 1, 3, 6, or 12 months' }),
  }),
  billingMode: z.enum(['manual', 'auto_renew'], {
    errorMap: () => ({ message: "Billing mode must be 'manual' or 'auto_renew'" }),
  }),
});

export const CancelAutoRenewSchema = z.object({
  subscriptionId: z.string().uuid('Invalid subscription ID'),
});

export type CreateSubscriptionCheckoutInput = z.infer<typeof CreateSubscriptionCheckoutSchema>;
export type CancelAutoRenewInput = z.infer<typeof CancelAutoRenewSchema>;
