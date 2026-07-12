'use client';

/**
 * AboutBowKnot — brand colophon / signature block (flower greenhouse).
 * -----------------------------------------------------------
 * Sits directly under the company photo inside <CompanyShowcase> and acts as
 * a refined "colophon" that carries (承托) the image above.
 *
 * Design language — "繁花温室 · 花园风" (blooming greenhouse):
 *  - The focal point is now a small garden / greenhouse scene instead of a
 *    timepiece. A white picket fence runs along the front, a flower bed with
 *    colourful blossoms (pinks / yellows / corals) and tufts of grass sit
 *    behind it, and a couple of butterflies flutter around the blooms.
 *  - Everything sways gently in the wind (CSS transforms with staggered
 *    delays) so the scene feels alive without any network assets.
 *  - The brand monogram 「秋彦」 is engraved on a wooden garden sign / plaque
 *    set into the scene — a natural label, not a watch dial and not a red seal.
 *  - Palette: bright, natural greens, pinks and yellows on a soft sky.
 *
 * No extra network font requests: only system fonts / safe fallbacks are used.
 * RTL-safe: the whole scene is centred and symmetrical; nothing is hard-pinned
 * to left/right, so Arabic layout mirrors cleanly.
 */

import { useState, useEffect, useRef } from 'react';

interface AboutBowKnotProps {
  /** Translation helper. Kept on the public interface for API stability. */
  t: (key: string) => string;
  /** Active locale; drives RTL mirroring only (geometry stays centred). */
  locale: string;
}

/** A single flower: stem + leaves + petals + centre. Colours passed in. */
function Flower({
  x,
  y,
  scale = 1,
  petal,
  petalDark,
  center,
  delay = 0,
  duration = 4,
}: {
  x: number;
  y: number;
  scale?: number;
  petal: string;
  petalDark: string;
  center: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      className="bk-sway"
      style={{
        transformBox: 'fill-box',
        transformOrigin: '50% 100%',
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      {/* stem */}
      <path d="M0 0 C -2 -22, 2 -42, 0 -64" stroke="#3f9d52" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* leaves */}
      <path d="M0 -30 C -14 -34, -22 -26, -20 -16 C -10 -18, -2 -24, 0 -30 Z" fill="#4caf6a" />
      <path d="M0 -44 C 14 -48, 22 -40, 20 -30 C 10 -32, 2 -38, 0 -44 Z" fill="#57bd76" />
      {/* petals */}
      <g transform="translate(0 -70)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-12"
            rx="8"
            ry="13"
            fill={petal}
            stroke={petalDark}
            strokeWidth="1"
            transform={`rotate(${deg})`}
          />
        ))}
        {/* centre */}
        <circle cx="0" cy="0" r="7" fill={center} />
        <circle cx="0" cy="0" r="7" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      </g>
    </g>
  );
}

/** A single blade of grass that sways. */
function Grass({ x, y, height = 26, delay = 0 }: { x: number; y: number; height?: number; delay?: number }) {
  return (
    <path
      d={`M${x} ${y} q -5 -${height * 0.6} 0 -${height} q 5 ${height * 0.6} 0 ${height} Z`}
      fill="#5cbf7a"
      className="bk-sway"
      style={{
        transformBox: 'fill-box',
        transformOrigin: '50% 100%',
        animationDuration: '3.4s',
        animationDelay: `${delay}s`,
      }}
    />
  );
}

