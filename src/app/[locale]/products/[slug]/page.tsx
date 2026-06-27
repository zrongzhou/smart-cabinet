'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Package, ArrowLeft, Share2, ChevronRight, ChevronLeft, X, Star, FileText, Ruler, MessageSquare } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { Product } from '@/lib/api';
import ReviewList from '@/components/products/ReviewList';
import SafeImage from '@/components/ui/SafeImage';

// Helper function to translate i18n objects
function translate(obj: any, locale: 'en' | 'zh' | 'ar'): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object') {
    return obj[locale] || obj.en || obj.zh || obj.ar || '';
  }
  return '';
}

// Helper to get category IDs from categories array (handles both string[] and object[])
function getCategoryIds(categories: any[]): string[] {
  if (!categories || !Array.isArray(categories)) return [];
  return categories.map(c => typeof c === 'string' ? c : c.id).filter(Boolean);
}

export default function ProductDetailPage() {
  const params = useParams();
  const { locale, t } = useLocale();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'features' | 'reviews'>('description');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  const [mainImageLoading, setMainImageLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        
        // Fetch product directly from API
        const res = await fetch(`/api/products?slug=${slug}&status=all`);
        if (!res.ok) {
          notFound();
          return;
        }
        
        const json = await res.json();
        const found: Product = json.data?.[0];
        
        if (!found) {
          notFound();
          return;
        }

        setProduct(found);

        // Get related products (same category)
        const allRes = await fetch('/api/products?status=active');
        if (allRes.ok) {
          const allJson = await allRes.json();
          const allProducts: Product[] = allJson.data || [];
          
          const productCatIds = getCategoryIds(found.categories as any[]);
          const related = allProducts
            .filter(p => p.id !== found.id)
            .filter(p => {
              const pCatIds = getCategoryIds(p.categories as any[]);
              return pCatIds.some(id => productCatIds.includes(id));
            })
            .slice(0, 4);

          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        // User is not logged in
      }
    }

    if (slug) {
      loadProduct();
      checkAuth();
    }
  }, [slug]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Product detail skeleton */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
              {/* Image skeleton */}
              <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />

              {/* Info skeleton */}
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex gap-3">
                  <div className="h-12 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-12 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-700 mb-3">
            {locale === 'zh' ? '产品未找到' : locale === 'ar' ? 'لم يتم العثور على المنتج' : 'Product Not Found'}
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {locale === 'zh'
              ? '抱歉，您查找的产品不存在或已被移除。请浏览我们的产品列表。'
              : locale === 'ar'
              ? 'عذراً، المنتج الذي تبحث عنه غير موجود أو تمت إزالته. يرجى تصفح قائمة المنتجات.'
              : 'Sorry, the product you are looking for does not exist or has been removed. Please browse our product list.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`/${locale}/products`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === 'zh' ? '返回产品列表' : locale === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}
            </a>
            <a
              href={`/${locale}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              {locale === 'zh' ? '返回首页' : locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  const name = translate(product.name, locale);
  const description = translate(product.description, locale);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href={`/${locale}`} className="text-gray-500 hover:text-blue-600 transition-colors">
                {locale === 'zh' ? '首页' : locale === 'ar' ? 'الرئيسية' : 'Home'}
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <a href={`/${locale}/products`} className="text-gray-500 hover:text-blue-600 transition-colors">
                {t('products.title') || 'Products'}
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">
              {name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Product Detail */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Left: Image Gallery */}
            <div>
              {product.images && product.images.length > 0 ? (
                <>
                    {/* Main Image */}
                    <div
                      className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-zoom-in group"
                      onClick={() => setLightboxOpen(true)}
                    >
                      {mainImageError ? (
                        /* Fallback when image fails to load */
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                          <Package className="w-24 h-24 text-gray-300" />
                          <p className="text-gray-400 text-sm mt-4">{locale === 'zh' ? '图片暂时无法显示' : locale === 'ar' ? 'الصورة غير متاحة' : 'Image not available'}</p>
                        </div>
                      ) : (
                        <>
                          {/* Use regular img tag for better external URL handling */}
                          <img
                            src={product.images[selectedImage] || ''}
                            alt={`${name} - Image ${selectedImage + 1}`}
                            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                            loading="eager"
                            onLoad={() => setMainImageLoading(false)}
                            onError={() => {
                              setMainImageError(true);
                              setMainImageLoading(false);
                            }}
                          />
                          {/* Loading spinner */}
                          {mainImageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                            </div>
                          )}
                        </>
                      )}
                    {/* Zoom hint overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                        {locale === 'zh' ? '点击放大' : locale === 'ar' ? 'تكبير' : 'Click to Zoom'}
                      </div>
                    </div>
                    {/* Navigation arrows for multiple images */}
                    {product.images.length > 1 && !mainImageError && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage((prev) => (prev === 0 ? product.images!.length - 1 : prev - 1));
                            setMainImageError(false);
                            setMainImageLoading(true);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage((prev) => (prev === product.images!.length - 1 ? 0 : prev + 1));
                            setMainImageError(false);
                            setMainImageLoading(true);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {product.images.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {product.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedImage(index);
                            setMainImageError(false);
                            setMainImageLoading(true);
                          }}
                          className={`relative flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${
                            selectedImage === index ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img 
                            src={image} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="relative aspect-square bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl overflow-hidden flex items-center justify-center">
                  <Package className="w-32 h-32 text-white/50" />
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col justify-between">
              {/* Header */}
              <div>
                {/* Category badges */}
                {product.categories && product.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.categories.map((cat: any) => (
                      <span
                        key={cat.id}
                        className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full"
                      >
                        {translate(cat.name, locale)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Product Name */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>

                {/* SKU */}
                <p className="text-sm text-gray-500 font-mono mb-4">{product.sku}</p>

                {/* Price */}
                <div className="mb-6">
                  {product.hidePrice ? (
                    <p className="text-lg text-blue-600 font-medium">
                      {locale === 'zh' ? '联系我们询价' : locale === 'ar' ? 'اتصل بنا للسعر' : 'Contact for Pricing'}
                    </p>
                  ) : product.price ? (
                    <p className="text-3xl font-bold text-red-500">
                      ${product.price.toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-lg text-gray-400 italic">
                      {locale === 'zh' ? '价格面议' : locale === 'ar' ? 'السعر قابل للتفاوض' : 'Price on Request'}
                    </p>
                  )}
                </div>

                {/* Short Description - supports HTML */}
                {description && (
                  <div
                    className="prose prose-sm max-w-none mb-6 text-gray-600 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                )}

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <a
                    href={`/${locale}/contact`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    {locale === 'zh' ? '联系我们' : locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                  </a>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: name,
                          text: description || '',
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert(locale === 'zh' ? '链接已复制' : 'Link copied!');
                      }
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    {locale === 'zh' ? '分享' : locale === 'ar' ? 'مشاركة' : 'Share'}
                  </button>
                </div>
              </div>

              {/* Back to list */}
              <div>
                <a
                  href={`/${locale}/products`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {locale === 'zh' ? '返回产品列表' : locale === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}
                </a>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="px-6 lg:px-8 pb-8 border-t border-gray-200">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-1 -mb-px mt-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'description'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 inline-block mr-2" />
                {locale === 'zh' ? '描述' : locale === 'ar' ? 'الوصف' : 'Description'}
              </button>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'specifications'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Ruler className="w-4 h-4 inline-block mr-2" />
                  {locale === 'zh' ? '规格' : locale === 'ar' ? 'المواصفات' : 'Specifications'}
                </button>
              )}

              {product.features && (product.features[locale] || product.features.en || []).length > 0 && (
                <button
                  onClick={() => setActiveTab('features')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'features'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Star className="w-4 h-4 inline-block mr-2" />
                  {locale === 'zh' ? '特点' : locale === 'ar' ? 'الميزات' : 'Features'}
                </button>
              )}

              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline-block mr-2" />
                {locale === 'zh' ? '评论' : locale === 'ar' ? 'المراجعات' : 'Reviews'}
              </button>
            </div>

            {/* Tab Content */}
            <div className="pt-6">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="prose prose-sm max-w-none">
                  {description && (
                    <div
                      className="text-gray-600 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  )}
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === 'specifications' && product.specifications && (() => {
                // Check if specifications has actual content
                if (typeof product.specifications === 'object' && !Array.isArray(product.specifications)) {
                  const specValue = product.specifications[locale as keyof typeof product.specifications]
                    || product.specifications.en
                    || product.specifications.zh
                    || product.specifications.ar
                    || '';
                  if (!specValue || (typeof specValue === 'string' && specValue.trim() === '')) return null;
                }
                if (Object.keys(product.specifications).length === 0) return null;
                
                return (
                  <div className="prose prose-sm max-w-none">
                    {/* Format 1: i18n object */}
                    {typeof product.specifications === 'object' && !Array.isArray(product.specifications) &&
                     (product.specifications[locale as keyof typeof product.specifications] !== undefined || 
                      product.specifications.en !== undefined || 
                      product.specifications.zh !== undefined ||
                      product.specifications.ar !== undefined) &&
                     typeof (product.specifications[locale as keyof typeof product.specifications] || product.specifications.en || product.specifications.zh) === 'string' ? (
                      (() => {
                        const specValue = product.specifications[locale as keyof typeof product.specifications]
                          || product.specifications.en
                          || product.specifications.zh
                          || product.specifications.ar
                          || '';
                        if (!specValue || (typeof specValue === 'string' && specValue.trim() === '')) return null;
                        return (
                          <div
                            className="bg-gray-50 rounded-xl p-5 border border-gray-200 whitespace-pre-wrap text-gray-600"
                            dangerouslySetInnerHTML={{ __html: typeof specValue === 'string' ? specValue : '' }}
                          />
                        );
                      })()
                    ) : (
                      /* Format 2: key-value object */
                      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm min-w-[400px]">
                            <tbody>
                              {Object.entries(product.specifications).map(([key, value]: [string, any], index: number) => (
                                <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-4 py-3 font-medium text-gray-900 min-w-[120px] border-r border-gray-200">
                                    {key}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600">
                                    {translate(value, locale) || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Features Tab */}
              {activeTab === 'features' && product.features && (() => {
                const featuresArray = product.features[locale] || product.features.en || [];
                if (!featuresArray || featuresArray.length === 0) return null;
                
                return (
                  <div className="prose prose-sm max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {featuresArray.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
                          <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 group-hover:scale-110 transition-transform">
                            ✓
                          </span>
                          <span className="text-gray-700 leading-relaxed text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && product.slug && (
                <div className="prose prose-sm max-w-none">
                  <ReviewList
                    productSlug={product.slug}
                    locale={locale}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block" />
              {locale === 'zh' ? '相关产品' : locale === 'ar' ? 'منتجات ذات صلة' : 'Related Products'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <a
                  key={relatedProduct.id}
                  href={`/${locale}/products/${relatedProduct.slug}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
                >
                  <div className="relative h-44 overflow-hidden bg-gray-50">
                    {relatedProduct.images?.[0] ? (
                      <SafeImage
                        src={relatedProduct.images[0]}
                        alt={translate(relatedProduct.name, locale)}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        quality={75}
                        fallbackClassName="bg-gradient-to-br from-gray-100 to-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-snug">
                      {translate(relatedProduct.name, locale)}
                    </h3>
                    <p className="text-xs text-blue-500 font-mono mt-1.5">{relatedProduct.sku}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightboxOpen && product.images && product.images.length > 0 && !mainImageError && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => { setLightboxOpen(false); setZoomLevel(1); }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); setZoomLevel(1); }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-4xl max-h-[85vh] h-full flex items-center justify-center overflow-auto">
            <img
              src={product.images[selectedImage]}
              alt={name}
              className={`max-w-full max-h-[85vh] object-contain rounded-lg transition-transform duration-300 cursor-zoom-in ${
                zoomLevel === 2 ? 'scale-150 origin-center' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel(prev => prev === 1 ? 2 : 1);
              }}
              onError={() => setLightboxOpen(false)}
            />
            {/* Zoom hint */}
            {zoomLevel === 1 && (
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm pointer-events-none">
                {locale === 'zh' ? '点击图片放大' : locale === 'ar' ? 'انقر لتكبير الصورة' : 'Click image to zoom'}
              </p>
            )}
          </div>
          {product.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev === 0 ? product.images!.length - 1 : prev - 1));
                  setZoomLevel(1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev === product.images!.length - 1 ? 0 : prev + 1));
                  setZoomLevel(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
