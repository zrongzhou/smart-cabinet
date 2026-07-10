import type { Metadata } from 'next';
import { landingPageMap } from '@/lib/landing-pages';
import { landingPageMeta, normalizeLocale, pickTrilingual } from '@/lib/seo-page-meta';
import { getBaseUrl } from '@/lib/seo';
import { buildHreflang } from '@/lib/seo-keywords';
import LandingPage from '@/components/landing/LandingPage';

const SLUG = 'factory-display';

interface PageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const loc = normalizeLocale(params.locale);
  const item = landingPageMap[SLUG];
  const description = pickTrilingual(landingPageMeta[SLUG], loc);
  const { canonical, languages } = buildHreflang(getBaseUrl(), loc, `/${SLUG}`);
  return {
    title: item.metaTitle,
    description,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  const loc = normalizeLocale(params.locale);
  const item = landingPageMap[SLUG];
  if (!item) return null;
  return <LandingPage locale={loc} content={item} basePath={SLUG} />;
}
