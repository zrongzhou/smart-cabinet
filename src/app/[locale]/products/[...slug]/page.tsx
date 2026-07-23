import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductDetailView, { buildProductMetadata } from './ProductDetailView';

// 产品详情页：较短的 ISR 窗口
export const revalidate = 60;

interface PageProps {
  params: {
    locale: string;
    slug: string[];
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug.join('/');
  const locale = params.locale as 'en' | 'zh' | 'ar';
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null },
  });
  return product ? buildProductMetadata(locale, product, `products/${slug}`) : {};
}

export default function Page({ params }: PageProps) {
  const slug = params.slug.join('/');
  return (
    <ProductDetailView
      locale={params.locale as 'en' | 'zh' | 'ar'}
      lookupSlug={slug}
      canonicalPath={`products/${slug}`}
    />
  );
}
