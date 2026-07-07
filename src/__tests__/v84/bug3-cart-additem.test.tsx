/**
 * Bug 3 — Cart "999+" runaway quantity no longer happens.
 * Verifies the V8.4 fix: CartContext.addItem is a no-op when the product is
 * already in the cart (it does NOT keep summing/inflation), so repeated
 * "Add to Cart" clicks of the same product leave quantity = 1. Also asserts the
 * idempotent union used on login sync via @/lib/cart stays stable.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({ token: null, isAuthenticated: false, user: null }),
}));

import { CartProvider, useCart } from '@/context/CartContext';
import { unionCartItems } from '@/lib/cart';

afterEach(() => {
  vi.restoreAllMocks();
});

const mk = (productId: string, quantity = 1) =>
  ({ productId, quantity, price: 10, name: { en: productId, zh: productId, ar: productId } }) as any;

describe('Bug 3 — addItem is idempotent (no 999+ inflation)', () => {
  it('repeated addItem of the same product keeps quantity = 1', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(mk('P1')));
    act(() => result.current.addItem(mk('P1')));
    act(() => result.current.addItem(mk('P1')));
    act(() => result.current.addItem(mk('P1')));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('updates quantity for a DIFFERENT product without touching the first', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(mk('P1')));
    act(() => result.current.addItem(mk('P2')));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.find((i: any) => i.productId === 'P1')!.quantity).toBe(1);
    expect(result.current.items.find((i: any) => i.productId === 'P2')!.quantity).toBe(1);
  });

  it('unionCartItems stays stable across 5 repeated merges (no inflation)', () => {
    let acc = unionCartItems([], [mk('A', 1)]);
    for (let i = 0; i < 5; i++) acc = unionCartItems(acc, [mk('A', 1)]);
    expect(acc).toHaveLength(1);
    expect(acc[0].quantity).toBe(1);
  });
});
