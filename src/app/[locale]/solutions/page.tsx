import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';
import { buildListPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import solutions from '@/data/solutions';
import SolutionsClient from './SolutionsClient';

// 静态内容页，ISR 重新校验
export const revalidate = 300;

interface PageProps {
  params: { locale: string };
}

const PAGE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Industrial Inventory Management Solutions | Qtech Tool Cabinet',
    description: 'Smart storage solutions for CNC tools, PPE, fasteners, documents and MRO supplies. Improve inventory control across workshops and factories.',
  },
  zh: {
    title: '工业库存管理解决方案 | Qtech 智能工具柜',
    description: '探索适用于 CNC 加工、汽车、电子、医疗器械、模具车间与 MRO 库存管理的智能柜解决方案。',
  },
  ar: {
    title: 'حلول إدارة المخزون الصناعي | Qtech خزائن الأدوات الذكية',
    description: 'استكشف حلول الخزائن الذكية لتشغيل CNC، والسيارات، والإلكترونيات، والأجهزة الطبية، وورش القوالب، وإدارة مخزون MRO.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.locale as 'en' | 'zh' | 'ar';
  const meta = PAGE_META[locale] || PAGE_META.en;
  // 主关键词从英文标题提炼（全站英文为主）；二级用本语言完整方案名（仅本语言页出现）
  const englishNames = solutions.map((s) => (s.title?.en || '') as string).filter(Boolean);
  const displayNames = solutions
    .map((s) => (s.title?.[locale] || s.title?.en || '') as string)
    .filter(Boolean);
  const keywords = buildListPageKeywords(englishNames, displayNames);
  // hreflang：三语言互指（canonical + languages），含 x-default 与 zh-CN
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/solutions');
  return {
    title: meta.title,
    description: meta.description,
    keywords: keywords.join(', '),
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  const meta = PAGE_META[locale] || PAGE_META.en;
  const displayTitle = meta.title;
  const { canonical } = buildHreflang(getBaseUrl(), locale, '/solutions');
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
      <SolutionsClient locale={params.locale} />
    </>
  );
}
