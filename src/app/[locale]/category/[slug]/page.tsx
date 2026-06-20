import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

interface Props {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Category' });
  
  // In real app, fetch category data for dynamic metadata
  // const category = await getCategory(slug);
  
  return {
    title: `${slug} - ${t('meta.title')}`,
    description: t('meta.description'),
  };
}

// Mock category data
const mockCategories: Record<string, { name: string; products: any[] }> = {
  'smart-cabinets': {
    name: 'Smart Cabinets',
    products: [
      { id: '1', name: 'Smart Cabinet Pro', price: 2999, images: ['/images/product-1.jpg'] },
    ],
  },
  'vending-machines': {
    name: 'Vending Machines',
    products: [
      { id: '2', name: 'Vending Machine X1', price: 4999, images: ['/images/product-2.jpg'] },
    ],
  },
  'intelligent-lockers': {
    name: 'Intelligent Lockers',
    products: [
      { id: '3', name: 'Locker Pro', price: 1999, images: ['/images/product-3.jpg'] },
    ],
  },
};

export default async function CategoryPage({ params: { locale, slug } }: Props) {
  const t = await getTranslations({ locale, namespace: 'Category' });
  
  const category = mockCategories[slug];
  
  if (!category) {
    return <div className="container mx-auto px-4 py-8">Category not found</div>;
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>
      
      <div className="product-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {category.products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <img src={product.images[0]} alt={product.name} className="w-full rounded-lg mb-4" />
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-blue-600 font-bold">${product.price}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
