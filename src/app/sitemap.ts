import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = 'https://www.wstoolcabinet.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── 1. Static pages (locale-prefixed) ──────────────────────────────
  const locales = ['en', 'zh', 'ar'] as const;
  const staticPages = [
    { path: '', priority: 1.0, changeFreq: 'daily' as const },
    { path: '/products', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/solutions', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/blog', priority: 0.7, changeFreq: 'weekly' as const },
    { path: '/contact', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/faq', priority: 0.5, changeFreq: 'monthly' as const },
    { path: '/about', priority: 0.6, changeFreq: 'monthly' as const },
  ];

  const staticEntries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const page of staticPages) {
      staticEntries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq,
        priority: page.priority,
      });
    }
  }

  // ── 2. Dynamic blog posts (from DB) ───────────────────────────────
  let blogPosts: { slug: string }[] = [];
  try {
    blogPosts = await prisma.blogPost.findMany({
      select: { slug: true },
      where: { status: 'published', deletedAt: null },
    });
  } catch (e) {
    console.warn('[sitemap] Could not fetch blog posts:', e);
  }

  const blogEntries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const post of blogPosts) {
      blogEntries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  // ── 3. Dynamic products (from DB) ─────────────────────────────────
  let products: { slug: string }[] = [];
  try {
    products = await prisma.product.findMany({
      select: { slug: true },
      where: { deletedAt: null },
    });
  } catch (e) {
    console.warn('[sitemap] Could not fetch products:', e);
  }

  const productEntries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const prod of products) {
      productEntries.push({
        url: `${BASE_URL}/${locale}/products/${prod.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return [...staticEntries, ...blogEntries, ...productEntries];
}
