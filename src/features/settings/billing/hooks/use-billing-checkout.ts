'use client';

/**
 * Tagiva - Billing Checkout Client Hook
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { createSubscriptionCheckoutAction } from '../actions';
import type { PlanDurationMonths, BillingMode } from '@/lib/billing/plans';

export function useBillingCheckout() {
  const [duration, setDuration] = useState<PlanDurationMonths>(1);
  const [billingMode, setBillingMode] = useState<BillingMode>('manual');
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheckout() {
    setIsLoading(true);
    try {
      const res = await createSubscriptionCheckoutAction({
        durationMonths: duration,
        billingMode,
      });

      if (res.ok) {
        toast.info('Redirecting to secure Indonesian payment checkout...');
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error('Failed to initiate checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return {
    duration,
    setDuration,
    billingMode,
    setBillingMode,
    isLoading,
    handleCheckout,
  };
}
