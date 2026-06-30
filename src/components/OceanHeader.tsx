'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v170 — 商务专业蓝 · 高级感重制版
//
// 设计理念：
//   多层径向渐变叠加 → 空间深度感
//   动态光斑流动 → 页面有生命力
//   几何线条装饰 → 制造业科技调性
//   所有动画肉眼可见但克制优雅
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
      style={{ minHeight: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* ===== 背景层：多层渐变叠加 ===== */}
      <BackgroundLayers />

      {/* ===== 动态光斑：缓慢漂移的大型模糊色块 ===== */}
      <OrbLights />

      {/* ===== 几何装饰线条：右上角和左下角 ===== */}
      <GeoAccents />

      {/* ===== 漂浮粒子：小圆点缓缓上升 ===== */}
      <Particles />

      {/* ===== 底部过渡 ===== */}
      <div className="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(248,250,252,0.98) 0%, rgba(248,250,252,0.4) 60%, transparent 100%)' }}
        aria-hidden="true" />

      {/* ===== 内容区 ===== */}
      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* 图标 */}
        {icon && (
          <motion.div
            className="flex justify-center mb-5"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="w-[56px] h-[56px] rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              {icon}
            </div>
          </motion.div>
        )}

        {/* 子元素（面包屑等）*/}
        {children}

        {/* 标题 */}
        {title && (
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-tight mb-5"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.12)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {title}
          </motion.h1>
        )}

        {/* 副标题 */}
        {(description || subtitle) && (
          <motion.p
            className="text-base sm:text-lg text-white/80 max-w-xl mx-auto leading-relaxed"
            style={{ textShadow: '0 1px 10px rgba(0,0,0,0.08)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {description || subtitle}
          </motion.p>
        )}
      </motion.div>

      {/* 动画定义 */}
      <style>{styles}</style>
    </section>
  );
}

