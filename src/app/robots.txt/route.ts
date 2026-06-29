import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering (this route uses request.headers)
export const dynamic = 'force-dynamic';

/**
 * Dynamic Robots Route Handler
 * Generates robots.txt dynamically based on the request host
 */
export async function GET(request: NextRequest) {
  const host = request.headers.get('host') || 'www.wstoolcabinet.com';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/static/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
