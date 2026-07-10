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
 *    (e.g. `applications/cnc-tool-vending-machine.html`). Only the *leaf*
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
