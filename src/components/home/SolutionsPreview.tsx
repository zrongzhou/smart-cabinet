'use client';

import { useLocale } from '@/lib/i18n';

const solutions = [
  { nameKey: 'solutions.items.cabinet-type',    emoji: '🗄', bg: 'bg-blue-600' },
  { nameKey: 'solutions.items.managed-items',   emoji: '📦', bg: 'bg-emerald-600' },
  { nameKey: 'solutions.items.industry',        emoji: '🏭', bg: 'bg-violet-600' },
  { nameKey: 'solutions.items.custom-solution', emoji: '⚙️', bg: 'bg-amber-500' },
  { nameKey: 'solutions.items.robots',          emoji: '🤖', bg: 'bg-cyan-600' },
  { nameKey: 'solutions.items.laboratory',      emoji: '🧪', bg: 'bg-rose-600' },
  { nameKey: 'solutions.items.cleanroom',       emoji: '💨', bg: 'bg-teal-600' },
  { nameKey: 'solutions.items.other',           emoji: '🔧', bg: 'bg-gray-600' },
];

interface SolutionsPreviewProps {
  locale?: string;
}

export default function SolutionsPreview({ locale: propLocale }: SolutionsPreviewProps) {
  const { locale, t } = useLocale();
  const currentLocale = propLocale || locale;

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
      {/* Decorative glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")` }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm font-semibold mb-4">
            ★ {t('home.solutions.badge') || 'Solutions'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('home.solutions.title')}
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('home.solutions.subtitle')}
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => (
            <a
              key={index}
              href={`/${currentLocale}/products?type=${solution.nameKey.split('.').pop()}`}
              className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 hover:bg-white/20 hover:-translate-y-2 overflow-hidden"
            >
              {/* Emoji Icon Container - Large with colored background */}
              <div className={`w-16 h-16 mb-5 rounded-xl flex items-center justify-center text-3xl shadow-lg ${solution.bg} group-hover:scale-110 transition-all duration-300`}>
                {solution.emoji}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                {t(solution.nameKey)}
              </h3>

              {/* Hover arrow */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
