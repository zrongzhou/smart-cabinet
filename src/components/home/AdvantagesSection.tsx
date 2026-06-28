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
  { id: 1, icon: BuildingOfficeIcon, titleKey: 'advantages.item1.title', descKey: 'advantages.item1.description', gradientFrom: '#3b82f6', gradientTo: '#8b5cf6' },
  { id: 2, icon: BeakerIcon,       titleKey: 'advantages.item2.title', descKey: 'advantages.item2.description', gradientFrom: '#06b6d4', gradientTo: '#3b82f6' },
  { id: 3, icon: RocketLaunchIcon, titleKey: 'advantages.item3.title', descKey: 'advantages.item3.description', gradientFrom: '#8b5cf6', gradientTo: '#ec4899' },
  { id: 4, icon: BoltIcon,         titleKey: 'advantages.item4.title', descKey: 'advantages.item4.description', gradientFrom: '#f59e0b', gradientTo: '#ef4444' },
  { id: 5, icon: ClockIcon,        titleKey: 'advantages.item5.title', descKey: 'advantages.item5.description', gradientFrom: '#10b981', gradientTo: '#06b6d4' },
  { id: 6, icon: TrophyIcon,       titleKey: 'advantages.item6.title', descKey: 'advantages.item6.description', gradientFrom: '#ec4899', gradientTo: '#f43f5e' },
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
    <section className="py-28 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 40%, #eff6ff 80%, #f8fafc 100%)' }}>
      {/* Rich background decorations */}
      <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }} />
      <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.10)' }} />
      <div className="absolute bottom-20 right-[-10%] w-[450px] h-[450px] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }} />
      <div className="absolute top-1/2 right-[10%] w-[350px] h-[350px] rounded-full blur-[130px]" style={{ backgroundColor: 'rgba(6, 182, 212, 0.06)' }} />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-20"
        >
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            {t('advantages.subtitle')}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5" style={{ color: '#0f172a' }}>
            {t('advantages.title')}
          </h2>
          {/* Gradient underline */}
          <div className="w-20 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
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
                className="group relative rounded-2xl p-8 overflow-hidden cursor-default"
                style={{
                  background: 'linear-gradient(165deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(226, 232, 240, 0.6)',
                  boxShadow: '0 4px 24px rgba(148, 163, 184, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
                }}
                whileHover={{
                  y: -8,
                  boxShadow: `0 20px 50px ${adv.gradientFrom}20, 0 8px 20px rgba(148,163,184,0.08)`,
                  transition: { duration: 0.35 }
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Animated top border on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, ${adv.gradientFrom}, ${adv.gradientTo})`,
                  }}
                />

                {/* Shimmer overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `linear-gradient(105deg, transparent 30%, ${adv.gradientFrom}08 45%, ${adv.gradientTo}08 55%, transparent 70%)`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s ease infinite',
                  }}
                />

                {/* Icon Container - large, gradient, with glow ring */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-7"
                  style={{
                    background: `linear-gradient(135deg, ${adv.gradientFrom} 0%, ${adv.gradientTo} 100%)`,
                    boxShadow: `0 8px 24px ${adv.gradientFrom}35`,
                  }}
                >
                  {/* Glow ring around icon */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: `0 0 0 3px ${adv.gradientFrom}25, 0 0 20px ${adv.gradientFrom}25`,
                    }}
                  />
                  <IconComponent className="w-8 h-8 text-white relative z-10" />
                </motion.div>

                {/* Numbered badge */}
                <div
                  className="absolute top-7 right-7 w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(241,245,249,0.9) 0%, rgba(241,245,249,0.6) 100%)',
                    color: '#94a3b8',
                    border: '1px solid rgba(226,232,240,0.5)',
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
                  style={{ color: adv.gradientFrom }}
                >
                  <span>{locale === 'zh' ? '了解更多' : 'Learn More'}</span>
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </section>
  );
}
