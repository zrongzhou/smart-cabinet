import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const rules = [
    {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/static/'],
    },
  ];

  return {
    rules,
    sitemap: 'https://test.wstoolcabinet.com/sitemap.xml',
  };
}
