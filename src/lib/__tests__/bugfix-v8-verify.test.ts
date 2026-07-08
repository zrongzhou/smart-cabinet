/**
 * V8 BugFix regression verification (run by delivery lead on main thread
 * because the QA agent hit a 429 rate-limit and could not complete).
 *
 * Focuses on the two highest-risk root-cause fixes:
 *  - Bug 3: cart quantity must NOT auto-inflate on login/refresh sync.
 *  - Bug 7: numeric DB blog slugs must resolve to the canonical descriptive slug.
 */
import { describe, it, expect, vi } from 'vitest';

// blogs.ts imports prisma at module load; mock it so no DB connection is needed.
vi.mock('@/lib/prisma', () => ({ prisma: {} }));

import { unionCartItems, normalizeCart } from '@/lib/cart';
import { isDescriptiveSlug, resolveBlogSlug } from '@/lib/blogs';

const item = (productId: string, quantity: number, price = 10) =>
  ({ productId, quantity, price, name: { en: productId } }) as any;

describe('Bug3 — cart sync is idempotent (no auto-increment)', () => {
  it('unionCartItems keeps the GREATER quantity, never sums', () => {
    const server = [item('A', 2)];
    const local = [item('A', 5)];
    const out = unionCartItems(server, local);
    expect(out).toHaveLength(1);
    expect(out[0].quantity).toBe(5); // max(2,5) = 5, NOT 7
  });

  it('repeated merges on every page load stay stable (no inflation)', () => {
    const base = [item('A', 3)];
    let acc = unionCartItems([], base);
    acc = unionCartItems(acc, base); // simulate second refresh
    acc = unionCartItems(acc, base); // simulate third refresh
    expect(acc).toHaveLength(1);
    expect(acc[0].quantity).toBe(3); // unchanged across re-runs
  });

  it('normalizeCart dedups same productId by max quantity', () => {
    const raw = [item('A', 2), item('A', 9), item('B', 1)];
    const out = normalizeCart(raw);
    expect(out).toHaveLength(2);
    expect(out.find((i: any) => i.productId === 'A')!.quantity).toBe(9);
  });

  it('unionCartItems merges distinct products without cross-contamination', () => {
    const out = unionCartItems([item('A', 3)], [item('B', 2)]);
    expect(out.map((i: any) => i.productId).sort()).toEqual(['A', 'B']);
    expect(out.find((i: any) => i.productId === 'A')!.quantity).toBe(3);
    expect(out.find((i: any) => i.productId === 'B')!.quantity).toBe(2);
  });
});

describe('Bug7 — blog slug resolves to canonical descriptive form', () => {
  it('isDescriptiveSlug rejects numeric / empty / null', () => {
    expect(isDescriptiveSlug('13')).toBe(false);
    expect(isDescriptiveSlug('')).toBe(false);
    expect(isDescriptiveSlug(null)).toBe(false);
  });

  it('isDescriptiveSlug accepts kebab-case', () => {
    expect(isDescriptiveSlug('cnc-tool-inventory-management-guide')).toBe(true);
    expect(isDescriptiveSlug('industrial-vending-machine-trends-2026')).toBe(true);
  });

  it('resolveBlogSlug returns a descriptive slug unchanged', () => {
    expect(resolveBlogSlug('cnc-tool-inventory-management-guide', '14')).toBe(
      'cnc-tool-inventory-management-guide',
    );
  });

  it('resolveBlogSlug falls back to static slug for numeric DB slug', () => {
    expect(resolveBlogSlug('13', '13')).toBe('industrial-vending-machine-trends-2026.html');
    expect(resolveBlogSlug('14', '14')).toBe('cnc-tool-inventory-management-guide.html');
  });
});
