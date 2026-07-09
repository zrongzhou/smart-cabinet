import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getBaseUrl } from '@/lib/seo';
import { buildListPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import { BlogListClient } from './BlogListClient';

interface PageProps {
  params: { locale: string };
}

const PAGE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Smart Cabinet & Tool Vending Machine Blog | Qtech Insights',
    description: 'Read practical guides on CNC tool inventory, PPE vending, RFID asset tracking, smart cabinets and factory material management.',
  },
  zh: {
    title: '智能柜与工具自动售货机博客 | Qtech 洞察',
    description: '阅读关于 CNC 刀具库存、PPE 自动售货、RFID 资产追踪、智能柜与工厂物料管理的实用指南。',
  },
  ar: {
    title: 'مدونة الخزائن الذكية وآلات بيع الأدوات | رؤى Qtech',
    description: 'اقرأ أدلة عملية حول مخزون أدوات CNC، وبيع PPE، وتتبع أصول RFID، والخزائن الذكية، وإدارة مواد المصانع.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  const meta = PAGE_META[locale] || PAGE_META.en;
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
  // hreflang：三语言互指（canonical + languages），含 x-default 与 zh-CN
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/blog');
  return {
    title: meta.title,
    description: meta.description,
    keywords,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  const meta = PAGE_META[locale] || PAGE_META.en;
  const displayTitle = meta.title;
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
