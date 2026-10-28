'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CANONICAL_PRICING_IDR, type PlanDurationMonths } from '@/lib/billing/plans';

const DURATIONS: Array<{
  months: PlanDurationMonths;
  label: string;
  monthlyEquivalent: number;
  discountBadge?: string;
}> = [
  { months: 1, label: '1 Bulan', monthlyEquivalent: 29000 },
  { months: 3, label: '3 Bulan', monthlyEquivalent: 26333, discountBadge: 'Hemat 9%' },
  { months: 6, label: '6 Bulan', monthlyEquivalent: 25000, discountBadge: 'Hemat 14%' },
  { months: 12, label: '12 Bulan', monthlyEquivalent: 20833, discountBadge: 'Hemat 28%' },
];

const DEFAULT_DURATION = DURATIONS[3]!;

export function PricingTable() {
  const [selectedDuration, setSelectedDuration] = useState<PlanDurationMonths>(12);

  const activeDurationObj =
    DURATIONS.find((d) => d.months === selectedDuration) ?? DEFAULT_DURATION;
  const proPriceTotal = CANONICAL_PRICING_IDR[selectedDuration];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Duration Selector Tabs */}
      <div className="flex flex-col items-center gap-3 mb-12">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pilih Durasi Langganan Pro
        </span>
        <div className="inline-flex items-center p-1.5 bg-muted rounded-xl border border-border/60 shadow-sm gap-1">
          {DURATIONS.map((dur) => {
            const isActive = selectedDuration === dur.months;
            return (
              <button
                key={dur.months}
                type="button"
                onClick={() => setSelectedDuration(dur.months)}
                className={cn(
                  'relative px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150',
                  isActive
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {dur.label}
                {dur.discountBadge && (
                  <span
                    className={cn(
                      'ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-tight',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted-foreground/15 text-muted-foreground'
                    )}
                  >
                    {dur.discountBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto items-stretch">
        {/* Free Plan */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Free Starter</h3>
              <Badge variant="outline" className="text-xs font-normal">
                Gratis Selamanya
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Cocok untuk freelancer pemula yang butuh membuat invoice rapi dan profesional sesekali.
            </p>

            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                  Rp 0
                </span>
                <span className="text-sm text-muted-foreground">/ selamanya</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maksimal 3 invoice tersimpan aktif
              </p>
            </div>

            <ul className="space-y-3 text-sm text-foreground/90">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Maksimal 3 invoice tersimpan (D-12)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Template A4 Modern Minimalist & Inter font</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Download PDF beresolusi tinggi</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Link publik tagihan dapat dibagikan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Multi-kurs (IDR, USD, EUR, SGD) & rincian rekening</span>
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground/70">
                <X className="h-4 w-4 shrink-0" />
                <span>Watermark Tagiva di footer PDF & web link</span>
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground/70">
                <X className="h-4 w-4 shrink-0" />
                <span>Kirim invoice via email in-app langsung</span>
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground/70">
                <X className="h-4 w-4 shrink-0" />
                <span>Upload logo bisnis kustom</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <Button asChild variant="outline" className="w-full text-sm font-semibold h-11">
              <Link href="/login?next=/invoices/new">Mulai Gratis Sekarang</Link>
            </Button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="relative flex flex-col justify-between rounded-2xl border-2 border-primary bg-card p-6 sm:p-8 shadow-md">
          <div className="absolute -top-3 right-6">
            <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              <Sparkles className="h-3 w-3" /> Rekomendasi
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Tagiva Pro</h3>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-primary/20 text-xs font-medium">
                {activeDurationObj.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Untuk profesional, konsultan, dan studio kreatif yang menuntut kredibilitas tanpa batas.
            </p>

            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono">
                  Rp {activeDurationObj.monthlyEquivalent.toLocaleString('id-ID')}
                </span>
                <span className="text-sm text-muted-foreground">/ bulan</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ditagih Rp {proPriceTotal.toLocaleString('id-ID')} untuk {activeDurationObj.label}
              </p>
            </div>

            <ul className="space-y-3 text-sm text-foreground/90">
              <li className="flex items-center gap-2.5 font-medium">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>
                  <strong>Invoice tanpa batas</strong> (tanpa batasan kuota)
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>
                  <strong>Tanpa watermark</strong> Tagiva di PDF & link klien
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Upload logo bisnis / studio Anda sendiri</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Kirim invoice langsung via email in-app (Resend)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Kustomisasi prefix nomor invoice (cth: INV-STUDIO-...)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Pengingat jatuh tempo otomatis ke klien</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>Hapus invoice lama kapan saja (Draft, Sent, Paid)</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <Button asChild className="w-full text-sm font-semibold h-11 gap-2 shadow-sm">
              <Link href="/login?next=/settings/billing">
                Upgrade ke Pro Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-center text-[11px] text-muted-foreground mt-2">
              Mendukung QRIS, Virtual Account BCA/Mandiri/BRI, dan E-Wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
