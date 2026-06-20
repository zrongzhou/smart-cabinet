import type { Metadata } from 'next';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params: { id } }: Props): Promise<Metadata> {
  // In real app, fetch product data here for dynamic metadata
  // const product = await getProduct(id);
  
  return {
    title: 'Product Detail - Smart Cabinet',
    description: 'View product details and specifications.',
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

export default function ProductDetailPage({ params: { id } }: Props) {
  // In real app, fetch product by id
  const product = mockProduct;
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
      <div className="container mx-auto max-w-7xl animate-fade-in-up">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <div className="animate-fade-in-up">
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex h-96 items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                <span className="text-8xl">📦</span>
              </div>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="animate-fade-in-up animation-delay-200">
            <div className="rounded-3xl bg-white p-8 shadow-2xl">
              <h1 className="mb-4 text-4xl font-extrabold text-gray-900">{product.name}</h1>
              <p className="mb-6 text-3xl font-bold text-blue-600">${product.price}</p>
              <p className="mb-8 leading-relaxed text-gray-600">{product.description}</p>
              
              <h2 className="mb-4 text-xl font-bold text-gray-900">Features</h2>
              <ul className="mb-8 space-y-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <span>✓</span>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-col gap-4 sm:flex-row">
                <button className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800">
                  Request Quote
                </button>
                <button className="flex-1 rounded-xl border-2 border-blue-600 px-8 py-4 text-base font-semibold text-blue-600 transition-all hover:bg-blue-50">
                  Download Brochure
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
