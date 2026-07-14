'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLocale } from '@/lib/i18n';
import { getProductHref } from '@/lib/product-url';
import { Product } from '@/types/product';
import Link from 'next/link';
import { Heart, ArrowLeft, X, Package } from 'lucide-react';
import ImageWithRetry from '@/components/ui/ImageWithRetry';

// Bug 5 fix: this page was referenced by the account dashboard but never created,
// so the "view all favorites" link 404'd. It shares the SAME storage key
// (`sc_favorites`) as ProductDetailClient so the two stay perfectly in sync.
const FAVORITES_KEY = 'sc_favorites';

export default function FavoritesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { locale, t } = useLocale();

  const [favorites, setFavorites] = useState<Product[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Redirect to login if not authenticated.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, router, locale]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch products by IDs from the database via /api/products?ids=...
  const fetchProductsByIds = useCallback(
    async (idList: string[]): Promise<Product[]> => {
      if (!idList.length) return [];
      try {
        const res = await fetch(
          `/api/products?ids=${encodeURIComponent(idList.join(','))}&status=all`
        );
        if (!res.ok) return [];
        const json = await res.json();
        const list: any[] = json?.data || [];
        return list.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          categories: (p.categories || []).map((c: any) => c.id),
          tags: (p.tags || []).map((tg: any) => tg.id),
          images: p.images || [],
          price: p.price,
          hidePrice: p.hidePrice,
          status: p.status,
          featured: p.featured,
        }));
      } catch {
        return [];
      }
    },
    []
  );

  // Load favorite IDs from localStorage (canonical `sc_favorites`, migrate legacy).
  useEffect(() => {
    if (!isMounted) return;
    const raw =
      localStorage.getItem('sc_favorites') || localStorage.getItem('user_favorites');
    let list: string[] = [];
    try {
      list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }
    // Migrate the old key onto the canonical one so both sources agree.
    if (!localStorage.getItem('sc_favorites') && list.length) {
      localStorage.setItem('sc_favorites', JSON.stringify(list));
      localStorage.removeItem('user_favorites');
    }
    setIds(list);
    fetchProductsByIds(list).then(setFavorites);
  }, [isMounted, fetchProductsByIds]);

  // Remove a product from favorites and keep both state and storage in sync.
  const removeFavorite = (productId: string) => {
    const next = ids.filter((id) => id !== productId);
    setIds(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
  };

  const getProductName = (product: Product): string => {
    if (!product.name) return '';
    if (locale === 'zh') return product.name.zh || product.name.en;
    if (locale === 'ar') return product.name.ar || product.name.en;
    return product.name.en;
  };

  if (isLoading || !isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Link
          href={`/${locale}/account`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {locale === 'zh' ? '返回账户' : locale === 'ar' ? 'العودة للحساب' : 'Back to Account'}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Heart className="w-7 h-7 text-rose-500" />
          {t('account.favorites')}
        </h1>

        {favorites.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Heart className="w-14 h-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {t('account.favorites.empty') ||
                (locale === 'zh'
                  ? '你还没有收藏任何商品'
                  : locale === 'ar'
                  ? 'لم تقم بإضافة أي عناصر إلى المفضلة'
                  : 'You have no favorite products yet')}
            </p>
            <Link
              href={`/${locale}/products`}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              {locale === 'zh' ? '去逛逛' : locale === 'ar' ? 'تصفح المنتجات' : 'Browse products'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="glass-card rounded-2xl overflow-hidden relative group"
              >
                <Link href={getProductHref(product.slug, locale)} className="block">
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {product.images && product.images[0] ? (
                      <div className="w-full h-full transition-transform duration-300 group-hover:scale-110">
                        <ImageWithRetry
                          src={product.images[0]}
                          alt={getProductName(product)}
                          className="w-full h-full object-cover"
                          fallbackSrc="/images/og-default.svg"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                        <Package className="w-10 h-10 text-blue-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate px-3 py-2 group-hover:text-blue-600 transition-colors">
                    {getProductName(product)}
                  </p>
                </Link>
                {/* Remove from favorites */}
                <button
                  type="button"
                  onClick={() => removeFavorite(product.id)}
                  aria-label="Remove from favorites"
                  className="absolute top-2 end-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-rose-600 shadow hover:bg-rose-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
