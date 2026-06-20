import type { Metadata } from 'next';

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
    description: 'Smart vending machine with cashless payment',
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Products - Smart Cabinet',
    description: 'Explore our range of intelligent storage solutions.',
  };
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
      <div className="container mx-auto max-w-7xl animate-fade-in-up">
        {/* Page header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Our Products
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Explore our range of intelligent storage solutions
          </p>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {mockProducts.map((product) => (
            <div key={product.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-bold text-gray-900">{product.name}</h3>
              <p className="mb-4 text-xl font-extrabold text-blue-600">${product.price}</p>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
