'use client';

import { useLocale } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

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
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Framer Motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  return (
    <section className="py-20 px-6 bg-white relative overflow-hidden">
      {/* Background decoration - large decorative quote mark */}
      <div 
        className="absolute top-10 left-10 font-serif leading-none select-none pointer-events-none"
        style={{ 
          fontSize: '120px',
          color: 'rgba(246, 173, 85, 0.2)'
        }}
      >"</div>
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(245, 173, 85, 0.05)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div 
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: 'rgba(26, 54, 93, 0.1)', color: '#1a365d' }}
          >
            <StarIcon className="w-4 h-4 text-amber-500" />
            {t('home.testimonials.badge')}
          </div>
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#1a202c' }}
          >
            {t('home.testimonials.title')}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#4a5568' }}
          >
            {t('home.testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border relative overflow-hidden"
              style={{ borderColor: '#e2e8f0' }}
            >
              {/* Hover glow effect */}
              <div 
                className="absolute inset-0 rounded-2xl"
                style={{ 
                  background: 'linear-gradient(90deg, rgba(26,54,93,0) 0%, rgba(26,54,93,0.05) 50%, rgba(26,54,93,0) 100%)',
                  opacity: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
              />

              {/* Star Rating - using Heroicons StarIcon */}
              <div className="flex items-center mb-6 relative z-10">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 mr-1" style={{ color: '#f6ad55' }} />
                ))}
              </div>

              {/* Content */}
              <p 
                className="text-lg leading-relaxed mb-8 relative z-10 italic"
                style={{ color: '#4a5568' }}
              >
                "{getLocalizedText(testimonials[currentIndex].content, currentLocale)}"
              </p>

              {/* Divider */}
              <div 
                className="w-12 h-1 rounded-full mb-6 relative z-10"
                style={{ backgroundColor: 'rgba(26, 54, 93, 0.2)' }}
              />

              {/* Author */}
              <div className="relative z-10">
                <div 
                  className="font-bold text-lg"
                  style={{ color: '#1a202c' }}
                >
                  {testimonials[currentIndex].name}
                </div>
                <div className="text-sm mt-1" style={{ color: '#4a5568' }}>
                  {getLocalizedText(testimonials[currentIndex].role, currentLocale)}，{testimonials[currentIndex].company}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: i === currentIndex ? '#1a365d' : 'rgba(26, 54, 93, 0.3)',
                  transform: i === currentIndex ? 'scale(1.2)' : 'scale(1)'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
