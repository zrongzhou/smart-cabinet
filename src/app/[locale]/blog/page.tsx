import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getBaseUrl } from '@/lib/seo';
import { buildListPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import { BlogListClient } from './BlogListClient';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  // 从数据库取近期已发布博客标题，关键词随 DB 新增博客自动更新
  const blogs = await prisma.blogPost.findMany({
    where: { status: 'published', deletedAt: null },
    select: { title: true },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  });
  // 主关键词从【英文标题】提炼（全站英文为主）；二级用本语言完整标题（仅本语言页出现）
  const englishNames = blogs
    .map((b: any) => (b.title?.en || '') as string)
    .filter(Boolean);
  const displayNames = blogs
    .map((b: any) => (b.title?.[locale] || b.title?.en || '') as string)
    .filter(Boolean);
  const keywords = buildListPageKeywords(englishNames, displayNames).join(', ');
  // hreflang：三语言互指（canonical + languages）
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/blog');
  return {
    title: `Blog | WS Tool Cabinet`,
    description:
      'Insights on smart tool cabinets, RFID inventory management, tool vending machines, CNC downtime reduction and intelligent storage trends from WS Tool Cabinet.',
    keywords,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  const displayTitle = `Blog | WS Tool Cabinet`;
  const { canonical } = buildHreflang(getBaseUrl(), locale, '/blog');
  return (
    <>
      {/* CollectionPage JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: displayTitle,
            url: canonical,
          }),
        }}
      />
      <BlogListClient />
    </>
  );
}
