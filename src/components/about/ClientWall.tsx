'use client';

import { useState } from 'react';

/**
 * ClientWall — Featured Clients Grid (v9)
 * ----------------------------------------
 * Shows a curated set of **12 featured clients** by default (the most recognisable
 * global brands), with a smooth "Show All / Collapse" toggle to reveal the full
 * list of 36 partners.
 *
 * Previous version displayed all 36 cards in a 4-column grid → 9 rows of dense
 * cards that overwhelmed the page. This v9 keeps the initial view clean and
 * scannable while preserving the complete dataset for curious visitors.
 *
 * Design:
 *  - 12 featured clients in a 4-column grid (3 rows) — clean & impactful
 *  - Toggle button: "Show All 36 Clients" ↔ "Show Less"
 *  - Smooth max-height transition on expand/collapse
 *  - Same per-card design: monogram circle + name + industry tag + years + slogan
 *  - Hover lift + saturate effect retained
 */

interface ClientItem {
  key: string;
  nameZh: string;
  nameEn: string;
  industryKey: string;
  years: number;
  sloganKey: string;
}

/** Full client list — ordered so the most recognisable brands are first (featured). */
const CLIENTS: ClientItem[] = [
  // ── ROW A: Tier-1 global brands (shown by default) ──────────────────
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

  // ── ROW B: Strong regional / industry specialists (revealed on expand) ───
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

  // ── ROW C: Specialised manufacturers (revealed on expand) ─────────────
  { key: 'CNC',          nameZh: 'CNC',           nameEn: 'CNC',                    industryKey: 'about.industries.manufacturing', years: 6,  sloganKey: 'about.client.slogan2' },
  { key: 'JMP',          nameZh: '佳友泵业',      nameEn: 'JMP',                   industryKey: 'about.industries.manufacturing', years: 7,  sloganKey: 'about.client.slogan3' },
  { key: 'Phrida',       nameZh: '江苏菲瑞达模具', nameEn: 'Jiangsu Phrida Mould',   industryKey: 'about.industries.manufacturing', years: 8,  sloganKey: 'about.client.slogan1' },
  { key: 'FKD',          nameZh: 'FKD',           nameEn: 'FKD',                   industryKey: 'about.industries.manufacturing', years: 6,  sloganKey: 'about.client.slogan3' },
  { key: 'MLS',          nameZh: 'MLS',           nameEn: 'MLS',                   industryKey: 'about.industries.manufacturing', years: 6,  sloganKey: 'about.client.slogan3' },
  { key: 'SAB',          nameZh: 'SAB',           nameEn: 'SAB',                   industryKey: 'about.industries.manufacturing', years: 6,  sloganKey: 'about.client.slogan2' },
  { key: 'DHLON',        nameZh: '德汇隆',        nameEn: 'DHLON',                 industryKey: 'about.industries.manufacturing', years: 5,  sloganKey: 'about.client.slogan1' },
  { key: 'ZhangjiagangHuimin', nameZh: '张家港惠民', nameEn: 'ZHANGJIAGANG HUIMIN',  industryKey: 'about.industries.manufacturing', years: 6,  sloganKey: 'about.client.slogan1' },

  // ── ROW D: Emerging & cross-industry (revealed on expand) ──────────────
  { key: 'MicroGlobal',  nameZh: 'Micro Global',  nameEn: 'Micro Global',          industryKey: 'about.industries.general',      years: 5,  sloganKey: 'about.client.slogan1' },
  { key: 'WeixingShares',nameZh: '伟星股份',     nameEn: 'WEIXING SHARES',        industryKey: 'about.industries.general',      years: 8,  sloganKey: 'about.client.slogan3' },
  { key: 'AOCIDA',       nameZh: '青岛奥司登',   nameEn: 'AOCIDA',                industryKey: 'about.industries.general',      years: 5,  sloganKey: 'about.client.slogan1' },
  { key: 'Andrs',        nameZh: '安德斯',        nameEn: 'ANDRS',                 industryKey: 'about.industries.general',      years: 4,  sloganKey: 'about.client.slogan3' },
  { key: 'Mate',         nameZh: 'MATE',          nameEn: 'MATE',                  industryKey: 'about.industries.general',      years: 5,  sloganKey: 'about.client.slogan1' },
  { key: 'Motic',        nameZh: 'Motic',         nameEn: 'Motic',                 industryKey: 'about.industries.education',    years: 6,  sloganKey: 'about.client.slogan2' },
  { key: 'KeMed',        nameZh: '科医联',        nameEn: 'KE MEDICAL',            industryKey: 'about.industries.education',    years: 7,  sloganKey: 'about.client.slogan4' },
  { key: 'PHIRIDA',      nameZh: '菲瑞达',        nameEn: 'PHIRIDA',               industryKey: 'about.industries.electronics',   years: 5,  sloganKey: 'about.client.slogan2' },
];

