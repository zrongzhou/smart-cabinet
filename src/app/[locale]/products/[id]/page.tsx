import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { locale: string; id: string };
}

export async function generateMetadata({ params: { locale, id } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'ProductDetail' });
  
  // In real app, fetch product data here for dynamic metadata
  // const product = await getProduct(id);
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

// Mock product data - replace with API call
const mockProduct = {
  id: '1',
  name: 'Smart Cabinet Pro',
  description: 'High-quality smart cabinet with intelligent features.',
  price: 2999,
  images: ['/images/product-1.jpg'],
  features: ['Smart Lock', 'Remote Access', 'Activity Log'],
  category: 'smart-cabinets',
};

export default async function ProductDetailPage({ params: { locale, id } }: Props) {
  const t = await getTranslations({ locale, namespace: 'ProductDetail' });
  
  // In real app: const product = await getProduct(id);
  const product = mockProduct;
  
  if (!product) {
    notFound();
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full rounded-lg"
          />
        </div>
        
        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold text-blue-600 mb-6">
            ${product.price}
          </p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <ul className="list-disc ml-6 mb-6">
            {product.features.map((feature, index) => (
              <li key={index} className="mb-2">{feature}</li>
            ))}
          </ul>
          
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
            Request Quote
          </button>
        </div>
      </div>
    </main>
  );
}
