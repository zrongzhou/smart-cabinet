import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';
import { buildListPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import solutions from '@/data/solutions';
import SolutionsClient from './SolutionsClient';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.locale as 'en' | 'zh' | 'ar';
  // 主关键词从英文标题提炼（全站英文为主）；二级用本语言完整方案名（仅本语言页出现）
  const englishNames = solutions.map((s) => (s.title?.en || '') as string).filter(Boolean);
  const displayNames = solutions
    .map((s) => (s.title?.[locale] || s.title?.en || '') as string)
    .filter(Boolean);
  const keywords = buildListPageKeywords(englishNames, displayNames);
  // hreflang：三语言互指（canonical + languages）
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/solutions');
  return {
    title: `Solutions | WS Tool Cabinet`,
    description: `Industry-specific intelligent storage and smart cabinet solutions for CNC, automotive, electronics, wire & cable, construction and more.`,
    keywords: keywords.join(', '),
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  const displayTitle = `Solutions | WS Tool Cabinet`;
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
