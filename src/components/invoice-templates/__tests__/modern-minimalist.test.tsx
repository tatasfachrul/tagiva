/**
 * Tagiva - Invoice Template & PDF Engine Test Suite
 *
 * Verifies:
 * - D-30, D-42: Literal [DRAFT] rendering when invoice is a draft or unnumbered
 * - D-17: EN and ID bilingual labels
 * - D-27: Retained logo rendering
 * - D-40, FR-7.3: Pro vs. Free/Lapsed footer rules
 * - D-49: SSRF prevention on logo_url in PDF engine
 * - PDF buffer generation with @react-pdf/renderer
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  ModernMinimalistWebPreview,
  normalizeInvoiceData,
  type InvoiceTemplateData,
} from '../index';
import { renderInvoicePdfToBuffer } from '../modern-minimalist/pdf-document';
import { validateSupabaseLogoUrl } from '@/lib/security/ssrf';

const BASE_INVOICE: InvoiceTemplateData = {
  invoiceNumber: null,
  status: 'draft',
  language: 'en',
  currency: 'IDR',
  issueDate: '2026-10-28',
  dueDate: '2026-11-11',
  senderName: 'Studio Tagiva',
  senderEmail: 'hello@tagiva.com',
  senderPhone: '+6281234567890',
  senderAddress: 'Jl. Sudirman No. 10, Jakarta Selatan',
  senderTaxId: '01.234.567.8-901.000',
  logoUrl: null,
  clientName: 'PT Klien Utama',
  clientCompany: 'Klien Digital Group',
  clientEmail: 'finance@klienutama.co.id',
  clientAddress: 'Jl. Thamrin No. 5, Jakarta Pusat',
  items: [
    {
      description: 'Web Design & Branding Phase 1',
      quantity: 1,
      unitPrice: 15000000,
      lineTotal: 15000000,
    },
    {
      description: 'Design System & Figma Tokens',
      quantity: 2,
      unitPrice: 5000000,
      lineTotal: 10000000,
    },
  ],
  subtotal: 25000000,
  discountType: 'percent',
  discountValue: 10,
  discountAmount: 2500000,
  taxLabel: 'PPN',
  taxRate: 11,
  taxAmount: 2475000,
  totalAmount: 24975000,
  notes: 'Payment due within 14 days. Thank you for your partnership.',
  paymentInstructions: {
    bankName: 'BCA',
    accountNumber: '8830123456',
    accountHolder: 'Studio Tagiva PT',
    notes: 'Please include invoice number in payment description',
  },
};

describe('Invoice Template — Modern Minimalist Web Preview', () => {
  it('renders literal [DRAFT] placeholder when invoice is in draft status (D-30, D-42)', () => {
    const html = renderToString(
      React.createElement(ModernMinimalistWebPreview, {
        invoice: { ...BASE_INVOICE, status: 'draft', invoiceNumber: null },
      }),
    );

    expect(html).toContain('[DRAFT]');
    expect(html).toContain('DRAFT');
    expect(html).not.toContain('INV-');
  });

  it('renders literal [DRAFT] in Bahasa Indonesia mode as well (D-42)', () => {
    const html = renderToString(
      React.createElement(ModernMinimalistWebPreview, {
        invoice: { ...BASE_INVOICE, language: 'id', status: 'draft', invoiceNumber: null },
      }),
    );

    expect(html).toContain('FAKTUR');
    expect(html).toContain('[DRAFT]');
    expect(html).toContain('Ditagihkan Kepada');
    expect(html).toContain('Tanggal Terbit');
    expect(html).toContain('Jatuh Tempo');
    expect(html).toContain('Deskripsi');
    expect(html).toContain('Jml');
    expect(html).toContain('Harga Satuan');
    expect(html).toContain('Jumlah');
    expect(html).toContain('Total Tagihan');
  });

  it('renders issued invoice number and status badge when invoice is issued', () => {
    const issuedInvoice: InvoiceTemplateData = {
      ...BASE_INVOICE,
      status: 'sent',
      invoiceNumber: 'INV-TAG-2026-10-0001',
    };

    const html = renderToString(
      React.createElement(ModernMinimalistWebPreview, {
        invoice: issuedInvoice,
      }),
    );

    expect(html).toContain('INV-TAG-2026-10-0001');
    expect(html).toContain('UNPAID');
    expect(html).not.toContain('[DRAFT]');
  });

  it('renders PAID badge for paid status in EN and LUNAS in ID (D-43)', () => {
    const paidEn = renderToString(
      React.createElement(ModernMinimalistWebPreview, {
        invoice: {
          ...BASE_INVOICE,
          status: 'paid',
          invoiceNumber: 'INV-TAG-2026-10-0001',
          language: 'en',
        },
      }),
    );
    expect(paidEn).toContain('PAID');

    const paidId = renderToString(
      React.createElement(ModernMinimalistWebPreview, {
        invoice: {
          ...BASE_INVOICE,
          status: 'paid',
          invoiceNumber: 'INV-TAG-2026-10-0001',
          language: 'id',
        },
      }),
    );
    expect(paidId).toContain('LUNAS');
  });

  it('renders OVERDUE badge for overdue status in EN and JATUH TEMPO in ID (D-43)', () => {
    const overdueEn = renderToString(
      React.createElement(ModernMinimalistWebPreview, {
        invoice: {
          ...BASE_INVOICE,
          status: 'overdue',
          invoiceNumber: 'INV-TAG-2026-10-0001',
          language: 'en',
        },
      }),
    );
    expect(overdueEn).toContain('OVERDUE');

    const overdueId = renderToString(
      React.createElement(ModernMinimalistWebPreview, {
        invoice: {
          ...BASE_INVOICE,
          status: 'overdue',
          invoiceNumber: 'INV-TAG-2026-10-0001',
          language: 'id',
        },
      }),
    );
    expect(overdueId).toContain('JATUH TEMPO');
  });

  it('renders platform footer on Free & Lapsed tiers (showFooter = true) (D-40, FR-7.3)', () => {
    const htmlEn = renderToString(
      React.createElement(ModernMinimalistWebPreview, {
        invoice: BASE_INVOICE,
        showFooter: true,
      }),
    );
    expect(htmlEn).toContain('Made with Tagiva • tagiva.com');

    const htmlId = renderToString(
      React.createElement(ModernMinimalistWebPreview, {
        invoice: { ...BASE_INVOICE, language: 'id' },
        showFooter: true,
      }),
    );
    expect(htmlId).toContain('Dibuat dengan Tagiva • tagiva.com');
  });

  it('omits platform footer for Pro users (showFooter = false) (D-11)', () => {
    const html = renderToString(
      React.createElement(ModernMinimalistWebPreview, {
        invoice: BASE_INVOICE,
        showFooter: false,
      }),
    );
    expect(html).not.toContain('Made with Tagiva • tagiva.com');
    expect(html).not.toContain('Dibuat dengan Tagiva • tagiva.com');
  });

  it('renders retained logo on Lapsed invoices when logoUrl is present (D-27)', () => {
    const logoUrl = 'https://demo.supabase.co/storage/v1/object/public/business-logos/user-123/logo.png';
    const html = renderToString(
      React.createElement(ModernMinimalistWebPreview, {
        invoice: { ...BASE_INVOICE, logoUrl },
      }),
    );
    expect(html).toContain(logoUrl);
  });
});

describe('SSRF Prevention for PDF Engine (D-49, SECURITY.md Section 5)', () => {
  it('accepts valid Supabase storage business-logos URLs', () => {
    const validUrl = 'https://xyzproject.supabase.co/storage/v1/object/public/business-logos/user123/logo.png';
    expect(validateSupabaseLogoUrl(validUrl)).toBe(validUrl);
  });

  it('rejects external image URLs (SSRF attempt)', () => {
    expect(validateSupabaseLogoUrl('https://evil.com/attacker.png')).toBeNull();
    expect(validateSupabaseLogoUrl('http://169.254.169.254/latest/meta-data/')).toBeNull();
    expect(validateSupabaseLogoUrl('https://google.com/logo.png')).toBeNull();
    expect(validateSupabaseLogoUrl('file:///etc/passwd')).toBeNull();
    expect(validateSupabaseLogoUrl('javascript:alert(1)')).toBeNull();
  });

  it('rejects URLs outside the business-logos bucket', () => {
    expect(validateSupabaseLogoUrl('https://xyzproject.supabase.co/storage/v1/object/public/private-invoices/secret.pdf')).toBeNull();
    expect(validateSupabaseLogoUrl('https://xyzproject.supabase.co/storage/v1/object/public/business-logos/../other/image.png')).toBeNull();
  });

  it('handles null, undefined, and empty string safely', () => {
    expect(validateSupabaseLogoUrl(null)).toBeNull();
    expect(validateSupabaseLogoUrl(undefined)).toBeNull();
    expect(validateSupabaseLogoUrl('')).toBeNull();
    expect(validateSupabaseLogoUrl('   ')).toBeNull();
  });
});

describe('Data Normalization Helper', () => {
  it('normalizes snake_case Supabase rows to InvoiceTemplateData', () => {
    const rawDbRow = {
      id: 'inv-uuid-1',
      invoice_number: 'INV-ACM-2026-10-0005',
      status: 'paid',
      language: 'id',
      currency: 'IDR',
      issue_date: '2026-10-25',
      due_date: '2026-11-08',
      sender_name: 'PT Acme Indonesia',
      client_name: 'PT Mitra Jaya',
      subtotal: 1000000,
      total_amount: 1000000,
      invoice_items: [
        {
          id: 'item-1',
          description: 'Consulting Service',
          quantity: 1,
          unit_price: 1000000,
          line_total: 1000000,
        },
      ],
      payment_instructions: {
        bank_name: 'Mandiri',
        account_number: '1234567890',
        account_holder: 'PT Acme Indonesia',
      },
    };

    const normalized = normalizeInvoiceData(rawDbRow);
    expect(normalized.invoiceNumber).toBe('INV-ACM-2026-10-0005');
    expect(normalized.status).toBe('paid');
    expect(normalized.language).toBe('id');
    expect(normalized.items.length).toBe(1);
    expect(normalized.items[0]?.description).toBe('Consulting Service');
    expect(normalized.paymentInstructions?.bankName).toBe('Mandiri');
  });
});

describe('@react-pdf/renderer Engine (D-49)', () => {
  it('generates a valid A4 PDF buffer using Inter font', async () => {
    const buffer = await renderInvoicePdfToBuffer(BASE_INVOICE, true);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);

    // PDF files begin with magic header %PDF-
    const header = buffer.subarray(0, 5).toString('ascii');
    expect(header).toBe('%PDF-');
  });

  it('generates a valid PDF buffer without platform footer for Pro users', async () => {
    const buffer = await renderInvoicePdfToBuffer(
      {
        ...BASE_INVOICE,
        status: 'sent',
        invoiceNumber: 'INV-TAG-2026-10-0002',
      },
      false,
    );

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  });
});
