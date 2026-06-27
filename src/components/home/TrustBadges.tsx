'use client';

import { Award, Shield, CheckCircle, Factory, Users, ArrowRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

const trustBadges = [
  { icon: Award, titleKey: 'trustBadges.iso', description: 'ISO Certified', color: 'blue' },
  { icon: Shield, titleKey: 'trustBadges.patents', description: 'Patents & Copyrights', color: 'emerald' },
  { icon: CheckCircle, titleKey: 'trustBadges.export', description: '60+ Countries Exported', color: 'violet' },
  { icon: Factory, titleKey: 'trustBadges.experience', description: 'Since 2015', color: 'cyan' },
  { icon: Users, titleKey: 'trustBadges.clients', description: 'Trusted Clients', color: 'amber' },
];

const colorMap: Record<string, { bg: string; text: string; border: string; hoverBg: string }> = {
  blue: { bg: 'bg-[var(--icon-bg)]', text: 'text-[var(--primary-color)]', border: 'border-[var(--border-color)]', hoverBg: 'group-hover:bg-[var(--primary-color)]' },
  emerald: { bg: 'bg-[var(--icon-bg)]', text: 'text-[var(--primary-color)]', border: 'border-[var(--border-color)]', hoverBg: 'group-hover:bg-[var(--primary-color)]' },
  violet: { bg: 'bg-[var(--icon-bg)]', text: 'text-[var(--primary-color)]', border: 'border-[var(--border-color)]', hoverBg: 'group-hover:bg-[var(--primary-color)]' },
  cyan: { bg: 'bg-[var(--icon-bg)]', text: 'text-[var(--primary-color)]', border: 'border-[var(--border-color)]', hoverBg: 'group-hover:bg-[var(--primary-color)]' },
  amber: { bg: 'bg-[var(--icon-bg)]', text: 'text-[var(--primary-color)]', border: 'border-[var(--border-color)]', hoverBg: 'group-hover:bg-[var(--primary-color)]' },
};

interface TrustBadgesProps {
  locale?: string;
}

export default function TrustBadges({ locale: propLocale }: TrustBadgesProps) {
  const { locale, t } = useLocale();
  const currentLocale = propLocale || locale;

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt-bg)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary-color)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary-color)]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1 bg-[var(--badge-bg)] text-[var(--primary-color)] rounded-full text-sm font-semibold mb-4">
            ★ {t('home.trustBadges.badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] mb-4 tracking-tight">
            {t('home.trustBadges.title')}
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            {t('home.trustBadges.subtitle')}
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20">
          {trustBadges.map((badge, index) => {
            const Icon = badge.icon;
            const colors = colorMap[badge.color] || colorMap.blue;
            return (
              <div
                key={index}
                className="group bg-[var(--card-bg)] rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 text-center border border-[var(--border-color)] hover:border-transparent hover:-translate-y-3 hover:scale-[1.02] relative overflow-hidden"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-[var(--primary-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                {/* Icon Container */}
                <div
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${colors.bg} ${colors.hoverBg} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg`}
                >
                  <Icon className={`w-10 h-10 ${colors.text} group-hover:text-white transition-colors duration-500`} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-extrabold text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary-color)] transition-colors duration-300">{t(badge.titleKey)}</h3>
                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)]">{badge.description}</p>

                {/* Hover border glow */}
                <div className="absolute inset-0 rounded-3xl ring-0 group-hover:ring-2 group-hover:ring-[var(--primary-color)]/30 transition-all duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Company Stats */}
        <div className="bg-[var(--card-bg)] rounded-3xl p-12 shadow-lg relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <p className="text-center text-[var(--text-muted)] text-sm font-semibold uppercase tracking-widest mb-12 relative z-10">
            Guangzhou Qiuyan Technology Co., Ltd. - Established 2015
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            {[
              { number: '10+', label: t('home.trustBadges.stats.models'), icon: '📦' },
              { number: '60+', label: t('home.trustBadges.stats.countries'), icon: '🌍' },
              { number: '500+', label: t('home.trustBadges.stats.clients'), icon: '🤝' },
              { number: '10+', label: t('home.trustBadges.stats.experience'), icon: '⏳' },
            ].map((stat, idx) => (
              <div key={idx} className="group hover:-translate-y-2 transition-transform duration-300">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-extrabold text-[var(--primary-color)] mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                <div className="text-sm text-[var(--text-secondary)] font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
