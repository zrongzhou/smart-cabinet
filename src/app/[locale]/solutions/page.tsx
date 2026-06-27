'use client';

import { useState, useEffect } from 'react';
import { Cog, Car, Cpu, Cable, Building, Wrench, Factory, Building2, ChevronDown, ChevronUp, TrendingUp, CheckCircle } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import solutions, { Solution } from '@/data/solutions';

const iconMap: Record<string, any> = {
  Cog,
  Car,
  Cpu,
  Cable,
  Building,
  Wrench,
  Factory,
  Building2,
};

// Color theme configurations
const colorThemes = {
  blue: {
    gradient: 'from-blue-500 to-blue-700',
    gradientLight: 'from-blue-100 to-blue-200',
    bg: 'bg-blue-50',
    bgDark: 'bg-blue-900',
    text: 'text-blue-600',
    textDark: 'text-blue-400',
    border: 'border-blue-200',
    hover: 'hover:border-blue-400',
  },
  green: {
    gradient: 'from-green-500 to-green-700',
    gradientLight: 'from-green-100 to-green-200',
    bg: 'bg-green-50',
    bgDark: 'bg-green-900',
    text: 'text-green-600',
    textDark: 'text-green-400',
    border: 'border-green-200',
    hover: 'hover:border-green-400',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-700',
    gradientLight: 'from-purple-100 to-purple-200',
    bg: 'bg-purple-50',
    bgDark: 'bg-purple-900',
    text: 'text-purple-600',
    textDark: 'text-purple-400',
    border: 'border-purple-200',
    hover: 'hover:border-purple-400',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-700',
    gradientLight: 'from-amber-100 to-orange-200',
    bg: 'bg-amber-50',
    bgDark: 'bg-amber-900',
    text: 'text-amber-600',
    textDark: 'text-amber-400',
    border: 'border-amber-200',
    hover: 'hover:border-amber-400',
  },
  cyan: {
    gradient: 'from-cyan-500 to-sky-700',
    gradientLight: 'from-cyan-100 to-sky-200',
    bg: 'bg-cyan-50',
    bgDark: 'bg-cyan-900',
    text: 'text-cyan-600',
    textDark: 'text-cyan-400',
    border: 'border-cyan-200',
    hover: 'hover:border-cyan-400',
  },
  pink: {
    gradient: 'from-pink-500 to-rose-700',
    gradientLight: 'from-pink-100 to-rose-200',
    bg: 'bg-pink-50',
    bgDark: 'bg-pink-900',
    text: 'text-pink-600',
    textDark: 'text-pink-400',
    border: 'border-pink-200',
    hover: 'hover:border-pink-400',
  },
};

interface SolutionsPageProps {
  params: {
    locale: string;
  };
}

