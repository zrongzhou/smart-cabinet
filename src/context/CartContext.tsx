'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from '@/components/AuthProvider';
import {
  CartItem,
  CartStorage,
  normalizeCart,
  mergeCartItems,
  cartCount,
  cartTotal,
} from '@/lib/cart';

const STORAGE_KEY = 'sc_cart';

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [ready, setReady] = useState(false);
  // Guard against re-merging on every token change after the first merge.
  const mergedForToken = useRef<string | null>(null);

  // 1. Load guest cart from localStorage on first mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(normalizeCart(JSON.parse(raw)));
    } catch {
      // ignore corrupted cart
    }
    setReady(true);
  }, []);

  // 2. Persist to localStorage whenever items change.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage may be full; ignore
    }
  }, [items, ready]);

  // 3. When the user logs in, merge the guest cart into the server cart.
  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated || !token) {
      mergedForToken.current = null;
      return;
    }
    if (mergedForToken.current === token) return;
    mergedForToken.current = token;

    (async () => {
      try {
        // Push guest items to the server (it merges with existing User.cart).
        const res = await fetch('/api/user/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.cart)) {
            setItems(normalizeCart(data.cart));
          }
        }
      } catch {
        // Network issue — keep the local guest cart.
      }
    })();
  }, [isAuthenticated, token, ready]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const next = mergeCartItems(prev, [item]);
      return next;
    });
    setIsOpen(true);
    // Best-effort server sync when authenticated.
    if (isAuthenticated && token) {
      fetch('/api/user/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: [item] }),
      }).catch(() => undefined);
    }
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.productId === productId ? { ...it, quantity: Math.max(1, quantity) } : it
        )
    );
  };

  const clear = () => setItems([]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        count: cartCount(items),
        total: cartTotal(items),
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (ctx === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
