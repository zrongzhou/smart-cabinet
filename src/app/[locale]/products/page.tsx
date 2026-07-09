import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getBaseUrl } from '@/lib/seo';
import { buildListPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import ProductsClient from './ProductsClient';

interface PageProps {
  params: { locale: string };
}

const PAGE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Smart Tool Cabinet & Industrial Vending Machine Products | Qtech',
    description: 'Compare CNC tool vending machines, smart drawer cabinets, RFID asset cabinets and PPE vending solutions for factory inventory control.',
  },
  zh: {
    title: '智能工具柜与工业自动售货机产品 | Qtech',
    description: '对比 CNC 刀具自动售货机、智能抽屉柜、RFID 资产柜与 PPE 自动售货方案，助力工厂库存管控。',
  },
  ar: {
    title: 'منتجات الخزائن الذكية وآلات البيع الصناعية | Qtech',
    description: 'قارن بين آلات بيع أدوات CNC، والخزائن الذكية ذات الأدراج، وخزائن أصول RFID، وحلول بيع PPE لإدارة مخزون المصانع.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = params.locale as 'en' | 'zh' | 'ar';
  const meta = PAGE_META[locale] || PAGE_META.en;
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
  // hreflang：三语言互指（canonical + languages），含 x-default 与 zh-CN
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/products');
  return {
    title: meta.title,
    description: meta.description,
    keywords: keywords.join(', '),
    alternates: { canonical, languages },
  };
}

export default function Page({ params }: PageProps) {
  const locale = (params.locale || 'en') as 'en' | 'zh' | 'ar';
  const meta = PAGE_META[locale] || PAGE_META.en;
  const displayTitle = meta.title;
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
