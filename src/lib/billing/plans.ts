/**
 * Tagiva - Canonical Billing Plans & Pricing (D-16)
 *
 * Safe for both client and server bundles (no Node.js/crypto dependencies).
 */

export type PlanDurationMonths = 1 | 3 | 6 | 12;
export type BillingMode = 'manual' | 'auto_renew';
export type PaymentGatewayProviderName = 'xendit' | 'midtrans' | 'mayar';

/**
 * Master canonical pricing in Indonesian Rupiah (D-16).
 * - 1 Month: Rp 29.000
 * - 3 Months: Rp 79.000
 * - 6 Months: Rp 150.000
 * - 12 Months: Rp 250.000
 */
export const CANONICAL_PRICING_IDR: Record<PlanDurationMonths, number> = {
  1: 29000,
  3: 79000,
  6: 150000,
  12: 250000,
};

/**
 * Validates that the amount paid matches canonical Tagiva pricing (D-16, SECURITY.md Section 6.1).
 */
export function validatePaidAmount(
  durationMonths: PlanDurationMonths,
  amountPaid: number,
): boolean {
  const expectedAmount = CANONICAL_PRICING_IDR[durationMonths];
  return expectedAmount !== undefined && Math.round(amountPaid) === expectedAmount;
}
