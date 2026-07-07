import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { getProvider } from '@/lib/payments';
import { getCurrencyForMethod } from '@/lib/payments/config';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/stripe/create-session
 * Create a Stripe Checkout Session for an existing order and return its URL.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const payload = token ? verifyToken(token) : null;
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, amount, currency, customerEmail, locale } = body;
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const provider = getProvider('stripe');
    const result = await provider.createPayment({
      orderId,
      amount: Number(amount) || 0,
      currency: currency || getCurrencyForMethod('stripe'),
      method: 'stripe',
      customerEmail,
      locale,
    });

    if (result.transactionId) {
      await prisma.payment.updateMany({
        where: { orderId, method: 'stripe' },
        data: { transactionId: result.transactionId, status: provider.isMock() ? 'pending' : 'created' },
      });
      await prisma.order.update({
        where: { id: orderId },
        data: { transactionId: result.transactionId, paymentStatus: 'pending' },
      });
    }

    return NextResponse.json({ url: result.payUrl, transactionId: result.transactionId });
  } catch (error) {
    console.error('Stripe create-session error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
