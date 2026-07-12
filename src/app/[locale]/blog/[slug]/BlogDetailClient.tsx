'use client';

import { Calendar, User, ArrowLeft, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import BlogFaqSection, { type BlogFaqItem } from './BlogFaqSection';

/**
 * Blog detail DTO —— 由服务端 page.tsx 构造并作为 props 传入。
 * 所有本地化字段已在服务端解析，组件直接渲染，SSR HTML 即包含正文。
 */
export interface BlogDetailDTO {
  id: string;
  slug: string;
  title: { en: string; zh: string; ar: string };
  excerpt?: { en: string; zh: string; ar: string };
  content?: { en: string; zh: string; ar: string };
  author?: string;
  publishedAt?: string;
  image?: string | null;
  tags: { id: string; slug: string; name: { en: string; zh: string; ar: string } }[];
  /** Blog-level structured FAQ list: [{ question: {en,zh,ar}, answer: {en,zh,ar} }]. */
  faq?: { question: { en: string; zh: string; ar: string }; answer: { en: string; zh: string; ar: string } }[];
}

interface BlogDetailClientProps {
  blog: BlogDetailDTO | null;
  recentBlogs: BlogDetailDTO[];
}

export default function BlogDetailClient({ blog, recentBlogs }: BlogDetailClientProps) {
  const { locale } = useLocale();

  // v151 图片方案：按 slug 精确匹配
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

  /**
   * V8.7 fix (bug 7): split a blog post's rich-text HTML into the article body
   * and its trailing FAQ block. Blogs embed a `<h2>FAQ</h2>` (or the localized
   * equivalent) at the end; we render the FAQ separately so it isn't glued to
   * the body copy. Returns the body and the FAQ HTML (heading stripped — we
   * render our own styled heading).
   */
  function splitBlogFaq(html: string): { body: string; faq: string | null } {
    const markers = ['<h2>FAQ</h2>', '<h2>常见问题</h2>', '<h2>الأسئلة الشائعة</h2>'];
    for (const m of markers) {
      const idx = html.indexOf(m);
      if (idx !== -1) {
        const faq = html.slice(idx + m.length).replace(/^\s+/, '');
        return { body: html.slice(0, idx), faq };
      }
    }
    return { body: html, faq: null };
  }

  /**
   * TASK 4 (plan b): parse a blog FAQ HTML block (the markup extracted
   * by `splitBlogFaq`, i.e. everything after `<h2>FAQ</h2>`) into
   * structured { question, answer, category }[] items for <BlogFaqSection>.
   *
   * The FAQ block is authored as a series of <p>/<div>/<li> entries,
   * typically `<p><strong>Question?</strong><br/>Answer…</p>`. We:
   *   - split on top-level <p>/<div>/<li> blocks,
   *   - take the <strong>/<b> text as the question (or split on the
   *     first <br> when no emphasis is used),
   *   - take the remaining text as the answer,
   *   - strip all HTML so the answer renders as plain text in the accordion.
   *
   * This is a pure string parser (no DOMParser / window) so it is safe
   * during SSR. If the block has NO question markers at all (i.e. it is
   * just free prose), we return [] and the caller falls back to the legacy
   * prose `.blog-faq` rendering — preserving behaviour for old posts.
   */
  function stripHtml(s: string): string {
    return s
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseBlogFaqItems(html: string): BlogFaqItem[] {
    if (!html) return [];
    const items: BlogFaqItem[] = [];
    let foundStructured = false;

    const blockRegex = /<(p|div|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let m: RegExpExecArray | null;
    while ((m = blockRegex.exec(html)) !== null) {
      const inner = m[2] || '';
      if (!inner.trim()) continue;

      const strongMatch = inner.match(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/i);
      let question = '';
      let answer = '';

      if (strongMatch) {
        question = stripHtml(strongMatch[2]);
        const withoutStrong = inner.replace(strongMatch[0], '');
        answer = stripHtml(withoutStrong);
        foundStructured = true;
      } else {
        const brSplit = inner.split(/<br\s*\/?>/i);
        if (brSplit.length > 1) {
          question = stripHtml(brSplit[0]);
          answer = stripHtml(brSplit.slice(1).join(' '));
          foundStructured = true;
        }
        // else: a plain prose paragraph with no question marker — skip it
        // so we keep the legacy prose rendering as the fallback.
      }

      // Drop any leading separator (colon / dash / middot) that may have
      // been carried over from the answer text.
      question = question.replace(/^[\s:：\-–—·]+/, '').trim();
      answer = answer.replace(/^[\s:：\-–—·]+/, '').trim();

      if (question) {
        items.push({ question, answer, category: 'blog' });
      }
    }

    // Only switch to the structured accordion when we actually found
    // question markers; otherwise keep the original prose block.
    return foundStructured ? items : [];
  }

  const FAQ_HEADING: Record<string, string> = {
    en: 'Frequently Asked Questions',
    zh: '常见问题',
    ar: 'الأسئلة الشائعة',
  };

  // Recent Posts 图片选择 - 按 slug 匹配
  function getInlineBlogImage(post: BlogDetailDTO, index: number): string {
    const postSlug = post.slug || '';
    if (SLUG_TO_IMAGE[postSlug]) return SLUG_TO_IMAGE[postSlug];
    if (post.image && post.image.startsWith('/images/') && !post.image.endsWith('.svg')) return post.image;
    return BLOG_IMAGE_FALLBACKS[index % BLOG_IMAGE_FALLBACKS.length];
  }

  // 详情页图片选择 - 按 slug 匹配
  function getInlineBlogDetailImage(post: BlogDetailDTO): string {
    const postSlug = post.slug || '';
    if (SLUG_TO_IMAGE[postSlug]) return SLUG_TO_IMAGE[postSlug];
    if (post.image && post.image.startsWith('/images/') && !post.image.endsWith('.svg')) return post.image;
    // fallback
    let hash = 0;
    for (let i = 0; i < postSlug.length; i++) hash = ((hash << 5) - hash) + postSlug.charCodeAt(i);
    return BLOG_IMAGE_FALLBACKS[Math.abs(hash) % BLOG_IMAGE_FALLBACKS.length];
  }

  function formatDate(dateString: string, loc: string = 'en'): string {
    const date = new Date(dateString);
    if (loc === 'zh') {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
    if (loc === 'ar') {
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

  // 服务端已保证 blog 存在（无效 slug 由 page.tsx 调用 notFound）；
  // 此处再兜底一次，避免客户端边界情况。
  if (!blog) {
    notFound();
  }

  const content = blog!.content?.[locale as 'en' | 'zh' | 'ar'] || '';

  // V8.11: prefer the structured blog-level FAQ list (edited via the admin UI).
  // Each entry carries trilingual question/answer; we pick the current locale,
  // falling back to English, and drop empty entries.
  const structuredFaqs: BlogFaqItem[] = Array.isArray(blog!.faq)
    ? (blog!.faq as any[])
        .map((f: any) => ({
          question:
            f?.question?.[locale as 'en' | 'zh' | 'ar'] ||
            f?.question?.en ||
            '',
          answer:
            f?.answer?.[locale as 'en' | 'zh' | 'ar'] ||
            f?.answer?.en ||
            '',
          category: 'blog',
        }))
        .filter((f: BlogFaqItem) => f.question.trim() !== '' || f.answer.trim() !== '')
    : [];

  // Legacy fallback: parse the trailing <h2>FAQ</h2> block out of the body HTML
  // (preserves the old-blog experience for posts without a structured FAQ).
  const { body, faq } = splitBlogFaq(content);
  const legacyFaqItems = faq ? parseBlogFaqItems(faq) : [];
  const bodyHtml = injectCoverImageInContent(body, getInlineBlogDetailImage(blog!));

  // Render priority: structured FAQ → legacy parsed FAQ → legacy prose block.
  const faqToRender: BlogFaqItem[] =
    structuredFaqs.length > 0 ? structuredFaqs : legacyFaqItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Page Header with background image — v151: 移除 bg-gradient-to-br 避免覆盖背景图 */}
      <section
        className="relative text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage: `url(${getInlineBlogDetailImage(blog!)})`,
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
            {locale === 'zh' ? blog!.title.zh : locale === 'ar' ? blog!.title.ar : blog!.title.en}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-blue-200">
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4" />
              {formatDate(blog!.publishedAt || new Date().toISOString(), locale)}
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <User className="w-4 h-4" />
              {blog!.author || 'Admin'}
            </span>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-slate-700">

          {/* Render content (HTML from rich text editor) — v152: 注入正文配图 */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-20 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:font-medium hover:prose-a:text-blue-700 prose-img:rounded-xl prose-img:my-8 prose-li:my-1 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-strong:text-gray-900 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {/* TASK 4: FAQ — structured accordion (mirrors ProductFaqSection).
              When we can parse the body FAQ block into Q/A items we render
              the elegant <BlogFaqSection> accordion; otherwise we keep the
              legacy prose `.blog-faq` block so older posts still show FAQ. */}
          {faqToRender.length > 0 ? (
            <BlogFaqSection faqs={faqToRender} locale={locale} />
          ) : (
            faq && (
              <section
                className="mt-10 pt-8 border-t border-gray-200 dark:border-slate-700"
                aria-label={FAQ_HEADING[locale] || FAQ_HEADING.en}
              >
                <h2 className="mb-5 flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
                  <span className="h-1 w-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-400" />
                  {FAQ_HEADING[locale] || FAQ_HEADING.en}
                </h2>
                <div className="blog-faq" dangerouslySetInnerHTML={{ __html: faq }} />
              </section>
            )
          )}

          <style jsx global>{`
            .blog-faq p {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 14px 18px;
              margin: 0 0 12px;
            }
            .dark .blog-faq p {
              background: #1e293b;
              border-color: #334155;
            }
            .blog-faq p strong {
              display: block;
              color: #2563eb;
              font-weight: 700;
              margin-bottom: 4px;
            }
            .blog-faq p br {
              display: none;
            }
          `}</style>

          {/* Share buttons */}
          <div className="flex items-center gap-4 mt-12 pt-8 border-t border-gray-200">
            <span className="text-sm text-gray-500">{locale === 'zh' ? '分享：' : locale === 'ar' ? 'مشاركة:' : 'Share:'}</span>
            <button
              className="p-2 bg-gray-100 hover:bg-[#1DA1F2] hover:text-white rounded-full transition-colors"
              onClick={() => {
                const url = window.location.href;
                const title = blog!.title[locale] || blog!.title.en;
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank', 'noopener,noreferrer');
              }}
              aria-label={locale === 'zh' ? '分享到 Twitter' : 'Share on Twitter'}
            >
              <Twitter className="w-5 h-5 text-gray-600 hover:text-white" />
            </button>
            <button
              className="p-2 bg-gray-100 hover:bg-[#1877F2] hover:text-white rounded-full transition-colors"
              onClick={() => {
                const url = window.location.href;
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
              }}
              aria-label={locale === 'zh' ? '分享到 Facebook' : 'Share on Facebook'}
            >
              <Facebook className="w-5 h-5 text-gray-600 hover:text-white" />
            </button>
            <button
              className="p-2 bg-gray-100 hover:bg-[#0A66C2] hover:text-white rounded-full transition-colors"
              onClick={() => {
                const url = window.location.href;
                const title = blog!.title[locale] || blog!.title.en;
                window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank', 'noopener,noreferrer');
              }}
              aria-label={locale === 'zh' ? '分享到 LinkedIn' : 'Share on LinkedIn'}
            >
              <Linkedin className="w-5 h-5 text-gray-600 hover:text-white" />
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
                      {formatDate(post.publishedAt || new Date().toISOString(), locale)}
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