/** A fluttering butterfly (two wings that flap + a drifting path). */
function Butterfly({ x, y, color, colorDark, delay = 0 }: { x: number; y: number; color: string; colorDark: string; delay?: number }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      className="bk-butterfly"
      style={{ animationDelay: `${delay}s` }}
    >
      <g className="bk-wing" style={{ transformBox: 'fill-box', transformOrigin: '100% 50%' }}>
        <path d="M0 0 C -14 -14, -22 -4, -20 6 C -16 12, -4 8, 0 0 Z" fill={color} stroke={colorDark} strokeWidth="0.8" />
        <path d="M0 0 C -10 10, -18 12, -16 18 C -10 20, -2 10, 0 0 Z" fill={colorDark} opacity="0.85" />
      </g>
      <g className="bk-wing-r" style={{ transformBox: 'fill-box', transformOrigin: '0% 50%' }}>
        <path d="M0 0 C 14 -14, 22 -4, 20 6 C 16 12, 4 8, 0 0 Z" fill={color} stroke={colorDark} strokeWidth="0.8" />
        <path d="M0 0 C 10 10, 18 12, 16 18 C 10 20, 2 10, 0 0 Z" fill={colorDark} opacity="0.85" />
      </g>
      <line x1="0" y1="-3" x2="0" y2="6" stroke="#3a3a3a" strokeWidth="1.4" strokeLinecap="round" />
    </g>
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

  return (
    <>
      <style jsx>{`
        @keyframes bk-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Gentle wind sway for flowers & grass — pivots from the base. */
        @keyframes bk-sway {
          0%   { transform: rotate(-3deg); }
          50%  { transform: rotate(3deg); }
          100% { transform: rotate(-3deg); }
        }
        .bk-sway {
          animation-name: bk-sway;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        /* Butterfly drifting path + soft bob. */
        @keyframes bk-butterfly {
          0%   { transform: translate(0px, 0px) rotate(-4deg); }
          25%  { transform: translate(18px, -10px) rotate(6deg); }
          50%  { transform: translate(34px, 2px) rotate(-3deg); }
          75%  { transform: translate(16px, 10px) rotate(5deg); }
          100% { transform: translate(0px, 0px) rotate(-4deg); }
        }
        .bk-butterfly {
          animation-name: bk-butterfly;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-duration: 9s;
        }
        /* Wing flap. */
        @keyframes bk-flap {
          0%, 100% { transform: scaleX(1); }
          50%      { transform: scaleX(0.45); }
        }
        .bk-wing, .bk-wing-r {
          animation: bk-flap 0.45s ease-in-out infinite;
        }
        .bk-colophon { transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        .bk-colophon:hover { transform: translateY(-3px); }
      `}</style>

      <div
        ref={containerRef}
        className="bk-colophon relative w-full flex flex-col items-center text-center px-4 py-7 overflow-hidden"
        style={{ opacity: visible ? undefined : 0 }}
      >
        {/* ═══ Top soft divider — visually catches the company photo above ═══ */}
        <div
          className="flex items-center gap-3 w-full max-w-[260px] mb-5"
          aria-hidden="true"
          style={{
            animation: visible ? 'bk-fade-up 0.6s ease-out 0.1s both' : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          <span
            className="h-px flex-1"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(110,170,90,0.55) 50%, transparent)' }}
          />
          <span className="w-1.5 h-1.5 rotate-45" style={{ background: '#6cae5a' }} />
          <span
            className="h-px flex-1"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(110,170,90,0.55) 50%, transparent)' }}
          />
        </div>

        {/* ═══ The garden / greenhouse scene ═══ */}
        <div
          className="relative flex items-center justify-center"
          style={{
            direction: isRtl ? 'rtl' : 'ltr',
            width: 'min(380px, 90vw)',
            height: 'min(300px, 72vw)',
          }}
        >
          <svg
            viewBox="0 0 400 320"
            width="100%"
            height="100%"
            role="img"
            aria-label="秋彦 花园温室"
            className="drop-shadow-[0_14px_30px_rgba(40,90,50,0.25)]"
          >
            <defs>
              <linearGradient id="bkSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dff3ff" />
                <stop offset="55%" stopColor="#eafaf0" />
                <stop offset="100%" stopColor="#fbf7ec" />
              </linearGradient>
              <radialGradient id="bkSun" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff6c2" />
                <stop offset="100%" stopColor="#ffe680" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="bkWood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c79a5b" />
                <stop offset="100%" stopColor="#a9763b" />
              </linearGradient>
            </defs>

            {/* Sky */}
            <rect x="0" y="0" width="400" height="320" rx="22" fill="url(#bkSky)" />

            {/* Sun glow */}
            <circle cx="320" cy="62" r="58" fill="url(#bkSun)" />
            <circle cx="320" cy="62" r="22" fill="#ffe066" />

            {/* Drifting clouds */}
            <g opacity="0.85" fill="#ffffff">
              <ellipse cx="90" cy="60" rx="34" ry="15" />
              <ellipse cx="120" cy="52" rx="26" ry="14" />
              <ellipse cx="64" cy="52" rx="22" ry="12" />
            </g>

            {/* Flower bed soil */}
            <path d="M0 232 Q 200 206 400 232 L 400 298 Q 200 312 0 298 Z" fill="#7c5a3a" />
            <path d="M0 232 Q 200 206 400 232 L 400 244 Q 200 220 0 244 Z" fill="#8a6743" />

            {/* Grass tufts across the bed */}
            <g>
              {[28, 70, 120, 175, 230, 285, 340, 372].map((gx, i) => (
                <Grass key={gx} x={gx} y={238 + (i % 2) * 4} height={22 + (i % 3) * 6} delay={i * 0.4} />
              ))}
            </g>

            {/* Flowers — bright natural palette */}
            <Flower x={70} y={236} scale={1.05} petal="#ff9ec4" petalDark="#f06fa6" center="#ffd23f" delay={0} duration={4.2} />
            <Flower x={135} y={240} scale={0.9} petal="#ffd23f" petalDark="#f4b400" center="#ff9a3c" delay={0.8} duration={3.6} />
            <Flower x={300} y={238} scale={1.1} petal="#ffb3c1" petalDark="#ef7fa0" center="#fff0a8" delay={0.4} duration={4.6} />
            <Flower x={345} y={242} scale={0.85} petal="#c8a4ff" petalDark="#a87fe0" center="#ffd23f" delay={1.2} duration={3.9} />
            <Flower x={205} y={244} scale={0.8} petal="#ff8fa3" petalDark="#e8657f" center="#ffe066" delay={1.6} duration={4.0} />

            {/* Butterflies */}
            <Butterfly x={110} y={150} color="#ff9ec4" colorDark="#e06a98" delay={0} />
            <Butterfly x={250} y={120} color="#7fd1ff" colorDark="#3aa0e0" delay={2.5} />

            {/* White picket fence across the front */}
            <g>
              <rect x="0" y="262" width="400" height="9" rx="3" fill="#ffffff" />
              <rect x="0" y="288" width="400" height="9" rx="3" fill="#ffffff" />
              {Array.from({ length: 21 }, (_, i) => 18 + i * 19).map((px) => (
                <g key={px}>
                  <rect x={px} y="250" width="13" height="50" rx="3" fill="#ffffff" stroke="#e7e7e7" strokeWidth="1" />
                  <path d={`M${px} 250 l 6.5 -10 l 6.5 10 Z`} fill="#ffffff" stroke="#e7e7e7" strokeWidth="1" />
                </g>
              ))}
            </g>

            {/* Wooden garden sign engraved with 秋彦 */}
            <g transform="translate(200 196)">
              {/* posts */}
              <rect x="-54" y="6" width="8" height="58" rx="3" fill="#9c6b38" />
              <rect x="46" y="6" width="8" height="58" rx="3" fill="#9c6b38" />
              {/* board */}
              <rect x="-66" y="-34" width="132" height="48" rx="12" fill="url(#bkWood)" stroke="#8a5e2f" strokeWidth="2" />
              {/* wood grain */}
              <path d="M-58 -22 H 58 M-58 -10 H 58 M-58 2 H 58" stroke="#8a5e2f" strokeWidth="1" opacity="0.35" fill="none" />
              {/* engraved monogram */}
              <text
                x="0"
                y="2"
                textAnchor="middle"
                fontFamily="'Long Cang','Liu Jian Mao Cao','STXingkai','华文行楷','Xingkai SC','行楷','STKaiti','KaiTi','Noto Serif SC',serif"
                fontSize="30"
                fontWeight="700"
                fill="#5a3a18"
                style={{ opacity: 0.9 }}
              >
                秋彦
              </text>
              {/* engraved highlight (top-left) to read as carved */}
              <text
                x="-0.6"
                y="1.2"
                textAnchor="middle"
                fontFamily="'Long Cang','Liu Jian Mao Cao','STXingkai','华文行楷','Xingkai SC','行楷','STKaiti','KaiTi','Noto Serif SC',serif"
                fontSize="30"
                fontWeight="700"
                fill="#d9b483"
                opacity="0.5"
              >
                秋彦
              </text>
            </g>
          </svg>
        </div>

        {/* ═══ Brand line ═══ */}
        <div
          className="mt-10 flex flex-col items-center"
          style={{
            animation: visible ? 'bk-fade-up 0.6s ease-out 0.8s both' : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          <div
            className="text-[10px] sm:text-xs font-semibold tracking-[0.34em] text-emerald-700/80"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            QIUYAN · 繁花温室
          </div>
          <svg className="mt-2" width="120" height="10" viewBox="0 0 120 10" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="bkFlourish" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#6cae5a" stopOpacity="0" />
                <stop offset="0.5" stopColor="#6cae5a" stopOpacity="0.9" />
                <stop offset="1" stopColor="#6cae5a" stopOpacity="0" />
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
