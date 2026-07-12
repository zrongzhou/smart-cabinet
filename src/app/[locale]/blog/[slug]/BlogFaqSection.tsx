'use client';

/**
 * BlogFaqSection.tsx (TASK 4 — plan (b))
 * ----------------------------------------------
 * Structured FAQ accordion for the blog detail page, mirroring the product
 * page's <ProductFaqSection> look & feel:
 *  - native <details>/<summary> (no third-party dependency)
 *  - RTL aware (dir="rtl" when locale === 'ar')
 *  - localized heading per locale
 *
 * Data source: this component is fed structured { question, answer, category }[]
 * items (parsed from the blog body's <h2>FAQ</h2> block by the
 * detail client). When no items are supplied it renders nothing, so the
 * caller can fall back to the legacy prose FAQ block for older posts.
 */

export interface BlogFaqItem {
  question: string;
  answer: string;
  category: string;
}

interface BlogFaqSectionProps {
  faqs: BlogFaqItem[];
  locale: 'en' | 'zh' | 'ar';
}

const HEADING: Record<'en' | 'zh' | 'ar', string> = {
  en: 'Frequently Asked Questions',
  zh: '常见问题',
  ar: 'الأسئلة الشائعة',
};

export default function BlogFaqSection({ faqs, locale }: BlogFaqSectionProps) {
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
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
        <span className="h-1 w-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-400" />
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
