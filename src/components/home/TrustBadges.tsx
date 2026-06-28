'use client';

import { useLocale } from '@/lib/i18n';

const trustBadges = [
  { emoji: '🏆', titleKey: 'trustBadges.iso',         description: 'ISO Certified', bg: 'bg-blue-600' },
  { emoji: '🛡️', titleKey: 'trustBadges.patents',     description: 'Patents & Copyrights', bg: 'bg-emerald-600' },
  { emoji: '🌍', titleKey: 'trustBadges.export',      description: '60+ Countries Exported', bg: 'bg-violet-600' },
  { emoji: '🏭', titleKey: 'trustBadges.experience',  description: 'Since 2015', bg: 'bg-amber-500' },
  { emoji: '🤝', titleKey: 'trustBadges.clients',     description: 'Trusted Clients', bg: 'bg-cyan-600' },
];

interface TrustBadgesProps {
  locale?: string;
}

export default function TrustBadges({ locale: propLocale }: TrustBadgesProps) {
  const { locale, t } = useLocale();
  const currentLocale = propLocale || locale;

  return (
    <section className="py-20 px-6 bg-white relative overflow-hidden">
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('home.trustBadges.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('home.trustBadges.subtitle')}
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 text-center border-2 border-gray-100 hover:border-blue-500 hover:-translate-y-1"
            >
              {/* Emoji Icon Container - Large with colored background */}
              <div className={`w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center text-4xl shadow-lg ${badge.bg} group-hover:scale-110 transition-all duration-300`}>
                <span>{badge.emoji}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{t(badge.titleKey)}</h3>
              <p className="text-sm text-gray-600">{badge.description}</p>
            </div>
          ))}
        </div>

        {/* Company Stats */}
        <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
          <p className="text-center text-gray-500 text-sm font-semibold uppercase tracking-wider mb-8">
            Guangzhou Qiuyan Technology Co., Ltd. - Established 2015
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10+',  labelKey: 'home.trustBadges.stats.models' },
              { number: '60+',  labelKey: 'home.trustBadges.stats.countries' },
              { number: '500+', labelKey: 'home.trustBadges.stats.clients' },
              { number: '10+',  labelKey: 'home.trustBadges.stats.experience' },
            ].map((stat, idx) => (
              <div key={idx} className="group hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{t(stat.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
