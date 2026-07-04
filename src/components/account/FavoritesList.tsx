'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/lib/i18n';
import { getProductHref } from '@/lib/product-url';
import { Heart, Trash2 } from 'lucide-react';

interface FavoriteItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    slug: string;
    name: any;
    price: number;
    hidePrice: boolean;
    images: string[];
    status: string;
  };
}

interface FavoritesListProps {
  locale: string;
  favorites: FavoriteItem[];
  onRemove: (productId: string) => void;
}

export default function FavoritesList({ locale, favorites, onRemove }: FavoritesListProps) {
  const { t } = useLocale();

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {locale === 'zh' ? '暂无收藏' : locale === 'ar' ? 'لا توجد مفضلة' : 'No favorites yet'}
        </h3>
        <p className="text-gray-500">
          {locale === 'zh' ? '浏览产品并添加收藏' : locale === 'ar' ? 'تصفح المنتجات وأضف إلى المفضلة' : 'Browse products and add them to favorites'}
        </p>
        <Link
          href={`/${locale}/products`}
          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {locale === 'zh' ? '浏览产品' : locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((favorite) => {
        const product = favorite.product;
        const productName = product.name?.[locale] || product.name?.en || 'Product';
        const productHref = getProductHref(product.slug, locale);

        return (
          <div
            key={favorite.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
          >
            <Link href={productHref} className="block relative">
              <div className="relative h-48 bg-gray-100">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={productName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
            </Link>

            <div className="p-4">
              <Link href={productHref} className="block">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-1">
                  {productName}
                </h3>
              </Link>

              <div className="flex items-center justify-between">
                <div>
                  {product.hidePrice ? (
                    <span className="text-sm text-gray-500">Contact Us</span>
                  ) : product.price ? (
                    <span className="text-xl font-bold text-blue-600">${product.price}</span>
                  ) : (
                    <span className="text-sm text-gray-500">Request Quote</span>
                  )}
                </div>

                <button
                  onClick={() => onRemove(product.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title={locale === 'zh' ? '移除收藏' : locale === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites'}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                {locale === 'zh' ? '收藏于' : locale === 'ar' ? 'أضيف في' : 'Added on'}{' '}
                {new Date(favorite.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'ar' ? 'ar-SA' : 'en-US')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
