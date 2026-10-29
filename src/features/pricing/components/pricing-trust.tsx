import React from 'react';
import { Send, ShieldCheck, CalendarX } from 'lucide-react';

export function PricingTrust() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-[#e5eeff] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#004ac6] mb-4">
            <Send className="size-5" />
          </div>
          <h2 className="text-base font-bold text-[#0b1c30] mb-1.5">
            Instant Invoice Delivery
          </h2>
          <p className="text-sm text-[#434655] leading-relaxed">
            Generate crisp, professional invoices in seconds and share them via WhatsApp, email, or
            direct link with zero setup.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#e5eeff] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#004ac6] mb-4">
            <ShieldCheck className="size-5" />
          </div>
          <h2 className="text-base font-bold text-[#0b1c30] mb-1.5">Bank-Grade Privacy</h2>
          <p className="text-sm text-[#434655] leading-relaxed">
            Your client data and financial records are encrypted with strict privacy protection. We
            never sell or inspect your billing amounts.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#e5eeff] shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#004ac6] mb-4">
            <CalendarX className="size-5" />
          </div>
          <h2 className="text-base font-bold text-[#0b1c30] mb-1.5">Cancel Anytime</h2>
          <p className="text-sm text-[#434655] leading-relaxed">
            No lock-in contracts or complicated phone calls. Cancel your subscription in a single
            click whenever your freelance load fluctuates.
          </p>
        </div>
      </div>
    </section>
  );
}
