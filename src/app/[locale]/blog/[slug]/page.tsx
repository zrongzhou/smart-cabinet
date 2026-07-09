import { Metadata } from 'next';
import { buildDetailPageKeywords } from '@/lib/seo-keywords';
import staticBlogs from '@/data/blogs';
import BlogDetailClient from './BlogDetailClient';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * 博客详情页 SEO：
 *  - 主关键词 = 从【英文标题 + URL slug】共同提炼（英文，全站统一）。
 *  - 二级关键词 = 该语言对应的【完整博客标题】（中文页用中文标题，阿拉伯页用阿语标题…），只出现在本语言页。
 * 标题来源：staticBlogs 兜底数据（与客户端 API 缺失时的兜底一致）。
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = (locale || 'en') as 'en' | 'zh' | 'ar';
  // URL 可能带 .html 后缀（如从外链进入），数据 slug 不带，需兼容
  const cleanSlug = (slug || '').replace(/\.html$/i, '');
  const blog = staticBlogs.find((b) => b.slug === cleanSlug);
  if (!blog) return {};
  const titleObj: any = blog.title || {};
  const title = titleObj[loc] || titleObj.en || '';
  const enTitle = titleObj.en || '';
  const excerptObj: any = blog.excerpt;
  const description =
    typeof excerptObj === 'string'
      ? excerptObj
      : (excerptObj?.[loc] || excerptObj?.en || '');
  const keywords = buildDetailPageKeywords(enTitle, title, slug).join(', ');
  return { title, description, keywords };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <BlogDetailClient slug={slug} />;
}
