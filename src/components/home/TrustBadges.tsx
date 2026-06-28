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
  { icon: CheckCircleIcon, titleKey: 'trustBadges.iso',         description: 'ISO Certified' },
  { icon: ShieldCheckIcon, titleKey: 'trustBadges.patents',     description: 'Patents & Copyrights' },
  { icon: GlobeAltIcon, titleKey: 'trustBadges.export',      description: '60+ Countries Exported' },
  { icon: ClockIcon, titleKey: 'trustBadges.experience',  description: 'Since 2015' },
  { icon: UserGroupIcon, titleKey: 'trustBadges.clients',     description: 'Trusted Clients' },
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
    <section className="py-20 px-6 bg-white relative overflow-hidden">
      {/* Top border accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(90deg, #1a365d, #2a4a7f, #1a365d)' }}
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
            style={{ color: '#1a202c' }}
          >
            {t('home.trustBadges.title')}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: '#4a5568' }}
          >
            {t('home.trustBadges.subtitle')}
          </p>
        </motion.div>

        {/* Badges Grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16"
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
                className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center border-2"
                style={{ 
                  borderColor: '#e2e8f0',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                {/* Icon Container */}
                <div 
                  className="w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: '#1a365d' }}
                >
                  <IconComponent className="w-10 h-10" style={{ color: '#f6ad55' }} />
                </div>
                <h3 
                  className="text-base font-bold mb-1"
                  style={{ color: '#1a202c' }}
                >
                  {t(badge.titleKey)}
                </h3>
                <p className="text-sm" style={{ color: '#4a5568' }}>{badge.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Company Stats - Different from Hero stats */}
        <motion.div 
          className="rounded-2xl p-8 shadow-lg"
          style={{ backgroundColor: '#f7fafc' }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p 
            className="text-center text-sm font-semibold uppercase tracking-wider mb-8"
            style={{ color: '#718096' }}
          >
            Guangzhou Qiuyan Technology Co., Ltd. - Established 2015
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '99.9%',  labelKey: 'home.trustBadges.stats.uptime' },
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
                  className="text-4xl font-bold mb-2"
                  style={{ color: '#1a365d' }}
                >
                  {stat.number}
                </div>
                <div className="text-sm font-medium" style={{ color: '#4a5568' }}>{t(stat.labelKey)}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
