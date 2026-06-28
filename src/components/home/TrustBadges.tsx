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
      {/* Top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 30%, #8b5cf6 60%, #3b82f6 100%)',
        }}
      />

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
                className="group text-center p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(226, 232, 240, 0.5)',
                  boxShadow: '0 4px 16px rgba(148, 163, 184, 0.06)',
                }}
                whileHover={{
                  boxShadow: `0 8px 28px ${badge.color}15, 0 4px 8px rgba(148, 163, 184, 0.04)`
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Icon Container */}
                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${badge.color}12 0%, ${badge.color}22 100%)`,
                    border: `1px solid ${badge.color}20`,
                  }}
                >
                  <IconComponent className="w-8 h-8" style={{ color: badge.color }} />
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
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(219, 234, 254, 0.5)',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.05)',
          }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
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
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
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
    </section>
  );
}
