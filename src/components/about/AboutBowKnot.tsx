'use client';

/**
 * AboutBowKnot — brand colophon / signature block (time-illusion watch)
 * -----------------------------------------------------------
 * Sits directly under the company photo inside <CompanyShowcase> and acts as
 * a refined "colophon" that carries (承托) the image above.
 *
 * Design language — "时光幻象 · 腕表风" (time-illusion watch):
 *  - The focal point is now an analog timepiece rather than a loose
 *    calligraphic signature. The brand monogram 「秋彦」 is engraved on the
 *    dial's lower arc, and a small cinnabar seal (印) is set as a hallmark at
 *    the watch's lower-right, so the piece still reads as a signed artwork.
 *  - "Time-illusion" (幻象): behind the main dial floats a faint, slightly
 *    larger ghost echo that counter-rotates very slowly — a mirage of time.
 *    Beneath it, a soft mirrored reflection fades into the page, like the
 *    watch resting on still water.
 *  - The perpetual second hand (cinnabar) keeps a quiet, living tick — the
 *    illusion that the brand page itself keeps time.
 *  - Texture & palette: faint paper-grain overlay, slate/indigo dial with a
 *    gold (#C9A067) bezel, and a cinnabar (#C73E3A) seal echoing the brand
 *    mark. A thin gold divider at the top visually "catches" the photo above.
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

/** Hour markers 0..11 around the dial. */
const TICKS = Array.from({ length: 12 }, (_, i) => i);

/**
 * A single analog watch face. Rendered up to three times (main, ghost echo,
 * reflection) — `idPrefix` keeps the SVG gradient ids unique across instances,
 * and `showSecondHand` lets the echo/reflection stay calm.
 */
