'use client';

import { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/lib/i18n';
import { getProductHref } from '@/lib/product-url';

/** Pick a localized product name from the cart item's name field. */
function itemName(name: any, locale: string): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[locale] || name.en || '';
}

/**
 * Slide-in cart drawer: lists items, allows qty change / removal, and links to checkout.
 */
export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, total, count } = useCart();
  const { locale } = useLocale();
  const [locale2] = [locale];
  const [checkingOut, setCheckingOut] = useState(false);

  // V8.3 fix: bug 1 — never leave the cart drawer open across a locale switch.
  // Switching language performs a full navigation; if the drawer were ever left
  // open (or some path opened it) we force-close it so no white overlay (e.g. the
  // empty-cart card with the shopping-bag icon) can appear after choosing Arabic
  // or any other locale.
  useEffect(() => {
    closeCart();
  }, [locale, closeCart]);

  const labels = {
    title: locale === 'zh' ? '购物车' : locale === 'ar' ? 'عربة التسوق' : 'Your Cart',
    empty: locale === 'zh' ? '购物车是空的' : locale === 'ar' ? 'عربة التسوق فارغة' : 'Your cart is empty',
    subtotal: locale === 'zh' ? '小计' : locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal',
    checkout: locale === 'zh' ? '去结算' : locale === 'ar' ? 'الدفع' : 'Checkout',
    remove: locale === 'zh' ? '移除' : locale === 'ar' ? 'إزالة' : 'Remove',
    each: locale === 'zh' ? '每件' : locale === 'ar' ? 'لكل قطعة' : 'each',
    browse: locale === 'zh' ? '去逛逛' : locale === 'ar' ? 'تصفح المنتجات' : 'Browse products',
  };

  const goCheckout = () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    window.location.href = `/${locale2}/checkout`;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 end-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            {labels.title}
            {count > 0 && <span className="text-sm font-normal text-gray-400">({count})</span>}
          </h2>
          <button
            onClick={closeCart}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
              <ShoppingBag className="w-14 h-14 mb-3" />
              <p className="mb-4">{labels.empty}</p>
              <a
                href={`/${locale2}/products`}
                onClick={closeCart}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                {labels.browse}
              </a>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <a
                  href={item.slug ? getProductHref(item.slug, locale2) : '#'}
                  onClick={closeCart}
                  className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100" />
                  )}
                </a>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {itemName(item.name, locale2)}
                  </p>
                  <p className="text-xs text-gray-400">
                    ${item.price.toLocaleString()} {labels.each}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {/* Bug 4 fix: disable at the lower bound so a user cannot drive
                        the quantity below 1; the context clamps regardless. */}
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    {/* Bug 4 fix: disable at the upper bound (999) so a long press
                        cannot inflate the quantity past the clamp. */}
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= 999}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto w-7 h-7 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50"
                      aria-label={labels.remove}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{labels.subtotal}</span>
              <span className="text-lg font-bold text-gray-900">${total.toLocaleString()}</span>
            </div>
            <button
              onClick={goCheckout}
              disabled={checkingOut}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {labels.checkout}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
