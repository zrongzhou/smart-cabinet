/**
 * V8 Cart utilities — pure functions for normalizing and merging cart items.
 * Kept framework-free so they can be reused by the context and the API layer.
 */

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: { en: string; zh: string; ar: string } | string;
  image?: string | null;
  slug?: string;
}

export type CartStorage = CartItem[];

/**
 * Quantity bounds. The upper bound (999) is what every cart operation clamps to,
 * so a corrupted/inflated quantity can never propagate.
 */
export const MIN_CART_QTY = 1;
export const MAX_CART_QTY = 999;
/** A cart quantity that reaches the clamp ceiling (999) is the unmistakable
 *  signature of the old runaway-doubling bug (1→2→4→…→512→1024→clamp 999).
 *  The UI disables the +/- buttons as soon as a line reaches the upper bound, so
 *  a real user can never legitimately store 999 of one item. Any quantity at or
 *  above this threshold is therefore treated as corrupted and reset to 1, which
 *  repairs the historical "Your Cart (999)" data from the earlier buggy build. */
export const CORRUPT_QTY_THRESHOLD = MAX_CART_QTY;

/** Clamp a raw quantity into the valid [MIN_CART_QTY, MAX_CART_QTY] range. */
export function clampCartQty(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < MIN_CART_QTY) return MIN_CART_QTY;
  if (n > MAX_CART_QTY) return MAX_CART_QTY;
  return n;
}

/** Coerce a possibly-malformed stored value into a valid CartItem[]. */
export function normalizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const map = new Map<string, CartItem>();
  for (const it of raw) {
    if (!it || typeof it !== 'object') continue;
    const productId = (it as any).productId;
    if (typeof productId !== 'string' || !productId) continue;
    const rawQty = Math.floor(Number((it as any).quantity));
    const price = Number((it as any).price) || 0;
    const name = (it as any).name ?? { en: '', zh: '', ar: '' };
    const normalizedName = typeof name === 'string' ? { en: name, zh: name, ar: name } : name;
    const existing = map.get(productId);
    if (existing) {
      // Collapse duplicate productIds by keeping the LARGER quantity (never sum),
      // then clamp — this is the key guard against runaway inflation from a
      // corrupted localStorage that may contain an already-inflated quantity.
      existing.quantity = clampCartQty(Math.max(existing.quantity, rawQty));
    } else {
      map.set(productId, {
        productId,
        quantity: clampCartQty(rawQty || 1),
        price,
        name: normalizedName,
        image: (it as any).image ?? null,
        slug: (it as any).slug,
      });
    }
  }
  return Array.from(map.values());
}

/**
 * One-time migration for corrupted carts produced by a previous buggy build that
 * could double quantities exponentially until they hit the clamp ceiling (999).
 * Any product whose stored quantity reaches CORRUPT_QTY_THRESHOLD is reset to 1,
 * then the whole cart is normalized + clamped. Returns a fresh, safe CartItem[].
 */
export function migrateCorruptCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const fixed = (raw as any[]).map((it) => {
    if (!it || typeof it !== 'object') return it;
    const qty = Math.floor(Number((it as any).quantity));
    // Reset a quantity that hit the clamp ceiling back to a sane baseline. The
    // UI can never push a line to 999 on its own, so reaching it means corruption.
    if (Number.isFinite(qty) && qty >= CORRUPT_QTY_THRESHOLD) {
      return { ...(it as object), quantity: 1 };
    }
    return it;
  });
  return normalizeCart(fixed);
}

/**
 * Idempotent merge used when syncing a guest cart with the server cart on login.
 * For the same productId it keeps the GREATER quantity (never sums), so the sync
 * can be safely re-run on every page load without inflating quantities.
 * Both inputs are clamped so a pre-corrupted quantity cannot survive the merge.
 */
export function unionCartItems(target: CartItem[], incoming: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of target) {
    map.set(item.productId, { ...item, quantity: clampCartQty(item.quantity) });
  }
  for (const item of incoming) {
    const existing = map.get(item.productId);
    if (existing) {
      // Keep the GREATER quantity, then clamp — never sum, so reloads can't inflate.
      existing.quantity = clampCartQty(Math.max(existing.quantity, item.quantity));
      existing.price = item.price || existing.price;
      existing.name = item.name || existing.name;
      existing.image = item.image ?? existing.image;
      existing.slug = item.slug ?? existing.slug;
    } else {
      map.set(item.productId, { ...item, quantity: clampCartQty(item.quantity) });
    }
  }
  return Array.from(map.values());
}

/** Merge two carts, summing quantities for the same productId. */
export function mergeCartItems(target: CartItem[], incoming: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of target) {
    map.set(item.productId, { ...item, quantity: clampCartQty(item.quantity) });
  }
  for (const item of incoming) {
    const existing = map.get(item.productId);
    if (existing) {
      // Sum for an explicit "add to cart" action, but immediately clamp so a
      // rapid series of clicks can never push the quantity past the upper bound.
      existing.quantity = clampCartQty(existing.quantity + item.quantity);
    } else {
      map.set(item.productId, { ...item, quantity: clampCartQty(item.quantity) });
    }
  }
  return Array.from(map.values());
}

/** Total number of units across all items. */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, it) => sum + it.quantity, 0);
}

/** Total price across all items. */
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, it) => sum + it.quantity * it.price, 0);
}
