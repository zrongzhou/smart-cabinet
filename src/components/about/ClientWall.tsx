'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ClientWall — Card Carousel v10
 * ----------------------------------------
 * Displays all 36 clients in an **animated card carousel** that shows 4-5 cards
 * at a time and auto-rotates through pages with smooth transitions.
 *
 * Design:
 *  - Desktop: 4 cards visible per page → 9 pages of 4 (36 total)
 *  - Tablet:  3 cards visible → 12 pages
 *  - Mobile:  2 cards visible → 18 pages
 *  - Auto-advance every 5 seconds with smooth CSS transform
 *  - Pause on hover/focus
 *  - Left/right arrows + dot indicators
 *  - Each card: monogram circle + name + industry + years + slogan
 *  - Cards animate in with staggered fade+slide on page change
 */

interface ClientItem {
  key: string;
  nameZh: string;
  nameEn: string;
  industryKey: string;
  years: number;
  sloganKey: string;
}

/** Full client list — ordered by brand recognition */
const CLIENTS: ClientItem[] = [
  // ── Tier-1 global brands ──────────────────
  { key: 'Huawei',       nameZh: '华为',     nameEn: 'HUAWEI',          industryKey: 'about.industries.electronics',   years: 10, sloganKey: 'about.client.slogan1' },
  { key: 'BYD',          nameZh: '比亚迪',    nameEn: 'BYD',             industryKey: 'about.industries.automotive',    years: 7,  sloganKey: 'about.client.slogan3' },
  { key: 'Siemens',      nameZh: '西门子',    nameEn: 'SIEMENS',         industryKey: 'about.industries.energy',        years: 11, sloganKey: 'about.client.slogan4' },
  { key: 'Bosch',        nameZh: '博世',      nameEn: 'BOSCH',           industryKey: 'about.industries.automotive',    years: 9,  sloganKey: 'about.client.slogan2' },
  { key: 'Midea',        nameZh: '美的',      nameEn: 'Midea',           industryKey: 'about.industries.electronics',   years: 11, sloganKey: 'about.client.slogan4' },
  { key: 'LG',           nameZh: 'LG',        nameEn: 'LG',              industryKey: 'about.industries.electronics',   years: 12, sloganKey: 'about.client.slogan1' },
  { key: 'Haier',        nameZh: '海尔',      nameEn: 'Haier',           industryKey: 'about.industries.electronics',   years: 10, sloganKey: 'about.client.slogan1' },
  { key: 'CRRC',         nameZh: '中国中车',  nameEn: 'CRRC',            industryKey: 'about.industries.railway',      years: 10, sloganKey: 'about.client.slogan2' },
  { key: 'JABIL',        nameZh: 'JABIL',     nameEn: 'JABIL',           industryKey: 'about.industries.electronics',   years: 12, sloganKey: 'about.client.slogan1' },
  { key: 'Foxconn',      nameZh: '富士康',    nameEn: 'FOXCONN',         industryKey: 'about.industries.electronics',   years: 8,  sloganKey: 'about.client.slogan1' },
  { key: 'LuxshareICT',  nameZh: '立讯精密',  nameEn: 'LUXSHARE ICT',    industryKey: 'about.industries.electronics',   years: 11, sloganKey: 'about.client.slogan3' },
  { key: 'SaintGobain',  nameZh: '圣戈班',    nameEn: 'SAINT-GOBAIN',    industryKey: 'about.industries.construction',  years: 6,  sloganKey: 'about.client.slogan2' },
  // ── Regional / industry specialists ─────────
  { key: 'JOMOO',        nameZh: '九牧',          nameEn: 'JOMOO METALS',          industryKey: 'about.industries.construction',  years: 9,  sloganKey: 'about.client.slogan2' },
  { key: 'Shimge',       nameZh: '新界泵业',      nameEn: 'SHIMGE PUMP',            industryKey: 'about.industries.manufacturing', years: 9,  sloganKey: 'about.client.slogan2' },
  { key: 'GuoshengGroup',nameZh: '国盛集团',      nameEn: 'GUOSHENG GROUP',         industryKey: 'about.industries.aerospace',    years: 8,  sloganKey: 'about.client.slogan4' },
  { key: 'LanXun',       nameZh: '蓝盾防务',      nameEn: 'LANXUN DEFENSE',         industryKey: 'about.industries.aerospace',    years: 7,  sloganKey: 'about.client.slogan1' },
  { key: 'ChangqingGroup',nameZh: '长青集团',     nameEn: 'CHANGQING GROUP',        industryKey: 'about.industries.energy',       years: 10, sloganKey: 'about.client.slogan2' },
  { key: 'Parkway',      nameZh: 'Parkway',       nameEn: 'Parkway',                industryKey: 'about.industries.construction',  years: 7,  sloganKey: 'about.client.slogan4' },
  { key: 'TOYODENKI',    nameZh: 'TOYODENKI',     nameEn: 'TOYODENKI',              industryKey: 'about.industries.energy',       years: 9,  sloganKey: 'about.client.slogan4' },
  { key: 'Husky',        nameZh: 'Husky',         nameEn: 'HUSKY',                  industryKey: 'about.industries.automotive',    years: 9,  sloganKey: 'about.client.slogan2' },
  { key: 'Daton',        nameZh: '大通汽车',      nameEn: 'DATON AUTOMOTIVE',       industryKey: 'about.industries.automotive',    years: 8,  sloganKey: 'about.client.slogan3' },
  { key: 'JianfuGear',   nameZh: '建福齿轮',      nameEn: 'JIANFU GEAR',            industryKey: 'about.industries.automotive',    years: 6,  sloganKey: 'about.client.slogan4' },
  { key: 'YUDO',         nameZh: 'YUDO',          nameEn: 'YUDO',                   industryKey: 'about.industries.manufacturing', years: 8,  sloganKey: 'about.client.slogan1' },
  { key: 'QYUNDA',       nameZh: 'QYUNDA',        nameEn: 'QYUNDA',                 industryKey: 'about.industries.manufacturing', years: 7,  sloganKey: 'about.client.slogan2' },
  // ── Specialised manufacturers ────────────────
  { key: 'CNC',          nameZh: 'CNC',           nameEn: 'CNC',                    industryKey: 'about.industries.manufacturing', years: 6,  sloganKey: 'about.client.slogan2' },
  { key: 'JMP',          nameZh: '佳友泵业',      nameEn: 'JMP',                   industryKey: 'about.industries.manufacturing', years: 7,  sloganKey: 'about.client.slogan3' },
  { key: 'Phrida',       nameZh: '江苏菲瑞达模具', nameEn: 'Jiangsu Phrida Mould',   industryKey: 'about.industries.manufacturing', years: 8,  sloganKey: 'about.client.slogan1' },
  { key: 'FKD',          nameZh: 'FKD',           nameEn: 'FKD',                   industryKey: 'about.industries.manufacturing', years: 6,  sloganKey: 'about.client.slogan3' },
  { key: 'MLS',          nameZh: 'MLS',           nameEn: 'MLS',                   industryKey: 'about.industries.manufacturing', years: 6,  sloganKey: 'about.client.slogan3' },
  { key: 'SAB',          nameZh: 'SAB',           nameEn: 'SAB',                   industryKey: 'about.industries.manufacturing', years: 6,  sloganKey: 'about.client.slogan2' },
  { key: 'DHLON',        nameZh: '德汇隆',        nameEn: 'DHLON',                 industryKey: 'about.industries.manufacturing', years: 5,  sloganKey: 'about.client.slogan1' },
  { key: 'ZhangjiagangHuimin', nameZh: '张家港惠民', nameEn: 'ZHANGJIAGANG HUIMIN',  industryKey: 'about.industries.manufacturing', years: 6,  sloganKey: 'about.client.slogan1' },
  // ── Emerging & cross-industry ─────────────────
  { key: 'MicroGlobal',  nameZh: 'Micro Global',  nameEn: 'Micro Global',          industryKey: 'about.industries.general',      years: 5,  sloganKey: 'about.client.slogan1' },
  { key: 'WeixingShares',nameZh: '伟星股份',     nameEn: 'WEIXING SHARES',        industryKey: 'about.industries.general',      years: 8,  sloganKey: 'about.client.slogan3' },
  { key: 'AOCIDA',       nameZh: '青岛奥司登',   nameEn: 'AOCIDA',                industryKey: 'about.industries.general',      years: 5,  sloganKey: 'about.client.slogan1' },
  { key: 'Andrs',        nameZh: '安德斯',        nameEn: 'ANDRS',                 industryKey: 'about.industries.general',      years: 4,  sloganKey: 'about.client.slogan3' },
  { key: 'Mate',         nameZh: 'MATE',          nameEn: 'MATE',                  industryKey: 'about.industries.general',      years: 5,  sloganKey: 'about.client.slogan1' },
  { key: 'Motic',        nameZh: 'Motic',         nameEn: 'Motic',                 industryKey: 'about.industries.education',    years: 6,  sloganKey: 'about.client.slogan2' },
  { key: 'KeMed',        nameZh: '科医联',        nameEn: 'KE MEDICAL',            industryKey: 'about.industries.education',    years: 7,  sloganKey: 'about.client.slogan4' },
  { key: 'PHIRIDA',      nameZh: '菲瑞达',        nameEn: 'PHIRIDA',               industryKey: 'about.industries.electronics',   years: 5,  sloganKey: 'about.client.slogan2' },
];

