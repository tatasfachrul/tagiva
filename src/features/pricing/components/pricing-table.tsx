'use client';

/**
 * Tagiva - Pricing Cards Component (Stitch Redesign)
 *
 * Implements high-contrast side-by-side pricing cards with interactive billing
 * duration toggle and benefits-driven copy for Indonesian freelancers & agencies.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, CheckCircle2, Lock, Sparkles, Zap } from 'lucide-react';
import { CANONICAL_PRICING_IDR, type PlanDurationMonths } from '@/lib/billing/plans';

interface BillingPeriod {
  months: PlanDurationMonths;
  key: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  label: string;
  monthlyRate: string;
  billedText: string;
  discountBadge?: string;
  badgeStyle?: string;
  discountText: string;
}

const BILLING_PERIODS: BillingPeriod[] = [
  {
    months: 1,
    key: 'monthly',
    label: 'Monthly',
    monthlyRate: 'Rp 29.000',
    billedText: 'Billed monthly at Rp 29.000 (Standard)',
    discountText: 'Standard Rate',
  },
  {
    months: 3,
    key: 'quarterly',
    label: '3 Months',
    monthlyRate: 'Rp 26.300',
    billedText: `Billed quarterly at Rp ${CANONICAL_PRICING_IDR[3].toLocaleString('id-ID')} (Save 9%)`,
    discountBadge: 'Save 9%',
    badgeStyle: 'bg-[#ffffff] text-[#004ac6]',
    discountText: '9% Discount Applied',
  },
  {
    months: 6,
    key: 'semiannual',
    label: '6 Months',
    monthlyRate: 'Rp 25.000',
    billedText: `Billed semi-annually at Rp ${CANONICAL_PRICING_IDR[6].toLocaleString('id-ID')} (Save 14%)`,
    discountBadge: 'Save 14% • Popular',
    badgeStyle: 'bg-[#2563eb] text-white font-bold',
    discountText: '14% Discount Applied',
  },
  {
    months: 12,
    key: 'annual',
    label: '12 Months',
    monthlyRate: 'Rp 20.800',
    billedText: `Billed annually at Rp ${CANONICAL_PRICING_IDR[12].toLocaleString('id-ID')} (Save 28%)`,
    discountBadge: 'Save 28%',
    badgeStyle: 'bg-[#acf774] text-[#0b2000] font-bold',
    discountText: '28% Discount Applied',
  },
];

export function PricingTable() {
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>(BILLING_PERIODS[2]!);

  return (
    <div className="w-full">
      {/* Billing Cycle Selector (Interactive Pills) */}
      <div className="flex justify-center mb-10 px-4">
        <div
          role="tablist"
          aria-label="Billing frequency"
          className="inline-flex p-1.5 rounded-2xl bg-[#dce9ff]/60 border border-[#c3c6d7]/30 shadow-inner gap-1 flex-wrap justify-center items-center"
        >
          {BILLING_PERIODS.map((period) => {
            const isActive = selectedPeriod.key === period.key;
            return (
              <button
                key={period.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-[#004ac6] shadow-sm font-semibold'
                    : 'text-[#434655] hover:text-[#0b1c30]'
                }`}
              >
                <span>{period.label}</span>
                {period.discountBadge && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      isActive ? period.badgeStyle : 'bg-white/80 text-[#004ac6]'
                    }`}
                  >
                    {period.discountBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing Cards Showcase */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* CARD 1: STARTER (Free Forever) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white border border-[#e5eeff] shadow-sm hover:shadow-md transition-shadow">
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl sm:text-2xl font-bold text-[#0b1c30]">Starter</span>
                <span className="text-xs px-3 py-1 rounded-full bg-[#eff4ff] text-[#434655] font-medium border border-[#dce9ff]">
                  Free Forever
                </span>
              </div>
              <p className="text-sm text-[#434655] mb-6 leading-relaxed">
                Essential, spotless invoicing built for independent solo professionals getting up and
                running.
              </p>

              {/* Price Tag */}
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#0b1c30] tracking-tight">
                  Rp 0
                </span>
                <span className="text-sm text-[#434655]">/ forever</span>
              </div>

              {/* CTA Button */}
              <Link
                href="/login?next=/invoices/new"
                className="w-full py-3 px-4 rounded-xl text-sm text-center block bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-semibold border border-[#dce9ff] transition-colors mb-6 shadow-none"
              >
                Get Started Free
              </Link>

              {/* Features Included */}
              <div className="text-xs uppercase tracking-wider text-[#434655] font-semibold mb-3">
                What&apos;s included:
              </div>
              <ul className="space-y-3.5 text-sm text-[#0b1c30]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-[#004ac6] shrink-0 mt-0.5" />
                  <span>
                    <strong>Up to 3 active stored invoices</strong> in your cloud dashboard
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-[#004ac6] shrink-0 mt-0.5" />
                  <span>
                    <strong>Clean A4 minimalist invoice layout</strong> designed for pristine
                    readability
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-[#004ac6] shrink-0 mt-0.5" />
                  <span>
                    <strong>Multi-currency invoicing</strong> (IDR, USD, SGD, EUR, AUD, GBP, MYR)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-[#004ac6] shrink-0 mt-0.5" />
                  <span>
                    <strong>Automated VAT &amp; tax calculation</strong> with one-click toggles
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-[#004ac6] shrink-0 mt-0.5" />
                  <span>
                    <strong>Direct print &amp; PDF download</strong> (includes discreet Tagiva
                    signature)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-[#004ac6] shrink-0 mt-0.5" />
                  <span>
                    <strong>Indonesian banking account details</strong> (BCA, Mandiri, BNI, BRI,
                    etc.)
                  </span>
                </li>
              </ul>
            </div>

            {/* Bottom Note */}
            <div className="pt-4 mt-8 bg-[#eff4ff] -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 rounded-b-2xl flex items-center justify-between text-xs sm:text-sm text-[#434655] border-t border-[#e5eeff]">
              <span>No credit card required</span>
              <span className="flex items-center gap-1 font-semibold text-[#004ac6]">
                <Zap className="size-3.5" /> Instant setup
              </span>
            </div>
          </div>

          {/* CARD 2: PRO (High Contrast Selected / Deep Indigo-Blue Gradient) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#2563eb] via-[#004ac6] to-[#0b1c30] text-white shadow-xl relative overflow-hidden">
            {/* Background Radial Glow Effects */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-300/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header Badges */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white">Pro</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#acf774] text-[#0b2000] text-xs font-bold shadow-sm">
                    RECOMMENDED
                  </span>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                  Everything in Starter + Premium
                </span>
              </div>

              <p className="text-sm text-blue-100 mb-6 max-w-lg leading-relaxed">
                For freelancers, studios, and consultants who need branded invoices, automated
                reminders, and instant link payments.
              </p>

              {/* Dynamic Price Block */}
              <div className="p-4 sm:p-5 rounded-xl bg-white/10 backdrop-blur-md mb-6 flex flex-col md:flex-row md:items-baseline justify-between gap-3 border border-white/15">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {selectedPeriod.monthlyRate}
                    </span>
                    <span className="text-sm text-blue-200">/ month</span>
                  </div>
                  <div className="text-xs text-blue-100 mt-1">{selectedPeriod.billedText}</div>
                </div>

                <div className="text-left md:text-right flex items-center md:flex-col justify-between md:items-end gap-1">
                  <span className="text-xs text-[#acf774] font-bold flex items-center gap-1">
                    <Sparkles className="size-3.5" />
                    <span>{selectedPeriod.discountText}</span>
                  </span>
                  <span className="text-xs text-blue-100 opacity-90">
                    QRIS &amp; Virtual Account supported
                  </span>
                </div>
              </div>

              {/* Prominent High-Contrast CTA */}
              <Link
                href="/login?next=/settings/billing"
                className="w-full py-3.5 px-6 rounded-xl text-sm text-center block bg-white hover:bg-slate-50 text-[#004ac6] font-bold shadow-lg transition-transform active:scale-[0.99] mb-6"
              >
                Upgrade to Pro Now — 14-Day Guarantee
              </Link>

              {/* Features Grid */}
              <div className="text-xs uppercase tracking-wider text-blue-200 font-bold mb-3">
                Everything in Starter, plus:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm text-white">
                <div className="flex items-start gap-2.5">
                  <Check className="size-5 text-[#acf774] shrink-0 mt-0.5" />
                  <span>
                    <strong>Unlimited active invoices</strong> with permanent archive storage
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="size-5 text-[#acf774] shrink-0 mt-0.5" />
                  <span>
                    <strong>100% Watermark-free</strong> — completely remove Tagiva branding
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="size-5 text-[#acf774] shrink-0 mt-0.5" />
                  <span>
                    <strong>Upload your custom studio logo</strong> and personalized brand styling
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="size-5 text-[#acf774] shrink-0 mt-0.5" />
                  <span>
                    <strong>Shareable client portal links</strong> with one-tap bank copy buttons
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="size-5 text-[#acf774] shrink-0 mt-0.5" />
                  <span>
                    <strong>In-app email delivery</strong> sending professional PDF attachments
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="size-5 text-[#acf774] shrink-0 mt-0.5" />
                  <span>
                    <strong>Custom invoice numbering</strong> &amp; custom series prefixes
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="size-5 text-[#acf774] shrink-0 mt-0.5" />
                  <span>
                    <strong>Automated gentle payment reminders</strong> (30d, 14d, 3d, &amp; due
                    date)
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="size-5 text-[#acf774] shrink-0 mt-0.5" />
                  <span>
                    <strong>Complete data control</strong> with one-click export or permanent purge
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-10 pt-4 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-blue-200 bg-white/10 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 rounded-b-2xl border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-blue-200" /> Pay securely via QRIS, BCA VA, Mandiri,
                or Card
              </span>
              <span className="font-semibold text-white">Cancel anytime hassle-free</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
