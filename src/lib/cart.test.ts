import { describe, it, expect } from 'vitest';
import {
  normalizeCart,
  mergeCartItems,
  cartCount,
  cartTotal,
  type CartItem,
} from './cart';

describe('cart utilities (V8 T2)', () => {
  it('normalizeCart returns [] for non-arrays', () => {
    expect(normalizeCart(null)).toEqual([]);
    expect(normalizeCart(undefined)).toEqual([]);
    expect(normalizeCart('nope')).toEqual([]);
    expect(normalizeCart(42)).toEqual([]);
  });

  it('normalizeCart drops items without a valid productId', () => {
    const raw = [{ quantity: 1, price: 5 }, null, 'x', { productId: 'p1', quantity: 2, price: 5 }];
    const items = normalizeCart(raw);
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('p1');
  });

  it('normalizeCart coerces quantity and price', () => {
    const items = normalizeCart([
      { productId: 'p1', quantity: '3', price: '9.5' },
      { productId: 'p2', quantity: 0, price: 'abc' },
      { productId: 'p3', quantity: 2.7, price: 4 },
    ]);
    expect(items[0].quantity).toBe(3);
    expect(items[0].price).toBe(9.5);
    expect(items[1].quantity).toBe(1); // max(1, floor(0))
    expect(items[1].price).toBe(0);
    expect(items[2].quantity).toBe(2); // floor(2.7)
    expect(items[2].price).toBe(4);
  });

  it('normalizeCart normalises a string name and defaults image/slug', () => {
    const items = normalizeCart([{ productId: 'p1', quantity: 1, price: 1, name: 'Widget' }]);
    expect(items[0].name).toEqual({ en: 'Widget', zh: 'Widget', ar: 'Widget' });
    expect(items[0].image).toBeNull();
    expect(items[0].slug).toBeUndefined();
  });

  it('normalizeCart keeps an object name and provided slug/image', () => {
    const items = normalizeCart([
      { productId: 'p1', quantity: 1, price: 1, name: { en: 'A', zh: 'B', ar: 'C' }, image: '/i.png', slug: 'p1' },
    ]);
    expect(items[0].name).toEqual({ en: 'A', zh: 'B', ar: 'C' });
    expect(items[0].image).toBe('/i.png');
    expect(items[0].slug).toBe('p1');
  });

  it('mergeCartItems sums quantities for the same product', () => {
    const target: CartItem[] = [{ productId: 'p1', quantity: 2, price: 5, name: { en: 'A', zh: 'A', ar: 'A' } }];
    const incoming: CartItem[] = [{ productId: 'p1', quantity: 3, price: 5, name: { en: 'A', zh: 'A', ar: 'A' } }];
    const merged = mergeCartItems(target, incoming);
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(5);
  });

  it('mergeCartItems keeps distinct products', () => {
    const target: CartItem[] = [{ productId: 'p1', quantity: 1, price: 5, name: { en: 'A', zh: 'A', ar: 'A' } }];
    const incoming: CartItem[] = [{ productId: 'p2', quantity: 2, price: 3, name: { en: 'B', zh: 'B', ar: 'B' } }];
    const merged = mergeCartItems(target, incoming);
    expect(merged).toHaveLength(2);
  });

  it('cartCount and cartTotal aggregate correctly', () => {
    const items: CartItem[] = [
      { productId: 'p1', quantity: 2, price: 5, name: { en: 'A', zh: 'A', ar: 'A' } },
      { productId: 'p2', quantity: 3, price: 10, name: { en: 'B', zh: 'B', ar: 'B' } },
    ];
    expect(cartCount(items)).toBe(5);
    expect(cartTotal(items)).toBe(40);
    expect(cartCount([])).toBe(0);
    expect(cartTotal([])).toBe(0);
  });
});
