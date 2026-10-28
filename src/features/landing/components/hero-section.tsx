import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { InteractiveTeaser } from './interactive-teaser';
import { Check, Lock, ShieldCheck, Clock } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative bg-background pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Asymmetric Header Block — Left-aligned, grounded in README.md */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pb-10 border-b border-border/80">
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-2.5 py-1 text-xs font-medium text-muted-foreground mb-5">
              <span className="font-mono font-semibold text-foreground">tagiva.com</span>
              <span className="text-border-strong" aria-hidden="true">
                |
              </span>
              <span>Bilingual (EN | ID) Invoicing SaaS</span>
              <span className="text-border-strong" aria-hidden="true">
                |
              </span>
              <span className="font-mono text-[11px] text-primary">Asia/Jakarta (WIB)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12] max-w-[26ch]">
              Modern invoicing for Indonesian freelancers and small businesses.
            </h1>

            <p className="mt-4 max-w-[65ch] text-sm sm:text-base text-muted-foreground leading-relaxed">
              Create, manage, and send professional A4 invoices with PDF generation, shareable client links, and automated numbering. Sign in with Google, configure your business profile and bank transfer details, and generate clean, print-ready invoices in minutes without spreadsheets or complex accounting software.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-end gap-3">
            <Button
              asChild
              size="lg"
              className="font-semibold h-11 px-6 shadow-xs w-full sm:w-auto"
            >
              <Link href="/login?next=/invoices/new">Sign in with Google</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 px-6 w-full sm:w-auto font-medium"
            >
              <Link href="/pricing">View Pricing (From Rp29.000 / 1m)</Link>
            </Button>
          </div>
        </div>

        {/* System Guardrails & Specifications Strip */}
        <div className="py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground border-b border-border/60 mb-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Check className="size-3.5 text-tagiva-green shrink-0" aria-hidden="true" />
              Free tier: 3 saved invoices in total
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              Google OAuth PKCE (No guest trackers)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              UU PDP No. 27/2022 compliant
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Clock className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <span>Drafts render [DRAFT] until issued via atomic RPC</span>
          </div>
        </div>

        {/* Dominant Feature: Live Split-Screen Invoice Builder & Real-Time A4 Sheet */}
        <InteractiveTeaser />
      </div>
    </section>
  );
}
