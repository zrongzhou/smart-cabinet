'use client';

import { useLocale } from '@/lib/i18n';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';

const trustBadges = [
  { icon: CheckCircleIcon,   titleKey: 'trustBadges.iso',         description: 'ISO Certified',           color: '#10b981', glowColor: 'rgba(16,185,129,0.15)' },
  { icon: ShieldCheckIcon,  titleKey: 'trustBadges.patents',     description: 'Patents & Copyrights',     color: '#3b82f6', glowColor: 'rgba(59,130,246,0.15)' },
  { icon: GlobeAltIcon,     titleKey: 'trustBadges.export',      description: '60+ Countries Exported',   color: '#6366f1', glowColor: 'rgba(99,102,241,0.15)' },
  { icon: ClockIcon,        titleKey: 'trustBadges.experience',  description: 'Since 2015',               color: '#f59e0b', glowColor: 'rgba(245,158,11,0.15)' },
  { icon: UserGroupIcon,    titleKey: 'trustBadges.clients',      description: 'Trusted Clients',          color: '#ef4444', glowColor: 'rgba(239,68,68,0.15)' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55 }
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

interface TrustBadgesProps {
  locale?: string;
}

export default function TrustBadges({ locale: propLocale }: TrustBadgesProps) {
  const { locale, t } = useLocale();
  const currentLocale = propLocale || locale;

  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #eff6ff 100%)' }}>
      {/* Top gradient accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[5px]"
        style={{
          background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 20%, #8b5cf6 40%, #06b6d4 60%, #10b981 80%, #3b82f6 100%)',
        }}
      />

      {/* Background decorations */}
      <div className="absolute top-[15%] left-[5%] w-[350px] h-[350px] rounded-full blur-[140px]" style={{ backgroundColor: 'rgba(99, 102, 241, 0.06)' }} />
      <div className="absolute bottom-[15%] right-[5%] w-[300px] h-[300px] rounded-full blur-[130px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.07)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(168, 85, 247, 0.03)' }} />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
            style={{ color: '#0f172a' }}
          >
            {t('home.trustBadges.title') || 'Why Choose Us'}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: '#64748b' }}
          >
            {t('home.trustBadges.subtitle') || 'Proven track record and industry recognition'}
          </p>
          {/* Gradient underline */}
          <div className="w-20 h-1 mx-auto mt-6 rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)' }} />
        </motion.div>

        {/* Badges Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20"
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {trustBadges.map((badge, index) => {
            const IconComponent = badge.icon;
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group text-center p-6 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(165deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(226, 232, 240, 0.55)',
                  boxShadow: '0 4px 20px rgba(148, 163, 184, 0.07), 0 1px 3px rgba(0,0,0,0.02)',
                }}
                whileHover={{
                  y: -8,
                  boxShadow: `0 18px 44px ${badge.color}18, 0 6px 16px rgba(148,163,184,0.05)`,
                  transition: { duration: 0.35 }
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Top color line on hover */}
                <div
                  className="absolute top-0 left-3 right-3 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-sm"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${badge.color}, transparent)`,
                  }}
                />

                {/* Background glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 30%, ${badge.glowColor} 0%, transparent 65%)`,
                  }}
                />

                {/* Icon Container - large, colorful with glow */}
                <div
                  className="relative w-[64px] h-[64px] mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${badge.color} 0%, ${badge.color}cc 100%)`,
                    boxShadow: `0 6px 22px ${badge.color}38`,
                  }}
                >
                  {/* Glow ring on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: `0 0 0 3px ${badge.color}25, 0 0 28px ${badge.color}20`,
                    }}
                  />
                  <IconComponent className="w-8 h-8 text-white relative z-10" />
                </div>

                <h3
                  className="text-sm font-bold mb-1.5 transition-colors duration-300"
                  style={{ color: '#1e293b' }}
                >
                  {t(badge.titleKey) || badge.description}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{badge.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Company Stats - Rich panel */}
        <motion.div
          className="rounded-2xl p-10 md:p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.95) 0%, rgba(241, 245, 249, 0.85) 50%, rgba(240,249,255,0.9) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(219, 234, 254, 0.6)',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.08), 0 2px 8px rgba(148, 163, 184, 0.04)',
          }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative background glows */}
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-[90px]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.10)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[80px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.09)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(6, 182, 212, 0.05)' }} />

          {/* Company info label */}
          <p
            className="text-center text-xs font-bold uppercase tracking-widest mb-10 relative z-10"
            style={{ color: '#94a3b8' }}
          >
            {locale === 'zh' ? '广州秋彦科技有限公司 · 成立于2015年' : locale === 'ar' ? 'شركة قوانغتشو تشيويان للتكنولوجيا · تأسست عام 2015' : 'Guangzhou Qiuyan Technology Co., Ltd. · Established 2015'}
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center relative z-10">
            {[
              { number: '99.9%', labelKey: 'home.trustBadges.stats.uptime',       colors: ['#3b82f6', '#06b6d4'] },
              { number: '40%',   labelKey: 'home.trustBadges.stats.efficiency',    colors: ['#8b5cf6', '#ec4899'] },
              { number: '30%',   labelKey: 'home.trustBadges.stats.costReduction', colors: ['#10b981', '#06b6d4'] },
              { number: '24/7',  labelKey: 'home.trustBadges.stats.support',       colors: ['#f59e0b', '#ef4444'] },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="group"
                whileHover={{ y: -6, scale: 1.04 }}
                transition={{ duration: 0.3, type: 'spring' }}
              >
                {/* Stat number with animated gradient */}
                <div
                  className="text-4xl md:text-5xl lg:text-6xl font-black mb-3 bg-clip-text text-transparent relative inline-block"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${stat.colors[0]} 0%, ${stat.colors[1]} 50%, ${stat.colors[0]} 100%)`,
                    WebkitBackgroundClip: 'text',
                    backgroundSize: '200% auto',
                    animation: `gradient-shift-${idx} 3s ease infinite`,
                    filter: 'drop-shadow(0 2px 8px rgba(99,102,241,0.15))',
                  }}
                >
                  {stat.number}
                </div>
                <div className="text-sm font-semibold" style={{ color: '#64748b' }}>{t(stat.labelKey)}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CSS for all animations */}
      <style>{`
        @keyframes gradient-shift-0 {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }
        @keyframes gradient-shift-1 {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }
        @keyframes gradient-shift-2 {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }
        @keyframes gradient-shift-3 {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }
      `}</style>
    </section>
  );
}
