import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getBaseUrl } from '@/lib/seo';
import { buildListPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import ProductsClient from './ProductsClient';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.locale as 'en' | 'zh' | 'ar';
  const products = await prisma.product.findMany({
    where: { status: 'active', deletedAt: null },
    select: { name: true },
  });
  // 主关键词从英文标题提炼（全站英文为主）；二级用本语言完整产品名（仅本语言页出现）
  const englishNames = products.map((p: any) => (p.name?.en || '') as string).filter(Boolean);
  const displayNames = products
    .map((p: any) => (p.name?.[locale] || p.name?.en || '') as string)
    .filter(Boolean);
  const keywords = buildListPageKeywords(englishNames, displayNames);
  // hreflang：三语言互指（canonical + languages）
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/products');
  return {
    title: `Products | WS Tool Cabinet`,
    description: `Browse intelligent storage, smart cabinets, tool vending machines and RFID management solutions.`,
    keywords: keywords.join(', '),
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  const displayTitle = `Products | WS Tool Cabinet`;
  const { canonical } = buildHreflang(getBaseUrl(), locale, '/products');
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
      <ProductsClient />
    </>
  );
}
