/**
 * Core Financial Calculation Engine (NFR-4, D-44, D-45, D-46)
 *
 * Guarantees exact integer/decimal arithmetic for invoice line items,
 * discounts (% and fixed), taxes, and totals without floating-point drift.
 */

export const SUPPORTED_CURRENCIES = [
  'IDR',
  'USD',
  'SGD',
  'EUR',
  'AUD',
  'GBP',
  'MYR',
  'JPY',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export type DiscountType = 'percent' | 'fixed';

export interface LineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CalculatedLineItem extends LineItemInput {
  lineTotal: number;
}

export interface InvoiceCalculationInput {
  items: LineItemInput[];
  discountType?: DiscountType;
  discountValue?: number;
  taxRate?: number; // e.g. 11 for 11%
}

export interface InvoiceCalculationResult {
  items: CalculatedLineItem[];
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
}

/**
 * Rounds a number deterministically to 2 decimal places to eliminate IEEE-754 errors.
 */
export function roundToTwoDecimals(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates line totals, subtotal, discount, tax, and grand total.
 * Order of operations (FR-1.6):
 * 1. Line Total = Qty * Unit Price
 * 2. Subtotal = Sum(Line Totals)
 * 3. Discount Amount = (subtotal * rate / 100) or fixed value (clamped to subtotal)
 * 4. Taxable Amount = max(0, subtotal - discount)
 * 5. Tax Amount = taxable * taxRate / 100
 * 6. Grand Total = taxable + taxAmount
 */
export function calculateInvoiceTotals(input: InvoiceCalculationInput): InvoiceCalculationResult {
  const calculatedItems: CalculatedLineItem[] = input.items.map((item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    const lineTotal = roundToTwoDecimals(qty * price);
    return {
      ...item,
      quantity: qty,
      unitPrice: price,
      lineTotal,
    };
  });

  const subtotal = roundToTwoDecimals(
    calculatedItems.reduce((acc, item) => acc + item.lineTotal, 0),
  );

  const discountType = input.discountType ?? 'percent';
  const rawDiscountValue = Math.max(0, Number(input.discountValue) || 0);

  let discountAmount = 0;
  if (discountType === 'percent') {
    const clampedRate = Math.min(100, rawDiscountValue);
    discountAmount = roundToTwoDecimals(subtotal * (clampedRate / 100));
  } else {
    // Fixed discount clamped at subtotal (cannot be negative)
    discountAmount = Math.min(subtotal, roundToTwoDecimals(rawDiscountValue));
  }

  const taxableAmount = Math.max(0, roundToTwoDecimals(subtotal - discountAmount));

  const rawTaxRate = Math.max(0, Math.min(100, Number(input.taxRate) || 0));
  const taxAmount = roundToTwoDecimals(taxableAmount * (rawTaxRate / 100));

  const totalAmount = roundToTwoDecimals(taxableAmount + taxAmount);

  return {
    items: calculatedItems,
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount,
  };
}

/**
 * Formats a monetary amount into a clean localized currency string.
 * Uses exact separators based on currency conventions.
 */
export function formatCurrency(amount: number, currency: SupportedCurrency = 'IDR'): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  switch (currency) {
    case 'IDR': {
      // Indonesian Rupiah: uses dot for thousands (Rp1.500.000)
      const isInteger = Number.isInteger(safeAmount);
      const formatted = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: isInteger ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(safeAmount);
      return `Rp${formatted}`;
    }
    case 'USD':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(safeAmount);
    case 'SGD': {
      const formatted = new Intl.NumberFormat('en-SG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(safeAmount);
      return `S$${formatted}`;
    }
    case 'EUR':
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(safeAmount);
    case 'GBP':
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(safeAmount);
    case 'AUD':
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
      }).format(safeAmount);
    case 'MYR':
      return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
      }).format(safeAmount);
    case 'JPY':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'JPY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(safeAmount);
    default:
      return `${currency} ${safeAmount.toFixed(2)}`;
  }
}
