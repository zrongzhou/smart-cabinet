import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { fetchUnifiedCategories } from '@/data/unified-data';

interface Props {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categories = await fetchUnifiedCategories();
  const cat = categories.find((c: any) => c.slug === params.slug);
  if (!cat) return { title: 'Category Not Found' };
  const name = cat.nameZh || cat.nameEn || cat.nameAr || params.slug;
  return {
    title: `${name} - Smart Cabinet`,
    description: `View products in ${name} category.`,
  };
}

export default async function CategoryPage({ params: { locale, slug } }: Props) {
  const categories = await fetchUnifiedCategories();
  const cat = categories.find((c: any) => c.slug === slug);

  if (!cat) {
    notFound();
  }

  const name = cat.nameZh || cat.nameEn || cat.nameAr || slug;
  const displayName = locale === 'zh' ? (cat.nameZh || cat.nameEn) : locale === 'ar' ? (cat.nameAr || cat.nameEn) : cat.nameEn;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
          {displayName}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Explore our {displayName} collection
        </p>
        <div className="mt-8">
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            View All Products
          </Link>
        </div>
      </div>
    </main>
  );
}
