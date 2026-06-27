import type { Product } from '@/types/product';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Package, Heart } from 'lucide-react';
import { useState } from 'react';
import { useLocale } from '@/lib/i18n';

interface ProductCardProps {
  product: Product;
  locale: string;
  showFavoriteButton?: boolean;
  priority?: boolean;  // Add priority prop for above-the-fold images
}

const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' fill='%2394a3b8' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product, locale, showFavoriteButton = true, priority = false }: ProductCardProps) {
  const { t } = useLocale();
  const imageSrc = product.images?.[0] ?? PLACEHOLDER_SVG;
  const detailHref = `/${locale}/products/${product.slug}`;
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login
      window.location.href = `/${locale}/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const res = await fetch(`/api/user/favorites?productId=${product.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setIsFavorite(false);
        }
      } else {
        // Add to favorites
        const res = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId: product.id }),
        });

        if (res.ok) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      href={detailHref}
      className="group block border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
    >
      {/* Product Image with Zoom Effect */}
      <div className="relative overflow-hidden bg-gray-100 h-56">
        {product.images?.[0] ? (
          <Image
            src={imageSrc}
            alt={product.name?.[locale as keyof typeof product.name] || (product as any).name || 'Product'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <ArrowRight className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
        </div>
        {/* Price Badge */}
        {product.price && !product.hidePrice && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
            ${product.price}
          </div>
        )}
        {/* Contact Us Badge (when price is hidden) */}
        {product.hidePrice && (
          <div className="absolute top-4 right-4 bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
            Contact Us
          </div>
        )}
        {/* Favorite Button */}
        {showFavoriteButton && (
          <button
            onClick={handleFavoriteClick}
            disabled={loading}
            className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors z-10"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
          {product.name?.[locale as keyof typeof product.name] || (product as any).name?.en || (product as any).name || 'Product'}
        </h3>
        
        {product.description && (
          <div className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {(typeof product.description === 'string')
              ? <span dangerouslySetInnerHTML={{ __html: product.description }} />
              : <span dangerouslySetInnerHTML={{
                  __html: (product.description?.[locale as keyof typeof product.description]
                    || product.description?.en
                    || product.description?.zh
                    || product.description?.ar
                    || '')
                }} />
            }
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            {product.hidePrice ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Contact Us for Quote</p>
            ) : product.price ? (
              <p className="text-2xl font-bold text-blue-600">
                ${product.price}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Request Quote</p>
            )}
          </div>
          
          <span className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 transition-all duration-200">
            View Details
            <ArrowRight className="ml-2 w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
