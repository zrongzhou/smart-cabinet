import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getBaseUrl, jsonLdArticle } from '@/lib/seo';
import { buildDetailPageKeywords, buildHreflang, resolvePageKeywords } from '@/lib/seo-keywords';
import { blogMeta, pickTrilingual } from '@/lib/seo-page-meta';
import staticBlogs from '@/data/blogs';
import BlogDetailClient, { BlogDetailDTO } from './BlogDetailClient';
import JsonLd from '@/components/JsonLd';

// 静态内容页，ISR 重新校验
export const revalidate = 300;

interface PageProps {
  params: { locale: string; slug: string };
}

/**
 * Blog detail DTO — flattened, serializable shape consumed by BlogDetailClient.
 * All localized fields are resolved on the server so the H1 + article body are
 * present in the SSR HTML (no client-side fetch, no hydration flash).
 */
function toBlogDto(row: {
  id: string;
  slug: string;
  title: any;
  excerpt?: any;
  content?: any;
  author?: string;
  publishedAt?: Date | string;
  image?: string | null;
  faq?: any;
  tags?: { id: string; slug: string; name: any }[];
}): BlogDetailDTO {
  const title = (row.title && typeof row.title === 'object' ? row.title : { en: '', zh: '', ar: '' }) as BlogDetailDTO['title'];
  const excerpt = (row.excerpt && typeof row.excerpt === 'object' ? row.excerpt : { en: '', zh: '', ar: '' }) as BlogDetailDTO['excerpt'];
  const content = (row.content && typeof row.content === 'object' ? row.content : { en: '', zh: '', ar: '' }) as BlogDetailDTO['content'];
  // V8.11: pass the structured blog-level FAQ list through unchanged (it is
  // already stored as the canonical [{ question:{en,zh,ar}, answer:{en,zh,ar} }]).
  const faq = Array.isArray(row.faq) ? row.faq : undefined;
  return {
    id: row.id,
    slug: row.slug,
    title,
    excerpt,
    content,
    author: row.author || '',
    publishedAt: row.publishedAt ? new Date(row.publishedAt).toISOString() : new Date().toISOString(),
    image: row.image || null,
    tags: (row.tags || []).map((t) => ({
      id: t.id,
      slug: t.slug,
      name: (t.name && typeof t.name === 'object' ? t.name : { en: t.name || t.slug, zh: t.name || t.slug, ar: t.name || t.slug }),
    })),
    faq: faq as BlogDetailDTO['faq'],
  };
}

