'use client';

/**
 * CompanyShowcase
 * ---------------
 * Extracted from `about/page.tsx` (the old "Company Introduction" section).
 *
 * V8 visual fixes applied here:
 *  1. Factory / company image is now at least 600px tall (was 460px) and uses
 *     `object-cover` so it never distorts.
 *  2. The section heading uses a fluid `clamp()` size instead of a hardcoded
 *     `text-4xl/5xl` that forced the layout to look stretched.
 *  3. The previously empty space under the copy is now filled with a trust
 *     metrics strip (animated count-up) + a certification badge wall, so the
 *     layout reads as "full" instead of hollow.
 */

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Users, Factory, Award, ShieldCheck, BadgeCheck, CheckCircle, Globe } from 'lucide-react';

interface CompanyShowcaseProps {
  t: (key: string) => string;
  locale: string;
}

/** A small hydration-safe count-up that only animates once it scrolls into view. */
function Counter({ value, suffix = '', icon: Icon, label, gradient = 'linear-gradient(135deg, #3b82f6, #6366f1)' }: { value: number; suffix?: string; icon: React.ElementType; label?: string; gradient?: string }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let startTs: number | null = null;
          const duration = 1300;
          const step = (ts: number) => {
            if (startTs === null) startTs = ts;
            const progress = Math.min((ts - startTs) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex items-center gap-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-blue-100/70 px-4 py-3 shadow-sm">
      <span className="flex items-center justify-center w-10 h-10 rounded-xl text-white shrink-0" style={{ background: gradient }}>
        <Icon className="w-5 h-5" strokeWidth={1.8} />
      </span>
      <div className="leading-tight">
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
          {display}
          {suffix}
        </div>
        {label && <div className="text-[11px] font-medium text-gray-500 mt-0.5">{label}</div>}
      </div>
    </div>
  );
}

const TRUST_METRICS = [
  { value: 800, suffix: '+', labelKey: 'about.showcase.metricClients', icon: Users, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
  { value: 15, suffix: '+', labelKey: 'about.showcase.metricYears', icon: Factory, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
  { value: 30, suffix: '+', labelKey: 'about.showcase.metricFortune', icon: Award, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
];

const CERT_BADGES = [
  { name: 'CE', icon: CheckCircle },
  { name: 'ISO 9001', icon: BadgeCheck },
  { name: 'ISO 14001', icon: BadgeCheck },
  { name: 'ISO 45001', icon: BadgeCheck },
  { name: 'ISO 27001', icon: ShieldCheck },
  { name: '10+ Patents', icon: Award },
];

/** V8.7 fix (bug 4): small factory stats shown under the photo on the left
 *  column. Coordinates with the trust metrics / certification wall on the
 *  right while filling the previously empty space below the image. */
const FACTORY_HIGHLIGHTS = [
  { value: '20,000', suffix: '㎡', labelKey: 'about.showcase.fArea', icon: Factory, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
  { value: '300', suffix: '+', labelKey: 'about.showcase.fStaff', icon: Users, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
  { value: '60', suffix: '+', labelKey: 'about.showcase.fCountries', icon: Globe, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
];

/** ═══════ 国风子组件 ═══════ */

/** 四角回纹角花装饰 */
function GuofengCorners() {
  const corner = (pos: string) => (
    <svg width="18" height="18" className={`absolute ${pos} m-1.5 opacity-40`} viewBox="0 0 18 18" fill="none" stroke="#C9A067" strokeWidth="0.8">
      <path d="M8 2V8H2M6 4h4v4"/>
    </svg>
  );
  return (
    <>
      {corner('top-left')}
      {/* top-right: flip H */}
      <svg width="18" height="18" className="absolute top-1.5 right-1.5 opacity-40" viewBox="0 0 18 18" fill="none" stroke="#C9A067" strokeWidth="0.8">
        <path d="M10 2V8H16M12 4H8v4"/>
      </svg>
      {/* bottom-left: flip V */}
      <svg width="18" height="18" className="absolute bottom-1.5 left-1.5 opacity-40" viewBox="0 0 18 18" fill="none" stroke="#C9A067" strokeWidth="0.8">
        <path d="M8 16V10H2M6 14h4v-4"/>
      </svg>
      {/* bottom-right: flip both */}
      <svg width="18" height="18" className="absolute bottom-1.5 right-1.5 opacity-40" viewBox="0 0 18 18" fill="none" stroke="#C9A067" strokeWidth="0.8">
        <path d="M10 16V10H16M12 14H8v-4"/>
      </svg>
    </>
  );
}

/** 朱红方印 — 带盖印入场动画 */
function SealStamp() {
  return (
    <div
      className="relative w-[52px] h-[52px] rounded-sm flex flex-col items-center justify-center select-none"
      style={{
        background: 'linear-gradient(145deg, #C41E3A 0%, #A01730 50%, #8B0000 100%)',
        boxShadow: '0 2px 10px rgba(196,30,58,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
        animation: 'guofeng-seal-stamp 0.6s cubic-bezier(.22,.91,.27,1.02) both',
      }}
      aria-hidden="true"
    >
      <span className="text-[#FEF3E2] font-bold text-base leading-none tracking-wider"
        style={{ fontFamily: "'STKaiti','KaiTi','SimSun','Noto Serif SC',serif", textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
      >秋彦</span>
      <span className="text-[#FEF3E2] text-[8px] mt-0.5 tracking-[0.35em] opacity-85 leading-none"
        style={{ fontFamily: "'STKaiti','KaiTi','SimSun','Noto Serif SC',serif" }}
      >印鉴</span>
      {/* 印章边缘虚化 */}
      <div className="absolute inset-0 rounded-sm border border-white/10 pointer-events-none" />
    </div>
  );
}

/** 单个国风数据卡片 */
function GuofengStatCard({ item, t, delay }: {
  item: typeof FACTORY_HIGHLIGHTS[number];
  t: (key: string) => string;
  delay: number;
}) {
  const Icon = item.icon;
  // 从 gradient 提取主题色用于顶条和图标环
  const themeColors: Record<string, { bar: string; bg: string; ring: string; icon: string }> = {
    green: { bar: '#059669', bg: '#ECFDF5', ring: 'rgba(5,150,105,0.2)', icon: '#059669' },
    blue:  { bar: '#2563eb', bg: '#EFF6FF', ring: 'rgba(37,99,235,0.2)', icon: '#2563eb' },
    amber: { bar: '#d97706', bg: '#FFFBEB', ring: 'rgba(217,119,6,0.2)', icon: '#d97706' },
  };
  const key = item.gradient.includes('059669') ? 'green' : item.gradient.includes('2563eb') ? 'blue' : 'amber';
  const c = themeColors[key];

  return (
    <div
      className="rounded-xl overflow-hidden bg-white/90 backdrop-blur-[2px] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg group"
      style={{
        border: '1px solid rgba(201,160,103,0.18)',
        boxShadow: '0 2px 8px rgba(139,69,19,0.04)',
        animation: `guofeng-card-in 0.55s cubic-bezier(.25,.46,.45,.94) ${delay}ms both`,
      }}
    >
      {/* 彩色顶条 */}
      <div className="h-1 w-full" style={{ background: c.bar }} />
      <div className="p-3.5 pt-3">
        {/* 图标环 */}
        <div className="flex items-center gap-2.5 mb-2">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ background: c.bg, border: `1px solid ${c.ring}` }}
          >
            <Icon strokeWidth={1.8} className="w-[18px] h-[18px]" style={{ color: c.icon }} />
          </span>
          <div className="text-[11px] font-medium text-gray-400 leading-tight">{t(item.labelKey)}</div>
        </div>
        {/* 数字 + 后缀 */}
        <div className="pl-[42px]">
          <span className="text-2xl sm:text-[26px] font-bold tabular-nums tracking-tight"
            style={{ color: '#1a1a2e', fontFamily: 'Georgia,"Times New Roman","Noto Serif SC",serif' }}
          >
            {item.value}
          </span>
          <span className="text-base font-semibold ml-0.5 opacity-60" style={{ color: c.icon }}>{item.suffix}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════ 国风关键帧动画（注入到 <head> 风格） ═══════ */
function GuofengKeyframes() {
  return (
    <style jsx global>{`
      @keyframes guofeng-seal-stamp {
        0%   { transform: scale(2.2) rotate(-8deg); opacity: 0; }
        60%  { transform: scale(0.92) rotate(2deg); opacity: 1; }
        80%  { transform: scale(1.03) rotate(-1deg); }
        100% { transform: scale(1) rotate(0); }
      }
      @keyframes guofeng-card-in {
        from { opacity: 0; transform: translateY(14px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
  );
}

export default function CompanyShowcase({ t }: CompanyShowcaseProps) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-white">
      {/* 国风动画关键帧 */}
      <GuofengKeyframes />

      {/* Soft animated depth layer */}
      <div className="absolute inset-0 opacity-[0.5]" style={{
        background:
          'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(99,102,241,0.03) 50%, rgba(139,92,246,0.06) 100%), radial-gradient(ellipse at 30% 50%, #3b82f6 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, #8b5cf6 0%, transparent 55%)',
        animation: 'about-intro-bg-pulse 10s ease-in-out infinite alternate',
      }} />

      {/* Badge */}
      <div className="relative z-10 text-center mb-10">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block mr-2 align-middle" />
          {t('about.companyIntro.badge')}
        </span>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">
        {/* LEFT: company building photo + animated flow lines */}
        <div className="w-full lg:w-[45%] flex flex-col">
          <div
            className="w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200/60 relative group transition-all duration-700 hover:shadow-[0_22px_55px_-18px_rgba(59,130,246,0.30)] hover:-translate-y-1 aspect-[4/3] lg:aspect-[3/2] max-h-[300px]"
          >
            <Image
              src="/images/about/company-building.jpg"
              alt={t('company.name')}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover rounded-2xl"
              priority
              quality={92}
            />
          </div>

          {/* V8.7 fix (bug 4): replaced the three drifting "data flow" lines
              (which read as clutter) with a single refined accent divider, then
              a "factory at a glance" highlight card that fills the empty space
              under the photo and coordinates with the right column. */}
          <div className="mt-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              {t('about.showcase.factoryTitle')}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
          </div>

          {/* ═══ 国风 · 秋彦印鉴签名卡 ═══ */}
          <div className="mt-4 relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, #FEF9F3 0%, #FDF6ED 40%, #FAF3E8 100%)',
              border: '1.5px solid rgba(201,160,103,0.28)',
              boxShadow: '0 4px 24px rgba(139,69,19,0.07), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            {/* 四角回纹装饰 */}
            <GuofengCorners />

            {/* ── 头部：印章 + 品牌 ── */}
            <div className="relative z-10 pt-5 pb-3 px-5">
              <div className="flex flex-col items-center gap-2">
                {/* 印章行 */}
                <div className="flex items-center gap-3">
                  {/* 左金线 */}<span className="hidden sm:block w-8 h-px bg-gradient-to-r from-transparent to-[#C9A067] opacity-50" />
                  {/* 朱红方印 */}
                  <SealStamp />
                  {/* 菱形分隔 */}<span className="w-1.5 h-1.5 rotate-45 bg-[#C9A067] opacity-45" />
                  {/* 右侧品牌名 */}
                  <span className="text-sm font-semibold tracking-[0.25em] text-[#5C4033]" style={{ fontFamily: 'Georgia,"Times New Roman",serif' }}>QIUYAN</span>
                  {/* 右金线 */}<span className="hidden sm:block w-8 h-px bg-gradient-to-l from-transparent to-[#C9A067] opacity-50" />
                </div>
                <span className="text-[10px] tracking-[0.35em] text-[#8B7355] uppercase opacity-60">Technology · Est. 2010</span>
              </div>

              {/* 金色分隔线 */}
              <div className="mt-3 mx-auto max-w-xs h-px" style={{
                background: 'linear-gradient(90deg, transparent, #C9A067 20%, #E8C88B 50%, #C9A067 80%, transparent)',
              }} />
            </div>

            {/* ── 三项数据横排卡片 ── */}
            <div className="relative z-10 px-4 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FACTORY_HIGHLIGHTS.map((h, idx) => (
                  <GuofengStatCard key={h.labelKey} item={h} t={t} delay={idx * 150} />
                ))}
              </div>
            </div>

            {/* 底部祥云暗示（CSS 实现） */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-8 sm:gap-16 pointer-events-none pb-1 px-4">
              {[
                { w: '18%', ml: '2%' },
                { w: '24%', ml: '38%' },
                { w: '18%', ml: '74%' },
              ].map((s, i) => (
                <div key={i} className="h-[3px] rounded-full bg-[#D4A574] opacity-[0.1]" style={{ width: s.w, marginLeft: s.ml }} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: heading + copy + trust strip + certification wall */}
        <div className="w-full lg:w-[55%] flex flex-col justify-center">
          <h2 className="font-extrabold text-gray-900 mb-5 tracking-tight text-[clamp(1.75rem,3vw,2.75rem)] leading-tight">
            {t('about.companyIntro.title')}
          </h2>
          <div className="w-24 h-1.5 mb-7 rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)' }} />
          <p className="text-base leading-relaxed text-gray-600 mb-5">
            {t('about.companyIntro.paragraph1')}
          </p>
          <p className="text-base leading-relaxed text-gray-600 mb-8">
            {t('about.companyIntro.paragraph2')}
          </p>

          {/* Trust metrics strip — fills the previous empty space with animated data */}
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            {t('about.showcase.trustTitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {TRUST_METRICS.map((m) => (
              <Counter key={m.labelKey} value={m.value} suffix={m.suffix} icon={m.icon} label={t(m.labelKey)} gradient={m.gradient} />
            ))}
          </div>

          {/* Certification / patent badge wall */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              {t('about.showcase.certsTitle')}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {CERT_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <span
                    key={badge.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-300 hover:text-blue-700 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-blue-500" strokeWidth={1.8} />
                    {badge.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
