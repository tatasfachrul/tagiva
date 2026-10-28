'use server';

/**
 * Tagiva - Subscription & Billing Server Actions (API.md Section 3.4, FR-10)
 */

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  ok,
  err,
  validationError,
  type ActionResult,
} from '@/lib/api/action-result';
import {
  CANONICAL_PRICING_IDR,
  getPaymentGatewayAdapter,
  type PlanDurationMonths,
  type BillingMode,
} from '@/lib/billing/adapter';

const CreateSubscriptionCheckoutSchema = z.object({
  durationMonths: z.union([
    z.literal(1),
    z.literal(3),
    z.literal(6),
    z.literal(12),
  ]),
  billingMode: z.enum(['manual', 'auto_renew']),
});

const CancelAutoRenewSchema = z.object({
  subscriptionId: z.string().uuid(),
});

export type CreateSubscriptionCheckoutInput = z.infer<
  typeof CreateSubscriptionCheckoutSchema
>;
export type CancelAutoRenewInput = z.infer<typeof CancelAutoRenewSchema>;

export async function createSubscriptionCheckoutAction(
  rawInput: CreateSubscriptionCheckoutInput,
): Promise<ActionResult<{ checkoutUrl: string }>> {
  try {
    const parsed = CreateSubscriptionCheckoutSchema.safeParse(rawInput);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { durationMonths, billingMode } = parsed.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return err('UNAUTHENTICATED', 'You must be signed in to purchase a plan.');
    }

    const amountIdr = CANONICAL_PRICING_IDR[durationMonths as PlanDurationMonths];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tagiva.com';

    const adapter = getPaymentGatewayAdapter();
    const result = await adapter.createCheckout({
      userId: user.id,
      email: user.email || '',
      durationMonths: durationMonths as PlanDurationMonths,
      amountIdr,
      billingMode: billingMode as BillingMode,
      successRedirectUrl: `${appUrl}/settings/billing?status=success`,
      failureRedirectUrl: `${appUrl}/settings/billing?status=cancelled`,
    });

    return ok({ checkoutUrl: result.checkoutUrl });
  } catch (error) {
    console.error('Failed to create subscription checkout:', error);
    return err('INTERNAL_ERROR', 'Unable to initiate checkout. Please try again later.');
  }
}

export async function cancelAutoRenewAction(
  rawInput: CancelAutoRenewInput,
): Promise<ActionResult<{ cancelled: boolean }>> {
  try {
    const parsed = CancelAutoRenewSchema.safeParse(rawInput);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { subscriptionId } = parsed.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return err('UNAUTHENTICATED', 'You must be signed in.');
    }

    const { data: sub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !sub) {
      return err('NOT_FOUND', 'Subscription record not found.');
    }

    // Update subscription billing mode to manual in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        billing_mode: 'manual',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update subscription settings:', updateError);
      return err('INTERNAL_ERROR', 'Failed to update subscription settings. Please try again.');
    }

    // Cancel recurring mandate on gateway if ID is present
    if (sub.gateway_subscription_id) {
      const adapter = getPaymentGatewayAdapter();
      await adapter.cancelAutoRenew(sub.gateway_subscription_id);
    }

    revalidatePath('/settings/billing');
    return ok({ cancelled: true });
  } catch (error) {
    console.error('Failed to cancel auto-renewal:', error);
    return err('INTERNAL_ERROR', 'Failed to update subscription settings. Please try again.');
  }
}
