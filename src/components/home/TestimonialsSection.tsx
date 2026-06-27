'use client';

import { Quote, Star } from 'lucide-react';
import { useLocale } from '@/lib/i18n';


// Helper function to safely get localized text
function getLocalizedText(obj: { zh: string; en: string; ar?: string }, locale: string): string {
  if (locale === 'zh') return obj.zh;
  if (locale === 'ar') return obj.ar || obj.en;
  return obj.en;
}


const testimonials = [
  {
    name: 'Michael Thompson',
    role: { zh: '生产总监', en: 'Production Director' },
    company: 'German Auto Parts GmbH',
    content: {
      zh: '我们生产线上安装了20台智能柜，结果非常出色。AI分析帮助我们预测需求模式，与WMS的物联网集成简化了整个运营。我强烈推荐智能柜给任何物流公司。',
      en: 'We installed 20 Smart Cabinets across our distribution centers, and the results have been outstanding. The AI-powered analytics help us predict demand patterns, and the IoT integration with our WMS has streamlined our entire operation. I highly recommend Smart Cabinet to any logistics company.',
      ar: 'قمنا بتركيب 20 خزانة ذكية في مراكز التوزيع لدينا، وكانت النتائج رائعة. تساعدنا تحليلت الذكية المدعومة بالذكاء الاصطناعي في التنبؤ بأنماط الطلب، وتكامل إنترنت الأشياء مع نظام إدارة المستودعات لدينا قد بسط عمليتنا بأكملها. أوصي بشدة بخزائن الذكية لأي شركة لوجستية.',
    },
    rating: 5,
  },
  {
    name: 'Sarah Chen',
    role: { zh: '首席工程师', en: 'Lead Engineer' },
    company: 'Precision Machining Co.',
    content: {
      zh: '这家精密加工公司通过智能柜实施，将工具搜索时间减少了75%，消除了生产延误。详细的案例研究和可衡量的结果。',
      en: 'A precision machining company reduced tool search time by 75% and eliminated production delays with smart cabinet implementation. A detailed case study with measurable results.',
    },
    rating: 5,
  },
  {
    name: '张伟',
    role: { zh: '车间主任', en: 'Workshop Manager' },
    company: '东莞精工制造',
    content: {
      zh: '以前找一把刀要花10分钟，现在刷一下卡就能取刀，系统自动记录。我们的工具损耗率下降了40%，管理成本大幅降低。',
      en: 'It used to take 10 minutes to find a tool. Now I just swipe a card to get the tool, and the system automatically records it. Our tool loss rate dropped by 40%, and management costs decreased significantly.',
    },
    rating: 5,
  },
];

interface TestimonialsSectionProps {
  locale?: string;
}

export default function TestimonialsSection({ locale: propLocale }: TestimonialsSectionProps) {
  const { locale, t } = useLocale();
  const currentLocale = propLocale || locale;

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            ★ {t('home.testimonials.badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {t('home.testimonials.title')}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t('home.testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-gradient-to-b from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 hover:border-blue-200 relative overflow-hidden"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

              {/* Quote icon */}
              <div className="mb-6 relative z-10">
                <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <Quote className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4 relative z-10">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 leading-relaxed mb-8 relative z-10 italic">
                "{getLocalizedText(testimonial.content, currentLocale)}"
              </p>

              {/* Divider */}
              <div className="w-12 h-1 bg-blue-200 group-hover:w-20 group-hover:bg-blue-600 transition-all duration-500 mb-6 relative z-10" />

              {/* Author */}
              <div className="relative z-10">
                <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-500">
                  {getLocalizedText(testimonial.role, currentLocale)}，{testimonial.company}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
