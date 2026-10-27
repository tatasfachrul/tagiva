import { isPastDueWib } from './timezone';

/**
 * Invoice Status Domain Rules (D-15, D-43, A-16, A-18)
 */

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export type ClientFacingStatus = 'unpaid' | 'paid' | 'overdue';

/**
 * Resolves the effective invoice status based on due date in Asia/Jakarta.
 * An invoice with stored status 'sent' becomes 'overdue' if today > dueDate.
 */
export function resolveEffectiveInvoiceStatus(
  storedStatus: InvoiceStatus,
  dueDate: string,
  referenceDateWib?: string,
): InvoiceStatus {
  if (storedStatus === 'paid') {
    return 'paid';
  }
  if (storedStatus === 'draft') {
    return 'draft';
  }

  // If status is sent or overdue, check date dynamically
  if (isPastDueWib(dueDate, referenceDateWib)) {
    return 'overdue';
  }

  return 'sent';
}

/**
 * Maps internal invoice status to client-facing status on public invoice page (D-43).
 */
export function getClientFacingStatus(
  effectiveStatus: InvoiceStatus,
): ClientFacingStatus {
  if (effectiveStatus === 'paid') {
    return 'paid';
  }
  if (effectiveStatus === 'overdue') {
    return 'overdue';
  }
  return 'unpaid';
}

export interface StatusTransitionResult {
  allowed: boolean;
  error?: string;
}

/**
 * Validates whether a requested status transition is allowed (A-16).
 */
export function validateStatusTransition(
  currentStatus: InvoiceStatus,
  targetStatus: InvoiceStatus,
): StatusTransitionResult {
  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  // An issued invoice can NEVER go back to draft (A-16)
  if (currentStatus !== 'draft' && targetStatus === 'draft') {
    return {
      allowed: false,
      error: 'An issued invoice cannot be reverted to Draft.',
    };
  }

  if (currentStatus === 'draft' && targetStatus === 'sent') {
    return { allowed: true };
  }

  if (currentStatus === 'sent' && targetStatus === 'paid') {
    return { allowed: true };
  }

  if (currentStatus === 'overdue' && targetStatus === 'paid') {
    return { allowed: true };
  }

  if (currentStatus === 'paid' && (targetStatus === 'sent' || targetStatus === 'overdue')) {
    return { allowed: true };
  }

  return {
    allowed: false,
    error: `Invalid status transition from ${currentStatus} to ${targetStatus}.`,
  };
}
