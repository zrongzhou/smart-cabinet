import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

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
    description: 'Advanced intelligent storage solution with AI-powered management',
  },
  {
    id: '2',
    name: 'Vending Machine X1',
    slug: 'vending-machine-x1',
    price: 4999,
    images: ['/images/product-2.jpg'],
    category: 'vending-machines',
    description: 'Smart vending with AI recognition and cashless payment',
  },
  {
    id: '3',
    name: 'Intelligent Locker',
    slug: 'intelligent-locker',
    price: 1999,
    images: ['/images/product-3.jpg'],
    category: 'lockers',
    description: 'Secure storage with mobile access and real-time monitoring',
  },
];

export default async function ProductsPage({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'Products' });
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
      <div className="container mx-auto max-w-7xl animate-fade-in-up">
        {/* Page header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            {t('heading')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {t('subheading')}
          </p>
        </div>
        
        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <span className="text-sm text-gray-600">Filter by category: </span>
            <select className="ml-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none">
              <option>All</option>
              <option>Smart Cabinets</option>
              <option>Vending Machines</option>
              <option>Lockers</option>
            </select>
          </div>
        </div>
        
        {/* Products grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockProducts.map((product, index) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                <div className="flex h-full items-center justify-center">
                  <span className="text-6xl">📦</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold text-gray-900">{product.name}</h3>
                <p className="mb-4 text-sm text-gray-600">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                  <a
                    href={`/${locale}/products/${product.slug}`}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-blue-800"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
