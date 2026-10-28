import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getBillingDetails } from './queries/billing-queries';
import { BillingView } from './components/billing-view';

/**
 * Tagiva - Settings: Billing & Subscriptions Page (/settings/billing)
 */
export async function BillingSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const details = await getBillingDetails(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900">
          Billing & Subscription
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your plan details, duration, payment mode, and past invoices.
        </p>
      </div>

      <BillingView details={details} />
    </div>
  );
}
