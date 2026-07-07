import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getProvider } from '@/lib/payments';
import { getCurrencyForMethod } from '@/lib/payments/config';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/wechat/create
 * Create a WeChat Pay charge for an existing order. Mock mode returns the
 * internal mock-pay URL; real mode would return a QR/code_url.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const payload = token ? verifyToken(token) : null;
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, amount, locale } = body;
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const provider = getProvider('wechat');
    const result = await provider.createPayment({
      orderId,
      amount: Number(amount) || 0,
      currency: getCurrencyForMethod('wechat'),
      method: 'wechat',
      locale,
    });

    return NextResponse.json({ payUrl: result.payUrl, transactionId: result.transactionId, mock: provider.isMock() });
  } catch (error) {
    console.error('WeChat create error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
