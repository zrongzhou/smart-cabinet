'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ClientPhotoGallery
 * ------------------
 * A responsive carousel that showcases real-world photos of customers visiting,
 * operating and discussing our smart cabinet products on site.
 *
 * Design notes:
 *  - Carousel: slides per view 1 (mobile) / 2 (tablet) / 3 (desktop) / 4 (wide).
 *  - Auto-play every 5s, paused on hover and disabled under prefers-reduced-motion.
 *  - Touch / drag support (swipe left-right on mobile).
 *  - Prev/next arrows + dot indicators.
 *  - Entrance fade-up via a pure-CSS mount animation (gallery-reveal) so the
 *    section is ALWAYS visible — it never relies on JS/IntersectionObserver to
 *    reveal content (prevents the "blank section" failure mode).
 *  - i18n: title / subtitle resolved via the `t()` prop (en / zh / ar).
 *  - RTL-safe: arrows and slide direction flip for Arabic.
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
  (_, i) => `/images/about/clients/client-${String(i + 1).padStart(2, '0')}.jpg`,
);

/** Number of slides visible at once, by breakpoint. */
function getPerView(): number {
  if (typeof window === 'undefined') return 3;
  const w = window.innerWidth;
  if (w < 640) return 1;
  if (w < 1024) return 2;
  if (w < 1280) return 3;
  return 4;
}

export default function ClientPhotoGallery({ t, locale }: ClientPhotoGalleryProps) {
  const isRtl = locale === 'ar';
  const [perView, setPerView] = useState(3);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDelta = useRef(0);

  const maxIndex = Math.max(0, PHOTOS.length - perView);

  // Responsive per-view + reduced-motion + in-view detection for autoplay.
  // NOTE: visibility is handled purely by CSS (gallery-reveal), so content is
  // always shown regardless of whether this observer fires.
  useEffect(() => {
    const update = () => setPerView(getPerView());
    update();
    window.addEventListener('resize', update);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) setIsPlaying(false);

    const el = sectionRef.current;
    if (el) {
      const observer = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
        { threshold: 0.1 },
      );
      observer.observe(el);
      return () => {
        window.removeEventListener('resize', update);
        observer.disconnect();
      };
    }

    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  // Clamp current when perView changes
  useEffect(() => {
    setCurrent((c) => Math.min(c, maxIndex));
  }, [maxIndex]);

  const goTo = useCallback(
    (next: number) => {
      setCurrent(Math.max(0, Math.min(next, maxIndex)));
    },
    [maxIndex],
  );

  const step = useCallback(
    (dir: number) => {
      // dir: +1 = forward (next), -1 = back (prev)
      setCurrent((c) => {
        let n = c + dir;
        if (n > maxIndex) n = 0;
        if (n < 0) n = maxIndex;
        return n;
      });
    },
    [maxIndex],
  );

  // Auto-play — only after the section scrolls into view (progressive enhancement)
  useEffect(() => {
    if (!isPlaying || !inView) return;
    const id = window.setInterval(() => step(1), 5000);
    return () => window.clearInterval(id);
  }, [isPlaying, inView, step]);

  // Pause auto-play on hover
  const pause = () => setIsPlaying(false);
  const resume = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) setIsPlaying(true);
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null) return;
    const delta = touchDelta.current;
    if (Math.abs(delta) > 50) {
      // swipe left (delta<0) -> next; swipe right (delta>0) -> prev
      const dir = delta < 0 ? 1 : -1;
      step(isRtl ? -dir : dir);
    }
    touchStartX.current = null;
    touchDelta.current = 0;
  };

  const cardWidthPct = 100 / perView;
  // For RTL, translateX is negative of the forward offset
  const offsetPct = isRtl ? -current * cardWidthPct : current * cardWidthPct;

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/50 relative overflow-hidden gallery-reveal"
      dir={isRtl ? 'rtl' : 'ltr'}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="absolute top-0 start-0 end-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-70" />

      <style>{`
        .gallery-reveal {
          animation: galleryFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes galleryFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gallery-reveal { animation: none; }
        }
        .gallery-track {
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .gallery-card { cursor: grab; }
        .gallery-card:active { cursor: grabbing; }
      `}</style>

      <div className="max-w-7xl mx-auto">
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

        <div className="relative">
          {/* Prev / Next arrows */}
          <button
            type="button"
            aria-label={isRtl ? 'Next' : 'Previous'}
            onClick={() => step(isRtl ? 1 : -1)}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-slate-700 hover:bg-white hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label={isRtl ? 'Previous' : 'Next'}
            onClick={() => step(isRtl ? -1 : 1)}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-slate-700 hover:bg-white hover:text-blue-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Viewport */}
          <div
            className="overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              ref={trackRef}
              className="gallery-track flex"
              style={{ transform: `translateX(${isRtl ? '' : '-'}${offsetPct}%)` }}
            >
              {PHOTOS.map((src, idx) => (
                <div
                  key={src}
                  className="gallery-card shrink-0 px-2"
                  style={{ width: `${cardWidthPct}%` }}
                >
                  <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[3/2] shadow-md hover:shadow-xl transition-shadow duration-300">
                    {brokenImages.has(idx) ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                        <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                        <span className="text-xs">Photo unavailable</span>
                      </div>
                    ) : (
                      <Image
                        src={src}
                        alt={`Customer site visit ${idx + 1} — smart cabinet in use`}
                        width={600}
                        height={400}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="h-full w-full object-cover"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        onError={() => setBrokenImages(prev => new Set(prev).add(idx))}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex justify-center items-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          © Guangzhou Qiuyan Technology
        </p>
      </div>
    </section>
  );
}
