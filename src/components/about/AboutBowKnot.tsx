'use client';

/**
 * AboutBowKnot — elegant brand colophon / signature block
 * -----------------------------------------------------------
 * Sits directly under the company photo inside <CompanyShowcase> and acts
 * as a refined "colophon" that carries (承托) the image above.
 *
 * Design language:
 *  - A single calligraphic 「秋彦」 signature is the focal point. It is set in a
 *    flowing running-script / brush font stack (行楷 → cursive), lightly rotated
 *    with a hand-drawn brush underline so it reads like a real signature.
 *  - A small hand-stamped cinnabar seal (印) overlaps the lower corner of the
 *    signature for a signed-and-sealed artwork feel. It is intentionally small
 *    and quiet so the calligraphy leads.
 *  - Texture & pattern: a faint paper-grain overlay, a soft ink-wash blot
 *    behind the signature, a subtle traditional wave (海水江崖) flourish, and a
 *    thin gold divider that visually "catches" the company photo above.
 *  - Site palette: slate / indigo / blue + gold (#C9A067) accent, with a
 *    cinnabar seal (#C73E3A) echoing the brand mark.
 *  - RTL-safe: only text uses `dir`; the geometry stays centered LTR and the
 *    seal simply mirrors to the other side.
 *
 * No extra network font requests: the brush fonts come from the system font
 * stack (行楷 / Kai variants are commonly installed on macOS / Windows) and
 * gracefully fall back to a cursive / serif face.
 */

import { useState, useEffect, useRef } from 'react';

interface AboutBowKnotProps {
  /** Translation helper. Kept on the public interface for API stability. */
  t: (key: string) => string;
  /** Active locale; drives RTL mirroring and (future) localized copy. */
  locale: string;
}