const FEATURED_COUNT = 12;
const TOTAL = CLIENTS.length;

const ACCENTS = [
  { solid: '#2563eb', soft: '#eff6ff', text: '#1d4ed8' },   // blue
  { solid: '#059669', soft: '#ecfdf5', text: '#047857' },   // emerald
  { solid: '#d97706', soft: '#fffbeb', text: '#b45309' },   // amber
  { solid: '#db2777', soft: '#fdf2f8', text: '#be185d' },   // pink
  { solid: '#0891b2', soft: '#ecfeff', text: '#0e7490' },   // cyan
  { solid: '#7c3aed', soft: '#f5f3ff', text: '#6d28d9' },   // violet
  { solid: '#475569', soft: '#f8fafc', text: '#334155' },   // slate
  { solid: '#4338ca', soft: '#eef2ff', text: '#3730a3' },   // indigo
  { solid: '#16a34a', soft: '#f0fdf4', text: '#15803d' },   // green
  { solid: '#ea580c', soft: '#fff7ed', text: '#c2410c' },   // orange
  { solid: '#0d9488', soft: '#f0fdfa', text: '#0f766e' },   // teal
  { solid: '#4f46e5', soft: '#eef2ff', text: '#4338ca' },   // indigo-600
];

interface ClientWallProps {
  t: (key: string) => string;
  locale: string;
}

export default function ClientWall({ t, locale }: ClientWallProps) {
  const [expanded, setExpanded] = useState(false);
  const displayName = (c: ClientItem) => (locale === 'zh' ? c.nameZh : c.nameEn);
  const visible = expanded ? CLIENTS : CLIENTS.slice(0, FEATURED_COUNT);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Top gradient divider */}
      <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-70" />

      <style>{`
        .client-card {
          filter: grayscale(0%);
          opacity: 1;
          transition: filter 0.45s ease, transform 0.45s ease, box-shadow 0.45s ease, opacity 0.45s ease, border-color 0.45s ease;
        }
        .client-card:hover {
          filter: saturate(1.2) brightness(1.03);
          opacity: 1;
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t('about.clients.title')}</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">{t('about.clients.subtitle')}</p>
          <div className="w-24 h-1.5 mx-auto mt-4 rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)' }} />
        </div>

        {/* Trust endorsement line */}
        <div className="flex justify-center mb-10">
          <p className="text-sm sm:text-base font-medium text-blue-700 bg-blue-50/70 border border-blue-100 rounded-full inline-flex items-center gap-2 px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {t('about.clients.endorsement')}
          </p>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {visible.map((client, idx) => {
            const accent = ACCENTS[idx % ACCENTS.length];
            return (
              <div
                key={client.key}
                className="client-card group relative rounded-2xl border bg-white/70 backdrop-blur-md p-5 text-center shadow-sm hover:shadow-2xl cursor-default transition-all duration-500"
                style={{ borderColor: 'rgba(255,255,255,0.6)', boxShadow: '0 4px 24px rgba(30,41,59,0.06), 0 1px 3px rgba(30,41,59,0.04), inset 0 1px 0 rgba(255,255,255,0.6)' }}
                title={displayName(client)}
              >
                {/* Accent top bar */}
                <div className="absolute top-0 inset-x-0 h-1 rounded-t-2xl" style={{ background: accent.solid }} />

                {/* Logo monogram */}
                <div
                  className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                  style={{ background: accent.solid }}
                >
                  {client.nameEn.charAt(0)}
                </div>

                {/* Client name */}
                <div className="font-bold text-gray-900 text-base leading-tight mb-2">{displayName(client)}</div>

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
        </div>

        {/* Expand / Collapse toggle */}
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="group inline-flex items-center gap-2 rounded-full border-2 border-dashed border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/40 transition-all duration-300"
          >
            {expanded ? (
              <>
                <svg className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                {locale === 'zh' ? `收起（仅显示 ${FEATURED_COUNT} 家）` : `Show Less (${FEATURED_COUNT} featured)`}
              </>
            ) : (
              <>
                <svg className="h-4 w-4 transition-transform group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                {locale === 'zh'
                  ? `查看全部 ${TOTAL} 家合作客户`
                  : `View All ${TOTAL} Clients`}
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
