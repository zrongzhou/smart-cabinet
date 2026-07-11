import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getMergedBlogList } from '@/lib/blogs';
import { getBaseUrl } from '@/lib/seo';
import { getProductPublicPath } from '@/lib/product-url';

// Force dynamic rendering (this route uses request.headers)
export const dynamic = 'force-dynamic';

/**
 * Dynamic Sitemap Route Handler
 * Generates sitemap.xml dynamically based on the request host
 * This ensures the sitemap uses the correct domain (www.wstoolcabinet.com)
 */
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  // 仅生成英文 URL（用户要求：sitemap 只保留英文版）
  const locales = ['en'];

  try {
    // 统一使用 getBaseUrl()（优先环境变量 NEXT_PUBLIC_BASE_URL），保证 sitemap 的 <loc> 指向标准域名，
    // 避免经由服务器 IP 访问时 sitemap 输出 IP 地址。
    const baseUrl = getBaseUrl();

    // After the 9-product slug rename, the legacy slugs below no longer exist in the
    // DB (see scripts/import/rename-products-9-slugs.sql) and the new slugs are emitted
    // normally. Any residual old URLs are permanently redirected via next.config.mjs.
    const EXCLUDED_PRODUCT_SLUGS = new Set<string>([]);
    const products = await prisma.product.findMany({
      where: { status: 'active', deletedAt: null, slug: { notIn: [...EXCLUDED_PRODUCT_SLUGS] } },
      select: { slug: true, updatedAt: true },
    });

    // Fetch blogs from the merged source (DB + static) so the canonical,
    // descriptive slugs are emitted to the sitemap.
    const mergedBlogs = await getMergedBlogList({ publishedOnly: true, pageSize: 1000 });
    const blogs = mergedBlogs.data.map((b) => ({
      slug: b.slug,
      updatedAt: new Date(b.updatedAt),
    }));

    // 核心静态页 + 23 个新增落地页（managed-items ×10、industries ×10、standalone ×3）。
    // sitemap 仍仅生成英文 URL（用户要求：sitemap 只保留英文版）。
    const staticPages = [
      '', '/about', '/products', '/solutions', '/blog', '/faq', '/contact',
      '/custom-smart-cabinet', '/factory-display', '/shipping-delivery',
      '/managed-items/cnc-tool-management',
      '/managed-items/ppe-safety-supplies',
      '/managed-items/fasteners-consumables',
      '/managed-items/documents-archives',
      '/managed-items/employee-personal-storage',
      '/managed-items/reusable-tools-assets',
      '/managed-items/office-supplies',
      '/managed-items/food-pickup-meal-collection',
      '/managed-items/chemical-liquid-management',
      '/managed-items/grinding-wheels-abrasive-discs',
      '/industries/cnc-machining-precision-parts',
      '/industries/general-manufacturing-smart-factory',
      '/industries/metal-fabrication-aluminum-processing',
      '/industries/mold-injection-molding-tooling',
      '/industries/electronics-semiconductor-manufacturing',
      '/industries/automotive-ev-components',
      '/industries/medical-device-life-science-equipment',
      '/industries/new-materials-cable-functional-materials',
      '/industries/aerospace-machining-tool-management',
      '/industries/construction-ppe-management',
    ];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // 去重：即便 DB 与静态种子的博客 slug 重叠、或产品 slug 撞静态页，也不出现重复 <loc>
    const seen = new Set<string>();

    // Static pages for each locale
    for (const locale of locales) {
      for (const page of staticPages) {
        const url = `${baseUrl}/${locale}${page}`;
        const changeFreq = page === '' ? 'monthly' : 'yearly';
        const priority =
          page === ''
            ? '1.0'
            : page === '/products'
              ? '0.9'
              : page === '/about'
                ? '0.8'
                : page.startsWith('/managed-items') ||
                    page.startsWith('/industries') ||
                    page === '/custom-smart-cabinet' ||
                    page === '/factory-display' ||
                    page === '/shipping-delivery'
                  ? '0.6'
                  : '0.7';

        if (seen.has(url)) continue;
        seen.add(url);

        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url)}</loc>\n`;
        xml += `    <changefreq>${changeFreq}</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += '  </url>\n';
      }

      // Product pages for each locale
      for (const product of products) {
        const publicPath = getProductPublicPath(product.slug);
        const url = `${baseUrl}/${locale}/${publicPath}`;

        if (seen.has(url)) continue;
        seen.add(url);

        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url)}</loc>\n`;
        xml += `    <lastmod>${formatDate(product.updatedAt)}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';
        xml += '  </url>\n';
      }

      // Blog pages for each locale
      for (const blog of blogs) {
        const url = `${baseUrl}/${locale}/blog/${blog.slug}`;

        if (seen.has(url)) continue;
        seen.add(url);

        xml += '  <url>\n';
        xml += `    <loc>${escapeXml(url)}</loc>\n`;
        xml += `    <lastmod>${formatDate(blog.updatedAt)}</lastmod>\n`;
        xml += '    <changefreq>yearly</changefreq>\n';
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
