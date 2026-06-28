'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/i18n';
import { Product } from '@/data/unified-data';
import { fetchUnifiedProducts } from '@/data/unified-data';

export default function FeaturedProducts() {
  const { locale, t } = useLocale();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
    <section className="py-20 px-6 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-50 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            ★ {locale === 'zh' ? '精选产品' : 'Featured Products'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('featuredProducts.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('featuredProducts.subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-xl">
                <div className="h-64 bg-gray-200 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => {
                return (
                  <div
                    key={product.id}
                    className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 border border-gray-100"
                  >
                    {/* Product Image */}
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      {product.images && product.images[0] ? (
                        <>
                          <img 
                            src={product.images[0]} 
                            alt={locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                            loading={index < 2 ? "eager" : "lazy"}
                          />
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center text-white"
                            style={{ display: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
                          >
                            <span className="text-sm font-medium">{locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en || product.sku || 'Product'}</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}>
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white/40 rounded-full" />
                            <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white/40 rounded-lg rotate-12" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full" />
                          </div>
                          <span className="text-sm font-medium text-white/90 relative z-10 text-center">{locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en || product.sku || 'Product'}</span>
                        </div>
                      )}
                      
                      {/* Product badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {product.sku}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category badge */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {(() => {
                            const cat = product.categories?.[0];
                            if (!cat) return 'Product';
                            if (cat.name && typeof cat.name === 'object') {
                              return locale === 'zh' ? (cat.name.zh || cat.name.en || '') :
                                     locale === 'ar' ? (cat.name.ar || cat.name.en || '') :
                                     (cat.name.en || '');
                            }
                            return cat.name || cat.slug || 'Product';
                          })()}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                        {locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {locale === 'zh' ? product.description?.zh : locale === 'ar' ? product.description?.ar : product.description?.en}
                      </p>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {product.hidePrice ? (
                          <span className="text-sm text-gray-600 font-semibold">Contact Us for Quote</span>
                        ) : product.price ? (
                          <span className="text-2xl font-bold text-blue-600">¥{product.price}</span>
                        ) : (
                          <span className="text-sm text-gray-500">Contact for price</span>
                        )}
                        <a
                          href={`/${locale}/products/${product.slug}`}
                          className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm"
                        >
                          {t('nav.products')}
                          <svg className="ml-1.5 w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-16">
              <a
                href={`/${locale}/products`}
                className="group inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:-translate-y-1 text-lg"
              >
                {t('featuredProducts.viewAll')}
                <svg className="ml-2.5 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
