import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { CartItem, normalizeCart, mergeCartItems } from '@/lib/cart';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

function getUserToken(request: NextRequest): string | null {
  const header = request.headers.get('Authorization');
  if (header && header.startsWith('Bearer ')) return header.substring(7);
  return null;
}

/**
 * GET /api/user/cart
 * Return the current user's persisted cart (User.cart JSON).
 */
export async function GET(request: NextRequest) {
  try {
    const token = getUserToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { cart: true },
    });

    const cart = normalizeCart(user?.cart ?? null);
    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ error: 'Failed to get cart' }, { status: 500 });
  }
}

/**
 * POST /api/user/cart
 * Merge the provided guest cart into the user's persisted cart and return the result.
 * Body: { items: CartItem[] }
 */
export async function POST(request: NextRequest) {
  try {
    const token = getUserToken(request);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const incoming = normalizeCart(body?.items);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { cart: true },
    });
    const existing = normalizeCart(user?.cart ?? null);
    const merged = mergeCartItems(existing, incoming);

    await prisma.user.update({
      where: { id: payload.userId },
      data: { cart: merged as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ cart: merged });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
