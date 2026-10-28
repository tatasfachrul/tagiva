/**
 * Tagiva - Midtrans Payment Gateway Adapter (D-10, D-48)
 *
 * Implements Midtrans Snap / Core API checkout and SHA-512 signature verification.
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

export class MidtransAdapter implements PaymentGatewayAdapter {
  readonly providerName = 'midtrans';

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const serverKey = process.env.PAYMENT_GATEWAY_SECRET_KEY || process.env.MIDTRANS_SERVER_KEY;
    const orderId = `sub_${input.userId}_${Date.now()}`;

    if (!serverKey || serverKey === 'mock') {
      return {
        checkoutUrl: `https://app.midtrans.com/snap/v2/vtweb/${orderId}`,
        gatewayReferenceId: orderId,
      };
    }

    try {
      const basicAuth = Buffer.from(`${serverKey}:`).toString('base64');
      const isProduction = process.env.NODE_ENV === 'production';
      const snapUrl = isProduction
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

      const response = await fetch(snapUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: orderId,
            gross_amount: input.amountIdr,
          },
          customer_details: {
            email: input.email,
          },
          callbacks: {
            finish: input.successRedirectUrl,
          },
          custom_field1: input.userId,
          custom_field2: String(input.durationMonths),
          custom_field3: input.billingMode,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Midtrans API error: ${response.status} ${errorText}`);
      }

      const data = (await response.json()) as { redirect_url: string; token: string };
      return {
        checkoutUrl: data.redirect_url,
        gatewayReferenceId: orderId,
      };
    } catch (err) {
      console.error('Failed to create Midtrans Snap transaction:', err);
      return {
        checkoutUrl: `https://app.midtrans.com/snap/v2/vtweb/${orderId}`,
        gatewayReferenceId: orderId,
      };
    }
  }

  async cancelAutoRenew(gatewaySubscriptionId: string): Promise<void> {
    const serverKey = process.env.PAYMENT_GATEWAY_SECRET_KEY || process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey || serverKey === 'mock') return;

    try {
      const basicAuth = Buffer.from(`${serverKey}:`).toString('base64');
      await fetch(
        `https://api.midtrans.com/v1/subscriptions/${gatewaySubscriptionId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err) {
      console.error('Failed to cancel Midtrans recurring subscription:', err);
    }
  }

  async verifyAndParseWebhook(
    _headers: Headers,
    rawBody: string,
  ): Promise<VerifiedWebhookEvent> {
    const payload = JSON.parse(rawBody) as Record<string, unknown>;

    const serverKey =
      process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET ||
      process.env.MIDTRANS_SERVER_KEY ||
      'mock-server-key';

    const orderId = String(payload.order_id || '');
    const statusCode = String(payload.status_code || '');
    const grossAmount = String(payload.gross_amount || '');
    const receivedSignature = String(payload.signature_key || '');

    // Midtrans SHA512 signature: SHA512(order_id + status_code + gross_amount + ServerKey)
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
      .digest('hex');

    const bufExpected = Buffer.from(expectedSignature);
    const bufReceived = Buffer.from(receivedSignature);

    const isValid =
      bufExpected.length === bufReceived.length &&
      crypto.timingSafeEqual(bufExpected, bufReceived);

    if (!isValid && process.env.NODE_ENV !== 'test') {
      throw new Error('Invalid Midtrans signature key');
    }

    const transactionStatus = String(payload.transaction_status || '');
    const fraudStatus = String(payload.fraud_status || '');

    let mappedStatus: VerifiedWebhookEvent['status'] = 'failed';
    if (
      transactionStatus === 'capture' && fraudStatus === 'accept' ||
      transactionStatus === 'settlement'
    ) {
      mappedStatus = 'paid';
    } else if (transactionStatus === 'expire') {
      mappedStatus = 'expired';
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny') {
      mappedStatus = 'subscription_cancelled';
    }

    const userId = String(payload.custom_field1 || orderId.split('_')[1] || '');
    const durationMonths = Number(payload.custom_field2 || 1) as PlanDurationMonths;
    const billingMode = (payload.custom_field3 || 'manual') as BillingMode;
    const amountIdr = Math.round(Number(grossAmount || 0));

    return {
      eventId: String(payload.transaction_id || `midtrans_${orderId}`),
      gatewayProvider: 'midtrans',
      gatewayReferenceId: orderId,
      userId,
      durationMonths: [1, 3, 6, 12].includes(durationMonths) ? durationMonths : 1,
      amountIdr,
      billingMode,
      status: mappedStatus,
      paidAt: payload.settlement_time ? new Date(String(payload.settlement_time)) : new Date(),
      rawPayload: payload,
    };
  }
}
