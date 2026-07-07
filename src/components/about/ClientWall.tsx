'use client';

/**
 * ClientWall
 * ----------
 * Replaces the old plain text-logo grid (grey boxes + grey text) with a wall of
 * textured, "trusted" client cards.
 *
 * V8 visual fixes applied here:
 *  1. Each client is a real card: name + industry tag + years of partnership +
 *     a trust slogan — instead of an empty grey box.
 *  2. Cards are desaturated (grayscale) by default and restore full colour with
 *     a gentle lift + scale on hover, conveying "trusted by".
 *  3. A trust-data endorsement line sits under the section title.
 *  4. No external logo images are referenced (programmatic cards only), so there
 *     is never a missing-image gap.
 *  5. RTL-safe: logical properties / `rtl:` variants are used, no hardcoded
 *     left/right positioning.
 */

interface ClientItem {
  key: string;
  nameZh: string;
  nameEn: string;
  industryKey: string;
  years: number;
  sloganKey: string;
}

const CLIENTS: ClientItem[] = [
  { key: 'YUDO', nameZh: 'YUDO', nameEn: 'YUDO', industryKey: 'about.industries.manufacturing', years: 8, sloganKey: 'about.client.slogan1' },
  { key: 'CNC', nameZh: 'CNC', nameEn: 'CNC', industryKey: 'about.industries.manufacturing', years: 6, sloganKey: 'about.client.slogan2' },
  { key: 'Haier', nameZh: '海尔', nameEn: 'Haier', industryKey: 'about.industries.electronics', years: 10, sloganKey: 'about.client.slogan1' },
  { key: 'JMP', nameZh: '佳友泵业', nameEn: 'JMP', industryKey: 'about.industries.manufacturing', years: 7, sloganKey: 'about.client.slogan3' },
  { key: 'Husky', nameZh: 'Husky', nameEn: 'HUSKY', industryKey: 'about.industries.automotive', years: 9, sloganKey: 'about.client.slogan2' },
  { key: 'JianfuGear', nameZh: '建福齿轮', nameEn: 'JIANFU GEAR', industryKey: 'about.industries.automotive', years: 6, sloganKey: 'about.client.slogan4' },
  { key: 'QingdaoAocida', nameZh: '青岛奥司登', nameEn: 'AOCIDA', industryKey: 'about.industries.general', years: 5, sloganKey: 'about.client.slogan1' },
  { key: 'QYUNDA', nameZh: 'QYUNDA', nameEn: 'QYUNDA', industryKey: 'about.industries.manufacturing', years: 7, sloganKey: 'about.client.slogan2' },
  { key: 'Daton', nameZh: '大通汽车', nameEn: 'DATON AUTOMOTIVE', industryKey: 'about.industries.automotive', years: 8, sloganKey: 'about.client.slogan3' },
  { key: 'JABIL', nameZh: 'JABIL', nameEn: 'JABIL', industryKey: 'about.industries.electronics', years: 12, sloganKey: 'about.client.slogan1' },
  { key: 'Motic', nameZh: 'Motic', nameEn: 'Motic', industryKey: 'about.industries.education', years: 6, sloganKey: 'about.client.slogan2' },
  { key: 'TOYODENKI', nameZh: 'TOYODENKI', nameEn: 'TOYODENKI', industryKey: 'about.industries.energy', years: 9, sloganKey: 'about.client.slogan4' },
  { key: 'MicroGlobal', nameZh: 'Micro Global', nameEn: 'Micro Global', industryKey: 'about.industries.general', years: 5, sloganKey: 'about.client.slogan1' },
  { key: 'WeixingShares', nameZh: '伟星股份', nameEn: 'WEIXING SHARES', industryKey: 'about.industries.general', years: 8, sloganKey: 'about.client.slogan3' },
  { key: 'SAB', nameZh: 'SAB', nameEn: 'SAB', industryKey: 'about.industries.manufacturing', years: 6, sloganKey: 'about.client.slogan2' },
  { key: 'DHLON', nameZh: '德汇隆', nameEn: 'DHLON', industryKey: 'about.industries.manufacturing', years: 5, sloganKey: 'about.client.slogan1' },
  { key: 'Parkway', nameZh: 'Parkway', nameEn: 'Parkway', industryKey: 'about.industries.construction', years: 7, sloganKey: 'about.client.slogan4' },
  { key: 'ChangqingGroup', nameZh: '长青集团', nameEn: 'CHANGQING GROUP', industryKey: 'about.industries.energy', years: 10, sloganKey: 'about.client.slogan2' },
  { key: 'Andrs', nameZh: '安德斯', nameEn: 'ANDRS', industryKey: 'about.industries.general', years: 4, sloganKey: 'about.client.slogan3' },
  { key: 'ZhangjiagangHuimin', nameZh: '张家港惠民', nameEn: 'ZHANGJIAGANG HUIMIN', industryKey: 'about.industries.manufacturing', years: 6, sloganKey: 'about.client.slogan1' },
  { key: 'PHIRIDA', nameZh: '菲瑞达', nameEn: 'PHIRIDA', industryKey: 'about.industries.electronics', years: 5, sloganKey: 'about.client.slogan2' },
  { key: 'KeMed', nameZh: '科医联', nameEn: 'KE MEDICAL', industryKey: 'about.industries.education', years: 7, sloganKey: 'about.client.slogan4' },
  { key: 'Mate', nameZh: 'MATE', nameEn: 'MATE', industryKey: 'about.industries.general', years: 5, sloganKey: 'about.client.slogan1' },
  { key: 'MLS', nameZh: 'MLS', nameEn: 'MLS', industryKey: 'about.industries.manufacturing', years: 6, sloganKey: 'about.client.slogan3' },
  { key: 'JOMOO', nameZh: '九牧', nameEn: 'JOMOO METALS', industryKey: 'about.industries.construction', years: 9, sloganKey: 'about.client.slogan2' },
  { key: 'Phrida', nameZh: '江苏菲瑞达模具', nameEn: 'Jiangsu Phrida Mould', industryKey: 'about.industries.manufacturing', years: 8, sloganKey: 'about.client.slogan1' },
  { key: 'Midea', nameZh: '美的', nameEn: 'Midea', industryKey: 'about.industries.electronics', years: 11, sloganKey: 'about.client.slogan4' },
  { key: 'CRRC', nameZh: '中国中车', nameEn: 'CRRC', industryKey: 'about.industries.railway', years: 10, sloganKey: 'about.client.slogan2' },
  { key: 'FKD', nameZh: 'FKD', nameEn: 'FKD', industryKey: 'about.industries.manufacturing', years: 6, sloganKey: 'about.client.slogan3' },
  { key: 'LG', nameZh: 'LG', nameEn: 'LG', industryKey: 'about.industries.electronics', years: 12, sloganKey: 'about.client.slogan1' },
  { key: 'Shimge', nameZh: '新界泵业', nameEn: 'SHIMGE PUMP', industryKey: 'about.industries.manufacturing', years: 9, sloganKey: 'about.client.slogan2' },
  { key: 'GuoshengGroup', nameZh: '国盛集团', nameEn: 'GUOSHENG GROUP', industryKey: 'about.industries.aerospace', years: 8, sloganKey: 'about.client.slogan4' },
  { key: 'LanXun', nameZh: '蓝盾防务', nameEn: 'LANXUN DEFENSE', industryKey: 'about.industries.aerospace', years: 7, sloganKey: 'about.client.slogan1' },
  { key: 'LuxshareICT', nameZh: '立讯精密', nameEn: 'LUXSHARE ICT', industryKey: 'about.industries.electronics', years: 11, sloganKey: 'about.client.slogan3' },
];

