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
  { icon: CheckCircleIcon,   titleKey: 'trustBadges.iso',         description: 'ISO Certified',           color: '#10b981' },
  { icon: ShieldCheckIcon,  titleKey: 'trustBadges.patents',     description: 'Patents & Copyrights',     color: '#3b82f6' },
  { icon: GlobeAltIcon,     titleKey: 'trustBadges.export',      description: '60+ Countries Exported',   color: '#6366f1' },
  { icon: ClockIcon,        titleKey: 'trustBadges.experience',  description: 'Since 2015',               color: '#f59e0b' },
  { icon: UserGroupIcon,    titleKey: 'trustBadges.clients',      description: 'Trusted Clients',          color: '#ef4444' },
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

interface TrustBadgesProps {
  locale?: string;
}

export default function TrustBadges({ locale: propLocale }: TrustBadgesProps) {
  const { locale, t } = useLocale();
  const currentLocale = propLocale || locale;

  return (
    <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
      {/* Top border accent - enhanced */}
      <div
        className="absolute top-0 left-0 right-0 h-[4px]"
        style={{
          background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 25%, #8b5cf6 50%, #06b6d4 75%, #3b82f6 100%)',
        }}
      />

      {/* Background decoration */}
      <div className="absolute top-1/3 left-10 w-72 h-72 rounded-full blur-[130px]" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }} />
      <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }} />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
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
        </motion.div>

        {/* Badges Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16"
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
                className="group text-center p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(226, 232, 240, 0.6)',
                  boxShadow: '0 4px 20px rgba(148, 163, 184, 0.08), 0 1px 3px rgba(0,0,0,0.03)',
                }}
                whileHover={{
                  boxShadow: `0 12px 32px ${badge.color}18, 0 4px 12px rgba(148, 163, 184, 0.06)`
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Icon Container - solid gradient with white icon */}
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${badge.color} 0%, ${badge.color}cc 100%)`,
                    boxShadow: `0 4px 14px ${badge.color}35`,
                  }}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3
                  className="text-sm font-bold mb-1"
                  style={{ color: '#1e293b' }}
                >
                  {t(badge.titleKey) || badge.description}
                </h3>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{badge.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Company Stats */}
        <motion.div
          className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.9) 0%, rgba(241, 245, 249, 0.7) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(219, 234, 254, 0.6)',
            boxShadow: '0 4px 24px rgba(99, 102, 241, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
          }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px]" style={{ backgroundColor: 'rgba(139, 92, 246, 0.08)' }} />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-[80px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.06)' }} />
          <p
            className="text-center text-xs font-semibold uppercase tracking-wider mb-8"
            style={{ color: '#64748b' }}
          >
            {locale === 'zh' ? '广州秋彦科技有限公司 · 成立于2015年' : locale === 'ar' ? 'شركة قوانغتشو تشيويان للتكنولوجيا · تأسست عام 2015' : 'Guangzhou Qiuyan Technology Co., Ltd. · Established 2015'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '99.9%', labelKey: 'home.trustBadges.stats.uptime' },
              { number: '40%',   labelKey: 'home.trustBadges.stats.efficiency' },
              { number: '30%',   labelKey: 'home.trustBadges.stats.costReduction' },
              { number: '24/7',  labelKey: 'home.trustBadges.stats.support' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="group"
                whileHover={{ y: -5, scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent relative"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 80%, #06b6d4 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundSize: '200% auto',
                    animation: 'gradient-shift 4s ease infinite',
                  }}
                >
                  {stat.number}
                </div>
                <div className="text-sm font-medium" style={{ color: '#64748b' }}>{t(stat.labelKey)}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </section>
  );
}
