'use client';

/**
 * AboutBowKnot — elegant brand colophon / signature block
 * -----------------------------------------------------------
 * Sits directly under the company photo inside <CompanyShowcase> and acts
 * as a refined "colophon" that carries (承托) the image above.
 *
 * Design language:
 *  - A single calligraphic 「秋彦」 signature is the focal point — no
 *    duplicated brand marks, no cartoonish ribbon bow.
 *  - A thin gold divider on top visually "catches" the bottom edge of the
 *    company photo, so the block reads as a base / capstone for the image.
 *  - Site palette: slate / indigo / blue + gold (#C9A067) accent.
 *  - RTL-safe: only text uses `dir`; the geometry stays centered LTR.
 */

import { useState, useEffect, useRef } from 'react';

interface AboutBowKnotProps {
  t: (key: string) => string;
  locale: string;
}

export default function AboutBowKnot({ locale }: AboutBowKnotProps) {
  const isRtl = locale === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes bk-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bk-sign-write {
          0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
          55%  { opacity: 1; }
          100% { clip-path: inset(0 0% 0 0); opacity: 1; }
        }
        .bk-colophon { transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        .bk-colophon:hover { transform: translateY(-3px); }
      `}</style>

      <div
        ref={containerRef}
        className="bk-colophon relative w-full flex flex-col items-center text-center px-4 py-7"
        style={{ opacity: visible ? undefined : 0 }}
      >
        {/* ═══ Top gold divider — visually catches the company photo above ═══ */}
        <div
          className="flex items-center gap-3 w-full max-w-[240px] mb-5"
          aria-hidden="true"
          style={{
            animation: visible ? 'bk-fade-up 0.6s ease-out 0.1s both' : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          <span
            className="h-px flex-1"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(201,160,103,0.55) 50%, transparent)' }}
          />
          <span className="w-1.5 h-1.5 rotate-45" style={{ background: '#C9A067' }} />
          <span
            className="h-px flex-1"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(201,160,103,0.55) 50%, transparent)' }}
          />
        </div>

        {/* ═══ Calligraphic brand signature — the single focal point ═══ */}
        <div
          className="relative"
          style={{
            direction: isRtl ? 'rtl' : 'ltr',
            fontFamily:
              "'Ma Shan Zheng','Zhi Mang Xing','STKaiti','KaiTi','Noto Serif SC',cursive",
            fontSize: 'clamp(38px, 8vw, 58px)',
            fontWeight: 700,
            color: '#1f2a44',
            letterSpacing: '0.08em',
            transform: 'rotate(-3deg)',
            textShadow:
              '1px 1px 0 rgba(201,160,103,0.20), 2px 3px 8px rgba(31,42,68,0.12)',
            animation: visible ? 'bk-sign-write 1.1s cubic-bezier(.25,.46,.45,.94) 0.25s both' : 'none',
          }}
        >
          秋彦
        </div>

        {/* ═══ Brand line + gold flourish ═══ */}
        <div
          className="mt-3 flex flex-col items-center"
          style={{
            animation: visible ? 'bk-fade-up 0.6s ease-out 0.7s both' : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          <div
            className="text-[10px] sm:text-xs font-semibold tracking-[0.34em] text-slate-500"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            QIUYAN · Qtech
          </div>
          <svg
            className="mt-2"
            width="120"
            height="10"
            viewBox="0 0 120 10"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bkFlourish" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#C9A067" stopOpacity="0" />
                <stop offset="0.5" stopColor="#C9A067" stopOpacity="0.9" />
                <stop offset="1" stopColor="#C9A067" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M5 6 C 30 2, 52 2, 60 5 C 68 8, 90 8, 115 3"
              stroke="url(#bkFlourish)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
