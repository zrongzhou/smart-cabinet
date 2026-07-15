'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * ClientWall — Premium Card Carousel v11
 * ----------------------------------------
 * Polished carousel showcasing 36 clients with premium glass-morphism cards.
 *
 * v11 visual upgrades:
 *  - Removed the orphaned top gradient divider line (was visually jarring)
 *  - Cards redesigned: frosted glass base + per-card tinted gradient background
 *    instead of harsh solid-color top bar → softer, more cohesive
 *  - Monogram circle enlarged (14→16) with soft color-matched glow ring
 *  - Typography refined: name bolder, tag pill sharper, slogan tucked elegantly
 *  - Hover: gentle lift + border glow in accent color + inner highlight shift
 *  - Background: ultra-subtle dot pattern for texture without noise
 *  - Section header: gradient underline on the title itself (not a floating line)
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

/** Per-card accent palette — used for monogram bg, tag tint, hover glow */
const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ec4899',
  '#06b6d4', '#8b5cf6', '#64748b', '#6366f1',
  '#22c55e', '#f97316', '#14b8a6', '#4f46e5',
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const AUTO_INTERVAL = 5000;
const TRANSITION_MS = 550;

interface ClientWallProps {
  t: (key: string) => string;
  locale: string;
}

export default function ClientWall({ t, locale }: ClientWallProps) {
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cardsPerRow, setCardsPerRow] = useState(4);

  /* Responsive cards-per-row */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      const w = window.innerWidth;
      setCardsPerRow(w >= 1024 ? 4 : w >= 640 ? 3 : 2);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const totalPages = Math.ceil(CLIENTS.length / cardsPerRow);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [cardsPerRow, totalPages]);

  /* Auto-advance */
  useEffect(() => {
    if (paused || totalPages <= 1) return;
    const id = setInterval(() => setPage((prev) => (prev + 1) % totalPages), AUTO_INTERVAL);
    return () => clearInterval(id);
  }, [paused, totalPages]);

  const displayName = (c: ClientItem) => (locale === 'zh' ? c.nameZh : c.nameEn);

  const startIdx = page * cardsPerRow;
  const visibleClients = CLIENTS.slice(startIdx, startIdx + cardsPerRow);

  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Subtle dot-pattern background */}
      <div className="absolute inset-0 opacity-[0.03]"
           style={{ backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Very subtle top fade — replaces the harsh gradient line */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-gray-50/80 to-transparent pointer-events-none" />

      {/* Global styles */}
      <style>{`
        .pc-card {
          transition: transform 0.4s cubic-bezier(.2,.8,.2,1),
                      box-shadow 0.4s ease,
                      border-color 0.4s ease;
        }
        .pc-card:hover {
          transform: translateY(-8px);
          box-shadow:
            0 25px 50px -12px rgba(0,0,0,0.12),
            0 12px 24px -8px rgba(0,0,0,0.06);
        }

        @keyframes pc-in {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pc-anim {
          animation: pc-in ${TRANSITION_MS}ms cubic-bezier(.2,.8,.2,1) both;
        }
      `}</style>

      <div className="max-w-7xl mx-auto relative">
        {/* ===== SECTION HEADER ===== */}
        <div className="text-center mb-5">
          {/* Title with gradient underline (integrated, not floating) */}
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 inline-block">
            {t('about.clients.title')}
            <span className="block mt-3 mx-auto w-20 h-1 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #3b82f6, #818cf8, #a78bfa)' }} />
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-5">{t('about.clients.subtitle')}</p>
        </div>

        {/* Trust endorsement */}
        <div className="flex justify-center mb-12">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60 rounded-full px-5 py-2.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            {t('about.clients.endorsement')}
          </span>
        </div>

        {/* ===== CAROUSEL STAGE ===== */}
        <div className="relative px-2">
          {/* Card row */}
          <div
            className="grid gap-5 lg:gap-6"
            style={{ gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))` }}
            key={`pg-${page}-${cardsPerRow}`}
          >
            {visibleClients.map((client, idx) => {
              const color = PALETTE[(startIdx + idx) % PALETTE.length];
              const colorRgba = hexToRgba(color, 1);
              const colorFaint = hexToRgba(color, 0.08);
              const colorSoft = hexToRgba(color, 0.12);
              const colorText = hexToRgba(color, 0.85);

              return (
                <div
                  key={`${client.key}-${page}`}
                  className={`pc-card group relative rounded-2xl overflow-hidden cursor-default pc-anim`}
                  style={{
                    animationDelay: `${idx * 70}ms`,
                    background: `
                      linear-gradient(165deg,
                        rgba(255,255,255,0.92) 0%,
                        ${colorFaint} 60%,
                        rgba(255,255,255,0.95) 100%
                      )
                    `,
                    border: `1px solid ${hexToRgba(color, 0.15)}`,
                    boxShadow: `0 4px 20px ${hexToRgba(color, 0.07)}, 0 1px 3px rgba(0,0,0,0.04)`,
                    backdropFilter: 'blur(8px)',
                  }}
                  title={displayName(client)}
                >
                  {/* Top-left accent blob */}
                  <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full opacity-[0.07] blur-2xl"
                       style={{ background: color }} />

                  <div className="relative p-6 pt-7 text-center">
                    {/* Monogram circle — larger, with glow ring */}
                    <div className="relative inline-flex items-center justify-center mb-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl tracking-tight shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${color}, ${hexToRgba(color, 0.78)})`,
                          boxShadow: `0 8px 20px ${hexToRgba(color, 0.28)}`,
                        }}
                      >
                        {client.nameEn.charAt(0)}
                      </div>
                    </div>

                    {/* Client name */}
                    <h3 className="font-extrabold text-gray-900 text-base tracking-tight mb-1.5 leading-snug">
                      {displayName(client)}
                    </h3>

                    {/* Industry tag — sharper, smaller */}
                    <span
                      className="inline-block px-3 py-1 rounded-lg text-xs font-semibold mb-3 tracking-wide"
                      style={{
                        background: `${colorSoft}`,
                        color: colorText,
                        border: `1px solid ${hexToRgba(color, 0.1)}`,
                      }}
                    >
                      {t(client.industryKey)}
                    </span>

                    {/* Years badge */}
                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-2.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{client.years} {t('about.client.years')}</span>
                    </div>

                    {/* Slogan — elegant, muted */}
                    <p className="text-[11px] leading-relaxed text-gray-400 group-hover:text-gray-500 transition-colors duration-300 max-w-[85%] mx-auto">
                      {t(client.sloganKey)}
                    </p>
                  </div>

                  {/* Bottom shimmer bar on hover */}
                  <div className="absolute bottom-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                       style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                </div>
              );
            })}

            {/* Empty slot filler */}
            {Array.from({ length: Math.max(0, cardsPerRow - visibleClients.length) }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
          </div>

          {/* Navigation arrows */}
          {totalPages > 1 && (
            <>
              <button type="button" onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
                aria-label="Previous"
                className="absolute start-[-12px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-xl transition-all duration-200 z-10 hidden lg:flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button type="button" onClick={() => setPage((p) => (p + 1) % totalPages)}
                aria-label="Next"
                className="absolute end-[-12px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-xl transition-all duration-200 z-10 hidden lg:flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>

        {/* Dot indicators + counter */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-3 mt-10">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} type="button" onClick={() => setPage(i)}
                  aria-label={`Page ${i + 1}`}
                  className="rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 cursor-pointer"
                  style={{
                    width: i === page ? '28px' : '8px',
                    height: '8px',
                    borderRadius: '999px',
                    background: i === page
                      ? 'linear-gradient(90deg, #3b82f6, #818cf8)'
                      : '#e2e8f0',
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="tabular-nums font-medium">{String(page + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}</span>
              {paused && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                  {locale === 'zh' ? '已暂停' : 'PAUSED'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
