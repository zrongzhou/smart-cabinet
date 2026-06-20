import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  // In real app, fetch category data for dynamic metadata
  // const category = await getCategory(slug);
  
  return {
    title: `${slug} - Smart Cabinet`,
    description: `View products in ${slug} category.`,
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
};

export default function CategoryPage({ params: { slug } }: Props) {
  // In real app, fetch category by slug
  const category = mockCategories[slug];
  
  if (!category) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900">Category Not Found</h1>
          <p className="text-lg text-gray-600">The category you are looking for does not exist.</p>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
      <div className="container mx-auto max-w-7xl animate-fade-in-up">
        {/* Page header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            {category.name}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Explore our {category.name} collection
          </p>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {category.products.map((product: any) => (
            <div key={product.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-bold text-gray-900">{product.name}</h3>
              <p className="mb-4 text-xl font-extrabold text-blue-600">${product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
