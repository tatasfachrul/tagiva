import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertCircle, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { canCreateInvoice, type UserPlanState } from '@/lib/domain/entitlements';
import { Button } from '@/components/ui/button';
import { InvoiceBuilder } from '../components/invoice-builder';
import { getSavedClients, getUserInvoiceCount } from '../queries/invoice-queries';

export async function NewInvoicePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/invoices/new');
  }

  // 1. Fetch user's business profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // 2. Fetch user plan state
  const { data: planStateRaw } = await (
    supabase.rpc as unknown as (
      fn: string,
      args: { p_user_id: string },
    ) => Promise<{ data: UserPlanState | null; error: unknown }>
  )('get_user_plan_state', { p_user_id: user.id });

  const planState: UserPlanState = planStateRaw || 'free';

  // 3. Check 3-invoice cap for Free and Lapsed users (D-12, D-33)
  const count = await getUserInvoiceCount();
  const allowed = canCreateInvoice(planState, count);

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 bg-slate-50 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Free Plan Limit Reached (3 / 3 Invoices)
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            You have reached the maximum 3 saved invoices on the Free plan. To create unlimited invoices, brand them with your custom logo, and share public links, upgrade to Pro.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              <Link href="/settings">
                <Sparkles className="h-4 w-4 mr-1.5" />
                Upgrade to Pro (from Rp29.000/mo)
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Fetch saved clients
  const savedClients = await getSavedClients();

  return (
    <InvoiceBuilder
      initialInvoice={null}
      profile={profile}
      planState={planState}
      savedClients={savedClients}
      isReadOnly={false}
    />
  );
}
