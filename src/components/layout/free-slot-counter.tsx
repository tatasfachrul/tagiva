'use client';

/**
 * Tagiva - Free Tier Slot Counter Component
 *
 * Implements D-12, D-21, and DESIGN_SYSTEM.md Section 6.2:
 * - Shows 3-segment visual indicator (X / 3 Free slots)
 * - Amber warning state when cap is reached (3 / 3)
 * - "Upgrade to Pro" action link
 */

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FreeSlotCounterProps {
  usedCount: number;
  maxSlots?: number;
  className?: string;
  isCompact?: boolean;
}

export function FreeSlotCounter({
  usedCount,
  maxSlots = 3,
  className,
  isCompact = false,
}: FreeSlotCounterProps) {
  const isFull = usedCount >= maxSlots;
  const clampedCount = Math.min(usedCount, maxSlots);

  return (
    <div
      className={cn(
        'rounded-xl border p-3.5 transition-colors',
        isFull
          ? 'bg-amber-50/70 border-amber-200'
          : 'bg-slate-50 border-slate-200/80',
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs mb-2">
        <span className={cn('font-medium', isFull ? 'text-amber-900' : 'text-slate-700')}>
          {isFull ? 'Free limit reached' : 'Free plan invoices'}
        </span>
        <span
          className={cn(
            'font-semibold font-mono',
            isFull ? 'text-amber-700' : 'text-slate-900',
          )}
        >
          {clampedCount} / {maxSlots}
        </span>
      </div>

      {/* 3-segment progress bar */}
      <div className="grid grid-cols-3 gap-1.5 mb-3" aria-hidden="true">
        {Array.from({ length: maxSlots }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              idx < clampedCount
                ? isFull
                  ? 'bg-amber-500'
                  : 'bg-primary'
                : 'bg-slate-200',
            )}
          />
        ))}
      </div>

      {!isCompact && (
        <Button
          asChild
          size="sm"
          variant={isFull ? 'default' : 'outline'}
          className={cn(
            'w-full text-xs font-semibold h-8 gap-1.5 shadow-none',
            isFull
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'border-slate-300 text-slate-700 hover:bg-white',
          )}
        >
          <Link href="/settings/billing">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isFull ? 'Upgrade to Pro (Rp29k/mo)' : 'Unlock Unlimited'}</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
