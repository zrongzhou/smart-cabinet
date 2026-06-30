'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v171 — 商务专业蓝 · 高对比度精致版
//
// 核心改进：
//   1. 颜色饱和度大幅提升 — 不再是灰蒙蒙的蓝
//   2. 动态渐变背景 — 颜色会缓慢流动变化
//   3. 粒子足够大、够亮、带拖尾 — 肉眼清晰可见
//   4. 光斑明显可见 — 营造高级光效氛围
//   5. 网格线适度可见 — 增加科技质感
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

      {/* Layer 1: 可见度适中的网格 */}
      <TechGrid />

      {/* Layer 2: 大型光斑 — 明显可见但优雅 */}
      <GlowOrbs />

      {/* Layer 3: 发光粒子 — 够大够亮带光晕 */}
      <GlowParticles />

      {/* Layer 4: 几何装饰线条 */}
      <GeoLines />

      {/* Layer 5: 底部过渡到白色内容区 */}
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
        {/* 图标 — 毛玻璃容器 */}
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
// Layer 0: 动态渐变 — 背景色缓慢流动变化
// 用 CSS animation 让 background-position 移动
// ============================================================
function AnimatedGradient() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
      style={{
        background: `
          radial-gradient(ellipse 130% 90% at 30% -5%, #3b82f6 0%, transparent 50%),
          radial-gradient(ellipse 80% 55% at 80% 15%, #8b5cf6 0%, transparent 45%),
          radial-gradient(ellipse 100% 65% at 15% 75%, #06b6d4 0%, transparent 42%),
          linear-gradient(170deg,
            #071426 0%,
            #0c2343 16%,
            #143a6e 32%,
            #1d4ed8 50%,
            #2563eb 64%,
            #3b82f6 78%,
            #60a5fa 88%,
            #93c5fd 95%,
            #dbeafe 100%
          )
        `,
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 20s ease infinite alternate',
      }} />
  );
}

// ============================================================
// Layer 1: 科技网格 — 点阵 + 淡斜线
// 比 v169 更明显但仍不抢焦点
// ============================================================
function TechGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.38]"
         aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots171" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.3" fill="rgba(148,197,253,0.35)" />
        </pattern>
        <pattern id="lines171" x="0" y="0" width="96" height="96" patternUnits="userSpaceOnUse">
          <path d="M96 0L0 96M0 0L96 96" stroke="rgba(148,163,184,0.08)" strokeWidth="0.6" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots171)" />
      <rect width="100%" height="100%" fill="url(#lines171)" />
    </svg>
  );
}

// ============================================================
// Layer 2: 光斑 — 大型模糊色块，opacity 足够高能看见
// ============================================================
function GlowOrbs() {
  const orbs = [
    { x: '75%', y: '5%', s: 360, c: 'rgba(139,92,246,0.28)', b: 100 },
    { x: '10%', y: '40%', s: 300, c: 'rgba(59,130,246,0.22)', b: 85 },
    { x: '60%', y: '72%', s: 260, c: 'rgba(6,182,212,0.18)', b: 70 },
    { x: '30%', y: '12%', s: 200, c: 'rgba(99,102,241,0.15)', b: 60 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: 'absolute', left: o.x, top: o.y,
          width: o.s, height: o.s, borderRadius: '50%',
          background: `radial-gradient(circle, ${o.c}, transparent 72%)`,
          filter: `blur(${o.b}px)`,
          animation: `orb-float ${20 + i * 6}s ease-in-out infinite alternate`,
          animationDelay: `${i * 2.5}s`,
        }} />
      ))}
    </div>
  );
}

// ============================================================
// Layer 3: 发光粒子 — 够大、够亮、有拖尾效果
// ============================================================
function GlowParticles() {
  const [pts, setPts] = useState<Array<{
    id: number; x: number; y: number; size: number; dur: number; del: number; op: number; hue: number;
  }>>([]);

  useEffect(() => {
    setPts(Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 2 + Math.random() * 96,
      y: 4 + Math.random() * 92,
      size: 3 + Math.random() * 5,       // 3~8px — 明显可见
      dur: 11 + Math.random() * 14,
      del: Math.random() * 13,
      op: 0.35 + Math.random() * 0.45,  // 0.35~0.8 — 够亮
      hue: 200 + Math.random() * 40,     // 蓝-靛色范围
    })));
  }, []);

  if (!pts.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {pts.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          bottom: `${p.y}%`,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          backgroundColor: `hsla(${p.hue}, 85%, 72%, ${p.op})`,
          boxShadow: `
            0 0 ${p.size * 2}px hsla(${p.hue}, 90%, 65%, ${p.op * 0.6}),
            0 0 ${p.size * 4.5}px hsla(${p.hue}, 85%, 60%, ${p.op * 0.25})
          `,
          animation: `particle-up ${p.dur}s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
          animationDelay: `${p.del}s`,
        }} />
      ))}
    </div>
  );
}

// ============================================================
// Layer 4: 几何装饰线 — 更明显的科技线条
// ============================================================
function GeoLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="gl1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="rgba(147,197,253,0.35)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <linearGradient id="gl2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="rgba(196,181,253,0.25)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* 右上角放射线 */}
      <g>
        <line x1="80%" y1="-3%" x2="100%" y2="22%" stroke="url(#gl1)" strokeWidth="1.2" />
        <line x1="87%" y1="-3%" x2="100%" y2="32%" stroke="url(#gl1)" strokeWidth="0.9" opacity="0.7" />
        <line x1="94%" y1="-3%" x2="100%" y2="42%" stroke="url(#gl1)" strokeWidth="0.6" opacity="0.4" />
      </g>

      {/* 左下角弧线 */}
      <path d="M -3% 108% A 120 120 0 0 1 18% 98%"
            fill="none" stroke="url(#gl2)" strokeWidth="1" opacity="0.6" />
      <path d="M -6% 115% A 160 160 0 0 1 22% 95%"
            fill="none" stroke="url(#gl2)" strokeWidth="0.7" opacity="0.35" />

      {/* 右侧竖线 + 圆点装饰 */}
      <line x1="97%" y1="28%" x2="97%" y2="62%" stroke="rgba(148,197,253,0.18)" strokeWidth="0.8" />
      <circle cx="97%" cy="62%" r="2.5" fill="rgba(147,197,253,0.3)" />
      <circle cx="97%" cy="28%" r="1.8" fill="rgba(147,197,253,0.2)" />
    </svg>
  );
}

// ============================================================
// Keyframes
// ============================================================
const keyframes = `
  @keyframes gradient-shift {
    0% { background-position: 0% 30%; }
    50% { background-position: 100% 70%; }
    100% { background-position: 0% 30%; }
  }

  @keyframes orb-float {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-30px, 22px) scale(1.05); }
    66% { transform: translate(18px, -14px) scale(0.97); }
    100% { transform: translate(-12px, 28px) scale(1.03); }
  }

  @keyframes particle-up {
    0% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: var(--op-start, 0.6);
    }
    25% {
      transform: translate3d(18px, -28vh, 0) scale(1.15);
      opacity: calc(var(--op-start, 0.6) * 1.2);
    }
    55% {
      transform: translate3d(-12px, -58vh, 0) scale(0.92);
      opacity: var(--op-start, 0.6);
    }
    85% {
      transform: translate3d(8px, -82vh, 0) scale(0.8);
      opacity: calc(var(--op-start, 0.6) * 0.35);
    }
    100% {
      transform: translate3d(-6px, -100vh, 0) scale(0.65);
      opacity: 0;
    }
  }
`;
