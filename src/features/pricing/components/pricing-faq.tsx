'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const PRICING_FAQS: FaqItem[] = [
  {
    q: 'Which Indonesian payment methods are accepted?',
    a: 'We accept all major Indonesian payment options through trusted national gateways: instant QRIS (GoPay, OVO, Dana, ShopeePay), major bank Virtual Accounts (BCA, Mandiri, BRI, BNI, Permata), and Visa/Mastercard credit or debit cards. Your account updates automatically the second payment clears.',
  },
  {
    q: 'What happens if my Pro subscription expires?',
    a: 'Your invoices and client records are never deleted without your permission. If your Pro membership ends, your account smoothly converts back to the Starter tier. You can still access and download your past invoices at any time.',
  },
  {
    q: 'Can I remove the “Generated with Tagiva” footer?',
    a: 'Yes! With the Pro plan, all watermarks and Tagiva signatures are completely removed. You can also upload your own company or studio logo and customize your invoice numbering prefix for a 100% white-label impression.',
  },
  {
    q: 'Do I receive official receipts for tax accounting?',
    a: 'Yes. An official payment receipt is generated instantly upon every successful transaction and emailed directly to your registered inbox, complete with VAT breakdown for your studio’s expense documentation.',
  },
  {
    q: 'Can I bill international clients in foreign currencies?',
    a: 'Both Starter and Pro allow you to generate invoices in USD, SGD, EUR, AUD, GBP, and MYR alongside IDR. You can also specify SWIFT/IBAN wire instructions directly on the invoice.',
  },
];

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0b1c30] mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-sm sm:text-base text-[#434655]">
          Clear, straightforward answers about billing and plans.
        </p>
      </div>

      <div className="space-y-3">
        {PRICING_FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-xl bg-white border border-[#e5eeff] shadow-sm overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                aria-expanded={isOpen}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-[#0b1c30] hover:text-[#004ac6] transition-colors"
              >
                <span className="text-sm sm:text-base font-semibold">{faq.q}</span>
                <ChevronDown
                  className={`size-5 text-[#434655] shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#004ac6]' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-0 text-[#434655] text-sm leading-relaxed border-t border-[#f0f4ff]">
                  <p className="mt-2.5">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
