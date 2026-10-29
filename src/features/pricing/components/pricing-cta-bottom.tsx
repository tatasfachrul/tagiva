import React from 'react';
import Link from 'next/link';

export function PricingCtaBottom() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="rounded-3xl bg-[#e5eeff] p-8 sm:p-12 text-center relative overflow-hidden border border-[#dce9ff]">
        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] mb-3">
            Ready to impress your clients?
          </h2>
          <p className="text-sm sm:text-base text-[#434655] mb-8 leading-relaxed">
            Join hundreds of creative solopreneurs and agencies streamlining their billing workflow
            today. Start free or upgrade anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?next=/settings/billing"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#004ac6] text-white text-sm font-semibold hover:bg-[#003ea8] transition-colors shadow-sm text-center"
            >
              Upgrade to Pro (Rp 25.000 / mo)
            </Link>
            <Link
              href="/login?next=/invoices/new"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-[#0b1c30] text-sm font-semibold hover:bg-slate-50 transition-colors border border-[#dce9ff] text-center"
            >
              Continue with Starter Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
