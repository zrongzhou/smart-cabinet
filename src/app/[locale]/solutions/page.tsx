'use client';

import { useState, useEffect } from 'react';
import { Cog, Car, Cpu, Cable, Building, Wrench, Factory, Building2, ChevronDown, ChevronUp, TrendingUp, CheckCircle } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import solutions, { Solution } from '@/data/solutions';

// Fixed colors - no CSS variables
const solutionCardStyle = {
  iconBg: '#dbeafe', // blue-100
  accentColor: '#3b82f6', // blue-500
  accentBg: '#f0f9ff', // blue-50
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
    <div className="min-h-screen bg-blue-50">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
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
                className="group relative solution-card bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100 hover:-translate-y-3 hover:scale-[1.03]"
              >
                {/* Icon Container with gradient bg */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg"
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  <Icon className="w-10 h-10 text-white" />
                </div>

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {description}
                  </p>

                  {/* Pain Points */}
                  {painPoints && painPoints.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        {currentLocale === 'zh' ? '痛点' : currentLocale === 'ar' ? 'نقاط الألم' : 'Pain Points'}
                      </h4>
                      <ul className="space-y-1">
                        {painPoints.map((point: string, idx: number) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Solution Summary */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {solutionText}
                    </p>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => toggleSolution(index)}
                    className="w-full py-2 mb-4 flex items-center justify-center space-x-2 hover:underline focus:outline-none"
                    style={{ color: '#3b82f6' }}
                  >
                    <span>{isExpanded ? (currentLocale === 'zh' ? '收起详情' : currentLocale === 'ar' ? 'إخفاء التفاصيل' : 'Show Less') : (currentLocale === 'zh' ? '查看详情' : currentLocale === 'ar' ? 'عرض التفاصيل' : 'View Details')}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="space-y-6 mb-4">
                      {/* Detailed Solution */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          {currentLocale === 'zh' ? '解决方案详情' : currentLocale === 'ar' ? 'تفاصيل الحل' : 'Detailed Solution'}
                        </h4>
                        {detailedSolution.map((para: string, idx: number) => (
                          <p key={idx} className="text-sm text-gray-600 mb-2 leading-relaxed">
                            {para}
                          </p>
                        ))}
                      </div>

                      {/* Core Benefits with Metrics */}
                      {benefitsDetailed && benefitsDetailed.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            {currentLocale === 'zh' ? '核心收益' : currentLocale === 'ar' ? 'الفوائد الرئيسية' : 'Core Benefits'}
                          </h4>
                          <div className="space-y-3">
                            {benefitsDetailed.map((benefit: { metric: string; description: string }, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center space-x-3 rounded-lg p-3"
                                style={{ backgroundColor: '#f0f9ff' }}
                              >
                                <div
                                  className="text-2xl font-bold"
                                  style={{ color: '#3b82f6' }}
                                >
                                  {benefit.metric}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {benefit.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Case Data */}
                      <div
                        className="rounded-xl p-4"
                        style={{ backgroundColor: '#f0f9ff' }}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp
                            className="w-5 h-5"
                            style={{ color: '#3b82f6' }}
                          />
                          <span
                            className="text-lg font-bold"
                            style={{ color: '#3b82f6' }}
                          >{caseMetric}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {caseDescription}
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed">
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

// Icon map at the top of file
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
