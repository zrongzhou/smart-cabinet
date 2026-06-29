'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// SkyHeader — 深蓝夜空 + 流光(Aurora) + 星空
// 方向：B2B 工业设备网站 → 高级、克制、科技感
// 取代所有之前的海洋/气泡版本
// ============================================================

const SKY_GRADIENT = `linear-gradient(180deg,
  #020817 0%,
  #061528 12%,
  #0a2240 25%,
  #0f3460 40%,
  #134d7a 55%,
  #1a6aa8 70%,
  #2a8cd4 82%,
  #52aef2 91%,
  #87cbf7 97%,
  #bfe8fc 100%)`;

// ============================================================
// LAYER 1: 流光 Aurora — 多层渐变光带缓慢流动
// ============================================================
function AuroraFlow() {
  const [ribbons, setRibbons] = useState<Array<{
    id: number;
    top: string;
    height: string;
    opacity: number;
    duration: number;
    delay: number;
    blur: number;
    colorA: string;
    colorB: string;
  }>>([]);

  useEffect(() => {
    setRibbons([
      {
        id: 0, top: '5%', height: '35%', opacity: 0.14,
        duration: 18, delay: 0, blur: 60,
        colorA: 'rgba(56,189,248,0.35)', colorB: 'rgba(139,92,246,0.18)',
      },
      {
        id: 1, top: '12%', height: '28%', opacity: 0.11,
        duration: 22, delay: 3, blur: 75,
        colorA: 'rgba(99,102,241,0.30)', colorB: 'rgba(16,185,129,0.15)',
      },
      {
        id: 2, top: '-3%', height: '38%', opacity: 0.09,
        duration: 26, delay: 7, blur: 90,
        colorA: 'rgba(236,72,153,0.20)', colorB: 'rgba(59,130,246,0.12)',
      },
      {
        id: 3, top: '18%', height: '22%', opacity: 0.08,
        duration: 20, delay: 2, blur: 55,
        colorA: 'rgba(34,211,238,0.25)', colorB: 'rgba(167,139,250,0.10)',
      },
    ]);
  }, []);

  if (ribbons.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true"
         style={{ mixBlendMode: 'screen' }}>
      {ribbons.map(r => (
        <div key={r.id} className="absolute left-[-10%] right-[-10%]"
             style={{
               top: r.top,
               height: r.height,
               background: `linear-gradient(90deg,
                 transparent 0%,
                 ${r.colorA} 20%,
                 ${r.colorB} 50%,
                 ${r.colorA} 80%,
                 transparent 100%)`,
               filter: `blur(${r.blur}px)`,
               opacity: r.opacity,
               transform: 'skewY(-3deg)',
               animation: `aurora-flow ${r.duration}s ease-in-out infinite alternate`,
               animationDelay: `${r.delay}s`,
             }}
        />
      ))}
    </div>
  );
}

// ============================================================
// LAYER 2: 星空 — 不同大小/亮度的星星闪烁
// ============================================================
function StarField() {
  const [stars, setStars] = useState<Array<{
    id: number; x: number; y: number; size: number;
    brightness: number; pulseSpeed: number; delay: number;
  }>>([]);

  useEffect(() => {
    setStars(Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 72,
      size: Math.random() > 0.85 ? 2.5 : (Math.random() > 0.65 ? 1.8 : 1),
      brightness: 0.3 + Math.random() * 0.7,
      pulseSpeed: 2 + Math.random() * 5,
      delay: Math.random() * 8,
    })));
  }, []);

  if (stars.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full will-change-opacity"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            background: `radial-gradient(circle, rgba(255,255,255,${s.brightness}) 0%, rgba(200,220,255,${s.brightness * 0.45}) 45%, transparent 100%)`,
            boxShadow: `0 0 ${s.size * 2}px rgba(180,210,255,${s.brightness * 0.25})`,
            animation: `star-twinkle ${s.pulseSpeed}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// LAYER 3: 流星 — 偶尔划过的光线
// ============================================================
function ShootingStars() {
  const [stars, setStars] = useState<Array<{
    id: number; x: number; y: number;
    angle: number; length: number; speed: number; delay: number;
  }>>([]);

  useEffect(() => {
    setStars(Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 5 + Math.random() * 25,
      angle: 215 + Math.random() * 30,
      length: 80 + Math.random() * 120,
      speed: 6 + Math.random() * 5,
      delay: i * 4 + Math.random() * 6,
    })));
  }, []);

  if (stars.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map(s => (
        <div key={s.id}
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.length}px`,
            height: '1.5px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(180,220,255,0.4), transparent)',
            borderRadius: '1px',
            transform: `rotate(${s.angle}deg)`,
            transformOrigin: '0 50%',
            opacity: 0,
            animation: `shooting-star ${s.speed}s ease-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// LAYER 4: 底部淡出 — 纯净渐变，无黑边
// ============================================================
function BottomFade() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[80px] pointer-events-none"
         aria-hidden="true"
         style={{
           background: 'linear-gradient(180deg, rgba(191,232,252,0.0) 0%, rgba(191,232,252,0.10) 30%, rgba(225,245,254,0.40) 65%, rgba(248,252,255,0.94) 100%)',
         }}
    />
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SkyHeader({
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
        minHeight: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: SKY_GRADIENT,
      }}
    >
      {/* Layer 1: Aurora flow ribbons */}
      <AuroraFlow />

      {/* Layer 2: Star field */}
      <StarField />

      {/* Layer 3: Shooting stars */}
      <ShootingStars />

      {/* Layer 4: Bottom fade */}
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
              background: 'linear-gradient(135deg, rgba(255,255,255,0.17), rgba(255,255,255,0.07))',
              border: '1px solid rgba(255,255,255,0.22)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 28px rgba(99,102,241,0.15), 0 0 56px rgba(56,189,248,0.08)',
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
            textShadow: '0 2px 14px rgba(0,0,0,0.35), 0 0 40px rgba(99,102,241,0.12)',
          }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-xl text-white/88"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}
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

        /* Aurora ribbon flow */
        @keyframes aurora-flow {
          0%   { transform: translateX(-6%) skewY(-3deg); }
          50%  { transform: translateX(4%) skewY(-1deg); }
          100% { transform: translateX(-6%) skewY(-3deg); }
        }

        /* Star twinkle */
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.75); }
          50%      { opacity: 1;    transform: scale(1.2); }
        }

        /* Shooting star */
        @keyframes shooting-star {
          0%   { opacity: 0; transform: translateX(0) translateY(0) rotate(var(--angle, 220deg)); }
          4%   { opacity: 1; }
          15%  { opacity: 0; transform: translateX(120px) translateY(80px) rotate(var(--angle, 220deg)); }
          100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
