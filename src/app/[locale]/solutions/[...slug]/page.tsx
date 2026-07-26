import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductDetailView, { buildProductMetadata } from '../../products/[...slug]/ProductDetailView';

// 详情页，ISR 重新校验
export const revalidate = 300;

interface PageProps {
  // NEXT15: params is now a Promise
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params; // NEXT15
  const lookupSlug = `solutions/${slug.join('/')}`;
  const locale = rawLocale as 'en' | 'zh' | 'ar';
  const product = await prisma.product.findFirst({
    where: { slug: lookupSlug, deletedAt: null },
  });
  return product ? buildProductMetadata(locale, product, lookupSlug) : {};
}

// NEXT15: Page must be async and await the params Promise
export default async function Page({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params; // NEXT15
  const lookupSlug = `solutions/${slug.join('/')}`;
  return (
    <ProductDetailView
      locale={rawLocale as 'en' | 'zh' | 'ar'}
      lookupSlug={lookupSlug}
      canonicalPath={lookupSlug}
    />
  );
}
