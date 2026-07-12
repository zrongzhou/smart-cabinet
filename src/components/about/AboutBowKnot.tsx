'use client';

/**
 * AboutBowKnot — brand colophon / signature block (tech-blue gradient glow).
 * -----------------------------------------------------------
 * Sits directly under the company photo inside <CompanyShowcase> and acts as a
 * refined "colophon" that carries (承托) the image above.
 *
 * Design language — "科技蓝渐变光感" (tech-blue gradient glow):
 *  - A luminous emblem: a rounded "chip" carrying the 「秋彦」 monogram, wrapped
 *    in a cyan→blue→indigo→violet gradient stroke with a soft halo and a slowly
 *    orbiting glow node — a clean, digital, "tech" read.
 *  - Beside it a dual wordmark that always shows BOTH brand names:
 *        「秋彦」  (Chinese brand, gradient + glow)
 *        「Qtech」 (Latin wordmark, gradient + glow, letter-spaced)
 *    plus a thin letter-spaced tagline for a precise, modern finish.
 *  - Thin connecting circuit lines and scattered digital dots add texture
 *    without clutter. Everything is pure CSS/SVG (gradients, filters,
 *    drop-shadow, transform) — no external images or fonts are referenced.
 *
 * RTL-safe: the whole scene is centred and the SVG uses absolute coordinates,
 * so geometry never flips. The brand lockup is explicitly forced to LTR via the
 * `locale` prop so 「秋彦 / Qtech」 always read correctly on Arabic pages.
 *
 * i18n: the component is locale-agnostic for layout — it renders the same
 * centred lockup for `zh` / `en` / `ar`. The `locale` prop is only consumed to
 * pin the brand direction; the `t` helper is kept on the public interface for
 * API stability (brand strings are fixed and language-neutral).
 */

import { useState, useEffect, useRef } from 'react';

interface AboutBowKnotProps {
  /** Translation helper. Kept on the public interface for API stability. */
  t: (key: string) => string;
  /** Active locale; used only to keep the brand lockup LTR on RTL pages. */
  locale: string;
}

const BRAND_ZH = '秋彦';
const BRAND_EN = 'Qtech';
const TAGLINE = 'SMART STORAGE · IOT';

