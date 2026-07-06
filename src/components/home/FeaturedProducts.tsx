'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/i18n';
import { getProductHref } from '@/lib/product-url';
import { Product } from '@/data/unified-data';
import { fetchUnifiedProducts } from '@/data/unified-data';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

export default function FeaturedProducts() {
  const { locale, t } = useLocale();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        // Request featured + active products directly from the API (server-side
        // filter on the `featured` + `status` fields). This guarantees the correct
        // set is returned even if the `featured` field were ever missing/serialized
        // differently on the client. The extra client-side guard keeps it safe.
        const allProducts = await fetchUnifiedProducts('active', true);
        const featured = allProducts.filter(p => p.status === 'active');
        setFeaturedProducts(featured);
      } catch (e) {
        console.error('Failed to load featured products:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Framer Motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 50%, #f8fafc 100%)' }}>
      {/* Subtle background decorations */}
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.06)' }} />
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(99, 102, 241, 0.04)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#2563eb' }}
          >
            <StarIcon className="w-4 h-4" />
            {t('featuredProducts.title')}
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#0f172a' }}
          >
            {t('featuredProducts.subtitle')}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#64748b' }}
          >
            
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border border-white/40">
                <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-6 w-full bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {featuredProducts.map((product, index) => {
                return (
                  <motion.div
                    key={product.id}
                    variants={fadeInUp}
                    className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.72)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      boxShadow: '0 4px 24px rgba(148, 163, 184, 0.12), 0 1px 2px rgba(148, 163, 184, 0.06)',
                    }}
                    whileHover={{
                      y: -6,
                      boxShadow: '0 16px 40px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(148, 163, 184, 0.1)'
                    }}
                    transition={{ duration: 0.35 }}
                  >
                    {/* Product Image with hover zoom */}
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30">
                      {product.images && product.images[0] ? (
                        <>
                          <img
                            src={product.images[0]}
                            alt={locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en}
                            className="w-full h-full object-cover transition-transform duration-700"
                            style={{ transform: 'scale(1)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                            loading={index < 2 ? "eager" : "lazy"}
                          />
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center"
                            style={{ display: 'none', background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
                          >
                            <span className="text-sm font-medium text-white/90 relative z-10 text-center">{locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en || product.sku || 'Product'}</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)' }}>
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white/40 rounded-full" />
                            <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white/40 rounded-lg rotate-12" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full" />
                          </div>
                          <span className="text-sm font-medium text-white/90 relative z-10 text-center">{locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en || product.sku || 'Product'}</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div
                        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                        style={{
                          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.92) 0%, rgba(59, 130, 246, 0.88) 100%)',
                          opacity: 0
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                      >
                        <a
                          href={getProductHref(product.slug, locale)}
                          className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105"
                          style={{ backgroundColor: '#ffffff', color: '#2563eb' }}
                        >
                          {locale === 'zh' ? '查看详情' : 'View Details'}
                        </a>
                      </div>

                      {/* Product badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-full shadow-md"
                          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', color: '#ffffff' }}
                        >
                          {product.sku}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category badge */}
                      <div className="mb-3">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}
                        >
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

                      <h3
                        className="text-xl font-bold mb-2 line-clamp-2 transition-colors duration-300"
                        style={{ color: '#1e293b' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#2563eb'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#1e293b'; }}
                      >
                        {locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en}
                      </h3>

                      <p className="text-sm mb-4 line-clamp-3 leading-relaxed" style={{ color: '#64748b' }}>
                        {locale === 'zh' ? product.description?.zh : locale === 'ar' ? product.description?.ar : product.description?.en}
                      </p>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(226, 232, 240, 0.5)' }}>
                        {product.hidePrice ? (
                          <span className="text-sm font-semibold" style={{ color: '#64748b' }}>Contact Us for Quote</span>
                        ) : product.price ? (
                          <span className="text-2xl font-bold" style={{ color: '#2563eb' }}>¥{product.price}</span>
                        ) : (
                          <span className="text-sm" style={{ color: '#94a3b8' }}>Contact for price</span>
                        )}
                        <a
                          href={getProductHref(product.slug, locale)}
                          className="inline-flex items-center font-semibold text-sm transition-colors duration-300"
                          style={{ color: '#3b82f6' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#2563eb'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#3b82f6'; }}
                        >
                          {t('nav.products')}
                          <svg className="ml-1.5 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </a>
                      </div>
                    </div>

                    {/* Glass highlight overlay on hover */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, transparent 60%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(148,163,184,0.08)',
                      }}
                    />
                    
                    {/* Glass edge highlight — always visible, stronger on hover */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-px rounded-t-2xl transition-opacity duration-500"
                      style={{ 
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.9) 70%, transparent 100%)',
                        opacity: 0.6,
                      }}
                    />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* View All Button */}
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.a
                href={`/${locale}/products`}
                className="group inline-flex items-center px-10 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
                }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                {t('featuredProducts.viewAll')}
                <svg className="ml-2.5 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.a>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
