import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
      {/* Background radial gradient accent */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 overflow-hidden opacity-50 blur-3xl pointer-events-none">
        <div className="aspect-[1100/600] w-full bg-gradient-to-tr from-indigo-100 via-slate-100 to-white" />
      </div>

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Top announcement pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-xs mb-6 backdrop-blur-xs">
          <Zap className="h-3.5 w-3.5 text-indigo-600" />
          <span>Built exclusively for Indonesian Freelancers & Studios</span>
        </div>

        {/* Headline */}
        <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Professional Invoices in Seconds.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800">
            Zero Spreadsheets.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
          Create clean, minimalist A4 invoices formatted for Indonesian business: one-click PPN 11%,
          sequential numbering that never breaks, QRIS & bank transfer instructions, and direct PDF downloads.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm font-semibold h-11 px-6 shadow-md">
            <Link href="/login" className="inline-flex items-center gap-2">
              <span>Start Invoicing Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="text-xs sm:text-sm h-11 px-6 border-slate-200 hover:bg-slate-50 text-slate-700">
            <Link href="/pricing">View Pricing (From Rp29k)</Link>
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>3 Invoices Free Forever</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-indigo-600" />
            <span>Indonesian Law (UU PDP) Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Google Sign-In with PKCE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
