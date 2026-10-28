import React from 'react';
import {
  Calculator,
  Hash,
  Share2,
  FileDown,
  Building,
  Languages,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Calculator,
    title: 'Indonesian Tax & Currency Engine',
    description:
      'One-click PPN 11% application with exact rounding. Clean IDR formatting with zero unnecessary decimals, plus multi-currency support (USD, SGD, EUR, AUD, GBP, MYR, JPY).',
  },
  {
    icon: Hash,
    title: 'Bulletproof Sequential Numbering',
    description:
      'Guaranteed format INV-[PREFIX]-[YYYY]-[MM]-[XXXX]. Drafts stay safely unnumbered ([DRAFT]), so deleting a draft never leaves awkward gaps in your annual sequence.',
  },
  {
    icon: Share2,
    title: 'Live Public Links & 1-Click Bank Copy',
    description:
      'Send clients an unguessable web link. Clients can download the official PDF and copy your BCA/Mandiri bank account with one tap on mobile or desktop.',
  },
  {
    icon: FileDown,
    title: 'Pixel-Perfect A4 Vector PDFs',
    description:
      'Rendered server-side with strict Inter typography and tabular numbers. Matches your web preview down to the exact millimeter on standard A4 paper.',
  },
  {
    icon: Building,
    title: 'Saved Clients Directory',
    description:
      'Store recurring clients with billing addresses and company names. Auto-complete client details in 1-click while creating invoices.',
  },
  {
    icon: Languages,
    title: 'Bilingual Indonesian & English',
    description:
      'Switch the invoice dictionary between Bahasa Indonesia (Faktur, Jatuh Tempo, Lunas) and English (Invoice, Due Date, Paid) with a single toggle.',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 bg-slate-50 border-y border-slate-200/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-heading mb-2">
            Engineered for Precision
          </h2>
          <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything you need to bill clients with confidence
          </h3>
          <p className="mt-3 text-xs sm:text-sm text-slate-600">
            No bloated accounting bloatware. Just honest, rapid invoicing that leaves a professional impression on your clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-900 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-heading text-sm font-bold text-slate-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
