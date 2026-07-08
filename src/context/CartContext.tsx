'use client';

import {
  createContext,
  useCallback,
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
  unionCartItems,
  migrateCorruptCart,
  clampCartQty,
  cartCount,
  cartTotal,
} from '@/lib/cart';

const STORAGE_KEY = 'sc_cart';

/** Anti-debounce guard: remembers the last serialized cart so the persist
 *  effect can skip no-op writes (avoids redundant localStorage churn / loops). */
function serialize(items: CartItem[]): string {
  try {
    return JSON.stringify(items);
  } catch {
    return '';
  }
}

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
  // Remember the last persisted serialization to skip no-op writes.
  const lastSerialized = useRef<string | null>(null);

  // 1. Load guest cart from localStorage on first mount.
  //    Bug 4 fix: run `migrateCorruptCart` (not raw normalizeCart) so any
  //    quantity > 1000 left by the old buggy build is reset to 1 before use.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(migrateCorruptCart(JSON.parse(raw)));
    } catch {
      // ignore corrupted cart
    }
    setReady(true);
  }, []);

  // 2. Persist to localStorage whenever items change.
  //    Bug 4 fix: only write when the serialized payload actually changed
  //    (anti-debounce guard) to avoid redundant writes and any write loop.
  useEffect(() => {
    if (!ready) return;
    const serialized = serialize(items);
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // storage may be full; ignore
    }
  }, [items, ready]);

  // 3. When the user logs in, idempotently sync the guest cart with the server.
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
        // 3a. Fetch the server cart so we can merge it with the guest cart.
        const getRes = await fetch('/api/user/cart', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const serverCart = getRes.ok ? normalizeCart((await getRes.json()).cart) : [];

        // 3b. Idempotent union (max quantity per product, never a sum) — so a
        //     page reload while logged in cannot keep inflating quantities.
        const unioned = unionCartItems(serverCart, items);

        // 3c. Persist the union back to the server in `replace` mode.
        const postRes = await fetch('/api/user/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items: unioned, replace: true }),
        });
        if (postRes.ok) {
          const data = await postRes.json();
          if (Array.isArray(data.cart)) {
            setItems(normalizeCart(data.cart));
            return;
          }
        }
        // Fallback: adopt the locally computed union if the server call failed.
        setItems(unioned);
      } catch {
        // Network issue — keep the local guest cart.
      }
    })();
  }, [isAuthenticated, token, ready]);

  // V8.5 fix: bug 2 — make "Add to Cart" fully idempotent and self-healing.
  //  • If the product is already in the cart we NEVER inflate its quantity
  //    (it stays at 1); only updateQuantity() may change a line's quantity.
  //  • We DO repair the stored price when the incoming item carries a real one,
  //    which fixes the historical "$0 each" symptom left by the old buggy build.
  //  • The best-effort server sync below posts a single item; the server merges
  //    with a UNION (max, never sum) so repeated adds can never inflate either.
  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const exists = prev.find((it) => it.productId === item.productId);
      if (exists) {
        // Already present: keep quantity at 1, but repair a missing/zero price.
        return prev.map((it) =>
          it.productId === item.productId
            ? { ...it, price: item.price > 0 ? item.price : it.price }
            : it
        );
      }
      // New product: default quantity is always 1 (mergeCartItems clamps too).
      return mergeCartItems(prev, [{ ...item, quantity: 1 }]);
    });
    setIsOpen(true);
    // Best-effort server sync when authenticated (server uses union, not sum).
    if (isAuthenticated && token) {
      fetch('/api/user/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: [{ ...item, quantity: 1 }] }),
      }).catch(() => undefined);
    }
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  // Bug 4 fix: clamp to [MIN, MAX] so the +/- buttons (and any caller) can never
  // drive a quantity out of the valid 1–999 range.
  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.productId === productId ? { ...it, quantity: clampCartQty(quantity) } : it
      )
    );
  };

  const clear = () => setItems([]);

  // V8.3 fix: bug 1 — memoize these so consumers (e.g. CartDrawer's
  // "close on locale change" effect) can depend on a stable reference and the
  // effect does not re-run on every render (which would otherwise snap the cart
  // shut immediately after opening).
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

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
