'use client';

/**
 * AboutBowKnot (TASK 2 — ribbon-bow rebrand)
 * -----------------------------------------------------------
 * Elegant ribbon-bow brand motif that replaces the old "stone book".
 * Sits compactly (5:3) under the company photo inside <CompanyShowcase>.
 *
 * Visual language (per design brief):
 *  - A refined ribbon / bow motif — NOT cartoonish.
 *  - Site palette: blue → indigo → slate gradient + gold (#C9A067) accents,
 *    consistent with the existing About visuals.
 *  - Brand semantics preserved: 秋彦 / QIUYAN / Qtech, rendered as an
 *    artistic calligraphic signature (no milestone timeline).
 *
 * Animation:
 *  - Entrance: bow unfurls / scales in (scroll- or mount-triggered via
 *    IntersectionObserver); brand + milestones stagger in.
 *  - Hover: lift + ambient glow.
 *  - Continuous: gentle float + knot shimmer.
 *  - RTL-safe: only the text uses `dir`; the geometry stays LTR.
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
        @keyframes bk-enter {
          from { opacity: 0; transform: translateY(22px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bk-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bk-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes bk-glow {
          0%, 100% { opacity: 0.18; }
          50%      { opacity: 0.42; }
        }
        @keyframes bk-shimmer {
          0%   { transform: translateX(-60%); opacity: 0; }
          40%  { opacity: 0.55; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        .bk-container { transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        .bk-container:hover { transform: translateY(-4px); }
        .bk-container:hover .bk-glow { opacity: 0.55 !important; }
        @keyframes bk-sign-write {
          0%   { clip-path: inset(0 100% 0 0); opacity: 0; }
          55%  { opacity: 1; }
          100% { clip-path: inset(0 0% 0 0); opacity: 1; }
        }
      `}</style>

      <div ref={containerRef} className="bk-container relative w-full">
        {/* Ambient glow behind the bow */}
        <div
          className="bk-glow pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(ellipse at 50% 42%, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.08) 42%, transparent 72%)',
            opacity: 0.2,
          }}
        />

        <div
          className="relative mx-auto w-full"
          style={{
            aspectRatio: '5 / 3',
            animation: visible ? 'bk-enter 1s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          {/* ═══ Brand mark (top-center) ═══ */}
          <div
            className="absolute inset-x-0 top-[2%] flex flex-col items-center text-center"
            style={{
              animation: visible ? 'bk-fade-up 0.6s ease-out 0.15s both' : 'none',
              opacity: visible ? undefined : 0,
            }}
          >
            <div
              className="font-bold leading-none"
              style={{
                fontFamily: "'Noto Serif SC','STKaiti','KaiTi','SimSun',serif",
                fontSize: 'clamp(20px, 4vw, 30px)',
                color: '#1f2a44',
                letterSpacing: '0.14em',
                textShadow: '0 1px 2px rgba(51,65,85,0.12)',
              }}
            >
              秋彦
            </div>
            <div
              className="mt-1 text-[9px] sm:text-[10px] font-semibold tracking-[0.32em] text-slate-500"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              QIUYAN
            </div>
            <div
              className="mt-1 h-px w-12"
              style={{ background: 'linear-gradient(90deg, transparent, #C9A067 50%, transparent)' }}
            />
            <div className="mt-1 text-sm sm:text-base font-extrabold tracking-tight text-slate-600">
              Qtech
            </div>
          </div>

          {/* ═══ Ribbon bow (LTR geometry) ═══ */}
          <svg
            className="absolute inset-x-0"
            style={{
              top: '26%',
              height: '52%',
              animation: visible ? 'bk-float 6s ease-in-out infinite' : 'none',
            }}
            viewBox="0 0 500 240"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bkRibbon" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3b82f6" />
                <stop offset="0.55" stopColor="#6366f1" />
                <stop offset="1" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="bkRibbonR" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#6366f1" />
                <stop offset="1" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="bkKnot" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#818cf8" />
                <stop offset="1" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="bkGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#C9A067" stopOpacity="0" />
                <stop offset="0.5" stopColor="#C9A067" stopOpacity="0.85" />
                <stop offset="1" stopColor="#C9A067" stopOpacity="0" />
              </linearGradient>
              <filter id="bkShadow" x="-20%" y="-20%" width="140%" height="150%">
                <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#1e293b" floodOpacity="0.18" />
              </filter>
              <clipPath id="bkKnotClip">
                <rect x="232" y="96" width="36" height="62" rx="11" />
              </clipPath>
            </defs>

            {/* Soft ground shadow */}
            <ellipse cx="250" cy="214" rx="150" ry="12" fill="rgba(15,23,42,0.10)" />

            <g filter="url(#bkShadow)">
              {/* Left loop */}
              <path
                d="M250,96 C 206,58 122,72 120,122 C 118,170 206,184 250,150 Z"
                fill="url(#bkRibbon)"
              />
              {/* Right loop */}
              <path
                d="M250,96 C 294,58 378,72 380,122 C 382,170 294,184 250,150 Z"
                fill="url(#bkRibbonR)"
              />
              {/* Left tail */}
              <path
                d="M246,150 C 236,188 220,210 206,236 L 224,242 L 236,234 C 250,202 256,184 254,152 Z"
                fill="url(#bkRibbon)"
              />
              {/* Right tail */}
              <path
                d="M254,150 C 264,188 280,210 294,236 L 276,242 L 264,234 C 250,202 244,184 246,152 Z"
                fill="url(#bkRibbonR)"
              />
              {/* Knot */}
              <rect x="232" y="96" width="36" height="62" rx="11" fill="url(#bkKnot)" />
            </g>

            {/* Gold edge accents */}
            <path
              d="M250,96 C 206,58 122,72 120,122 C 118,170 206,184 250,150"
              fill="none"
              stroke="url(#bkGold)"
              strokeWidth="1.6"
              strokeOpacity="0.9"
            />
            <path
              d="M250,96 C 294,58 378,72 380,122 C 382,170 294,184 250,150"
              fill="none"
              stroke="url(#bkGold)"
              strokeWidth="1.6"
              strokeOpacity="0.9"
            />
            <rect
              x="232"
              y="96"
              width="36"
              height="62"
              rx="11"
              fill="none"
              stroke="#C9A067"
              strokeWidth="1.2"
              strokeOpacity="0.7"
            />

            {/* Knot shimmer (clipped) */}
            <g clipPath="url(#bkKnotClip)">
              <rect
                x="-40"
                y="0"
                width="40"
                height="240"
                fill="url(#bkGold)"
                style={{ animation: visible ? 'bk-shimmer 3.2s ease-in-out infinite' : 'none' }}
              />
            </g>
          </svg>

          {/* ═══ Artistic company-name signature (replaces milestone strip) ═══ */}
          <div
            className="absolute inset-x-0 bottom-[5%] flex flex-col items-center"
            style={{
              direction: isRtl ? 'rtl' : 'ltr',
              animation: visible ? 'bk-fade-up 0.6s ease-out 0.35s both' : 'none',
              opacity: visible ? undefined : 0,
            }}
          >
            {/* Brush-calligraphy signature of 秋彦 */}
            <div
              className="relative"
              style={{
                fontFamily:
                  "'Ma Shan Zheng','Zhi Mang Xing','STKaiti','KaiTi','Noto Serif SC',cursive",
                fontSize: 'clamp(34px, 7vw, 52px)',
                fontWeight: 700,
                color: '#1f2a44',
                letterSpacing: '0.08em',
                transform: 'rotate(-3deg)',
                textShadow:
                  '1px 1px 0 rgba(201,160,103,0.18), 2px 2px 6px rgba(31,42,68,0.10)',
                animation: visible ? 'bk-sign-write 1.1s cubic-bezier(.25,.46,.45,.94) 0.45s both' : 'none',
              }}
            >
              秋彦
            </div>
            {/* Gold flourish underline */}
            <svg
              className="mt-1"
              width="130"
              height="14"
              viewBox="0 0 130 14"
              fill="none"
              aria-hidden="true"
              style={{
                animation: visible ? 'bk-fade-up 0.6s ease-out 1.15s both' : 'none',
                opacity: visible ? undefined : 0,
              }}
            >
              <defs>
                <linearGradient id="bkFlourish" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#C9A067" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#C9A067" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#C9A067" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M5 9 C 32 3, 54 3, 65 7 C 76 11, 98 11, 125 5"
                stroke="url(#bkFlourish)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
