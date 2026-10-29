import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { PricingTable } from './components/pricing-table';
import { PricingTrust } from './components/pricing-trust';
import { PricingFaq } from './components/pricing-faq';
import { PricingCtaBottom } from './components/pricing-cta-bottom';

export function PricingPage() {
  return (
    <div className="relative w-full overflow-hidden bg-[#f8f9ff]">
      {/* Subtle Ambient Glow Canvas Background */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[840px] h-[480px] bg-gradient-to-b from-[#2563eb]/10 via-[#e5eeff]/60 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Hero / Header Section */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dce9ff] text-[#0b1c30] mb-4 shadow-sm border border-[#c3c6d7]/40">
          <BadgeCheck className="size-4 text-[#004ac6]" />
          <span className="text-xs font-semibold tracking-wide uppercase">
            Simple, Predictable Invoicing
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0b1c30] tracking-tight max-w-3xl mx-auto mb-4 leading-tight">
          Fair pricing for ambitious freelancers &amp; boutique agencies.
        </h1>
        <p className="text-sm sm:text-base text-[#434655] max-w-xl mx-auto mb-2 leading-relaxed">
          Create elegant, tax-compliant invoices in seconds. Start completely free and scale to Pro
          whenever your business demands client links, custom logos, and zero watermarks.
        </p>
      </section>

      {/* Pricing Cards Showcase & Frequency Selector */}
      <PricingTable />

      {/* Trust & Guarantee Cards */}
      <PricingTrust />

      {/* Streamlined FAQ Accordion */}
      <PricingFaq />

      {/* Bottom Conversion Banner */}
      <PricingCtaBottom />
    </div>
  );
}
