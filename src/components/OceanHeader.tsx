'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v3 — 抽象粒子海洋
// 设计理念：Apple/Awwwards 级克制高级感
// 无具象生物，只有氛围粒子 + 光效 + 波纹
// ============================================================

// ===== PREMIUM OCEAN GRADIENT — 深邃富丽的渐变 =====
const OCEAN_GRADIENT = `linear-gradient(180deg,
  #0c4a6e 0%,
  #075985 18%,
  #0369a1 35%,
  #0284c7 52%,
  #0ea5e9 70%,
  #38bdf8 85%,
  #7dd3fc 100%)`;

// ============================================================
// LAYER 1: 氛围光晕 — 大面积模糊光斑，营造深度感
// ============================================================
function AmbientGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* Top-left warm glow */}
      <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[350px] rounded-full"
           style={{
             background: 'radial-gradient(circle, rgba(56,189,248,0.20) 0%, transparent 70%)',
             filter: 'blur(80px)',
           }}
      />
      {/* Bottom-right purple accent */}
      <div className="absolute -bottom-[5%] -right-[5%] w-[450px] h-[300px] rounded-full"
           style={{
             background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
             filter: 'blur(70px)',
           }}
      />
      {/* Center teal glow */}
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[280px] rounded-full"
           style={{
             background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 65%)',
             filter: 'blur(90px)',
           }}
      />
    </div>
  );
}

// ============================================================
// LAYER 2: 浮动光点 — 小而精致的亮点粒子（不是鱼！）
// ============================================================
interface LightParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
}

function FloatingLights() {
  const [particles, setParticles] = useState<LightParticle[]>([]);

  useEffect(() => {
    // 30 个精致光点 — 小、淡、慢
    const pts: LightParticle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,       // 1-3.5px 很小
      opacity: 0.2 + Math.random() * 0.5,   // 0.2-0.7 不太亮
      duration: 4 + Math.random() * 8,       // 4-12s 很慢
      delay: Math.random() * 6,
      driftX: (Math.random() - 0.5) * 30,   // 轻微横向漂移
    }));
    setParticles(pts);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(255,255,255,${p.opacity}) 0%, rgba(255,255,255,${p.opacity * 0.3}) 60%, transparent 100%)`,
            boxShadow: `0 0 ${p.size * 3}px rgba(255,255,255,${p.opacity * 0.25})`,
            animation: `float-light ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            '--drift-x': `${p.driftX}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ============================================================
// LAYER 3: 上升气泡 — 极简圆形气泡
// ============================================================
interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function RisingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // 12 个小气泡 — 稀疏、精致
    const bbs: Bubble[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      size: 3 + Math.random() * 7,        // 3-10px
      duration: 6 + Math.random() * 8,     // 6-14s 慢速上升
      delay: Math.random() * 8,
      opacity: 0.08 + Math.random() * 0.15, // 很淡
    }));
    setBubbles(bbs);
  }, []);

  if (bubbles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {bubbles.map(b => (
        <div
          key={b.id}
          className="absolute rounded-full"
          style={{
            left: `${b.x}%`,
            bottom: '-12px',
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,${b.opacity + 0.15}), rgba(147,197,253,${b.opacity * 0.5}), transparent 80%)`,
            border: '0.5px solid rgba(255,255,255,0.1)',
            animation: `bubble-rise ${b.duration}s ease-in infinite`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// LAYER 4: 底部波纹 — 几何线条波浪（干净利落）
