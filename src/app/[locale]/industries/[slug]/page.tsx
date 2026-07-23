import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { industryMap } from '@/lib/industries';
import { industryMeta, normalizeLocale, pickTrilingualDescription } from '@/lib/seo-page-meta';
import { getBaseUrl } from '@/lib/seo';
import { buildHreflang, buildStaticPageKeywords } from '@/lib/seo-keywords';
import LandingPage from '@/components/landing/LandingPage';

// 静态内容页，ISR 重新校验
export const revalidate = 300;

interface PageProps {
  params: { locale: string; slug: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const loc = normalizeLocale(params.locale);
  const item = industryMap[params.slug];
  if (!item) return {};
  const meta = industryMeta[params.slug];
  const englishTitle = (item.metaTitle || '').split(/\s*\|\s*/)[0] || item.metaTitle || '';
  const description = pickTrilingualDescription(meta, loc, englishTitle);
  const keywords = buildStaticPageKeywords(englishTitle, item.metaTitle || englishTitle).join(', ');
  const { canonical, languages } = buildHreflang(getBaseUrl(), loc, `/industries/${params.slug}`);
  return {
    title: item.metaTitle,
    description,
    keywords,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  const loc = normalizeLocale(params.locale);
  const item = industryMap[params.slug];
  if (!item) notFound();
  return <LandingPage locale={loc} content={item} basePath={`industries/${params.slug}`} />;
}
