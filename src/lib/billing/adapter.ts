/**
 * Tagiva - Indonesian Payment Gateway Adapter Contract (D-10, D-16, D-22, D-48)
 *
 * All billing checkout, webhook verification, and subscription lifecycle logic
 * interacts strictly through this contract.
 */

export * from './plans';
import type { PlanDurationMonths, BillingMode, PaymentGatewayProviderName } from './plans';

export interface CreateCheckoutInput {
  userId: string;
  email: string;
  durationMonths: PlanDurationMonths;
  amountIdr: number;
  billingMode: BillingMode;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}

export interface CreateCheckoutResult {
  checkoutUrl: string;
  gatewayReferenceId: string;
}

export interface VerifiedWebhookEvent {
  eventId: string;
  gatewayProvider: PaymentGatewayProviderName;
  gatewayReferenceId: string;
  userId: string;
  durationMonths: PlanDurationMonths;
  amountIdr: number;
  billingMode: BillingMode;
  status: 'paid' | 'failed' | 'expired' | 'subscription_cancelled';
  paidAt?: Date;
  rawPayload: unknown;
}

export interface PaymentGatewayAdapter {
  providerName: PaymentGatewayProviderName;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  cancelAutoRenew(gatewaySubscriptionId: string): Promise<void>;
  verifyAndParseWebhook(headers: Headers, rawBody: string): Promise<VerifiedWebhookEvent>;
}



import { XenditAdapter } from './xendit-adapter';
import { MidtransAdapter } from './midtrans-adapter';

export function getPaymentGatewayAdapter(
  provider?: PaymentGatewayProviderName,
): PaymentGatewayAdapter {
  const chosen =
    provider ||
    (process.env.PAYMENT_GATEWAY_PROVIDER as PaymentGatewayProviderName) ||
    'xendit';

  if (chosen === 'midtrans') {
    return new MidtransAdapter();
  }

  return new XenditAdapter();
}

