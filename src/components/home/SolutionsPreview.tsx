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
} from '@heroicons/react/24/outline';

const solutions = [
  { nameKey: 'solutions.items.cabinet-type',   icon: CubeIcon,         colorFrom: '#3b82f6', colorTo: '#60a5fa' },
  { nameKey: 'solutions.items.managed-items',  icon: ArchiveBoxIcon,   colorFrom: '#6366f1', colorTo: '#818cf8' },
  { nameKey: 'solutions.items.industry',       icon: BuildingOfficeIcon,colorFrom: '#2563eb', colorTo: '#3b82f6' },
  { nameKey: 'solutions.items.custom-solution', icon: CogIcon,         colorFrom: '#7c3aed', colorTo: '#a78bfa' },
  { nameKey: 'solutions.items.robots',         icon: CpuChipIcon,     colorFrom: '#0891b2', colorTo: '#22d3ee' },
  { nameKey: 'solutions.items.laboratory',     icon: BeakerIcon,       colorFrom: '#059669', colorTo: '#34d399' },
  { nameKey: 'solutions.items.cleanroom',      icon: CloudIcon,        colorFrom: '#0284c7', colorTo: '#38bdf8' },
  { nameKey: 'solutions.items.other',          icon: WrenchIcon,       colorFrom: '#475569', colorTo: '#94a3b8' },
];

// Framer Motion variants
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
    <section className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #eff6ff 40%, #f8fafc 100%)' }}>
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(99, 102, 241, 0.03)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', color: '#6366f1' }}
          >
            <StarIcon className="w-4 h-4" />
            {t('home.solutions.badge') || '★ Solutions'}
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#0f172a' }}
          >
            {t('home.solutions.title') || 'Industry Solutions'}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#64748b' }}
          >
            {t('home.solutions.subtitle') || 'Tailored smart storage solutions for your industry'}
          </p>
        </div>

        {/* Solutions Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7"
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
              className="group relative rounded-2xl p-6 overflow-hidden transition-all duration-500"
              style={{
                background: 'rgba(255, 255, 255, 0.78)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                boxShadow: '0 4px 16px rgba(148, 163, 184, 0.06)',
              }}
              whileHover={{
                y: -6,
                boxShadow: '0 14px 36px rgba(99, 102, 241, 0.10), 0 4px 12px rgba(148, 163, 184, 0.04)',
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon Container - gradient per item */}
              <div
                className="w-14 h-14 mb-5 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${solution.colorFrom}18 0%, ${solution.colorTo}25 100%)`,
                  border: `1px solid ${solution.colorFrom}25`,
                }}
              >
                {solution.icon && (
                  <solution.icon className="w-7 h-7" style={{ color: solution.colorFrom }} />
                )}
              </div>

              {/* Title */}
              <h3
                className="text-base font-bold mb-2 transition-colors duration-300"
                style={{ color: '#1e293b' }}
              >
                {t(solution.nameKey) || solution.nameKey.split('.').pop()}
              </h3>

              {/* Hover arrow */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5" style={{ color: solution.colorFrom }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Top gradient line on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${solution.colorFrom}, ${solution.colorTo}, transparent)`,
                }}
              />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
