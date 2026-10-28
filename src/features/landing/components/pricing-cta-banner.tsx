import React from 'react';
import Link from 'next/link';

export function PricingCtaBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" id="pricing-matrix">
      <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="text-left">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs uppercase tracking-wider font-semibold inline-block">
            Simple Pricing
          </span>
          <h3 className="text-2xl sm:text-3xl mt-2 font-bold text-white tracking-tight">
            Start invoicing with 3 free slots or upgrade to Pro
          </h3>
          <p className="text-sm text-white/85 mt-1 max-w-xl">
            Upgrade anytime for Rp29.000/month or save with the annual plan at Rp250.000/year.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
          <Link
            href="/login?next=/invoices/new"
            className="h-11 px-5 rounded-xl bg-white text-[#004ac6] font-semibold text-sm shadow-sm hover:bg-[#eff4ff] transition-all flex items-center justify-center w-full sm:w-auto"
          >
            Get Started Free
          </Link>
          <Link
            href="/pricing"
            className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center w-full sm:w-auto"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </section>
  );
}
