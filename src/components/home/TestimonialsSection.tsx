'use client';

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
      ar: 'قمنا بتركيب 20 خزانة ذكية في مراكز التوزيع لدينا، وكانت النتائج رائعة. تساعدنا تحليلات الذكية المدعومة بالذكاء الاصطناعي في التنبؤ بأنماط الطلب، وتكامل إنترنت الأشياء مع نظام إدارة المستودعات لدينا قد بسط عمليتنا بأكملها. أوصي بشدة بخزائن الذكية لأي شركة لوجستية.',
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
    <section className="py-20 px-6 bg-gray-50 relative overflow-hidden">
      {/* Background decoration - large decorative quote mark */}
      <div className="absolute top-10 left-10 text-9xl text-blue-100 font-serif leading-none select-none">"</div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 bg-blue-600/10 text-blue-600 rounded-full text-sm font-semibold mb-4">
            ★ {t('home.testimonials.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('home.testimonials.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('home.testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 hover:border-blue-500/30 relative overflow-hidden"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              {/* Star Rating - using text stars instead of Lucide */}
              <div className="flex items-center mb-6 relative z-10">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-8 relative z-10 italic">
                "{getLocalizedText(testimonial.content, currentLocale)}"
              </p>

              {/* Divider */}
              <div className="w-12 h-1 bg-blue-600/20 group-hover:w-20 group-hover:bg-blue-600 transition-all duration-500 mb-6 relative z-10" />

              {/* Author */}
              <div className="relative z-10">
                <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-600 mt-1">
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
