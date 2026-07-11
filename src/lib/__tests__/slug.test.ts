import { describe, it, expect } from 'vitest';
import { normalizeSlug } from '@/lib/slug';
import { getProductPublicPath } from '@/lib/product-url';

/**
 * P0 regression: normalizeSlug() is the defensive core that keeps the
 * *stored* slug identical to the *link* slug built by getProductHref().
 * Any input the admin can type must converge to a clean, route-safe string.
 */
describe('P0 normalizeSlug — basic normalisation', () => {
  it('returns empty string for empty / blank / undefined input', () => {
    expect(normalizeSlug('')).toBe('');
    expect(normalizeSlug('   ')).toBe('');
    expect(normalizeSlug(undefined as any)).toBe('');
    expect(normalizeSlug(null as any)).toBe('');
  });

  it('lowercases and converts spaces to hyphens', () => {
    expect(normalizeSlug('Foo Bar')).toBe('foo-bar');
    expect(normalizeSlug('  My Product  ')).toBe('my-product');
  });

  it('collapses repeated separators (spaces / hyphens) into one hyphen', () => {
    expect(normalizeSlug('a--b')).toBe('a-b');
    expect(normalizeSlug('a   b')).toBe('a-b'); // 3 spaces -> 1 hyphen
    expect(normalizeSlug('a - b')).toBe('a-b');
  });

  it('strips illegal characters (underscore, punctuation, symbols)', () => {
    expect(normalizeSlug('my_product!')).toBe('myproduct'); // _ and ! removed
    expect(normalizeSlug('hello@world#')).toBe('helloworld');
    expect(normalizeSlug('price$%')).toBe('price');
  });

  it('preserves single dots and collapses repeated dots', () => {
    expect(normalizeSlug('v1.2')).toBe('v1.2');
    expect(normalizeSlug('a..b')).toBe('a.b');
    expect(normalizeSlug('a...b')).toBe('a.b');
  });

  it('trims leading and trailing hyphens', () => {
    expect(normalizeSlug('-hello-')).toBe('hello');
    expect(normalizeSlug('--x--')).toBe('x');
  });

  it('removes non-ASCII unicode (Chinese, accented latin)', () => {
    expect(normalizeSlug('cnc刀具')).toBe('cnc');
    expect(normalizeSlug('智能柜')).toBe('');
    expect(normalizeSlug('café')).toBe('caf');
  });

  it('is idempotent: normalize(normalize(x)) === normalize(x)', () => {
    const inputs = ['Foo Bar!', 'a---b', '--x--', 'CNC_ TOOL ', 'My--Slug'];
    for (const x of inputs) {
      expect(normalizeSlug(normalizeSlug(x))).toBe(normalizeSlug(x));
    }
  });

  it('leaves an already-clean slug unchanged', () => {
    expect(normalizeSlug('cnc-tool-vending-machines')).toBe('cnc-tool-vending-machines');
  });
});

describe('P0 normalizeSlug — legacy "/" path prefix (seed slugs)', () => {
  it('preserves the directory prefix and normalises only the leaf', () => {
    expect(normalizeSlug('applications/CNC Tool Vending.html')).toBe(
      'applications/cnc-tool-vending.html',
    );
  });

  it('normalises a messy leaf but keeps the applications/ prefix intact', () => {
    // Underscores are illegal chars -> stripped (not converted to hyphens),
    // spaces -> hyphens, leading/trailing separators trimmed.
    expect(normalizeSlug('applications/  Bad__Slug!  ')).toBe('applications/badslug');
  });

  it('normalises a middle-segment slug prefix too', () => {
    expect(normalizeSlug('solutions/custom-industrial-vending-machine.html')).toBe(
      'solutions/custom-industrial-vending-machine.html',
    );
  });

  it('still works when the leaf alone contains the illegal chars', () => {
    expect(normalizeSlug('applications/My New Slug')).toBe('applications/my-new-slug');
  });
});

describe('P0 invariant — link slug === lookup slug', () => {
  it('normalised slug yields a route-safe public path with no spaces/caps/illegal chars', () => {
    const raw = 'My NEW  Product!!.html';
    const slug = normalizeSlug(raw);
    const path = getProductPublicPath(slug);
    expect(slug).toBe('my-new-product.html');
    // The public path must not break the catch-all route on either form.
    expect(/\s/.test(path)).toBe(false);
    expect(/[A-Z]/.test(path)).toBe(false);
    expect(path).toBe('products/my-new-product.html');
  });

  it('a legacy prefixed slug keeps its prefix in the public path', () => {
    const slug = normalizeSlug('applications/CNC Tool Vending.html');
    const path = getProductPublicPath(slug);
    expect(path).toBe('applications/cnc-tool-vending.html');
  });
});
