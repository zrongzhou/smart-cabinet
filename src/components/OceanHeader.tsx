'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v4 — 深邃海洋氛围
// 设计方向：深蓝海洋 + 灵动气泡 + 微光粒子 + 无黑边
// ============================================================

const OCEAN_GRADIENT = `linear-gradient(180deg,
  #0a1628 0%,
  #0c2340 12%,
  #0d3b66 25%,
  #0e5a8f 40%,
  #0f7acb 55%,
  #1699eb 70%,
  #3db5f0 82%,
  #7cccf6 92%,
  #b8e2fb 98%,
  #dcf0fa 100%)`;

// ============================================================
// LAYER 1: 深海光晕 — 营造深度
// ============================================================
function DeepSeaGlow() {
  const orbs = useMemo(() => [
    { x: '15%', y: '20%', w: 400, h: 300, color: 'rgba(14,90,175,0.18)', blur: 100 },
    { x: '75%', y: '35%', w: 350, h: 250, color: 'rgba(88,135,200,0.13)', blur: 85 },
    { x: '45%', y: '60%', w: 450, h: 280, color: 'rgba(22,154,235,0.10)', blur: 110 },
    { x: '85%', y: '70%', w: 300, h: 200, color: 'rgba(61,181,240,0.08)', blur: 75 },
    { x: '5%', y: '65%', w: 320, h: 220, color: 'rgba(124,204,246,0.07)', blur: 80 },
  ], []);

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {orbs.map((o, i) => (
        <div key={i} className="absolute rounded-full"
             style={{
               left: o.x, top: o.y, width: o.w, height: o.h,
               background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
               filter: `blur(${o.blur}px)`,
             }}
        />
      ))}
    </div>
  );
}

// ============================================================
// LAYER 2: 光柱（subtle）— 从水面透下的光线
// ============================================================
function LightShafts() {
  const [shafts, setShafts] = useState<Array<{
    id: number; left: string; width: number; opacity: number; duration: number; delay: number;
  }>>([]);

  useEffect(() => {
    setShafts(Array.from({ length: 4 }, (_, i) => ({
      id: i,
      left: `${10 + i * 22 + Math.random() * 8}%`,
      width: 50 + Math.random() * 80,
      opacity: 0.03 + Math.random() * 0.04,
      duration: 6 + Math.random() * 5,
      delay: Math.random() * 4,
    })));
  }, []);

  if (shafts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true"
         style={{ mixBlendMode: 'screen' }}>
      {shafts.map(s => (
        <div key={s.id} className="absolute top-0"
             style={{
               left: s.left, width: s.width, height: '65%',
               background: `linear-gradient(180deg, rgba(255,255,255,${s.opacity * 1.5}) 0%, rgba(255,255,255,${s.opacity * 0.3}) 50%, transparent 100%)`,
               transform: `skewX(${-5 + s.id * 3}deg)`,
               filter: 'blur(16px)',
               animation: `shaft-pulse ${s.duration}s ease-in-out infinite alternate`,
               animationDelay: `${s.delay}s`,
             }}
        />
      ))}
    </div>
  );
}

// ============================================================
// LAYER 3: 灵动气泡 — 每个大小/速度/路径完全随机
// ============================================================
interface BubbleData {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  swayAmplitude: number;   // 左右摇摆幅度
  swaySpeed: number;       // 摇摆频率
  wobble: number;          // 大小脉动
}

