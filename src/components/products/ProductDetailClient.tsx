'use client';

import { useState, useEffect } from 'react';
import { Package, ArrowLeft, Share2, ChevronRight, ChevronLeft, X, Star, FileText, Ruler, MessageSquare, Heart } from 'lucide-react';
import Image from 'next/image';
import ReviewList from '@/components/products/ReviewList';
import SafeImage from '@/components/ui/SafeImage';
import { getProductHref } from '@/lib/product-url';

// Safe text renderer - handles i18n objects, arrays, null, undefined
function safeText(value: any, fallback: string = ''): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') {
    // Try to extract string value from common i18n formats
    const keys = Object.keys(value);
    if (keys.some(k => ['en','zh','ar'].includes(k))) {
      // It's an i18n object - try en first, then zh, then ar
      return value.en || value.zh || value.ar || JSON.stringify(value);
    }
    return JSON.stringify(value);
  }
  return fallback;
}

interface ProductDetailClientProps {
  product: any;
  locale: string;
  labels: Record<string, string>;
  relatedProducts: any[];
}

export default function ProductDetailClient({
  product,
  locale,
  labels,
  relatedProducts,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'features' | 'reviews'>('description');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mainImageError, setMainImageError] = useState(false);
  const [mainImageLoading, setMainImageLoading] = useState(true);
  const [mainImageRetryCount, setMainImageRetryCount] = useState(0);
  const [imageKey, setImageKey] = useState(0);

  // Smart retry: on error, retry with exponential backoff (1s->2s->4s) before giving up
  const handleMainImageError = () => {
    if (mainImageRetryCount < 3) {
      const delay = Math.pow(2, mainImageRetryCount) * 1000;
      setMainImageRetryCount(c => c + 1);
      setMainImageLoading(true);
      setTimeout(() => setImageKey(k => k + 1), delay);
    } else {
      setMainImageError(true);
      setMainImageLoading(false);
    }
  };

  // TASK 3 fix: detect whether usable specs exist. The resolved specs may be
  // a key/value object (canonical + legacy shapes) or a non-empty string
  // (legacy prose). NOTE: previously the Specifications tab was NOT the default
  // active tab, so the resolved spec table was hidden behind a non-active
  // tab and new products' spec tables effectively never showed. We now render
  // the specs table in an always-visible, prominent block ABOVE the tabs.
  const hasSpecs =
    !!product._resolvedSpecs &&
    (typeof product._resolvedSpecs === 'string'
      ? product._resolvedSpecs.trim() !== ''
      : Object.keys(product._resolvedSpecs).length > 0);

  /** Render the specs as a clear, consistent table (or prose box for string specs). */
  const renderSpecsTable = () => {
    const specs = product._resolvedSpecs;
    if (typeof specs === 'string') {
      if (!specs.trim()) return null;
      return (
        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
          <div className="p-5 text-gray-600 whitespace-pre-wrap">{safeText(specs)}</div>
        </div>
      );
    }
    let specsObj: Record<string, any> | null = null;
    if (Array.isArray(specs)) {
      // Safety net: array form [{param, value}] -> key/value object.
      specsObj = {};
      for (const row of specs) {
        if (row && row.param != null) specsObj[String(row.param)] = row.value ?? '';
      }
    } else {
      specsObj = specs as Record<string, any>;
    }
    if (!specsObj || Object.keys(specsObj).length === 0) return null;
    return (
      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <tbody>
              {Object.entries(specsObj).map(([key, value]: [string, any], index: number) => (
                <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-900 min-w-[120px] border-r border-gray-200">
                    {safeText(key)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {safeText(value) || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Reset retry state when switching images
  const handleSelectImage = (index: number) => {
    setSelectedImage(index);
    setMainImageError(false);
    setMainImageLoading(true);
    setMainImageRetryCount(0);
    setImageKey(k => k + 1);
  };

  // Timeout fallback: trigger retry on first-load timeout instead of giving up
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (mainImageLoading && !mainImageError && mainImageRetryCount === 0) {
      timer = setTimeout(() => handleMainImageError(), 8000);
    }
    return () => { clearTimeout(timer) };
  }, [mainImageLoading, mainImageError, mainImageRetryCount]);
  const [shareToast, setShareToast] = useState(false);
  // Bug 5 fix: show a toast so the user gets immediate visual feedback that the
  // favorite was saved/removed (previously the heart toggled silently).
  const [favToast, setFavToast] = useState(false);

  // Favorite (wishlist) toggle — persisted to localStorage, no server dependency.
  const FAVORITES_KEY = 'sc_favorites';
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        if (Array.isArray(ids)) setFavorited(ids.includes(product.id));
      }
    } catch {
      // ignore malformed favorites storage
    }
  }, [product.id]);

  const toggleFavorite = () => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const willAdd = !ids.includes(product.id);
      const next = willAdd
        ? [...ids, product.id]
        : ids.filter((id) => id !== product.id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      setFavorited(next.includes(product.id));
      // Bug 5 fix: surface a confirmation toast reflecting the new state.
      setFavToast(true);
      setTimeout(() => setFavToast(false), 2000);
    } catch {
      // storage unavailable — fall back to a visual-only toggle
      setFavorited((v) => !v);
    }
  };

  const favoriteLabel =
    labels.favorite ??
    (locale === 'zh' ? '收藏' : locale === 'ar' ? 'مفضل' : 'Favorite');

  // Use pre-resolved data from server (no function props!)
  const name = product._resolvedName || '';
  const description = product._resolvedDescription || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href={`/${locale}`} className="text-gray-500 hover:text-blue-600 transition-colors">
                {labels.home}
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <a href={`/${locale}/products`} className="text-gray-500 hover:text-blue-600 transition-colors">
                {labels.productsTitle}
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
        <div className="glass-card water-ripple rounded-2xl overflow-hidden relative"
          onMouseMove={(e: React.MouseEvent) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            (e.currentTarget as HTMLElement).style.setProperty('--rx', `${x}%`);
            (e.currentTarget as HTMLElement).style.setProperty('--ry', `${y}%`);
            // 移动透光光斑
            const glow = e.currentTarget.querySelector('.card-glow-spot') as HTMLElement | null;
            if (glow) {
              glow.style.left = `${x}%`;
              glow.style.top = `${y}%`;
              glow.style.transform = 'translate(-50%, -50%)';
            }
            // 第三波纹跟随鼠标
            const w3 = e.currentTarget.querySelector('.ripple-wave3') as HTMLElement | null;
            if (w3) {
              w3.style.left = `${x}%`;
              w3.style.top = `${y}%`;
            }
          }}
        >
          {/* 透光光斑 */}
          <div className="card-glow-spot" />
          {/* 第三层波纹 */}
          <div className="ripple-wave3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Left: Image Gallery */}
            <div>
              {product.images && product.images.length > 0 ? (
                <>
                    {/* Main Image */}
                    <div
                      className="relative aspect-square bg-gray-50/80 rounded-xl overflow-hidden cursor-zoom-in group water-ripple"
                      onClick={() => setLightboxOpen(true)}
                      onMouseMove={(e: React.MouseEvent) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        (e.currentTarget as HTMLElement).style.setProperty('--rx', `${x}%`);
                        (e.currentTarget as HTMLElement).style.setProperty('--ry', `${y}%`);
                        const w3 = e.currentTarget.querySelector('.ripple-wave3') as HTMLElement | null;
                        if (w3) { w3.style.left = `${x}%`; w3.style.top = `${y}%`; }
                      }}
                    >
                      {/* 图片区第三层波纹 */}
                      <div className="ripple-wave3" />
                      {mainImageError || !product.images?.length || !product.images[selectedImage] ? (
                        /* Fallback when image fails to load */
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                          <Package className="w-24 h-24 text-gray-300" />
                          <p className="text-gray-400 text-sm mt-4">{labels.imageNotAvailable}</p>
                        </div>
                      ) : (
                        <>
                          {/* 主图改用 next/image：自动出 WebP/AVIF、fill+sizes 预留空间防 CLS、alt 用产品展示标题 */}
                          <div className="absolute inset-0 p-4">
                            <Image
                              src={product.images[selectedImage] || ''}
                              alt={`${name} - Image ${selectedImage + 1}`}
                              fill
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              className="object-contain transition-transform duration-500 group-hover:scale-110"
                              key={imageKey}
                              loading="eager"
                              onLoad={() => { setMainImageLoading(false); setMainImageRetryCount(0); }}
                              onError={handleMainImageError}
                            />
                          </div>
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
                        {labels.clickToZoom}
                      </div>
                    </div>
                    {/* Navigation arrows for multiple images */}
                    {product.images.length > 1 && !mainImageError && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectImage(selectedImage === 0 ? product.images!.length - 1 : selectedImage - 1);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectImage(selectedImage === product.images!.length - 1 ? 0 : selectedImage + 1);
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
                            handleSelectImage(index);
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
                    {product.categories.map((cat: any, idx: number) => (
                      <span
                        key={cat.id || idx}
                        className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full"
                      >
                        {cat._resolvedName || cat.name}
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
                      {labels.contactForPricing}
                    </p>
                  ) : product.price ? (
                    <p className="text-3xl font-bold text-red-500">
                      ${product.price.toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-lg text-gray-400 italic">
                      {labels.priceOnRequest}
                    </p>
                  )}
                </div>

                {/* Short Description - supports HTML */}
                {description && (
                  <div
                    className="prose prose-sm max-w-none mb-6 text-gray-600 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: safeText(description) }}
                  />
                )}

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <a
                    href={`/${locale}/contact`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 hover:-translate-y-0.5"
                  >
                    {labels.contactUs}
                  </a>
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    aria-pressed={favorited}
                    aria-label={favoriteLabel}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5 ${
                      favorited
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : 'glass-btn text-gray-700'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
                    {favoriteLabel}
                    {favToast && (
                      <span className="ml-1 inline-flex items-center px-2 py-0.5 bg-white/40 text-rose-700 text-xs font-medium rounded-full">
                        {favorited ? '✓' : '✕'}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      const shareData = {
                        title: name || document.title,
                        // strip HTML tags from description before sharing
                        text: (description || '').replace(/<[^>]*>/g, '').substring(0, 200),
                        url: window.location.href,
                      };
                      try {
                        // Only use native share on mobile-like environments
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                        if (isMobile && navigator.share && navigator.canShare?.(shareData)) {
                          await navigator.share(shareData);
                          return;
                        }
                        // Desktop & fallback: always copy link
                        await navigator.clipboard.writeText(window.location.href);
                        setShareToast(true);
                        setTimeout(() => setShareToast(false), 2000);
                      } catch (err) {
                        // Final fallback
                        try {
                          await navigator.clipboard.writeText(window.location.href);
                          setShareToast(true);
                          setTimeout(() => setShareToast(false), 2000);
                        } catch {
                          // clipboard also failed (rare)
                        }
                      }
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 glass-btn text-gray-700 rounded-xl font-semibold hover:-translate-y-0.5 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    {labels.share}
                    {shareToast && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">✓ Link copied!</span>
                    )}
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
                  {labels.backToProducts}
                </a>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="px-6 lg:px-8 pb-8 border-t border-gray-200">
            {/* TASK 3 fix: Specifications are ALWAYS shown here (prominent),
                above the tabs, so new products' spec tables are never hidden
                behind a non-default tab. */}
            {hasSpecs && (
              <div className="mt-2 mb-8">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-1.5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" />
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <Ruler className="w-4 h-4 text-blue-600" />
                    {labels.specifications}
                  </h3>
                </div>
                {renderSpecsTable()}
              </div>
            )}

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
                {labels.description}
              </button>

              {product._resolvedFeatures && product._resolvedFeatures.length > 0 && (
                <button
                  onClick={() => setActiveTab('features')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'features'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Star className="w-4 h-4 inline-block mr-2" />
                  {labels.features}
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
                {labels.reviews}
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
                      dangerouslySetInnerHTML={{ __html: safeText(description) }}
                    />
                  )}
                </div>
              )}

              {/* Features Tab */}
              {activeTab === 'features' && product._resolvedFeatures && (() => {
                const featuresArray = product._resolvedFeatures;
                if (!featuresArray || featuresArray.length === 0) return null;
                
                return (
                  <div className="prose prose-sm max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {featuresArray.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 glass-btn rounded-xl hover:shadow-md transition-all duration-300 group">
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
              {labels.relatedProducts}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <a
                  key={relatedProduct.id}
                  href={getProductHref(relatedProduct.slug, locale)}
                  className="group glass-card water-ripple rounded-2xl overflow-hidden block relative"
                  onMouseMove={(e: React.MouseEvent) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    (e.currentTarget as HTMLElement).style.setProperty('--rx', `${x}%`);
                    (e.currentTarget as HTMLElement).style.setProperty('--ry', `${y}%`);
                    const glow = e.currentTarget.querySelector('.card-glow-spot') as HTMLElement | null;
                    if (glow) { glow.style.left = `${x}%`; glow.style.top = `${y}%`; glow.style.transform = 'translate(-50%, -50%)'; }
                    const w3 = e.currentTarget.querySelector('.ripple-wave3') as HTMLElement | null;
                    if (w3) { w3.style.left = `${x}%`; w3.style.top = `${y}%`; }
                  }}
                >
                  {/* 透光光斑 */}
                  <div className="card-glow-spot" />
                  {/* 第三层波纹 */}
                  <div className="ripple-wave3" />
                  <div className="relative h-44 overflow-hidden bg-gray-50">
                    {relatedProduct.images?.[0] ? (
                      <SafeImage
                        src={relatedProduct.images[0]}
                        alt={safeText(relatedProduct._resolvedName || relatedProduct.name)}
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
                      {safeText(relatedProduct._resolvedName || relatedProduct.name)}
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
                {labels.clickImageToZoom}
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
