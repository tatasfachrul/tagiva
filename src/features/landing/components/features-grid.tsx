import React from 'react';
import {
  FileEdit,
  Send,
  AlertCircle,
  CheckCircle2,
  Lock,
  Calculator,
  Share2,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Tagiva - Invoice Lifecycle Pipeline & Domain Specifications
 *
 * Organized around the product's native shape:
 * 1. The 4-stage invoice lifecycle pipeline (Draft -> Sent -> Overdue -> Paid) with exact
 *    status badges from DESIGN_SYSTEM.md Section 3.3 and numbering progression from PRD.md D-13/D-18/D-30.
 * 2. The core README features & domain rules with real technical identifiers.
 */

const LIFECYCLE_STAGES = [
  {
    step: '01',
    status: 'draft' as const,
    icon: FileEdit,
    badgeLabel: 'Draft / Draf',
    numberDisplay: '[DRAFT]',
    dbState: 'invoice_number = NULL',
    description:
      'Drafts always display [DRAFT] with NULL database sequence numbers. Deleting a Draft invoice on the Free plan restores 1 of your 3 saved invoice slots.',
  },
  {
    step: '02',
    status: 'sent' as const,
    icon: Send,
    badgeLabel: 'Sent / Terkirim',
    numberDisplay: 'INV-ACM-2026-11-0001',
    dbState: 'issue_invoice(p_invoice_id)',
    description:
      'Issuing an invoice atomically assigns INV-[PREFIX]-[YYYY]-[MM]-[XXXX] via a PostgreSQL RPC, keyed per (user_id, issue_date year). Client link shows UNPAID / BELUM DIBAYAR.',
  },
  {
    step: '03',
    status: 'overdue' as const,
    icon: AlertCircle,
    badgeLabel: 'Overdue / Jatuh Tempo',
    numberDisplay: 'INV-ACM-2026-12-0002',
    dbState: 'todayWib > due_date',
    description:
      'Evaluated dynamically in Asia/Jakarta (WIB, UTC+07:00) and via the daily 08:00 WIB Vercel Cron job when a Sent invoice passes its due date.',
  },
  {
    step: '04',
    status: 'paid' as const,
    icon: CheckCircle2,
    badgeLabel: 'Paid / Lunas',
    numberDisplay: 'INV-ACME-2026-12-0003',
    dbState: "status = 'paid'",
    description:
      'Recorded when your client completes bank transfer or QRIS payment. Even if a Pro subscription becomes Lapsed, marking Sent or Overdue invoices as Paid remains enabled.',
  },
];

const SEQUENCE_TRACE = [
  {
    event: 'Send 1st invoice in Nov 2026 (Prefix: ACM)',
    assigned: 'INV-ACM-2026-11-0001',
    rule: 'Initial sequence 0001 for 2026',
  },
  {
    event: 'Send 2nd invoice in Dec 2026 (Prefix: ACM)',
    assigned: 'INV-ACM-2026-12-0002',
    rule: 'Month changes to 12; sequence increments to 0002',
  },
  {
    event: 'Change prefix to ACME & send 3rd in Dec 2026',
    assigned: 'INV-ACME-2026-12-0003',
    rule: 'Changing prefix (^[A-Z0-9]{2,6}$) does not reset sequence (D-18)',
  },
  {
    event: 'Send 1st invoice in Jan 2027 (Prefix: ACME)',
    assigned: 'INV-ACME-2027-01-0001',
    rule: 'New issue_date calendar year resets sequence to 0001 (D-56)',
  },
];

const DOMAIN_PILLARS = [
  {
    icon: Lock,
    code: 'D-14 • D-38',
    title: 'Google OAuth Sign-In & 1-Step Business Setup',
    description:
      'Frictionless authentication via Supabase Auth PKCE. Configure your Business Name, Invoice Prefix (2–6 uppercase alphanumeric characters), Default Currency (IDR), and Default Bank Details in one step.',
  },
  {
    icon: Calculator,
    code: 'D-44 • D-45 • NFR-4',
    title: 'Exact Financial Calculations',
    description:
      'Deterministic integer minor-unit math across 8 currencies (IDR, USD, SGD, EUR, AUD, GBP, MYR, JPY). Supports percentage or fixed-amount discounts and customizable tax rates with a 1-click PPN 11% preset.',
  },
  {
    icon: Share2,
    code: 'D-05 • D-49 • D-51',
    title: 'Multi-Channel Delivery',
    description:
      'Server-rendered A4 PDFs via @react-pdf/renderer with embedded Inter fonts, 144-bit entropy public client links (/i/[token]), and direct email delivery via Resend ([Business Name] via Tagiva from invoices@tagiva.com).',
  },
  {
    icon: Clock,
    code: 'D-26 • D-50 • NFR-5',
    title: 'WIB Timezone Engine & Daily Cron',
    description:
      'All date evaluations, overdue transitions, and daily Vercel Cron reminders (30d, 14d, 3d, 0d for manual plans; 3d pre-charge notice for auto-renew) operate strictly in Asia/Jakarta (UTC+07:00).',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-16 sm:py-20 bg-white border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col gap-16">
        {/* Part 1: Native Product Shape — The 4-Stage Invoice Lifecycle Pipeline */}
        <div className="flex flex-col gap-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              The 4-Stage Invoice Lifecycle & Atomic Sequence Pipeline
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[68ch]">
              Tagiva separates unnumbered working drafts from issued financial records. Sequence numbers are never assigned on creation and never manually overridden—eliminating duplicate numbers and broken sequences.
            </p>
          </div>

          {/* 4-Step Pipeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {LIFECYCLE_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="flex flex-col justify-between rounded-xl border border-border bg-background/60 p-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="font-mono text-xs font-bold text-muted-foreground">
                        STAGE {stage.step}
                      </span>
                      <Badge variant={stage.status}>
                        <Icon className="size-3.5" aria-hidden="true" />
                        <span>{stage.badgeLabel}</span>
                      </Badge>
                    </div>

                    <div className="rounded-lg border border-border bg-white px-3 py-2 mb-3">
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {stage.dbState}
                      </div>
                      <div className="font-mono text-xs font-bold text-foreground tabular-nums mt-0.5">
                        {stage.numberDisplay}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real Sequence Progression Trace from PRD.md Note (D-13 + D-18 + D-30) */}
          <div className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Smart Invoice Numbering Trace (D-13, D-18, D-30, D-56)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Format: <code className="font-mono font-semibold text-foreground">INV-[PREFIX]-[YYYY]-[MM]-[XXXX]</code> — Sequence belongs to your account and issue-date calendar year, never resetting when you update your prefix.
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-primary bg-primary-subtle px-2.5 py-1 rounded border border-primary/20 shrink-0">
                ^[A-Z0-9]&#123;2,6&#125;$
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SEQUENCE_TRACE.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-white p-3.5 flex flex-col justify-between gap-2"
                >
                  <div className="text-xs font-medium text-foreground">{item.event}</div>
                  <div>
                    <div className="font-mono text-xs font-bold text-primary tabular-nums">
                      {item.assigned}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.rule}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Part 2: Core Domain Capabilities from README.md */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
          {DOMAIN_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.code}
                className="rounded-xl border border-border bg-white p-6 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    {pillar.code}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
