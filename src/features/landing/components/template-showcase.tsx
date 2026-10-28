'use client';

/**
 * Tagiva - Bilingual Template & Plan Entitlement Showcase (D-03, D-17, D-36, D-41, PRD Section 4.2)
 *
 * Implements:
 * - Interactive inspection of the single MVP template ("Modern Minimalist", D-03, D-36)
 *   across English (INVOICE) and Bahasa Indonesia (FAKTUR) dictionaries (DESIGN_SYSTEM.md Section 7.4),
 *   Draft ([DRAFT]) vs Issued (INV-ACM-2026-11-0001), and Free/Lapsed vs Pro platform footer.
 * - Full 4-role Entitlement Matrix (Visitor, Free, Pro, Lapsed) pulled directly from PRD.md Section 4.2.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ModernMinimalistWebPreview, type InvoiceTemplateData } from '@/components/invoice-templates';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles } from 'lucide-react';
import type { InvoiceLanguage } from '@/lib/i18n/invoice-dictionary';
import type { InvoiceStatus } from '@/lib/domain/status';

const ENTITLEMENT_MATRIX = [
  {
    capability: 'Create / preview a new invoice',
    visitor: 'Forced to sign in (D-31)',
    free: 'Up to 3 in total (D-12)',
    pro: 'Unlimited',
    lapsed: 'Only if total < 3 (D-33)',
  },
  {
    capability: 'Edit existing invoices',
    visitor: '—',
    free: 'Yes',
    pro: 'Yes',
    lapsed: 'Read-only (D-23, D-28)',
  },
  {
    capability: 'Change status on existing invoices',
    visitor: '—',
    free: 'Sent ↔ Paid',
    pro: 'Sent ↔ Paid',
    lapsed: 'Only Sent/Overdue → Paid (D-28)',
  },
  {
    capability: 'Delete invoices',
    visitor: '—',
    free: 'Only Draft (restores 1 slot, D-21, D-29)',
    pro: 'Any status (A-12)',
    lapsed: 'Not allowed',
  },
  {
    capability: 'Download A4 PDF (@react-pdf/renderer)',
    visitor: '—',
    free: 'With platform footer',
    pro: 'No platform footer',
    lapsed: 'With platform footer (D-28)',
  },
  {
    capability: 'Custom invoice prefix (INV-[PREFIX]-YYYY-MM-XXXX)',
    visitor: '—',
    free: 'Yes (2–6 chars, D-39)',
    pro: 'Yes (2–6 chars, D-39)',
    lapsed: 'Yes',
  },
  {
    capability: 'Upload custom business logo (PNG/JPG/WEBP ≤ 2 MB)',
    visitor: '—',
    free: 'Pro only',
    pro: 'Yes (magic-byte validated)',
    lapsed: 'Kept on existing invoices (D-27)',
  },
  {
    capability: 'Public shareable client link (/i/[token])',
    visitor: '—',
    free: 'Pro only',
    pro: 'Yes (144-bit token)',
    lapsed: 'Existing links stay viewable with footer (D-40)',
  },
  {
    capability: 'Send invoice by email from app (Resend)',
    visitor: '—',
    free: 'Pro only',
    pro: 'Up to 50/day/account, 5/day/invoice (D-57)',
    lapsed: 'Pro only',
  },
];

export function TemplateShowcase() {
  const [language, setLanguage] = useState<InvoiceLanguage>('en');
  const [status, setStatus] = useState<InvoiceStatus>('sent');
  const [planTier, setPlanTier] = useState<'pro' | 'free'>('pro');

  // Exact sample data from DESIGN_SYSTEM.md Section 7.2
  const sampleInvoice: InvoiceTemplateData = useMemo(() => {
    return {
      id: 'spec-sample-inv',
      invoiceNumber: status === 'draft' ? null : 'INV-ACM-2026-11-0001',
      status,
      language,
      currency: 'IDR',
      issueDate: '2026-10-27',
      dueDate: '2026-11-10',
      senderName: 'Acme Studio Jakarta',
      senderEmail: 'billing@acmestudio.co.id',
      senderPhone: '+62 21 555 0199',
      senderAddress: 'Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan',
      senderTaxId: '01.234.567.8-012.000',
      clientName: 'PT Contoh',
      clientCompany: 'PT Contoh Indonesia',
      clientEmail: 'finance@contoh.co.id',
      clientAddress: 'Kawasan Mega Kuningan, Jakarta Selatan',
      items: [
        {
          id: 'item-1',
          description: 'UI/UX Design Phase 1',
          quantity: 1,
          unitPrice: 10000000,
          lineTotal: 10000000,
        },
        {
          id: 'item-2',
          description: 'Frontend Implementation',
          quantity: 1,
          unitPrice: 15000000,
          lineTotal: 15000000,
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
      paymentInstructions: {
        bankName: 'BCA',
        accountNumber: '1234567890',
        accountHolder: 'PT Contoh',
        notes: 'Payment due within 14 days. Thank you for your business.',
      },
      notes: 'Payment due within 14 days. Thank you for your business.',
    };
  }, [language, status]);

  return (
    <section id="sample" className="py-16 sm:py-20 bg-background border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col gap-16">
        {/* Part 1: Interactive Single MVP Invoice Template Inspector */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                The Single MVP Invoice Template (&ldquo;Modern Minimalist&rdquo;)
              </h2>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                1:1 visual parity between the on-screen preview, the public link (<code className="font-mono text-xs">/i/[token]</code>), and the exported A4 PDF (D-03, D-36, D-41). Built with <code className="font-mono text-xs">Inter</code> exclusively and <code className="font-mono text-xs">tabular-nums</code>.
              </p>
            </div>

            {/* Interactive State Controls */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-xl border border-border shadow-2xs">
              {/* Language Toggle */}
              <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  aria-pressed={language === 'en'}
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    language === 'en'
                      ? 'bg-white text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  EN (INVOICE)
                </button>
                <button
                  type="button"
                  aria-pressed={language === 'id'}
                  onClick={() => setLanguage('id')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    language === 'id'
                      ? 'bg-white text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ID (FAKTUR)
                </button>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                {(['draft', 'sent', 'overdue', 'paid'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    aria-pressed={status === st}
                    onClick={() => setStatus(st)}
                    className={`px-2.5 py-1 text-xs font-semibold capitalize rounded-md transition-colors ${
                      status === st
                        ? 'bg-white text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Footer Mode Toggle */}
              <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  aria-pressed={planTier === 'pro'}
                  onClick={() => setPlanTier('pro')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    planTier === 'pro'
                      ? 'bg-white text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Pro (No Footer)
                </button>
                <button
                  type="button"
                  aria-pressed={planTier === 'free'}
                  onClick={() => setPlanTier('free')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    planTier === 'free'
                      ? 'bg-white text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Free / Lapsed (Footer)
                </button>
              </div>
            </div>
          </div>

          {/* Rendered A4 Sheet */}
          <div className="rounded-xl border border-border bg-slate-100 p-4 sm:p-8">
            <ModernMinimalistWebPreview
              invoice={sampleInvoice}
              showFooter={planTier === 'free'}
              className="min-h-0 [aspect-ratio:auto] shadow-md"
            />
          </div>
        </div>

        {/* Part 2: Complete Role & Plan Entitlement Matrix (PRD.md Section 4.2) */}
        <div className="flex flex-col gap-6 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Plan Entitlements & Role Rules (Visitor, Free, Pro, Lapsed)
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Enforced on the server via <code className="font-mono">EntitlementService</code> and PostgreSQL Row-Level Security (RLS).
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href="/pricing">Compare Pricing Plans (Rp29k – Rp250k)</Link>
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <caption className="visually-hidden">
                Tagiva role and plan entitlement matrix
              </caption>
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th scope="col" className="py-3.5 px-4 font-semibold">
                    Capability
                  </th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">
                    Visitor
                  </th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">
                    Free Plan (Rp0)
                  </th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">
                    <span className="inline-flex items-center gap-1.5 text-status-pro-text">
                      <Sparkles className="size-3.5" aria-hidden="true" />
                      Pro Plan
                    </span>
                  </th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">
                    Lapsed (Expired Pro)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ENTITLEMENT_MATRIX.map((row) => (
                  <tr key={row.capability} className="hover:bg-muted/40">
                    <td className="py-3 px-4 font-semibold text-foreground">{row.capability}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.visitor}</td>
                    <td className="py-3 px-4 text-foreground">{row.free}</td>
                    <td className="py-3 px-4 font-semibold text-primary-text bg-primary-subtle/30">
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                        {row.pro}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {row.lapsed === 'Not allowed' || row.lapsed === 'Pro only' ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                          <X className="size-3.5 shrink-0" aria-hidden="true" />
                          {row.lapsed}
                        </span>
                      ) : (
                        row.lapsed
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
