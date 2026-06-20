import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import ProductCard from '@/components/ProductCard';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Products' });
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

// Mock data - replace with API call
const mockProducts = [
  {
    id: '1',
    name: 'Smart Cabinet Pro',
    slug: 'smart-cabinet-pro',
    price: 2999,
    images: ['/images/product-1.jpg'],
    category: 'smart-cabinets',
  },
  {
    id: '2',
    name: 'Vending Machine X1',
    slug: 'vending-machine-x1',
    price: 4999,
    images: ['/images/product-2.jpg'],
    category: 'vending-machines',
  },
  // Add more products as needed
];

export default async function ProductsPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'Products' });
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{t('heading')}</h1>
      <p className="text-gray-600 mb-8">{t('subheading')}</p>
      
      <div className="product-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            locale={locale}
          />
        ))}
      </div>
    </main>
  );
}
