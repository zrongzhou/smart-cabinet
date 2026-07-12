'use client';

/**
 * BackButton — a small, RTL-safe "back" control for the xiaozhouBackend
 * admin console.
 *
 * Renders an arrow + localized label and navigates to `href` (defaults to
 * the backend settings hub). The arrow direction flips in RTL locales so the
 * glyph always points toward the "previous" side.
 */

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { adminT } from '@/lib/admin-i18n';

interface BackButtonProps {
  /** Destination route. Defaults to the backend settings hub. */
  href?: string;
  /** Extra class names for layout (e.g. margin). */
  className?: string;
}

export default function BackButton({ href = '/xiaozhouBackend/settings', className = '' }: BackButtonProps) {
  const router = useRouter();
  // RTL-safe: in right-to-left locales the "back" affordance points right.
  const isRtl =
    typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const Arrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={`group inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 ${className}`}
      aria-label={adminT('common.back')}
    >
      <Arrow className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
      <span>{adminT('common.back')}</span>
    </button>
  );
}
