import { describe, it, expect } from 'vitest';
import { generateMetadata } from '@/app/[locale]/page';
import type { Metadata } from 'next';

/**
 * N1 regression: the homepage generateMetadata must emit an Open Graph image
 * and a Twitter card image, both as ABSOLUTE URLs (https://www.wstoolcabinet.com/images/logo.svg),
 * so social shares render a preview instead of a broken relative path.
 *
 * We call the real generateMetadata (the source of truth) for en / zh / ar.
 */
const EXPECTED = 'https://www.wstoolcabinet.com/images/logo.svg';

describe('N1 homepage metadata — absolute og:image / twitter:image', () => {
  it('en: openGraph.images[0].url and twitter.images[0] are the absolute logo URL', async () => {
    const md = (await generateMetadata({ params: { locale: 'en' } })) as Metadata;
    expect(md.openGraph).toBeDefined();
    expect(Array.isArray(md.openGraph!.images)).toBe(true);
    const og = (md.openGraph!.images as any[])[0];
    expect(og.url).toBe(EXPECTED);
    expect(og.width).toBe(1200);
    expect(og.height).toBe(630);
    expect(Array.isArray(md.twitter!.images)).toBe(true);
    expect((md.twitter!.images as string[])[0]).toBe(EXPECTED);
  });

  it('zh: same absolute og/twitter image', async () => {
    const md = (await generateMetadata({ params: { locale: 'zh' } })) as Metadata;
    expect((md.openGraph!.images as any[])[0].url).toBe(EXPECTED);
    expect((md.twitter!.images as string[])[0]).toBe(EXPECTED);
  });

  it('ar: same absolute og/twitter image', async () => {
    const md = (await generateMetadata({ params: { locale: 'ar' } })) as Metadata;
    expect((md.openGraph!.images as any[])[0].url).toBe(EXPECTED);
    expect((md.twitter!.images as string[])[0]).toBe(EXPECTED);
  });

  it('image URL is absolute (starts with https://), never a relative path', async () => {
    const md = (await generateMetadata({ params: { locale: 'en' } })) as Metadata;
    const ogUrl = (md.openGraph!.images as any[])[0].url as string;
    expect(ogUrl.startsWith('https://')).toBe(true);
    expect(ogUrl.startsWith('/')).toBe(false);
  });
});
