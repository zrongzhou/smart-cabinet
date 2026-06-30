'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLocale } from '@/lib/i18n';
import { Product } from '@/types/product';
import Link from 'next/link';
import {
  Package,
  Heart,
  Eye,
  User,
  Lock,
  ShoppingBag,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Settings
} from 'lucide-react';

// Order interface
interface Order {
  id: string;
  date: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  amount: number;
  items: number;
}

// Mock orders for demo (in production, fetch from API)
const MOCK_ORDERS: Order[] = [
  { id: 'ORD-2024-001', date: '2024-01-15', status: 'delivered', amount: 12500, items: 3 },
  { id: 'ORD-2024-002', date: '2024-02-20', status: 'shipped', amount: 8500, items: 2 },
  { id: 'ORD-2024-003', date: '2024-03-10', status: 'pending', amount: 3200, items: 1 },
];

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const { locale, t } = useLocale();

  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, router, locale]);

  // Load data from localStorage after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Load orders from localStorage (or use mock data for demo)
    const storedOrders = localStorage.getItem('order_history');
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch {
        setOrders(MOCK_ORDERS);
      }
    } else {
      setOrders(MOCK_ORDERS);
    }

    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem('user_favorites');
    if (storedFavorites) {
      try {
        const favoriteIds: string[] = JSON.parse(storedFavorites);
        // Fetch product details for each favorite
        fetchProductsByIds(favoriteIds).then(setFavorites);
      } catch {
        setFavorites([]);
      }
    }

    // Load recently viewed from localStorage
    const storedRecent = localStorage.getItem('recently_viewed');
    if (storedRecent) {
      try {
        const recentIds: string[] = JSON.parse(storedRecent);
        fetchProductsByIds(recentIds).then(setRecentlyViewed);
      } catch {
        setRecentlyViewed([]);
      }
    }
  }, [isMounted]);

  // Fetch products by IDs (from local data)
  const fetchProductsByIds = useCallback(async (ids: string[]): Promise<Product[]> => {
    try {
      // Import products data dynamically
      const productsModule = await import('@/data/products');
      const getAllProducts = productsModule.getAllProducts || (() => productsModule.default || []);
      const allProducts: Product[] = typeof getAllProducts === 'function' ? getAllProducts() : (productsModule.default || []);
      const foundProducts = ids
        .map(id => allProducts.find((p: Product) => p.id === id || p.slug === id))
        .filter((p): p is Product => p !== undefined);
      return foundProducts;
    } catch {
      return [];
    }
  }, []);

  // Get status icon and color
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'text-yellow-600 bg-yellow-50',
          label: t('account.status.pending'),
        };
      case 'shipped':
        return {
          icon: <Truck className="w-4 h-4" />,
          color: 'text-blue-600 bg-blue-50',
          label: t('account.status.shipped'),
        };
      case 'delivered':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-green-600 bg-green-50',
          label: t('account.status.delivered'),
        };
      case 'cancelled':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'text-red-600 bg-red-50',
          label: t('account.status.cancelled'),
        };
    }
  };

  // Get product name by locale
  const getProductName = (product: Product) => {
    if (locale === 'zh') return product.name.zh;
    if (locale === 'ar') return product.name.ar;
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
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('account.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                  {user.name?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* User Info */}
                <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
                <p className="text-gray-500 text-sm mb-2">{user.email}</p>
                <p className="text-xs text-gray-400">
                  {t('account.memberSince')} {new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long' })}
                </p>

                {/* User Type Badge */}
                <div className="mt-4 px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {locale === 'zh' ? '普通用户' : locale === 'ar' ? 'مستخدم عادي' : 'Regular User'}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('account.quickActions')}</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/${locale}/account/edit`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700">{t('account.quickActions.editProfile')}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => router.push(`/${locale}/account/password`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Lock className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700">{t('account.quickActions.changePassword')}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <Link
                  href={`/${locale}/account/orders`}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <ShoppingBag className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700">{t('account.quickActions.myOrders')}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href={`/${locale}/account/favorites`}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700">{t('account.quickActions.myFavorites')}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Contact & Sign Out */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="space-y-3">
                <Link
                  href={`/${locale}/contact`}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                  <Settings className="w-4 h-4" />
                  {locale === 'zh' ? '联系我们' : locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                </Link>
                <button
                  onClick={() => { logout(); router.push(`/${locale}`); }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  {locale === 'zh' ? '退出登录' : locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Orders, Favorites, Recently Viewed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order History */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t('account.orderHistory')}</h3>
                </div>
                {orders.length > 0 && (
                  <Link
                    href={`/${locale}/account/orders`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('account.orderHistory.viewAll')} →
                  </Link>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('account.orderHistory.empty')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/${locale}/account/orders/${order.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{order.id}</p>
                            <p className="text-xs text-gray-500">{order.date} · {order.items} {locale === 'zh' ? '件商品' : locale === 'ar' ? 'عنصر' : 'items'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                          <span className="font-bold text-gray-900 text-sm">¥{order.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Favorites */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t('account.favorites')}</h3>
                </div>
                {favorites.length > 0 && (
                  <Link
                    href={`/${locale}/account/favorites`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t('account.favorites.viewAll')} →
                  </Link>
                )}
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('account.favorites.empty')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {favorites.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/products/${product.slug}`}
                      className="group block"
                    >
                      <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden mb-2">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={getProductName(product)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                            <Package className="w-8 h-8 text-blue-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {getProductName(product)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Viewed */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t('account.recentlyViewed')}</h3>
                </div>
              </div>

              {recentlyViewed.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('account.recentlyViewed.empty')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {recentlyViewed.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/products/${product.slug}`}
                      className="group block"
                    >
                      <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden mb-2">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={getProductName(product)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-teal-100">
                            <Package className="w-8 h-8 text-green-400" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {getProductName(product)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <h3 className="text-lg font-bold text-gray-900 mb-6">{t('account.personalInfo')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{locale === 'zh' ? '邮箱' : locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                  <span className="text-gray-900 font-medium text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{locale === 'zh' ? '姓名' : locale === 'ar' ? 'الاسم' : 'Name'}</span>
                  <span className="text-gray-900 font-medium text-sm">{user.name}</span>
                </div>
                {user.company && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">{locale === 'zh' ? '公司' : locale === 'ar' ? 'الشركة' : 'Company'}</span>
                    <span className="text-gray-900 font-medium text-sm">{user.company}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm">{locale === 'zh' ? '电话' : locale === 'ar' ? 'الهاتف' : 'Phone'}</span>
                    <span className="text-gray-900 font-medium text-sm">{user.phone}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500 text-sm">{t('account.memberSince')}</span>
                  <span className="text-gray-900 font-medium text-sm">
                    {new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
