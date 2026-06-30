'use client';

import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v183 — 简洁商务风 · 干净渐变 + 微光晕
//
// 设计原则：
//   ✅ 干净的蓝色渐变底色 — 不杂乱
//   ✅ 几个超大模糊光斑 — 营造层次感但不抢眼
//   ✅ 极光飘带简化为2条主光带 — 流动感但不花哨
//   ❌ 删除：点阵网格(小白点元凶) / 漂浮粒子 / 所有噪点
// ============================================================

interface OceanHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  locale?: string;
}

export default function OceanHeader({ title, subtitle, description, icon, children }: OceanHeaderProps) {
  return (
    <section className="relative text-white py-[120px] px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Layer 0: 动态流动渐变背景 */}
      <AnimatedGradient />

      {/* Layer 1: 大型柔和光斑 — 仅氛围，不抢焦点 */}
      <SoftOrbs />

      {/* Layer 2: 极光光带 — 简化为2条主带，优雅流动 */}
      <AuroraFlow />

      {/* Layer 3: 底部过渡到白色内容区 */}
      <div className="absolute bottom-0 left-0 right-0 h-[110px] pointer-events-none z-[2]"
        style={{
          background: 'linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0.5) 55%, transparent 100%)',
        }}
        aria-hidden="true" />

      {/* 内容区 */}
      <motion.div className="relative z-10 text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {icon && (
          <motion.div className="flex justify-center mb-5"
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="w-[58px] h-[58px] rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.28)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.22)',
              }}
            >{icon}</div>
          </motion.div>
        )}

        {children}

        {title && (
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight leading-tight mb-5"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.15)' }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >{title}</motion.h1>
        )}

        {(description || subtitle) && (
          <motion.p
            className="text-base sm:text-lg text-white/88 max-w-xl mx-auto leading-relaxed"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.1)' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >{description || subtitle}</motion.p>
        )}
      </motion.div>

      <style>{keyframes}</style>
    </section>
  );
}

// ============================================================
// Layer 0: 动态渐变 — 深邃蓝紫渐变，缓慢呼吸
// ============================================================
function AnimatedGradient() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
      style={{
        background: `
          radial-gradient(ellipse 120% 80% at 25% -10%, #3b82f6 0%, transparent 50%),
          radial-gradient(ellipse 90% 60% at 75% 20%, #8b5cf6 0%, transparent 45%),
          radial-gradient(ellipse 80% 50% at 20% 80%, #06b6d4 0%, transparent 40%),
          linear-gradient(165deg,
            #071426 0%,
            #0c2343 15%,
            #143a6e 30%,
            #1d4ed8 48%,
            #2563eb 62%,
            #3b82f6 76%,
            #60a5fa 88%,
            #93c5fd 96%,
            #dbeafe 100%
          )
        `,
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 24s ease infinite alternate',
      }} />
  );
}

// ============================================================
// Layer 1: 柔和光斑 — 3个大而淡的光晕，仅提供深度感
// ============================================================
function SoftOrbs() {
  const orbs = [
    { x: '70%', y: '10%', s: 420, c: 'rgba(139,92,246,0.18)', b: 110 },
    { x: '15%', y: '50%', s: 350, c: 'rgba(59,130,246,0.14)', b: 90 },
    { x: '55%', y: '75%', s: 280, c: 'rgba(6,182,212,0.11)', b: 70 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: 'absolute', left: o.x, top: o.y,
          width: o.s, height: o.s, borderRadius: '50%',
          background: `radial-gradient(circle, ${o.c}, transparent 70%)`,
          filter: `blur(${o.b}px)`,
          animation: `orb-float ${22 + i * 7}s ease-in-out infinite alternate`,
          animationDelay: `${i * 3}s`,
        }} />
      ))}
    </div>
  );
}

// ============================================================
// Layer 2: 极光流光 — 2条简洁宽幅光带，缓缓漂移
// 不再是细碎的多个小飘带，而是大气的主光带
// ============================================================
function AuroraFlow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 主光带：横贯中上部，蓝→紫→青渐变 */}
      <div style={{
        position: 'absolute',
        left: '-4%', top: '20%',
        width: '108%', height: '100px',
        background: 'linear-gradient(95deg,
          transparent 0%,
          rgba(59,130,246,0.16) 10%,
          rgba(99,102,241,0.22) 30%,
          rgba(139,92,246,0.18) 50%,
          rgba(99,102,241,0.20) 70%,
          rgba(6,182,212,0.14) 90%,
          transparent 100%
        )',
        filter: 'blur(32px)',
        borderRadius: '50%',
        animation: 'aurora-flow-a 18s ease-in-out infinite alternate',
      }} />

      {/* 副光带：中下部，更窄更淡 */}
      <div style={{
        position: 'absolute',
        left: '-6%', top: '58%',
        width: '112%', height: '65px',
        background: 'linear-gradient(88deg,
          transparent 0%,
          rgba(6,182,212,0.12) 15%,
          rgba(56,189,248,0.17) 40%,
          rgba(59,130,246,0.14) 65%,
          transparent 100%
        )',
        filter: 'blur(26px)',
        borderRadius: '50%',
        animation: 'aurora-flow-b 22s ease-in-out infinite alternate-reverse',
        animationDelay: '3s',
      }} />
    </div>
  );
}

const keyframes = `
  /* 渐变缓慢移动 */
  @keyframes gradient-shift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 50% 50%; }
    100% { background-position: 100% 50%; }
  }

  /* 光斑极慢漂浮 */
  @keyframes orb-float {
    0%   { transform: translate(0, 0); }
    50%  { transform: translate(15px, -10px); }
    100% { transform: translate(-8px, 8px); }
  }

  /* 极光主光带漂移 */
  @keyframes aurora-flow-a {
    0%   { transform: translateX(0); opacity: 0.82; }
    40%  { transform: translateX(22px); opacity: 1; }
    100% { transform: translateX(-10px); opacity: 0.78; }
  }

  /* 极光副光带反向漂移 */
  @keyframes aurora-flow-b {
    0%   { transform: translateX(0); opacity: 0.72; }
    45%  { transform: translateX(-18px); opacity: 0.92; }
    100% { transform: translateX(12px); opacity: 0.68; }
  }
`;
