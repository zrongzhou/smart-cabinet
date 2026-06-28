'use client';

import { useLocale } from '@/lib/i18n';

const advantages = [
  { id: 1, icon: '🤖', titleKey: 'advantages.item1.title', descKey: 'advantages.item1.description', bg: 'bg-blue-600', hoverBg: 'group-hover:bg-blue-700' },
  { id: 2, icon: '🛡️', titleKey: 'advantages.item2.title', descKey: 'advantages.item2.description', bg: 'bg-emerald-600', hoverBg: 'group-hover:bg-emerald-700' },
  { id: 3, icon: '📡', titleKey: 'advantages.item3.title', descKey: 'advantages.item3.description', bg: 'bg-violet-600', hoverBg: 'group-hover:bg-violet-700' },
  { id: 4, icon: '⚡', titleKey: 'advantages.item4.title', descKey: 'advantages.item4.description', bg: 'bg-amber-500', hoverBg: 'group-hover:bg-amber-600' },
  { id: 5, icon: '🕐', titleKey: 'advantages.item5.title', descKey: 'advantages.item5.description', bg: 'bg-cyan-600', hoverBg: 'group-hover:bg-cyan-700' },
  { id: 6, icon: '👥', titleKey: 'advantages.item6.title', descKey: 'advantages.item6.description', bg: 'bg-rose-600', hoverBg: 'group-hover:bg-rose-700' },
];

export default function AdvantagesSection() {
  const { locale, t } = useLocale();

  return (
    <section className="py-20 px-6 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-blue-50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-72 h-72 bg-blue-50 rounded-full blur-3xl" />
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-5 py-1.5 bg-blue-600 text-white rounded-full text-sm font-bold mb-5 shadow-lg">
            ★ {locale === 'zh' ? '核心优势' : 'Core Advantages'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
            {t('advantages.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('advantages.subtitle')}
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((adv, index) => {
            return (
              <div
                key={adv.id}
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
              >
                {/* Icon Container - Large and substantial with gradient background */}
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 text-3xl shadow-lg ${adv.bg} ${adv.hoverBg} transition-all duration-300 group-hover:scale-110`}
                >
                  <span>{adv.icon}</span>
                </div>

                {/* Numbered badge */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm flex items-center justify-center">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {t(adv.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {t(adv.descKey)}
                </p>

                {/* Learn More link */}
                <div className="flex items-center text-base font-semibold text-blue-600 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 mt-6">
                  <span>{locale === 'zh' ? '了解更多' : 'Learn More'}</span>
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
