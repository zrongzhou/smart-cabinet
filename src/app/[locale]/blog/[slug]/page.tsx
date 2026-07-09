import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getBaseUrl } from '@/lib/seo';
import { buildDetailPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import staticBlogs from '@/data/blogs';
import BlogDetailClient from './BlogDetailClient';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * 博客详情页 SEO（V8.9.6）：
 *  - 主关键词 = 从【英文标题 + URL slug】共同提炼（英文，全站统一）。
 *  - 二级关键词 = 该语言对应的【完整博客标题】（中文页用中文标题，阿拉伯页用阿语标题…），只出现在本语言页。
 *  - hreflang = 三语言互指（canonical + languages）。
 * 标题来源：优先查数据库（新增博客只在 DB，确保标题/关键词随 DB 自动更新）；
 *          DB 无记录时回退到静态兜底数据（与客户端 API 缺失时的兜底一致）。
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = (locale || 'en') as 'en' | 'zh' | 'ar';
  // URL 可能带 .html 后缀（如从外链进入），数据 slug 不带，需兼容
  const rawSlug = (slug || '').replace(/\.html$/i, '');

  // 优先查数据库（新增博客只在 DB）
  const blog = await prisma.blogPost.findUnique({
    where: { slug: rawSlug },
    select: { title: true, excerpt: true },
  });

  // DB 无记录时回退到静态兜底数据
  const fallback = !blog ? staticBlogs.find((b) => b.slug === rawSlug) : undefined;
  const titleObj: any = (blog?.title as any) || (fallback?.title as any) || {};
  const excerptObj: any = (blog?.excerpt as any) || (fallback?.excerpt as any) || {};

  const enTitle = (titleObj.en || rawSlug) as string;
  const displayTitle = (titleObj[loc] || enTitle) as string;
  const keywords = buildDetailPageKeywords(enTitle, displayTitle, rawSlug);
  const { canonical, languages } = buildHreflang(getBaseUrl(), loc, `blog/${rawSlug}`);

  const description =
    typeof excerptObj === 'string'
      ? excerptObj
      : (excerptObj?.[loc] || excerptObj?.en || '');

  return {
    title: displayTitle,
    description,
    keywords: keywords.join(', '),
    alternates: { canonical, languages },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <BlogDetailClient slug={slug} />;
}