// ============================================================
function WaveLines() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[50px] pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Wave 1 — back layer, slow */}
      <svg className="absolute bottom-0 left-0 w-full h-[45px]" preserveAspectRatio="none" viewBox="0 0 1440 45">
        <path d="M0,22 C360,5 720,38 1080,18 C1260,8 1380,28 1440,22 L1440,45 L0,45 Z"
              fill="rgba(14,165,233,0.06)">
          <animate attributeName="d"
                   dur="10s"
                   repeatCount="indefinite"
                   values="M0,22 C360,5 720,38 1080,18 C1260,8 1380,28 1440,22 L1440,45 L0,45 Z;
                           M0,18 C360,32 720,8 1080,26 C1260,34 1380,12 1440,18 L1440,45 L0,45 Z;
                           M0,22 C360,5 720,38 1080,18 C1260,8 1380,28 1440,22 L1440,45 L0,45 Z" />
        </path>
      </svg>

      {/* Wave 2 — middle layer */}
      <svg className="absolute bottom-0 left-0 w-full h-[35px]" preserveAspectRatio="none" viewBox="0 0 1440 35">
        <path d="M0,16 C240,28 480,6 720,20 C960,33 1200,10 1440,16 L1440,35 L0,35 Z"
              fill="rgba(56,189,248,0.08)">
          <animate attributeName="d"
                   dur="7s"
                   repeatCount="indefinite"
                   values="M0,16 C240,28 480,6 720,20 C960,33 1200,10 1440,16 L1440,35 L0,35 Z;
                           M0,10 C240,4 480,26 720,12 C960,6 1200,24 1440,10 L1440,35 L0,35 Z;
                           M0,16 C240,28 480,6 720,20 C960,33 1200,10 1440,16 L1440,35 L0,35 Z" />
        </path>
      </svg>

      {/* Wave 3 — front layer, faster, lighter */}
      <svg className="absolute bottom-0 left-0 w-full h-[25px]" preserveAspectRatio="none" viewBox="0 0 1440 25">
        <path d="M0,12 C180,20 360,4 540,14 C720,23 900,8 1080,15 C1260,21 1350,10 1440,12 L1440,25 L0,25 Z"
              fill="rgba(125,211,252,0.10)">
          <animate attributeName="d"
                   dur="5s"
                   repeatCount="indefinite"
                   values="M0,12 C180,20 360,4 540,14 C720,23 900,8 1080,15 C1260,21 1350,10 1440,12 L1440,25 L0,25 Z;
                           M0,8 C180,2 360,16 540,8 C720,2 900,16 1080,8 C1260,4 1350,14 1440,8 L1440,25 L0,25 Z;
                           M0,12 C180,20 360,4 540,14 C720,23 900,8 1080,15 C1260,21 1350,10 1440,12 L1440,25 L0,25 Z" />
        </path>
      </svg>
    </div>
  );
}

// ============================================================
// LAYER 5: 表面光线折射 — 微妙的光线效果
// ============================================================
function SurfaceLightRefraction() {
  return (
    <div className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none overflow-hidden opacity-[0.07]"
         aria-hidden="true"
         style={{ mixBlendMode: 'screen' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="absolute top-0"
          style={{
            left: `${i * 18 + Math.random() * 10}%`,
            width: `${80 + Math.random() * 60}px`,
            height: '100%',
            background: `linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.05) 60%, transparent 100%)`,
            transform: `skewX(${-8 + i * 4}deg)`,
            filter: 'blur(12px)',
            animation: `refraction-sway ${4 + i * 1.5}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
    </div>
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
      {/* Layer 1: Ambient glow */}
      <AmbientGlow />

      {/* Layer 2: Surface light refraction (top) */}
      <SurfaceLightRefraction />

      {/* Layer 3: Floating light particles (ambient) */}
      <FloatingLights />

      {/* Layer 4: Rising bubbles */}
      <RisingBubbles />

      {/* Layer 5: Wave lines (bottom) */}
      <WaveLines />

      {/* === CONTENT (top layer, always readable) === */}
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

        /* Floating light particles */
        @keyframes float-light {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: var(--base-opacity, 0.5);
          }
          25% {
            transform: translate(var(--drift-x, 5px), -12px) scale(1.15);
            opacity: calc(var(--base-opacity, 0.5) * 1.3);
          }
          50% {
            transform: translate(calc(var(--drift-x, 5px) * -0.5), -20px) scale(0.95);
            opacity: calc(var(--base-opacity, 0.5) * 0.7);
          }
          75% {
            transform: translate(calc(var(--drift-x, 5px) * 0.3), -8px) scale(1.1);
            opacity: calc(var(--base-opacity, 0.5) * 1.1);
          }
        }

        /* Rising bubble */
        @keyframes bubble-rise {
          0% {
            transform: translateY(0) translateX(0) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-380px) translateX(calc((var(--bubble-drift, 10px) * 1))) scale(1);
            opacity: 0;
          }
        }

        /* Surface refraction sway */
        @keyframes refraction-sway {
          0%   { transform: skewX(-8deg) translateX(0); opacity: 0.7; }
          100% { transform: skewX(-4deg) translateX(15px); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
