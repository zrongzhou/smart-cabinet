import type { Metadata } from 'next';
import { landingPageMap } from '@/lib/landing-pages';
import { landingPageMeta, normalizeLocale, pickTrilingualDescription } from '@/lib/seo-page-meta';
import { getBaseUrl } from '@/lib/seo';
import { buildHreflang, buildStaticPageKeywords } from '@/lib/seo-keywords';
import LandingPage from '@/components/landing/LandingPage';

const SLUG = 'shipping-delivery';

interface PageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const loc = normalizeLocale(params.locale);
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

export default function Page({ params }: PageProps) {
  const loc = normalizeLocale(params.locale);
  const item = landingPageMap[SLUG];
  if (!item) return null;
  return <LandingPage locale={loc} content={item} basePath={SLUG} />;
}
