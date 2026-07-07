'use client';

/**
 * NotFoundView
 * ------------
 * Trilingual, full-page "404" used by both `app/not-found.tsx` (root) and
 * `app/[locale]/not-found.tsx` (locale segment). It intentionally renders as a
 * real page (NOT a modal/overlay) and offers a clear way back home, replacing
 * the default Next.js 404 that the browser would otherwise machine-translate
 * (e.g. the unclosable Arabic overlay seen under `/ar`).
 *
 * Locale is detected from `<html lang>`, which the `[locale]` layout sets. This
 * avoids a hydration mismatch: the server renders the `en` copy, the client
 * corrects it after mount.
 */

import { useEffect, useState } from 'react';
import { Home, ArrowLeft, SearchX } from 'lucide-react';

type Locale = 'en' | 'zh' | 'ar';

interface Copy {
  code: string;
  title: string;
  message: string;
  home: string;
  back: string;
}

const COPY: Record<Locale, Copy> = {
  en: {
    code: '404',
    title: 'Page Not Found',
    message: "Sorry, the page you are looking for doesn't exist or has been moved.",
    home: 'Back to Home',
    back: 'Go Back',
  },
  zh: {
    code: '404',
    title: '页面未找到',
    message: '抱歉，您访问的页面不存在或已被移动。',
    home: '返回首页',
    back: '返回上页',
  },
  ar: {
    code: '404',
    title: 'لم يتم العثور على الصفحة',
    message: 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
    home: 'العودة إلى الرئيسية',
    back: 'الرجوع للخلف',
  },
};

function resolveLocale(): Locale {
  if (typeof document === 'undefined') return 'en';
  const lang = document.documentElement.lang;
  if (lang === 'zh' || lang === 'ar') return lang;
  return 'en';
}

export default function NotFoundView() {
  const [locale, setLocale] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocale(resolveLocale());
    setMounted(true);
  }, []);

  // Before mount we render the `en` copy to avoid a hydration mismatch.
  const copy = COPY[locale];
  const isRtl = locale === 'ar';
  const homeHref =
    mounted && (locale === 'zh' || locale === 'ar') ? `/${locale}` : '/';

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-16"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-200/60">
          <SearchX className="h-12 w-12 text-white" strokeWidth={1.8} />
        </div>

        <p className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-7xl font-black tracking-tight text-transparent">
          {copy.code}
        </p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">{copy.message}</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={homeHref}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200/50 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            {copy.home}
          </a>
          <button
            type="button"
            onClick={() => (typeof window !== 'undefined' ? window.history.back() : undefined)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </button>
        </div>
      </div>
    </div>
  );
}
