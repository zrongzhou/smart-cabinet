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
      staggerChildren: 0.15
    }
  }
};

export default function AdvantagesSection() {
  const { locale, t } = useLocale();

  return (
    <section className="py-24 px-6 bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-20 right-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-40" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('advantages.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-100 hover:-translate-y-2"
              >
                {/* Icon Container */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300"
                >
                  <IconComponent className="w-10 h-10 text-primary-900" />
                </motion.div>

                {/* Numbered badge */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-lg bg-gray-50 text-gray-400 font-bold text-sm flex items-center justify-center group-hover:bg-blue-50 group-hover:text-primary-900 transition-colors duration-300">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-900 transition-colors duration-300">
                  {t(adv.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {t(adv.descKey)}
                </p>

                {/* Learn More link */}
                <div className="flex items-center text-base font-semibold text-amber-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 mt-6">
                  <span>{locale === 'zh' ? '了解更多' : 'Learn More'}</span>
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
