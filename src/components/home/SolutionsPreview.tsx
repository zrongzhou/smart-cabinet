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
  { nameKey: 'solutions.items.cabinet-type',   icon: CubeIcon },
  { nameKey: 'solutions.items.managed-items',  icon: ArchiveBoxIcon },
  { nameKey: 'solutions.items.industry',       icon: BuildingOfficeIcon },
  { nameKey: 'solutions.items.custom-solution', icon: CogIcon },
  { nameKey: 'solutions.items.robots',         icon: CpuChipIcon },
  { nameKey: 'solutions.items.laboratory',     icon: BeakerIcon },
  { nameKey: 'solutions.items.cleanroom',      icon: CloudIcon },
  { nameKey: 'solutions.items.other',          icon: WrenchIcon },
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
      staggerChildren: 0.1
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
    <section className="relative py-20 px-6 overflow-hidden" style={{ backgroundColor: '#0d1b2a' }}>
      {/* Decorative glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(245, 173, 85, 0.2)' }} />
      
      {/* Geometric pattern overlay */}
      <div 
        className="absolute inset-0" 
        style={{ 
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='2' cy='2' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }} 
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold mb-4"
            style={{ backgroundColor: 'rgba(37, 99, 235, 0.3)', color: '#93c5fd' }}
          >
            <StarIcon className="w-4 h-4" />
            {t('home.solutions.badge') || 'Solutions'}
          </div>
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: '#ffffff' }}
          >
            {t('home.solutions.title')}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#cbd5e0' }}
          >
            {t('home.solutions.subtitle')}
          </p>
        </div>

        {/* Solutions Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
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
              className="group relative rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border overflow-hidden"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(4px)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon Container */}
              <div 
                className="w-16 h-16 mb-5 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: '#1a365d' }}
              >
                {solution.icon && (
                  <solution.icon className="w-8 h-8" style={{ color: '#f6ad55' }} />
                )}
              </div>

              {/* Title */}
              <h3 
                className="text-lg font-bold mb-2 transition-colors duration-300"
                style={{ color: '#ffffff' }}
              >
                {t(solution.nameKey)}
              </h3>

              {/* Hover arrow */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5" style={{ color: '#60a5fa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
