'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/i18n';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: any;
  product?: {
    id: string;
    slug: string;
    name: any;
    images: string[];
  };
}

interface Order {
  id: string;
  userId: string;
  status: string;
  total: number;
  shippingAddress?: any;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface OrdersListProps {
  locale: string;
  orders: Order[];
}

const STATUS_COLORS: { [key: string]: string } = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: { [key: string]: { [locale: string]: string } } = {
  pending: { en: 'Pending', zh: '待处理', ar: 'معلق' },
  processing: { en: 'Processing', zh: '处理中', ar: 'قيد المعالجة' },
  shipped: { en: 'Shipped', zh: '已发货', ar: 'تم الشحن' },
  delivered: { en: 'Delivered', zh: '已送达', ar: 'تم التوصيل' },
  cancelled: { en: 'Cancelled', zh: '已取消', ar: 'ملغى' },
};

export default function OrdersList({ locale, orders }: OrdersListProps) {
  const { t } = useLocale();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {locale === 'zh' ? '暂无订单' : locale === 'ar' ? 'لا توجد طلبات' : 'No orders yet'}
        </h3>
        <p className="text-gray-500">
          {locale === 'zh' ? '开始购物并创建您的第一个订单' : locale === 'ar' ? 'ابدأ التسوق وأنشئ طلبك الأول' : 'Start shopping and create your first order'}
        </p>
        <a
          href={`/${locale}/products`}
          className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {locale === 'zh' ? '浏览产品' : locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const statusLabel = STATUS_LABELS[order.status]?.[locale] || order.status;
        const statusColor = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800';

        return (
          <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Order Header */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(order.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {locale === 'zh' ? '订单号' : locale === 'ar' ? 'رقم الطلب' : 'Order #'}
                    </p>
                    <p className="font-medium text-gray-900">{order.id.slice(-8).toUpperCase()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      {locale === 'zh' ? '日期' : locale === 'ar' ? 'التاريخ' : 'Date'}
                    </p>
                    <p className="text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString(
                        locale === 'zh' ? 'zh-CN' : locale === 'ar' ? 'ar-SA' : 'en-US'
                      )}
                    </p>
                  </div>

                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {locale === 'zh' ? '总金额' : locale === 'ar' ? 'المجموع' : 'Total'}
                    </p>
                    <p className="text-lg font-bold text-blue-600">${order.total.toFixed(2)}</p>
                  </div>

                  <div className="text-gray-400">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            {isExpanded && (
              <div className="border-t border-gray-200 p-4">
                <div className="space-y-4">
                  {order.items.map((item) => {
                    const itemName = item.name?.[locale] || item.name?.en || 'Product';
                    const productSlug = item.product?.slug || '';
                    const productHref = productSlug ? `/${locale}/products/${productSlug}` : '#';

                    return (
                      <div key={item.id} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-0">
                        {item.product?.images?.[0] && (
                          <Link href={productHref} className="flex-shrink-0">
                            <img
                              src={item.product.images[0]}
                              alt={itemName}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          </Link>
                        )}
                        <div className="flex-1">
                          <Link href={productHref} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                            {itemName}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {locale === 'zh' ? '数量' : locale === 'ar' ? 'الكمية' : 'Qty'}: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      {locale === 'zh' ? '收货地址' : locale === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
                    </h4>
                    <div className="text-sm text-gray-600">
                      <p>{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.country} {order.shippingAddress.zipCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
