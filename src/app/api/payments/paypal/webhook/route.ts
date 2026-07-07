import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { finalizePayment } from '@/lib/payments/persist';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/paypal/webhook
 *
 * Handles PayPal async events. In real mode the caller should additionally
 * verify the transmission signature (PAYPAL_WEBHOOK_ID) before trusting the
 * payload; this handler keys off the stored transactionId so it is idempotent.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType: string = body?.event_type || '';
    const resource: any = body?.resource || {};

    // We care about completed captures / approved orders.
    if (
      !['PAYMENT.CAPTURE.COMPLETED', 'CHECKOUT.ORDER.APPROVED', 'CHECKOUT.ORDER.COMPLETED'].includes(
        eventType
      )
    ) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const transactionId: string = resource?.id || resource?.supplementary_data?.related_ids?.order_id;
    if (!transactionId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const payment = await prisma.payment.findFirst({
      where: { method: 'paypal', transactionId },
    });
    if (!payment) {
      return NextResponse.json({ received: true, noMatch: true });
    }

    await finalizePayment({
      orderId: payment.orderId,
      method: 'paypal',
      transactionId,
      amount: payment.amount,
      currency: payment.currency,
      rawPayload: body,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('PayPal webhook error:', err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
