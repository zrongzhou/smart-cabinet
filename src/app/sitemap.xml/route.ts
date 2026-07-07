import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getMergedBlogList } from '@/lib/blogs';

// Force dynamic rendering (this route uses request.headers)
export const dynamic = 'force-dynamic';

/**
 * Dynamic Sitemap Route Handler
 * Generates sitemap.xml dynamically based on the request host
 * This ensures the sitemap uses the correct domain (test.wstoolcabinet.com or www.wstoolcabinet.com)
 */
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  const locales = ['en', 'zh', 'ar'];

  try {
    // Get the host from the request headers
    const host = request.headers.get('host') || 'www.wstoolcabinet.com';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Fetch active products from DB
    const products = await prisma.product.findMany({
      where: { status: 'active', deletedAt: null },
      select: { slug: true, updatedAt: true },
    });

    // Fetch blogs from the merged source (DB + static) so the canonical,
    // descriptive slugs are emitted to the sitemap.
    const mergedBlogs = await getMergedBlogList({ publishedOnly: true, pageSize: 1000 });
    const blogs = mergedBlogs.data.map((b) => ({
      slug: b.slug,
      updatedAt: new Date(b.updatedAt),
    }));

    const staticPages = ['', '/about', '/products', '/solutions', '/blog', '/faq', '/contact'];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages for each locale
    for (const locale of locales) {
      for (const page of staticPages) {
        const url = `${baseUrl}/${locale}${page}`;
        const changeFreq = page === '' ? 'daily' : 'weekly';
        const priority = page === '' ? '1.0' : page === '/products' ? '0.9' : page === '/about' ? '0.8' : '0.7';

        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url)}</loc>\n`;
        xml += `    <changefreq>${changeFreq}</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += '  </url>\n';
      }

      // Product pages for each locale
      for (const product of products) {
        // 按 store 的 slug 决定公开路径：含 "/" 的（如 applications/...、solutions/...）
        // 公开路径即 slug 本身；否则落在 /products/ 下（柜体）。
        const publicPath = product.slug.includes('/') ? product.slug : `products/${product.slug}`;
        const url = `${baseUrl}/${locale}/${publicPath}`;
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url)}</loc>\n`;
        xml += `    <lastmod>${formatDate(product.updatedAt)}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      }

      // Blog pages for each locale
      for (const blog of blogs) {
        const url = `${baseUrl}/${locale}/blog/${blog.slug}`;
        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url)}</loc>\n`;
        xml += `    <lastmod>${formatDate(blog.updatedAt)}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

// Helper: escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper: format date to YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
