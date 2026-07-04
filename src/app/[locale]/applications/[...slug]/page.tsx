import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductDetailView, { buildProductMetadata } from '../../products/[...slug]/ProductDetailView';

interface PageProps {
  params: {
    locale: string;
    slug: string[];
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lookupSlug = `applications/${params.slug.join('/')}`;
  const locale = params.locale as 'en' | 'zh' | 'ar';
  const product = await prisma.product.findFirst({
    where: { slug: lookupSlug, deletedAt: null },
  });
  return product ? buildProductMetadata(locale, product, lookupSlug) : {};
}

export default function Page({ params }: PageProps) {
  const lookupSlug = `applications/${params.slug.join('/')}`;
  return (
    <ProductDetailView
      locale={params.locale as 'en' | 'zh' | 'ar'}
      lookupSlug={lookupSlug}
      canonicalPath={lookupSlug}
    />
  );
}
