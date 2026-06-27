import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const BASE_URL = 'https://test.wstoolcabinet.com';

/**
 * Sitemap — fetches data from DB directly (Server Component)
 * Uses Prisma to query products and blogs at build/runtime
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prisma = new PrismaClient();
  const locales = ['en', 'zh', 'ar'];

  try {
    // Fetch active products from DB
    const products = await prisma.product.findMany({
      where: { status: 'active', deletedAt: null },
      select: { slug: true, updatedAt: true },
    });

    // Fetch published blogs from DB
    const blogs = await prisma.blogPost.findMany({
      where: { status: 'published', deletedAt: null },
      select: { slug: true, updatedAt: true },
    });

    await prisma.$disconnect();

    const staticPages = ['', '/about', '/products', '/solutions', '/blog', '/faq', '/contact'];

    const entries: MetadataRoute.Sitemap = [];

    // Static pages for each locale
    for (const locale of locales) {
      for (const page of staticPages) {
        entries.push({
          url: `${BASE_URL}/${locale}${page}`,
          lastModified: new Date(),
          changeFrequency: page === '' ? 'daily' : 'weekly',
          priority: page === '' ? 1 : page === '/products' ? 0.9 : page === '/about' ? 0.8 : 0.7,
        });
      }

      // Product pages for each locale
      for (const product of products) {
        entries.push({
          url: `${BASE_URL}/${locale}/products/${product.slug}`,
          lastModified: product.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      // Blog pages for each locale
      for (const blog of blogs) {
        entries.push({
          url: `${BASE_URL}/${locale}/blog/${blog.slug}`,
          lastModified: blog.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }

    return entries;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return minimal sitemap on error
    return locales.flatMap(locale =>
      ['', '/about', '/products'].map(page => ({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }))
    );
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}
