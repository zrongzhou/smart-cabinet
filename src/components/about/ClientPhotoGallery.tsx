'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ClientPhotoGallery — Auto-playing Slideshow (v5)
 * -------------------------------------------------
 * Replaces the static 14-image grid (which left 2 empty slots on a
 * 4-column layout) with an animated, auto-advancing slideshow.
 *
 * Why this is safe (lessons from the earlier white-screen saga):
 *  - Native <img>, NOT next/image  → no deviceSizes 400 / optimisation issues
 *  - Crossfade via `opacity` only   → the ACTIVE image is ALWAYS opacity-100,
 *    it is never hidden, so there is no "stuck on blank" state
 *  - No translateX / flex / RTL-flip / touch-swipe carousel logic
 *  - Dark stage background (bg-gray-900) → transitions never flash white
 *  - Autoplay timer lives only in useEffect (client-side), no SSR mismatch
 *
 * Behaviour:
 *  - One photo on stage at a time, crossfade + subtle Ken-Burns zoom
 *  - Auto-advances every 4.5s, loops through all 14 photos
 *  - Pauses on hover / focus; resumes on leave
 *  - Prev / Next arrows + clickable dot indicators + "01 / 14" counter
 *  - per-image onError fallback (grey placeholder)
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

const TOTAL = PHOTOS.length;
const INTERVAL_MS = 4500;

export default function ClientPhotoGallery({ t, locale }: ClientPhotoGalleryProps) {
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState<Set<number>>(new Set());
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex(((next % TOTAL) + TOTAL) % TOTAL);
  }, []);

  // Autoplay — only runs on the client, cleared on pause/unmount.
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % TOTAL);
    }, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  const isRtl = locale === 'ar';

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="absolute top-0 start-0 end-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-70" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
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

        {/* Stage */}
        <div
          className="relative aspect-[4/3] sm:aspect-[16/9] overflow-hidden rounded-2xl bg-gray-900 shadow-2xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {PHOTOS.map((src, i) => {
            const active = i === index;
            const isBroken = broken.has(i);
            return (
              <div
                key={src}
                aria-hidden={!active}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  active ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {isBroken ? (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400">
                    <svg
                      className="mb-2 w-10 h-10 opacity-50"
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={`Customer site visit ${i + 1} — smart cabinet in use`}
                    width={960}
                    height={540}
                    loading={i <= 1 ? 'eager' : 'lazy'}
                    decoding="async"
                    className={`h-full w-full object-cover ${
                      active ? 'animate-[sc-kenburns_5s_ease-out_forwards]' : ''
                    }`}
                    onError={() => setBroken((prev) => new Set(prev).add(i))}
                  />
                )}
              </div>
            );
          })}

          {/* Prev / Next arrows (logical insets → auto-flip in RTL) */}
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous photo"
            className="absolute top-1/2 -translate-y-1/2 start-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30"
          >
            <svg className="h-6 w-6 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next photo"
            className="absolute top-1/2 -translate-y-1/2 end-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30"
          >
            <svg className="h-6 w-6 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 end-3 z-20 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {String(index + 1).padStart(2, '0')} / {String(TOTAL).padStart(2, '0')}
          </div>

          {/* Autoplay progress bar (remounts per slide → restarts animation) */}
          <div className="absolute bottom-0 start-0 end-0 z-20 h-1 bg-white/10">
            <div
              key={index}
              className="h-full bg-blue-400/80 animate-[sc-progress_4.5s_linear_forwards]"
            />
          </div>
        </div>

        {/* Dot indicators */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {PHOTOS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-blue-500' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          &copy; Guangzhou Qiuyan Technology
        </p>
      </div>

      {/* Keyframes (global injection, single component instance) */}
      <style>{`
        @keyframes sc-kenburns {
          from { transform: scale(1.02); }
          to   { transform: scale(1.12); }
        }
        @keyframes sc-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}
