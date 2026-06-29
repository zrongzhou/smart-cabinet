'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// SkyHeader — 深蓝夜空 + 流光(Aurora) + 星空
// v163: 大幅提高视觉可见度
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
// LAYER 1: Aurora 流光 — 高可见度版本
// ============================================================
function AuroraFlow() {
  const [ribbons, setRibbons] = useState<Array<{
    id: number; top: string; height: string; opacity: number;
    duration: number; delay: number; blur: number;
    colorA: string; colorB: string;
  }>>([]);

  useEffect(() => {
    setRibbons([
      {
        id: 0, top: '0%', height: '45%', opacity: 0.28,
        duration: 14, delay: 0, blur: 50,
        colorA: 'rgba(56,189,248,0.55)', colorB: 'rgba(139,92,246,0.35)',
      },
      {
        id: 1, top: '8%', height: '38%', opacity: 0.22,
        duration: 18, delay: 2, blur: 60,
        colorA: 'rgba(99,102,241,0.50)', colorB: 'rgba(16,185,129,0.30)',
      },
      {
        id: 2, top: '-5%', height: '48%', opacity: 0.18,
        duration: 22, delay: 5, blur: 70,
        colorA: 'rgba(236,72,153,0.40)', colorB: 'rgba(59,130,246,0.25)',
      },
      {
        id: 3, top: '15%', height: '32%', opacity: 0.16,
        duration: 16, delay: 1, blur: 45,
        colorA: 'rgba(34,211,238,0.45)', colorB: 'rgba(167,139,250,0.20)',
      },
    ]);
  }, []);

  if (ribbons.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true"
         style={{ mixBlendMode: 'screen' }}>
      {ribbons.map(r => (
        <div key={r.id} className="absolute left-[-15%] right-[-15%]"
             style={{
               top: r.top,
               height: r.height,
               background: `linear-gradient(90deg,
                 transparent 0%,
                 ${r.colorA} 15%,
                 ${r.colorB} 45%,
                 ${r.colorA} 75%,
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
// LAYER 2: 星空 — 大尺寸高亮星星（之前1-2.5px太看不见了）
// ============================================================
function StarField() {
  const [stars, setStars] = useState<Array<{
    id: number; x: number; y: number; size: number;
    brightness: number; pulseSpeed: number; delay: number;
  }>>([]);

  useEffect(() => {
    // Mix of small + medium + large stars for depth
    const starData = Array.from({ length: 45 }, (_, i) => {
      const roll = Math.random();
      let size: number;
      if (roll > 0.85) size = 3.5 + Math.random() * 2;   // large: 3.5-5.5px
      else if (roll > 0.55) size = 2 + Math.random() * 1.5; // medium: 2-3.5px
      else size = 1 + Math.random() * 1;                    // small: 1-2px

      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 70, // keep in upper 70%
        size,
        brightness: 0.4 + Math.random() * 0.6,
        pulseSpeed: 2 + Math.random() * 4,
        delay: Math.random() * 7,
      };
    });
    setStars(starData);
  }, []);

  if (stars.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full will-change-opacity"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size,
            background: `radial-gradient(circle, rgba(255,255,255,${s.brightness}) 0%, rgba(200,220,255,${s.brightness * 0.5}) 40%, transparent 80%)`,
            boxShadow: s.size > 2.5
              ? `0 0 ${s.size * 3}px rgba(180,210,255,${s.brightness * 0.4}), 0 0 ${s.size * 6}px rgba(150,190,255,${s.brightness * 0.15})`
              : `0 0 ${s.size * 2}px rgba(180,210,255,${s.brightness * 0.25})`,
            animation: `star-twinkle ${s.pulseSpeed}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// LAYER 3: 流星
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
      length: 100 + Math.random() * 120,
      speed: 6 + Math.random() * 4,
      delay: i * 5 + Math.random() * 8,
    })));
  }, []);

  if (stars.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map(s => (
        <div key={s.id}
          className="absolute"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.length}px`, height: '2px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.95), rgba(180,220,255,0.5), transparent)',
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
// LAYER 4: 底部淡出 — 纯净浅色渐变到白
// ============================================================
function BottomFade() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[70px] pointer-events-none"
         aria-hidden="true"
         style={{
           background: 'linear-gradient(180deg, rgba(191,232,252,0.0) 0%, rgba(210,240,250,0.15) 35%, rgba(235,248,255,0.55) 65%, #ffffff 100%)',
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

      {/* Layer 4: Bottom fade to white (no dark edge!) */}
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
          0%   { transform: translateX(-8%) skewY(-3deg); }
          50%  { transform: translateX(6%) skewY(-1.5deg); }
          100% { transform: translateX(-8%) skewY(-3deg); }
        }

        /* Star twinkle */
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.3); }
        }

        /* Shooting star */
        @keyframes shooting-star {
          0%   { opacity: 0; transform: translateX(0) translateY(0) rotate(var(--angle, 220deg)); }
          4%   { opacity: 1; }
          15%  { opacity: 0; transform: translateX(140px) translateY(90px) rotate(var(--angle, 220deg)); }
          100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
}
