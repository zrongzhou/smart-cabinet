'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/i18n';
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
    <section className="py-20 px-6 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: '#eff6ff' }} />
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: '#f7fafc' }} />

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
            className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 inline-flex items-center gap-2"
            style={{ backgroundColor: 'rgba(26, 54, 93, 0.1)', color: '#1a365d' }}
          >
            <StarIcon className="w-4 h-4" />
            {locale === 'zh' ? '精选产品' : 'Featured Products'}
          </div>
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#1a202c' }}
          >
            {t('featuredProducts.title')}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#4a5568' }}
          >
            {t('featuredProducts.subtitle')}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
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
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden border"
                    style={{ borderColor: '#e2e8f0' }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Product Image with hover zoom and overlay */}
                    <div className="relative h-64 overflow-hidden bg-gray-100">
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
                            style={{ display: 'none', backgroundColor: '#1a365d' }}
                          >
                            <span className="text-sm font-medium text-white">{locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en || product.sku || 'Product'}</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2a4a7f 100%)' }}>
                          <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white/40 rounded-full" />
                            <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white/40 rounded-lg rotate-12" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/20 rounded-full" />
                          </div>
                          <span className="text-sm font-medium text-white/90 relative z-10 text-center">{locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en || product.sku || 'Product'}</span>
                        </div>
                      )}
                      
                      {/* Hover Overlay with View Details button */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                        style={{ 
                          backgroundColor: 'rgba(246, 173, 85, 0.9)',
                          opacity: 0 
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                      >
                        <a
                          href={`/${locale}/products/${product.slug}`}
                          className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105"
                          style={{ backgroundColor: '#1a365d', color: '#ffffff' }}
                        >
                          {locale === 'zh' ? '查看详情' : 'View Details'}
                        </a>
                      </div>

                      {/* Product badge */}
                      <div className="absolute top-4 left-4 z-20">
                        <span 
                          className="text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                          style={{ backgroundColor: '#ed8936', color: '#ffffff' }}
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
                          style={{ backgroundColor: 'rgba(26, 54, 93, 0.1)', color: '#1a365d' }}
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
                        style={{ color: '#1a202c' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#1a365d'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#1a202c'; }}
                      >
                        {locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en}
                      </h3>

                      <p className="text-sm mb-4 line-clamp-3 leading-relaxed" style={{ color: '#718096' }}>
                        {locale === 'zh' ? product.description?.zh : locale === 'ar' ? product.description?.ar : product.description?.en}
                      </p>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
                        {product.hidePrice ? (
                          <span className="text-sm font-semibold" style={{ color: '#4a5568' }}>Contact Us for Quote</span>
                        ) : product.price ? (
                          <span className="text-2xl font-bold" style={{ color: '#1a365d' }}>¥{product.price}</span>
                        ) : (
                          <span className="text-sm" style={{ color: '#a0aec0' }}>Contact for price</span>
                        )}
                        <a
                          href={`/${locale}/products/${product.slug}`}
                          className="inline-flex items-center font-semibold text-sm transition-colors duration-300"
                          style={{ color: '#f6ad55' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#ed8936'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#f6ad55'; }}
                        >
                          {t('nav.products')}
                          <svg className="ml-1.5 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </a>
                      </div>
                    </div>
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
                  background: 'linear-gradient(135deg, #ed8936 0%, #f6ad55 100%)',
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
