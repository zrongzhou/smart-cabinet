import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { finalizePayment } from '@/lib/payments/persist';
import { getCurrencyForMethod } from '@/lib/payments/config';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/alipay/callback
 * Mock confirmation endpoint for Alipay. The real SDK would verify the
 * async notification signature here before finalizing.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const payload = token ? verifyToken(token) : null;
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const orderId: string = body.orderId || '';
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, total: true } });
    if (!order || order.userId !== payload.userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const transactionId = `mock-alipay-${orderId}-${Date.now()}`;
    const res = await finalizePayment({
      orderId,
      method: 'alipay',
      transactionId,
      amount: order.total,
      currency: getCurrencyForMethod('alipay'),
    });

    return NextResponse.json({ success: true, alreadyPaid: res.alreadyPaid });
  } catch (error) {
    console.error('Alipay callback error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
