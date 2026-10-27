import { InvoiceStatus, validateStatusTransition } from './status';

/**
 * Entitlement & Access Policy Engine (D-11, D-12, D-21, D-23, D-28, D-29, D-33, D-40, D-52, NFR-6)
 *
 * Central source of truth for all role and plan permissions across
 * Visitor, Free, Pro, and Lapsed users.
 */

export type UserPlanState = 'free' | 'pro' | 'lapsed';

export const MAX_FREE_SAVED_INVOICES = 3;

export interface SubscriptionRecord {
  status: 'active' | 'past_due' | 'expired' | 'cancelled';
  currentPeriodEnd: Date | string;
  gracePeriodEnd?: Date | string | null;
}

/**
 * Resolves a user's effective plan state from their subscription records (D-52).
 */
export function resolveUserPlanState(
  subscriptions: SubscriptionRecord[] = [],
  now: Date = new Date(),
): UserPlanState {
  if (subscriptions.length === 0) {
    return 'free';
  }

  const currentTime = now.getTime();

  // Check for active Pro subscription or 3-day grace period on failed auto-renew (D-52)
  const isCurrentlyPro = subscriptions.some((sub) => {
    const periodEnd = new Date(sub.currentPeriodEnd).getTime();

    if ((sub.status === 'active' || sub.status === 'cancelled') && periodEnd > currentTime) {
      return true;
    }

    if (sub.status === 'past_due' && sub.gracePeriodEnd) {
      const graceEnd = new Date(sub.gracePeriodEnd).getTime();
      return graceEnd > currentTime;
    }

    return false;
  });

  if (isCurrentlyPro) {
    return 'pro';
  }

  // User has subscription history but no active period -> Lapsed (D-23)
  return 'lapsed';
}

/**
 * Can user create a new invoice? (D-12, D-33)
 * Free and Lapsed users can save at most 3 invoices in total.
 */
export function canCreateInvoice(
  planState: UserPlanState,
  currentInvoiceCount: number,
): boolean {
  if (planState === 'pro') {
    return true;
  }
  return currentInvoiceCount < MAX_FREE_SAVED_INVOICES;
}

/**
 * Can user edit fields and line items of an existing invoice? (D-23, D-28)
 * Lapsed users are read-only.
 */
export function canEditInvoice(planState: UserPlanState): boolean {
  return planState === 'pro' || planState === 'free';
}

/**
 * Can user delete an invoice? (D-21, D-28, D-29, A-12)
 * - Pro: can delete any invoice
 * - Free: can delete ONLY drafts
 * - Lapsed: cannot delete existing invoices
 */
export function canDeleteInvoice(
  planState: UserPlanState,
  invoiceStatus: InvoiceStatus,
): boolean {
  if (planState === 'pro') {
    return true;
  }
  if (planState === 'free') {
    return invoiceStatus === 'draft';
  }
  return false;
}

/**
 * Can user change an invoice's status? (D-28, A-16, A-18)
 * - Lapsed users: ONLY allowed to mark 'sent' or 'overdue' as 'paid'
 * - Free / Pro: can transition between valid statuses
 */
export function canChangeStatus(
  planState: UserPlanState,
  currentStatus: InvoiceStatus,
  targetStatus: InvoiceStatus,
): { allowed: boolean; error?: string } {
  if (planState === 'lapsed') {
    const isPayingUnpaid =
      (currentStatus === 'sent' || currentStatus === 'overdue') && targetStatus === 'paid';
    if (!isPayingUnpaid) {
      return {
        allowed: false,
        error:
          'Your Pro subscription has ended. Existing invoices are read-only, except marking Sent invoices as Paid.',
      };
    }
    return { allowed: true };
  }

  return validateStatusTransition(currentStatus, targetStatus);
}

/**
 * Can user use Pro-exclusive features (Custom Logo, Public Shareable Link, Email Send)? (D-04, D-11)
 */
export function canUseProFeature(planState: UserPlanState): boolean {
  return planState === 'pro';
}

/**
 * Should the platform footer ("Made with Tagiva • tagiva.com") be included on PDF / public link? (FR-7.3, D-28, D-40)
 * Only active Pro accounts get clean branding without the platform footer.
 */
export function shouldIncludePlatformFooter(planState: UserPlanState): boolean {
  return planState !== 'pro';
}
