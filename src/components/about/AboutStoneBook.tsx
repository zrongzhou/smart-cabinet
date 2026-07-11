'use client';

/**
 * AboutStoneBook (V2 — modern redesign)
 * ---------------------------------------
 * A compact, modern "stone book" that sits below the company building photo
 * inside <CompanyShowcase>, replacing the old InkSignature card.
 *
 * Design principles (per user feedback "太老气了 / 倾斜角度不好看"):
 *  - No heavy rotation — flat or near-flat with a very subtle CSS perspective.
 *  - Modern slate/blue palette matching the surrounding blue-themed section.
 *  - Subtle stone texture (feTurbulence at low opacity) — elegant, not heavy.
 *  - Minimal geometric carved accents instead of old concentric-circle emblems.
 *  - Left page: brand mark (秋彦 · QIUYAN · Qtech · Est. 2010).
 *  - Right page: brief development milestones.
 *  - Compact — fits inside the 45% left column of CompanyShowcase.
 */

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

  return (
    <div className="relative w-full" style={{ perspective: '1200px' }}>
      {/* Subtle 3D tilt — near-flat, just enough to feel "open" */}
      <div
        className="relative w-full mx-auto"
        style={{
          aspectRatio: '5 / 3',
          transform: 'rotateX(3deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 500 300"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            {/* Modern slate palette with subtle blue tint */}
            <linearGradient id="sbLeft" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f8fafc" />
              <stop offset="0.6" stopColor="#f1f5f9" />
              <stop offset="1" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="sbRight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f1f5f9" />
              <stop offset="0.6" stopColor="#e8edf3" />
              <stop offset="1" stopColor="#dbe2eb" />
            </linearGradient>
            <linearGradient id="sbSpine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#cbd5e1" />
              <stop offset="0.5" stopColor="#94a3b8" />
              <stop offset="1" stopColor="#cbd5e1" />
            </linearGradient>
            {/* Subtle stone grain */}
            <filter id="sbGrain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" seed="3" result="n" />
              <feColorMatrix
                in="n"
                type="matrix"
                values="0 0 0 0 0.45  0 0 0 0 0.52  0 0 0 0 0.63  0 0 0 0.35 0"
              />
            </filter>
            <filter id="sbShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <clipPath id="sbClipL">
              <path d="M250,40 Q140,28 50,32 Q36,150 44,268 Q140,258 250,250 Z" />
            </clipPath>
            <clipPath id="sbClipR">
              <path d="M250,40 Q360,28 450,32 Q464,150 456,268 Q360,258 250,250 Z" />
            </clipPath>
          </defs>

          {/* Floor shadow — soft, modern */}
          <ellipse cx="250" cy="278" rx="200" ry="14" fill="rgba(15,23,42,0.10)" filter="url(#sbShadow)" />

          {/* Page thickness */}
          <path d="M44,266 Q140,256 250,248 L250,254 Q140,264 44,272 Z" fill="#cbd5e1" opacity="0.5" />
          <path d="M456,266 Q360,256 250,248 L250,254 Q360,264 456,272 Z" fill="#cbd5e1" opacity="0.5" />

          {/* Left page */}
          <path
            d="M250,40 Q140,28 50,32 Q36,150 44,268 Q140,258 250,250 Z"
            fill="url(#sbLeft)"
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          {/* Right page */}
          <path
            d="M250,40 Q360,28 450,32 Q464,150 456,268 Q360,258 250,250 Z"
            fill="url(#sbRight)"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Subtle stone grain — clipped to pages */}
          <g clipPath="url(#sbClipL)">
            <rect x="30" y="20" width="230" height="260" filter="url(#sbGrain)" opacity="0.10" />
          </g>
          <g clipPath="url(#sbClipR)">
            <rect x="240" y="20" width="230" height="260" filter="url(#sbGrain)" opacity="0.10" />
          </g>

          {/* Spine */}
          <path d="M246,38 Q250,34 254,38 L254,252 Q250,256 246,252 Z" fill="url(#sbSpine)" />

          {/* Modern carved accent on left page — minimal geometric lines */}
          <g stroke="#94a3b8" strokeOpacity="0.25" fill="none" strokeWidth="1">
            <line x1="100" y1="200" x2="210" y2="200" />
            <line x1="110" y1="214" x2="200" y2="214" />
            <line x1="120" y1="228" x2="190" y2="228" />
          </g>
          {/* Small diamond accent */}
          <g stroke="#64748b" strokeOpacity="0.2" fill="none" strokeWidth="1.2">
            <path d="M155,85 L170,100 L155,115 L140,100 Z" />
          </g>

          {/* Modern carved accent on right page — timeline dots */}
          <g fill="#94a3b8" opacity="0.3">
            <circle cx="300" cy="80" r="2.5" />
            <circle cx="300" cy="120" r="2.5" />
            <circle cx="300" cy="160" r="2.5" />
            <circle cx="300" cy="200" r="2.5" />
          </g>
          <g stroke="#cbd5e1" strokeOpacity="0.3" strokeWidth="1">
            <line x1="300" y1="85" x2="300" y2="195" />
          </g>
        </svg>

        {/* ===== Text overlay ===== */}
        <div className="absolute inset-0">
          {/* Left page — brand mark */}
          <div
            className="absolute flex flex-col items-center justify-center text-center"
            style={{ left: '6%', top: '12%', width: '42%', height: '76%' }}
          >
            <div
              className="font-bold leading-none"
              style={{
                fontFamily: "'Noto Serif SC','STKaiti','KaiTi','SimSun',serif",
                fontSize: 'clamp(22px, 4.5vw, 34px)',
                color: '#334155',
                letterSpacing: '0.12em',
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
            <div className="mt-2 h-px w-12 bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
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
            }}
          >
            <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-1.5">
              {t('about.timeline.title')}
            </div>
            <ul className="space-y-1.5">
              {MILESTONES.map((m) => (
                <li key={m.year} className="flex items-baseline gap-1.5">
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
  );
}
