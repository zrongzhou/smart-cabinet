/**
 * Bug 2 (P0) — Cart "999" runaway quantity + "$0 each" price fixed.
 *
 * Three layers are exercised:
 *   1. Pure helpers from @/lib/cart:
 *      - migrateCorruptCart() resets a quantity that hit the clamp ceiling (999)
 *        back to 1, and never lets a clamped/inflated quantity survive.
 *      - unionCartItems() keeps the MAX quantity for the same product (never a
 *        SUM), so a login sync reload can't inflate a line.
 *   2. CartContext.addItem():
 *      - repeated adds of the same product keep quantity = 1 (idempotent),
 *      - an existing "$0" line is repaired when a later add carries a real price.
 *    - new products are stored with quantity = 1.
 *   3. The API route (/api/user/cart GET + POST): runs migrateCorruptCart on the
 *      STORED cart, then repairCartPrices() back-fills a missing/zero price from
 *      the Product table. Verifies a corrupted 999 + $0 cart comes back clean.
 *
 * Prisma / auth are fully mocked so no DB is touched.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';

// ---- Mock layer for the API route (prisma + jwt) ----
const { mockPrisma } = vi.hoisted(() => {
  const user = { findUnique: vi.fn(), update: vi.fn() };
  const product = { findMany: vi.fn() };
  class PrismaClient {
    user = user;
    product = product;
    $disconnect = vi.fn();
  }
  return { mockPrisma: { user, product, PrismaClient } };
});

vi.mock('@prisma/client', () => ({
  PrismaClient: mockPrisma.PrismaClient,
  Prisma: {},
}));

vi.mock('@/lib/prisma', () => ({
  prisma: new mockPrisma.PrismaClient(),
}));

vi.mock('@/lib/auth/jwt', () => ({
  verifyToken: () => ({ userId: 'u1', email: 'a@b.c', role: 'user' }),
}));

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({ token: null, isAuthenticated: false, user: null }),
}));

import { migrateCorruptCart, unionCartItems } from '@/lib/cart';
import { CartProvider, useCart } from '@/context/CartContext';
import { GET, POST } from '@/app/api/user/cart/route';
import { NextRequest } from 'next/server';

const mk = (productId: string, quantity = 1, price = 10) =>
  ({
    productId,
    quantity,
    price,
    name: { en: productId, zh: productId, ar: productId },
  }) as any;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

beforeEach(() => {
  // CartProvider persists to localStorage; clear it so each test starts fresh
  // (otherwise a product added in one test leaks into the next).
  if (typeof localStorage !== 'undefined') localStorage.clear();
  mockPrisma.user.findUnique.mockReset();
  mockPrisma.user.update.mockReset();
  mockPrisma.product.findMany.mockReset();
  mockPrisma.user.update.mockResolvedValue({});
});

describe('Bug 2 — migrateCorruptCart resets the 999 ceiling to 1', () => {
  it('quantity 999 (the runaway signature) is reset to 1', () => {
    const out = migrateCorruptCart([mk('A', 999)]);
    expect(out).toHaveLength(1);
    expect(out[0].quantity).toBe(1);
  });

  it('quantity above the threshold (1000) is also reset to 1', () => {
    const out = migrateCorruptCart([mk('A', 1000)]);
    expect(out[0].quantity).toBe(1);
  });

  it('a normal quantity (3) is preserved', () => {
    const out = migrateCorruptCart([mk('A', 3)]);
    expect(out[0].quantity).toBe(3);
  });
});

describe('Bug 2 — unionCartItems never inflates (keeps MAX, not SUM)', () => {
  it('same productId keeps the greater quantity, does not add them', () => {
    const out = unionCartItems([mk('A', 3)], [mk('A', 4)]);
    expect(out).toHaveLength(1);
    expect(out[0].quantity).toBe(4); // MAX(3,4), NOT 3+4=7
  });

  it('repeated union of identical items stays at 1 (no inflation)', () => {
    let acc = unionCartItems([], [mk('A', 1)]);
    for (let i = 0; i < 5; i++) acc = unionCartItems(acc, [mk('A', 1)]);
    expect(acc).toHaveLength(1);
    expect(acc[0].quantity).toBe(1);
  });
});

describe('Bug 2 — CartContext.addItem is idempotent + self-heals $0 price', () => {
  it('repeated addItem of the same product keeps quantity = 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mk('P1', 1, 10)));
    act(() => result.current.addItem(mk('P1', 1, 10)));
    act(() => result.current.addItem(mk('P1', 1, 10)));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('an existing "$0" line is repaired when a later add carries a real price', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem({ ...mk('P1', 1, 0) }));
    expect(result.current.items[0].price).toBe(0);
    act(() => result.current.addItem({ ...mk('P1', 1, 25) }));
    expect(result.current.items[0].price).toBe(25);
  });

  it('a new product is always stored with quantity = 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(mk('P1', 1, 10)));
    act(() => result.current.addItem(mk('P2', 1, 20)));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.items[1].quantity).toBe(1);
  });
});

function makeGet(): NextRequest {
  return new NextRequest('http://localhost/api/user/cart', {
    headers: { Authorization: 'Bearer tok' },
  });
}

function makePost(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/user/cart', {
    method: 'POST',
    headers: { Authorization: 'Bearer tok', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Bug 2 — GET /api/user/cart migrates 999 and repairs $0 price', () => {
  it('qty 999 → 1 and $0 price back-filled from the Product table', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      cart: [
        { productId: 'A', quantity: 999, price: 10, name: { en: 'A', zh: 'A', ar: 'A' } },
        { productId: 'B', quantity: 1, price: 0, name: { en: 'B', zh: 'B', ar: 'B' } },
      ],
    });
    mockPrisma.product.findMany.mockResolvedValue([{ id: 'B', price: 42 }]);

    const res = await GET(makeGet());
    const body = await res.json();

    expect(res.status).toBe(200);
    const a = body.cart.find((i: any) => i.productId === 'A');
    const b = body.cart.find((i: any) => i.productId === 'B');
    expect(a.quantity).toBe(1); // corrupted 999 migrated to 1
    expect(a.price).toBe(10); // already-valid price untouched
    expect(b.price).toBe(42); // $0 repaired from Product table
  });
});

describe('Bug 2 — POST /api/user/cart unions (no sum) and repairs $0', () => {
  it('a stored 999 qty is migrated, union keeps 1, $0 price repaired', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      cart: [{ productId: 'A', quantity: 999, price: 0, name: { en: 'A', zh: 'A', ar: 'A' } }],
    });
    mockPrisma.product.findMany.mockResolvedValue([{ id: 'A', price: 77 }]);

    const res = await POST(
      makePost({ items: [{ productId: 'A', quantity: 1, price: 0, name: { en: 'A', zh: 'A', ar: 'A' } }] })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    const a = body.cart.find((i: any) => i.productId === 'A');
    expect(a.quantity).toBe(1); // migrate 999 (stored) + union 1 (incoming) → 1, not 1000
    expect(a.price).toBe(77); // repaired from Product table
  });

  it('union of stored 3 + incoming 4 keeps 4 (MAX, never 7)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      cart: [{ productId: 'A', quantity: 3, price: 10, name: { en: 'A', zh: 'A', ar: 'A' } }],
    });
    mockPrisma.product.findMany.mockResolvedValue([]); // no repair needed

    const res = await POST(
      makePost({ items: [{ productId: 'A', quantity: 4, price: 10, name: { en: 'A', zh: 'A', ar: 'A' } }] })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    const a = body.cart.find((i: any) => i.productId === 'A');
    expect(a.quantity).toBe(4); // MAX(3,4), explicitly NOT 3+4
  });
});
