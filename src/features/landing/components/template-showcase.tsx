import React from 'react';
import { ModernMinimalistWebPreview } from '@/components/invoice-templates';
import type { InvoiceTemplateData } from '@/components/invoice-templates';

const SAMPLE_INVOICE: InvoiceTemplateData = {
  id: 'sample-inv',
  invoiceNumber: 'INV-TAG-2026-10-0001',
  status: 'sent',
  language: 'en',
  currency: 'IDR',
  issueDate: '2026-10-28',
  dueDate: '2026-11-11',
  senderName: 'Studio Nusantara Creatives',
  senderEmail: 'hello@nusantaracreatives.id',
  senderPhone: '+62 812 3456 7890',
  senderAddress: 'Sudirman Central Business District (SCBD)\nJakarta Selatan 12190',
  clientName: 'Sarah Jenkins',
  clientCompany: 'Aura Fintech Asia',
  clientEmail: 'billing@aurafintech.com',
  clientAddress: 'Senopati Suites Tower 2\nJakarta Selatan 12190',
  items: [
    {
      id: 'item-1',
      description: 'Brand Identity Strategy & Design System',
      quantity: 1,
      unitPrice: 18000000,
      lineTotal: 18000000,
    },
    {
      id: 'item-2',
      description: 'Mobile App High-Fidelity Figma Prototypes (iOS/Android)',
      quantity: 1,
      unitPrice: 12000000,
      lineTotal: 12000000,
    },
  ],
  subtotal: 30000000,
  discountType: 'percent',
  discountValue: 0,
  discountAmount: 0,
  taxLabel: 'PPN',
  taxRate: 11,
  taxAmount: 3300000,
  totalAmount: 33300000,
  paymentInstructions: {
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '8880192837',
    accountHolder: 'Studio Nusantara Creatives',
    notes: 'Please include invoice number in payment description.',
  },
  notes: 'Payment is due within 14 calendar days. Thank you for your partnership!',
};

export function TemplateShowcase() {
  return (
    <section id="sample" className="py-20 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading mb-2 block">
            Signature A4 Layout
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            The Modern Minimalist Template
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            A single, razor-sharp design that commands respect. Pure Inter typography, tabular figures, and balanced whitespace.
          </p>
        </div>

        {/* Invoice Container */}
        <div className="relative mx-auto max-w-[760px] rounded-xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden">
          <ModernMinimalistWebPreview invoice={SAMPLE_INVOICE} showFooter={false} />
        </div>
      </div>
    </section>
  );
}
