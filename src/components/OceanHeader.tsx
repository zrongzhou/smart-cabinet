'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// SkyHeader — 蓝天白云 阳光明媚
// v164: 彻底告别夜空/海洋，改为明亮晴朗的白天天空
// ============================================================

const SKY_GRADIENT = `linear-gradient(180deg,
  #38bdf8 0%,
  #5cc6ef 12%,
  #7dd3fc 25%,
  #a4ddf8 40%,
  #c5e8fb 55%,
  #e0f2fe 70%,
  #eef8ff 85%,
  #f8fcff 100%)`;

// ============================================================
// LAYER 1: 白云 — 柔和飘动的积云
// ============================================================
function Clouds() {
  const [clouds, setClouds] = useState<Array<{
    id: number; left: string; top: string; width: string; opacity: number;
    duration: number; delay: number; blur: number;
  }>>([]);

  useEffect(() => {
    setClouds([
      { id: 0, left: '5%', top: '10%', width: '180px', opacity: 0.9, duration: 45, delay: 0, blur: 1 },
      { id: 1, left: '60%', top: '5%', width: '220px', opacity: 0.75, duration: 55, delay: 5, blur: 1.5 },
      { id: 2, left: '30%', top: '22%', width: '140px', opacity: 0.6, duration: 38, delay: 10, blur: 0.8 },
      { id: 3, left: '78%', top: '18%', width: '160px', opacity: 0.7, duration: 48, delay: 3, blur: 1.2 },
      { id: 4, left: '-5%', top: '30%', width: '200px', opacity: 0.5, duration: 62, delay: 15, blur: 1.5 },
      { id: 5, left: '45%', top: '35%', width: '120px', opacity: 0.45, duration: 42, delay: 20, blur: 1 },
    ]);
  }, []);

  if (clouds.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {clouds.map(c => (
        <div key={c.id} className="absolute" style={{
          left: c.left,
          top: c.top,
          filter: `blur(${c.blur}px)`,
          opacity: c.opacity,
          animation: `cloud-drift ${c.duration}s ease-in-out infinite alternate`,
          animationDelay: `${c.delay}s`,
        }}>
          {/* Fluffy cloud shape using multiple overlapping circles */}
          <svg width={c.width} height={c.width ? String(Math.max(Number(c.width.replace('px','')) * 0.45, 50)) + 'px' : '80px'} viewBox="0 0 200 90">
            <defs>
              <linearGradient id={`cloudGrad${c.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="100%" stopColor="#e8f4fc" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="60" cy="55" rx="50" ry="30" fill={`url(#cloudGrad${c.id})`} />
            <ellipse cx="105" cy="45" rx="58" ry="36" fill={`url(#cloudGrad${c.id})`} />
            <ellipse cx="150" cy="52" rx="44" ry="28" fill={`url(#cloudGrad${c.id})`} />
            <ellipse cx="82" cy="38" rx="40" ry="26" fill={`url(#cloudGrad${c.id})`} />
            <ellipse cx="128" cy="35" rx="34" ry="22" fill={`url(#cloudGrad${c.id})`} />
          </svg>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// LAYER 2: 阳光光晕 — 温暖的光线从上方洒落
// ============================================================
function SunGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Sun position — upper right */}
      <div className="absolute" style={{
        right: '12%',
        top: '-4%',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(255,248,200,0.95) 0%, rgba(255,235,160,0.5) 25%, rgba(255,220,120,0.15) 45%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(8px)',
        animation: 'sun-pulse 6s ease-in-out infinite',
      }} />
      {/* Light rays from sun */}
      <div className="absolute inset-0" style={{
        background: `
          linear-gradient(135deg, transparent 40%, rgba(255,250,220,0.08) 45%, transparent 50%),
          linear-gradient(160deg, transparent 45%, rgba(255,248,200,0.05) 50%, transparent 55%),
          linear-gradient(110deg, transparent 50%, rgba(255,245,210,0.06) 55%, transparent 60%)
        `,
        animation: 'rays-shift 8s ease-in-out infinite alternate',
      }} />
    </div>
  );
}

// ============================================================
// LAYER 3: 底部柔和淡出到纯白（无黑边！无多余条！）
// ============================================================
function BottomFade() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[50px] pointer-events-none"
      aria-hidden="true"
      style={{
        background: 'linear-gradient(180deg, rgba(232,245,254,0) 0%, rgba(240,249,255,0.3) 50%, #ffffff 100%)',
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
      className="relative text-gray-800 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        minHeight: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: SKY_GRADIENT,
      }}
    >
      {/* Layer 1: Sun glow + light rays */}
      <SunGlow />

      {/* Layer 2: Drifting white clouds */}
      <Clouds />

      {/* Layer 3: Bottom fade to pure white */}
      <BottomFade />

      {/* === CONTENT === */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 mx-auto shadow-lg"
            style={{
              background: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.7)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(96,165,250,0.2), 0 2px 8px rgba(96,165,250,0.1)',
            }}
          >
            {icon}
          </motion.div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-5xl font-bold mb-4 text-gray-800"
          style={{ textShadow: '0 2px 12px rgba(255,255,255,0.8)' }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-xl text-gray-600/90"
            style={{ textShadow: '0 1px 6px rgba(255,255,255,0.6)' }}
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

        /* Cloud drift — slow horizontal float */
        @keyframes cloud-drift {
          0%   { transform: translateX(-15px); }
          100% { transform: translateX(18px); }
        }

        /* Sun gentle pulse */
        @keyframes sun-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.06); opacity: 0.92; }
        }

        /* Light rays subtle shift */
        @keyframes rays-shift {
          0%   { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
