import { describe, it, expect } from 'vitest';
import {
  calculateInvoiceTotals,
  formatCurrency,
  roundToTwoDecimals,
} from '../calculations';

describe('Financial Calculation Engine (NFR-4, D-44, D-45, D-46)', () => {
  it('TC-CALC-01: calculates line items with decimal quantities accurately', () => {
    const result = calculateInvoiceTotals({
      items: [
        { description: 'Design Consultation', quantity: 1.5, unitPrice: 10000000 },
        { description: 'Development', quantity: 2, unitPrice: 5000000 },
      ],
    });

    expect(result.items[0]?.lineTotal).toBe(15000000);
    expect(result.items[1]?.lineTotal).toBe(10000000);
    expect(result.subtotal).toBe(25000000);
    expect(result.discountAmount).toBe(0);
    expect(result.taxableAmount).toBe(25000000);
    expect(result.taxAmount).toBe(0);
    expect(result.totalAmount).toBe(25000000);
  });

  it('TC-CALC-02: avoids IEEE-754 floating-point drift (0.1 + 0.2)', () => {
    const sum = roundToTwoDecimals(0.1 + 0.2);
    expect(sum).toBe(0.3);

    const result = calculateInvoiceTotals({
      items: [
        { description: 'Item A', quantity: 1, unitPrice: 0.1 },
        { description: 'Item B', quantity: 1, unitPrice: 0.2 },
      ],
    });

    expect(result.subtotal).toBe(0.3);
    expect(result.totalAmount).toBe(0.3);
  });

  it('TC-CALC-03: applies percentage discount and PPN 11% tax in correct order (FR-1.6)', () => {
    // subtotal = 25,000,000
    // 10% discount = 2,500,000 -> taxable = 22,500,000
    // 11% PPN tax = 2,475,000
    // total = 24,975,000
    const result = calculateInvoiceTotals({
      items: [{ description: 'Project Phase 1', quantity: 1, unitPrice: 25000000 }],
      discountType: 'percent',
      discountValue: 10,
      taxRate: 11,
    });

    expect(result.subtotal).toBe(25000000);
    expect(result.discountAmount).toBe(2500000);
    expect(result.taxableAmount).toBe(22500000);
    expect(result.taxAmount).toBe(2475000);
    expect(result.totalAmount).toBe(24975000);
  });

  it('TC-CALC-04: clamps fixed discount so total never becomes negative', () => {
    const result = calculateInvoiceTotals({
      items: [{ description: 'Micro service', quantity: 1, unitPrice: 100000 }],
      discountType: 'fixed',
      discountValue: 500000, // exceeds subtotal of 100,000
      taxRate: 11,
    });

    expect(result.subtotal).toBe(100000);
    expect(result.discountAmount).toBe(100000); // clamped to subtotal
    expect(result.taxableAmount).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.totalAmount).toBe(0);
  });

  it('TC-CALC-05: formats currency amounts cleanly for all supported currencies (D-46)', () => {
    expect(formatCurrency(1500000, 'IDR')).toBe('Rp1.500.000');
    expect(formatCurrency(1500.5, 'USD')).toBe('$1,500.50');
    expect(formatCurrency(1500, 'SGD')).toBe('S$1,500.00');
    expect(formatCurrency(1500, 'JPY')).toBe('¥1,500');
  });
});
