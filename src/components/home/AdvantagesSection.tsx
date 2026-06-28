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
  CheckCircleIcon,
} from '@heroicons/react/24/solid';

const advantages = [
  {
    id: 1, icon: BuildingOfficeIcon,
    titleKey: 'advantages.item1.title', descKey: 'advantages.item1.description',
    gradientFrom: '#3b82f6', gradientTo: '#8b5cf6',
    featureKeys: ['advantages.features.rfid', 'advantages.features.zeroError', 'advantages.features.realtimeTrack', 'advantages.features.multiTag'],
  },
  {
    id: 2, icon: BeakerIcon,
    titleKey: 'advantages.item2.title', descKey: 'advantages.item2.description',
    gradientFrom: '#06b6d4', gradientTo: '#3b82f6',
    featureKeys: ['advantages.features.inventoryVis', 'advantages.features.autoReorder', 'advantages.features.lowStockAlert', 'advantages.features.dataReport'],
  },
  {
    id: 3, icon: RocketLaunchIcon,
    titleKey: 'advantages.item3.title', descKey: 'advantages.item3.description',
    gradientFrom: '#8b5cf6', gradientTo: '#ec4899',
    featureKeys: ['advantages.features.closedLoop', 'advantages.features.fullTrace', 'advantages.features.anomalyAlert', 'advantages.features.responsible'],
  },
  {
    id: 4, icon: BoltIcon,
    titleKey: 'advantages.item4.title', descKey: 'advantages.item4.description',
    gradientFrom: '#f59e0b', gradientTo: '#ef4444',
    featureKeys: ['advantages.features.isoCert', 'advantages.features.mgmtSystem', 'advantages.features.ceFcc', 'advantages.features.qualityTrace'],
  },
  {
    id: 5, icon: ClockIcon,
    titleKey: 'advantages.item5.title', descKey: 'advantages.item5.description',
    gradientFrom: '#10b981', gradientTo: '#06b6d4',
    featureKeys: ['advantages.features.export60', 'advantages.features.aerospace', 'advantages.features.autoIndustry', 'advantages.features.globalService'],
  },
  {
    id: 6, icon: TrophyIcon,
    titleKey: 'advantages.item6.title', descKey: 'advantages.item6.description',
    gradientFrom: '#ec4899', gradientTo: '#f43f5e',
    featureKeys: ['advantages.features.patents', 'advantages.features.softwareCopyright', 'advantages.features.techIteration', 'advantages.features.industryLead'],
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.10 } },
};

export default function AdvantagesSection() {
  const { locale, t } = useLocale();

  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 40%, #eff6ff 80%, #f8fafc 100%)' }}>
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)' }} />
      <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)' }} />
      <div className="absolute bottom-20 right-[-10%] w-[450px] h-[450px] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.06)' }} />
      <div className="absolute top-1/2 right-[10%] w-[350px] h-[350px] rounded-full blur-[130px]" style={{ backgroundColor: 'rgba(6, 182, 212, 0.05)' }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)`,
        backgroundSize: '36px 36px',
      }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(139,92,246,0.10) 100%)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ boxShadow: '0 0 6px rgba(59,130,246,0.5)' }} />
            {t('advantages.subtitle')}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#0f172a' }}>
            {t('advantages.title')}
          </h2>
          <div className="w-20 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)' }} />
        </motion.div>

        {/* Advantages Grid */}
        <motion.div variants={staggerChildren} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {advantages.map((adv) => {
            const IconComponent = adv.icon;
            return (
              <motion.div
                key={adv.id}
                variants={fadeInUp}
                className="group relative rounded-2xl p-7 overflow-hidden cursor-default"
                style={{
                  background: 'linear-gradient(165deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(226, 232, 240, 0.5)',
                  boxShadow: '0 4px 24px rgba(148, 163, 184, 0.07)',
                }}
                whileHover={{
                  y: -8,
                  boxShadow: `0 22px 50px ${adv.gradientFrom}15, 0 8px 20px rgba(148,163,184,0.06)`,
                  transition: { duration: 0.35 }
                }}
              >
                {/* Top gradient line on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, ${adv.gradientFrom}, ${adv.gradientTo})` }}
                />

                {/* Shimmer on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `linear-gradient(105deg, transparent 30%, ${adv.gradientFrom}06 45%, ${adv.gradientTo}06 55%, transparent 70%)`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s ease infinite',
                  }}
                />

                {/* Icon Container — larger, with ring + gradient background + rotate on hover */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${adv.gradientFrom} 0%, ${adv.gradientTo} 100%)`,
                    boxShadow: `0 8px 24px ${adv.gradientFrom}38`,
                  }}
                >
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `0 0 0 3px ${adv.gradientFrom}20, 0 0 20px ${adv.gradientFrom}20` }}
                  />
                  <IconComponent className="w-7 h-7 text-white relative z-10" />
                </motion.div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-2.5" style={{ color: '#1e293b' }}>
                  {t(adv.titleKey)}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748b' }}>
                  {t(adv.descKey)}
                </p>

                {/* Feature Tags — with staggered fade-in animation */}
                <div className="flex flex-wrap gap-1.5">
                  {adv.featureKeys.map((fkey, fi) => (
                    <motion.span
                      key={fi}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 0.85, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 * fi }}
                      className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md transition-all duration-300 hover:opacity-100 group-hover:opacity-100"
                      style={{
                        background: `${adv.gradientFrom}0a`,
                        color: adv.gradientFrom,
                        border: `1px solid ${adv.gradientFrom}18`,
                      }}
                    >
                      <CheckCircleIcon className="w-3 h-3 mr-1 opacity-60" />
                      {t(fkey)}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </section>
  );
}
