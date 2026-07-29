'use client';

import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { getProductHref } from '@/lib/product-url';
import { Product } from '@/lib/api';
import OceanHeader from '@/components/OceanHeader';
import ImageWithRetry from '@/components/ui/ImageWithRetry';

// 应用案例列表客户端组件（轻量版，复用产品卡样式与链接逻辑）。
// 仅做网格展示 + 内链，不做筛选/分页，保持与 /en/products 视觉一致且低维护成本。
export default function ApplicationsClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const { locale, t } = useLocale();

  return (
    <div className="min-h-screen bg-blue-50">
      <OceanHeader
        title={t('applications.title')}
        subtitle={t('applications.subtitle')}
        icon={<LayoutGrid className="w-8 h-8 text-blue-300" />}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {initialProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-20">{t('products.noProducts') || 'No applications found.'}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {initialProducts.map((product, index) => {
              const detailHref = getProductHref(product.slug, locale);
              const name = locale === 'zh' ? product.name.zh : locale === 'ar' ? product.name.ar : product.name.en;
              const isPriority = index < 3;
              return (
                <Link
                  key={product.id}
                  href={detailHref}
                  className="group glass-card rounded-2xl overflow-hidden block"
                >
                  {/* Product Image */}
                  <div className="relative h-56 overflow-hidden bg-blue-50">
                    {product.images && product.images[0] ? (
                      <div className="w-full h-56 transition-transform duration-500 group-hover:scale-110">
                        <ImageWithRetry
                          src={product.images[0]}
                          alt={name}
                          className="w-full h-56 object-contain p-4"
                          loading={isPriority ? 'eager' : 'lazy'}
                          fallbackSrc="/images/og-default.svg"
                        />
                      </div>
                    ) : (
                      <div className="h-56 bg-gradient-to-br from-blue-50 to-gray-200 flex items-center justify-center">
                        <LayoutGrid className="w-16 h-16" style={{ color: '#9ca3af' }} />
                      </div>
                    )}
                  </div>
                  {/* Product Info */}
                  <div className="p-5 flex flex-col h-full">
                    <h3 className="text-lg font-bold mb-1.5 line-clamp-2 group-hover:text-blue-600 leading-snug text-gray-900">
                      {name}
                    </h3>
                    <p className="text-xs font-mono mb-2" style={{ color: '#2563eb' }}>
                      {product.sku}
                    </p>
                    <span
                      className="inline-flex items-center font-semibold text-sm mt-auto"
                      style={{ color: '#2563eb' }}
                    >
                      {t('products.viewDetails') || 'View Details'}
                      <svg
                        className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
