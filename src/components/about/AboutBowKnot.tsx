'use client';

/**
 * AboutBowKnot — brand colophon / signature block (glassmorphism, warm).
 * ----------------------------------------------------------------
 * Sits directly under the company photo inside <CompanyShowcase> and acts as a
 * refined "colophon" that carries (承托) the image above.
 *
 * Design language — "玻璃拟态" (Glassmorphism), warm palette:
 *  - A floating frosted-glass plate (low-opacity fill + `backdrop-filter: blur`
 *    + saturated warm highlight border + soft WARM-toned shadow) that reads as a
 *    light, airy, translucent surface — abandoning the previous cool blue/cyan
 *    glass for a 暖琥珀 / 蜜桃 / 暖金 / 暖橙 (warm amber / peach / gold / orange)
 *    translucent gradient, matching the 「秋彦 / Qiuyan」 ("秋" = autumn = warm)
 *    brand tone.
 *  - Inside it: a smaller glass "chip" badge carrying the 「秋彦」 monogram, set
 *    beside a dual wordmark that always shows BOTH brand names:
 *        「秋彦」  (Chinese brand, lives inside the chip)
 *        「Qtech」 (Latin wordmark, warm amber→gold→orange→peach gradient text)
 *    plus a thin letter-spaced tagline for a precise, modern finish.
 *  - A single, soft warm glow blob (amber + gold) sits behind the plate for
 *    depth — static (no breathing), replacing the old cool breathing node.
 *  - Refined, restrained geometry: cleaner curves, a lighter highlight border,
 *    no bloated detail. The bottom decorative line has been REMOVED entirely
 *    (only the top accent divider remains as a visual link to the photo above).
 *
 * Motion (smooth, restrained, premium):
 *  - A one-shot staggered entrance reveal when scrolled into view.
 *  - A single, gentle light-sweep (光泽扫过) across the glass on entrance.
 *  - A very subtle hover float (极轻微悬浮).
 *  - NO breathing scale / flicker / blink loops — those were removed.
 *  - Fully honours `prefers-reduced-motion` (basically static).
 *
 * RTL-safe: the whole scene is centred and the brand lockup is explicitly forced
 * to LTR via the `locale` prop so 「秋彦 / Qtech」 always read correctly on
 * Arabic pages. The SVG-free layout uses absolute geometry only, so it never flips.
 *
 * SSR / no-backdrop-filter fallback: the translucent warm gradient fill still
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

/** Warm, harmonious gradient stops (amber → gold → orange → peach). */
const HUE =
  'linear-gradient(120deg, #fcd34d 0%, #fbbf24 28%, #fb923c 60%, #fdba74 100%)';

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
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.6s ease;
        }
        .bk-colophon:hover {
          transform: translateY(-2px);
        }

        /* Staggered entrance — children start hidden, reveal when visible. */
        .bk-rise {
          opacity: 0;
          transform: translateY(16px);
        }
        .bk-colophon.is-visible .bk-rise {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.7s ease,
            transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .bk-colophon.is-visible .bk-rise-1 {
          transition-delay: 0.05s;
        }
        .bk-colophon.is-visible .bk-rise-2 {
          transition-delay: 0.2s;
        }

        /* ── Soft WARM glow blob behind the plate (static depth, no breathing) ── */
        .bk-glow-blob {
          position: absolute;
          inset: -26% -8%;
          z-index: 0;
          pointer-events: none;
          background: radial-gradient(
              58% 58% at 28% 34%,
              rgba(251, 146, 60, 0.42),
              transparent 70%
            ),
            radial-gradient(
              52% 52% at 76% 66%,
              rgba(252, 211, 77, 0.36),
              transparent 72%
            );
          filter: blur(28px);
        }

        /* ── Floating frosted-glass plate (the glassmorphism hero, WARM) ── */
        .bk-glass {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 22px;
          padding: 22px 30px;
          border-radius: 30px;
          /* SSR / no-backdrop-filter fallback: a soft translucent warm panel. */
          background: rgba(255, 247, 237, 0.55);
          background: linear-gradient(
            135deg,
            rgba(255, 251, 242, 0.5),
            rgba(254, 215, 170, 0.24)
          );
          backdrop-filter: blur(18px) saturate(165%);
          -webkit-backdrop-filter: blur(18px) saturate(165%);
          border: 1px solid rgba(255, 237, 213, 0.7);
          box-shadow: 0 18px 50px -20px rgba(217, 119, 6, 0.28),
            0 4px 14px -6px rgba(249, 115, 22, 0.16),
            inset 0 1px 1px rgba(255, 255, 255, 0.8);
          overflow: hidden;
        }
        /* Static diagonal sheen across the glass surface (subtle, premium). */
        .bk-glass::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            118deg,
            rgba(255, 255, 255, 0.38) 0%,
            rgba(255, 255, 255, 0) 42%
          );
          pointer-events: none;
        }
        /* One-shot light-sweep (光泽扫过) — plays a single time on entrance. */
        .bk-glass::before {
          content: '';
          position: absolute;
          top: 0;
          left: -65%;
          width: 55%;
          height: 100%;
          background: linear-gradient(
            105deg,
            transparent,
            rgba(255, 255, 255, 0.42),
            transparent
          );
          transform: skewX(-18deg);
          pointer-events: none;
          z-index: 2;
        }
        .bk-colophon.is-visible .bk-glass::before {
          animation: bk-sweep 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.45s 1
            forwards;
        }
        @keyframes bk-sweep {
          from {
            left: -65%;
          }
          to {
            left: 120%;
          }
        }

        /* ── Glass chip badge carrying the 「秋彦」 monogram (WARM) ── */
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
          background: rgba(255, 255, 255, 0.42);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.62),
            rgba(254, 215, 170, 0.2)
          );
          backdrop-filter: blur(12px) saturate(160%);
          -webkit-backdrop-filter: blur(12px) saturate(160%);
          border: 1px solid rgba(255, 237, 213, 0.78);
          box-shadow: 0 8px 24px -8px rgba(249, 115, 22, 0.3),
            inset 0 1px 1px rgba(255, 255, 255, 0.88),
            inset 0 -1px 2px rgba(217, 119, 6, 0.08);
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
          color: rgba(217, 119, 6, 0.78);
        }

        /* ── Refined frosted top divider (WARM, links to photo above) ── */
        .bk-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          max-width: 300px;
        }
        .bk-top-rule {
          height: 1px;
          flex: 1;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(251, 146, 60, 0.7) 55%,
            rgba(252, 211, 77, 0.85)
          );
        }
        .bk-top-rule--flip {
          background: linear-gradient(
            90deg,
            rgba(252, 211, 77, 0.85),
            rgba(251, 146, 60, 0.7) 45%,
            transparent
          );
        }
        .bk-top-dot {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: rgba(255, 245, 235, 0.85);
          border: 1px solid rgba(255, 237, 213, 0.9);
          box-shadow: 0 0 10px rgba(251, 146, 60, 0.4),
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

        /* ── Reduced motion: basically static ── */
        @media (prefers-reduced-motion: reduce) {
          .bk-colophon,
          .bk-colophon:hover {
            transform: none;
          }
          .bk-glass::before {
            animation: none;
            left: -65%;
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
        {/* ═══ Top divider — frosted rule + warm glass dot ═══ */}
        <div className="bk-rise bk-rise-1 bk-divider mb-7" aria-hidden="true">
          <span className="bk-top-rule" />
          <span className="bk-top-dot" />
          <span className="bk-top-rule bk-top-rule--flip" />
        </div>

        {/* ═══ Glassmorphism plate: chip + dual wordmark ═══ */}
        <div
          className="bk-rise bk-rise-2 relative"
          style={{ direction: brandDir as 'ltr' | 'rtl', width: 'min(440px, 94vw)' }}
        >
          {/* Soft warm glow blob behind the plate for depth (static) */}
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

        {/* NOTE: the previous bottom decorative divider has been removed
            entirely per design feedback — the signature now ends cleanly. */}
      </div>
    </>
  );
}
