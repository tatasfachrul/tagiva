/**
 * Invoice Numbering Engine (D-13, D-18, D-30, D-42, D-54, D-55, D-56, A-05)
 *
 * Enforces format: INV-[PREFIX]-[YYYY]-[MM]-[XXXX]
 * - PREFIX: 2-6 uppercase alphanumeric characters (^[A-Z0-9]{2,6}$)
 * - YYYY: 4-digit issue year
 * - MM: 2-digit issue month (01-12)
 * - XXXX: 4-digit sequence padded with 0 (or 5+ digits if > 9999)
 * - Drafts always display literally "[DRAFT]"
 */

export const DRAFT_NUMBER_PLACEHOLDER = '[DRAFT]';

export const PREFIX_REGEX = /^[A-Z0-9]{2,6}$/;

export interface PrefixValidationResult {
  valid: boolean;
  normalizedPrefix: string;
  error?: string;
}

/**
 * Validates and normalizes an invoice number prefix according to D-54.
 */
export function validatePrefix(rawPrefix: string): PrefixValidationResult {
  const normalized = (rawPrefix || '').trim().toUpperCase();

  if (normalized.length < 2) {
    return {
      valid: false,
      normalizedPrefix: normalized,
      error: 'Prefix must be at least 2 characters long.',
    };
  }

  if (normalized.length > 6) {
    return {
      valid: false,
      normalizedPrefix: normalized,
      error: 'Prefix cannot exceed 6 characters.',
    };
  }

  if (!PREFIX_REGEX.test(normalized)) {
    return {
      valid: false,
      normalizedPrefix: normalized,
      error: 'Prefix must only contain uppercase letters and numbers (no spaces or special characters).',
    };
  }

  return {
    valid: true,
    normalizedPrefix: normalized,
  };
}

/**
 * Generates a sensible 3-letter uppercase prefix from a user's display name or business name.
 * Falls back to 'USR' if no valid characters exist.
 */
export function generateDefaultPrefix(nameOrBusiness: string = ''): string {
  const cleaned = nameOrBusiness.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (cleaned.length >= 3) {
    return cleaned.slice(0, 3);
  }
  if (cleaned.length === 2) {
    return cleaned;
  }
  return 'USR';
}

/**
 * Formats an issued invoice number (D-13, A-05).
 */
export function formatInvoiceNumber(
  prefix: string,
  year: number,
  month: string | number,
  sequence: number,
): string {
  const normalizedMonth = String(month).padStart(2, '0');
  const sequenceStr = sequence <= 9999 ? String(sequence).padStart(4, '0') : String(sequence);
  return `INV-${prefix.toUpperCase()}-${year}-${normalizedMonth}-${sequenceStr}`;
}

export interface ParsedInvoiceNumber {
  prefix: string;
  year: number;
  month: number;
  sequence: number;
}

/**
 * Parses an issued invoice number into its constituent parts.
 * Returns null if invalid or is a draft placeholder.
 */
export function parseInvoiceNumber(invoiceNumber: string | null | undefined): ParsedInvoiceNumber | null {
  if (!invoiceNumber || invoiceNumber === DRAFT_NUMBER_PLACEHOLDER) {
    return null;
  }

  const match = /^INV-([A-Z0-9]{2,6})-(\d{4})-(0[1-9]|1[0-2])-(\d{4,})$/.exec(invoiceNumber);
  if (!match) {
    return null;
  }

  const prefix = match[1];
  const yearStr = match[2];
  const monthStr = match[3];
  const seqStr = match[4];

  if (!prefix || !yearStr || !monthStr || !seqStr) {
    return null;
  }

  return {
    prefix,
    year: parseInt(yearStr, 10),
    month: parseInt(monthStr, 10),
    sequence: parseInt(seqStr, 10),
  };
}

/**
 * Returns display invoice number for UI / PDF.
 * If status is draft or number is null, returns "[DRAFT]" (D-30, D-42).
 */
export function getDisplayInvoiceNumber(
  invoiceNumber: string | null | undefined,
  status: string,
): string {
  if (status === 'draft' || !invoiceNumber) {
    return DRAFT_NUMBER_PLACEHOLDER;
  }
  return invoiceNumber;
}