function AnimatedBubbles() {
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);

  useEffect(() => {
    // 18 个气泡 — 每个参数高度随机化，确保"灵动感"
    const bbs: BubbleData[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 2 + Math.random() * 96,           // 分布全宽
      size: 3 + Math.random() * 14,         // 3-17px — 大小差异巨大
      duration: 5 + Math.random() * 12,     // 5-17s — 快慢不一
      delay: Math.random() * 10,            // 错开起始时间
      opacity: 0.08 + Math.random() * 0.22, // 透明度也随机
      swayAmplitude: 8 + Math.random() * 25, // 摆动幅度差异大
      swaySpeed: 2 + Math.random() * 4,     // 摆动速度不同
      wobble: 0.85 + Math.random() * 0.30,  // 大小微微变化
    }));
    setBubbles(bbs);
  }, []);

  if (bubbles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {bubbles.map(b => (
        <div key={b.id}
          className="absolute rounded-full"
          style={{
            left: `${b.x}%`,
            bottom: '-20px',
            width: b.size,
            height: b.size,
            // 每个气泡外观也不同
            background: `radial-gradient(circle at ${30 + b.id * 5}% ${30 + b.id * 3}%, rgba(255,255,255,${b.opacity + 0.15}), rgba(140,200,255,${b.opacity * 0.7}), transparent 75%)`,
            border: `${b.size > 8 ? 0.6 : 0.3}px solid rgba(255,255,255,${b.opacity * 0.4})`,
            boxShadow: `0 0 ${b.size * 0.8}px rgba(255,255,255,${b.opacity * 0.2}), inset 0 0 ${b.size * 0.3}px rgba(255,255,255,${b.opacity * 0.15})`,
            // 动画 — 上升 + 横向摇摆 + 大小微变 三重叠加
            animation: `
              bubble-up ${b.duration}s ease-in infinite,
              bubble-sway-${b.id % 5} ${b.swaySpeed}s ease-in-out infinite alternate,
              bubble-wobble ${2 + b.duration * 0.15}s ease-in-out infinite alternate
            `,
            animationDelay: `${b.delay}s, ${b.delay * 0.7}s, ${b.delay * 1.3}s`,
            '--sway-px': `${b.swayAmplitude}px`,
            '--wobble-scale': b.wobble,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ============================================================
// LAYER 4: 海火花 — 小而亮的闪烁点
// ============================================================
interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  pulseDuration: number;
  delay: number;
}

function SeaSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    setSparkles(Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 95,
      size: 1 + Math.random() * 2.5,
      brightness: 0.3 + Math.random() * 0.7,
      pulseDuration: 2 + Math.random() * 5,
      delay: Math.random() * 6,
    })));
  }, []);

  if (sparkles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {sparkles.map(s => (
        <div key={s.id} className="absolute rounded-full"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            background: `radial-gradient(circle, rgba(220,240,255,${s.brightness}) 0%, rgba(180,220,255,${s.brightness * 0.4}) 50%, transparent 100%)`,
            boxShadow: `0 0 ${s.size * 2.5}px rgba(200,230,255,${s.brightness * 0.3})`,
            animation: `sparkle-pulse ${s.pulseDuration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// LAYER 5: 底部淡出 — 无黑边，平滑过渡到白色内容区
// ============================================================
function BottomFade() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[60px] pointer-events-none"
         aria-hidden="true"
         style={{
           background: 'linear-gradient(180deg, transparent 0%, rgba(186,230,253,0.15) 40%, rgba(220,245,254,0.45) 75%, rgba(245,250,254,0.85) 100%)',
         }}
    />
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function OceanHeader({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section
      className="relative text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: OCEAN_GRADIENT,
      }}
    >
      {/* Layer 1: Deep sea ambient glow */}
      <DeepSeaGlow />

      {/* Layer 2: Light shafts from surface */}
      <LightShafts />

      {/* Layer 3: Animated bubbles */}
      <AnimatedBubbles />

      {/* Layer 4: Sparkle particles */}
      <SeaSparkles />

      {/* Layer 5: Bottom fade — no dark line! */}
      <BottomFade />

      {/* === CONTENT === */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 24px rgba(255,255,255,0.15)',
            }}
          >
            {icon}
          </motion.div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl font-bold mb-4 text-white"
          style={{
            textShadow: '0 2px 12px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.5)',
          }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-xl text-white/90"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.25)' }}
          >
            {subtitle}
          </motion.p>
        )}
        {children}
      </div>

      {/* ===== ANIMATIONS ===== */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          section * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }

        /* Light shaft pulse */
        @keyframes shaft-pulse {
          0%   { opacity: 0.6; transform: skewX(var(--skew, -5deg)) translateX(-3px); }
          100% { opacity: 1; transform: skewX(var(--skew, -3deg)) translateX(4px); }
        }

        /* Bubble rise */
        @keyframes bubble-up {
          0%   {
            transform: translateY(0) scale(var(--wobble-scale, 1));
            opacity: 0;
          }
          8%   { opacity: 1; }
          80%  { opacity: calc(var(--base-opacity, 0.5) + 0.05); }
          100% {
            transform: translateY(calc(-1 * var(--container-h, 350px))) scale(calc(var(--wobble-scale, 1) * 0.9));
            opacity: 0;
          }
        }

        /* 5 different sway patterns so bubbles don't move in sync */
        @keyframes bubble-sway-0 { 0% { margin-left: 0; } 100% { margin-left: var(--sway-px, 15px); } }
        @keyframes bubble-sway-1 { 0% { margin-left: 0; } 100% { margin-left: calc(var(--sway-px, 18px) * -1); } }
        @keyframes bubble-sway-2 { 0% { margin-left: calc(var(--sway-px, 12px) * -0.5); } 100% { margin-left: var(--sway-px, 20px); } }
        @keyframes bubble-sway-3 { 0% { margin-left: var(--sway-px, 10px); } 100% { margin-left: calc(var(--sway-px, 15px) * -0.7); } }
        @keyframes bubble-sway-4 { 0% { margin-left: calc(var(--sway-px, 22px) * -0.3); } 100% { margin-left: calc(var(--sway-px, 14px) * 0.6); } }

        /* Bubble size wobble */
        @keyframes bubble-wobble {
          0%   { transform: scale(var(--wobble-scale, 1)); }
          100% { transform: scale(calc(var(--wobble-scale, 1) * 1.08)); }
        }

        /* Sparkle twinkle */
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.15; transform: scale(0.7); }
          50%      { opacity: 1; transform: scale(1.25); }
        }
      `}</style>
    </section>
  );
}
