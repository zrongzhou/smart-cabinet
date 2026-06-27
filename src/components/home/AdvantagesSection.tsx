'use client';

import { Zap, Shield, Radio, Cpu, Clock, Users, Leaf, ArrowRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

// 使用网站主题色，为每个卡片创建不同的透明度效果
const iconBgMap: Record<string, string> = {
  blue: 'rgba(59,130,246,0.12)',
  emerald: 'rgba(59,130,246,0.15)',
  violet: 'rgba(59,130,246,0.18)',
  amber: 'rgba(59,130,246,0.20)',
  cyan: 'rgba(59,130,246,0.22)',
  pink: 'rgba(59,130,246,0.25)',
};

const iconGradientMap: Record<string, string> = {
  blue: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
  emerald: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
  violet: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
  amber: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
  cyan: 'linear-gradient(135deg, var(--primary-dark), var(--primary-color))',
  pink: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
};

const shadowMap: Record<string, string> = {
  blue: '0 8px 25px rgba(0,0,0,0.15)',
  emerald: '0 8px 25px rgba(0,0,0,0.18)',
  violet: '0 8px 25px rgba(0,0,0,0.20)',
  amber: '0 8px 25px rgba(0,0,0,0.15)',
  cyan: '0 8px 25px rgba(0,0,0,0.18)',
  pink: '0 8px 25px rgba(0,0,0,0.20)',
};

function getIconBg(color: string): string {
  return iconBgMap[color] || iconBgMap.blue;
}

function getIconGradient(color: string): string {
  return iconGradientMap[color] || iconGradientMap.blue;
}

function getShadowStyle(color: string): string {
  return shadowMap[color] || shadowMap.blue;
}

const advantages = [
  {
    id: 1,
    icon: Cpu,
    titleKey: 'advantages.item1.title',
    descKey: 'advantages.item1.description',
    color: 'blue',
    bgGradient: 'from-blue-600 to-blue-400',
    shadowColor: 'shadow-blue-500/25',
  },
  {
    id: 2,
    icon: Shield,
    titleKey: 'advantages.item2.title',
    descKey: 'advantages.item2.description',
    color: 'emerald',
    bgGradient: 'from-emerald-600 to-emerald-400',
    shadowColor: 'shadow-emerald-500/25',
  },
  {
    id: 3,
    icon: Radio,
    titleKey: 'advantages.item3.title',
    descKey: 'advantages.item3.description',
    color: 'violet',
    bgGradient: 'from-violet-600 to-violet-400',
    shadowColor: 'shadow-violet-500/25',
  },
  {
    id: 4,
    icon: Zap,
    titleKey: 'advantages.item4.title',
    descKey: 'advantages.item4.description',
    color: 'amber',
    bgGradient: 'from-amber-600 to-amber-400',
    shadowColor: 'shadow-amber-500/25',
  },
  {
    id: 5,
    icon: Clock,
    titleKey: 'advantages.item5.title',
    descKey: 'advantages.item5.description',
    color: 'cyan',
    bgGradient: 'from-cyan-600 to-cyan-400',
    shadowColor: 'shadow-cyan-500/25',
  },
  {
    id: 6,
    icon: Users,
    titleKey: 'advantages.item6.title',
    descKey: 'advantages.item6.description',
    color: 'pink',
    bgGradient: 'from-pink-600 to-pink-400',
    shadowColor: 'shadow-pink-500/25',
  },
];

interface AdvantagesSectionProps {
  locale?: string;
}

export default function AdvantagesSection({ locale: propLocale }: AdvantagesSectionProps) {
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
            ★ {currentLocale === 'zh' ? '核心优势' : 'Core Advantages'}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] mb-4 tracking-tight">
            {t('advantages.title')}
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            {t('advantages.subtitle')}
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((adv, index) => {
            const Icon = adv.icon;
            return (
              <div
                key={adv.id}
                className="group relative bg-[var(--card-bg)] rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[var(--border-color)] hover:-translate-y-3 hover:scale-[1.03]"
              >
                {/* Icon Container with gradient bg - using inline style for production compatibility */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                  style={{ 
                    background: getIconGradient(adv.color),
                    boxShadow: getShadowStyle(adv.color)
                  }}
                >
                  <Icon className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-4 group-hover:text-[var(--primary-color)] transition-colors duration-300">
                  {t(adv.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                  {t(adv.descKey)}
                </p>

                {/* Learn More Link */}
                <div className="flex items-center text-sm font-semibold text-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>{currentLocale === 'zh' ? '了解更多' : 'Learn More'}</span>
                  <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>

                {/* Hover border glow */}
                <div className={`absolute inset-0 rounded-3xl ring-0 group-hover:ring-2 group-hover:ring-[var(--primary-color)]/30 transition-all duration-500 pointer-events-none`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
