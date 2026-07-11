'use client';

/**
 * AboutStoneBook
 * ----------------
 * A half-open "stone book" brand-chronicle band for the About page (Task C).
 *
 * Left page  : company signature / brand mark (秋彦 · QIUYAN · Qtech · Technology · Est. 2010)
 * Right page : a short development-history (发展历程 / milestones) drawn from the
 *              existing `about.timeline.*` i18n keys.
 *
 * Implementation choice: SVG for the stone book (gradient + feTurbulence grain +
 * carved emblem / ruled lines + soft shadow) with an HTML overlay for the text so it
 * stays fully responsive and localizable (en / zh / ar). The book geometry is
 * fixed LTR; only the in-page text is localized (RTL for Arabic).
 */

interface AboutStoneBookProps {
  t: (key: string) => string;
  locale: string;
}

// Right-page milestones — reuse the existing timeline i18n copy.
const MILESTONES = [
  { year: '2015', titleKey: 'about.timeline.2015.title' },
  { year: '2018', titleKey: 'about.timeline.2018.title' },
  { year: '2021', titleKey: 'about.timeline.2021.title' },
  { year: '2024', titleKey: 'about.timeline.2024.title' },
  { year: '2026', titleKey: 'about.timeline.2026.title' },
];

// Section eyebrow, trilingual (self-contained — no extra i18n keys required).
const EYEBROW: Record<string, string> = {
  en: 'Brand Chronicle',
  zh: '品牌志',
  ar: 'سيرة العلامة',
};

/** Pure-SVG stone book (visual only; text is an HTML overlay). */
function StoneBookSvg() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 680 420"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="stoneL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef1f6" />
          <stop offset="1" stopColor="#dde2ec" />
        </linearGradient>
        <linearGradient id="stoneR" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9edf4" />
          <stop offset="1" stopColor="#d6dce8" />
        </linearGradient>
        <linearGradient id="spineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b9c0cf" />
          <stop offset="0.5" stopColor="#9aa3b6" />
          <stop offset="1" stopColor="#b9c0cf" />
        </linearGradient>
        <filter id="stoneTex" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.55  0 0 0 0 0.58  0 0 0 0 0.64  0 0 0 0.5 0"
          />
        </filter>
        <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <clipPath id="bookClip">
          <path d="M340,120 Q200,96 66,96 Q40,210 54,350 Q200,338 340,322 Z" />
          <path d="M340,120 Q480,96 614,96 Q640,210 626,350 Q480,338 340,322 Z" />
        </clipPath>
      </defs>

      {/* Floor shadow */}
      <ellipse cx="340" cy="374" rx="280" ry="24" fill="rgba(15,23,42,0.16)" filter="url(#softBlur)" />

      {/* Book — slightly tilted for the "half-open" feel */}
      <g transform="rotate(-3 340 210)">
        {/* Page thickness (a few stacked sheets at the bottom edge) */}
        <path d="M54,352 Q200,340 340,324 L340,332 Q200,348 54,360 Z" fill="#c4cad8" opacity="0.7" />
        <path d="M626,352 Q480,340 340,324 L340,332 Q480,348 626,360 Z" fill="#c4cad8" opacity="0.7" />

        {/* Left page */}
        <path
          d="M340,120 Q200,96 66,96 Q40,210 54,350 Q200,338 340,322 Z"
          fill="url(#stoneL)"
          stroke="#b7bfd0"
          strokeWidth="1.5"
        />
        {/* Right page */}
        <path
          d="M340,120 Q480,96 614,96 Q640,210 626,350 Q480,338 340,322 Z"
          fill="url(#stoneR)"
          stroke="#b7bfd0"
          strokeWidth="1.5"
        />

        {/* Stone grain overlay (clipped to the book) */}
        <g clipPath="url(#bookClip)">
          <rect x="30" y="80" width="620" height="300" filter="url(#stoneTex)" opacity="0.22" />
        </g>

        {/* Spine ridge */}
        <path
          d="M334,118 Q340,112 346,118 L346,324 Q340,330 334,324 Z"
          fill="url(#spineGrad)"
        />

        {/* Carved emblem on the left page (concentric seal + diamond) */}
        <g stroke="#9aa3b4" strokeOpacity="0.5" fill="none" strokeWidth="1.4">
          <circle cx="185" cy="200" r="44" />
          <circle cx="185" cy="200" r="33" />
          <circle cx="185" cy="200" r="20" />
          <path d="M185,156 L205,200 L185,244 L165,200 Z" />
        </g>
        {/* Faint carved ruled lines on the left page */}
        <g stroke="#aeb6c6" strokeOpacity="0.4" strokeWidth="1">
          <line x1="92" y1="278" x2="288" y2="278" />
          <line x1="92" y1="294" x2="288" y2="294" />
          <line x1="92" y1="310" x2="258" y2="310" />
        </g>

        {/* Faint ledger rules on the right page */}
        <g stroke="#b3bbca" strokeOpacity="0.4" strokeWidth="1">
          <line x1="402" y1="150" x2="610" y2="150" />
          <line x1="402" y1="168" x2="610" y2="168" />
          <line x1="402" y1="186" x2="610" y2="186" />
          <line x1="402" y1="204" x2="610" y2="204" />
          <line x1="402" y1="222" x2="610" y2="222" />
          <line x1="402" y1="240" x2="610" y2="240" />
          <line x1="402" y1="258" x2="610" y2="258" />
          <line x1="402" y1="276" x2="610" y2="276" />
          <line x1="402" y1="294" x2="610" y2="294" />
        </g>
      </g>
    </svg>
  );
}

