'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, ArrowLeft, ArrowRight, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchBlogBySlug, fetchBlogs, BlogPost } from '@/lib/api';
import { notFound } from 'next/navigation';
// Static fallback when API has no data
import staticBlogs from '@/data/blogs';

interface BlogDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { locale } = useLocale();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // === v151 图片方案：按 slug 精确匹配 ===
  const BLOG_IMAGE_FALLBACKS = [
    '/images/blog/industry-trends.jpg',
    '/images/blog/case-study.jpg',
    '/images/blog/technical-guide.jpg',
    '/images/blog/best-practice.jpg',
    '/images/blog/use-case.jpg',
    '/images/blog/customer-story.jpg',
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
    '/images/blog/general.jpg',
  ];

  const SLUG_TO_IMAGE: Record<string, string> = {
    // API 返回数字 ID slug
    '1': '/images/blog/ai-industry-4-0.jpg',
    '2': '/images/blog/cnc-machining-roi.jpg',
    '3': '/images/blog/rfid-tool-tracking.jpg',
    '4': '/images/blog/smart-cabinet-warehouse.jpg',
    '5': '/images/blog/ppe-safety-equipment.jpg',
    '6': '/images/blog/digital-transformation.jpg',
    '7': '/images/blog/roi-cost-analysis.jpg',
    '8': '/images/blog/iot-mes-integration.jpg',
    '9': '/images/blog/buying-guide-smart-cabinet.jpg',
    '10': '/images/blog/aerospace-fod-prevention.jpg',
    '11': '/images/blog/best-practice.jpg',
    '12': '/images/blog/future-smart-factory.jpg',
    // 文字 slug 兼容
    'future-of-intelligent-tool-storage': '/images/blog/ai-industry-4-0.jpg',
    'smart-cabinets-reduce-cnc-downtime': '/images/blog/cnc-machining-roi.jpg',
    'complete-guide-rfid-tool-management': '/images/blog/rfid-tool-tracking.jpg',
    '5-ways-smart-cabinets-improve-inventory-accuracy': '/images/blog/smart-cabinet-warehouse.jpg',
    'ppe-vending-compliance-made-easy': '/images/blog/ppe-safety-equipment.jpg',
    'from-manual-to-smart-manufacturing-transformation': '/images/blog/digital-transformation.jpg',
    'smart-cabinet-roi-calculator-guide': '/images/blog/roi-cost-analysis.jpg',
    'iot-integration-smart-cabinets-factory-network': '/images/blog/iot-mes-integration.jpg',
    'top-10-features-smart-tool-cabinets-buying-guide': '/images/blog/buying-guide-smart-cabinet.jpg',
    'aerospace-manufacturers-smart-tool-management-benefits': '/images/blog/aerospace-fod-prevention.jpg',
    'future-of-smart-warehousing-beyond-tool-cabinets': '/images/blog/future-smart-factory.jpg',
    // 新增博客 2026
    '13': '/images/blog/vending-machine-trends-2026.jpg',
    '14': '/images/blog/cnc-tool-inventory-guide.jpg',
    // V8.6: 旧两篇 + 新增 4 篇（slug 均带 .html）
    'industrial-vending-machine-trends-2026.html': '/images/blog/vending-machine-trends-2026.jpg',
    'cnc-tool-inventory-management-guide.html': '/images/blog/cnc-tool-inventory-guide.jpg',
    'ppe-vending-machine-safety-supplies-management.html': '/images/blog/ppe-vending-machine-safety-supplies-management.jpeg',
    'cutting-tool-distributors-tool-vending-machine.html': '/images/blog/cutting-tool-distributors-tool-vending-machine.png',
    'tool-vending-machine-functions-cnc-workshop.html': '/images/blog/tool-vending-machine-functions-cnc-workshop.png',
    'manual-tool-crib-to-smart-tool-cabinet.html': '/images/blog/manual-tool-crib-to-smart-tool-cabinet.jpeg',
  };

  /** v152b: 只在正文开头插入封面图（避免重复图片） */
  function injectCoverImageInContent(htmlContent: string, coverImage: string): string {
    if (!coverImage) return htmlContent;
    const figureHtml = `<figure class="my-8 rounded-2xl overflow-hidden shadow-lg"><img src="${coverImage}" alt="Cover image" class="w-full h-auto object-cover" style="max-height:400px" /></figure>`;
    // 在第一个 </p> 后插入（即第一段结束后）
    const insertPos = htmlContent.indexOf('</p>');
    if (insertPos === -1) return figureHtml + htmlContent; // 没有段落标签，直接前置
    return htmlContent.slice(0, insertPos + 4) + figureHtml + htmlContent.slice(insertPos + 4);
  }

  // Recent Posts 图片选择 - 按 slug 匹配
  function getInlineBlogImage(post: BlogPost, index: number): string {
    const postSlug = post.slug || '';
    if (SLUG_TO_IMAGE[postSlug]) return SLUG_TO_IMAGE[postSlug];
    if (post.image && post.image.startsWith('/images/') && !post.image.endsWith('.svg')) return post.image;
    return BLOG_IMAGE_FALLBACKS[index % BLOG_IMAGE_FALLBACKS.length];
  }

  // 详情页图片选择 - 按 slug 匹配
  function getInlineBlogDetailImage(post: BlogPost): string {
    const postSlug = post.slug || '';
    if (SLUG_TO_IMAGE[postSlug]) return SLUG_TO_IMAGE[postSlug];
    if (post.image && post.image.startsWith('/images/') && !post.image.endsWith('.svg')) return post.image;
    // fallback
    let hash = 0;
    for (let i = 0; i < postSlug.length; i++) hash = ((hash << 5) - hash) + postSlug.charCodeAt(i);
    return BLOG_IMAGE_FALLBACKS[Math.abs(hash) % BLOG_IMAGE_FALLBACKS.length];
  }

  // Resolve params (Promise in Next.js 14.1+)
  const [resolvedParams, setResolvedParams] = useState<{ locale: string; slug: string } | null>(null);
  useEffect(() => {
    async function resolve() {
      const p = await params;
      setResolvedParams(p);
    }
    resolve();
  }, [params]);

  // Load blog and recent blogs from API
  useEffect(() => {
    if (!resolvedParams) return;
    const { slug } = resolvedParams; // Extract before async
    let cancelled = false;
    async function loadData() {
      try {
        const [blogRes, blogsRes] = await Promise.all([
          fetchBlogBySlug(slug),
          fetchBlogs({ published: true, pageSize: 50 }),
        ]);
        if (cancelled) return;

        // If API returned a blog, use it; otherwise fall back to static blogs.ts
        if (blogRes) {
          setBlog(blogRes);
        } else {
          // Fallback: find matching slug in static blog data
          const staticBlog = staticBlogs.find(b => b.slug === slug);
          if (staticBlog) {
            const excerptObj = typeof staticBlog.excerpt === 'string'
              ? { zh: staticBlog.excerpt, en: staticBlog.excerpt, ar: staticBlog.excerpt }
              : (staticBlog.excerpt || { zh: '', en: '', ar: '' });
            const contentObj = typeof staticBlog.content === 'string'
              ? { zh: staticBlog.content, en: staticBlog.content, ar: staticBlog.content }
              : (staticBlog.content || { zh: '', en: '', ar: '' });
            setBlog({
              id: staticBlog.id || staticBlog.slug,
              slug: staticBlog.slug,
              title: staticBlog.title,
              excerpt: excerptObj,
              content: contentObj,
              author: staticBlog.author,
              publishedAt: staticBlog.publishedAt,
              image: staticBlog.image,
              featured: staticBlog.featured || false,
              tags: (staticBlog.tags || []).map(t => ({ id: t, slug: t.toLowerCase().replace(/\s+/g, '-'), name: { zh: t, en: t, ar: t } })),
              status: 'published',
              createdAt: staticBlog.publishedAt || new Date().toISOString(),
              updatedAt: staticBlog.publishedAt || new Date().toISOString(),
            });
          }
        }

        // Get recent blogs (exclude current) - from API or static fallback
        if (blogsRes?.data) {
          setRecentBlogs(
            blogsRes.data
              .filter((b: BlogPost) => b.slug !== slug)
              .slice(0, 3)
          );
        } else if (!blogRes) {
          // Fallback recent blogs from static data
          setRecentBlogs(
            staticBlogs
              .filter(b => b.slug !== slug)
              .slice(0, 3)
              .map(b => {
                const eObj = b.excerpt || { zh: '', en: '', ar: '' };
                const cObj = b.content || { zh: '', en: '', ar: '' };
                return {
                  id: b.id || b.slug,
                  slug: b.slug,
                  title: b.title,
                  excerpt: eObj,
                  content: cObj,
                  author: b.author,
                  publishedAt: b.publishedAt,
                  image: b.image,
                  featured: b.featured || false,
                  tags: (b.tags || []).map(t => ({ id: t, slug: t.toLowerCase().replace(/\s+/g, '-'), name: { zh: t, en: t, ar: t } })),
                  status: 'published',
                  createdAt: b.publishedAt || new Date().toISOString(),
                  updatedAt: b.publishedAt || new Date().toISOString(),
                };
              })
          );
        }
      } catch (e) {
        console.error('Failed to load blog:', e);
        // On error, also try static fallback
        if (!cancelled) {
          const staticBlog = staticBlogs.find(b => b.slug === slug);
          if (staticBlog) {
            setBlog({
              id: staticBlog.id || staticBlog.slug,
              slug: staticBlog.slug,
              title: staticBlog.title,
              excerpt: staticBlog.excerpt || { zh: '', en: '', ar: '' },
              content: staticBlog.content || { zh: '', en: '', ar: '' },
              author: staticBlog.author,
              publishedAt: staticBlog.publishedAt,
              image: staticBlog.image,
              featured: staticBlog.featured || false,
              tags: (staticBlog.tags || []).map(t => ({ id: t, slug: t.toLowerCase().replace(/\s+/g, '-'), name: { zh: t, en: t, ar: t } })),
              status: 'published',
              createdAt: staticBlog.publishedAt || new Date().toISOString(),
              updatedAt: staticBlog.publishedAt || new Date().toISOString(),
            });
          }
          // Static recent blogs fallback on error
          setRecentBlogs(
            staticBlogs.filter(b => b.slug !== slug).slice(0,3).map(b => {
              const eObj = b.excerpt || { zh: '', en: '', ar: '' };
              const cObj = b.content || { zh: '', en: '', ar: '' };
              return {
                id: b.id || b.slug,
                slug: b.slug,
                title: b.title,
                excerpt: eObj,
                content: cObj,
                author: b.author,
                publishedAt: b.publishedAt,
                image: b.image,
                featured: false,
                tags: (b.tags || []).map(t => ({ id: t, slug: t.toLowerCase().replace(/\s+/g, '-'), name: { zh: t, en: t, ar: t } })),
                status: 'published',
                createdAt: b.publishedAt || new Date().toISOString(),
                updatedAt: b.publishedAt || new Date().toISOString(),
              };
            })
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [resolvedParams]);

  function formatDate(dateString: string, locale: string = 'en'): string {
    const date = new Date(dateString);
    if (locale === 'zh') {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
    if (locale === 'ar') {
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="h-4 bg-blue-800/50 rounded w-24 mb-4 animate-pulse"></div>
            <div className="h-10 bg-blue-800/50 rounded w-96 mb-3 animate-pulse"></div>
            <div className="h-5 bg-blue-800/50 rounded w-64 animate-pulse"></div>
          </div>
        </section>
        {/* Content Skeleton */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-md p-8 md:p-12 space-y-4">
            <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </section>
      </div>
    );
  }

  if (!blog) {
    // Render the locale 404 page (returns HTTP 404 when resolved during render).
    notFound();
  }

  const content = blog.content?.[locale as 'en' | 'zh' | 'ar'] || '';

  // 调试日志 (v151)
  console.log(`[v151] Detail: slug="${blog.slug}" → image="${getInlineBlogDetailImage(blog)}"`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Page Header with background image — v151: 移除 bg-gradient-to-br 避免覆盖背景图 */}
      <section
        className="relative text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage: `url(${getInlineBlogDetailImage(blog)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1e3a5f', // fallback 背景色（图片加载前显示）
        }}
      >
        {/* Gradient overlay — 降低不透明度，让背景图可见 */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-900/40 to-blue-900/70" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <a href={`/${locale}/blog`} className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {locale === 'zh' ? '返回博客' : locale === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
          </a>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {locale === 'zh' ? blog.title.zh : locale === 'ar' ? blog.title.ar : blog.title.en}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-blue-200">
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.publishedAt || blog.createdAt, locale)}
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <User className="w-4 h-4" />
              {blog.author || 'Admin'}
            </span>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-slate-700">

          {/* Render content (HTML from rich text editor) — v152: 注入正文配图 */}
          <div
            className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: injectCoverImageInContent(content, getInlineBlogDetailImage(blog)) }}
          />

          {/* Share buttons */}
          <div className="flex items-center gap-4 mt-12 pt-8 border-t border-gray-200">
            <span className="text-sm text-gray-500">{locale === 'zh' ? '分享：' : locale === 'ar' ? 'مشاركة:' : 'Share:'}</span>
            <button className="p-2 bg-gray-100 hover:bg-blue-100 rounded-full transition-colors">
              <Twitter className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 bg-gray-100 hover:bg-blue-100 rounded-full transition-colors">
              <Facebook className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 bg-gray-100 hover:bg-blue-100 rounded-full transition-colors">
              <Linkedin className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      {recentBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
            {locale === 'zh' ? '最新文章' : locale === 'ar' ? 'أحدث المقالات' : 'Recent Posts'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentBlogs.map((post, idx) => {
              const postImage = getInlineBlogImage(post, idx);
              return (
                <a
                  key={post.id}
                  href={`/${locale}/blog/${post.slug}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-100 dark:border-slate-700"
                >
                  {/* v148 使用背景图方式 */}
                  <div
                    className="relative h-48 overflow-hidden"
                    style={{
                      backgroundImage: `url(${postImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {locale === 'zh' ? post.title.zh : locale === 'ar' ? post.title.ar : post.title.en}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.publishedAt || post.createdAt, locale)}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
