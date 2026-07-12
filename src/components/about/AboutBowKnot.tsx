'use client';

/**
 * AboutBowKnot — brand colophon / signature block (3D realistic nameplate).
 * -----------------------------------------------------------
 * Sits directly under the company photo inside <CompanyShowcase> and acts as
 * a refined "colophon" that carries (承托) the image above.
 *
 * Design language — "拟物写实铭牌" (photorealistic engraved nameplate):
 *  - A solid wooden plaque carries a brushed BRASS nameplate. The plate reads
 *    as a real object: it has visible THICKNESS (an offset "side" rect under
 *    the top face), a beveled raised edge, corner screws, a soft specular
 *    sheen, and a cast ground shadow.
 *  - The brand monogram 「秋彦」 is ENGRAVED (incised) into the brass using a
 *    three-layer emboss trick (a dark shadow copy, a recessed base, and a
 *    light highlight copy) so it looks carved, not printed.
 *  - Everything is pure CSS/SVG (gradients, filters, box-shadow, transform) —
 *    no external images or fonts are referenced.
 *
 * RTL-safe: the whole scene is centred and symmetrical; nothing is hard-pinned
 * to left/right, so Arabic layout mirrors cleanly. The `locale` prop drives
 * only the optional RTL mirroring; geometry stays centred.
 */

import { useState, useEffect, useRef } from 'react';

interface AboutBowKnotProps {
  /** Translation helper. Kept on the public interface for API stability. */
  t: (key: string) => string;
  /** Active locale; drives RTL mirroring only (geometry stays centred). */
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
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
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
          className="flex items-center gap-3 w-full max-w-[260px] mb-6"
          aria-hidden="true"
          style={{
            animation: visible ? 'bk-fade-up 0.6s ease-out 0.1s both' : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          <span
            className="h-px flex-1"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(150,120,70,0.6) 50%, transparent)' }}
          />
          <span className="w-1.5 h-1.5 rotate-45" style={{ background: '#b8893a' }} />
          <span
            className="h-px flex-1"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(150,120,70,0.6) 50%, transparent)' }}
          />
        </div>

        {/* ═══ The 3D realistic brass nameplate (pure CSS/SVG) ═══ */}
        <div
          className="relative flex items-center justify-center"
          style={{
            direction: isRtl ? 'rtl' : 'ltr',
            width: 'min(380px, 92vw)',
            height: 'min(232px, 64vw)',
            animation: visible ? 'bk-fade-up 0.7s ease-out 0.25s both' : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          <svg
            viewBox="0 0 400 260"
            width="100%"
            height="100%"
            role="img"
            aria-label="秋彦 铭牌"
            className="drop-shadow-[0_18px_34px_rgba(40,25,10,0.32)]"
          >
            <defs>
              {/* Wooden plaque body */}
              <linearGradient id="bkWood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7a5230" />
                <stop offset="55%" stopColor="#5c3c20" />
                <stop offset="100%" stopColor="#41291546" />
              </linearGradient>
              {/* Brass face — warm sheen top to deeper bottom */}
              <linearGradient id="bkBrass" x1="0" y1="0" x2="0.15" y2="1">
                <stop offset="0%" stopColor="#fbeeb4" />
                <stop offset="42%" stopColor="#e0bb63" />
                <stop offset="100%" stopColor="#a9772c" />
              </linearGradient>
              {/* Raised bevel edge */}
              <linearGradient id="bkBevel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(255,250,224,0.95)" />
                <stop offset="100%" stopColor="rgba(86,58,18,0.55)" />
              </linearGradient>
              {/* Screw head */}
              <radialGradient id="bkScrew" cx="38%" cy="34%" r="70%">
                <stop offset="0%" stopColor="#f6f6f6" />
                <stop offset="55%" stopColor="#c4c4c4" />
                <stop offset="100%" stopColor="#6c6c6c" />
              </radialGradient>
              {/* Cast ground shadow */}
              <radialGradient id="bkGround" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.38)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
              {/* Top specular sheen */}
              <linearGradient id="bkSheen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>

            {/* Ground shadow */}
            <ellipse cx="200" cy="232" rx="152" ry="18" fill="url(#bkGround)" />

            {/* Wooden plaque — thickness (side) + top face */}
            <rect x="34" y="74" width="332" height="150" rx="22" fill="#3a2410" />
            <rect x="34" y="58" width="332" height="150" rx="22" fill="url(#bkWood)" stroke="#2c1a0b" strokeWidth="2" />
            {/* subtle wood grain */}
            <g stroke="#3c2611" strokeWidth="1" opacity="0.25" fill="none">
              <path d="M50 96 Q 200 86 350 98" />
              <path d="M50 124 Q 200 116 350 126" />
              <path d="M50 156 Q 200 148 350 158" />
              <path d="M50 184 Q 200 178 350 186" />
            </g>

            {/* Brass nameplate — thickness (side) + top face */}
            <rect x="66" y="102" width="268" height="100" rx="14" fill="#6f4f1b" />
            <rect x="66" y="92" width="268" height="100" rx="14" fill="url(#bkBrass)" />
            {/* raised bevel edge */}
            <rect x="74" y="100" width="252" height="84" rx="10" fill="none" stroke="url(#bkBevel)" strokeWidth="2.5" />
            {/* top sheen across the brass */}
            <path d="M78 100 Q 200 92 322 100 L 322 118 Q 200 110 78 118 Z" fill="url(#bkSheen)" opacity="0.5" />
            {/* corner specular blob */}
            <ellipse cx="112" cy="112" rx="58" ry="18" fill="#ffffff" opacity="0.12" />

            {/* Corner screws */}
            {[
              [88, 112],
              [312, 112],
              [88, 172],
              [312, 172],
            ].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="7.5" fill="url(#bkScrew)" stroke="#5a5a5a" strokeWidth="1" />
                <line x1={cx - 4.5} y1={cy} x2={cx + 4.5} y2={cy} stroke="#6a6a6a" strokeWidth="1.6" strokeLinecap="round" />
              </g>
            ))}

            {/* Engraved monogram 「秋彦」 — three-layer incised emboss */}
            <g
              fontFamily="'Songti SC','SimSun','STSong','Noto Serif SC',Georgia,'Times New Roman',serif"
              fontWeight="700"
              fontSize="60"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {/* shadow (down-right inside the groove) */}
              <text x="201.5" y="144.5" fill="rgba(45,28,8,0.55)">秋彦</text>
              {/* recessed base */}
              <text x="200" y="143" fill="#c39a4f">秋彦</text>
              {/* highlight (up-left lit edge) */}
              <text x="198.5" y="141.5" fill="rgba(255,246,214,0.85)">秋彦</text>
            </g>
          </svg>
        </div>

        {/* ═══ Brand line ═══ */}
        <div
          className="mt-9 flex flex-col items-center"
          style={{
            animation: visible ? 'bk-fade-up 0.6s ease-out 0.8s both' : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          <div
            className="text-[10px] sm:text-xs font-semibold tracking-[0.34em] text-amber-800/90"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            QIUYAN · 秋彦
          </div>
          <svg className="mt-2" width="120" height="10" viewBox="0 0 120 10" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="bkFlourish" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#b8893a" stopOpacity="0" />
                <stop offset="0.5" stopColor="#b8893a" stopOpacity="0.9" />
                <stop offset="1" stopColor="#b8893a" stopOpacity="0" />
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
