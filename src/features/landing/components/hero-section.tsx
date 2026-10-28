import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Lock,
  ShieldCheck,
  Clock,
  ArrowRight,
  ChevronDown,
  Edit3,
} from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Top Ambient Glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[420px] bg-gradient-to-b from-[#dbe1ff]/60 via-[#e5eeff]/20 to-transparent blur-3xl pointer-events-none rounded-full"
        aria-hidden="true"
      />

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 pb-12">
        {/* Asymmetric Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-[#0b1c30] leading-[1.12] text-balance">
              Modern invoicing for Indonesian freelancers and small businesses.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#434655] leading-relaxed max-w-2xl text-pretty">
              Create, manage, and send compliant ISO A4 invoices with zero latency. Built with atomic sequence guarantees, PPN 11% automation, seamless Bank Transfer instructions (BCA, Mandiri, BRI), and one-click shareable payment tokens.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end w-full sm:w-auto">
            <Link
              href="/login?next=/invoices/new"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[#2563eb] hover:bg-[#004ac6] text-white font-semibold shadow-sm transition-all active:scale-[0.99] group text-sm"
            >
              <Edit3 className="size-4" aria-hidden="true" />
              <span>Get Started for Free</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>

            <a
              href="#pricing-matrix"
              className="inline-flex items-center justify-center gap-1.5 h-12 px-6 rounded-xl bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] font-medium text-sm transition-colors"
            >
              <span>View Pricing (From Rp29.000 / 1m)</span>
              <ChevronDown className="size-4 text-[#434655]" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-[#dce9ff]">
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white shadow-sm border border-[#e5eeff]">
            <CheckCircle2 className="size-5 text-[#2563eb] shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#0b1c30]">3 Invoices Free Forever</span>
          </div>

          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white shadow-sm border border-[#e5eeff]">
            <Lock className="size-5 text-[#2563eb] shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#0b1c30]">Google OAuth PKCE Auth</span>
          </div>

          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white shadow-sm border border-[#e5eeff]">
            <ShieldCheck className="size-5 text-[#2e6100] shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#0b1c30]">UU PDP No. 27/2022 Ready</span>
          </div>

          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white shadow-sm border border-[#e5eeff]">
            <Clock className="size-5 text-[#434655] shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#0b1c30]">Atomic Sequence Engine</span>
          </div>
        </div>
      </section>
    </div>
  );
}