export default function AboutBowKnot({ locale }: AboutBowKnotProps) {
  // Brand names are script-fixed → always lay out left-to-right, even on `ar`.
  const isRtl = locale === 'ar';
  const brandDir = isRtl ? 'ltr' : 'ltr';

  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Entrance animation: reveal once the block scrolls into view.
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
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style jsx>{`
        .bk-colophon {
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.6s ease;
        }
        .bk-colophon:hover {
          transform: translateY(-2px);
        }

        /* Staggered entrance — children start hidden, reveal when visible. */
        .bk-rise {
          opacity: 0;
          transform: translateY(18px);
        }
        .bk-colophon.is-visible .bk-rise {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bk-colophon.is-visible .bk-rise-1 {
          transition-delay: 0.05s;
        }
        .bk-colophon.is-visible .bk-rise-2 {
          transition-delay: 0.22s;
        }
        .bk-colophon.is-visible .bk-rise-3 {
          transition-delay: 0.42s;
        }

        /* Soft breathing halo behind the emblem. */
        .bk-halo {
          animation: bk-breathe 5.5s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes bk-breathe {
          0%,
          100% {
            opacity: 0.55;
          }
          50% {
            opacity: 0.95;
          }
        }

        /* Glow on gradient text / strokes (keeps the source glyph crisp). */
        .bk-glow {
          filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.45))
            drop-shadow(0 0 14px rgba(99, 102, 241, 0.28));
        }

        @media (prefers-reduced-motion: reduce) {
          .bk-halo {
            animation: none;
          }
          .bk-rise {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <div
        ref={containerRef}
        className={`bk-colophon relative w-full flex flex-col items-center text-center px-4 py-8 overflow-hidden ${
          visible ? 'is-visible' : ''
        }`}
      >
        {/* ═══ Top divider — thin gradient lines + glowing node ═══ */}
        <div
          className="bk-rise bk-rise-1 flex items-center gap-3 w-full max-w-[300px] mb-7"
          aria-hidden="true"
        >
          <span
            className="h-px flex-1"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(56,189,248,0.65) 60%, rgba(99,102,241,0.9))',
            }}
          />
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: '#38bdf8',
              boxShadow: '0 0 8px 2px rgba(56,189,248,0.7)',
            }}
          />
          <span
            className="h-px flex-1"
            style={{
              background:
                'linear-gradient(90deg, rgba(99,102,241,0.9), rgba(56,189,248,0.65) 40%, transparent)',
            }}
          />
        </div>

        {/* ═══ Tech-blue gradient glow emblem + dual wordmark (pure SVG) ═══ */}
        <div
          className="bk-rise bk-rise-2 relative"
          style={{ direction: brandDir as 'ltr' | 'rtl', width: 'min(440px, 94vw)' }}
        >
          <svg
            viewBox="0 0 440 170"
            width="100%"
            height="100%"
            role="img"
            aria-label={`${BRAND_ZH} ${BRAND_EN} 品牌标识`}
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Core cyan→blue→indigo→violet gradient for strokes + text */}
              <linearGradient id="bkHue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="38%" stopColor="#38bdf8" />
                <stop offset="68%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              {/* Translucent fill for the chip body */}
              <linearGradient id="bkChipFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(34,211,238,0.10)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0.16)" />
              </linearGradient>
              {/* Radial halo behind the emblem */}
              <radialGradient id="bkHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(59,130,246,0.50)" />
                <stop offset="55%" stopColor="rgba(99,102,241,0.16)" />
                <stop offset="100%" stopColor="rgba(99,102,241,0)" />
              </radialGradient>
              {/* Soft glow filter for the orbiting node + circuit ticks */}
              <filter id="bkGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Background digital texture (faint dots) ── */}
            <g fill="#6366f1" opacity="0.18">
              <circle cx="14" cy="16" r="1.6" />
              <circle cx="424" cy="26" r="1.6" />
              <circle cx="406" cy="150" r="1.6" />
              <circle cx="22" cy="150" r="1.6" />
              <circle cx="250" cy="12" r="1.2" />
              <circle cx="360" cy="158" r="1.2" />
            </g>

            {/* ── Breathing halo behind the chip ── */}
            <ellipse
              className="bk-halo"
              cx="89"
              cy="85"
              rx="96"
              ry="96"
              fill="url(#bkHalo)"
            />

            {/* ── Orbiting glow node (rotates around chip centre) ── */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 89 85"
                to="360 89 85"
                dur="16s"
                repeatCount="indefinite"
              />
              <circle cx="89" cy="14" r="3.4" fill="#22d3ee" filter="url(#bkGlow)" />
              <circle cx="89" cy="14" r="7" fill="none" stroke="#22d3ee" strokeOpacity="0.35" />
            </g>

            {/* ── Chip: blurred stroke copy (outer glow) ── */}
            <rect
              x="30"
              y="26"
              width="118"
              height="118"
              rx="30"
              fill="none"
              stroke="url(#bkHue)"
              strokeWidth="3"
              opacity="0.55"
              filter="url(#bkGlow)"
            />
            {/* ── Chip: body + crisp gradient stroke ── */}
            <rect
              x="30"
              y="26"
              width="118"
              height="118"
              rx="30"
              fill="url(#bkChipFill)"
              stroke="url(#bkHue)"
              strokeWidth="2.4"
            />
            {/* ── Thin inner circuit ring for a precise, tech read ── */}
            <rect
              x="40"
              y="36"
              width="98"
              height="98"
              rx="24"
              fill="none"
              stroke="#38bdf8"
              strokeOpacity="0.35"
              strokeWidth="1"
            />

            {/* ── Monogram 「秋彦」 inside the chip ── */}
            <text
              className="bk-glow"
              x="89"
              y="87"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="'PingFang SC','Microsoft YaHei','Hiragino Sans GB','Noto Sans SC',system-ui,-apple-system,'Segoe UI',sans-serif"
              fontSize="46"
              fontWeight="700"
              fill="url(#bkHue)"
            >
              {BRAND_ZH}
            </text>

            {/* ── Thin connector circuit from chip to wordmark ── */}
            <g className="bk-glow">
              <path
                d="M150 85 H176"
                stroke="url(#bkHue)"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="176" cy="85" r="2.4" fill="#38bdf8" />
            </g>

            {/* ── Wordmark 「Qtech」 (Latin, gradient + glow) ── */}
            <text
              className="bk-glow"
              x="196"
              y="80"
              textAnchor="start"
              dominantBaseline="alphabetic"
              fontFamily="system-ui,-apple-system,'Segoe UI','Helvetica Neue',Arial,sans-serif"
              fontSize="50"
              fontWeight="800"
              letterSpacing="0.5"
              fill="url(#bkHue)"
            >
              {BRAND_EN}
            </text>

            {/* ── Letter-spaced tagline ── */}
            <text
              x="198"
              y="108"
              textAnchor="start"
              dominantBaseline="alphabetic"
              fontFamily="system-ui,-apple-system,'Segoe UI',Arial,sans-serif"
              fontSize="12.5"
              fontWeight="600"
              letterSpacing="3"
              fill="rgba(99,102,241,0.85)"
            >
              {TAGLINE}
            </text>

            {/* ── Little circuit ticks under the wordmark ── */}
            <g stroke="#6366f1" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round">
              <path d="M198 122 H214" />
              <path d="M222 122 H242" />
              <path d="M250 122 H268" />
            </g>
          </svg>
        </div>

        {/* ═══ Bottom flourish — gradient line + glow dot ═══ */}
        <div
          className="bk-rise bk-rise-3 mt-7 flex items-center gap-3 w-full max-w-[300px]"
          aria-hidden="true"
        >
          <span
            className="h-px flex-1"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(56,189,248,0.6) 60%, rgba(99,102,241,0.85))',
            }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#818cf8',
              boxShadow: '0 0 7px 2px rgba(129,140,248,0.6)',
            }}
          />
          <span
            className="h-px flex-1"
            style={{
              background:
                'linear-gradient(90deg, rgba(99,102,241,0.85), rgba(56,189,248,0.6) 40%, transparent)',
            }}
          />
        </div>
      </div>
    </>
  );
}
