'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, FileText, Newspaper, Lightbulb, TrendingUp, Shield, Award } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchBlogs, BlogPost } from '@/lib/api';
import OceanHeader from '@/components/OceanHeader';

// Map blog category to Lucide icon + i18n label
function getBlogIcon(category: string) {
  const iconMap: Record<string, any> = {
    'Industry Trends': TrendingUp,
    'Case Study': FileText,
    'Technical Guide': Lightbulb,
    'Best Practice': Award,
    'Use Case': Shield,
    'Customer Story': Newspaper,
  };
  return iconMap[category] || FileText;
}

// Translate blog category name
function getCategoryLabel(category: string, locale: string): string {
  const catLabels: Record<string, Record<string, string>> = {
    'Industry Trends': { en: 'Industry Trends', zh: '行业趋势', ar: 'اتجاهات الصناعة' },
    'Case Study': { en: 'Case Study', zh: '案例研究', ar: 'دراسة حالة' },
    'Technical Guide': { en: 'Technical Guide', zh: '技术指南', ar: 'دليل تقني' },
    'Best Practice': { en: 'Best Practice', zh: '最佳实践', ar: 'أفضل الممارسات' },
    'Use Case': { en: 'Use Case', zh: '应用场景', ar: 'حالة استخدام' },
    'Customer Story': { en: 'Customer Story', zh: '客户故事', ar: 'قصة عميل' },
    'General': { en: 'General', zh: '综合', ar: 'عام' },
  };
  return (catLabels[category] || catLabels['General'])[locale] || category;
}

function formatDate(dateString: string, locale: string = 'en'): string {
  const date = new Date(dateString);
  if (locale === 'zh') {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }
  if (locale === 'ar') {
    const arMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return `${date.getDate()} ${arMonths[date.getMonth()]} ${date.getFullYear()}`;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  const { locale } = useLocale();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Load blogs from API
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const data = await fetchBlogs({ published: true, pageSize: 12 });
        if (cancelled) return;
        setBlogs(data.data || data || []);
      } catch (e) {
        console.error('Failed to load blogs:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  const content = {
    en: {
      title: 'Blog & News',
      subtitle: 'Stay updated with the latest trends and insights in smart storage technology',
      readMore: 'Read More',
      empty: 'No blog posts found.',
    },
    zh: {
      title: '博客与新闻',
      subtitle: '了解智能存储技术的最新趋势和洞察',
      readMore: '阅读更多',
      empty: '未找到博客文章。',
    },
    ar: {
      title: 'المدونة والأخبار',
      subtitle: 'ابق على اطلاع بأحدث الاتجاهات والرؤى في تقنية التخزين الذكي',
      readMore: 'اقرأ المزيد',
      empty: 'لم يتم العثور على مقالات المدونة.',
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Page Header Skeleton */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="h-10 bg-blue-800/50 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-blue-800/30 rounded-lg w-96 mx-auto animate-pulse"></div>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden">
                <div className="h-56 bg-gray-100 dark:bg-slate-700 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-20 animate-pulse" />
                  <div className="h-6 bg-gray-100 dark:bg-slate-700 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Page Header — Ocean Theme */}
      <OceanHeader
        title={t.title}
        subtitle={t.subtitle}
        icon={<Newspaper className="w-8 h-8 text-blue-300" />}
      />

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-2xl text-gray-400 dark:text-gray-500">
              {t.empty}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post, index) => {
              const isPriority = index < 3;
              const detailHref = `/${locale}/blog/${post.slug}`;
              // === Direct i18n access (v138): API guarantees {en,zh,ar} objects ===
              // No need for complex resolver — just use [locale] key directly
              const title = (typeof post.title === 'object' && post.title !== null)
                ? (post.title[locale] || post.title.en || '')
                : String(post.title || '');
              const excerpt = (typeof post.excerpt === 'object' && post.excerpt !== null)
                ? (post.excerpt[locale] || post.excerpt.en || '')
                : String(post.excerpt || '');
              const category = post.category || 'General';
              const BlogIcon = getBlogIcon(category);

              return (
                <a key={post.id} href={detailHref}
                  className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700 block"
                >
                  {/* Blog Image */}
                  {post.image ? (
                    <div className="relative h-56 overflow-hidden bg-gray-50 dark:bg-slate-700">
                        <img src={post.image} alt={title}
                          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                          loading={isPriority ? 'eager' : 'lazy'}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm text-gray-800 dark:text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-lg">
                            <ArrowRight className="w-3.5 h-3.5" />
                            {t.readMore}
                          </div>
                        </div>
                      </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                      <BlogIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto" />
                    </div>
                  )}
                  {/* Blog Info */}
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                        <BlogIcon className="w-3 h-3" />
                        {getCategoryLabel(category, locale)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(post.publishedAt || post.createdAt || new Date().toISOString(), locale)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 leading-snug">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                      {excerpt || ''}
                    </p>
                    <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm mt-auto">
                      {t.readMore}
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
