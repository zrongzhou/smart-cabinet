import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { finalizePayment } from '@/lib/payments/persist';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/stripe/webhook
 * Verify the Stripe signature and mark the order paid on checkout.session.completed.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const apiKey = process.env.STRIPE_SECRET_KEY;

  // Mock mode (no keys): nothing to verify. Acknowledge so Stripe retries stop.
  if (!secret || !apiKey) {
    return NextResponse.json({ received: true, mock: true });
  }

  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    const stripe = new Stripe(apiKey, { apiVersion: '2024-06-20' as Stripe.LatestApiVersion });
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const transactionId = session.id;
      if (orderId && transactionId) {
        await finalizePayment({
          orderId,
          method: 'stripe',
          transactionId,
          amount: Number(session.amount_total ? session.amount_total / 100 : 0),
          currency: (session.currency || 'usd').toUpperCase(),
          rawPayload: session,
        });
      }
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing error:', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
