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

/** ═══════ 现代东方 · 秋彦 子组件 ═══════ */

/** 四角极简 L 型几何装饰（替代回纹） */
function ModernCorners() {
  const corner = (pos: string, style: React.CSSProperties) => (
    <span className={`absolute ${pos} w-3.5 h-3.5 pointer-events-none`} aria-hidden="true">
      <span className="absolute inset-0 rounded-sm" style={style} />
    </span>
  );
  const s: React.CSSProperties = { background: 'linear-gradient(135deg, transparent 45%, rgba(59,130,246,0.25) 50%, transparent 55%), linear-gradient(225deg, transparent 45%, rgba(139,92,246,0.2) 50%, transparent 55%)' };
  return (
    <>
      {corner('top-2 left-2', s)}
      <span className="absolute top-2 right-2 w-3.5 h-3.5 pointer-events-none" aria-hidden="true" style={{ background: 'linear-gradient(225deg, transparent 45%, rgba(201,160,103,0.28) 50%, transparent 55%)' }} />
      {corner('bottom-2 left-2', s)}
      <span className="absolute bottom-2 right-2 w-3.5 h-3.5 pointer-events-none" aria-hidden="true" style={{ background: 'linear-gradient(315deg, transparent 45%, rgba(201,160,103,0.28) 50%, transparent 55%)' }} />
    </>
  );
}

/** 现代圆形品牌徽标（蓝紫渐变环 + 秋彦书法字） */
function ModernLogo() {
  return (
    <div
      className="relative w-[46px] h-[46px] rounded-full flex items-center justify-center select-none"
      style={{
        background: 'radial-gradient(circle at 40% 35%, rgba(99,102,241,0.12) 0%, transparent 65%)',
        border: '2px solid',
        borderImage: 'linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6) 1',
        animation: 'modern-logo-in 0.7s cubic-bezier(.22,.91,.27,1.02) both',
      }}
      aria-hidden="true"
    >
      <span
        className="text-sm font-bold leading-none tracking-wide"
        style={{ fontFamily: "'STKaiti','KaiTi','SimSun','Noto Serif SC',serif", color: '#4338ca' }}
      >秋彦</span>
    </div>
  );
}

/** 单个现代数据指标卡 */
function ModernStatCard({ item, t, delay }: {
  item: typeof FACTORY_HIGHLIGHTS[number];
  t: (key: string) => string;
  delay: number;
}) {
  const Icon = item.icon;
  const palette = [
    { bar: 'linear-gradient(90deg,#059669,#10b981)', bg: '#ECFDF5', ring: 'rgba(5,150,105,0.15)', icon: '#059669' },
    { bar: 'linear-gradient(90deg,#2563eb,#3b82f6)', bg: '#EFF6FF', ring: 'rgba(37,99,235,0.15)', icon: '#2563eb' },
    { bar: 'linear-gradient(90deg,#d97706,#f59e0b)',   bg: '#FFFBEB', ring: 'rgba(217,119,6,0.15)',   icon: '#d97706' },
  ];
  const idx = item.gradient.includes('059669') ? 0 : item.gradient.includes('2563eb') ? 1 : 2;
  const p = palette[idx];

  return (
    <div
      className="rounded-xl overflow-hidden bg-white/75 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg group"
      style={{
        border: `1px solid ${p.ring}`,
        boxShadow: '0 2px 12px rgba(59,130,246,0.05)',
        animation: `modern-card-in 0.6s cubic-bezier(.25,.46,.45,.94) ${delay}ms both`,
      }}
    >
      {/* 主题色顶条 */}
      <div className="h-1 w-full" style={{ background: p.bar }} />
      <div className="p-4 pt-3">
        {/* 图标 + 标签行 */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ background: p.bg, border: `1.5px solid ${p.ring}` }}
          >
            <Icon strokeWidth={1.8} className="w-[18px] h-[18px]" style={{ color: p.icon }} />
          </span>
          <span className="text-[11px] font-medium text-gray-400 leading-tight">{t(item.labelKey)}</span>
        </div>
        {/* 大数字 */}
        <div className="pl-[42px]">
          <span className="text-[26px] sm:text-[28px] font-bold tabular-nums tracking-tight text-gray-900">
            {item.value}
          </span>
          <span className="text-base font-semibold ml-0.5 opacity-60" style={{ color: p.icon }}>{item.suffix}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════ 现代融合关键帧动画 ═══════ */
function ModernKeyframes() {
  return (
    <style jsx global>{`
      @keyframes modern-logo-in {
        0%   { transform: scale(0.6); opacity: 0; filter: blur(4px); }
        60%  { transform: scale(1.08); opacity: 1; }
        80%  { transform: scale(0.97); }
        100% { transform: scale(1); opacity: 1; filter: blur(0); }
      }
      @keyframes modern-card-in {
        from { opacity: 0; transform: translateY(16px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
  );
}

export default function CompanyShowcase({ t }: CompanyShowcaseProps) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-white">
      {/* 现代融合动画关键帧 */}
      <ModernKeyframes />

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

          {/* ═══ 现代东方 · 秋彦数据签名卡 ═══ */}
          <div className="mt-4 relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(248,250,255,0.82) 50%, rgba(245,243,255,0.78) 100%)',
              border: '1px solid transparent',
              borderImage: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.15), rgba(201,160,103,0.25)) 1',
              boxShadow: '0 4px 24px rgba(59,130,246,0.07), 0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            {/* 四角几何装饰 */}
            <ModernCorners />

            {/* ── 头部：现代品牌徽标 ── */}
            <div className="relative z-10 pt-5 pb-3 px-5">
              <div className="flex flex-col items-center gap-2">
                {/* 品牌行：圆环徽标 + 分隔 + QIUYAN */}
                <div className="flex items-center gap-3">
                  <span className="hidden sm:block w-7 h-px bg-gradient-to-r from-transparent to-blue-300/40" />
                  <ModernLogo />
                  {/* 菱形分隔 */}<span className="w-1 h-1 rotate-45 bg-blue-400/30" />
                  <span className="text-xs font-semibold tracking-[0.28em] text-blue-600" style={{ fontFamily: 'Georgia,"Times New Roman",serif' }}>QIUYAN</span>
                  <span className="hidden sm:block w-7 h-px bg-gradient-to-l from-transparent to-blue-300/40" />
                </div>
                <span className="text-[9.5px] tracking-[0.32em] text-slate-400 uppercase opacity-70">Technology · Est. 2010</span>
              </div>

              {/* 渐变分隔线 */}
              <div className="mt-3 mx-auto max-w-xs h-px" style={{
                background: 'linear-gradient(90deg, transparent, rgba(201,160,103,0.35) 30%, #e8c88b 50%, rgba(201,160,103,0.35) 70%, transparent)',
              }} />
            </div>

            {/* ── 三项现代数据指标卡 ── */}
            <div className="relative z-10 px-4 pb-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {FACTORY_HIGHLIGHTS.map((h, idx) => (
                  <ModernStatCard key={h.labelKey} item={h} t={t} delay={idx * 150} />
                ))}
              </div>
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