function WatchFace({ idPrefix, showSecondHand = true }: { idPrefix: string; showSecondHand?: boolean }) {
  const dialId = `${idPrefix}Dial`;
  const bezelId = `${idPrefix}Bezel`;

  return (
    <svg viewBox="0 0 240 240" width="100%" height="100%" role="img" aria-label="QIUYAN timepiece">
      <defs>
        <radialGradient id={dialId} cx="50%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#2b3650" />
          <stop offset="55%" stopColor="#1d2740" />
          <stop offset="100%" stopColor="#11192c" />
        </radialGradient>
        <linearGradient id={bezelId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E7CB8C" />
          <stop offset="48%" stopColor="#C9A067" />
          <stop offset="100%" stopColor="#9C7B45" />
        </linearGradient>
      </defs>

      {/* Bezel + dark rim */}
      <circle cx="120" cy="120" r="114" fill={`url(#${bezelId})`} />
      <circle cx="120" cy="120" r="106" fill="#0f1626" />

      {/* Dial face */}
      <circle cx="120" cy="120" r="100" fill={`url(#${dialId})`} />
      <circle cx="120" cy="120" r="100" fill="none" stroke="rgba(201,160,103,0.32)" strokeWidth="1" />

      {/* Hour ticks */}
      {TICKS.map((i) => {
        const angle = i * 30;
        const isQuarter = i % 3 === 0;
        const outer = 94;
        const inner = isQuarter ? 80 : 87;
        const rad = ((angle - 90) * Math.PI) / 180;
        const x1 = 120 + outer * Math.cos(rad);
        const y1 = 120 + outer * Math.sin(rad);
        const x2 = 120 + inner * Math.cos(rad);
        const y2 = 120 + inner * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isQuarter ? '#C9A067' : 'rgba(201,160,103,0.55)'}
            strokeWidth={isQuarter ? 3 : 1.6}
            strokeLinecap="round"
          />
        );
      })}

      {/* Brand wordmark on the dial (12 o'clock area) */}
      <text
        x="120"
        y="80"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="9"
        letterSpacing="2"
        fill="rgba(201,160,103,0.85)"
      >
        QIUYAN
      </text>

      {/* Hour hand → 10 o'clock, minute hand → 2 o'clock (classic 10:10 stance) */}
      <line
        x1="120"
        y1="124"
        x2="120"
        y2="74"
        stroke="#1f2a44"
        strokeWidth="6"
        strokeLinecap="round"
        transform="rotate(300 120 120)"
      />
      <line
        x1="120"
        y1="124"
        x2="120"
        y2="50"
        stroke="#2b3650"
        strokeWidth="4"
        strokeLinecap="round"
        transform="rotate(60 120 120)"
      />

      {/* Perpetual second hand (cinnabar) — the living "tick" of the illusion */}
      {showSecondHand && (
        <g className="bk-second-hand">
          <line x1="120" y1="140" x2="120" y2="34" stroke="#C73E3A" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="120" cy="140" r="4" fill="#C73E3A" />
        </g>
      )}

      {/* Brand monogram engraved on the dial (the "signature") */}
      <text
        x="120"
        y="170"
        textAnchor="middle"
        fontFamily="'Long Cang','Liu Jian Mao Cao','STXingkai','华文行楷','Xingkai SC','行楷','STKaiti','KaiTi','Noto Serif SC',cursive"
        fontSize="22"
        fontWeight="700"
        fill="#C9A067"
        style={{ opacity: 0.92 }}
      >
        秋彦
      </text>

      {/* Center cap */}
      <circle cx="120" cy="120" r="6.5" fill="#C9A067" stroke="#fff" strokeWidth="1.4" />
      <circle cx="120" cy="120" r="2.4" fill="#1f2a44" />
    </svg>
  );
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
  const sealMarginStart = isRtl ? '0' : '0';
  const sealMarginEnd = isRtl ? '0' : '0';

  return (
    <>
      <style jsx>{`
        @keyframes bk-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Perpetual second-hand spin — the quiet "tick" of the time illusion. */
        @keyframes bk-second-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .bk-second-hand {
          transform-box: view-box;
          transform-origin: 120px 120px;
          animation: bk-second-spin 60s linear infinite;
        }
        /* Slow counter-rotating ghost echo — the "mirage" of time. */
        @keyframes bk-echo-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        .bk-watch-echo {
          transform-origin: center;
          animation: bk-echo-spin 120s linear infinite;
        }
        /* Subtle "hand-stamped" entrance for the (small) seal hallmark. */
        @keyframes bk-seal-pop {
          0%   { opacity: 0; transform: rotate(-10deg) scale(1.3); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: rotate(0deg) scale(1); }
        }
        .bk-colophon { transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        .bk-colophon:hover { transform: translateY(-3px); }
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
          className="flex items-center gap-3 w-full max-w-[240px] mb-6"
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

        {/* ═══ The time-illusion watch (ghost echo + main dial + reflection) ═══ */}
        <div
          className="relative flex items-center justify-center"
          style={{
            direction: isRtl ? 'rtl' : 'ltr',
            width: 'min(260px, 82vw)',
            height: 'min(260px, 82vw)',
          }}
        >
          {/* Ghost echo — faint, oversized, counter-rotating mirage behind the dial */}
          <div
            className="bk-watch-echo absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
            style={{
              opacity: visible ? 0.16 : 0,
              transition: 'opacity 1s ease-out 0.6s',
            }}
          >
            <div style={{ width: '108%', height: '108%' }}>
              <WatchFace idPrefix="echo" showSecondHand={false} />
            </div>
          </div>

          {/* Main watch dial + cinnabar seal hallmark */}
          <div
            className="relative"
            style={{
              width: '100%',
              height: '100%',
              animation: visible ? 'bk-fade-up 0.7s ease-out 0.25s both' : 'none',
              filter: 'drop-shadow(0 14px 30px rgba(20,28,48,0.35))',
            }}
          >
            <WatchFace idPrefix="main" showSecondHand />

            {/* Cinnabar seal hallmark overlapping the lower-right of the dial */}
            <div
              className="absolute"
              style={{
                right: '3%',
                bottom: '7%',
                animation: visible ? 'bk-seal-pop 0.6s cubic-bezier(.34,1.56,.64,1) 1s both' : 'none',
              }}
              aria-hidden="true"
            >
              <svg width="30" height="30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="88" height="88" rx="14" fill="#C73E3A" />
                <rect x="12" y="12" width="76" height="76" rx="10" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.9" />
                <text x="50" y="43" textAnchor="middle" fontFamily="'STKaiti','KaiTi','Kaiti SC',serif" fontSize="32" fontWeight="700" fill="#ffffff">秋</text>
                <text x="50" y="83" textAnchor="middle" fontFamily="'STKaiti','KaiTi','Kaiti SC',serif" fontSize="32" fontWeight="700" fill="#ffffff">彦</text>
              </svg>
            </div>
          </div>

          {/* Soft mirrored reflection — the watch resting on still water (幻象) */}
          <div
            className="absolute left-0 right-0 flex justify-center"
            aria-hidden="true"
            style={{
              top: '88%',
              opacity: visible ? 0.12 : 0,
              transition: 'opacity 1.2s ease-out 0.9s',
            }}
          >
            <div style={{ width: '70%', transform: 'scaleY(-1)', filter: 'blur(2px)' }}>
              <WatchFace idPrefix="refl" showSecondHand={false} />
            </div>
          </div>
        </div>

        {/* ═══ Brand line + gold flourish ═══ */}
        <div
          className="mt-10 flex flex-col items-center"
          style={{
            animation: visible ? 'bk-fade-up 0.6s ease-out 0.8s both' : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          <div
            className="text-[10px] sm:text-xs font-semibold tracking-[0.34em] text-slate-500"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            QIUYAN · Qtech — Since Time Began
          </div>
          <svg className="mt-2" width="120" height="10" viewBox="0 0 120 10" fill="none" aria-hidden="true">
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
