import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import { CartItem, normalizeCart, mergeCartItems, clampCartQty } from '@/lib/cart';

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
    const replace = body?.replace === true;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { cart: true },
    });
    const existing = normalizeCart(user?.cart ?? null);
    // `replace` mode overwrites the server cart with the client-computed union.
    // Bug 4 fix: `normalizeCart` ALREADY de-duplicates by productId keeping the
    // MAX quantity AND clamps every quantity to [1, 999], so replace mode is
    // fully idempotent and can never double or inflate a stored quantity.
    const merged = replace ? normalizeCart(incoming) : mergeCartItems(existing, incoming);

    // Defensive final clamp before persisting — guarantees the stored cart can
    // never exceed the upper bound even if `incoming` somehow bypassed clamping.
    const clampedMerged = merged.map((it) => ({ ...it, quantity: clampCartQty(it.quantity) }));

    await prisma.user.update({
      where: { id: payload.userId },
      data: { cart: clampedMerged as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ cart: clampedMerged });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
