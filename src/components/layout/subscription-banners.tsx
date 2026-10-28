'use client';

/**
 * Tagiva - Subscription & Plan Status Banners
 *
 * Implements:
 * - Expiry Reminder Banners (D-26, D-53) at 30d, 14d, 3d, 0d
 * - Lapsed Read-Only Warning Banner (D-23, D-28, DESIGN_SYSTEM.md Section 6.2)
 */

import Link from 'next/link';
import { AlertCircle, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserPlanState } from '@/lib/domain/entitlements';

interface SubscriptionBannersProps {
  planState: UserPlanState;
  daysRemaining?: number | null;
  currentPeriodEnd?: string | null;
  className?: string;
}

export function SubscriptionBanners({
  planState,
  daysRemaining,
  className,
}: SubscriptionBannersProps) {
  // 1. Lapsed Banner (D-23, D-28)
  if (planState === 'lapsed') {
    return (
      <div
        className={`w-full bg-slate-900 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm border-b border-slate-800 ${className ?? ''}`}
      >
        <div className="flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="leading-snug">
            <span className="font-semibold text-amber-400">Pro Plan Ended:</span>{' '}
            Existing invoices are read-only (except marking Sent invoices as Paid). Renew Pro to unlock editing, custom logos, and unlimited invoices.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-primary hover:bg-primary-hover text-white font-medium shrink-0 h-8 text-xs shadow-xs"
        >
          <Link href="/settings/billing">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Renew Pro
          </Link>
        </Button>
      </div>
    );
  }

  // 2. Pro Expiry Reminders (D-26)
  if (planState === 'pro' && typeof daysRemaining === 'number') {
    // 3 days or last day urgency banner (Amber/Red)
    if (daysRemaining <= 3) {
      return (
        <div
          className={`w-full bg-amber-500 text-slate-950 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm font-medium ${className ?? ''}`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-slate-950 shrink-0" />
            <p>
              Your Tagiva Pro subscription expires{' '}
              {daysRemaining <= 0 ? 'today' : `in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`}. Renew now to prevent service interruption.
            </p>
          </div>
          <Button
            asChild
            size="sm"
            className="bg-slate-950 hover:bg-slate-900 text-white font-medium shrink-0 h-7 text-xs"
          >
            <Link href="/settings/billing">Renew Now</Link>
          </Button>
        </div>
      );
    }

    // 14 days or 30 days reminder banner (Info Blue)
    if (daysRemaining <= 14) {
      return (
        <div
          className={`w-full bg-blue-50 text-blue-900 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm border-b border-blue-200 ${className ?? ''}`}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 shrink-0" />
            <p>
              Your Tagiva Pro subscription will expire in {daysRemaining} days.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="bg-white border-blue-300 text-blue-800 hover:bg-blue-100 font-medium shrink-0 h-7 text-xs"
          >
            <Link href="/settings/billing">Extend Subscription</Link>
          </Button>
        </div>
      );
    }
  }

  return null;
}
