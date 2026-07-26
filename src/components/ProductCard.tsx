import type { Product } from '@/types/product';
import Link from 'next/link';
import { ArrowRight, Package, Heart } from 'lucide-react';
import ImageWithRetry from '@/components/ui/ImageWithRetry';
import { useState, memo } from 'react';
import { useLocale } from '@/lib/i18n';
import { getProductHref } from '@/lib/product-url';
import { sanitizeHtml } from '@/lib/sanitize';

interface ProductCardProps {
  product: Product;
  locale: string;
  showFavoriteButton?: boolean;
  priority?: boolean;  // Add priority prop for above-the-fold images
}

const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' dy='.3em' fill='%2394a3b8' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

function ProductCard({ product, locale, showFavoriteButton = true, priority = false }: ProductCardProps) {
  const { t } = useLocale();
  const imageSrc = product.images?.[0] ?? PLACEHOLDER_SVG;
  const detailHref = getProductHref(product.slug, locale);
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
      className="group block rounded-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 100%)',
        border: '1px solid rgba(148,163,184,0.2)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 25px -5px rgba(148,163,184,0.12)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 8px 25px -5px rgba(59,130,246,0.18), 0 16px 40px -8px rgba(148,163,184,0.2)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.3)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 25px -5px rgba(148,163,184,0.12)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(148,163,184,0.2)';
      }}
    >
      {/* Product Image with Premium Glass Effect */}
      <div className="relative overflow-hidden h-56" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        {product.images?.[0] ? (
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
            <ImageWithRetry
              src={imageSrc}
              alt={product.name?.[locale as keyof typeof product.name] || (product as any).name || 'Product'}
              className="w-full h-full object-cover"
              loading={priority ? 'eager' : 'lazy'}
              fallbackSrc={PLACEHOLDER_SVG}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }}>
            <Package className="w-16 h-16 text-gray-300" />
          </div>
        )}
        {/* Glassmorphic hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-black/0 group-hover:from-blue-900/10 group-hover:to-purple-900/5 transition-all duration-500 flex items-center justify-center">
          <ArrowRight className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500 rounded-full p-2" style={{
            background: 'rgba(59,130,246,0.9)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
          }} />
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

      <div className="p-6" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)' }}>
        {/* Category badge area with glass effect */}
        {product.categories?.[0] && (
          <div className="mb-3">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.08) 100%)',
                color: '#4f46e5',
                border: '1px solid rgba(79,70,229,0.15)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {typeof product.categories[0] === 'string' ? product.categories[0] : (product.categories[0] as any)?.name?.[locale] || (product.categories[0] as any)?.name?.en || ''}
            </span>
          </div>
        )}
        
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all line-clamp-1">
          {product.name?.[locale as keyof typeof product.name] || (product as any).name?.en || (product as any).name || 'Product'}
        </h3>
        
        {product.description && (
          <div className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {(typeof product.description === 'string')
              ? <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }} />
              : <span dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(product.description?.[locale as keyof typeof product.description]
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
          
          <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group-hover:text-white"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.06) 100%)',
              color: '#2563eb',
              border: '1px solid rgba(59,130,246,0.2)',
              boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
            }}
          >
            View Details
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductCard);
