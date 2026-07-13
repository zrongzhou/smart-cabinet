'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';

/**
 * ClientPhotoGallery
 * ------------------
 * A responsive photo gallery that showcases real-world photos of customers
 * visiting, operating and discussing our smart cabinet products on site.
 *
 * Design notes:
 *  - Responsive grid: 2 cols (mobile) / 3 cols (tablet) / 4 cols (desktop), gap 16px.
 *  - Each photo card: rounded-xl, overflow-hidden, uniform 3:2 ratio, a gentle
 *    lift + shadow on hover, and a subtle scale on the image itself.
 *  - Images use the Next.js <Image> component with a blur placeholder so they
 *    fade in crisply once loaded.
 *  - Entrance animation: staggered fade-up driven by IntersectionObserver.
 *  - i18n: title / subtitle are resolved via the `t()` prop so the section is
 *    fully localised (en / zh / ar).
 *  - RTL-safe: the section is centre-aligned and uses logical-friendly layout.
 */

interface ClientPhotoGalleryProps {
  /** Translation function provided by the page (key -> localized string). */
  t: (key: string) => string;
  /** Active locale, e.g. 'en' | 'zh' | 'ar'. */
  locale: string;
}

/**
 * Shared blur placeholder (a tiny grey SVG). Used by every <Image> so the
 * gallery fades in from a neutral tone instead of flashing empty space.
 */
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxNSI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjY2JkNWUxIi8+PC9zdmc+';

/** Ordered list of gallery photos (client-01 … client-14). */
const PHOTOS: string[] = Array.from(
  { length: 14 },
  (_, i) => `/images/about/clients/client-${String(i + 1).padStart(2, '0')}.png`,
);

export default function ClientPhotoGallery({ t, locale }: ClientPhotoGalleryProps) {
  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50 relative overflow-hidden"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Decorative top divider — subtle slate gradient */}
      <div className="absolute top-0 start-0 end-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-70" />

      <style>{`
        .gallery-card {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.3s ease;
          will-change: opacity, transform;
        }
        .gallery-card.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Centered section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('about.gallery.title')}
          </h2>
          {/* Gradient underline */}
          <div
            className="w-24 h-1.5 mx-auto rounded-full"
            style={{ background: 'linear-gradient(90deg, #64748b, #94a3b8, #cbd5e1)' }}
          />
          <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            {t('about.gallery.subtitle')}
          </p>
        </div>

        {/* Responsive photo grid: 2 / 3 / 4 columns, 16px gap */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {PHOTOS.map((src, idx) => (
            <GalleryCard key={src} src={src} index={idx} blurDataURL={BLUR_DATA_URL} />
          ))}
        </div>

        {/* Optional footer credit */}
        <p className="mt-10 text-center text-xs text-gray-400">
          © Guangzhou Qiuyan Technology
        </p>
      </div>
    </section>
  );
}

/**
 * Individual gallery photo card.
 * Encapsulates its own IntersectionObserver so it can animate in with a
 * staggered delay once it scrolls into view.
 */
function GalleryCard({
  src,
  index,
  blurDataURL,
}: {
  src: string;
  index: number;
  blurDataURL: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // Respect users who prefer reduced motion.
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Staggered reveal: 80ms per card, capped so later cards don't wait too long.
            const delay = Math.min(index, 11) * 80;
            window.setTimeout(() => el.classList.add('is-visible'), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="gallery-card group relative overflow-hidden rounded-xl bg-gray-100 aspect-[3/2] hover:-translate-y-1 hover:shadow-xl"
    >
      <Image
        src={src}
        alt="Customer site visit — smart cabinet in use"
        width={600}
        height={400}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        placeholder="blur"
        blurDataURL={blurDataURL}
      />
    </div>
  );
}
