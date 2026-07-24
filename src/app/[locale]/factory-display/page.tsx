import type { Metadata } from 'next';
import { landingPageMap } from '@/lib/landing-pages';
import { landingPageMeta, normalizeLocale, pickTrilingualDescription } from '@/lib/seo-page-meta';
import { getBaseUrl } from '@/lib/seo';
import { buildHreflang, buildStaticPageKeywords } from '@/lib/seo-keywords';
import LandingPage from '@/components/landing/LandingPage';

// 静态内容页，ISR 重新校验
export const revalidate = 300;

const SLUG = 'factory-display';

interface PageProps {
  // NEXT15: params is now a Promise
  params: Promise<{ locale: string }>;
}

// NEXT15: generateMetadata must be async and await the params Promise
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const loc = normalizeLocale((await params).locale); // NEXT15
  const item = landingPageMap[SLUG];
  const meta = landingPageMeta[SLUG];
  const englishTitle = (item.metaTitle || '').split(/\s*\|\s*/)[0] || item.metaTitle || '';
  const description = pickTrilingualDescription(meta, loc, englishTitle);
  const keywords = buildStaticPageKeywords(englishTitle, item.metaTitle || englishTitle).join(', ');
  const { canonical, languages } = buildHreflang(getBaseUrl(), loc, `/${SLUG}`);
  return {
    title: item.metaTitle,
    description,
    keywords,
    alternates: { canonical, languages },
  };
}

// NEXT15: Page must be async and await the params Promise
export default async function Page({ params }: PageProps) {
  const loc = normalizeLocale((await params).locale); // NEXT15
  const item = landingPageMap[SLUG];
  if (!item) return null;
  return <LandingPage locale={loc} content={item} basePath={SLUG} />;
}
