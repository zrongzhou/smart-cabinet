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
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';

const solutions = [
  {
    nameKey: 'solutions.items.cabinet-type',
    descKey: 'solutions.items.cabinet-type.desc',
    icon: CubeIcon,
    colorFrom: '#3b82f6', colorTo: '#60a5fa', bgGlow: 'rgba(59,130,246,0.10)',
    tags: ['RFID识别', '多柜型', '双码支持'],
  },
  {
    nameKey: 'solutions.items.managed-items',
    descKey: 'solutions.items.managed-items.desc',
    icon: ArchiveBoxIcon,
    colorFrom: '#6366f1', colorTo: '#818cf8', bgGlow: 'rgba(99,102,241,0.10)',
    tags: ['高值耗材', '实时追踪', '自动预警'],
  },
  {
    nameKey: 'solutions.items.industry',
    descKey: 'solutions.items.industry.desc',
    icon: BuildingOfficeIcon,
    colorFrom: '#2563eb', colorTo: '#3b82f6', bgGlow: 'rgba(37,99,235,0.10)',
    tags: ['MES对接', '汽车/航天', '产线集成'],
  },
  {
    nameKey: 'solutions.items.custom-solution',
    descKey: 'solutions.items.custom-solution.desc',
    icon: CogIcon,
    colorFrom: '#7c3aed', colorTo: '#a78bfa', bgGlow: 'rgba(124,58,237,0.10)',
    tags: ['100%定制', '一站式', '场景匹配'],
  },
  {
    nameKey: 'solutions.items.robots',
    descKey: 'solutions.items.robots.desc',
    icon: CpuChipIcon,
    colorFrom: '#0891b2', colorTo: '#22d3ee', bgGlow: 'rgba(8,145,178,0.10)',
    tags: ['AGV联动', '自动配送', '无人化'],
  },
  {
    nameKey: 'solutions.items.laboratory',
    descKey: 'solutions.items.laboratory.desc',
    icon: BeakerIcon,
    colorFrom: '#059669', colorTo: '#34d399', bgGlow: 'rgba(5,150,105,0.10)',
    tags: ['权限分级', '全程追溯', '样品管理'],
  },
  {
    nameKey: 'solutions.items.cleanroom',
    descKey: 'solutions.items.cleanroom.desc',
    icon: CloudIcon,
    colorFrom: '#0284c7', colorTo: '#38bdf8', bgGlow: 'rgba(2,132,199,0.10)',
    tags: ['ISO洁净', '防静电', '无尘设计'],
  },
  {
    nameKey: 'solutions.items.other',
    descKey: 'solutions.items.other.desc',
    icon: WrenchIcon,
    colorFrom: '#475569', colorTo: '#94a3b8', bgGlow: 'rgba(71,85,105,0.08)',
    tags: ['文件安全', '危化品管控', '全品类'],
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function SolutionsPreview() {
  const { locale, t } = useLocale();

  return (
    <section className="relative py-24 px-6 overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 40%, #eff6ff 80%, #f8fafc 100%)' }}>
      {/* Background decorations - more vibrant */}
      <div className="absolute top-[5%] left-[50%] -translate-x-1/2 w-[900px] h-[450px] rounded-full blur-[160px]" style={{ backgroundColor: 'rgba(99, 102, 241, 0.07)' }} />
      <div className="absolute bottom-[10%] left-[-5%] w-[450px] h-[450px] rounded-full blur-[140px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.09)' }} />
      <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[130px]" style={{ backgroundColor: 'rgba(168, 85, 247, 0.06)' }} />

      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`,
        backgroundSize: '28px 28px',
      }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.12) 100%)',
                color: '#7c3aed',
                border: '1px solid rgba(124,58,237,0.25)',
                boxShadow: '0 0 20px rgba(124,58,237,0.08)',
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#7c3aed', boxShadow: '0 0 8px rgba(124,58,237,0.5)' }} />
              {t('home.solutions.badge') || 'Solutions'}
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: '#0f172a' }}
          >
            {t('home.solutions.title') || 'Industry Solutions'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-5"
            style={{ color: '#64748b' }}
          >
            {t('home.solutions.subtitle') || 'Tailored smart storage solutions'}
          </motion.p>
          {/* Gradient underline */}
          <div className="w-20 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #3b82f6, #06b6d4)' }} />
        </div>

        {/* Solutions Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {solutions.map((solution, index) => (
            <motion.a
              key={index}
              href={`/${locale}/products?type=${solution.nameKey.split('.').pop()}`}
              variants={fadeInUp}
              className="group relative rounded-2xl p-6 overflow-hidden"
              style={{
                background: `linear-gradient(165deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)`,
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                boxShadow: '0 4px 20px rgba(148, 163, 184, 0.06), 0 1px 3px rgba(0,0,0,0.02)',
              }}
              whileHover={{
                y: -8,
                boxShadow: `0 24px 56px ${solution.colorFrom}15, 0 8px 20px rgba(148,163,184,0.05)`,
                transition: { duration: 0.35 }
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Colored top bar on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl"
                style={{
                  background: `linear-gradient(90deg, ${solution.colorFrom}, ${solution.colorTo})`,
                }}
              />

              {/* Background glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${solution.bgGlow} 0%, transparent 65%)`,
                }}
              />

              {/* Icon Container */}
              <div
                className="relative w-[54px] h-[54px] mb-5 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${solution.colorFrom} 0%, ${solution.colorTo} 100%)`,
                  boxShadow: `0 6px 20px ${solution.colorFrom}30`,
                }}
              >
                {/* Hover glow ring */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    boxShadow: `0 0 0 3px ${solution.colorFrom}20, 0 0 24px ${solution.colorFrom}15`,
                  }}
                />
                <solution.icon className="w-6 h-6 text-white relative z-10" />
              </div>

              {/* Title */}
              <h3 className="text-base font-bold mb-2.5 transition-colors duration-300" style={{ color: '#1e293b' }}>
                {t(solution.nameKey) || solution.nameKey.split('.').pop()}
              </h3>

              {/* REAL Description Text (was skeleton bars before!) */}
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748b', lineHeight: '1.65' }}>
                {t(solution.descKey)}
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {solution.tags.map((tag, ti) => (
                  <span
                    key={ti}
                    className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md transition-all duration-300"
                    style={{
                      background: `${solution.colorFrom}10`,
                      color: solution.colorFrom,
                      border: `1px solid ${solution.colorFrom}18`,
                    }}
                  >
                    <CheckCircleIcon className="w-3 h-3 mr-1 opacity-60" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* "Learn More" link that appears on hover */}
              <div className="flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300"
                style={{ color: solution.colorFrom }}
              >
                {locale === 'zh' ? '查看详情' : 'View Details'}
                <ArrowRightIcon className="ml-1.5 w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
