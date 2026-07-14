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
import { Users, Factory, Award, ShieldCheck, BadgeCheck, CheckCircle } from 'lucide-react';
import AboutBowKnot from '@/components/about/AboutBowKnot';

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

export default function CompanyShowcase({ t, locale }: CompanyShowcaseProps) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-white">
      {/* Soft animated depth layer — 极淡蓝，无紫色闪屏 */}
      <div className="absolute inset-0" style={{
        background:
          'linear-gradient(135deg, rgba(59,130,246,0.03) 0%, rgba(99,102,241,0.02) 50%, rgba(147,197,253,0.03) 100%)',
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

          {/* ═══ Brand signature / caption block (sits under the photo) ═══ */}
          <div className="mt-6">
            <AboutBowKnot t={t} locale={locale} />
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