const ACCENTS = [
  { solid: '#2563eb', soft: '#eff6ff', text: '#1d4ed8' }, // blue-600
  { solid: '#4f46e5', soft: '#eef2ff', text: '#4338ca' }, // indigo-600
  { solid: '#7c3aed', soft: '#f5f3ff', text: '#6d28d9' }, // violet-600
  { solid: '#6366f1', soft: '#eef2ff', text: '#4f46e5' }, // indigo-500
  { solid: '#8b5cf6', soft: '#f5f3ff', text: '#7c3aed' }, // purple-500
  { solid: '#3b82f6', soft: '#eff6ff', text: '#2563eb' }, // blue-500
];

interface ClientWallProps {
  t: (key: string) => string;
  locale: string;
}

export default function ClientWall({ t, locale }: ClientWallProps) {
  const displayName = (c: ClientItem) => (locale === 'zh' ? c.nameZh : c.nameEn);

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
        <div className="flex justify-center mb-12">
          <p className="text-sm sm:text-base font-medium text-blue-700 bg-blue-50/70 border border-blue-100 rounded-full inline-flex items-center gap-2 px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {t('about.clients.endorsement')}
          </p>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {CLIENTS.map((client, idx) => {
            const accent = ACCENTS[idx % ACCENTS.length];
            return (
              <div
                key={client.key}
                className="client-card group relative rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm hover:shadow-xl hover:border-blue-200 cursor-default"
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
      </div>
    </section>
  );
}
