/**
 * V8 PayPal payment provider.
 *
 * Real mode: uses @paypal/checkout-server-sdk to create an order and returns the
 * hosted approval URL from the response links. Webhook verification lives in
 * /api/payments/paypal/webhook.
 *
 * Mock mode (no client id/secret): returns an internal mock-pay URL.
 */

import paypal from '@paypal/checkout-server-sdk';
import { PaymentProvider, CreatePaymentInput, CreatePaymentResult, PaymentMethod } from './types';
import { getPaypalConfig } from './config';

export class PayPalProvider implements PaymentProvider {
  method: PaymentMethod = 'paypal';
  // `@paypal/checkout-server-sdk` ships without types; the module is declared
  // as `any` in src/types/modules.d.ts. The client instance is therefore typed
  // loosely here to avoid namespace-type lookups against the ambient `any`.
  private client: any = null;

  isMock(): boolean {
    return getPaypalConfig().mock;
  }

  private getClient(): any {
    if (!this.client) {
      const clientId = process.env.PAYPAL_CLIENT_ID as string;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET as string;
      const environment =
        process.env.PAYPAL_MODE === 'live'
          ? new paypal.core.LiveEnvironment(clientId, clientSecret)
          : new paypal.core.SandboxEnvironment(clientId, clientSecret);
      this.client = new paypal.core.PayPalHttpClient(environment);
    }
    return this.client;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (this.isMock()) {
      return {
        payUrl: `/checkout/mock-pay?orderId=${encodeURIComponent(input.orderId)}&method=paypal`,
      };
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: (input.currency || 'USD').toUpperCase(),
            value: Number(input.amount).toFixed(2),
          },
        },
      ],
    });

    const response = await this.getClient().execute(request);
    const orderId = (response.result as any).id as string;
    const approveLink = ((response.result as any).links || []).find(
      (l: any) => l.rel === 'approve'
    );
    const payUrl = approveLink?.href || `/checkout/mock-pay?orderId=${encodeURIComponent(input.orderId)}&method=paypal`;

    return { payUrl, transactionId: orderId, providerData: { paypalOrderId: orderId } };
  }
}
