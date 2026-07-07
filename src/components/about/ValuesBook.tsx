'use client';

/**
 * ValuesBook
 * ----------
 * Realistic two-page "book" that replaces the old single-card `ValuesBookFlip`.
 *
 * V8 visual fixes applied here:
 *  1. A genuine open-book layout: a left page + a right page joined by a centre
 *     spine with a highlight gradient, so it reads as a real book — not a card.
 *  2. Page turns use `transform: rotateY()` around the spine (`transform-origin`
 *     at the binding) with a gradient shadow that simulates paper thickness.
 *  3. Every page is content-rich: icon + title + description + a customer-value
 *     highlight line + a key-data chip — no more empty swinging cards.
 *  4. Keeps the 5s auto-flip plus Previous / Next / page indicators.
 *  5. Mirrors correctly under `ar` (RTL) by swapping the flip direction.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

export interface BookValueItem {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  highlightKey?: string;
  statKey?: string;
}

interface ValuesBookProps {
  values: BookValueItem[];
  t: (key: string) => string;
  locale: string;
}

/** A single book page face (used for front + back of the turning leaf). */
function PageFace({ value, t }: { value: BookValueItem; t: (key: string) => string }) {
  const Icon = value.icon;
  return (
    <div className="absolute inset-0 h-full w-full rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-slate-50 shadow-[inset_0_0_40px_rgba(59,130,246,0.04)] p-7 sm:p-10 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* top paper sheen */}
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(59,130,246,0.06), transparent)' }} />

      <div
        className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #818cf8 100%)', boxShadow: '0 12px 30px rgba(59,130,246,0.30)' }}
      >
        <Icon className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.6} />
      </div>

      <h3 className="relative z-10 text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t(value.titleKey)}</h3>
      <p className="relative z-10 text-sm sm:text-base leading-relaxed text-gray-600 max-w-md mx-auto">{t(value.descriptionKey)}</p>

      {value.highlightKey && (
        <p className="relative z-10 mt-4 flex items-start gap-1.5 text-sm text-blue-700/90 max-w-md mx-auto">
          <Quote className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" strokeWidth={1.8} />
          <span>{t(value.highlightKey)}</span>
        </p>
      )}

      {value.statKey && (
        <div className="relative z-10 mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3.5 py-1.5 text-sm font-semibold text-blue-700">
          <Star className="w-4 h-4 text-amber-400" strokeWidth={2} fill="currentColor" />
          {t(value.statKey)}
        </div>
      )}
    </div>
  );
}

