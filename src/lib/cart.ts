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

/** Coerce a possibly-malformed stored value into a valid CartItem[]. */
export function normalizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const items: CartItem[] = [];
  for (const it of raw) {
    if (!it || typeof it !== 'object') continue;
    const productId = (it as any).productId;
    if (typeof productId !== 'string' || !productId) continue;
    const quantity = Math.max(1, Math.floor(Number((it as any).quantity) || 1));
    const price = Number((it as any).price) || 0;
    const name = (it as any).name ?? { en: '', zh: '', ar: '' };
    items.push({
      productId,
      quantity,
      price,
      name: typeof name === 'string' ? { en: name, zh: name, ar: name } : name,
      image: (it as any).image ?? null,
      slug: (it as any).slug,
    });
  }
  return items;
}

/** Merge two carts, summing quantities for the same productId. */
export function mergeCartItems(target: CartItem[], incoming: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of target) map.set(item.productId, { ...item });
  for (const item of incoming) {
    const existing = map.get(item.productId);
    if (existing) {
      existing.quantity = existing.quantity + item.quantity;
    } else {
      map.set(item.productId, { ...item });
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
