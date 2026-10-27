import { describe, it, expect } from 'vitest';
import {
  canChangeStatus,
  canCreateInvoice,
  canDeleteInvoice,
  canEditInvoice,
  canUseProFeature,
  resolveUserPlanState,
  shouldIncludePlatformFooter,
  MAX_FREE_SAVED_INVOICES,
} from '../entitlements';

describe('Entitlements & Plan Policy Engine (D-11, D-12, D-21, D-23, D-28, D-29, D-33, D-40, D-52)', () => {
  const now = new Date('2026-10-27T12:00:00Z');

  describe('resolveUserPlanState (D-52)', () => {
    it('returns "free" when no subscriptions exist', () => {
      expect(resolveUserPlanState([], now)).toBe('free');
    });

    it('returns "pro" when an active subscription has current_period_end in the future', () => {
      expect(
        resolveUserPlanState(
          [
            {
              status: 'active',
              currentPeriodEnd: '2026-11-27T12:00:00Z',
            },
          ],
          now,
        ),
      ).toBe('pro');
    });

    it('returns "pro" during 3-day grace period on past_due subscription (D-52)', () => {
      expect(
        resolveUserPlanState(
          [
            {
              status: 'past_due',
              currentPeriodEnd: '2026-10-26T12:00:00Z', // expired yesterday
              gracePeriodEnd: '2026-10-29T12:00:00Z', // grace ends in 2 days
            },
          ],
          now,
        ),
      ).toBe('pro');
    });

    it('returns "lapsed" when subscription has expired and past grace period (D-23)', () => {
      expect(
        resolveUserPlanState(
          [
            {
              status: 'expired',
              currentPeriodEnd: '2026-10-20T12:00:00Z',
            },
          ],
          now,
        ),
      ).toBe('lapsed');
    });
  });

  describe('canCreateInvoice (TC-ENT-02, TC-ENT-09, D-12, D-33)', () => {
    it('allows Pro users unlimited invoice creation', () => {
      expect(canCreateInvoice('pro', 0)).toBe(true);
      expect(canCreateInvoice('pro', 3)).toBe(true);
      expect(canCreateInvoice('pro', 100)).toBe(true);
    });

    it('TC-ENT-02: allows Free users to create invoices until cap of 3', () => {
      expect(canCreateInvoice('free', 0)).toBe(true);
      expect(canCreateInvoice('free', 2)).toBe(true);
      expect(canCreateInvoice('free', 3)).toBe(false); // hits limit
      expect(canCreateInvoice('free', 4)).toBe(false);
    });

    it('TC-ENT-09: allows Lapsed users with < 3 invoices to create up to cap (D-33)', () => {
      expect(canCreateInvoice('lapsed', 1)).toBe(true);
      expect(canCreateInvoice('lapsed', 2)).toBe(true);
      expect(canCreateInvoice('lapsed', 3)).toBe(false); // blocked at 3
    });
  });

  describe('canEditInvoice (TC-ENT-06, D-23, D-28)', () => {
    it('allows Free and Pro users to edit invoices', () => {
      expect(canEditInvoice('pro')).toBe(true);
      expect(canEditInvoice('free')).toBe(true);
    });

    it('TC-ENT-06: blocks Lapsed users from editing existing invoices (read-only)', () => {
      expect(canEditInvoice('lapsed')).toBe(false);
    });
  });

  describe('canDeleteInvoice (TC-ENT-03, TC-ENT-04, D-21, D-28, D-29, A-12)', () => {
    it('allows Pro users to delete invoices of any status (A-12)', () => {
      expect(canDeleteInvoice('pro', 'draft')).toBe(true);
      expect(canDeleteInvoice('pro', 'sent')).toBe(true);
      expect(canDeleteInvoice('pro', 'overdue')).toBe(true);
      expect(canDeleteInvoice('pro', 'paid')).toBe(true);
    });

    it('TC-ENT-03 & TC-ENT-04: allows Free users to delete ONLY drafts', () => {
      expect(canDeleteInvoice('free', 'draft')).toBe(true);
      expect(canDeleteInvoice('free', 'sent')).toBe(false);
      expect(canDeleteInvoice('free', 'overdue')).toBe(false);
      expect(canDeleteInvoice('free', 'paid')).toBe(false);
    });

    it('blocks Lapsed users from deleting existing invoices (D-28)', () => {
      expect(canDeleteInvoice('lapsed', 'draft')).toBe(false);
      expect(canDeleteInvoice('lapsed', 'sent')).toBe(false);
      expect(canDeleteInvoice('lapsed', 'paid')).toBe(false);
    });
  });

  describe('canChangeStatus (TC-ENT-07, TC-ENT-08, D-28, A-18)', () => {
    it('TC-ENT-07: allows Lapsed users ONLY to mark sent/overdue invoices as paid', () => {
      expect(canChangeStatus('lapsed', 'sent', 'paid').allowed).toBe(true);
      expect(canChangeStatus('lapsed', 'overdue', 'paid').allowed).toBe(true);

      // TC-ENT-08: all other transitions blocked for Lapsed
      expect(canChangeStatus('lapsed', 'paid', 'sent').allowed).toBe(false);
      expect(canChangeStatus('lapsed', 'sent', 'draft').allowed).toBe(false);
    });

    it('allows Free and Pro to transition between valid statuses', () => {
      expect(canChangeStatus('free', 'draft', 'sent').allowed).toBe(true);
      expect(canChangeStatus('free', 'sent', 'paid').allowed).toBe(true);
      expect(canChangeStatus('pro', 'sent', 'paid').allowed).toBe(true);
    });
  });

  describe('canUseProFeature (TC-ENT-05, D-04, D-11)', () => {
    it('allows only active Pro users to use Pro features', () => {
      expect(canUseProFeature('pro')).toBe(true);
      expect(canUseProFeature('free')).toBe(false);
      expect(canUseProFeature('lapsed')).toBe(false);
    });
  });

  describe('shouldIncludePlatformFooter (TC-ENT-10, FR-7.3, D-28, D-40)', () => {
    it('omits platform footer only for Pro users', () => {
      expect(shouldIncludePlatformFooter('pro')).toBe(false);
      expect(shouldIncludePlatformFooter('free')).toBe(true);
      expect(shouldIncludePlatformFooter('lapsed')).toBe(true);
    });
  });

  it('verifies MAX_FREE_SAVED_INVOICES constant is 3 (D-12)', () => {
    expect(MAX_FREE_SAVED_INVOICES).toBe(3);
  });
});
