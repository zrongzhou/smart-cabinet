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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Page Header Skeleton */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="h-10 bg-blue-800/50 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-blue-800/30 rounded-lg w-96 mx-auto animate-pulse" />
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-100 dark:bg-slate-600 rounded w-full" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
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
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all text-gray-900 dark:text-white"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-sm'
                }`}
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
                className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-md ${
                  openIndex === index ? 'shadow-lg' : ''
                }`}
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                >
                  <span className="font-semibold text-gray-900 dark:text-white text-[15px]">
                    {locale === 'zh' ? faq.question.zh : locale === 'ar' ? faq.question.ar : faq.question.en}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  )}
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6">
                    <div className="bg-blue-50 dark:bg-slate-700/50 rounded-lg p-4 border-l-4 border-blue-600">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[14px]">
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
            <HelpCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 dark:text-gray-500">
              {t.empty}
            </p>
          </div>
        )}

        {/* Still have questions */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-700">
            <MessageCircle className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t.stillHaveQuestions}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t.description}
            </p>
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
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
