/**
 * V8 Stripe payment provider.
 *
 * Real mode: uses the `stripe` SDK to create a Checkout Session and returns its
 * hosted URL. Webhook verification lives in /api/payments/stripe/webhook.
 *
 * Mock mode (no STRIPE_SECRET_KEY): returns an internal mock-pay URL so the
 * full checkout flow is exercisable in development.
 */

import Stripe from 'stripe';
import { PaymentProvider, CreatePaymentInput, CreatePaymentResult, PaymentMethod } from './types';
import { getStripeConfig } from './config';

export class StripeProvider implements PaymentProvider {
  method: PaymentMethod = 'stripe';
  private client: Stripe | null = null;

  isMock(): boolean {
    return getStripeConfig().mock;
  }

  private getClient(): Stripe {
    if (!this.client) {
      this.client = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
      });
    }
    return this.client;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (this.isMock()) {
      return {
        payUrl: `/checkout/mock-pay?orderId=${encodeURIComponent(input.orderId)}&method=stripe`,
      };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const stripe = this.getClient();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: input.customerEmail,
      metadata: { orderId: input.orderId },
      line_items: [
        {
          price_data: {
            currency: (input.currency || 'USD').toLowerCase(),
            product_data: { name: `Smart Cabinet Order ${input.orderId}` },
            unit_amount: Math.round(input.amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/${input.locale || 'en'}/account/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/${input.locale || 'en'}/checkout`,
    });

    return {
      payUrl: session.url || `/checkout/mock-pay?orderId=${encodeURIComponent(input.orderId)}&method=stripe`,
      transactionId: session.id,
      providerData: { sessionId: session.id },
    };
  }
}
