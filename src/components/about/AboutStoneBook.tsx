'use client';

/**
 * AboutStoneBook (V3 — refined + animated)
 * -----------------------------------------
 * Compact stone book integrated into <CompanyShowcase> below the company photo.
 *
 * V3 enhancements (per user feedback "不够精美，缺乏条纹和颜色还有动画"):
 *  - Richer SVG: decorative border frames, carved corner ornaments, layered
 *    stone gradients with blue/indigo/gold accents, page edge stripes.
 *  - Animations: IntersectionObserver scroll-triggered entrance (book opens),
 *    staggered content reveal (brand → milestones), hover lift + glow,
 *    subtle continuous spine shimmer.
 */

import { useState, useEffect, useRef } from 'react';

interface AboutStoneBookProps {
  t: (key: string) => string;
  locale: string;
}

const MILESTONES = [
  { year: '2015', titleKey: 'about.timeline.2015.title' },
  { year: '2018', titleKey: 'about.timeline.2018.title' },
  { year: '2021', titleKey: 'about.timeline.2021.title' },
  { year: '2024', titleKey: 'about.timeline.2024.title' },
];

export default function AboutStoneBook({ t, locale }: AboutStoneBookProps) {
  const isRTL = locale === 'ar';
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes sb-book-enter {
          0%   { opacity: 0; transform: perspective(1200px) rotateX(12deg) translateY(30px) scale(0.92); }
          100% { opacity: 1; transform: perspective(1200px) rotateX(3deg) translateY(0) scale(1); }
        }
        @keyframes sb-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sb-shimmer {
          0%   { opacity: 0.3; transform: translateX(-60%); }
          50%  { opacity: 0.6; }
          100% { opacity: 0.3; transform: translateX(60%); }
        }
        @keyframes sb-glow-pulse {
          0%, 100% { opacity: 0.15; }
          50%      { opacity: 0.35; }
        }
        .sb-container {
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .sb-container:hover {
          transform: translateY(-4px);
        }
        .sb-container:hover .sb-glow {
          opacity: 0.5;
        }
      `}</style>

      <div
        ref={containerRef}
        className="sb-container relative w-full"
        style={{ perspective: '1200px' }}
      >
        {/* Ambient glow behind the book */}
        <div
          className="sb-glow absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)',
            opacity: 0.2,
          }}
        />

        <div
          className="relative w-full mx-auto"
          style={{
            aspectRatio: '5 / 3',
            transformStyle: 'preserve-3d',
            animation: visible ? 'sb-book-enter 1s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none',
            opacity: visible ? undefined : 0,
          }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 500 300"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              {/* Richer page gradients with blue/indigo tints */}
              <linearGradient id="sbLeftV3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fafbfc" />
                <stop offset="0.4" stopColor="#f0f4fa" />
                <stop offset="0.8" stopColor="#e4eaf2" />
                <stop offset="1" stopColor="#d8dfe9" />
              </linearGradient>
              <linearGradient id="sbRightV3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f0f4fa" />
                <stop offset="0.5" stopColor="#e8edf5" />
                <stop offset="1" stopColor="#d4dce8" />
              </linearGradient>
              <linearGradient id="sbSpineV3" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#b8c2d1" />
                <stop offset="0.3" stopColor="#8b96aa" />
                <stop offset="0.5" stopColor="#6b7689" />
                <stop offset="0.7" stopColor="#8b96aa" />
                <stop offset="1" stopColor="#b8c2d1" />
              </linearGradient>
              {/* Gold accent gradient */}
              <linearGradient id="sbGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#d4a843" stopOpacity="0" />
                <stop offset="0.5" stopColor="#d4a843" stopOpacity="0.5" />
                <stop offset="1" stopColor="#d4a843" stopOpacity="0" />
              </linearGradient>
              {/* Stone grain */}
              <filter id="sbGrainV3" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="5" result="n" />
                <feColorMatrix
                  in="n"
                  type="matrix"
                  values="0 0 0 0 0.40  0 0 0 0 0.48  0 0 0 0 0.60  0 0 0 0.4 0"
                />
              </filter>
              <filter id="sbBlurV3" x="-10%" y="-10%" width="120%" height="130%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
              <clipPath id="sbClipLV3">
                <path d="M250,40 Q140,28 50,32 Q36,150 44,268 Q140,258 250,250 Z" />
              </clipPath>
              <clipPath id="sbClipRV3">
                <path d="M250,40 Q360,28 450,32 Q464,150 456,268 Q360,258 250,250 Z" />
              </clipPath>
            </defs>

            {/* Floor shadow */}
            <ellipse cx="250" cy="278" rx="205" ry="14" fill="rgba(15,23,42,0.12)" filter="url(#sbBlurV3)" />

            {/* Page thickness */}
            <path d="M44,266 Q140,256 250,248 L250,254 Q140,264 44,272 Z" fill="#b8c2d1" opacity="0.55" />
            <path d="M456,266 Q360,256 250,248 L250,254 Q360,264 456,272 Z" fill="#b8c2d1" opacity="0.55" />

            {/* Left page */}
            <path
              d="M250,40 Q140,28 50,32 Q36,150 44,268 Q140,258 250,250 Z"
              fill="url(#sbLeftV3)"
              stroke="#c2cad8"
              strokeWidth="1"
            />
            {/* Right page */}
            <path
              d="M250,40 Q360,28 450,32 Q464,150 456,268 Q360,258 250,250 Z"
              fill="url(#sbRightV3)"
              stroke="#c2cad8"
              strokeWidth="1"
            />

            {/* Stone grain — clipped to pages */}
            <g clipPath="url(#sbClipLV3)">
              <rect x="30" y="20" width="230" height="260" filter="url(#sbGrainV3)" opacity="0.12" />
            </g>
            <g clipPath="url(#sbClipRV3)">
              <rect x="240" y="20" width="230" height="260" filter="url(#sbGrainV3)" opacity="0.12" />
            </g>

            {/* ═══ Decorative border frames on each page ═══ */}
            <g fill="none" stroke="#9aa5b8" strokeOpacity="0.25" strokeWidth="0.8">
              {/* Left page inner border */}
              <path d="M70,55 Q140,48 235,52 L235,242 Q140,250 62,246 Z" />
              {/* Right page inner border */}
              <path d="M265,52 Q360,48 430,55 L438,246 Q360,250 265,242 Z" />
            </g>

            {/* ═══ Carved corner ornaments (geometric flourishes) ═══ */}
            <g fill="none" stroke="#7b8aa3" strokeOpacity="0.3" strokeWidth="1">
              {/* Left page corners */}
              <path d="M72,58 L82,58 L82,68" />
              <path d="M72,58 L72,68 L82,68" />
              <path d="M233,55 L223,55 L223,65" />
              <path d="M233,55 L233,65 L223,65" />
              <path d="M62,244 L72,244 L72,234" />
              <path d="M62,244 L62,234 L72,234" />
              <path d="M235,240 L225,240 L225,230" />
              <path d="M235,240 L235,230 L225,230" />
              {/* Right page corners */}
              <path d="M267,55 L277,55 L277,65" />
              <path d="M267,55 L267,65 L277,65" />
              <path d="M428,58 L418,58 L418,68" />
              <path d="M428,58 L428,68 L418,68" />
              <path d="M265,240 L275,240 L275,230" />
              <path d="M265,240 L265,230 L275,230" />
              <path d="M436,244 L426,244 L426,234" />
              <path d="M436,244 L436,234 L426,234" />
            </g>

            {/* ═══ Decorative stripe bands (gold-accented) ═══ */}
            <g clipPath="url(#sbClipLV3)">
              <rect x="60" y="180" width="180" height="1.5" fill="url(#sbGold)" />
              <rect x="70" y="185" width="160" height="0.5" fill="#c9a067" opacity="0.2" />
            </g>
            <g clipPath="url(#sbClipRV3)">
              <rect x="270" y="62" width="170" height="1.5" fill="url(#sbGold)" />
              <rect x="280" y="67" width="150" height="0.5" fill="#c9a067" opacity="0.2" />
              <rect x="270" y="225" width="170" height="1.5" fill="url(#sbGold)" />
            </g>

            {/* Spine */}
            <path d="M246,38 Q250,34 254,38 L254,252 Q250,256 246,252 Z" fill="url(#sbSpineV3)" />
            {/* Spine highlight */}
            <path d="M249,40 L249,250" stroke="#dde3ed" strokeWidth="0.5" opacity="0.5" />

            {/* ═══ Left page: diamond emblem + carved lines ═══ */}
            <g stroke="#6b7689" strokeOpacity="0.25" fill="none" strokeWidth="1.2">
              {/* Diamond emblem */}
              <path d="M155,80 L172,95 L155,110 L138,95 Z" />
              <path d="M155,86 L165,95 L155,104 L145,95 Z" />
            </g>
            {/* Subtle carved lines below emblem */}
            <g stroke="#9aa5b8" strokeOpacity="0.2" strokeWidth="0.8">
              <line x1="100" y1="195" x2="210" y2="195" />
              <line x1="110" y1="205" x2="200" y2="205" />
              <line x1="120" y1="215" x2="190" y2="215" />
            </g>

            {/* ═══ Right page: timeline rail with dots ═══ */}
            <g>
              {/* Vertical rail */}
              <line x1="300" y1="80" x2="300" y2="210" stroke="#b0bcd0" strokeWidth="1.5" strokeOpacity="0.4" />
              {/* Milestone dots with blue accents */}
              <circle cx="300" cy="80" r="3.5" fill="#3b82f6" opacity="0.4" />
              <circle cx="300" cy="80" r="2" fill="#3b82f6" opacity="0.7" />
              <circle cx="300" cy="120" r="3.5" fill="#6366f1" opacity="0.4" />
              <circle cx="300" cy="120" r="2" fill="#6366f1" opacity="0.7" />
              <circle cx="300" cy="160" r="3.5" fill="#8b5cf6" opacity="0.4" />
              <circle cx="300" cy="160" r="2" fill="#8b5cf6" opacity="0.7" />
              <circle cx="300" cy="200" r="3.5" fill="#a855f7" opacity="0.4" />
              <circle cx="300" cy="200" r="2" fill="#a855f7" opacity="0.7" />
            </g>
          </svg>

          {/* Spine shimmer effect */}
          <div
            className="absolute pointer-events-none overflow-hidden"
            style={{
              left: '48.5%',
              top: '13%',
              width: '3%',
              height: '76%',
            }}
          >
            <div
              className="h-full w-full"
              style={{
                background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: visible ? 'sb-shimmer 4s ease-in-out infinite' : 'none',
              }}
            />
          </div>

          {/* ===== Text overlay ===== */}
          <div className="absolute inset-0">
            {/* Left page — brand mark */}
            <div
              className="absolute flex flex-col items-center justify-center text-center"
              style={{
                left: '6%',
                top: '12%',
                width: '42%',
                height: '76%',
                animation: visible ? 'sb-fade-up 0.6s ease-out 0.4s both' : 'none',
                opacity: visible ? undefined : 0,
              }}
            >
              <div
                className="font-bold leading-none"
                style={{
                  fontFamily: "'Noto Serif SC','STKaiti','KaiTi','SimSun',serif",
                  fontSize: 'clamp(22px, 4.5vw, 34px)',
                  color: '#334155',
                  letterSpacing: '0.12em',
                  textShadow: '0 1px 2px rgba(51,65,85,0.1)',
                }}
              >
                秋彦
              </div>
              <div
                className="mt-1.5 text-[9px] sm:text-[10px] font-semibold tracking-[0.3em] text-slate-500"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                QIUYAN
              </div>
              <div className="mt-0.5 text-[8px] sm:text-[9px] tracking-[0.2em] uppercase text-slate-400">
                Technology · Est. 2010
              </div>
              <div className="mt-2 h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #d4a843 50%, transparent)' }} />
              <div className="mt-2 text-base sm:text-lg font-extrabold tracking-tight text-slate-600">
                Qtech
              </div>
            </div>

            {/* Right page — milestones */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: '52%',
                top: '14%',
                width: '42%',
                height: '76%',
                direction: isRTL ? 'rtl' : 'ltr',
                animation: visible ? 'sb-fade-up 0.6s ease-out 0.6s both' : 'none',
                opacity: visible ? undefined : 0,
              }}
            >
              <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-1.5">
                {t('about.timeline.title')}
              </div>
              <ul className="space-y-1.5">
                {MILESTONES.map((m, idx) => (
                  <li
                    key={m.year}
                    className="flex items-baseline gap-1.5"
                    style={{
                      animation: visible ? `sb-fade-up 0.5s ease-out ${0.7 + idx * 0.12}s both` : 'none',
                      opacity: visible ? undefined : 0,
                    }}
                  >
                    <span className="shrink-0 text-[10px] font-bold text-slate-600 tabular-nums">
                      {m.year}
                    </span>
                    <span className="text-[10px] sm:text-[11px] leading-snug text-slate-500 line-clamp-2">
                      {t(m.titleKey)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
