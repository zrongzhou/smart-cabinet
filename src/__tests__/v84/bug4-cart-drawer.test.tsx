/**
 * Bug 4 — Arabic locale switch no longer flashes a white/blank frame.
 * The fix: CartDrawer returns null while closed (`if (!isOpen) return null;`)
 * so neither the drawer <aside> nor its overlay are mounted. We assert the
 * closed state renders nothing, and that opening via context DOES mount it.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({ token: null, isAuthenticated: false, user: null }),
}));

vi.mock('@/lib/i18n', () => ({
  useLocale: () => ({ locale: 'en', dir: 'ltr', t: (k: string) => k }),
}));

vi.mock('@/lib/product-url', () => ({
  getProductHref: (slug: string, locale: string) => `/${locale}/products/${slug}`,
}));

import CartDrawer from '@/components/cart/CartDrawer';
import { CartProvider, useCart } from '@/context/CartContext';

afterEach(() => {
  vi.restoreAllMocks();
});

function setup() {
  let captured: any = null;
  function Capture() {
    captured = useCart();
    return null;
  }
  const utils = render(
    <CartProvider>
      <Capture />
      <CartDrawer />
    </CartProvider>
  );
  return { ...utils, getCtx: () => captured };
}

describe('Bug 4 — CartDrawer renders nothing while closed', () => {
  it('no <aside> and no overlay mounted when isOpen=false', () => {
    const { container, getCtx } = setup();
    expect(getCtx()).toBeTruthy();
    expect(container.querySelector('aside')).toBeNull();
    expect(container.querySelector('.fixed.inset-0')).toBeNull();
  });

  it('mounts the <aside> once opened through context', () => {
    const { container, getCtx } = setup();
    act(() => getCtx().openCart());
    expect(container.querySelector('aside')).not.toBeNull();
  });
});
