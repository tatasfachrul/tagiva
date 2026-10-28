import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/types/database';
import {
  getPaymentGatewayAdapter,
  validatePaidAmount,
} from '@/lib/billing/adapter';

/**
 * POST /api/webhooks/billing
 *
 * Indonesian Payment Gateway Webhook Handler (API.md Section 4.3, SECURITY.md Section 6.1)
 *
 * Implements:
 * - Cryptographic signature verification using constant-time comparison (SECURITY.md 6.1)
 * - Webhook replay protection / idempotency via billing_events (TC-BILL-02)
 * - Server-side price authority check (D-16)
 * - Period extension for active subscriptions (A-14, TC-BILL-01)
 * - 3-day past_due grace window on failed recurring charge (D-52, TC-BILL-03)
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headers = request.headers;

    const adapter = getPaymentGatewayAdapter();
    const event = await adapter.verifyAndParseWebhook(headers, rawBody);

    const supabaseAdmin = createAdminClient();

    // 1. Idempotency Check (billing_events.gateway_event_id is UNIQUE)
    const { data: existingEvent } = await supabaseAdmin
      .from('billing_events')
      .select('id')
      .eq('gateway_event_id', event.eventId)
      .maybeSingle();

    if (existingEvent) {
      return NextResponse.json(
        { received: true, message: 'Event already processed' },
        { status: 200 },
      );
    }

    let targetSubscriptionId: string | null = null;
    const now = new Date();

    if (event.status === 'paid') {
      // 2. Validate Paid Amount matches canonical pricing (SECURITY.md Section 6.1)
      if (!validatePaidAmount(event.durationMonths, event.amountIdr)) {
        console.error(
          `Price mismatch: Duration ${event.durationMonths}m expected Rp${event.amountIdr}`,
        );
        return NextResponse.json(
          { error: 'Paid amount does not match canonical pricing' },
          { status: 400 },
        );
      }

      // 3. Check for existing active/grace subscription (A-14, TC-BILL-01)
      const { data: activeSub } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', event.userId)
        .in('status', ['active', 'past_due'])
        .gt('current_period_end', now.toISOString())
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeSub) {
        // Extend existing subscription: current_period_end + durationMonths (A-14)
        targetSubscriptionId = activeSub.id;
        const currentEnd = new Date(activeSub.current_period_end);
        currentEnd.setMonth(currentEnd.getMonth() + event.durationMonths);

        await supabaseAdmin
          .from('subscriptions')
          .update({
            current_period_end: currentEnd.toISOString(),
            status: 'active',
            grace_period_end: null,
            plan_duration_months: event.durationMonths,
            billing_mode: event.billingMode,
            updated_at: now.toISOString(),
          })
          .eq('id', activeSub.id);
      } else {
        // Create new active subscription
        const startDate = now;
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + event.durationMonths);

        const { data: newSub, error: insertError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: event.userId,
            plan_duration_months: event.durationMonths,
            billing_mode: event.billingMode,
            status: 'active',
            current_period_start: startDate.toISOString(),
            current_period_end: endDate.toISOString(),
            gateway_provider: event.gatewayProvider,
            gateway_subscription_id: event.gatewayReferenceId,
            grace_period_end: null,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Failed to create subscription record:', insertError);
          return NextResponse.json(
            { error: 'Failed to record subscription' },
            { status: 500 },
          );
        }

        targetSubscriptionId = newSub?.id ?? null;
      }
    } else if (event.status === 'failed' && event.billingMode === 'auto_renew') {
      // 4. Auto-renew failed charge -> 3-day grace period (D-52, TC-BILL-03)
      const { data: activeSub } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', event.userId)
        .eq('status', 'active')
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeSub) {
        targetSubscriptionId = activeSub.id;
        const graceEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 days

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'past_due',
            grace_period_end: graceEnd.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', activeSub.id);
      }
    } else if (event.status === 'subscription_cancelled') {
      // 5. User turns off auto-renewal -> keep active until current_period_end (FR-10.6)
      await supabaseAdmin
        .from('subscriptions')
        .update({
          billing_mode: 'manual',
          updated_at: now.toISOString(),
        })
        .eq('gateway_subscription_id', event.gatewayReferenceId);
    }

    // 6. Record billing event for audit & idempotency
    await supabaseAdmin.from('billing_events').insert({
      subscription_id: targetSubscriptionId,
      user_id: event.userId,
      gateway_provider: event.gatewayProvider,
      gateway_event_id: event.eventId,
      event_type: event.status,
      duration_months: event.durationMonths,
      amount_idr: event.amountIdr,
      raw_payload: (event.rawPayload as Json) ?? {},
      processed_at: now.toISOString(),
    });

    return NextResponse.json({ success: true, processed: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook handling error';
    console.error('Webhook error:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
