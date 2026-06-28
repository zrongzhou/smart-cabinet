'use client';

import { Zap, Shield, Radio, Cpu, Clock, Users, Leaf, ArrowRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

const gradientMap: Record<string, string> = {
  blue: 'linear-gradient(135deg, #2563eb, #60a5fa)',
  emerald: 'linear-gradient(135deg, #059669, #34d399)',
  violet: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  amber: 'linear-gradient(135deg, #d97706, #fbbf24)',
  cyan: 'linear-gradient(135deg, #0891b2, #22d3ee)',
  pink: 'linear-gradient(135deg, #db2777, #f472b6)',
};

const shadowMap: Record<string, string> = {
  blue: '0 8px 25px rgba(37,99,235,0.25)',
  emerald: '0 8px 25px rgba(5,150,105,0.25)',
  violet: '0 8px 25px rgba(124,58,237,0.25)',
  amber: '0 8px 25px rgba(217,119,6,0.25)',
  cyan: '0 8px 25px rgba(8,145,178,0.25)',
  pink: '0 8px 25px rgba(219,39,119,0.25)',
};

const advantages = [
  { id: 1, icon: Cpu, titleKey: 'advantages.item1.title', descKey: 'advantages.item1.description', color: 'blue' },
  { id: 2, icon: Shield, titleKey: 'advantages.item2.title', descKey: 'advantages.item2.description', color: 'emerald' },
  { id: 3, icon: Radio, titleKey: 'advantages.item3.title', descKey: 'advantages.item3.description', color: 'violet' },
  { id: 4, icon: Zap, titleKey: 'advantages.item4.title', descKey: 'advantages.item4.description', color: 'amber' },
  { id: 5, icon: Clock, titleKey: 'advantages.item5.title', descKey: 'advantages.item5.description', color: 'cyan' },
  { id: 6, icon: Users, titleKey: 'advantages.item6.title', descKey: 'advantages.item6.description', color: 'pink' },
];

export default function AdvantagesSection() {
  const { locale, t } = useLocale();

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            ★ {locale === 'zh' ? '核心优势' : 'Core Advantages'}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {t('advantages.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-3 hover:scale-[1.03]"
              >
                {/* Icon Container */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                  style={{ 
                    background: gradientMap[adv.color],
                    boxShadow: shadowMap[adv.color]
                  }}
                >
                  <Icon className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-extrabold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {t(adv.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {t(adv.descKey)}
                </p>

                {/* Learn More Link */}
                <div className="flex items-center text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>{locale === 'zh' ? '了解更多' : 'Learn More'}</span>
                  <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>

                {/* Hover border glow */}
                <div className="absolute inset-0 rounded-3xl ring-0 group-hover:ring-2 group-hover:ring-blue-500/30 transition-all duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
