'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search, MessageCircle, ArrowRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchFAQs, FAQ } from '@/lib/api';
import OceanHeader from '@/components/OceanHeader';

// FAQ card color themes (cycling)
const faqCardThemes = [
  { accent: '#3b82f6', bgGrad: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', shadowColor: 'rgba(59,130,246,0.2)', borderGlow: '#3b82f6' },
  { accent: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', shadowColor: 'rgba(139,92,246,0.2)', borderGlow: '#8b5cf6' },
  { accent: '#10b981', bgGrad: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', shadowColor: 'rgba(16,185,129,0.2)', borderGlow: '#10b981' },
  { accent: '#f59e0b', bgGrad: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', shadowColor: 'rgba(245,158,11,0.2)', borderGlow: '#f59e0b' },
  { accent: '#06b6d4', bgGrad: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)', shadowColor: 'rgba(6,182,212,0.2)', borderGlow: '#06b6d4' },
];

export default function FAQPage() {
  const { locale } = useLocale();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Load FAQs from API
  useEffect(() => {
    async function loadFAQs() {
      try {
        const data = await fetchFAQs({ status: 'active' });
        setFaqs(data);
      } catch (error) {
        console.error('Failed to load FAQs:', error);
      } finally {
        setLoading(false);
      }
    }
    loadFAQs();
  }, []);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const content = {
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions about Smart Cabinet products and services',
      stillHaveQuestions: 'Still have questions?',
      contactUs: 'Contact Us',
      description: 'Our team is here to help. Reach out for personalized assistance.',
      searchPlaceholder: 'Search questions...',
      categoryAll: 'All Categories',
      empty: 'No FAQs found. Try a different search or category.',
    },
    zh: {
      title: '常见问题',
      subtitle: '查找有关智能柜产品和服务的常见问题的答案',
      stillHaveQuestions: '还有问题吗？',
      contactUs: '联系我们',
      description: '我们的团队随时为您提供帮助，联系获取个性化协助。',
      searchPlaceholder: '搜索问题...',
      categoryAll: '全部分类',
      empty: '未找到相关问题，请尝试其他搜索词或分类。',
    },
    ar: {
      title: 'الأسئلة الشائعة',
      subtitle: 'ابحث عن إجابات للأسئلة الشائعة حول المنتجات وحلول الخزائن الذكية',
      stillHaveQuestions: 'لديك المزيد من الأسئلة؟',
      contactUs: 'اتصل بنا',
      description: 'فريقنا جاهز دائماً لمساعدتك. تواصل معنا للحصول على مساعدة مخصصة.',
      searchPlaceholder: 'بحث في الأسئلة...',
      categoryAll: 'جميع الفئات',
      empty: 'لم يتم العثور على أسئلة. حاول بحثاً مختلفاً أو فئة أخرى.',
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  // Category label map (i18n)
  const categoryLabels: Record<string, Record<string, string>> = {
    all: { zh: '全部分类', en: 'All Categories', ar: 'جميع الفئات' },
    features: { zh: '功能特性', en: 'Features', ar: 'الميزات' },
    security: { zh: '安全权限', en: 'Security', ar: 'الأمان' },
    tracking: { zh: '追踪追溯', en: 'Tracking', ar: 'التتبع' },
    reporting: { zh: '报表导出', en: 'Reporting', ar: 'التقارير' },
    integration: { zh: '系统集成', en: 'Integration', ar: 'التكامل' },
    products: { zh: '产品相关', en: 'Products', ar: 'المنتجات' },
    customization: { zh: '定制开发', en: 'Customization', ar: 'التخصيص' },
    applications: { zh: '应用场景', en: 'Applications', ar: 'التطبيقات' },
    sales: { zh: '购买咨询', en: 'Sales', ar: 'المبيعات' },
    support: { zh: '售后服务', en: 'Support', ar: 'الدعم الفني' },
    company: { zh: '关于公司', en: 'About Us', ar: 'عن الشركة' },
  };

  // Dynamically build categories from actual FAQ data
  const allCategoryIds = [...new Set(faqs.map(f => f.category))];
  const categories = [
    { id: 'all', label: categoryLabels.all[locale] || categoryLabels.all.en },
    ...allCategoryIds.map(catId => ({
      id: catId,
      label: (categoryLabels[catId] && categoryLabels[catId][locale]) || categoryLabels[catId]?.en || catId,
    })),
  ];

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = !searchQuery ||
      (locale === 'zh' ? faq.question.zh : locale === 'ar' ? faq.question.ar : faq.question.en)
        .toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
        {/* Page Header Skeleton */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #1e40af, #2563eb)' }}
        >
          <div className="max-w-5xl mx-auto text-center">
            <div className="h-10 rounded-lg w-64 mx-auto mb-4 animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <div className="h-6 rounded-lg w-96 mx-auto animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="rounded-xl p-6 animate-pulse" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="h-6 rounded w-3/4 mb-3" style={{ backgroundColor: 'var(--border-color)' }} />
                <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--section-alt-bg)' }} />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Page Header — Ocean Theme */}
      <OceanHeader
        title={t.title}
        subtitle={t.subtitle}
        icon={<HelpCircle className="w-8 h-8 text-blue-300" />}
      />

      {/* Wave divider decoration */}
      <div className="w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 120" className="w-full h-[60px] md:h-[80px]" preserveAspectRatio="none">
          <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,42.7C1248,43,1344,53,1392,58.7L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" 
            fill="var(--card-bg)" fillOpacity="1" />
        </svg>
      </div>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}} />
        {/* Search + Filter */}
        {/* Search + Filter */}
        <div className="mb-12 space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300" style={{ color: 'var(--text-secondary)' }} id="faq-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15), 0 4px 14px rgba(59,130,246,0.2)';
                const icon = document.getElementById('faq-search-icon');
                if (icon) icon.style.animation = 'pulse 2s infinite';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.boxShadow = '';
                const icon = document.getElementById('faq-search-icon');
                if (icon) icon.style.animation = '';
              }}
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 border rounded-xl text-sm outline-none transition-all"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Category Pills — wrapped in a styled card container */}
          <div 
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            {/* Subtle header for visual grouping */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)' }} />
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {locale === 'zh' ? '按分类筛选' : locale === 'ar' ? 'تصفية حسب الفئة' : 'Filter by Category'}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  style={activeCategory === cat.id ? {
                    backgroundImage: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
                    transform: 'translateY(-1px)',
                  } : {
                    backgroundColor: 'var(--section-alt-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const theme = faqCardThemes[index % faqCardThemes.length];
            return (
              <div
                key={faq.id}
                className="faq-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg relative"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  boxShadow: openIndex === index ? `0 10px 30px ${theme.shadowColor}` : undefined,
                  background: openIndex === index ? theme.bgGrad : undefined,
                }}
              >
                {/* Left color bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-300 hover:w-[6px]"
                  style={{ 
                    backgroundColor: theme.accent,
                    boxShadow: openIndex === index ? `0 0 12px ${theme.shadowColor}` : 'none',
                    width: openIndex === index ? '6px' : '4px',
                  }}
                />
                
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 transition-all duration-200 pl-8"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--section-alt-bg)';
                    const bar = e.currentTarget.parentElement?.querySelector('.faq-bar') as HTMLElement;
                    if (bar) bar.style.width = '6px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    if (openIndex !== index) {
                      const bar = e.currentTarget.parentElement?.querySelector('.faq-bar') as HTMLElement;
                      if (bar) bar.style.width = '4px';
                    }
                  }}
                >
                  <span className="font-bold text-[15px] transition-colors duration-200 hover:text-blue-600" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'zh' ? faq.question.zh : locale === 'ar' ? faq.question.ar : faq.question.en}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: theme.accent }} />
                  ) : (
                    <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                  )}
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pl-8">
                    <div className="rounded-lg p-4 relative" style={{
                      backgroundColor: `${theme.accent}12`,
                      borderLeft: `4px solid ${theme.accent}`,
                    }}>
                      {/* Decorative quote icon watermark */}
                      <div className="absolute top-2 right-3 opacity-8 text-4xl leading-none" style={{ color: theme.accent }}>"</div>
                      <p className="leading-relaxed text-[14px] relative z-10" style={{ color: 'var(--text-secondary)' }}>
                        {locale === 'zh' ? faq.answer.zh : locale === 'ar' ? faq.answer.ar : faq.answer.en}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-20">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
              {t.empty}
            </p>
          </div>
        )}

        {/* Still have questions */}
          <div className="faq-card mt-16 text-center relative overflow-hidden">
            {/* Decorative floating circles */}
            <div className="absolute w-20 h-20 rounded-full opacity-20 animate-float" style={{ backgroundColor: '#8b5cf6', top: '10%', left: '10%', animationDelay: '0s' }} />
            <div className="absolute w-16 h-16 rounded-full opacity-15 animate-float" style={{ backgroundColor: '#3b82f6', top: '60%', right: '15%', animationDelay: '1s' }} />
            <div className="absolute w-12 h-12 rounded-full opacity-25 animate-float" style={{ backgroundColor: '#06b6d4', bottom: '20%', left: '20%', animationDelay: '2s' }} />
            
            <div className="rounded-2xl p-8 shadow-lg relative z-10" style={{
              background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 50%, #ecfeff 100%)',
              border: '1px solid var(--border-color)'
          }}>
            <MessageCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#8b5cf6' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t.stillHaveQuestions}
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              {t.description}
            </p>
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              {/* Shine sweep animation */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative z-10">{t.contactUs}</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
