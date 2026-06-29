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

// Category solid color map for badges
const categoryColorMap: Record<string, string> = {
  'Industry Trends': '#667eea',
  'Case Study': '#11998e',
  'Technical Guide': '#F2994A',
  'Best Practice': '#4facfe',
  'Use Case': '#43e97b',
  'Customer Story': '#fa709a',
  'General': '#a18cd1',
};

// Translate blog category name
function getCategoryLabel(category: string, locale: string): string {
  const catLabels: Record<string, Record<string, string>> = {
    'Industry Trends': { en: 'Industry Trends', zh: '行业趋势', ar: 'اتجاهات الصناعة' },
    'Case Study': { en: 'Case Study', zh: '案例研究', ar: 'دراسة حالة' },
    'Technical Guide': { en: 'Technical Guide', zh: '技术指南', ar: 'دليل تقني' },
    'Best Practice': { en: 'Best Practice', zh: '最佳实践', ar: 'أفضل الممارسات' },
    'Use Case': { en: 'Use Case', zh: '应用场景', ar: 'حالة الاستخدام' },
    'Customer Story': { en: 'Customer Story', zh: '客户故事', ar: 'قصة العميل' },
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

  // === 内联 Blog 图片映射 (v147) — 不依赖外部模块 ===

  // 所有可用的本地图片
  const BLOG_IMAGES = [
    '/images/blog/industry-trends.jpg',
    '/images/blog/case-study.jpg',
    '/images/blog/technical-guide.jpg',
    '/images/blog/best-practice.jpg',
    '/images/blog/use-case.jpg',
    '/images/blog/customer-story.jpg',
    '/images/blog/general.jpg',
    '/images/blog/smart-cabinet-warehouse.jpg',
    '/images/blog/roi-cost-analysis.jpg',
    '/images/blog/rfid-tool-tracking.jpg',
    '/images/blog/iot-mes-integration.jpg',
    '/images/blog/cnc-machining-roi.jpg',
    '/images/blog/aerospace-fod-prevention.jpg',
    '/images/blog/ai-industry-4-0.jpg',
    '/images/blog/digital-transformation.jpg',
    '/images/blog/future-smart-factory.jpg',
    '/images/blog/ppe-safety-equipment.jpg',
    '/images/blog/buying-guide-smart-cabinet.jpg',
  ];

  // 按 slug 精确匹配的主题图片
  const SLUG_IMAGE_MAP: Record<string, string> = {
    'smart-cabinet-warehouse': '/images/blog/smart-cabinet-warehouse.jpg',
    'roi-cost-analysis': '/images/blog/roi-cost-analysis.jpg',
    'rfid-tool-tracking': '/images/blog/rfid-tool-tracking.jpg',
    'iot-mes-integration': '/images/blog/iot-mes-integration.jpg',
    'cnc-machining-roi': '/images/blog/cnc-machining-roi.jpg',
    'aerospace-fod-prevention': '/images/blog/aerospace-fod-prevention.jpg',
    'ai-industry-4-0': '/images/blog/ai-industry-4-0.jpg',
    'digital-transformation': '/images/blog/digital-transformation.jpg',
    'future-smart-factory': '/images/blog/future-smart-factory.jpg',
    'ppe-safety-equipment': '/images/blog/ppe-safety-equipment.jpg',
    'buying-guide-smart-cabinet': '/images/blog/buying-guide-smart-cabinet.jpg',
  };

  // 按分类匹配的图片（key 是 API 返回的小写格式）
  const CATEGORY_IMAGE_MAP: Record<string, string> = {
    'industry-trends': '/images/blog/industry-trends.jpg',
    'case-study': '/images/blog/case-study.jpg',
    'technical-guide': '/images/blog/technical-guide.jpg',
    'best-practice': '/images/blog/best-practice.jpg',
    'use-case': '/images/blog/use-case.jpg',
    'customer-story': '/images/blog/customer-story.jpg',
    'general': '/images/blog/general.jpg',
  };

  // 分类名称显示映射（API 返回小写 → 显示名称）
  const CATEGORY_LABELS: Record<string, { en: string; zh: string; ar: string }> = {
    'industry-trends': { en: 'Industry Trends', zh: '行业趋势', ar: 'اتجاهات الصناعة' },
    'case-study': { en: 'Case Study', zh: '案例研究', ar: 'دراسة حالة' },
    'technical-guide': { en: 'Technical Guide', zh: '技术指南', ar: 'دليل تقني' },
    'best-practice': { en: 'Best Practice', zh: '最佳实践', ar: 'أفضل الممارسات' },
    'use-case': { en: 'Use Case', zh: '应用场景', ar: 'حالة الاستخدام' },
    'customer-story': { en: 'Customer Story', zh: '客户故事', ar: 'قصة العميل' },
    'general': { en: 'General', zh: '综合', ar: 'عام' },
  };

  // 分类颜色映射（小写 key）
  const CATEGORY_COLOR_MAP: Record<string, string> = {
    'industry-trends': '#667eea',
    'case-study': '#11998e',
    'technical-guide': '#F2994A',
    'best-practice': '#4facfe',
    'use-case': '#43e97b',
    'customer-story': '#fa709a',
    'general': '#a18cd1',
  };

  // 分类图标映射（小写 key）
  function getBlogIconByCategory(categoryLower: string) {
    const iconMap: Record<string, any> = {
      'industry-trends': TrendingUp,
      'case-study': FileText,
      'technical-guide': Lightbulb,
      'best-practice': Award,
      'use-case': Shield,
      'customer-story': Newspaper,
    };
    return iconMap[categoryLower] || FileText;
  }

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
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .blog-card {
            animation: fadeInUp 0.6s ease-out forwards;
            opacity: 0;
          }
        `}} />
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
              const title = (typeof post.title === 'object' && post.title !== null)
                ? (post.title[locale] || post.title.en || '')
                : String(post.title || '');
              const excerpt = (typeof post.excerpt === 'object' && post.excerpt !== null)
                ? (post.excerpt[locale] || post.excerpt.en || '')
                : String(post.excerpt || '');

              // === 内联图片选择逻辑 (v147) ===
              const postSlug = post.slug || '';
              const postCategory = (post.category || 'general').toLowerCase().trim();

              // 1. 先按 slug 匹配
              let cardImage: string = '';
              let slugMatched = false;
              for (const [key, img] of Object.entries(SLUG_IMAGE_MAP)) {
                if (postSlug.includes(key)) {
                  cardImage = img;
                  slugMatched = true;
                  break;
                }
              }

              // 2. 再按分类匹配
              if (!slugMatched && CATEGORY_IMAGE_MAP[postCategory]) {
                cardImage = CATEGORY_IMAGE_MAP[postCategory];
              }

              // 3. 最后按索引轮换（确保不同卡片显示不同图片）
              if (!cardImage) {
                cardImage = BLOG_IMAGES[index % BLOG_IMAGES.length];
              }

              // 调试日志 (v147)
              console.log(`[v147] card ${index}: slug="${postSlug}" category="${postCategory}" → image="${cardImage}"`);

              // 分类显示（使用小写 key 查映射）
              const categoryLabel = CATEGORY_LABELS[postCategory] || CATEGORY_LABELS['general'];
              const categoryDisplay = categoryLabel[locale as 'en' | 'zh' | 'ar'] || categoryLabel.en;
              const categoryColor = CATEGORY_COLOR_MAP[postCategory] || CATEGORY_COLOR_MAP['general'];
              const BlogIcon = getBlogIconByCategory(postCategory);

              return (
                <a key={post.id} href={detailHref}
                  className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700 block blog-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Blog Image — always use local images (reliable, no CDN/issues) */}
                  <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-slate-700">
                    <img
                      src={cardImage}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading={isPriority ? 'eager' : 'lazy'}
                      onError={(e) => {
                        // 简化 onError：只替换 src 到 general.jpg，不隐藏 img
                        const target = e.target as HTMLImageElement;
                        const fallbackSrc = '/images/blog/general.jpg';
                        if (!target.src.includes(fallbackSrc)) {
                          console.warn(`[v147] Image load failed, using fallback: ${target.src}`);
                          target.src = fallbackSrc;
                        }
                      }}
                    />
                    {/* Gradient overlay for text readability - reduced opacity to better show image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    {/* Category badge overlay on image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-white text-xs font-semibold rounded-full backdrop-blur-sm"
                        style={{ backgroundColor: `${categoryColor}cc` }}
                      >
                        <BlogIcon className="w-3 h-3" />
                        {categoryDisplay}
                      </span>
                      {/* Read More hover button */}
                      <div className="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-800 dark:text-white px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-medium shadow-lg transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                        {t.readMore}
                      </div>
                    </div>
                  </div>
                  {/* Blog Info */}
                  <div className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-white text-xs font-semibold rounded-full"
                        style={{ backgroundColor: categoryColor }}
                      >
                        <BlogIcon className="w-3 h-3" />
                        {categoryDisplay}
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
