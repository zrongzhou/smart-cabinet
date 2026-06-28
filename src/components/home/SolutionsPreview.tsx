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
    <section className="relative py-20 px-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div 
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold mb-4 bg-blue-100 text-blue-700"
          >
            <StarIcon className="w-4 h-4" />
            {t('home.solutions.badge') || '★ Solutions'}
          </div>
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
          >
            {t('home.solutions.title') || 'Industry Solutions'}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto leading-relaxed text-gray-600"
          >
            {t('home.solutions.subtitle') || 'Tailored smart storage solutions for your industry'}
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
              className="group relative rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border overflow-hidden bg-white border-blue-100 hover:border-blue-300"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon Container */}
              <div 
                className="w-16 h-16 mb-5 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 bg-blue-50"
              >
                {solution.icon && (
                  <solution.icon className="w-8 h-8 text-blue-600" />
                )}
              </div>

              {/* Title */}
              <h3 
                className="text-lg font-bold mb-2 transition-colors duration-300 text-gray-900"
              >
                {t(solution.nameKey) || solution.nameKey.split('.').pop()}
              </h3>

              {/* Hover arrow */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
