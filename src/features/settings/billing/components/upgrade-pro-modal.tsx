'use client';

/**
 * Tagiva - Pro Upgrade Modal (D-16, D-22, UX_FLOWS.md Section 3.5)
 *
 * Implements:
 * - 4 Canonical durations with IDR pricing:
 *   • 1 Month: Rp29.000
 *   • 3 Months: Rp79.000
 *   • 6 Months: Rp150.000
 *   • 12 Months: Rp250.000
 * - Billing mode toggle: One-time manual (QRIS, VA, E-Wallet) vs. Auto-renewal
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { useBillingCheckout } from '../hooks/use-billing-checkout';
import { CANONICAL_PRICING_IDR, type PlanDurationMonths } from '@/lib/billing/plans';

interface UpgradeProModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const PLAN_OPTIONS: Array<{
  duration: PlanDurationMonths;
  label: string;
  badge?: string;
  savings?: string;
}> = [
  { duration: 1, label: '1 Month' },
  { duration: 3, label: '3 Months', savings: 'Save 9%' },
  { duration: 6, label: '6 Months', savings: 'Save 14%' },
  { duration: 12, label: '12 Months', badge: 'Best Value', savings: 'Save 28%' },
];

const PRO_PERKS = [
  'Unlimited invoices (no 3-invoice cap)',
  'Clean PDFs without platform watermark',
  'Custom business logo on invoices',
  'Public shareable links with live tracking',
  'Direct email delivery with attached PDF',
];

export function UpgradeProModal({
  open,
  onOpenChange,
  title = 'Upgrade to Tagiva Pro',
  description = 'Unlock unlimited invoicing, remove the platform watermark, and access client delivery tools.',
}: UpgradeProModalProps) {
  const {
    duration,
    setDuration,
    billingMode,
    setBillingMode,
    isLoading,
    handleCheckout,
  } = useBillingCheckout();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <DialogTitle className="font-heading text-lg font-bold text-slate-900">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Feature Highlights */}
        <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-3 space-y-1.5 text-xs text-slate-700">
          {PRO_PERKS.map((perk, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{perk}</span>
            </div>
          ))}
        </div>

        {/* Duration Selection (D-16) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">
            Select Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PLAN_OPTIONS.map((opt) => {
              const price = CANONICAL_PRICING_IDR[opt.duration];
              const isSelected = duration === opt.duration;
              return (
                <button
                  key={opt.duration}
                  type="button"
                  onClick={() => setDuration(opt.duration)}
                  className={`relative flex flex-col p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {opt.badge && (
                    <Badge className="absolute -top-2 right-2 bg-indigo-600 text-[9px] px-1.5 py-0">
                      {opt.badge}
                    </Badge>
                  )}
                  <span className="font-heading text-xs font-bold text-slate-900">
                    {opt.label}
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-900 mt-0.5">
                    Rp{price.toLocaleString('id-ID')}
                  </span>
                  {opt.savings && (
                    <span className="text-[10px] text-emerald-600 font-medium">
                      {opt.savings}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Mode Selection (D-22) */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Payment Type
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setBillingMode('manual')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                billingMode === 'manual'
                  ? 'border-slate-900 bg-slate-50 font-medium'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold text-slate-900">One-Time Payment</div>
              <div className="text-[10px] text-slate-500">QRIS, VA, E-Wallet, Card</div>
            </button>
            <button
              type="button"
              onClick={() => setBillingMode('auto_renew')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                billingMode === 'auto_renew'
                  ? 'border-slate-900 bg-slate-50 font-medium'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold text-slate-900">Auto-Renewal</div>
              <div className="text-[10px] text-slate-500">Renews automatically</div>
            </button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Encrypted local Indonesian payment</span>
          </div>

          <Button
            type="button"
            onClick={handleCheckout}
            disabled={isLoading}
            className="text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                Processing...
              </>
            ) : (
              `Pay Rp${CANONICAL_PRICING_IDR[duration].toLocaleString('id-ID')}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
