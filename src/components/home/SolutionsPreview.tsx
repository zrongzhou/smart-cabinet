'use client';

import { Factory, Shield, Car, Zap, Coffee, FlaskConical, Building, Settings } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import solutions from '@/data/solutions';

const iconMap: Record<string, any> = {
  Factory,
  Shield,
  Car,
  Zap,
  Coffee,
  FlaskConical,
  Building,
  Settings,
};

interface SolutionsPreviewProps {
  locale?: string;
}

export default function SolutionsPreview({ locale: propLocale }: SolutionsPreviewProps) {
  const { locale, t } = useLocale();
  const currentLocale = propLocale || locale;

  const solutionKeys = [
    'industrialManufacturing',
    'aerospaceDefense',
    'automotive',
    'energyPower',
    'foodProduction',
    'dailyChemicals',
    'officeManagement',
    'precisionMachining',
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt-bg)]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            {t('solutions.title')}
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t('solutions.subtitle')}
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {solutions.slice(0, 8).map((solution, index) => {
            const IconName = ['Factory', 'Shield', 'Car', 'Zap', 'Coffee', 'FlaskConical', 'Building', 'Settings'][index];
            const Icon = iconMap[IconName] || Factory;

            return (
              <a
                key={solution.slug}
                href={`/${currentLocale}/solutions#${solution.slug}`}
                className="group relative bg-[var(--card-bg)] rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-center hover:-translate-y-2 border border-[var(--border-color)]"
              >
                {/* Icon Container */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center group-hover:bg-[var(--primary-color)] transition-colors duration-300" style={{ backgroundColor: 'var(--icon-bg)' }}>
                  <Icon className="w-8 h-8 text-[var(--primary-color)] group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                  {currentLocale === 'zh' ? solution.title.zh : currentLocale === 'ar' ? solution.title.ar : solution.title.en}
                </h3>

                {/* Hover Effect - View Details */}
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--primary-color)]/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white font-medium">{t('solutions.viewAll')} →</span>
                </div>
              </a>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href={`/${currentLocale}/solutions`}
            className="btn-gradient-primary inline-flex items-center px-8 py-3 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            {t('solutions.viewAll')}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
