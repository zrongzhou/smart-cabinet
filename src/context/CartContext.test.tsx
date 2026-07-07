import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const authRef = vi.hoisted(() => ({
  state: {
    token: null as string | null,
    isAuthenticated: false,
    user: null,
    logout: () => {},
    login: async () => ({ success: true }),
    register: async () => ({ success: true }),
    refreshUser: async () => {},
    updateUser: () => {},
  },
}));

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => authRef.state,
}));

function makeItem(productId: string, quantity: number, price: number) {
  return { productId, quantity, price, name: { en: productId, zh: productId, ar: productId } };
}

describe('CartContext (V8 T2)', () => {
  beforeEach(() => {
    localStorage.clear();
    authRef.state = { ...authRef.state, token: null, isAuthenticated: false };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ cart: [] }) })
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('starts empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    expect(result.current.count).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.items).toEqual([]);
  });

  it('adds items, merges same product, and computes count/total', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => result.current.addItem(makeItem('p1', 1, 10)));
    act(() => result.current.addItem(makeItem('p1', 2, 10)));
    expect(result.current.count).toBe(3);
    expect(result.current.total).toBe(30);
    expect(result.current.items).toHaveLength(1);
  });

  it('updates quantity with a minimum of 1 and removes items', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => result.current.addItem(makeItem('p1', 2, 5)));
    act(() => result.current.updateQuantity('p1', 0));
    expect(result.current.count).toBe(1);
    act(() => result.current.removeItem('p1'));
    expect(result.current.count).toBe(0);
  });

  it('clears the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => result.current.addItem(makeItem('p1', 1, 5)));
    act(() => result.current.clear());
    expect(result.current.items).toEqual([]);
  });

  it('persists the guest cart to localStorage', async () => {
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => result.current.addItem(makeItem('p1', 2, 7)));
    await waitFor(() => {
      const raw = localStorage.getItem('sc_cart');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].productId).toBe('p1');
      expect(parsed[0].quantity).toBe(2);
    });
  });

  it('hydrates the guest cart from localStorage on mount', () => {
    localStorage.setItem('sc_cart', JSON.stringify([makeItem('pX', 2, 4)]));
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    expect(result.current.count).toBe(2);
    expect(result.current.total).toBe(8);
  });

  it('merges the guest cart to the server when the user logs in', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ cart: [makeItem('s1', 1, 99)] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    act(() => result.current.addItem(makeItem('p1', 1, 5)));

    // Simulate login by mutating the mocked auth state, then force a re-render
    // so the cart's merge effect picks up the new authenticated state.
    authRef.state = { ...authRef.state, token: 'jwt-token', isAuthenticated: true };
    act(() => {
      result.current.openCart();
      result.current.closeCart();
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/user/cart',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
