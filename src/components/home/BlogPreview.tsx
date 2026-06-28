'use client';

import { useLocale } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { CalendarIcon, UserIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import blogs from '@/data/blogs';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const }
  }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

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
    tags: blog.tags || [],
  }));

  return (
    <section className="py-24 px-6 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('blog.preview.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('blog.preview.subtitle')}
          </p>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogPosts.map((post, index) => (
            <motion.a
              key={post.slug}
              href={`/${currentLocale}/blog/${post.slug}`}
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden block border border-gray-100"
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
                    style={{ display: 'none', background: 'linear-gradient(135deg, #1a365d 0%, #2a4a7f 100%)' }}
                  >
                    <span className="text-white font-bold text-lg text-center px-4">
                      {currentLocale === 'zh' ? post.title.zh : post.title.en}
                    </span>
                  </div>
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div
                  className="h-48 flex items-center justify-center relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #1a365d 0%, #2a4a7f 100%)' }}
                >
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white/30 rounded-full" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-white/30 rounded-lg rotate-12" />
                  </div>
                  <span className="relative z-10 text-white font-bold text-lg text-center px-4">
                    {currentLocale === 'zh' ? post.title.zh : post.title.en}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Tags */}
                {post.tags && post.tags[0] && (
                  <div className="mb-3">
                    <span
                      className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white rounded-md"
                      style={{ backgroundColor: '#1a365d' }}
                    >
                      {post.tags[0]}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-900 transition-colors duration-300 leading-tight">
                  {currentLocale === 'zh' ? post.title.zh : post.title.en}
                </h3>

                {/* Summary */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {currentLocale === 'zh' ? post.summary.zh : post.summary.en}
                </p>

                {/* Meta info - using Heroicons instead of emoji */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString(currentLocale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <UserIcon className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                </div>

                {/* Read More Link */}
                <div className="flex items-center font-semibold text-sm" style={{ color: '#f6ad55' }}>
                  <span>{t('blog.preview.readMore')}</span>
                  <ArrowRightIcon className="ml-1.5 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mt-16"
        >
          <motion.a
            href={`/${currentLocale}/blog`}
            whileHover={{ y: -4 }}
            className="group inline-flex items-center px-10 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            style={{
              background: 'linear-gradient(135deg, #1a365d 0%, #2a4a7f 100%)',
            }}
          >
            {t('blog.preview.viewAll')}
            <ArrowRightIcon className="ml-2.5 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
