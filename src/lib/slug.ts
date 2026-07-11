/**
 * slug.ts — Shared product slug normalization (v8.10.2c, P0 fix).
 *
 * Background: New products created from the admin sometimes 404 on their
 * detail page because the *stored* slug did not match the *link* slug that
 * `getProductHref()` builds. The root cause was un-normalized user input
 * (stray spaces, mixed case, double hyphens, leading/trailing hyphens, or
 * characters that the catch-all route splits differently than the lookup).
 *
 * Fix strategy (defensive, works without touching the live DB):
 *  - Normalize every slug at save time on BOTH client and server so the value
 *    persisted to the DB is always the canonical one.
 *  - Keep `getProductHref()` as the single source of truth for links — since
 *    it uses the stored slug verbatim, a normalized slug guarantees the link
 *    and the lookup use the exact same string → no 404.
 *  - Preserve the legacy `/` path prefix used by seed slugs
 *    (e.g. `applications/tool-vending-machine-cnc-tools.html`). Only the *leaf*
 *    segment after the last `/` is normalized, so editing an existing
 *    application/solution product never corrupts its routing prefix.
 */

/**
 * Normalize a single slug leaf segment.
 *  - lowercase
 *  - spaces → hyphens
 *  - drop any character outside [a-z0-9.\-] (this also removes `/`, which would
 *    otherwise break the catch-all route for newly created products)
 *  - collapse repeated dots / hyphens
 *  - trim leading / trailing hyphens
 */
function normalizeLeaf(leaf: string): string {
  return (leaf || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Normalize a full product slug.
 *
 * @param raw the raw slug typed by the user or auto-generated.
 * @returns the canonical slug. Legacy `/`-prefixed seed slugs keep their
 *          directory prefix (only the leaf is normalized).
 */
export function normalizeSlug(raw: string): string {
  const value = (raw || '').trim();
  if (!value) return '';
  const lastSlash = value.lastIndexOf('/');
  if (lastSlash >= 0) {
    // Preserve the existing directory prefix (e.g. "applications/") and only
    // normalize the leaf segment so seeded routing prefixes survive an edit.
    const dir = value.slice(0, lastSlash + 1);
    const leaf = value.slice(lastSlash + 1);
    return `${dir}${normalizeLeaf(leaf)}`;
  }
  return normalizeLeaf(value);
}

/**
 * Convert a user-entered "URL / slug" (public path or raw slug) into the value
 * that should be persisted as `Product.slug` in the database.
 *
 * This is the inverse of `getProductPublicPath()` in product-url.ts:
 *   - Cabinet products are stored as a *leaf* slug; `getProductPublicPath()`
 *     re-prepends `products/`, so a user-entered public path
 *     `products/xxx.html` must have that prefix stripped.
 *   - `solutions/...` and `applications/...` keep their directory prefix
 *     verbatim (their dedicated routes expect the prefixed slug).
 *   - A cabinet leaf MUST NOT contain a `/`: otherwise `getProductPublicPath()`
 *     would treat the slash as a routing prefix and SKIP the `products/` segment
 *     when building the link, so the generated detail URL would 404. Any stray
 *     internal slash (e.g. a pasted `.../a.html`) is therefore collapsed to a
 *     hyphen before we normalize.
 *   - Everything is finally passed through `normalizeSlug()` so the stored value
 *     always equals the link slug built by `getProductHref()` (no 404).
 */
export function toStoredSlug(input: string): string {
  const raw = (input || '').trim();
  if (!raw) return '';

  // Prefixed routes keep their directory prefix untouched.
  if (/^(solutions|applications)\//i.test(raw)) {
    return normalizeSlug(raw);
  }

  // Public-path form `products/xxx` -> strip the `products/` prefix to obtain
  // the cabinet leaf (getProductPublicPath() re-adds it when building the link).
  let leaf = raw;
  if (leaf.toLowerCase().startsWith('products/')) {
    leaf = leaf.slice('products/'.length);
  }

  // Cabinet leaves must be slash-free (see note above). Collapse any internal slash.
  leaf = leaf.replace(/\//g, '-');

  return normalizeSlug(leaf);
}
