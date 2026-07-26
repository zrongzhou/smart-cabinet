import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/login', '/register', '/checkout/', '/account/'],
      },
    ],
    sitemap: 'https://www.wstoolcabinet.com/sitemap.xml',
  };
}
