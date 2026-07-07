'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

/**
 * Navbar cart badge button. Shows the live item count and opens the drawer.
 */
export default function CartButton({ locale = 'en' }: { locale?: string }) {
  const { count, openCart } = useCart();
  const label = locale === 'zh' ? '购物车' : locale === 'ar' ? 'عربة التسوق' : 'Cart';

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={label}
      className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