// ============================================================
// 背景层 — 多层渐变叠加产生深度
// ============================================================
function BackgroundLayers() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* 主背景：深蓝到亮蓝的复杂渐变 */}
      <div className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% -10%, #3b82f6 0%, transparent 55%),
            radial-gradient(ellipse 90% 60% at 85% 20%, #6366f1 0%, transparent 45%),
            radial-gradient(ellipse 100% 70% at 10% 80%, #0ea5e9 0%, transparent 40%),
            linear-gradient(175deg, #0f172a 0%, #1e3a5a 25%, #1d4ed8 50%, #2563eb 68%, #3b82f6 82%, #7dd3fc 92%, #e0f2fe 100%)
          `,
        }}
      />

      {/* 半透明深色遮罩增加对比度（顶部） */}
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(15,23,42,0.25) 100%)',
        }}
      />
    </div>
  );
}

// ============================================================
// 光斑 — 大型模糊色块，缓慢移动
// 这是让页面"活"起来的关键元素
// ============================================================
function OrbLights() {
  const [orbs] = useState(() => [
    // 右上角主光斑 — 最醒目
    { id: 0, x: '72%', y: '8%', size: 320, color: 'rgba(99,102,241,0.20)', blur: 90 },
    // 左侧中部光斑
    { id: 1, x: '12%', y: '45%', size: 260, color: 'rgba(59,130,246,0.14)', blur: 75 },
    // 底部偏右光斑 — 温暖色调
    { id: 2, x: '62%', y: '78%', size: 220, color: 'rgba(14,165,233,0.12)', blur: 65 },
    // 中上偏左 — 青色点缀
    { id: 3, x: '35%', y: '18%', size: 180, color: 'rgba(6,182,212,0.10)', blur: 55 },
  ]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {orbs.map(o => (
        <div key={o.id} style={{
          position: 'absolute',
          left: o.x,
          top: o.y,
          width: o.size,
          height: o.size,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
          filter: `blur(${o.blur}px)`,
          animation: `orb-drift ${18 + o.id * 5}s ease-in-out infinite alternate`,
          animationDelay: `${o.id * 2}s`,
        }} />
      ))}
    </div>
  );
}

// ============================================================
// 几何装饰 — 细线和圆环，营造精密制造感
// 非常淡，不抢焦点，但能提升质感
// ============================================================
function GeoAccents() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true"
         xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.35 }}>
      <defs>
        <linearGradient id="geo-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(148,163,184,0)" />
          <stop offset="50%" stopColor="rgba(148,163,184,0.25)" />
          <stop offset="100%" stopColor="rgba(148,163,184,0)" />
        </linearGradient>
        <linearGradient id="geo-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(147,197,253,0)" />
          <stop offset="50%" stopColor="rgba(147,197,253,0.2)" />
          <stop offset="100%" stopColor="rgba(147,197,253,0)" />
        </linearGradient>
      </defs>

      {/* 右上角斜线组 */}
      <g style={{ transformOrigin: 'top right' }}>
        <line x1="82%" y1="-2%" x2="100%" y2="18%"
              stroke="url(#geo-line-grad)" strokeWidth="1" opacity="0.6" />
        <line x1="88%" y1="-2%" x2="100%" y2="26%"
              stroke="url(#geo-line-grad)" strokeWidth="0.8" opacity="0.4" />
        <line x1="94%" y1="-2%" x2="100%" y2="36%"
              stroke="url(#geo-line-grad)" strokeWidth="0.6" opacity="0.25" />
      </g>

      {/* 左下角圆弧装饰 */}
      <circle cx="5%" cy="105%" r="80" fill="none" stroke="url(#geo-ring-grad)"
              strokeWidth="1" opacity="0.5" strokeDasharray="4 8" />
      <circle cx="5%" cy="105%" r="110" fill="none" stroke="url(#geo-ring-grad)"
              strokeWidth="0.7" opacity="0.3" strokeDasharray="2 12" />

      {/* 右侧竖向细线 */}
      <line x1="97%" y1="30%" x2="97%" y2="58%"
            stroke="rgba(148,163,184,0.12)" strokeWidth="0.8" />
      <line x1="95%" y1="38%" x2="95%" y2="52%"
            stroke="rgba(148,163,184,0.08)" strokeWidth="0.6" />
    </svg>
  );
}

// ============================================================
// 漂浮粒子 — 小而亮的点，缓缓上升+横向飘移
// 数量适中，不会显得乱
// ============================================================
function Particles() {
  const [particles, setParticles] = useState<Array<{
    id: number; x: number; y: number; size: number; dur: number; del: number; op: number;
  }>>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 3 + Math.random() * 94,
      y: 5 + Math.random() * 90,
      size: 1.5 + Math.random() * 3,
      dur: 12 + Math.random() * 16,
      del: Math.random() * 12,
      op: 0.2 + Math.random() * 0.5,
    })));
  }, []);

  if (!particles.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          bottom: `${p.y}%`,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          backgroundColor: '#93c5fd',
          boxShadow: `0 0 ${p.size * 2.5}px rgba(147,197,253,0.5)`,
          animation: `particle-rise ${p.dur}s ease-in-out infinite`,
          animationDelay: `${p.del}s`,
          opacity: p.op,
        }} />
      ))}
    </div>
  );
}

// ============================================================
// CSS Keyframes
// ============================================================
const styles = `
  /* 光斑缓慢漂移 */
  @keyframes orb-drift {
    0% { transform: translate(0, 0); }
    33% { transform: translate(-25px, 18px); }
    66% { transform: translate(15px, -10px); }
    100% { transform: translate(-10px, 25px); }
  }

  /* 粒子上升 + 横向飘 */
  @keyframes particle-rise {
    0% { transform: translate(0, 0) scale(1); opacity: var(--start-op, 0.4); }
    25% { transform: translate(15px, -30vh) scale(1.1); opacity: calc(var(--start-op, 0.4) * 1.3); }
    50% { transform: translate(-10px, -55vh) scale(0.95); opacity: var(--start-op, 0.4); }
    75% { transform: translate(8px, -75vh) scale(0.9); opacity: calc(var(--start-op, 0.4) * 0.5); }
    100% { transform: translate(-5px, -95vh) scale(0.7); opacity: 0; }
  }

  /* 圆环虚线旋转动画（给 SVG 用） */
  @keyframes ring-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
