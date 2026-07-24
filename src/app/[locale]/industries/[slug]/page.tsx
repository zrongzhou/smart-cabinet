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
  // NEXT15: params is now a Promise
  params: Promise<{ locale: string; slug: string }>;
}

// NEXT15: generateMetadata must be async and await the params Promise
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params; // NEXT15
  const loc = normalizeLocale(locale);
  const item = industryMap[slug];
  if (!item) return {};
  const meta = industryMeta[slug];
  const englishTitle = (item.metaTitle || '').split(/\s*\|\s*/)[0] || item.metaTitle || '';
  const description = pickTrilingualDescription(meta, loc, englishTitle);
  const keywords = buildStaticPageKeywords(englishTitle, item.metaTitle || englishTitle).join(', ');
  const { canonical, languages } = buildHreflang(getBaseUrl(), loc, `/industries/${slug}`);
  return {
    title: item.metaTitle,
    description,
    keywords,
    alternates: { canonical, languages },
  };
}

// NEXT15: Page must be async and await the params Promise
export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params; // NEXT15
  const loc = normalizeLocale(locale);
  const item = industryMap[slug];
  if (!item) notFound();
  return <LandingPage locale={loc} content={item} basePath={`industries/${slug}`} />;
}
