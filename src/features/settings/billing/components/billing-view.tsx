'use client';

/**
 * Tagiva - Billing & Subscriptions View (FR-10.9)
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Sparkles,
  CreditCard,
  Calendar,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDateWib } from '@/lib/domain/timezone';
import { UpgradeProModal } from './upgrade-pro-modal';
import { cancelAutoRenewAction } from '../actions';
import type { BillingDetails } from '../queries/billing-queries';

interface BillingViewProps {
  details: BillingDetails;
}

export function BillingView({ details }: BillingViewProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { planState, subscription, history } = details;
  const isPro = planState === 'pro';
  const isLapsed = planState === 'lapsed';
  const isAutoRenew = subscription?.billing_mode === 'auto_renew';

  async function handleCancelAutoRenew() {
    if (!subscription?.id) return;
    setIsCancelling(true);
    try {
      const res = await cancelAutoRenewAction({ subscriptionId: subscription.id });
      if (res.ok) {
        toast.success(
          'Auto-renewal cancelled. Your Pro access remains active until the end of your current period.',
        );
        router.refresh();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to cancel auto-renewal.');
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Current Plan
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Manage your subscription duration, billing method, and plan features.
            </CardDescription>
          </div>
          <div>
            {isPro ? (
              <Badge className="bg-indigo-600 text-white font-bold text-xs uppercase px-2.5 py-1">
                PRO ACTIVE
              </Badge>
            ) : isLapsed ? (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold text-xs uppercase px-2.5 py-1">
                LAPSED
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-600 font-bold text-xs uppercase px-2.5 py-1">
                FREE PLAN
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {isPro && subscription ? (
            <div className="rounded-lg bg-indigo-50/50 border border-indigo-100 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-950 font-medium">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span>
                    Valid until <strong>{formatDateWib(subscription.current_period_end)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Mode:</span>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {isAutoRenew ? 'Auto-Renewal' : 'Manual (One-Time)'}
                  </Badge>
                </div>
              </div>

              {subscription.status === 'past_due' && subscription.grace_period_end && (
                <div className="rounded bg-rose-50 border border-rose-200 p-2 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    <strong>Payment Past Due:</strong> You are in a 3-day grace period ending on{' '}
                    {formatDateWib(subscription.grace_period_end)}.
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-indigo-100/80">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs h-8"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Extend Subscription
                </Button>

                {isAutoRenew && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelAutoRenew}
                    disabled={isCancelling}
                    className="text-xs h-8 text-rose-600 hover:bg-rose-50 border-rose-200"
                  >
                    Cancel Auto-Renewal
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-heading text-sm font-bold text-slate-900">
                  {isLapsed ? 'Your Pro subscription has lapsed' : 'Upgrade to Tagiva Pro'}
                </h4>
                <p className="text-xs text-slate-600 max-w-md">
                  {isLapsed
                    ? 'Renew Pro to remove the platform footer, unfreeze invoice editing, and create unlimited invoices.'
                    : 'Unlimited invoices, custom business logos, client public links, and direct PDF email dispatch.'}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setModalOpen(true)}
                className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {isLapsed ? 'Renew Pro Subscription' : 'Upgrade to Pro'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Billing History
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Record of your subscription payments and renewals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No payment transactions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {history.map((evt) => (
                <div key={evt.id} className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                      <span>Tagiva Pro ({evt.duration_months} Month{evt.duration_months && evt.duration_months > 1 ? 's' : ''})</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {formatDateWib(evt.processed_at)} • Provider: {evt.gateway_provider}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">
                      Rp{Number(evt.amount_idr || 0).toLocaleString('id-ID')}
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
                      {evt.event_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pro Modal */}
      <UpgradeProModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
