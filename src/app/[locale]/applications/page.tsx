import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getBaseUrl } from '@/lib/seo';
import { buildListPageKeywords, buildHreflang } from '@/lib/seo-keywords';
import ApplicationsClient from './ApplicationsClient';

// 应用案例列表页：与 /en/products、/en/solutions 同源，ISR 重新校验
export const revalidate = 300;

interface PageProps {
  // NEXT15: params is now a Promise
  params: Promise<{ locale: string }>;
}

const PAGE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Smart Vending & Storage Applications | Qtech',
    description:
      'Real-world deployments of tool vending, PPE dispensing, document and MRO inventory solutions across automotive, electronics, medical and manufacturing.',
  },
  zh: {
    title: '智能售货与存储应用案例 | Qtech 智能工具柜',
    description: '覆盖刀具售货、PPE 发放、文档与 MRO 库存管理的行业落地实践，服务于汽车、电子、医疗与制造业。',
  },
  ar: {
    title: 'تطبيقات الخزائن الذكية | Qtech',
    description:
      'عمليات نشر فعلية لبيع الأدوات وتوزيع PPE وإدارة مخزون المستندات وMRO عبر السيارات والإلكترونيات والطبية والتصنيع.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = (await params).locale as 'en' | 'zh' | 'ar'; // NEXT15: await params
  const meta = PAGE_META[locale] || PAGE_META.en;
  const products = await prisma.product.findMany({
    where: { status: 'active', deletedAt: null, slug: { startsWith: 'applications/' } },
    select: { name: true },
  });
  // 主关键词从英文标题提炼；二级用本语言完整产品名
  const englishNames = products.map((p: any) => (p.name?.en || '') as string).filter(Boolean);
  const displayNames = products.map((p: any) => (p.name?.[locale] || p.name?.en || '') as string).filter(Boolean);
  const keywords = buildListPageKeywords(englishNames, displayNames);
  // hreflang：三语言互指（canonical + languages），含 x-default 与 zh-CN
  const { canonical, languages } = buildHreflang(getBaseUrl(), locale, '/applications');
  return {
    title: meta.title,
    description: meta.description,
    keywords: keywords.join(', '),
    alternates: { canonical, languages },
  };
}

// NEXT15: Page must be async and await the params Promise
export default async function Page({ params }: PageProps) {
  const locale = ((await params).locale || 'en') as 'en' | 'zh' | 'ar'; // NEXT15
  const meta = PAGE_META[locale] || PAGE_META.en;
  const { canonical } = buildHreflang(getBaseUrl(), locale, '/applications');

  // V8.10: 服务端直接拉取应用案例产品，作为 props 传给 ApplicationsClient，
  // 让卡片 / 链接出现在 SSR HTML（修复 client-swallow-SSR，并确保 Google 能发现内链）。
  const products = await prisma.product.findMany({
    where: { status: 'active', deletedAt: null, slug: { startsWith: 'applications/' } },
    include: { categories: true },
    orderBy: { order: 'asc' },
  });

  return (
    <>
      {/* CollectionPage JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: meta.title,
            url: canonical,
          }),
        }}
      />
      <ApplicationsClient initialProducts={products as any} />
    </>
  );
}
