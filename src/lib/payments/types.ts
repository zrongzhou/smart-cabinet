/**
 * V8 Payment provider interface contracts.
 */

export type PaymentMethod = 'stripe' | 'paypal' | 'wechat' | 'alipay';

export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  customerEmail?: string;
  customerName?: string;
  locale?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreatePaymentResult {
  /** URL the browser should redirect to. */
  payUrl: string;
  transactionId?: string;
  /** Extra provider-specific data (e.g. Stripe session id) for debugging. */
  providerData?: Record<string, unknown>;
}

export interface PaymentProvider {
  method: PaymentMethod;
  /** True when running without real credentials (sandbox / mock). */
  isMock(): boolean;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
}
