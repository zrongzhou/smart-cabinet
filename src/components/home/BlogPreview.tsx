'use client';

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
    <section className="py-20 px-6 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 bg-blue-600/10 text-blue-600 rounded-full text-sm font-semibold mb-4">
            {t('blog.preview.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('blog.preview.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('blog.preview.subtitle')}
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <a
              key={post.slug}
              href={`/${currentLocale}/blog/${post.slug}`}
              className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 block border border-gray-100"
            >
              {/* Post Image */}
              {post.image ? (
                <div className="relative h-48 overflow-hidden bg-gray-100">
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
                  {/* Fallback */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ display: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}
                  >
                    <span className="text-white font-bold text-lg text-center px-4">
                      {currentLocale === 'zh' ? post.title.zh : post.title.en}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                </div>
              ) : (
                <div
                  className="h-48 flex items-center justify-center relative overflow-hidden"
                  style={{ background: index % 3 === 0
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
              <div className="p-6">
                {/* Meta info - using text icons instead of Lucide */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold">📅</span>
                    <span>{new Date(post.date).toLocaleDateString(currentLocale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold">👤</span>
                    <span>{post.author}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                  {currentLocale === 'zh' ? post.title.zh : post.title.en}
                </h3>

                {/* Summary */}
                <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                  {currentLocale === 'zh' ? post.summary.zh : post.summary.en}
                </p>

                {/* Read More Link */}
                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                  <span>{t('blog.preview.readMore')}</span>
                  <svg className="ml-1.5 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <a
            href={`/${currentLocale}/blog`}
            className="group inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:-translate-y-1 text-lg"
          >
            {t('blog.preview.viewAll')}
            <svg className="ml-2.5 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
