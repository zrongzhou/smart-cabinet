import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { managedItemMap } from '@/lib/managed-items';
import { managedItemMeta, normalizeLocale, pickTrilingualDescription } from '@/lib/seo-page-meta';
import { getBaseUrl } from '@/lib/seo';
import { buildHreflang, buildStaticPageKeywords } from '@/lib/seo-keywords';
import LandingPage from '@/components/landing/LandingPage';

interface PageProps {
  params: { locale: string; slug: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const loc = normalizeLocale(params.locale);
  const item = managedItemMap[params.slug];
  if (!item) return {};
  const meta = managedItemMeta[params.slug];
  const englishTitle = (item.metaTitle || '').split(/\s*\|\s*/)[0] || item.metaTitle || '';
  const description = pickTrilingualDescription(meta, loc, englishTitle);
  const keywords = buildStaticPageKeywords(englishTitle, item.metaTitle || englishTitle).join(', ');
  const { canonical, languages } = buildHreflang(getBaseUrl(), loc, `/managed-items/${params.slug}`);
  return {
    title: item.metaTitle,
    description,
    keywords,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  const loc = normalizeLocale(params.locale);
  const item = managedItemMap[params.slug];
  if (!item) notFound();
  return <LandingPage locale={loc} content={item} basePath={`managed-items/${params.slug}`} />;
}