// Faint paper-grain texture (inline SVG turbulence) — no network request.
const PAPER_GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

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
  const sealMarginStart = isRtl ? '0' : '-0.28em';
  const sealMarginEnd = isRtl ? '-0.28em' : '0';
  const sealRotation = isRtl ? '5deg' : '-5deg';

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
        /* Hand-drawn brush underline sweeps in after the signature appears. */
        @keyframes bk-flourish-draw {
          from { stroke-dashoffset: 240; }
          to   { stroke-dashoffset: 0; }
        }
        /* Subtle "hand-stamped" entrance for the (small) seal. */
        @keyframes bk-seal-stamp {
          0%   { opacity: 0; transform: rotate(-10deg) scale(1.35); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: rotate(var(--bk-seal-rot, -5deg)) scale(1); }
        }
        /* Very gentle breathing of the ink-wash blot behind the signature. */
        @keyframes bk-ink-breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1);   opacity: 0.5; }
          50%      { transform: translate(-50%, -50%) scale(1.08); opacity: 0.7; }
        }
        .bk-colophon { transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        .bk-colophon:hover { transform: translateY(-3px); }
        /* Brushed ink: dark slate with a faint warm undertone, clipped to glyph. */
        .bk-sign-ink {
          background: linear-gradient(116deg, #2b3650 0%, #1f2a44 42%, #4a3a28 78%, #6b4a2a 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: #1f2a44; /* fallback if background-clip:text unsupported */
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div
        ref={containerRef}
        className="bk-colophon relative w-full flex flex-col items-center text-center px-4 py-7 overflow-hidden"
        style={{ opacity: visible ? undefined : 0 }}
      >
        {/* ═══ Faint paper-grain overlay (texture, no network request) ═══ */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: PAPER_GRAIN_URI, opacity: 0.05, mixBlendMode: 'multiply' }}
        />

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
          className="relative mt-1 mb-3 flex items-end justify-center"
          style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        >
          {/* Soft ink-wash blot behind the signature (texture / depth). */}
          <div
            aria-hidden="true"
            className="bk-inkwash pointer-events-none absolute rounded-full -z-10"
            style={{
              width: '200px',
              height: '120px',
              left: '50%',
              top: '46%',
              background:
                'radial-gradient(closest-side, rgba(31,42,68,0.16), rgba(31,42,68,0.06) 58%, transparent 78%)',
              filter: 'blur(7px)',
              animation: visible ? 'bk-ink-breathe 7s ease-in-out 0.4s infinite' : 'none',
              opacity: visible ? 0.5 : 0,
            }}
          />

          {/* Traditional wave (海水江崖) flourish — subtle, behind the signature. */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute -z-10"
            width="220"
            height="44"
            viewBox="0 0 220 44"
            fill="none"
            style={{
              left: '50%',
              bottom: '-26px',
              transform: 'translateX(-50%)',
              opacity: visible ? 0.22 : 0,
              transition: 'opacity 0.8s ease-out 0.9s',
            }}
          >
            <path
              d="M8 30 Q 33 12, 58 30 T 108 30 T 158 30 T 208 30"
              stroke="#C9A067"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M8 39 Q 33 21, 58 39 T 108 39 T 158 39 T 208 39"
              stroke="#C9A067"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>

          {/* The signature — flowing brush / running-script face, slightly rotated
              and ink-shadowed, with a hand-drawn brush underline flourish. */}
          <div
            className="bk-sign-ink relative"
            style={{
              fontFamily:
                "'Long Cang','Liu Jian Mao Cao','Zhi Mang Xing','STXingkai','华文行楷','Xingkai SC','行楷','STKaiti','KaiTi','Kaiti SC','Noto Serif SC',cursive",
              fontSize: 'clamp(52px, 11vw, 80px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              transform: 'rotate(-6deg)',
              textShadow:
                '1px 2px 1px rgba(31,42,68,0.22), 4px 7px 12px rgba(31,42,68,0.14)',
              animation: visible
                ? 'bk-sign-write 1.15s cubic-bezier(.25,.46,.45,.94) 0.25s both'
                : 'none',
            }}
          >
            秋彦
            {/* Brush underline that draws in after the signature. */}
            <svg
              aria-hidden="true"
              className="absolute left-0 w-full"
              style={{ height: '14px', bottom: '-8px', overflow: 'visible' }}
              viewBox="0 0 200 14"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="bkSignStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#1f2a44" stopOpacity="0" />
                  <stop offset="0.18" stopColor="#1f2a44" stopOpacity="0.65" />
                  <stop offset="1" stopColor="#C9A067" stopOpacity="0.95" />
                </linearGradient>
              </defs>
              <path
                d="M6 9 C 56 2, 120 2, 194 8"
                stroke="url(#bkSignStroke)"
                strokeWidth="2.6"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 240,
                  strokeDashoffset: visible ? 0 : 240,
                  animation: visible ? 'bk-flourish-draw 0.9s ease-out 1.15s both' : 'none',
                }}
              />
            </svg>
          </div>

          {/* The seal — small 1:1 cinnabar rounded square with 「秋彦」 carved in
              white, placed to overlap the lower corner of the signature for a
              hand-stamped, off-grid feel. Intentionally quiet. Mirrored under
              RTL via margin swap. */}
          <div
            className="relative"
            style={{
              marginInlineStart: sealMarginStart,
              marginInlineEnd: sealMarginEnd,
              marginBottom: '-0.1em',
              ['--bk-seal-rot' as any]: sealRotation,
              transform: `rotate(${sealRotation})`,
              animation: visible
                ? 'bk-seal-stamp 0.7s cubic-bezier(.34,1.56,.64,1) 1.05s both'
                : 'none',
            }}
            aria-hidden="true"
          >
            <svg
              width="34"
              height="34"
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
                    baseFrequency="0.95"
                    numOctaves="2"
                    seed="11"
                    stitchTiles="stitch"
                    result="noise"
                  />
                  <feColorMatrix
                    in="noise"
                    type="matrix"
                    values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.14 0"
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
                <radialGradient id="bkSealMottle" cx="50%" cy="82%" r="64%">
                  <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
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
                rx="15"
                fill="#C73E3A"
                filter="url(#bkSealGrain)"
              />
              {/* Uneven ink-paste shading. */}
              <rect x="5" y="5" width="90" height="90" rx="15" fill="url(#bkSealMottle)" />
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
                y="42"
                textAnchor="middle"
                fontFamily="'STKaiti','KaiTi','Kaiti SC','Noto Serif SC',serif"
                fontSize="36"
                fontWeight="700"
                fill="#ffffff"
              >
                秋
              </text>
              <text
                x="50"
                y="82"
                textAnchor="middle"
                fontFamily="'STKaiti','KaiTi','Kaiti SC','Noto Serif SC',serif"
                fontSize="36"
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
          className="mt-4 flex flex-col items-center"
          style={{
            animation: visible ? 'bk-fade-up 0.6s ease-out 0.8s both' : 'none',
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
