'use client';

/**
 * Tagiva - Pricing Table Component (D-11, D-12, D-16, D-21, D-22, D-29, D-39, D-48)
 *
 * Strictly grounded in PRD.md Section 4.1 & 4.2 and src/lib/billing/plans.ts:
 * - Free Plan: 3 saved invoices in total (D-12), custom prefix (D-39), PDF download with platform footer.
 *   Public shareable links (/i/[token]), email delivery, and custom logo upload are Pro-only (D-11).
 * - Pro Plan: 1m (Rp29.000), 3m (Rp79.000), 6m (Rp150.000), 12m (Rp250.000) in manual or auto_renew modes.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CANONICAL_PRICING_IDR, type PlanDurationMonths } from '@/lib/billing/plans';

const DURATIONS: Array<{
  months: PlanDurationMonths;
  label: string;
  labelEn: string;
  monthlyEquivalent: number;
  discountBadge?: string;
}> = [
  { months: 1, label: '1 Bulan', labelEn: '1 Month', monthlyEquivalent: 29000 },
  {
    months: 3,
    label: '3 Bulan',
    labelEn: '3 Months',
    monthlyEquivalent: 26333,
    discountBadge: 'Hemat 9%',
  },
  {
    months: 6,
    label: '6 Bulan',
    labelEn: '6 Months',
    monthlyEquivalent: 25000,
    discountBadge: 'Hemat 14%',
  },
  {
    months: 12,
    label: '12 Bulan',
    labelEn: '12 Months',
    monthlyEquivalent: 20833,
    discountBadge: 'Hemat 28%',
  },
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
      <div className="flex flex-col items-center gap-3 mb-10">
        <span className="text-xs font-semibold text-muted-foreground">
          Pilih Durasi Langganan Pro (D-16)
        </span>
        <div
          role="group"
          aria-label="Pro subscription duration"
          className="inline-flex flex-wrap items-center justify-center p-1.5 bg-muted rounded-xl border border-border shadow-2xs gap-1"
        >
          {DURATIONS.map((dur) => {
            const isActive = selectedDuration === dur.months;
            const totalForDur = CANONICAL_PRICING_IDR[dur.months];
            return (
              <button
                key={dur.months}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectedDuration(dur.months)}
                className={cn(
                  'relative px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 flex items-center gap-1.5',
                  isActive
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span>{dur.label}</span>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  (Rp{totalForDur.toLocaleString('id-ID')})
                </span>
                {dur.discountBadge && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-[10px] rounded-full font-bold',
                      isActive
                        ? 'bg-primary-subtle text-primary-text'
                        : 'bg-muted-foreground/15 text-muted-foreground',
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        {/* Free Plan */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Free Starter</h2>
              <Badge variant="outline" className="text-xs font-medium">
                Gratis Selamanya
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Cocok untuk freelancer yang baru memulai. Buat dan unduh invoice A4 berstandar tinggi tanpa biaya langganan.
            </p>

            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono tabular-nums">
                  Rp 0
                </span>
                <span className="text-sm text-muted-foreground">/ selamanya</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 font-mono">
                Maksimal 3 invoice tersimpan aktif (bukan per bulan)
              </p>
            </div>

            <ul className="flex flex-col gap-3 text-sm text-foreground">
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-tagiva-green shrink-0 mt-0.5" aria-hidden="true" />
                <span>Maksimal 3 invoice tersimpan secara total (D-12)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-tagiva-green shrink-0 mt-0.5" aria-hidden="true" />
                <span>Menghapus invoice Draft mengembalikan 1 slot kuota (D-21)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-tagiva-green shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Kustomisasi prefix nomor urut <code className="font-mono text-xs">INV-[PREFIX]-YYYY-MM-XXXX</code> (D-39)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-tagiva-green shrink-0 mt-0.5" aria-hidden="true" />
                <span>Template A4 Modern Minimalist & tipografi Inter tabular-nums (D-41)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-tagiva-green shrink-0 mt-0.5" aria-hidden="true" />
                <span>8 mata uang (IDR, USD, SGD, EUR, AUD, GBP, MYR, JPY) & tombol PPN 11%</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-tagiva-green shrink-0 mt-0.5" aria-hidden="true" />
                <span>Unduh PDF A4 dengan footer atribusi &ldquo;Made with Tagiva • tagiva.com&rdquo;</span>
              </li>
              <li className="flex items-start gap-2.5 text-muted-foreground">
                <X className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Invoice Sent, Overdue, dan Paid tidak dapat dihapus pada paket Free (D-29)</span>
              </li>
              <li className="flex items-start gap-2.5 text-muted-foreground">
                <X className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Upload logo bisnis kustom (Eksklusif Pro, D-04)</span>
              </li>
              <li className="flex items-start gap-2.5 text-muted-foreground">
                <X className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Link publik klien (/i/[token]) & kirim email langsung dari aplikasi (D-11)</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <Button asChild variant="outline" className="w-full text-sm font-semibold h-11">
              <Link href="/login?next=/invoices/new">Mulai Gratis dengan Google</Link>
            </Button>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="relative flex flex-col justify-between rounded-2xl border-2 border-primary bg-card p-6 sm:p-8 shadow-sm">
          <div className="absolute -top-3 right-6">
            <Badge variant="pro" className="px-3 py-1 font-semibold shadow-2xs">
              <Sparkles className="size-3.5" aria-hidden="true" />
              <span>PRO ({activeDurationObj.labelEn})</span>
            </Badge>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Tagiva Pro</h2>
              <Badge variant="sent" className="text-xs font-semibold">
                {activeDurationObj.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Untuk profesional, konsultan, dan studio kreatif yang menuntut branding penuh tanpa batas kuota.
            </p>

            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold tracking-tight text-foreground font-mono tabular-nums">
                  Rp {activeDurationObj.monthlyEquivalent.toLocaleString('id-ID')}
                </span>
                <span className="text-sm text-muted-foreground">/ bulan (efektif)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 font-mono tabular-nums">
                Total tagihan: <strong>Rp {proPriceTotal.toLocaleString('id-ID')}</strong> untuk{' '}
                {activeDurationObj.label} (Manual atau Auto-Renew, D-22)
              </p>
            </div>

            <ul className="flex flex-col gap-3 text-sm text-foreground">
              <li className="flex items-start gap-2.5 font-medium">
                <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong>Invoice tanpa batas</strong> (tidak dibatasi 3 invoice)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong>Tanpa watermark</strong> atribusi Tagiva pada PDF & halaman publik
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Upload logo bisnis Anda sendiri (PNG/JPG/WEBP ≤ 2 MB, tervalidasi magic-byte)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Buat link publik dapat dibagikan (<code className="font-mono text-xs">/i/[token]</code>) dengan tombol salin rekening 1-klik
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Kirim invoice langsung via email in-app (<code className="font-mono text-xs">[Business Name] via Tagiva</code> + lampiran PDF, maks 50/hari)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Kustomisasi prefix nomor invoice (<code className="font-mono text-xs">INV-STUDIO-2026-10-0001</code>)
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>Hapus invoice lama kapan saja (Draft, Sent, Overdue, maupun Paid)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Pengingat masa aktif otomatis (30d, 14d, 3d, 0d untuk pembayaran manual; H-3 untuk auto-renew, D-53)
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <Button asChild className="w-full text-sm font-semibold h-11 shadow-xs">
              <Link href="/login?next=/settings/billing">Upgrade ke Pro Sekarang</Link>
            </Button>
            <p className="text-center text-[11px] text-muted-foreground mt-2.5">
              Pembayaran via Payment Gateway Indonesia (Xendit / Midtrans / Mayar): QRIS, Virtual Account, & Kartu.
            </p>
          </div>
        </div>
      </div>

      {/* All 4 Canonical Durations Reference Table (D-16) */}
      <div className="mt-12 max-w-4xl mx-auto rounded-xl border border-border bg-white overflow-hidden">
        <div className="px-5 py-3.5 bg-muted/60 border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">
            Tabel Perbandingan Durasi Paket Pro (D-16)
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            Semua durasi membuka fitur Pro yang sama
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="visually-hidden">
              Perbandingan harga paket Pro 1, 3, 6, dan 12 bulan
            </caption>
            <thead className="border-b border-border text-muted-foreground bg-muted/20">
              <tr>
                <th scope="col" className="py-2.5 px-4 font-semibold">
                  Paket Durasi
                </th>
                <th scope="col" className="py-2.5 px-4 font-semibold text-right">
                  Total Harga
                </th>
                <th scope="col" className="py-2.5 px-4 font-semibold text-right">
                  Efektif per Bulan
                </th>
                <th scope="col" className="py-2.5 px-4 font-semibold text-right">
                  Hemat vs Bulanan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono tabular-nums">
              <tr>
                <td className="py-2.5 px-4 font-sans font-medium text-foreground">Pro 1 Bulan</td>
                <td className="py-2.5 px-4 text-right font-semibold text-foreground">Rp29.000</td>
                <td className="py-2.5 px-4 text-right text-muted-foreground">Rp29.000</td>
                <td className="py-2.5 px-4 text-right text-muted-foreground">—</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans font-medium text-foreground">Pro 3 Bulan</td>
                <td className="py-2.5 px-4 text-right font-semibold text-foreground">Rp79.000</td>
                <td className="py-2.5 px-4 text-right text-muted-foreground">≈ Rp26.300</td>
                <td className="py-2.5 px-4 text-right text-status-paid-text font-semibold">≈ 9%</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans font-medium text-foreground">Pro 6 Bulan</td>
                <td className="py-2.5 px-4 text-right font-semibold text-foreground">Rp150.000</td>
                <td className="py-2.5 px-4 text-right text-muted-foreground">Rp25.000</td>
                <td className="py-2.5 px-4 text-right text-status-paid-text font-semibold">≈ 14%</td>
              </tr>
              <tr className="bg-primary-subtle/30">
                <td className="py-2.5 px-4 font-sans font-bold text-primary-text">Pro 12 Bulan</td>
                <td className="py-2.5 px-4 text-right font-bold text-primary-text">Rp250.000</td>
                <td className="py-2.5 px-4 text-right font-semibold text-primary-text">≈ Rp20.800</td>
                <td className="py-2.5 px-4 text-right text-status-paid-text font-bold">≈ 28%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
