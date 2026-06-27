'use client';

import { ArrowRight, Calendar, User } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import blogs from '@/data/blogs';

interface BlogPreviewProps {
  locale?: string;
}

export default function BlogPreview({ locale: propLocale }: BlogPreviewProps) {
  const { locale, t } = useLocale();
  const currentLocale = propLocale || locale;

  // Use real blog data from blogs.ts (first 3 posts for preview)
  const blogPosts = blogs.slice(0, 3).map(blog => ({
    slug: blog.slug,
    title: blog.title,
    summary: blog.excerpt,
    date: blog.publishedAt,
    author: blog.author,
    image: blog.image || '',
  }));

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt-bg)] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary-color)]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--primary-color)]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1 bg-[var(--badge-bg)] text-[var(--primary-color)] rounded-full text-sm font-semibold mb-4">
            {t('blog.preview.badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] mb-4 tracking-tight">
            {t('blog.preview.title')}
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            {t('blog.preview.subtitle')}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <a
              key={post.slug}
              href={`/${currentLocale}/blog/${post.slug}`}
              className="group bg-[var(--card-bg)] rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-3 hover:scale-[1.02] block"
            >
              {/* Post Image */}
              {post.image ? (
                <div className="relative h-52 overflow-hidden bg-[var(--section-alt-bg)]">
                  <img 
                    src={post.image} 
                    alt={currentLocale === 'zh' ? post.title.zh : post.title.en}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { 
                      const target = e.target as HTMLElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                    loading="lazy"
                  />
                  {/* Fallback - shown when img fails to load; use inline style to avoid Tailwind purge */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      display: 'none',
                      background: index % 3 === 0
                        ? 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)'
                        : index % 3 === 1
                          ? 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)'
                          : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                    }}
                  >
                    <span className="text-white font-bold text-lg text-center px-4">
                      {currentLocale === 'zh' ? post.title.zh : post.title.en}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                </div>
              ) : (
                <div
                  className="h-52 flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: index % 3 === 0
                      ? 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)'
                      : index % 3 === 1
                        ? 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)'
                        : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                  }}
                >
                  <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white/30 rounded-full" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white/30 rounded-lg rotate-12" />
                  <span className="relative z-10 text-white font-bold text-lg text-center px-4">
                    {currentLocale === 'zh' ? post.title.zh : post.title.en}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                {/* Meta info */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-[var(--text-muted)]">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString(currentLocale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-extrabold text-[var(--text-primary)] mb-3 line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors duration-300 leading-snug">
                  {currentLocale === 'zh' ? post.title.zh : post.title.en}
                </h3>

                {/* Summary */}
                <p className="text-sm text-[var(--text-secondary)] mb-6 line-clamp-3 leading-relaxed">
                  {currentLocale === 'zh' ? post.summary.zh : post.summary.en}
                </p>

                {/* Read More Link */}
                <div className="flex items-center text-[var(--primary-color)] font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                  <span>{t('blog.preview.readMore')}</span>
                  <ArrowRight className="ml-1.5 w-4 h-4" />
                </div>
              </div>

              {/* Hover border glow */}
              <div className="absolute inset-0 rounded-3xl ring-0 group-hover:ring-2 group-hover:ring-blue-500/30 transition-all duration-500 pointer-events-none" />
            </a>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <a
            href={`/${currentLocale}/blog`}
            className="group inline-flex items-center px-10 py-4 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
            style={{ background: 'linear-gradient(135deg, var(--primary-color, #2563eb) 0%, var(--primary-hover, #3b82f6) 100%)' }}
          >
            {t('blog.preview.viewAll')}
            <ArrowRight className="ml-2.5 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
          </a>
        </div>
      </div>
    </section>
  );
}
