'use client';

import { useLocale } from '@/lib/i18n';
import { motion, Variants } from 'framer-motion';
import {
  BuildingOfficeIcon,
  BeakerIcon,
  RocketLaunchIcon,
  BoltIcon,
  ClockIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid';

const advantages = [
  { id: 1, icon: BuildingOfficeIcon, titleKey: 'advantages.item1.title', descKey: 'advantages.item1.description' },
  { id: 2, icon: BeakerIcon, titleKey: 'advantages.item2.title', descKey: 'advantages.item2.description' },
  { id: 3, icon: RocketLaunchIcon, titleKey: 'advantages.item3.title', descKey: 'advantages.item3.description' },
  { id: 4, icon: BoltIcon, titleKey: 'advantages.item4.title', descKey: 'advantages.item4.description' },
  { id: 5, icon: ClockIcon, titleKey: 'advantages.item5.title', descKey: 'advantages.item5.description' },
  { id: 6, icon: TrophyIcon, titleKey: 'advantages.item6.title', descKey: 'advantages.item6.description' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

export default function AdvantagesSection() {
  const { locale, t } = useLocale();

  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)' }}>
      {/* Background decorations */}
      <div className="absolute top-20 left-0 w-80 h-80 rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }} />
      <div className="absolute bottom-20 right-0 w-80 h-80 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(99, 102, 241, 0.04)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#0f172a' }}>
            {t('advantages.title')}
          </h2>
          <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: '#64748b' }}>
            {t('advantages.subtitle')}
          </p>
        </motion.div>

        {/* Advantages Grid */}
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {advantages.map((adv, index) => {
            const IconComponent = adv.icon;
            return (
              <motion.div
                key={adv.id}
                variants={fadeInUp}
                className="group relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.82)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(226, 232, 240, 0.6)',
                  boxShadow: '0 4px 20px rgba(148, 163, 184, 0.08)',
                }}
                whileHover={{
                  boxShadow: '0 12px 32px rgba(59, 130, 246, 0.10), 0 4px 12px rgba(148, 163, 184, 0.06)'
                }}
                transition={{ duration: 0.35 }}
              >
                {/* Icon Container - gradient background */}
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  transition={{ duration: 0.3 }}
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                  }}
                >
                  <IconComponent className="w-7 h-7" style={{ color: '#3b82f6' }} />
                </motion.div>

                {/* Numbered badge */}
                <div
                  className="absolute top-6 right-6 w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-colors duration-300"
                  style={{
                    backgroundColor: 'rgba(241, 245, 249, 0.8)',
                    color: '#94a3b8',
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-bold mb-3 transition-colors duration-300"
                  style={{ color: '#1e293b' }}
                >
                  {t(adv.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
                  {t(adv.descKey)}
                </p>

                {/* Learn More link */}
                <div
                  className="flex items-center font-semibold text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 mt-5"
                  style={{ color: '#3b82f6' }}
                >
                  <span>{locale === 'zh' ? '了解更多' : 'Learn More'}</span>
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Subtle top accent line on hover */}
                <div
                  className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
