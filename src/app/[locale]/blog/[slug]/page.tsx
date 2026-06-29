'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, ArrowLeft, ArrowRight, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchBlogBySlug, fetchBlogs, BlogPost } from '@/lib/api';
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

  // 内联图片选择函数 (v147)
  function getInlineBlogImage(post: BlogPost, index: number): string {
    const postSlug = post.slug || '';
    const postCategory = (post.category || 'general').toLowerCase().trim();

    // 1. 先按 slug 匹配
    for (const [key, img] of Object.entries(SLUG_IMAGE_MAP)) {
      if (postSlug.includes(key)) {
        return img;
      }
    }

    // 2. 再按分类匹配
    if (CATEGORY_IMAGE_MAP[postCategory]) {
      return CATEGORY_IMAGE_MAP[postCategory];
    }

    // 3. 最后按索引轮换
    return BLOG_IMAGES[index % BLOG_IMAGES.length];
  }

  // 内联详情页图片选择函数 (v147)
  function getInlineBlogDetailImage(post: BlogPost): string {
    const postSlug = post.slug || '';
    const postCategory = (post.category || 'general').toLowerCase().trim();

    // 1. 先按 slug 匹配
    for (const [key, img] of Object.entries(SLUG_IMAGE_MAP)) {
      if (postSlug.includes(key)) {
        return img;
      }
    }

    // 2. 再按分类匹配
    if (CATEGORY_IMAGE_MAP[postCategory]) {
      return CATEGORY_IMAGE_MAP[postCategory];
    }

    // 3. 默认返回 general
    return '/images/blog/general.jpg';
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-400 mb-4">
            {locale === 'zh' ? '文章未找到' : locale === 'ar' ? 'لم يتم العثور على المقالة' : 'Blog post not found'}
          </div>
          <a href={`/${locale}/blog`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            {locale === 'zh' ? '返回博客列表' : locale === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
          </a>
        </div>
      </div>
    );
  }

  const content = blog.content?.[locale as 'en' | 'zh' | 'ar'] || '';

  // 调试日志 (v147)
  console.log(`[v147] Detail page: slug="${blog.slug}" category="${(blog.category || 'general').toLowerCase()}" → image="${getInlineBlogDetailImage(blog)}"`);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <a href={`/${locale}/blog`} className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            {locale === 'zh' ? '返回博客' : locale === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
          </a>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            {locale === 'zh' ? blog.title.zh : locale === 'ar' ? blog.title.ar : blog.title.en}
          </h1>
          <div className="flex items-center gap-4 text-sm text-blue-200">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(blog.publishedAt || blog.createdAt, locale)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {blog.author || 'Admin'}
            </span>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          <img
            src={getInlineBlogDetailImage(blog)}
            alt={locale === 'zh' ? blog.title.zh : locale === 'ar' ? blog.title.ar : blog.title.en}
            className="w-full h-64 object-cover rounded-xl mb-8"
            onError={(e) => {
              // 简化 onError：只替换 src 到 general.jpg
              const target = e.target as HTMLImageElement;
              const fallbackSrc = '/images/blog/general.jpg';
              if (!target.src.includes(fallbackSrc)) {
                console.warn(`[v147] Detail image load failed, using fallback: ${target.src}`);
                target.src = fallbackSrc;
              }
            }}
          />

          {/* Render content (HTML from rich text editor) */}
          <div
            className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: content }}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {locale === 'zh' ? '最新文章' : locale === 'ar' ? 'أحدث المقالات' : 'Recent Posts'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentBlogs.map((post, idx) => (
              <a
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <img
                  src={getInlineBlogImage(post, idx)}
                  alt=""
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // 简化 onError：只替换 src 到 general.jpg
                    const target = e.target as HTMLImageElement;
                    const fallbackSrc = '/images/blog/general.jpg';
                    if (!target.src.includes(fallbackSrc)) {
                      console.warn(`[v147] Recent post image load failed, using fallback: ${target.src}`);
                      target.src = fallbackSrc;
                    }
                  }}
                />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {locale === 'zh' ? post.title.zh : locale === 'ar' ? post.title.ar : post.title.en}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(post.publishedAt || post.createdAt, locale)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