export default function ValuesBook({ values, t, locale }: ValuesBookProps) {
  const n = values.length;
  const isRTL = locale === 'ar';

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState((0 - 1 + n) % n);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [flipKey, setFlipKey] = useState(0);
  const isFlippingRef = useRef(false);
  const flipTimerRef = useRef<number | null>(null);
  const currentRef = useRef(current);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  // Guarantee the flipping guard is always released — even if the component
  // unmounts mid-animation — so the < > controls can never become permanently
  // dead (the original `flippingRef` could get stuck `true` on re-render).
  useEffect(() => {
    return () => {
      if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
    };
  }, []);

  const turn = useCallback(
    (dir: 'next' | 'prev') => {
      if (isFlippingRef.current || n <= 1) return;
      const c = currentRef.current;
      const nc = dir === 'next' ? (c + 1) % n : (c - 1 + n) % n;
      const np = (nc - 1 + n) % n;
      isFlippingRef.current = true;
      setDirection(dir);
      setIsFlipping(true);
      setFlipKey((k) => k + 1);
      // Restart the safety timer so rapid clicks / re-renders can't strand it.
      if (flipTimerRef.current) window.clearTimeout(flipTimerRef.current);
      flipTimerRef.current = window.setTimeout(() => {
        setCurrent(nc);
        setPrev(np);
        isFlippingRef.current = false;
        setIsFlipping(false);
      }, 820);
    },
    [n]
  );

  const goTo = useCallback(
    (target: number) => {
      if (isFlippingRef.current || n <= 1) return;
      const tgt = ((target % n) + n) % n;
      if (tgt === currentRef.current) return;
      setCurrent(tgt);
      setPrev((tgt - 1 + n) % n);
    },
    [n]
  );

  // Auto flip every 5 seconds
  useEffect(() => {
    const id = window.setInterval(() => turn('next'), 5000);
    return () => window.clearInterval(id);
  }, [turn]);

  const leftValue = values[prev];
  const leftBase = isFlipping && direction === 'prev' ? values[(current - 2 + n) % n] : values[prev];
  const rightBase = isFlipping && direction === 'prev' ? values[current] : values[(current + 1) % n];
  const faces = isFlipping && direction === 'prev' ? values[(current - 1 + n) % n] : values[current];

  // Flipper placement + animation, mirrored for RTL
  let flipperSide = 'right-0';
  let flipperOrigin = 'left center';
  let animClass = '';
  if (isFlipping) {
    if (direction === 'next') {
      flipperSide = isRTL ? 'left-0' : 'right-0';
      flipperOrigin = isRTL ? 'right center' : 'left center';
      animClass = isRTL ? 'vbk-next-rtl' : 'vbk-next';
    } else {
      flipperSide = isRTL ? 'right-0' : 'left-0';
      flipperOrigin = isRTL ? 'left center' : 'right center';
      animClass = isRTL ? 'vbk-prev-rtl' : 'vbk-prev';
    }
  }

  return (
    <div className="w-full">
      <style>{`
        @keyframes vbk-next { from { transform: rotateY(0deg); } to { transform: rotateY(-180deg); } }
        @keyframes vbk-prev { from { transform: rotateY(180deg); } to { transform: rotateY(0deg); } }
        @keyframes vbk-next-rtl { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }
        @keyframes vbk-prev-rtl { from { transform: rotateY(-180deg); } to { transform: rotateY(0deg); } }
        .vbk-next { animation: vbk-next 780ms cubic-bezier(0.45, 0, 0.25, 1) both; }
        .vbk-prev { animation: vbk-prev 780ms cubic-bezier(0.45, 0, 0.25, 1) both; }
        .vbk-next-rtl { animation: vbk-next-rtl 780ms cubic-bezier(0.45, 0, 0.25, 1) both; }
        .vbk-prev-rtl { animation: vbk-prev-rtl 780ms cubic-bezier(0.45, 0, 0.25, 1) both; }
      `}</style>

      {/* The physical book */}
      <div className="relative mx-auto w-full max-w-4xl" style={{ perspective: '2200px' }}>
        <div className="relative w-full min-h-[460px] sm:min-h-[480px]" style={{ transformStyle: 'preserve-3d' }}>
          {/* LEFT page (base) */}
          <div className="absolute inset-y-0 left-0 right-1/2 pe-1.5">
            <PageFace value={leftValue} t={t} />
          </div>

          {/* RIGHT page (base, revealed under the turning leaf) */}
          <div className="absolute inset-y-0 right-0 left-1/2 ps-1.5">
            <PageFace value={rightBase} t={t} />
          </div>

          {/* Centre spine: binding shadow + highlight */}
          <div
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-5 z-40 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.20), rgba(255,255,255,0.65) 50%, rgba(0,0,0,0.06))' }}
          />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px z-40 pointer-events-none bg-white/70" />

          {/* Turning leaf (front + back faces) */}
          <div
            key={flipKey}
            className={`absolute inset-y-0 w-1/2 ${flipperSide} ${isFlipping ? animClass : ''}`}
            style={{ transformStyle: 'preserve-3d', transformOrigin: flipperOrigin, zIndex: 30 }}
          >
            <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
              <PageFace value={faces} t={t} />
            </div>
            <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <PageFace value={faces} t={t} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          type="button"
          onClick={() => turn('prev')}
          aria-label={t('about.values.prev')}
          className="w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-blue-300 hover:text-blue-600 hover:-translate-y-0.5 transition-all flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label={t('about.values.page')}>
          {values.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${t('about.values.page')} ${i + 1}`}
              aria-current={i === current}
              className={`h-2.5 rounded-full transition-all duration-300 ${i === current ? 'bg-blue-600 w-7' : 'bg-gray-300 hover:bg-gray-400 w-2.5'}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => turn('next')}
          aria-label={t('about.values.next')}
          className="w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-blue-300 hover:text-blue-600 hover:-translate-y-0.5 transition-all flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
