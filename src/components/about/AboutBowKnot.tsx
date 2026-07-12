'use client';

/**
 * AboutBowKnot — elegant brand colophon / signature block
 * -----------------------------------------------------------
 * Sits directly under the company photo inside <CompanyShowcase> and acts
 * as a refined "colophon" that carries (承托) the image above.
 *
 * Design language:
 *  - A single calligraphic 「秋彦」 signature is the focal point. It is set in a
 *    flowing running-script / brush font stack (行楷 → cursive), slightly
 *    rotated and overlapped with a hand-stamped cinnabar seal so the pair reads
 *    like a real signed-and-sealed artwork colophon. No cartoonish ribbon bow.
 *  - A thin gold divider on top visually "catches" the bottom edge of the
 *    company photo, so the block reads as a base / capstone for the image.
 *  - Site palette: slate / indigo / blue + gold (#C9A067) accent, with a
 *    cinnabar seal (#C73E3A) echoing the brand mark.
 *  - RTL-safe: only text uses `dir`; the geometry stays centered LTR and the
 *    seal simply mirrors to the other side.
 *
 * No extra network font requests: the brush fonts are requested from the
 * system font stack (行楷 / Kai variants are commonly installed on macOS /
 * Windows) and gracefully fall back to a cursive / serif face.
 */

import { useState, useEffect, useRef } from 'react';

interface AboutBowKnotProps {
  /** Translation helper. Kept on the public interface for API stability. */
  t: (key: string) => string;
  /** Active locale; drives RTL mirroring and (future) localized copy. */
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

  // Seal is mirrored to the opposite side under RTL so the composition stays balanced.
  const sealMarginStart = isRtl ? '0' : '-0.32em';
  const sealMarginEnd = isRtl ? '-0.32em' : '0';
  const sealRotation = isRtl ? '6deg' : '-6deg';

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
        /* Subtle "hand-stamped" entrance for the seal. */
        @keyframes bk-seal-stamp {
          0%   { opacity: 0; transform: rotate(-12deg) scale(1.28); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: rotate(var(--bk-seal-rot, -6deg)) scale(1); }
        }
        .bk-colophon { transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        .bk-colophon:hover { transform: translateY(-3px); }
        /* Brushed ink: dark slate with a faint warm undertone, clipped to glyph. */
        .bk-sign-ink {
          background: linear-gradient(118deg, #2b3650 0%, #1f2a44 45%, #4a3a28 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: #1f2a44; /* fallback if background-clip:text unsupported */
          -webkit-text-fill-color: transparent;
        }
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

        {/* ═══ Calligraphic signature + cinnabar seal (staggered colophon) ═══ */}
        <div
          className="relative mt-1 mb-2 flex items-end justify-center"
          style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        >
          {/* The signature — flowing brush / running-script face, slightly rotated
              and ink-shadowed so it reads like a hand-drawn signature. */}
          <div
            className="bk-sign-ink relative"
            style={{
              fontFamily:
                "'STXingkai','华文行楷','Xingkai SC','行楷','Long Cang','Liu Jian Mao Cao','Zhi Mang Xing','STKaiti','KaiTi','Kaiti SC','Noto Serif SC',cursive",
              fontSize: 'clamp(46px, 9.5vw, 70px)',
              fontWeight: 700,
              letterSpacing: '-0.05em',
              lineHeight: 1,
              transform: 'rotate(-4deg)',
              textShadow:
                '1px 2px 1px rgba(31,42,68,0.20), 3px 5px 9px rgba(31,42,68,0.12)',
              animation: visible
                ? 'bk-sign-write 1.1s cubic-bezier(.25,.46,.45,.94) 0.25s both'
                : 'none',
            }}
          >
            秋彦
          </div>

          {/* The seal — 1:1 cinnabar rounded square with 「秋彦」 carved in white,
              placed to overlap the lower corner of the signature for a hand-stamped,
              off-grid feel. Mirrored under RTL via margin swap. */}
          <div
            className="relative"
            style={{
              marginInlineStart: sealMarginStart,
              marginInlineEnd: sealMarginEnd,
              marginBottom: '-0.18em',
              ['--bk-seal-rot' as any]: sealRotation,
              transform: `rotate(${sealRotation})`,
              animation: visible
                ? 'bk-seal-stamp 0.7s cubic-bezier(.34,1.56,.64,1) 0.95s both'
                : 'none',
            }}
            aria-hidden="true"
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Grain: dark fractal noise clipped to the seal shape, merged over
                    the solid red to mimic uneven 印泥 (ink-paste) texture. */}
                <filter id="bkSealGrain" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.9"
                    numOctaves="2"
                    seed="11"
                    stitchTiles="stitch"
                    result="noise"
                  />
                  <feColorMatrix
                    in="noise"
                    type="matrix"
                    values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.13 0"
                    result="grain"
                  />
                  <feComposite in="grain" in2="SourceGraphic" operator="in" result="grainClipped" />
                  <feMerge>
                    <feMergeNode in="SourceGraphic" />
                    <feMergeNode in="grainClipped" />
                  </feMerge>
                </filter>
                {/* Heavier mottle toward the bottom edge — like a real stamp that
                    presses harder at one side. */}
                <radialGradient id="bkSealMottle" cx="50%" cy="80%" r="62%">
                  <stop offset="0%" stopColor="#000000" stopOpacity="0.18" />
                  <stop offset="55%" stopColor="#000000" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Cinnabar base with grain. */}
              <rect
                x="5"
                y="5"
                width="90"
                height="90"
                rx="16"
                fill="#C73E3A"
                filter="url(#bkSealGrain)"
              />
              {/* Uneven ink-paste shading. */}
              <rect x="5" y="5" width="90" height="90" rx="16" fill="url(#bkSealMottle)" />
              {/* Inner white frame (negative space of a carved seal). */}
              <rect
                x="11"
                y="11"
                width="78"
                height="78"
                rx="11"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                opacity="0.9"
              />
              {/* Seal characters — stacked 「秋」 over 「彦」. */}
              <text
                x="50"
                y="43"
                textAnchor="middle"
                fontFamily="'STKaiti','KaiTi','Kaiti SC','Noto Serif SC',serif"
                fontSize="33"
                fontWeight="700"
                fill="#ffffff"
              >
                秋
              </text>
              <text
                x="50"
                y="83"
                textAnchor="middle"
                fontFamily="'STKaiti','KaiTi','Kaiti SC','Noto Serif SC',serif"
                fontSize="33"
                fontWeight="700"
                fill="#ffffff"
              >
                彦
              </text>
            </svg>
          </div>
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
