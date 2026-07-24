import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductDetailView, { buildProductMetadata } from './ProductDetailView';

// 产品详情页：较短的 ISR 窗口
export const revalidate = 60;

interface PageProps {
  // NEXT15: params is now a Promise
  params: Promise<{
    locale: string;
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug: slugArr } = await params; // NEXT15
  const slug = slugArr.join('/');
  const locale = rawLocale as 'en' | 'zh' | 'ar';
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
  });
  return product ? buildProductMetadata(locale, product, `products/${slug}`) : {};
}

// NEXT15: Page must be async and await the params Promise
export default async function Page({ params }: PageProps) {
  const { locale: rawLocale, slug: slugArr } = await params; // NEXT15
  const slug = slugArr.join('/');
  return (
    <ProductDetailView
      locale={rawLocale as 'en' | 'zh' | 'ar'}
      lookupSlug={slug}
      canonicalPath={`products/${slug}`}
    />
  );
}
