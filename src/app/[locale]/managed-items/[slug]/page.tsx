import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { managedItemMap } from '@/lib/managed-items';
import { managedItemMeta, normalizeLocale, pickTrilingual } from '@/lib/seo-page-meta';
import { getBaseUrl } from '@/lib/seo';
import { buildHreflang } from '@/lib/seo-keywords';
import LandingPage from '@/components/landing/LandingPage';

interface PageProps {
  params: { locale: string; slug: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const loc = normalizeLocale(params.locale);
  const item = managedItemMap[params.slug];
  if (!item) return {};
  const description = pickTrilingual(managedItemMeta[params.slug], loc);
  const { canonical, languages } = buildHreflang(getBaseUrl(), loc, `/managed-items/${params.slug}`);
  return {
    title: item.metaTitle,
    description,
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  const loc = normalizeLocale(params.locale);
  const item = managedItemMap[params.slug];
  if (!item) notFound();
  return <LandingPage locale={loc} content={item} basePath={`managed-items/${params.slug}`} />;
}
