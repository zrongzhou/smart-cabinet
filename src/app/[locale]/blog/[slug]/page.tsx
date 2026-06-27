'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, ArrowLeft, ArrowRight, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchBlogBySlug, fetchBlogs, BlogPost } from '@/lib/api';

interface BlogDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { locale } = useLocale();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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
        setBlog(blogRes || null);
        // Get recent blogs (exclude current)
        if (blogsRes.data) {
          setRecentBlogs(
            blogsRes.data
              .filter((b: BlogPost) => b.slug !== slug)
              .slice(0, 3)
          );
        }
      } catch (e) {
        console.error('Failed to load blog:', e);
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
          {blog.image && (
            <img
              src={blog.image}
              alt={locale === 'zh' ? blog.title.zh : locale === 'ar' ? blog.title.ar : blog.title.en}
              className="w-full h-64 object-cover rounded-xl mb-8"
            />
          )}

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
            {recentBlogs.map((post) => (
              <a
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {post.image ? (
                  <img src={post.image} alt="" className="w-full h-48 object-cover" />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <div className="text-white/80 text-4xl">📄</div>
                  </div>
                )}
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
