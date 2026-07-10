/**
 * LandingPage.tsx
 * Shared SERVER component that renders the 23 new landing pages
 * (managed-items / industries / standalone) with fully server-rendered HTML:
 *   - H1 + intro copy present in the SSR response (no client fetch)
 *   - WebPage JSON-LD for structured data
 *   - meta title/description are provided by each route's generateMetadata
 *
 * Content is English-only (per the client's meta plan); for zh/ar the component
 * falls back to the English value.
 */
import {
  Boxes,
  ShieldCheck,
  Truck,
  Package,
  Cog,
  FileText,
  Users,
  Recycle,
  Printer,
  Utensils,
  FlaskConical,
  Disc3,
  Cpu,
  Factory,
  Building2,
  Wrench,
} from 'lucide-react';
import { jsonLdWebPage } from '@/lib/seo';
import { normalizeLocale, pickTrilingual } from '@/lib/seo-page-meta';
import type { LandingContent } from '@/lib/landing-content';
import type { AppLocale } from '@/lib/seo-page-meta';

const BENEFIT_ICONS = [
  Boxes,
  ShieldCheck,
  Truck,
  Package,
  Cog,
  FileText,
  Users,
  Recycle,
  Printer,
  Utensils,
  FlaskConical,
  Disc3,
  Cpu,
  Factory,
  Building2,
  Wrench,
];

interface LandingPageProps {
  locale: string;
  content: LandingContent;
  /** Public path without locale, e.g. "managed-items/cnc-tool-management". */
  basePath: string;
}

export default function LandingPage({ locale, content, basePath }: LandingPageProps) {
  const loc = normalizeLocale(locale) as AppLocale;
  const name = pickTrilingual(content.name, loc) || content.name.en;
  const description = content.intro[0] || content.metaTitle;
  const publicPath = `/${loc}/${basePath}`;

  const webPageJsonLd = jsonLdWebPage({
    name,
    description: description || content.metaTitle,
    path: publicPath,
  });

  const heroSubtitle =
    loc === 'zh'
      ? '为现代工厂打造的智能存储方案'
      : loc === 'ar'
        ? 'حلول تخزين ذكية للمصانع الحديثة'
        : 'Engineered smart storage solutions for modern factories';

  return (
    <>
      {/* WebPage structured data (server-rendered) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <main className="min-h-screen bg-white dark:bg-slate-900">
        {/* ===== Hero ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_55%)]" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <nav className="text-sm text-blue-200/80 mb-6" aria-label="Breadcrumb">
              <a href={`/${loc}`} className="hover:text-white">Home</a>
              <span className="mx-2">/</span>
              <span className="text-white">{name}</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">{name}</h1>
            <p className="text-lg text-blue-100/90 max-w-2xl mx-auto">{heroSubtitle}</p>
          </div>
        </section>

        {/* ===== Intro ===== */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {content.intro.map((para, idx) => (
            <p
              key={idx}
              className={`text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg ${idx > 0 ? 'mt-5' : ''}`}
            >
              {para}
            </p>
          ))}
        </section>

        {/* ===== Benefits ===== */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
            {loc === 'zh' ? '核心优势' : loc === 'ar' ? 'المزايا الرئيسية' : 'Key Benefits'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.benefits.map((benefit, idx) => {
              const Icon = BENEFIT_ICONS[idx % BENEFIT_ICONS.length];
              return (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {benefit.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-blue-50 dark:bg-slate-800/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {loc === 'zh' ? '需要量身定制的方案？' : loc === 'ar' ? 'هل تحتاج حلاً مخصصاً؟' : 'Need a tailored solution?'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {loc === 'zh'
                ? '浏览全部产品，或直接联系我们的工程团队获取报价。'
                : loc === 'ar'
                  ? 'تصفح جميع المنتجات أو تواصل مع فريق الهندسة لدينا للحصول على عرض سعر.'
                  : 'Browse all products, or contact our engineering team for a quote.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/${loc}/products`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                {loc === 'zh' ? '浏览产品' : loc === 'ar' ? 'تصفح المنتجات' : 'Explore Products'}
              </a>
              <a
                href={`/${loc}/contact`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-blue-600 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-600/10 transition-colors"
              >
                {loc === 'zh' ? '联系我们' : loc === 'ar' ? 'اتصل بنا' : 'Contact Us'}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
