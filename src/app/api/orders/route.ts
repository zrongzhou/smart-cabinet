import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { sendNotification, OrderNotificationData } from '@/lib/notifications';
import { getProvider, isSupportedMethod } from '@/lib/payments';
import { getCurrencyForMethod } from '@/lib/payments/config';

// GET - 获取用户订单列表
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, slug: true, name: true, images: true },
            },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Failed to get orders' }, { status: 500 });
  }
}

// POST - 创建订单 + 支付
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId;
    const body = await request.json();
    const { items, total, shippingAddress, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    const method = isSupportedMethod(paymentMethod) ? paymentMethod : 'stripe';

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    // 创建订单（待支付）
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        shippingAddress,
        status: 'pending',
        paymentMethod: method,
        paymentStatus: 'unpaid',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
          })),
        },
        payments: {
          create: {
            method,
            status: 'created',
            amount: total,
            currency: getCurrencyForMethod(method),
          },
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, slug: true, name: true, images: true } },
          },
        },
        payments: true,
      },
    });

    // 调用支付渠道创建支付，获取跳转 URL
    let payUrl = '';
    let transactionId: string | undefined;
    const paymentId = order.payments?.[0]?.id;
    try {
      const provider = getProvider(method);
      const result = await provider.createPayment({
        orderId: order.id,
        amount: total,
        currency: getCurrencyForMethod(method),
        method,
        customerEmail: user?.email,
        customerName: user?.name,
        locale: body.locale,
      });
      payUrl = result.payUrl;
      transactionId = result.transactionId;

      // 记录 provider 返回的 transactionId 到 Payment / Order
      if (transactionId && paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { transactionId, status: provider.isMock() ? 'pending' : 'created' },
        });
        await prisma.order.update({
          where: { id: order.id },
          data: { transactionId, paymentStatus: 'pending' },
        });
      }
    } catch (payErr) {
      console.error('Payment creation failed:', payErr);
      // 订单已创建；前端可稍后重试支付。返回订单，附错误提示。
      return NextResponse.json(
        {
          order,
          payment: { payUrl: '', method, error: (payErr as Error).message },
        },
        { status: 200 }
      );
    }

    // Send WeChat notification (non-blocking)
    if (user) {
      const notificationData: OrderNotificationData = {
        type: 'order',
        id: order.id,
        customerName: user.name,
        customerEmail: user.email,
        total,
        status: order.status,
        itemCount: items.length,
        createdAt: order.createdAt,
      };
      sendNotification(notificationData).catch((err) =>
        console.error('Failed to send order notification:', err)
      );
    }

    return NextResponse.json({
      order,
      payment: { payUrl, method, transactionId },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
