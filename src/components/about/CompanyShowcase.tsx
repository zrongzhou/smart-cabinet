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

interface CompanyShowcaseProps {
  t: (key: string) => string;
  locale: string;
}

/** A small hydration-safe count-up that only animates once it scrolls into view. */
function Counter({ value, suffix = '', icon: Icon, label }: { value: number; suffix?: string; icon: React.ElementType; label?: string }) {
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
      <span className="flex items-center justify-center w-10 h-10 rounded-xl text-white shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
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
  { value: 800, suffix: '+', labelKey: 'about.showcase.metricClients', icon: Users },
  { value: 15, suffix: '+', labelKey: 'about.showcase.metricYears', icon: Factory },
  { value: 30, suffix: '+', labelKey: 'about.showcase.metricFortune', icon: Award },
];

const CERT_BADGES = [
  { name: 'CE', icon: CheckCircle },
  { name: 'ISO 9001', icon: BadgeCheck },
  { name: 'ISO 14001', icon: BadgeCheck },
  { name: 'ISO 45001', icon: BadgeCheck },
  { name: 'ISO 27001', icon: ShieldCheck },
  { name: '10+ Patents', icon: Award },
];

export default function CompanyShowcase({ t }: CompanyShowcaseProps) {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-white">
      {/* V8.5 fix: bug 5 — refined, subtle breathing glow for the flow lines (no harsh dashes) */}
      <style jsx global>{`
        .about-showcase-flow {
          animation: about-showcase-breathe 7s ease-in-out infinite;
        }
        @keyframes about-showcase-breathe {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.95; }
        }
        .about-showcase-dot {
          filter: drop-shadow(0 0 3px rgba(199, 210, 254, 0.9));
        }
      `}</style>
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

          {/* V8.5 fix: bug 5 — refined, subtle "data flow" lines under the image.
              Solid (non-dashed) gradient strokes with a soft glow filter, plus a
              few slow light points drifting along the curves. RTL-safe. */}
          <div className="mt-3 h-12 w-full overflow-hidden rounded-lg" aria-hidden="true">
            <svg
              viewBox="0 0 600 48"
              preserveAspectRatio="none"
              className="h-full w-full about-showcase-flow"
            >
              <defs>
                <linearGradient id="aboutShowcaseFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
                <filter id="aboutShowcaseGlow" x="-20%" y="-60%" width="140%" height="220%">
                  <feGaussianBlur stdDeviation="1.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Solid, gentle flowing lines — no harsh dashes, softer as they recede */}
              {[12, 24, 36].map((y, i) => (
                <path
                  key={i}
                  d={`M0 ${y} C 90 ${y - 6}, 180 ${y + 6}, 270 ${y} S 430 ${y - 6}, 510 ${y} S 600 ${y + 6}, 600 ${y}`}
                  fill="none"
                  stroke="url(#aboutShowcaseFlowGrad)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  filter="url(#aboutShowcaseGlow)"
                  style={{ opacity: 0.5 - i * 0.12 }}
                />
              ))}

              {/* Slow light points drifting along the curves for a subtle "live" feel */}
              {[12, 24, 36].map((y, i) => (
                <circle key={`dot-${i}`} r="1.8" fill="#c7d2fe" className="about-showcase-dot">
                  <animateMotion
                    dur="6s"
                    begin={`${i * 1.2}s`}
                    repeatCount="indefinite"
                    path={`M0 ${y} C 90 ${y - 6}, 180 ${y + 6}, 270 ${y} S 430 ${y - 6}, 510 ${y} S 600 ${y + 6}, 600 ${y}`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0"
                    dur="6s"
                    begin={`${i * 1.2}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </svg>
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
              <Counter key={m.labelKey} value={m.value} suffix={m.suffix} icon={m.icon} label={t(m.labelKey)} />
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
