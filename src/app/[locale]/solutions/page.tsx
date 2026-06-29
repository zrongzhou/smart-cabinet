'use client';

import { useState, useEffect } from 'react';
import { Cog, Car, Cpu, Cable, Building, Wrench, Factory, Building2, ChevronDown, ChevronUp, TrendingUp, CheckCircle } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import solutions, { Solution } from '@/data/solutions';
import OceanHeader from '@/components/OceanHeader';

// Fixed colors - no CSS variables
const solutionCardStyle = {
  iconBg: '#dbeafe', // blue-100
  accentColor: '#3b82f6', // blue-500
  accentBg: '#f0f9ff', // blue-50
};

// Card theme colors for visual variety
const cardThemes = [
  { iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)', accent: '#3b82f6', lightBg: '#eff6ff', border: '#bfdbfe', gradFrom: 'from-blue-50', shadowColor: 'rgba(59,130,246,0.15)', iconColor: '#3b82f6' },     // Blue - CNC
  { iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', accent: '#8b5cf6', lightBg: '#f5f3ff', border: '#ddd6fe', gradFrom: 'from-violet-50', shadowColor: 'rgba(139,92,246,0.15)', iconColor: '#8b5cf6' },   // Purple - Automotive
  { iconBg: 'linear-gradient(135deg, #06b6d4, #0891b2)', accent: '#06b6d4', lightBg: '#ecfeff', border: '#a5f3fc', gradFrom: 'from-cyan-50', shadowColor: 'rgba(6,182,212,0.15)', iconColor: '#06b6d4' },      // Cyan - Electronics
  { iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)', accent: '#f59e0b', lightBg: '#fffbeb', border: '#fde68a', gradFrom: 'from-amber-50', shadowColor: 'rgba(245,158,11,0.15)', iconColor: '#f59e0b' },     // Amber - Wire & Cable
  { iconBg: 'linear-gradient(135deg, #10b981, #059669)', accent: '#10b981', lightBg: '#ecfdf5', border: '#a7f3d0', gradFrom: 'from-emerald-50', shadowColor: 'rgba(16,185,129,0.15)', iconColor: '#10b981' },   // Green - General
  { iconBg: 'linear-gradient(135deg, #ef4444, #dc2626)', accent: '#ef4444', lightBg: '#fef2f2', border: '#fecaca', gradFrom: 'from-red-50', shadowColor: 'rgba(239,68,68,0.15)', iconColor: '#ef4444' },       // Red - Factory
];

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
      {/* Page Header — Ocean Theme */}
      <OceanHeader
        title={t('solutions.title')}
        subtitle={t('solutions.subtitle')}
        icon={<Cog className="w-8 h-8 text-blue-300" />}
      />

      {/* Solutions Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .solution-card {
            animation: fadeInUp 0.6s ease-out forwards;
            opacity: 0;
          }
        `}} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((solution, index) => {
            const Icon = iconMap[solution.icon] || Cog;
            const isExpanded = expanded === index;
            const theme = cardThemes[index % cardThemes.length];

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
                className="group relative solution-card rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border hover:-translate-y-3 hover:scale-[1.03] overflow-hidden"
                style={{ 
                  background: theme.lightBg, 
                  borderColor: theme.border,
                  animationDelay: `${index * 100}ms`,
                  boxShadow: `0 4px 20px ${theme.shadowColor}`,
                }}
              >
                {/* Top color decoration bar */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[4px] rounded-t-3xl"
                  style={{ background: theme.iconBg }}
                />
                
                {/* Icon Container with gradient bg */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg relative"
                  style={{ background: theme.iconBg }}
                >
                  {/* Glow effect around icon */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `0 0 30px ${theme.shadowColor}, 0 0 60px ${theme.shadowColor}` }}
                  />
                  <Icon className="w-10 h-10 text-white relative z-10" />
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
                            <span className="w-2 h-2 rounded-full mr-2 mt-1 flex-shrink-0" style={{ backgroundColor: theme.accent }}></span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Solution Summary */}
                  <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: theme.lightBg }}>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {solutionText}
                    </p>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => toggleSolution(index)}
                    className="w-full py-2 mb-4 flex items-center justify-center space-x-2 hover:underline focus:outline-none group/btn"
                    style={{ color: theme.accent }}
                  >
                    <span>{isExpanded ? (currentLocale === 'zh' ? '收起详情' : currentLocale === 'ar' ? 'إخفاء التفاصيل' : 'Show Less') : (currentLocale === 'zh' ? '查看详情' : currentLocale === 'ar' ? 'عرض التفاصيل' : 'View Details')}</span>
                    <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
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
                                style={{ backgroundColor: theme.lightBg }}
                              >
                                <div
                                  className="text-2xl font-bold"
                                  style={{ color: theme.accent }}
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
                        style={{ backgroundColor: theme.lightBg }}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp
                            className="w-5 h-5"
                            style={{ color: theme.accent }}
                          />
                          <span
                            className="text-lg font-bold"
                            style={{ color: theme.accent }}
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