/**
 * 博客详情页 SEO（V8.9.9+）：
 *  - 主关键词 = 从【英文标题 + URL slug】共同提炼（英文，全站统一）。
 *  - 二级关键词 = 该语言对应的【完整博客标题】（中文页用中文标题，阿拉伯页用阿语标题…），只出现在本语言页。
 * 标题来源：优先查数据库（新增博客只在 DB，确保标题/关键词随 DB 自动更新）；
 *          DB 无记录时回退到静态兜底数据（与客户端 API 缺失时的兜底一致）。
 *
 * V8.10 (SEO fix): 博客正文 H1 + 内容改为服务端拉取并作为 props 传给
 * BlogDetailClient，SSR HTML 即包含正文，不再依赖客户端 useEffect 拉取。
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = params;
  const loc = (locale || 'en') as 'en' | 'zh' | 'ar';
  // 保留真实 URL 段（可能带 .html，如外链进入）；rawSlug 仅用于提炼词元与兜底匹配
  const fullSlug = (slug || '').trim();
  const rawSlug = fullSlug.replace(/\.html$/i, '');

  // 优先查数据库（新增博客只在 DB）。DB slug 格式不统一，兼容带/不带 .html
  const blog = await prisma.blogPost.findFirst({
    where: { slug: { in: [fullSlug, rawSlug] }, deletedAt: null },
    select: { title: true, excerpt: true, publishedAt: true, image: true, seoKeywords: true },
  });

  // DB 无记录时回退到静态兜底数据
  const fallback = !blog ? staticBlogs.find((b) => b.slug === fullSlug || b.slug === rawSlug) : undefined;
  const titleObj: any = (blog?.title as any) || (fallback?.title as any) || {};
  const excerptObj: any = (blog?.excerpt as any) || (fallback?.excerpt as any) || {};

  const enTitle = (titleObj.en || rawSlug) as string;
  const displayTitle = (titleObj[loc] || enTitle) as string;
  // SEO 关键词（manual>auto）：优先使用后台手动设置的 seoKeywords（逗号分隔串），
  // 留空则回落到自动两级关键词生成器。resolvePageKeywords 返回已 join 的串。
  const manualKw = (blog?.seoKeywords as unknown as string | null) || '';
  const keywords = resolvePageKeywords(manualKw, buildDetailPageKeywords(enTitle, displayTitle, rawSlug));
  const { canonical, languages } = buildHreflang(getBaseUrl(), loc, `blog/${fullSlug}`);

  // V8.10: 优先使用 xlsx 策划的 blogMeta 描述（按真实 slug 匹配），回退到 DB excerpt
  const xlsxDesc = pickTrilingual(blogMeta[fullSlug], loc) || pickTrilingual(blogMeta[rawSlug], loc);
  const description =
    xlsxDesc ||
    (typeof excerptObj === 'string'
      ? excerptObj
      : (excerptObj?.[loc] || excerptObj?.en || ''));

  return {
    title: `${enTitle} | Qtech`,
    description,
    keywords: keywords,
    alternates: { canonical, languages },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = params;
  const loc = (locale || 'en') as 'en' | 'zh' | 'ar';
  // 保留真实 URL 段（可能带 .html，如外链进入）
  const fullSlug = (slug || '').trim();
  const rawSlug = fullSlug.replace(/\.html$/i, '');

  // === V8.10: 服务端拉取博客正文 + 近期博客，直接作为 props 传给客户端组件 ===
  // 这样 H1 / 正文 / 近期文章 都在 SSR HTML 中，解决用户反馈的「H1 不在 SSR」问题。
  const blogRow = await prisma.blogPost.findFirst({
    where: { slug: { in: [fullSlug, rawSlug] }, deletedAt: null },
    include: { tags: true },
  });

  let blog: BlogDetailDTO | null = null;
  let recentBlogs: BlogDetailDTO[] = [];

  if (blogRow) {
    blog = toBlogDto(blogRow);
    // 近期文章：同为已发布、排除当前篇，按发布时间倒序取 3 篇
    const recentRows = await prisma.blogPost.findMany({
      where: { status: 'published', deletedAt: null, id: { not: blogRow.id } },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: { tags: true },
    });
    recentBlogs = recentRows.map((r) => toBlogDto(r));
  } else {
    // 静态兜底：从 staticBlogs 构造 DTO（保持 SSR 内容完整）
    const fb = staticBlogs.find((b) => b.slug === fullSlug || b.slug === rawSlug);
    if (fb) {
      const title = (typeof fb.title === 'string' ? { zh: fb.title, en: fb.title, ar: fb.title } : fb.title) as any;
      const excerpt = (typeof fb.excerpt === 'string' ? { zh: fb.excerpt, en: fb.excerpt, ar: fb.excerpt } : (fb.excerpt || { zh: '', en: '', ar: '' })) as any;
      const content = (typeof fb.content === 'string' ? { zh: fb.content, en: fb.content, ar: fb.content } : (fb.content || { zh: '', en: '', ar: '' })) as any;
      blog = {
        id: fb.id || fb.slug,
        slug: fb.slug,
        title,
        excerpt,
        content,
        author: (fb as any).author || '',
        publishedAt: (fb as any).publishedAt || new Date().toISOString(),
        image: (fb as any).image || null,
        tags: ((fb as any).tags || []).map((t: string) => ({ id: t, slug: t.toLowerCase().replace(/\s+/g, '-'), name: { en: t, zh: t, ar: t } })),
        // Static seeds have no structured FAQ; fall back to the legacy body block.
        faq: Array.isArray((fb as any).faq) ? (fb as any).faq : undefined,
      };
      // 静态近期文章
      recentBlogs = staticBlogs
        .filter((b) => b.slug !== fb.slug)
        .slice(0, 3)
        .map((b) => {
          const t = (typeof b.title === 'string' ? { zh: b.title, en: b.title, ar: b.title } : b.title) as any;
          const e = (typeof b.excerpt === 'string' ? { zh: b.excerpt, en: b.excerpt, ar: b.excerpt } : (b.excerpt || { zh: '', en: '', ar: '' })) as any;
          const c = (typeof b.content === 'string' ? { zh: b.content, en: b.content, ar: b.content } : (b.content || { zh: '', en: '', ar: '' })) as any;
          return {
            id: b.id || b.slug,
            slug: b.slug,
            title: t,
            excerpt: e,
            content: c,
            author: (b as any).author || '',
            publishedAt: (b as any).publishedAt || new Date().toISOString(),
            image: (b as any).image || null,
            tags: [],
          };
        });
    }
  }

  const baseUrl = getBaseUrl();
  const blogImage = (blog?.image as string | null) || '';
  // 若无封面则用站点默认 logo 兜底
  const imageForJsonLd = blogImage || `${baseUrl}/images/logo.svg`;
  const displayTitle = blog ? (blog.title[loc] || blog.title.en) : rawSlug;
  const datePublished = blog?.publishedAt ? new Date(blog.publishedAt).toISOString() : new Date().toISOString();

  const articleJsonLd = jsonLdArticle({
    title: displayTitle,
    description: blog?.excerpt?.[loc] || blog?.excerpt?.en || '',
    image: imageForJsonLd,
    slug: fullSlug,
    datePublished,
  });

  return (
    <>
      {/* Article 结构化数据（JSON-LD）—— 服务端输出，SSR 即包含 */}
      <JsonLd data={articleJsonLd} />
      <BlogDetailClient blog={blog} recentBlogs={recentBlogs} />
    </>
  );
}
