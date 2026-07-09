import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo';
import { buildListPageKeywords } from '@/lib/seo-keywords';
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
  const baseUrl = getBaseUrl();
  const path = `/${locale}/solutions`;
  return {
    title: `Solutions | WS Tool Cabinet`,
    description: `Industry-specific intelligent storage and smart cabinet solutions for CNC, automotive, electronics, wire & cable, construction and more.`,
    keywords: keywords.join(', '),
    alternates: { canonical: baseUrl ? `${baseUrl}${path}` : path },
  };
}

export default function Page({ params }: PageProps) {
  return <SolutionsClient locale={params.locale} />;
}
