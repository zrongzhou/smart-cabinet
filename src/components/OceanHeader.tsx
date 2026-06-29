'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v5 — 认真验证版
// 修复：CSS 变量正确传递、transform 不冲突、无黑边、渐变深邃
// ============================================================

const OCEAN_GRADIENT = `linear-gradient(180deg,
  #081c2e 0%,
  #0a2845 10%,
  #0c3a62 22%,
  #0e4d80 36%,
  #1068a0 50%,
  #1488c0 63%,
  #1ca8e0 76%,
  #5cc4f0 87%,
  #9adcf8 95%,
  #d4eefc 100%)`;

// ============================================================
// LAYER 1: 深海光晕
// ============================================================
function DeepSeaGlow() {
  const orbs = useMemo(() => [
    { x: '12%', y: '18%', w: 500, h: 350, color: 'rgba(10,60,140,0.22)', blur: 120 },
    { x: '70%', y: '30%', w: 400, h: 280, color: 'rgba(20,100,200,0.16)', blur: 90 },
    { x: '40%', y: '58%', w: 550, h: 320, color: 'rgba(30,150,220,0.12)', blur: 130 },
    { x: '82%', y: '68%', w: 350, h: 220, color: 'rgba(80,180,240,0.09)', blur: 80 },
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
// LAYER 2: 灵动气泡 — 每个完全独立动画
// 核心修复：用 CSS 变量 + 单一 keyframes，避免 transform 冲突
// ============================================================
interface BubbleData {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function AnimatedBubbles() {
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);

  useEffect(() => {
    const bbs: BubbleData[] = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      x: 3 + Math.random() * 94,
      size: 4 + Math.random() * 15,
      duration: 6 + Math.random() * 11,
      delay: Math.random() * 12,
      opacity: 0.10 + Math.random() * 0.25,
    }));
    setBubbles(bbs);
  }, []);

  if (bubbles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {bubbles.map(b => {
        // 每个气泡用独立的 CSS 变量，动画 keyframes 读取这些变量
        const riseEnd = -(200 + b.id * 14 + Math.floor(b.duration * 7));
        const swayPx = (8 + Math.floor(Math.random() * 22)).toFixed(0);
        const wobbleScale = (0.88 + Math.random() * 0.24).toFixed(2);
        return (
          <div key={b.id}
            className="absolute rounded-full will-change-transform"
            style={{
              left: `${b.x}%`,
              bottom: '-22px',
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at ${28 + b.id * 6}% ${25 + b.id * 4}%, rgba(255,255,255,${Number((b.opacity + 0.18).toFixed(2))}), rgba(160,210,255,${Number((b.opacity * 0.65).toFixed(2))}), transparent 78%)`,
              border: `${Math.max(0.4, b.size * 0.06).toFixed(1)}px solid rgba(255,255,255,${Number((b.opacity * 0.45).toFixed(2))})`,
              boxShadow: `0 0 ${Math.floor(b.size * 0.7)}px rgba(200,225,255,${Number((b.opacity * 0.25).toFixed(2))}), inset 0 0 ${Math.floor(b.size * 0.35)}px rgba(255,255,255,${Number((b.opacity * 0.18).toFixed(2))})`,
              '--rise': `${riseEnd}px`,
              '--sway': `${swayPx}px`,
              '--end-sway': `${-Math.floor(Number(swayPx) * 0.35)}px`,
              '--wobble': wobbleScale,
              '--bubble-opacity': String(b.opacity),
              animation: `bubble-rise-${b.id % 4} ${b.duration}s ease-in ${b.delay}s infinite`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// LAYER 3: 海火花 — 闪烁粒子
// ============================================================
function SeaSparkles() {
  const [sparkles, setSparkles] = useState<Array<{
    id: number; x: number; y: number; size: number;
    brightness: number; pulseDuration: number; delay: number;
  }>>([]);

  useEffect(() => {
    setSparkles(Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 93,
      size: 1 + Math.random() * 2.8,
      brightness: 0.35 + Math.random() * 0.65,
      pulseDuration: 1.8 + Math.random() * 4.5,
      delay: Math.random() * 7,
    })));
  }, []);

  if (sparkles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {sparkles.map(s => (
        <div key={s.id} className="absolute rounded-full will-change-opacity"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            background: `radial-gradient(circle, rgba(210,235,255,${s.brightness}) 0%, rgba(170,210,255,${Number((s.brightness * 0.35).toFixed(2))}) 55%, transparent 100%)`,
            boxShadow: `0 0 ${Number((s.size * 2.8).toFixed(1))}px rgba(190,225,255,${Number((s.brightness * 0.35).toFixed(2))})`,
            animation: `sparkle-pulse ${s.pulseDuration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// LAYER 4: 底部淡出 — 从渐变末端色开始，杜绝黑边
// ============================================================
function BottomFade() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[70px] pointer-events-none"
         aria-hidden="true"
         style={{
           background: 'linear-gradient(180deg, rgba(212,238,252,0.0) 0%, rgba(212,238,252,0.12) 30%, rgba(228,244,254,0.38) 65%, rgba(245,250,255,0.92) 100%)',
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
  // 动态生成 4 组气泡动画 keyframes（避免每个气泡单独 keyframes 太多）
  const bubbleKeyframes = useMemo(() => {
    const patterns = [
      { startX: 0, midX: 0.6, endX: -0.3 },
      { startX: 0, midX: -0.5, endX: 0.4 },
      { startX: 0, midX: 0.35, endX: -0.45 },
      { startX: 0, midX: -0.7, endX: 0.2 },
    ];
    return patterns.map((p, i) => `
        @keyframes bubble-rise-${i} {
          0% {
            transform: translateY(0) translateX(0) scale(var(--wobble, 1));
            opacity: 0;
          }
          7% { opacity: 1; }
          50% {
            transform: translateY(calc(var(--rise, -240px) * 0.5))
                       translateX(calc(var(--sway, 14px) * ${p.midX}))
                       scale(calc(var(--wobble, 1) * 1.06));
            opacity: var(--bubble-opacity, 0.5);
          }
          100% {
            transform: translateY(var(--rise, -280px))
                       translateX(var(--end-sway, -5px))
                       scale(calc(var(--wobble, 1) * 0.89));
            opacity: 0;
          }
        }`).join('\n');
  }, []);

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

      {/* Layer 2: Animated bubbles */}
      <AnimatedBubbles />

      {/* Layer 3: Sparkle particles */}
      <SeaSparkles />

      {/* Layer 4: Bottom fade — no dark edge */}
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
          section * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }

        /* ===== BUBBLE keyframes (4 variants) ===== */
        ${bubbleKeyframes}

        /* ===== SPARKLE twinkle ===== */
        @keyframes sparkle-pulse {
          0%, 100% { opacity: 0.10; transform: scale(0.55); }
          50%      { opacity: 1;    transform: scale(1.35); }
        }
      `}</style>
    </section>
  );
}
