import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';

// ---------------------------------------------------------------------------
// REAL SOURCE UNDER TEST: src/components/cart/CartDrawer.tsx
// V8.3 bug 1: the drawer must force-close when the locale changes. The fix is
// the `useEffect(() => { closeCart(); }, [locale, closeCart])`. Because the
// real CartContext now memoizes closeCart with useCallback (stable ref), the
// effect only re-runs when `locale` actually changes — NOT on every render,
// which would otherwise snap the cart shut the moment it is opened.
// ---------------------------------------------------------------------------

const hoisted = vi.hoisted(() => {
  const cart = {
    items: [] as any[],
    isOpen: true,
    count: 0,
    total: 0,
    openCart: vi.fn(),
    closeCart: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clear: vi.fn(),
  };
  const localeRef = { current: 'en' as string };
  return { cart, localeRef };
});

vi.mock('@/context/CartContext', () => ({
  useCart: () => hoisted.cart,
}));

vi.mock('@/lib/i18n', () => ({
  useLocale: () => ({ locale: hoisted.localeRef.current, t: (k: string) => k }),
}));

import CartDrawer from '@/components/cart/CartDrawer';

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.cart.items = [];
  hoisted.cart.isOpen = true;
  hoisted.cart.count = 0;
  hoisted.cart.total = 0;
  hoisted.localeRef.current = 'en';
});

describe('CartDrawer — V8.3 bug 1: close on locale change', () => {
  it('B1-1: calls closeCart on initial mount (locale en)', () => {
    render(<CartDrawer />);
    expect(hoisted.cart.closeCart).toHaveBeenCalled();
  });

  it('B1-2: re-closes the drawer when the locale changes (e.g. en -> ar)', () => {
    const { rerender } = render(<CartDrawer />);
    expect(hoisted.cart.closeCart).toHaveBeenCalledTimes(1);

    // Simulate the user switching language.
    hoisted.localeRef.current = 'ar';
    act(() => {
      rerender(<CartDrawer />);
    });

    // The effect now sees a new `locale`, so closeCart runs again.
    expect(hoisted.cart.closeCart).toHaveBeenCalledTimes(2);
  });

  it('B1-3: does NOT re-close when only cart open-state changes (closeCart is stable)', () => {
    const { rerender } = render(<CartDrawer />);
    expect(hoisted.cart.closeCart).toHaveBeenCalledTimes(1);

    // Opening the cart (isOpen flips) must NOT re-trigger the close effect,
    // otherwise the drawer would snap shut immediately after being opened.
    act(() => {
      hoisted.cart.isOpen = false;
    });
    rerender(<CartDrawer />);

    expect(hoisted.cart.closeCart).toHaveBeenCalledTimes(1);
  });
});
