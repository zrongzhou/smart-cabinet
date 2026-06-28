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

// Cracked Glass Card wrapper - applies the shattered glass texture
function CrackedGlassCard({ children, className = '', href }: { children: React.ReactNode; className?: string; href: string }) {
  return (
    <motion.a
      href={href}
      variants={fadeInUp}
      whileHover={{ y: -8, scale: 1.01 }}
      className={`group relative overflow-hidden block ${className}`}
      style={{
        borderRadius: '16px',
        // Base glass effect
        background: 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(248,250,252,0.75) 50%, rgba(240,245,255,0.6) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(200,215,235,0.5)',
        boxShadow: '0 4px 24px rgba(30,41,59,0.08), 0 1px 3px rgba(30,41,59,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      }}
    >
      {/* Crack pattern overlay - SVG-based subtle shatter lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ mixBlendMode: 'overlay', opacity: 0.35 }}
      >
        {/* Main crack lines - numeric coords for viewBox 0-100 */}
        <g stroke="rgba(100,120,160,0.4)" strokeWidth="0.6" fill="none" strokeLinecap="round">
          {/* Primary crack from upper right */}
          <path d="M100 0 L85 12 L92 28 L78 42 L86 58 L72 78 L82 95 L68 100" />
          <path d="M85 12 L70 18 L76 32 L62 48 L70 65 L55 82" />
          <path d="M92 28 L80 36 L88 52 L74 68 L84 85 L68 98" />
          <path d="M78 42 L64 50 L72 66 L56 84 L66 96" />
          {/* Secondary micro-cracks */}
          <path d="M70 18 L58 25 L66 38 L52 55 L60 72 L45 88" strokeWidth="0.4" />
          <path d="M80 36 L68 44 L76 58 L60 76 L70 90" strokeWidth="0.4" />
          <path d="M64 50 L52 58 L60 72 L46 88" strokeWidth="0.4" />
          {/* Tertiary fine cracks */}
          <path d="M76 32 L66 38 L72 48 L60 60 L68 74 L54 88" strokeWidth="0.25" opacity="0.6" />
          <path d="M88 52 L78 60 L84 74 L70 88 L78 98" strokeWidth="0.25" opacity="0.6" />
          <path d="M55 82 L46 90 L52 100" strokeWidth="0.3" opacity="0.5" />
        </g>
        {/* Crack nodes (impact points) */}
        <g fill="rgba(150,170,200,0.25)">
          <circle cx="85" cy="12" r="1.5" />
          <circle cx="92" cy="28" r="1" />
          <circle cx="78" cy="42" r="1.2" />
          <circle cx="70" cy="18" r="0.8" />
          <circle cx="80" cy="36" r="0.9" />
        </g>
      </svg>

      {/* Glass reflection / sheen layer - top-left highlight */}
      <div
        className="absolute inset-0 pointer-events-none z-20 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          opacity: 0.5,
          background: `linear-gradient(135deg,
            rgba(255,255,255,0.4) 0%,
            rgba(255,255,255,0.15) 20%,
            transparent 40%,
            transparent 60%,
            rgba(255,255,255,0.05) 100%)`,
        }}
      />

      {/* Bottom edge light catch (like thick glass edge) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none z-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 70%, transparent 100%)',
        }}
      />

      {/* Inner shadow for depth (top edge dark) */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none z-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(150,170,200,0.2) 20%, rgba(150,170,200,0.3) 50%, rgba(150,170,200,0.2) 80%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-[5]">{children}</div>

      {/* Hover shimmer animation across cracks */}
      <style>{`
        @keyframes crack-shimmer {
          0% { opacity: 0.25; }
          50% { opacity: 0.5; }
          100% { opacity: 0.25;
        }
      `}</style>
    </motion.a>
  );
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
    <section className="py-24 px-6 relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 50%, #f0f4ff 100%)',
    }}>
      {/* Background decoration - subtle radial glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(99,102,241,0.04)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(59,130,246,0.04)' }} />

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

        {/* Blog Posts Grid - Cracked Glass Cards */}
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogPosts.map((post) => (
            <CrackedGlassCard key={post.slug} href={`/${currentLocale}/blog/${post.slug}`}>
              {/* Post Image */}
              {post.image ? (
                <div className="relative h-48 overflow-hidden">
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
                  {/* Fallback gradient */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ display: 'none', background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
                  >
                    <span className="text-white font-bold text-lg text-center px-4">
                      {currentLocale === 'zh' ? post.title.zh : post.title.en}
                    </span>
                  </div>
                  {/* Image overlay for glass integration */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div
                  className="h-48 flex items-center justify-center relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)' }}
                >
                  <div className="absolute inset-0 opacity-15">
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
                      style={{
                        background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                      }}
                    >
                      {post.tags[0]}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300 leading-tight">
                  {currentLocale === 'zh' ? post.title.zh : post.title.en}
                </h3>

                {/* Summary */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {currentLocale === 'zh' ? post.summary.zh : post.summary.en}
                </p>

                {/* Meta info */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <CalendarIcon className="w-4 h-4 text-blue-400" />
                    <span>{new Date(post.date).toLocaleDateString(currentLocale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <UserIcon className="w-4 h-4 text-blue-400" />
                    <span>{post.author}</span>
                  </div>
                </div>

                {/* Read More Link */}
                <div className="flex items-center font-semibold text-sm text-blue-600 group-hover:text-blue-700">
                  <span>{t('blog.preview.readMore')}</span>
                  <ArrowRightIcon className="ml-1.5 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </CrackedGlassCard>
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
            className="group inline-flex items-center px-10 py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)',
              boxShadow: '0 4px 14px rgba(30, 58, 95, 0.3)',
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