export default function SolutionsPage({ params: { locale } }: SolutionsPageProps) {
  const { locale: hookLocale, t } = useLocale();
  const currentLocale = locale || hookLocale;
  const isRTL = currentLocale === 'ar';

  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleSolution = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[var(--section-alt-bg)]">
      {/* Page Header */}
      <section className="theme-solution-header text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {t('solutions.title')}
          </h1>
          <p className="text-xl text-blue-100">
            {t('solutions.subtitle')}
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((solution, index) => {
            const theme = colorThemes[(solution as any).color as keyof typeof colorThemes] || colorThemes.blue;
            const Icon = iconMap[solution.icon] || Cog;
            const isExpanded = expanded === index;

            const title = currentLocale === 'zh' ? solution.title.zh : currentLocale === 'ar' ? solution.title.ar : solution.title.en;
            const description = currentLocale === 'zh' ? solution.description.zh : currentLocale === 'ar' ? solution.description.ar : solution.description.en;
            const painPoints = currentLocale === 'zh' ? solution.painPoints?.zh : currentLocale === 'ar' ? solution.painPoints?.ar : solution.painPoints?.en || [];
            const solutionText = currentLocale === 'zh' ? solution.solution.zh : currentLocale === 'ar' ? solution.solution.ar : solution.solution.en;
            const detailedSolution = currentLocale === 'zh' ? solution.detailedSolution?.zh : currentLocale === 'ar' ? solution.detailedSolution?.ar : solution.detailedSolution?.en || [];
            const benefitsDetailed = currentLocale === 'zh' ? solution.benefitsDetailed?.zh : currentLocale === 'ar' ? solution.benefitsDetailed?.ar : solution.benefitsDetailed?.en || [];
            const caseMetric = solution.caseData?.metric || '';
            const caseDescription = currentLocale === 'zh' ? solution.caseData?.description?.zh : currentLocale === 'ar' ? solution.caseData?.description?.ar : solution.caseData?.description?.en || '';
            const caseDetails = currentLocale === 'zh' ? solution.caseData?.details?.zh : currentLocale === 'ar' ? solution.caseData?.details?.ar : solution.caseData?.details?.en || '';

            return (
              <div
                key={solution.id}
                className={`group relative bg-[var(--card-bg)] rounded-3xl p-8 shadow-lg ${theme.hover} hover:shadow-2xl transition-all duration-500 border border-[var(--border-color)] hover:-translate-y-3 hover:scale-[1.03]`}
              >
                {/* Icon Container with gradient bg */}
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}
                >
                  <Icon className="w-10 h-10 text-white" />
                </div>

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">
                    {description}
                  </p>

                  {/* Pain Points */}
                  {painPoints && painPoints.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                        {currentLocale === 'zh' ? '痛点' : currentLocale === 'ar' ? 'نقاط الألم' : 'Pain Points'}
                      </h4>
                      <ul className="space-y-1">
                        {painPoints.map((point: string, idx: number) => (
                          <li key={idx} className="text-xs text-[var(--text-secondary)] flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Solution Summary */}
                  <div className="mb-4 p-4 bg-[var(--section-alt-bg)] rounded-xl">
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {solutionText}
                    </p>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => toggleSolution(index)}
                    className={`w-full py-2 mb-4 flex items-center justify-center space-x-2 ${theme.text} hover:underline focus:outline-none`}
                  >
                    <span>{isExpanded ? (currentLocale === 'zh' ? '收起详情' : currentLocale === 'ar' ? 'إخفاء التفاصيل' : 'Show Less') : (currentLocale === 'zh' ? '查看详情' : currentLocale === 'ar' ? 'عرض التفاصيل' : 'View Details')}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="space-y-6 mb-4">
                      {/* Detailed Solution */}
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                          {currentLocale === 'zh' ? '解决方案详情' : currentLocale === 'ar' ? 'تفاصيل الحل' : 'Detailed Solution'}
                        </h4>
                        {detailedSolution.map((para: string, idx: number) => (
                          <p key={idx} className="text-sm text-[var(--text-secondary)] mb-2 leading-relaxed">
                            {para}
                          </p>
                        ))}
                      </div>

                      {/* Core Benefits with Metrics */}
                      {benefitsDetailed && benefitsDetailed.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            {currentLocale === 'zh' ? '核心收益' : currentLocale === 'ar' ? 'الفوائد الرئيسية' : 'Core Benefits'}
                          </h4>
                          <div className="space-y-3">
                            {benefitsDetailed.map((benefit: { metric: string; description: string }, idx: number) => (
                              <div key={idx} className={`flex items-center space-x-3 ${theme.bg} rounded-lg p-3`}>
                                <div className={`text-2xl font-bold ${theme.text}`}>
                                  {benefit.metric}
                                </div>
                                <div className="text-sm text-[var(--text-secondary)]">
                                  {benefit.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Case Data */}
                      <div className={`${theme.bg} rounded-xl p-4`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className={`w-5 h-5 ${theme.text}`} />
                          <span className={`text-lg font-bold ${theme.text}`}>{caseMetric}</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-2">
                          {caseDescription}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                          {caseDetails}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
