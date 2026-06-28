'use client';

import { useLocale } from '@/lib/i18n';
import { motion } from 'framer-motion';
import {
  CubeIcon,
  ArchiveBoxIcon,
  BuildingOfficeIcon,
  CogIcon,
  CpuChipIcon,
  BeakerIcon,
  CloudIcon,
  WrenchIcon,
  StarIcon,
} from '@heroicons/react/24/solid';

const solutions = [
  { nameKey: 'solutions.items.cabinet-type',   icon: CubeIcon,         colorFrom: '#3b82f6', colorTo: '#60a5fa', bgGlow: 'rgba(59,130,246,0.08)' },
  { nameKey: 'solutions.items.managed-items',  icon: ArchiveBoxIcon,   colorFrom: '#6366f1', colorTo: '#818cf8', bgGlow: 'rgba(99,102,241,0.08)' },
  { nameKey: 'solutions.items.industry',       icon: BuildingOfficeIcon,colorFrom: '#2563eb', colorTo: '#3b82f6', bgGlow: 'rgba(37,99,235,0.08)' },
  { nameKey: 'solutions.items.custom-solution', icon: CogIcon,         colorFrom: '#7c3aed', colorTo: '#a78bfa', bgGlow: 'rgba(124,58,237,0.08)' },
  { nameKey: 'solutions.items.robots',         icon: CpuChipIcon,     colorFrom: '#0891b2', colorTo: '#22d3ee', bgGlow: 'rgba(8,145,178,0.08)' },
  { nameKey: 'solutions.items.laboratory',     icon: BeakerIcon,       colorFrom: '#059669', colorTo: '#34d399', bgGlow: 'rgba(5,150,105,0.08)' },
  { nameKey: 'solutions.items.cleanroom',      icon: CloudIcon,        colorFrom: '#0284c7', colorTo: '#38bdf8', bgGlow: 'rgba(2,132,199,0.08)' },
  { nameKey: 'solutions.items.other',          icon: WrenchIcon,       colorFrom: '#475569', colorTo: '#94a3b8', bgGlow: 'rgba(71,85,105,0.06)' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

interface SolutionsPreviewProps {
  locale?: string;
}

export default function SolutionsPreview({ locale: propLocale }: SolutionsPreviewProps) {
  const { locale, t } = useLocale();
  const currentLocale = propLocale || locale;

  return (
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 30%, #f0f9ff 70%, #f8fafc 100%)' }}>
      {/* Background decorations */}
      <div className="absolute top-[5%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[160px]" style={{ backgroundColor: 'rgba(99, 102, 241, 0.06)' }} />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[140px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.07)' }} />
      <div className="absolute top-[40%] right-[-5%] w-[350px] h-[350px] rounded-full blur-[130px]" style={{ backgroundColor: 'rgba(168, 85, 247, 0.05)' }} />

      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.1) 100%)',
                color: '#7c3aed',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              <StarIcon className="w-4 h-4" />
              {t('home.solutions.badge') || '★ Solutions'}
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
            style={{ color: '#0f172a' }}
          >
            {t('home.solutions.title') || 'Industry Solutions'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#64748b' }}
          >
            {t('home.solutions.subtitle') || 'Tailored smart storage solutions for your industry'}
          </motion.p>
          {/* Gradient underline */}
          <div className="w-16 h-1 mx-auto mt-6 rounded-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #3b82f6)' }} />
        </div>

        {/* Solutions Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7"
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {solutions.map((solution, index) => (
            <motion.a
              key={index}
              href={`/${currentLocale}/products?type=${solution.nameKey.split('.').pop()}`}
              variants={fadeInUp}
              className="group relative rounded-2xl p-7 overflow-hidden"
              style={{
                background: `linear-gradient(165deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.92) 100%)`,
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(226, 232, 240, 0.55)',
                boxShadow: '0 4px 20px rgba(148, 163, 184, 0.07), 0 1px 3px rgba(0,0,0,0.03)',
              }}
              whileHover={{
                y: -10,
                boxShadow: `0 24px 56px ${solution.colorFrom}18, 0 8px 20px rgba(148,163,184,0.06)`,
                transition: { duration: 0.35 }
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Colored top bar on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-[3.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl"
                style={{
                  background: `linear-gradient(90deg, ${solution.colorFrom}, ${solution.colorTo})`,
                }}
              />

              {/* Soft background glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${solution.bgGlow} 0%, transparent 60%)`,
                }}
              />

              {/* Icon Container - large gradient with glow */}
              <div
                className="relative w-[60px] h-[60px] mb-6 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${solution.colorFrom} 0%, ${solution.colorTo} 100%)`,
                  boxShadow: `0 6px 20px ${solution.colorFrom}35`,
                }}
              >
                {/* Hover glow ring */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: `0 0 0 3px ${solution.colorFrom}25, 0 0 24px ${solution.colorFrom}20`,
                  }}
                />
                {solution.icon && (
                  <solution.icon className="w-7 h-7 text-white relative z-10" />
                )}
              </div>

              {/* Title */}
              <h3
                className="text-base font-bold mb-3 transition-colors duration-300"
                style={{ color: '#1e293b' }}
              >
                {t(solution.nameKey) || solution.nameKey.split('.').pop()}
              </h3>

              {/* Subtle description area placeholder for visual balance */}
              <div className="h-2 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(241,245,249,0.8)' }}>
                <div
                  className="h-full rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
                  style={{
                    width: '60%',
                    background: `linear-gradient(90deg, ${solution.colorFrom}40, ${solution.colorTo}40)`,
                  }}
                />
              </div>
              <div className="h-2 rounded-full w-3/4 overflow-hidden" style={{ background: 'rgba(241,245,249,0.6)' }}>
                <div
                  className="h-full rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700"
                  style={{
                    width: '40%',
                    background: `linear-gradient(90deg, ${solution.colorFrom}30, ${solution.colorTo}30)`,
                    transitionDelay: '100ms',
                  }}
                />
              </div>

              {/* Hover arrow indicator */}
              <div className="absolute top-7 right-7 w-9 h-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300"
                style={{
                  background: `${solution.colorFrom}10`,
                  border: `1px solid ${solution.colorFrom}20`,
                }}
              >
                <svg className="w-4 h-4" style={{ color: solution.colorFrom }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
