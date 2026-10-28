import React from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the Free plan work?',
    a: 'On the Free plan, you can create and save up to 3 invoices in total (not per month). You get full access to the A4 template, PPN 11% calculation, and PDF downloads with a subtle "Made with Tagiva" platform footer. If you delete a draft invoice, you immediately get 1 slot back.',
  },
  {
    q: 'Can I delete sent or paid invoices on the Free plan?',
    a: 'No. To ensure financial record compliance and prevent sequence tampering, Free users can only delete Draft invoices. Once an invoice is marked Sent or Paid, it remains in your account. Pro users have unlimited invoices and can delete any status.',
  },
  {
    q: 'What payment methods can I use to upgrade to Pro?',
    a: 'We accept QRIS (GoPay, OVO, Dana, ShopeePay, BCA Mobile), Virtual Accounts (BCA, Mandiri, BNI, BRI), and Credit/Debit cards via our licensed Indonesian payment gateway. We support both one-time manual payments and automatic renewals.',
  },
  {
    q: 'What happens when my Pro subscription ends?',
    a: 'Your account transitions to Lapsed status. You never lose your invoices: existing public links stay viewable by clients (with the platform footer added), and you can still mark unpaid invoices as Paid and download PDFs. If you have fewer than 3 total invoices, you can still create new invoices under Free plan rules.',
  },
  {
    q: 'How does Tagiva comply with Indonesian Personal Data Protection (UU PDP)?',
    a: 'We strictly uphold UU PDP No. 27/2022: we do not collect visitor IP addresses or device fingerprints, we never store credit card numbers on our servers, and you can request complete erasure of your data at any time by emailing support@tagiva.com.',
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="deferred-section py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/60 text-slate-700 mb-3">
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Clear answers about pricing, sequence numbering, and Indonesian payments.
          </p>
        </div>

        <div className="divide-y divide-slate-200/80 rounded-xl border border-slate-200 bg-white">
          {FAQS.map((faq, idx) => (
            <details
              key={idx}
              name="landing-faq"
              open={idx === 0}
              className="group p-6"
            >
              <summary className="font-heading text-sm font-bold text-slate-900 cursor-pointer select-none">
                {faq.q}
              </summary>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          Have more questions? Check our{' '}
          <Link href="/pricing" className="text-indigo-600 font-semibold hover:underline">
            pricing comparison
          </Link>{' '}
          or contact us at{' '}
          <a href="mailto:support@tagiva.com" className="text-indigo-600 font-semibold hover:underline">
            support@tagiva.com
          </a>
          .
        </div>
      </div>
    </section>
  );
}
