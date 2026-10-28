/**
 * Tagiva - Invoice Template Type Definitions
 *
 * Defines the canonical render interface for invoice templates across
 * Web Preview (HTML/Tailwind) and PDF Engine (@react-pdf/renderer).
 *
 * Implements:
 * - DESIGN_SYSTEM.md Section 7
 * - PRD.md D-03, D-11, D-17, D-27, D-28, D-30, D-36, D-40-D-43
 */

import type { SupportedCurrency } from '@/lib/domain/calculations';
import type { InvoiceStatus } from '@/lib/domain/status';
import type { InvoiceLanguage } from '@/lib/i18n/invoice-dictionary';

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoicePaymentInstructions {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface InvoiceTemplateData {
  id?: string;
  invoiceNumber: string | null;
  status: InvoiceStatus;
  language: InvoiceLanguage;
  currency: SupportedCurrency;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  senderAddress?: string;
  senderTaxId?: string;
  logoUrl?: string | null;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientAddress?: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  taxLabel?: string;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  notes?: string;
  paymentInstructions?: InvoicePaymentInstructions | null;
}

export interface InvoiceRenderProps {
  invoice: InvoiceTemplateData;
  showFooter?: boolean; // true for Free & Lapsed (D-40), false for Pro
  className?: string;
}

/**
 * Normalizes loose or snake_case invoice data (such as direct Supabase rows)
 * into a type-safe InvoiceTemplateData structure.
 */
export function normalizeInvoiceData(raw: Record<string, unknown>): InvoiceTemplateData {
  const itemsRaw = (raw.items ?? raw.invoice_items ?? []) as Array<Record<string, unknown>>;
  const items: InvoiceLineItem[] = itemsRaw.map((item) => ({
    id: typeof item.id === 'string' ? item.id : undefined,
    description: String(item.description ?? ''),
    quantity: Number(item.quantity ?? item.qty ?? 1),
    unitPrice: Number(item.unitPrice ?? item.unit_price ?? 0),
    lineTotal: Number(item.lineTotal ?? item.line_total ?? 0),
  }));

  // Parse payment instructions if string or object
  let paymentInstructions: InvoicePaymentInstructions | null = null;
  const rawPI = raw.paymentInstructions ?? raw.payment_instructions;
  if (rawPI && typeof rawPI === 'object') {
    const pi = rawPI as Record<string, unknown>;
    paymentInstructions = {
      bankName: String(pi.bankName ?? pi.bank_name ?? ''),
      accountNumber: String(pi.accountNumber ?? pi.account_number ?? ''),
      accountHolder: String(pi.accountHolder ?? pi.account_holder ?? ''),
      notes: typeof pi.notes === 'string' ? pi.notes : '',
    };
  } else if (typeof rawPI === 'string') {
    try {
      const parsed = JSON.parse(rawPI);
      paymentInstructions = {
        bankName: parsed.bankName ?? parsed.bank_name ?? '',
        accountNumber: parsed.accountNumber ?? parsed.account_number ?? '',
        accountHolder: parsed.accountHolder ?? parsed.account_holder ?? '',
        notes: parsed.notes ?? '',
      };
    } catch {
      // Ignore invalid JSON string
    }
  }

  return {
    id: typeof raw.id === 'string' ? raw.id : undefined,
    invoiceNumber: (raw.invoiceNumber ?? raw.invoice_number ?? null) as string | null,
    status: (raw.status ?? 'draft') as InvoiceStatus,
    language: (raw.language ?? 'en') as InvoiceLanguage,
    currency: (raw.currency ?? 'IDR') as SupportedCurrency,
    issueDate: String(raw.issueDate ?? raw.issue_date ?? ''),
    dueDate: String(raw.dueDate ?? raw.due_date ?? ''),
    senderName: String(raw.senderName ?? raw.sender_name ?? ''),
    senderEmail: raw.senderEmail !== undefined ? String(raw.senderEmail) : raw.sender_email !== undefined ? String(raw.sender_email) : '',
    senderPhone: raw.senderPhone !== undefined ? String(raw.senderPhone) : raw.sender_phone !== undefined ? String(raw.sender_phone) : '',
    senderAddress: raw.senderAddress !== undefined ? String(raw.senderAddress) : raw.sender_address !== undefined ? String(raw.sender_address) : '',
    senderTaxId: raw.senderTaxId !== undefined ? String(raw.senderTaxId) : raw.sender_tax_id !== undefined ? String(raw.sender_tax_id) : '',
    logoUrl: (raw.logoUrl ?? raw.logo_url ?? null) as string | null,
    clientName: String(raw.clientName ?? raw.client_name ?? ''),
    clientCompany: raw.clientCompany !== undefined ? String(raw.clientCompany) : raw.client_company !== undefined ? String(raw.client_company) : '',
    clientEmail: raw.clientEmail !== undefined ? String(raw.clientEmail) : raw.client_email !== undefined ? String(raw.client_email) : '',
    clientAddress: raw.clientAddress !== undefined ? String(raw.clientAddress) : raw.client_address !== undefined ? String(raw.client_address) : '',
    items,
    subtotal: Number(raw.subtotal ?? 0),
    discountType: (raw.discountType ?? raw.discount_type ?? 'percent') as 'percent' | 'fixed',
    discountValue: Number(raw.discountValue ?? raw.discount_value ?? 0),
    discountAmount: Number(raw.discountAmount ?? raw.discount_amount ?? 0),
    taxLabel: String(raw.taxLabel ?? raw.tax_label ?? 'PPN'),
    taxRate: Number(raw.taxRate ?? raw.tax_rate ?? 0),
    taxAmount: Number(raw.taxAmount ?? raw.tax_amount ?? 0),
    totalAmount: Number(raw.totalAmount ?? raw.total_amount ?? 0),
    notes: String(raw.notes ?? ''),
    paymentInstructions,
  };
}
