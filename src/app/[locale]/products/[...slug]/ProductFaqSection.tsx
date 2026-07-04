'use client';

/**
 * ProductFaqSection.tsx (v265)
 * 产品详情页的可折叠 FAQ 区块。使用原生 <details>/<summary>，避免引入第三方依赖。
 * 支持 RTL 适配（locale === 'ar' 时 dir="rtl"）。
 * 若无传入 FAQ 则渲染 null。
 */

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

interface ProductFaqSectionProps {
  faqs: FaqItem[];
  locale: 'en' | 'zh' | 'ar';
}

const HEADING: Record<'en' | 'zh' | 'ar', string> = {
  en: 'Frequently Asked Questions',
  zh: '常见问题',
  ar: 'الأسئلة الشائعة',
};

export default function ProductFaqSection({ faqs, locale }: ProductFaqSectionProps) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const isRtl = locale === 'ar';

  return (
    <section
      dir={isRtl ? 'rtl' : 'ltr'}
      className="mx-auto mt-12 max-w-4xl px-4"
      aria-label={HEADING[locale]}
    >
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        {HEADING[locale]}
      </h2>

      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
        {faqs.map((faq, idx) => (
          <details key={idx} className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
              <span>{faq.question}</span>
              <span className="ml-4 shrink-0 text-blue-600 transition-transform group-open:rotate-45 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
