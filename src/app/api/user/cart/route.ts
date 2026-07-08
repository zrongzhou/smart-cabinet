import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/jwt';
import {
  CartItem,
  normalizeCart,
  unionCartItems,
  migrateCorruptCart,
  clampCartQty,
} from '@/lib/cart';

// 防止静态生成时连接数据库
export const dynamic = 'force-dynamic';

function getUserToken(request: NextRequest): string | null {
  const header = request.headers.get('Authorization');
  if (header && header.startsWith('Bearer ')) return header.substring(7);
  return null;
}

/**
 * V8.5 fix: bug 2 — repair a cart's stored prices.
 *
 * A product whose stored price is missing/zero (the historical "$0 each"
 * symptom) cannot be recovered from the cart snapshot alone, but the real
 * price lives on the Product row, so we look it up and back-fill it. Items
 * that already carry a positive price are left untouched. Any DB failure is
 * swallowed so a price-repair problem can never break the cart load/save.
 */
async function repairCartPrices(items: CartItem[]): Promise<CartItem[]> {
  const needRepair = items.filter((it) => !it.price || it.price <= 0);
  if (needRepair.length === 0) return items;
  const ids = Array.from(new Set(needRepair.map((it) => it.productId)));
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, price: true },
    });
    const priceMap = new Map(products.map((p) => [p.id, Number(p.price) || 0]));
    return items.map((it) => {
      if (it.price > 0) return it;
      const repaired = priceMap.get(it.productId);
      return repaired && repaired > 0 ? { ...it, price: repaired } : it;
    });
  } catch {
    // DB lookup failed — return the cart unchanged rather than dropping items.
    return items;
  }
}

/**
 * GET /api/user/cart
 * Return the current user's persisted cart (User.cart JSON).
 *
 * V8.5 fix: bug 2 — the stored server cart is first run through
 * `migrateCorruptCart` so any legacy "999" quantity is reset to 1, then prices
 * are repaired from the Product table so a "$0 each" line is corrected.
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

    const repaired = await repairCartPrices(migrateCorruptCart(user?.cart ?? null));
    return NextResponse.json({ cart: repaired });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ error: 'Failed to get cart' }, { status: 500 });
  }
}

/**
 * POST /api/user/cart
 * Merge the provided guest cart into the user's persisted cart and return the result.
 * Body: { items: CartItem[], replace?: boolean }
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
    // V8.5 fix: bug 2 — run migrateCorruptCart on the STORED server cart so the
    // historical "999" quantity is repaired before any merge.
    const existing = migrateCorruptCart(user?.cart ?? null);
    // `replace` mode overwrites the server cart with the normalized incoming cart.
    // Non-replace mode uses a UNION (keep MAX quantity, never sum) so repeated
    // "Add to Cart" calls — or a per-add server sync — can never inflate a line.
    const merged = replace ? normalizeCart(incoming) : unionCartItems(existing, incoming);

    // Defensive final clamp before persisting — guarantees the stored cart can
    // never exceed the upper bound even if `incoming` somehow bypassed clamping.
    const clampedMerged = merged.map((it) => ({ ...it, quantity: clampCartQty(it.quantity) }));

    // Back-fill any missing/zero price from the Product table, then persist once.
    const repaired = await repairCartPrices(clampedMerged);

    await prisma.user.update({
      where: { id: payload.userId },
      data: { cart: repaired as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ cart: repaired });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
