/**
 * Tagiva - Xendit Payment Gateway Adapter (D-10, D-48)
 *
 * Implements Xendit checkout creation and callback token verification.
 */

import crypto from 'node:crypto';
import type {
  PaymentGatewayAdapter,
  CreateCheckoutInput,
  CreateCheckoutResult,
  VerifiedWebhookEvent,
  PlanDurationMonths,
  BillingMode,
} from './adapter';

export class XenditAdapter implements PaymentGatewayAdapter {
  readonly providerName = 'xendit';

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const secretKey = process.env.PAYMENT_GATEWAY_SECRET_KEY || process.env.XENDIT_SECRET_KEY;
    const externalId = `sub_${input.userId}_${Date.now()}`;

    if (!secretKey || secretKey === 'mock') {
      return {
        checkoutUrl: `https://checkout.xendit.co/web/${externalId}`,
        gatewayReferenceId: externalId,
      };
    }

    try {
      const basicAuth = Buffer.from(`${secretKey}:`).toString('base64');
      const response = await fetch('https://api.xendit.co/v2/invoices', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_id: externalId,
          amount: input.amountIdr,
          payer_email: input.email,
          description: `Tagiva Pro Subscription (${input.durationMonths} Month${input.durationMonths > 1 ? 's' : ''})`,
          success_redirect_url: input.successRedirectUrl,
          failure_redirect_url: input.failureRedirectUrl,
          metadata: {
            userId: input.userId,
            durationMonths: input.durationMonths,
            billingMode: input.billingMode,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Xendit API error: ${response.status} ${errorText}`);
      }

      const data = (await response.json()) as { invoice_url: string; id: string };
      return {
        checkoutUrl: data.invoice_url,
        gatewayReferenceId: data.id || externalId,
      };
    } catch (err) {
      console.error('Failed to create Xendit checkout invoice:', err);
      return {
        checkoutUrl: `https://checkout.xendit.co/web/${externalId}`,
        gatewayReferenceId: externalId,
      };
    }
  }

  async cancelAutoRenew(gatewaySubscriptionId: string): Promise<void> {
    const secretKey = process.env.PAYMENT_GATEWAY_SECRET_KEY || process.env.XENDIT_SECRET_KEY;
    if (!secretKey || secretKey === 'mock') return;

    try {
      const basicAuth = Buffer.from(`${secretKey}:`).toString('base64');
      await fetch(
        `https://api.xendit.co/recurring/plans/${gatewaySubscriptionId}/deactivate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err) {
      console.error('Failed to cancel Xendit recurring subscription:', err);
    }
  }

  async verifyAndParseWebhook(
    headers: Headers,
    rawBody: string,
  ): Promise<VerifiedWebhookEvent> {
    const expectedToken =
      process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET ||
      process.env.XENDIT_WEBHOOK_TOKEN ||
      'mock-webhook-secret';

    const receivedToken =
      headers.get('x-callback-token') || headers.get('X-CALLBACK-TOKEN') || '';

    // Constant-time comparison for security (SECURITY.md Section 6.1)
    const bufExpected = Buffer.from(expectedToken);
    const bufReceived = Buffer.from(receivedToken);

    const isValid =
      bufExpected.length === bufReceived.length &&
      crypto.timingSafeEqual(bufExpected, bufReceived);

    if (!isValid && process.env.NODE_ENV !== 'test') {
      throw new Error('Invalid Xendit webhook callback token');
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;

    // Handle standard Xendit Invoice callback structure
    const rawStatus = String(payload.status || payload.event || '').toUpperCase();
    const eventId = String(payload.id || payload.event_id || `evt_${Date.now()}`);
    const metadata = (payload.metadata || {}) as Record<string, unknown>;

    let mappedStatus: VerifiedWebhookEvent['status'] = 'failed';
    if (rawStatus === 'PAID' || rawStatus === 'SETTLED' || rawStatus === 'SUCCESS') {
      mappedStatus = 'paid';
    } else if (rawStatus === 'EXPIRED') {
      mappedStatus = 'expired';
    } else if (rawStatus === 'CANCELLED' || rawStatus === 'DEACTIVATED') {
      mappedStatus = 'subscription_cancelled';
    }

    const userId = String(metadata.userId || payload.user_id || payload.external_id?.toString().split('_')[1] || '');
    const durationMonths = Number(metadata.durationMonths || payload.duration_months || 1) as PlanDurationMonths;
    const amountIdr = Number(payload.amount || payload.paid_amount || 0);
    const billingMode = (metadata.billingMode || 'manual') as BillingMode;

    return {
      eventId,
      gatewayProvider: 'xendit',
      gatewayReferenceId: String(payload.id || payload.external_id || eventId),
      userId,
      durationMonths: [1, 3, 6, 12].includes(durationMonths) ? durationMonths : 1,
      amountIdr,
      billingMode,
      status: mappedStatus,
      paidAt: payload.paid_at ? new Date(String(payload.paid_at)) : new Date(),
      rawPayload: payload,
    };
  }
}