export default function AboutStoneBook({ t, locale }: AboutStoneBookProps) {
  const isRTL = locale === 'ar';
  const eyebrow = EYEBROW[locale] || EYEBROW.en;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Eyebrow */}
      <div className="text-center mb-10">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider bg-gradient-to-r from-slate-100 to-stone-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block mr-2 align-middle" />
          {eyebrow}
        </span>
      </div>

      {/* The stone book */}
      <div
        className="relative mx-auto w-full max-w-3xl"
        style={{ aspectRatio: '680 / 420' }}
      >
        <StoneBookSvg />

        {/* ===== Text overlay (scales with the book) ===== */}
        <div className="absolute inset-0">
          {/* Left page — brand seal */}
          <div
            className="absolute flex h-full flex-col items-center justify-center text-center"
            style={{ left: '8%', top: '14%', width: '42%', height: '72%' }}
          >
            {/* Hand-written signature 「秋彦」 */}
            <div
              className="font-bold leading-none"
              style={{
                fontFamily:
                  "'STKaiti','KaiTi','SimSun','Noto Serif SC','Ma Shan Zheng',cursive",
                fontSize: 'clamp(28px, 6vw, 46px)',
                color: '#3b3a4a',
                transform: 'rotate(-3deg)',
                textShadow: '1px 1px 0 rgba(160,140,110,0.18)',
              }}
            >
              秋彦
            </div>
            <div
              className="mt-2 text-[10px] sm:text-xs font-semibold tracking-[0.35em] text-slate-500"
              style={{ fontFamily: 'Georgia,"Times New Roman","Noto Serif SC",serif' }}
            >
              QIUYAN
            </div>
            <div className="mt-1 text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-slate-400">
              Technology · Est. 2010
            </div>
            <div className="mt-3 h-px w-16 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            <div className="mt-3 text-lg sm:text-xl font-extrabold tracking-tight text-slate-700">
              Qtech
            </div>
          </div>

          {/* Right page — development history */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: '52%',
              top: '15%',
              width: '42%',
              height: '72%',
              direction: isRTL ? 'rtl' : 'ltr',
            }}
          >
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">
              {t('about.timeline.title')}
            </div>
            <ul className="space-y-2">
              {MILESTONES.map((m) => (
                <li key={m.year} className="flex items-baseline gap-2">
                  <span className="shrink-0 text-[11px] font-bold text-slate-700 tabular-nums">
                    {m.year}
                  </span>
                  <span className="text-[11px] sm:text-[12px] leading-snug text-slate-600">
                    {t(m.titleKey)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
