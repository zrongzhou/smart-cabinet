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
    name: { zh: '林总', en: 'Mr. Lin', ar: 'السيد لين' },
    role: { zh: '生产总监', en: 'Production Director', ar: 'مدير الإنتاج' },
    company: { zh: '华南某精密制造企业', en: 'A precision manufacturing enterprise in South China', ar: 'شركة تصنيع دقيقة في جنوب الصين' },
    content: {
      zh: '我们生产线上安装了20台智能柜，结果非常出色。AI分析帮助我们预测需求模式，与WMS的物联网集成简化了整个运营。我强烈推荐智能柜给任何物流公司。',
      en: 'We installed 20 Smart Cabinets across our distribution centers, and the results have been outstanding. The AI-powered analytics help us predict demand patterns, and the IoT integration with our WMS has streamlined our entire operation. I highly recommend Smart Cabinet to any logistics company.',
      ar: 'قمنا بتركيب 20 خزانة ذكية في مراكز التوزيع لدينا، وكانت النتائج رائعة. تساعدنا تحليلات الذكية المدعومة بالذكاء الاصطناعي في التنبؤ بأنماط الطلب، وتكامل إنترنت الأشياء مع نظام إدارة المستودعات لدينا قد بسط عمليتنا بأكملها. أوصي بشدة بخزائن الذكية لأي شركة لوجستية.',
    },
    rating: 5,
  },
  {
    name: { zh: '黄工', en: 'Engineer Huang', ar: 'المهندسة هوانغ' },
    role: { zh: '首席工程师', en: 'Lead Engineer', ar: 'المهندسة الرئيسية' },
    company: { zh: '东莞某精密加工企业', en: 'A precision machining enterprise in Dongguan', ar: 'شركة تصنيع دقيقة في دونغوان' },
    content: {
      zh: '这家精密加工公司通过智能柜实施，将工具搜索时间减少了75%，消除了生产延误。详细的案例研究和可衡量的结果。',
      en: 'A precision machining company reduced tool search time by 75% and eliminated production delays with smart cabinet implementation. A detailed case study with measurable results.',
      ar: 'خفضت شركة تصنيع دقيقة وقت البحث عن الأدوات بنسبة 75% وأزالت تأخيرات الإنتاج من خلال تنفيذ الخزائن الذكية. دراسة حالة مفصلة مع نتائج قابلة للقياس.',
    },
    rating: 5,
  },
  {
    name: { zh: '张经理', en: 'Manager Zhang', ar: 'المدير زانغ' },
    role: { zh: '车间主任', en: 'Workshop Manager', ar: 'مشرف الورشة' },
    company: { zh: '某精密制造公司', en: 'A precision manufacturing company', ar: 'شركة تصنيع دقيقة' },
    content: {
      zh: '以前找一把刀要花10分钟，现在刷一下卡就能取刀，系统自动记录。我们的工具损耗率下降了40%，管理成本大幅降低。',
      en: 'It used to take 10 minutes to find a tool. Now I just swipe a card to get the tool, and the system automatically records it. Our tool loss rate dropped by 40%, and management costs decreased significantly.',
      ar: 'كان استرجاع أداة يستغرق 10 دقائق. الآن فقط أمر البطاقة وأستلم الأداة، والظام يسجل تلقائياً. انخفض معدل فقدان الأدوات بنسبة 40%، وتقلصت تكاليف الإدارة بشكل كبير.',
    },
    rating: 5,
  },
  {
    name: { zh: '李部长', en: 'Director Li', ar: 'المدير لي' },
    role: { zh: '设备负责人', en: 'Equipment Director', ar: 'مدير المعدات' },
    company: { zh: '某航空制造企业', en: 'An aviation manufacturing enterprise', ar: 'شركة تصنيع طيران' },
    content: {
      zh: '智能柜系统彻底改变了我们的工具管理方式。从入库到出库全流程可追溯，库存准确率提升到99.5%。员工满意度也大幅提升，再也不用为找工具发愁了。',
      en: 'The smart cabinet system has completely transformed our tool management. Full traceability from check-in to checkout, inventory accuracy up to 99.5%. Employee satisfaction has also improved significantly - no more struggling to find tools.',
      ar: 'حول نظام الخزائن الذكية إدارة أدواتنا بالكامل. قابلية تتبع كاملة من الاستلام إلى الصرف، دقة المخزون وصلت إلى 99.5%. تحسن رضا الموظفين بشكل كبير - لا مزيد من المعاناة في العثور على الأدوات.',
    },
    rating: 5,
  },
  {
    name: { zh: '陈经理', en: 'Manager Chen', ar: 'المديرة تشين' },
    role: { zh: 'IT负责人', en: 'IT Manager', ar: 'مدير تقنية المعلومات' },
    company: { zh: '华东某电子科技企业', en: 'An electronics technology enterprise in East China', ar: 'شركة تكنولوجيا إلكترونية في شرق الصين' },
    content: {
      zh: '作为IT负责人，我最看重系统的稳定性和数据安全。这套智能柜运行一年多零故障，数据实时同步到我们的ERP系统，报表功能也非常强大。',
      en: 'As an IT manager, I value system stability and data security most. This smart cabinet has run for over a year with zero downtime, real-time data sync to our ERP, and powerful reporting capabilities.',
      ar: 'كمسؤول تقنية المعلومات، أقدر استقرار النظام وأمان البيانات أكثر من أي شيء آخر. عملت هذه الخزانة الذكية لأكثر من عام بدون توقف، مع مزامنة بيانات فورية مع نظام ERP، وقدرات تقارير قوية.',
    },
    rating: 5,
  },
  {
    name: { zh: '王总', en: 'Mr. Wang', ar: 'السيد وانغ' },
    role: { zh: '运营副总', en: 'VP of Operations', ar: 'نائب الرئيس للعمليات' },
    company: { zh: '北方某重工集团', en: 'A heavy industry group in North China', ar: 'مجموعة صناعية ثقيلة في شمال الصين' },
    content: {
      zh: '我们集团下属5个工厂都部署了智能柜，统一管理平台让我们能实时监控所有工厂的刀具使用情况。ROI在8个月内就实现了，这是近年来最成功的数字化项目之一。',
      en: 'All 5 of our group\'s factories have deployed smart cabinets. The unified management platform lets us monitor cutting tool usage across all facilities in real time. ROI was achieved within 8 months - one of our most successful digital transformation projects.',
      ar: 'نشرنا الخزائن الذكية في جميع مصانع مجموعتنا الخمسة. تتيح لنا المنصة الموحدة مراقبة استخدام أدوات القطع في جميع المرافق في الوقت الفعلي. تم تحقيق العائد على الاستثمار في غضون 8 أشهر - أحد أكثر مشاريع التحول الرقمي نجاحاً.',
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

              {/* Author — with i18n name/company support */}
              <div className="relative z-10">
                <div
                  className="font-bold text-lg"
                  style={{ color: '#1a202c' }}
                >
                  {getLocalizedText(testimonials[currentIndex].name, currentLocale)}
                </div>
                <div className="text-sm mt-1" style={{ color: '#4a5568' }}>
                  {getLocalizedText(testimonials[currentIndex].role, currentLocale)}
                  {currentLocale === 'zh' ? '，' : currentLocale === 'ar' ? '، ' : ', '}
                  {getLocalizedText(testimonials[currentIndex].company, currentLocale)}
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
