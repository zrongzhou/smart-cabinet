import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  locale: string;
}

export default function ProductCard({ product, locale }: ProductCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
      <img
        src={product.images?.[0] ?? '/placeholder.jpg'}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-blue-600 font-bold text-xl mb-4">
          {product.price ? `$${product.price}` : 'Request Quote'}
        </p>
        <a
          href={`/${locale}/products/${product.slug}`}
          className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          View Details
        </a>
      </div>
    </div>
  );
}