const ACCENTS = [
  { solid: '#2563eb', soft: '#eff6ff', text: '#1d4ed8' },
  { solid: '#059669', soft: '#ecfdf5', text: '#047857' },
  { solid: '#d97706', soft: '#fffbeb', text: '#b45309' },
  { solid: '#db2777', soft: '#fdf2f8', text: '#be185d' },
  { solid: '#0891b2', soft: '#ecfeff', text: '#0e7490' },
  { solid: '#7c3aed', soft: '#f5f3ff', text: '#6d28d9' },
  { solid: '#475569', soft: '#f8fafc', text: '#334155' },
  { solid: '#4338ca', soft: '#eef2ff', text: '#3730a3' },
  { solid: '#16a34a', soft: '#f0fdf4', text: '#15803d' },
  { solid: '#ea580c', soft: '#fff7ed', text: '#c2410c' },
  { solid: '#0d9488', soft: '#f0fdfa', text: '#0f766e' },
  { solid: '#4f46e5', soft: '#eef2ff', text: '#4338ca' },
];

const AUTO_INTERVAL = 5000; // ms between auto-advances
const TRANSITION_MS = 600;

interface ClientWallProps {
  t: (key: string) => string;
  locale: string;
}

export default function ClientWall({ t, locale }: ClientWallProps) {
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cardsPerRow, setCardsPerRow] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Responsive cards-per-row detection */
  useEffect(() => {
    const updateCardsPerRow = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      setCardsPerRow(w >= 1024 ? 4 : w >= 640 ? 3 : 2);
    };
    updateCardsPerRow();
    window.addEventListener('resize', updateCardsPerRow);
    return () => window.removeEventListener('resize', updateCardsPerRow);
  }, []);

  const totalPages = Math.ceil(CLIENTS.length / cardsPerRow);

  /* Clamp page after cardsPerRow changes */
  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [cardsPerRow, totalPages]);

  /* Auto-advance timer */
  useEffect(() => {
    if (paused || totalPages <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, AUTO_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, totalPages]);

  const goNext = useCallback(() => setPage((p) => (p + 1) % totalPages), [totalPages]);
  const goPrev = useCallback(() => setPage((p) => (p - 1 + totalPages) % totalPages), [totalPages]);
  const goTo = useCallback((idx: number) => setPage(idx), []);

  const displayName = (c: ClientItem) => (locale === 'zh' ? c.nameZh : c.nameEn);

  /* Slice current page's clients */
  const startIdx = page * cardsPerRow;
  const visibleClients = CLIENTS.slice(startIdx, startIdx + cardsPerRow);

  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      ref={containerRef}
    >
      {/* Top gradient divider */}
      <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-70" />

      {/* Per-card hover styles */}
      <style>{`
        .cc-card {
          filter: grayscale(0%);
          opacity: 1;
          transition: filter 0.45s ease, transform 0.45s ease,
                      box-shadow 0.45s ease, opacity 0.45s ease,
                      border-color 0.45s ease;
        }
        .cc-card:hover {
          filter: saturate(1.2) brightness(1.03);
          opacity: 1;
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15);
        }

        @keyframes cc-fadeSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cc-animate-in {
          animation: cc-fadeSlideIn ${TRANSITION_MS}ms ease-out both;
        }

        @keyframes cc-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t('about.clients.title')}</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">{t('about.clients.subtitle')}</p>
          <div className="w-24 h-1.5 mx-auto mt-4 rounded-full"
               style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)' }} />
        </div>

        {/* Trust endorsement line */}
        <div className="flex justify-center mb-10">
          <p className="text-sm sm:text-base font-medium text-blue-700 bg-blue-50/70 border border-blue-100 rounded-full inline-flex items-center gap-2 px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {t('about.clients.endorsement')}
          </p>
        </div>

        {/* === CAROUSEL STAGE === */}
        <div className="relative">
          {/* Cards grid — one row of N cards */}
          <div
            className="grid gap-4 sm:gap-5"
            style={{
              gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))`,
            }}
            key={`page-${page}-${cardsPerRow}`} /* force re-mount for animation */
          >
            {visibleClients.map((client, idx) => {
              const accent = ACCENTS[(startIdx + idx) % ACCENTS.length];
              return (
                <div
                  key={`${client.key}-${page}`}
                  className={`cc-card group relative rounded-2xl border bg-white/70 backdrop-blur-md p-5 text-center shadow-sm hover:shadow-2xl cursor-default cc-animate-in`}
                  style={{
                    borderColor: 'rgba(255,255,255,0.6)',
                    boxShadow: '0 4px 24px rgba(30,41,59,0.06), 0 1px 3px rgba(30,41,59,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
                    animationDelay: `${idx * 80}ms`,
                  }}
                  title={displayName(client)}
                >
                  {/* Accent top bar */}
                  <div className="absolute top-0 inset-x-0 h-1 rounded-t-2xl"
                       style={{ background: accent.solid }} />

                  {/* Logo monogram */}
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{ background: accent.solid }}
                  >
                    {client.nameEn.charAt(0)}
                  </div>

                  {/* Client name */}
                  <div className="font-bold text-gray-900 text-base leading-tight mb-2">
                    {displayName(client)}
                  </div>

                  {/* Industry tag */}
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium mb-2"
                    style={{ background: accent.soft, color: accent.text }}
                  >
                    {t(client.industryKey)}
                  </span>

                  {/* Years of partnership */}
                  <div className="text-xs text-gray-500">
                    {client.years} {t('about.client.years')}
                  </div>

                  {/* Trust slogan */}
                  <p className="mt-2 text-[11px] leading-snug text-gray-400 group-hover:text-gray-500 transition-colors">
                    {t(client.sloganKey)}
                  </p>
                </div>
              );
            })}

            {/* Fill empty slots on last page so layout stays stable */}
            {Array.from({ length: Math.max(0, cardsPerRow - visibleClients.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="hidden sm:block" />
            ))}
          </div>

          {/* Left arrow */}
          {totalPages > 1 && (
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous clients"
              className="absolute start-[-18px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all duration-200 opacity-0 group-hover/section:opacity-100 z-10 hidden lg:flex"
              style={{ opacity: 0.7 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.7'; }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right arrow */}
          {totalPages > 1 && (
            <button
              type="button"
              onClick={goNext}
              aria-label="Next clients"
              className="absolute end-[-18px] top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all duration-200 z-10 hidden lg:flex"
              style={{ opacity: 0.7 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Dot indicators + counter */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            {/* Page dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to page ${i + 1}`}
                  className="rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  style={{
                    width: i === page ? '24px' : '8px',
                    height: '8px',
                    background: i === page
                      ? 'linear-gradient(90deg, #3b82f6, #6366f1)'
                      : '#e2e8f0',
                  }}
                />
              ))}
            </div>

            {/* Counter text */}
            <span className="text-xs text-gray-400 tabular-nums ml-2">
              {String(page + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
            </span>

            {/* Pause indicator */}
            <span className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${paused ? 'bg-amber-50 text-amber-600' : 'text-transparent'}`}>
              {paused ? (locale === 'zh' ? '已暂停' : 'PAUSED') : '—'}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
