import { MetadataRoute } from 'next';

const BASE_URL = 'https://test.wstoolcabinet.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'zh', 'ar'];

  // Static pages (mapped to each locale)
  const staticPages = [
    '',
    '/about',
    '/products',
    '/solutions',
    '/blog',
    '/contact',
    '/faq',
  ];

  // Build locale-prefixed entries
  const staticEntries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const page of staticPages) {
      staticEntries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : page === '/products' ? 0.9 : 0.7,
      });
    }
  }

  // Dynamic blog posts — we don't import prisma here to keep sitemap fast;
  // use a fixed list or fetch at build time. For now, add known slugs.
  const blogSlugs = [
    'smart-tool-cabinet-2026-guide',
    'vending-machine-inventory-management',
    'iot-tool-storage-solutions',
    'industrial-tool-cabinet-selection',
    'smart-manufacturing-trends-2026',
    'tool-cabinet-security-features',
  ];

  const blogEntries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const slug of blogSlugs) {
      blogEntries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return [...staticEntries, ...blogEntries];
}
