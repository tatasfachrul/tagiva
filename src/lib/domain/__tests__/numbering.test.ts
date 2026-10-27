import { describe, it, expect } from 'vitest';
import {
  formatInvoiceNumber,
  generateDefaultPrefix,
  getDisplayInvoiceNumber,
  parseInvoiceNumber,
  validatePrefix,
  DRAFT_NUMBER_PLACEHOLDER,
} from '../numbering';

describe('Invoice Numbering Engine (D-13, D-18, D-30, D-42, D-54, D-55, D-56)', () => {
  it('TC-NUM-01: renders [DRAFT] for draft status or null numbers', () => {
    expect(getDisplayInvoiceNumber(null, 'draft')).toBe(DRAFT_NUMBER_PLACEHOLDER);
    expect(getDisplayInvoiceNumber('INV-ACM-2026-10-0001', 'draft')).toBe(DRAFT_NUMBER_PLACEHOLDER);
    expect(getDisplayInvoiceNumber(null, 'sent')).toBe(DRAFT_NUMBER_PLACEHOLDER);
    expect(getDisplayInvoiceNumber('INV-ACM-2026-10-0001', 'sent')).toBe('INV-ACM-2026-10-0001');
  });

  it('TC-NUM-03: formats number consecutively across prefix changes (D-18)', () => {
    const inv1 = formatInvoiceNumber('ACM', 2026, 11, 1);
    expect(inv1).toBe('INV-ACM-2026-11-0001');

    // User changes prefix to ACME in Dec 2026, sequence carries on to 2
    const inv2 = formatInvoiceNumber('ACME', 2026, 12, 2);
    expect(inv2).toBe('INV-ACME-2026-12-0002');
  });

  it('TC-NUM-04: formats number across months in the same year (D-13)', () => {
    const nov = formatInvoiceNumber('ACM', 2026, 11, 1);
    const dec = formatInvoiceNumber('ACM', 2026, 12, 2);

    expect(nov).toBe('INV-ACM-2026-11-0001');
    expect(dec).toBe('INV-ACM-2026-12-0002');
  });

  it('TC-NUM-05: handles sequence reset in new year (D-13, D-56)', () => {
    const inv2026 = formatInvoiceNumber('ACME', 2026, 12, 3);
    const inv2027 = formatInvoiceNumber('ACME', 2027, 1, 1);

    expect(inv2026).toBe('INV-ACME-2026-12-0003');
    expect(inv2027).toBe('INV-ACME-2027-01-0001');
  });

  it('TC-NUM-06: expands to 5+ digits if sequence exceeds 9999 (A-05)', () => {
    const highSeq = formatInvoiceNumber('ACM', 2026, 12, 10000);
    expect(highSeq).toBe('INV-ACM-2026-12-10000');
  });

  it('TC-NUM-07: validates prefix constraints strictly (D-54)', () => {
    expect(validatePrefix('ACM').valid).toBe(true);
    expect(validatePrefix('USR123').valid).toBe(true);
    expect(validatePrefix('AB').valid).toBe(true);

    // Rejections
    expect(validatePrefix('A').valid).toBe(false); // too short (< 2)
    expect(validatePrefix('TOOLONG1').valid).toBe(false); // too long (> 6)
    expect(validatePrefix('AC-M').valid).toBe(false); // hyphen forbidden
    expect(validatePrefix('AC M').valid).toBe(false); // space forbidden

    // Normalization to uppercase
    expect(validatePrefix('acm').normalizedPrefix).toBe('ACM');
  });

  it('generates default 3-letter prefix from business/user name', () => {
    expect(generateDefaultPrefix('Tatas Fachrul')).toBe('TAT');
    expect(generateDefaultPrefix('Acme Studio')).toBe('ACM');
    expect(generateDefaultPrefix('Go')).toBe('GO');
    expect(generateDefaultPrefix('---')).toBe('USR');
  });

  it('parses valid invoice numbers and rejects invalid ones', () => {
    const parsed = parseInvoiceNumber('INV-ACM-2026-11-0001');
    expect(parsed).toEqual({
      prefix: 'ACM',
      year: 2026,
      month: 11,
      sequence: 1,
    });

    expect(parseInvoiceNumber('[DRAFT]')).toBeNull();
    expect(parseInvoiceNumber('INVALID-NUMBER')).toBeNull();
  });
});
