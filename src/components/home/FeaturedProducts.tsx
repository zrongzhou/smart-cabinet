'use client';

import { useState, useEffect } from 'react';
import { Package, ArrowRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { Product } from '@/data/unified-data';
import { fetchUnifiedProducts } from '@/data/unified-data';

interface FeaturedProductsProps {
  locale?: string;
}

export default function FeaturedProducts({ locale: propLocale }: FeaturedProductsProps) {
  const { locale, t } = useLocale();
  const currentLocale = propLocale || locale;
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load featured products from API
  useEffect(() => {
    async function loadProducts() {
      try {
        const allProducts = await fetchUnifiedProducts('active');
        const featured = allProducts.filter(p => p.featured && p.status === 'active');
        setFeaturedProducts(featured);
      } catch (e) {
        console.error('Failed to load featured products:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--section-bg)] relative overflow-hidden">
      {/* Section background decoration */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color, #3b82f6) 15%, transparent)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" style={{ backgroundColor: 'color-mix(in srgb, var(--primary-color, #06b6d4) 10%, transparent)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: 'var(--icon-bg, #dbeafe)', color: 'var(--primary-color, #2563eb)' }}>
            ★ {currentLocale === 'zh' ? '精选产品' : 'Featured'}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] mb-4 tracking-tight">
            {t('featuredProducts.title')}
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            {t('featuredProducts.subtitle')}
          </p>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[var(--section-alt-bg)] rounded-3xl overflow-hidden">
                <div className="h-56 bg-[var(--border-color)] animate-pulse" />
                <div className="p-8 space-y-3">
                  <div className="h-4 w-20 bg-[var(--border-color)] rounded animate-pulse" />
                  <div className="h-6 w-full bg-[var(--border-color)] rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-[var(--border-color)] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => {
                return (
                  <div
                    key={product.id}
                    className="group relative bg-[var(--card-bg)] rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-3 hover:scale-[1.02]"
                  >
                    {/* Product Image or Gradient Header */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700" style={{ backgroundColor: 'var(--section-alt-bg)' }}>
                      {(product.images && product.images.length > 0 && product.images[0]) ? (
                        <>
                          <img 
                            src={product.images[0]} 
                            alt={currentLocale === 'zh' ? product.name.zh : currentLocale === 'ar' ? product.name.ar : product.name.en}
                            className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                            loading={index < 2 ? "eager" : "lazy"}
                          />
                          {/* Fallback - shown when img fails to load; use inline style to survive Tailwind purge */}
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center text-white"
                            style={{ display: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)' }}
                          >
                            <Package className="w-12 h-12 mb-2 opacity-80" />
                            <span className="text-sm font-medium">{currentLocale === 'zh' ? product.name.zh : currentLocale === 'ar' ? product.name.ar : product.name.en || product.sku || 'Product'}</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-color, #2563eb) 0%, color-mix(in srgb, var(--primary-color, #2563eb) 70%, #fff) 100%)' }}>
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white/40 rounded-full" />
                            <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white/40 rounded-lg rotate-12" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full" />
                          </div>
                          <Package className="w-16 h-16 mb-3 text-white/90 relative z-10" />
                          <span className="text-sm font-medium text-white/90 relative z-10 text-center">{currentLocale === 'zh' ? product.name.zh : currentLocale === 'ar' ? product.name.ar : product.name.en || product.sku || 'Product'}</span>
                        </div>
                      )}
                      
                      {/* Floating badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-[var(--card-bg)]/90 backdrop-blur-sm text-[var(--primary-color)] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {product.sku}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      {/* Category badge */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-[var(--badge-bg)] text-[var(--primary-color)] rounded-full text-xs font-medium">
                          {(() => {
                            const cat = product.categories?.[0];
                            if (!cat) return 'Product';
                            if (cat.name && typeof cat.name === 'object') {
                              return currentLocale === 'zh' ? (cat.name.zh || cat.name.en || '') :
                                     currentLocale === 'ar' ? (cat.name.ar || cat.name.en || '') :
                                     (cat.name.en || '');
                            }
                            return cat.name || cat.slug || 'Product';
                          })()}
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-[var(--text-primary)] mb-3 line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors duration-300">
                        {currentLocale === 'zh' ? product.name.zh : currentLocale === 'ar' ? product.name.ar : product.name.en}
                      </h3>

                      <p className="text-sm text-[var(--text-secondary)] mb-5 line-clamp-3 leading-relaxed">
                        {currentLocale === 'zh' ? product.description?.zh : currentLocale === 'ar' ? product.description?.ar : product.description?.en}
                      </p>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                        {product.hidePrice ? (
                          <span className="text-sm text-[var(--text-secondary)]">Contact Us for Quote</span>
                        ) : product.price ? (
                          <span className="text-xl font-bold text-[var(--primary-color)]">¥{product.price}</span>
                        ) : (
                          <span className="text-sm text-[var(--text-muted)]">Contact for price</span>
                        )}
                        <a
                          href={`/${currentLocale}/products/${product.slug}`}
                          className="inline-flex items-center text-[var(--primary-color)] font-semibold hover:opacity-80 transition-opacity group/link text-sm"
                        >
                          {t('nav.products')}
                          <ArrowRight className="ml-1.5 w-4 h-4 group-hover/link:translate-x-1.5 transition-transform duration-300" />
                        </a>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-3xl ring-1 ring-blue-500/0 group-hover:ring-blue-500/50 transition-all duration-300 pointer-events-none" />
                  </div>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-16">
              <a
                href={`/${currentLocale}/products`}
                className="group inline-flex items-center px-10 py-4 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
                style={{ background: 'linear-gradient(135deg, var(--primary-color, #2563eb) 0%, var(--primary-hover, #3b82f6) 100%)' }}
              >
                {t('featuredProducts.viewAll')}
                <ArrowRight className="ml-2.5 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
