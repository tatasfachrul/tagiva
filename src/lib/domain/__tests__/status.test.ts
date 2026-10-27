import { describe, it, expect } from 'vitest';
import {
  getClientFacingStatus,
  resolveEffectiveInvoiceStatus,
  validateStatusTransition,
} from '../status';

describe('Invoice Status Rules (D-15, D-43, A-16)', () => {
  it('resolves effective status correctly dynamically based on WIB date', () => {
    const today = '2026-10-27';

    // Draft is always draft regardless of due date
    expect(resolveEffectiveInvoiceStatus('draft', '2026-10-20', today)).toBe('draft');

    // Paid is always paid
    expect(resolveEffectiveInvoiceStatus('paid', '2026-10-20', today)).toBe('paid');

    // Sent past due -> overdue
    expect(resolveEffectiveInvoiceStatus('sent', '2026-10-25', today)).toBe('overdue');

    // Sent not past due -> sent
    expect(resolveEffectiveInvoiceStatus('sent', '2026-10-29', today)).toBe('sent');
  });

  it('maps to client-facing status on public link (D-43)', () => {
    expect(getClientFacingStatus('draft')).toBe('unpaid');
    expect(getClientFacingStatus('sent')).toBe('unpaid');
    expect(getClientFacingStatus('paid')).toBe('paid');
    expect(getClientFacingStatus('overdue')).toBe('overdue');
  });

  it('validates status transitions and blocks reverting to draft (A-16)', () => {
    expect(validateStatusTransition('draft', 'sent').allowed).toBe(true);
    expect(validateStatusTransition('sent', 'paid').allowed).toBe(true);
    expect(validateStatusTransition('paid', 'sent').allowed).toBe(true);
    expect(validateStatusTransition('overdue', 'paid').allowed).toBe(true);

    // Issued invoice can NEVER revert to draft (A-16)
    const revertSent = validateStatusTransition('sent', 'draft');
    expect(revertSent.allowed).toBe(false);
    expect(revertSent.error).toContain('cannot be reverted to Draft');

    const revertPaid = validateStatusTransition('paid', 'draft');
    expect(revertPaid.allowed).toBe(false);
  });
});
