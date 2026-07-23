import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { fetchUnifiedCategories, getBaseUrl } from '@/data/unified-data';
import { getProductHref } from '@/lib/product-url';
import ImageWithRetry from '@/components/ui/ImageWithRetry';

// 按 slug 实时取分类 + 产品，但允许 ISR 重新校验
export const revalidate = 300;

interface Props {
  params: { locale: string; slug: string };
}

interface CategoryProduct {
  id: string;
  slug: string;
  sku: string;
  name: { zh?: string; en?: string; ar?: string };
  description?: { zh?: string; en?: string; ar?: string };
  price: number;
  hidePrice?: boolean;
  images: string[];
  status: string;
  categories: Array<{ id: string; name: any; slug: string; type?: string }>;
}

// i18n 面包屑/标题基础词
const I18N = {
  en: { home: 'Home', products: 'Products', viewAll: 'View All Products', allProducts: 'All Products' },
  zh: { home: '首页', products: '产品', viewAll: '查看全部产品', allProducts: '全部产品' },
  ar: { home: 'الرئيسية', products: 'المنتجات', viewAll: 'عرض كل المنتجات', allProducts: 'كل المنتجات' },
};

function getLabel(locale: string, key: 'home' | 'products' | 'viewAll' | 'allProducts'): string {
  const dict = (I18N as any)[locale] || I18N.en;
  return dict[key] || I18N.en[key];
}

function localized(value: any, locale: string): string {
  if (value && typeof value === 'object') {
    if (locale === 'zh') return value.zh || value.en || value.ar || '';
    if (locale === 'ar') return value.ar || value.en || value.zh || '';
    return value.en || value.zh || value.ar || '';
  }
  return String(value || '');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categories = await fetchUnifiedCategories();
  const cat = categories.find((c: any) => c.slug === params.slug);
  if (!cat) return { title: 'Category Not Found' };
  const name = cat.nameZh || cat.nameEn || cat.nameAr || params.slug;
  return {
    title: `${name} - Smart Cabinet`,
    description: `View products in ${name} category.`,
  };
}

export default async function CategoryPage({ params: { locale, slug } }: Props) {
  const categories = await fetchUnifiedCategories();
  const cat = categories.find((c: any) => c.slug === slug);

  if (!cat) {
    notFound();
  }

  const name = cat.nameZh || cat.nameEn || cat.nameAr || slug;
  const displayName = locale === 'zh' ? (cat.nameZh || cat.nameEn) : locale === 'ar' ? (cat.nameAr || cat.nameEn) : cat.nameEn;

  // 按 L2.id 拉取该分类下产品（P1-2 实质内容：列表该分类产品）
  let products: CategoryProduct[] = [];
  try {
    const res = await fetch(`${getBaseUrl()}/api/products?category=${cat.id}&status=all`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      products = (json.data || []) as CategoryProduct[];
    }
  } catch (e) {
    console.error('[category] 加载产品失败：', e);
    products = [];
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12">
      <div className="container mx-auto max-w-6xl">
        {/* 面包屑：首页 › 产品 › <分类名> */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={`/${locale}`} className="hover:text-blue-600 transition-colors">
            {getLabel(locale, 'home')}
          </Link>
          <span className="text-gray-300">›</span>
          <Link href={`/${locale}/products`} className="hover:text-blue-600 transition-colors">
            {getLabel(locale, 'products')}
          </Link>
          <span className="text-gray-300">›</span>
          <span className="text-gray-700 font-medium">{displayName}</span>
        </nav>

        {/* 分类标题 */}
        <div className="text-center mb-10">
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            {displayName}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {locale === 'zh'
              ? `浏览「${displayName}」下的 ${products.length} 个产品`
              : locale === 'ar'
                ? `تصفح ${products.length} منتج في ${displayName}`
                : `Explore our ${displayName} collection (${products.length} products)`}
          </p>
        </div>

        {/* 产品网格 */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#9ca3af' }} />
            <p className="text-xl text-gray-500 mb-6">
              {locale === 'zh' ? '该分类暂无产品' : locale === 'ar' ? 'لا توجد منتجات في هذا التصنيف' : 'No products in this category yet.'}
            </p>
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {getLabel(locale, 'viewAll')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {products.map((product) => {
              const detailHref = getProductHref(product.slug, locale);
              const productName = localized(product.name, locale);
              const categoryBadge = product.categories?.[0];
              return (
                <Link
                  key={product.id}
                  href={detailHref}
                  className="group relative bg-white rounded-2xl shadow-md overflow-hidden block hover:shadow-xl transition-shadow"
                >
                  {/* 产品图片 */}
                  {product.images && product.images[0] ? (
                    <div className="relative h-56 overflow-hidden bg-blue-50">
                      <div className="w-full h-56 transition-transform duration-500 group-hover:scale-110">
                        <ImageWithRetry
                          src={product.images[0]}
                          alt={productName}
                          className="w-full h-56 object-contain p-4"
                          loading="lazy"
                          fallbackSrc="/images/og-default.svg"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-lg">
                          {locale === 'zh' ? '查看详情' : 'View Details'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-blue-50 to-gray-200 flex items-center justify-center">
                      <Package className="w-16 h-16" style={{ color: '#9ca3af' }} />
                    </div>
                  )}

                  {/* 产品信息 */}
                  <div className="p-5 flex flex-col h-full">
                    {categoryBadge && (
                      <span
                        className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full mb-2 w-fit"
                        style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb' }}
                      >
                        {localized(categoryBadge.name, locale)}
                      </span>
                    )}
                    <h3 className="text-lg font-bold mb-1.5 line-clamp-2 group-hover:text-blue-600 leading-snug text-gray-900">
                      {productName}
                    </h3>
                    <p className="text-xs font-mono mb-2" style={{ color: '#2563eb' }}>
                      {product.sku}
                    </p>
                    {product.hidePrice ? (
                      <p className="text-sm font-medium mb-2" style={{ color: '#2563eb' }}>
                        {locale === 'zh' ? '联系我们询价' : 'Contact for Pricing'}
                      </p>
                    ) : product.price > 0 ? (
                      <p className="text-base font-bold mb-2" style={{ color: '#ef4444' }}>
                        ${typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                      </p>
                    ) : (
                      <p className="text-xs italic mb-2" style={{ color: '#9ca3af' }}>
                        {locale === 'zh' ? '价格面议' : 'Contact for Price'}
                      </p>
                    )}
                    <span className="inline-flex items-center font-semibold text-sm mt-auto" style={{ color: '#2563eb' }}>
                      {locale === 'zh' ? '查看详情' : 'View Details'}
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
