'use client';

/**
 * AboutBowKnot — brand colophon / signature block (glassmorphism).
 * ----------------------------------------------------------------
 * Sits directly under the company photo inside <CompanyShowcase> and acts as a
 * refined "colophon" that carries (承托) the image above.
 *
 * Design language — "玻璃拟态" (Glassmorphism):
 *  - A floating frosted-glass plate (low-opacity fill + `backdrop-filter: blur`
 *    + saturated highlight border + soft cool-toned shadow) that reads as a
 *    light, airy, translucent surface — not the previous tech-blue glow.
 *  - Inside it: a smaller glass "chip" badge carrying the 「秋彦」 monogram, set
 *    beside a dual wordmark that always shows BOTH brand names:
 *        「秋彦」  (Chinese brand, lives inside the chip)
 *        「Qtech」 (Latin wordmark, soft cyan→ice-blue→lilac gradient text)
 *    plus a thin letter-spaced tagline for a precise, modern finish.
 *  - A single, very soft breathing glow blob (cool cyan/indigo) sits behind the
 *    plate for depth — it replaces the old scattered dots, orbiting glow node
 *    and thin circuit lines, which read as clutter. The look is now cleaner,
 *    lighter and more "通透".
 *  - A cool, harmonious palette (cyan / ice-blue / soft lilac) replaces the
 *    previous conflicting violet→indigo stroke.
 *
 * RTL-safe: the whole scene is centred and the brand lockup is explicitly forced
 * to LTR via the `locale` prop so 「秋彦 / Qtech」 always read correctly on
 * Arabic pages. The SVG-free layout uses absolute geometry only, so it never flips.
 *
 * SSR / no-backdrop-filter fallback: the translucent white gradient fill still
 * reads as a soft glass panel even when `backdrop-filter` is unsupported, so the
 * component degrades gracefully (solid/translucent approximation).
 *
 * i18n: the component is locale-agnostic for layout — it renders the same
 * centred lockup for `zh` / `en` / `ar`. The `locale` prop is only consumed to
 * pin the brand direction; the `t` helper is kept on the public interface for
 * API stability (brand strings are fixed and language-neutral).
 *
 * Constraints: pure CSS/SVG + styled-jsx, zero external images or fonts.
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

/** Cool, harmonious gradient stops (cyan → ice-blue → soft lilac). */
const HUE = 'linear-gradient(120deg, #5eead4 0%, #67e8f9 22%, #7dd3fc 50%, #a5b4fc 80%, #c4b5fd 100%)';

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
          transition-delay: 0.2s;
        }
        .bk-colophon.is-visible .bk-rise-3 {
          transition-delay: 0.4s;
        }

        /* ── Soft cool glow blob behind the plate (depth, not clutter) ── */
        .bk-glow-blob {
          position: absolute;
          inset: -26% -8%;
          z-index: 0;
          pointer-events: none;
          background: radial-gradient(
              58% 58% at 28% 34%,
              rgba(125, 211, 252, 0.5),
              transparent 70%
            ),
            radial-gradient(
              52% 52% at 76% 66%,
              rgba(165, 180, 252, 0.42),
              transparent 72%
            );
          filter: blur(28px);
          animation: bk-breathe 7s ease-in-out infinite;
        }
        @keyframes bk-breathe {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.04);
          }
        }

        /* ── Floating frosted-glass plate (the glassmorphism hero) ── */
        .bk-glass {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 22px 30px;
          border-radius: 30px;
          /* SSR / no-backdrop-filter fallback: a soft translucent panel. */
          background: rgba(236, 244, 255, 0.5);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.46),
            rgba(224, 238, 255, 0.24)
          );
          backdrop-filter: blur(18px) saturate(165%);
          -webkit-backdrop-filter: blur(18px) saturate(165%);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 18px 50px -20px rgba(99, 102, 241, 0.3),
            0 4px 14px -6px rgba(56, 189, 248, 0.18),
            inset 0 1px 1px rgba(255, 255, 255, 0.75);
          overflow: hidden;
        }
        /* Subtle diagonal sheen across the glass surface. */
        .bk-glass::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            118deg,
            rgba(255, 255, 255, 0.35) 0%,
            rgba(255, 255, 255, 0) 42%
          );
          pointer-events: none;
        }

        /* ── Glass chip badge carrying the 「秋彦」 monogram ── */
        .bk-emblem {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          width: 88px;
          height: 88px;
          border-radius: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.4);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.6),
            rgba(255, 255, 255, 0.18)
          );
          backdrop-filter: blur(12px) saturate(160%);
          -webkit-backdrop-filter: blur(12px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow: 0 8px 24px -8px rgba(56, 189, 248, 0.35),
            inset 0 1px 1px rgba(255, 255, 255, 0.85),
            inset 0 -1px 2px rgba(99, 102, 241, 0.1);
        }
        .bk-emblem-text {
          font-family: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB',
            'Noto Sans SC', system-ui, -apple-system, 'Segoe UI', sans-serif;
          font-size: 34px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: 1px;
          background: ${HUE};
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* ── Wordmark column ── */
        .bk-wordmark {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .bk-brand-en {
          font-family: system-ui, -apple-system, 'Segoe UI', 'Helvetica Neue',
            Arial, sans-serif;
          font-size: 44px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: 0.5px;
          background: ${HUE};
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .bk-tag {
          margin-top: 9px;
          font-family: system-ui, -apple-system, 'Segoe UI', Arial, sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          color: rgba(99, 102, 241, 0.78);
        }

        /* ── Simplified frosted dividers (no glowing nodes) ── */
        .bk-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          max-width: 300px;
        }
        .bk-line {
          height: 1px;
          flex: 1;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(125, 211, 252, 0.7) 55%,
            rgba(165, 180, 252, 0.85)
          );
        }
        .bk-line--flip {
          background: linear-gradient(
            90deg,
            rgba(165, 180, 252, 0.85),
            rgba(125, 211, 252, 0.7) 45%,
            transparent
          );
        }
        .bk-pearl {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 10px rgba(125, 211, 252, 0.45),
            inset 0 1px 1px rgba(255, 255, 255, 0.9);
        }

        @media (max-width: 380px) {
          .bk-glass {
            gap: 16px;
            padding: 18px 20px;
          }
          .bk-emblem {
            width: 72px;
            height: 72px;
            border-radius: 22px;
          }
          .bk-emblem-text {
            font-size: 28px;
          }
          .bk-brand-en {
            font-size: 36px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bk-glow-blob {
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
        className={`bk-colophon relative w-full flex flex-col items-center text-center px-4 py-8 ${
          visible ? 'is-visible' : ''
        }`}
      >
        {/* ═══ Top divider — frosted line + glass pearl ═══ */}
        <div
          className="bk-rise bk-rise-1 bk-divider mb-7"
          aria-hidden="true"
        >
          <span className="bk-line" />
          <span className="bk-pearl" />
          <span className="bk-line bk-line--flip" />
        </div>

        {/* ═══ Glassmorphism plate: chip + dual wordmark ═══ */}
        <div
          className="bk-rise bk-rise-2 relative"
          style={{ direction: brandDir as 'ltr' | 'rtl', width: 'min(440px, 94vw)' }}
        >
          {/* Soft cool glow blob behind the plate for depth */}
          <div className="bk-glow-blob" aria-hidden="true" />

          <div className="bk-glass">
            {/* Glass chip carrying the 「秋彦」 monogram */}
            <div className="bk-emblem" aria-hidden="false">
              <span className="bk-emblem-text">{BRAND_ZH}</span>
            </div>

            {/* Dual wordmark: Qtech + tagline */}
            <div className="bk-wordmark">
              <span className="bk-brand-en">{BRAND_EN}</span>
              <span className="bk-tag">{TAGLINE}</span>
            </div>
          </div>
        </div>

        {/* ═══ Bottom divider — frosted line + glass pearl ═══ */}
        <div
          className="bk-rise bk-rise-3 bk-divider mt-7"
          aria-hidden="true"
        >
          <span className="bk-line" />
          <span className="bk-pearl" />
          <span className="bk-line bk-line--flip" />
        </div>
      </div>
    </>
  );
}
