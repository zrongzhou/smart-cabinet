import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/xiaozhouBackend/', '/api/', '/login', '/register', '/checkout/', '/account/'],
      },
    ],
    sitemap: 'https://test.wstoolcabinet.com/sitemap.xml',
  };
}
