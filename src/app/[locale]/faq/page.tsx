'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search, MessageCircle, ArrowRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchFAQs, FAQ } from '@/lib/api';

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
      {/* Page Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a, #1e40af, #2563eb)' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 backdrop-blur-sm rounded-2xl mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            {t.title}
          </h1>
          <p className="text-xl text-blue-100">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search + Filter */}
        <div className="mb-12 space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 border rounded-xl text-sm outline-none transition-all"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-300"
                style={activeCategory === cat.id ? {
                  backgroundColor: 'var(--primary-color)',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                } : {
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
              <div
                key={faq.id}
                className="faq-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-md"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  boxShadow: openIndex === index ? '0 10px 30px rgba(0,0,0,0.1)' : undefined,
                }}
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 transition-colors duration-200"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--section-alt-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
                    {locale === 'zh' ? faq.question.zh : locale === 'ar' ? faq.question.ar : faq.question.en}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary-color)' }} />
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
                  <div className="px-6 pb-6">
                    <div className="rounded-lg p-4" style={{
                      backgroundColor: 'rgba(59,130,246,0.08)',
                      borderLeft: '4px solid #2563eb'
                    }}>
                      <p className="leading-relaxed text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                        {locale === 'zh' ? faq.answer.zh : locale === 'ar' ? faq.answer.ar : faq.answer.en}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          ))}
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
          <div className="faq-card mt-16 text-center">
            <div className="rounded-2xl p-8 shadow-lg" style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)'
          }}>
            <MessageCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--primary-color)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t.stillHaveQuestions}
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              {t.description}
            </p>
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              {t.contactUs}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
