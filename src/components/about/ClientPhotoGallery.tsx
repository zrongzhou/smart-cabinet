'use client';

import { useState } from 'react';

/**
 * ClientPhotoGallery — Static Grid (v4)
 * --------------------------------------
 * Shows 14 customer site photos in a responsive grid.
 *
 * Why static? The previous carousel implementation (translateX + flex +
 * RTL flip + touch swipe + autoplay) caused persistent white-screen bugs
 * on the Arabic /ar/about page across 3 fix attempts. Root cause was in
 * the carousel's complex SSR/hydration/RTL interaction that could not be
 * reliably diagnosed. A static grid eliminates ALL animation/transform/
 * state-driven positioning logic — photos are always visible.
 *
 * Design:
 *  - Mobile: 1-2 columns   (grid-cols-1 sm:grid-cols-2)
 *  - Tablet:  2-3 columns  (md:grid-cols-3)
 *  - Desktop: 3-4 columns  (lg:grid-cols-3 xl:grid-cols-4)
 *  - Each photo: aspect-[3/2], rounded-xl, shadow-md, hover lift
 *  - onError fallback: grey placeholder with icon + text
 */

interface ClientPhotoGalleryProps {
  t: (key: string) => string;
  locale: string;
}

/** Ordered list of gallery photos (client-01 … client-14). */
const PHOTOS: string[] = Array.from(
  { length: 14 },
  (_, i) => `/images/about/clients/client-${String(i + 1).padStart(2, '0')}.jpg`,
);

export default function ClientPhotoGallery({ t, locale }: ClientPhotoGalleryProps) {
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());
  const isRtl = locale === 'ar';

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="absolute top-0 start-0 end-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-70" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('about.gallery.title')}
          </h2>
          <div
            className="w-24 h-1.5 mx-auto rounded-full"
            style={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #cbd5e1)' }}
          />
          <p className="mt-5 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
            {t('about.gallery.subtitle')}
          </p>
        </div>

        {/* Photo Grid — no carousel, no animation, no transforms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {PHOTOS.map((src, idx) => (
            <div
              key={src}
              className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[3/2] shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              {brokenImages.has(idx) ? (
                /* Fallback when image fails to load */
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 min-h-[120px]">
                  <svg
                    className="w-10 h-10 mb-2 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                  <span className="text-xs">Photo unavailable</span>
                </div>
              ) : (
                <img
                  src={src}
                  alt={`Customer site visit ${idx + 1} — smart cabinet in use`}
                  width={640}
                  height={427}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                  onError={() =>
                    setBrokenImages((prev) => new Set(prev).add(idx))
                  }
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-gray-400">
          &copy; Guangzhou Qiuyan Technology
        </p>
      </div>
    </section>
  );
}
