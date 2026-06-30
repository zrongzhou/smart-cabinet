'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// SkyHeader — 深蓝天空 白云飘动 阳光明媚
// v168: 云彩真正从左到右飘过 + 更明显的动画
// ============================================================

const SKY_GRADIENT = `linear-gradient(180deg,
  #1e3a8a 0%,
  #1e40af 10%,
  #1d4ed8 22%,
  #2563eb 35%,
  #3b82f6 50%,
  #60a5fa 65%,
  #93c5fd 80%,
  #bfdbfe 92%,
  #e0f2fe 100%)`;

function Clouds() {
  const [clouds, setClouds] = useState<Array<{
    id: number; top: string; size: number; speed: number; delay: number; opacity: number;
  }>>([]);

  useEffect(() => {
    setClouds([
      { id: 0, top: '8%', size: 160, speed: 35, delay: 0, opacity: 0.95 },
      { id: 1, top: '18%', size: 200, speed: 48, delay: -12, opacity: 0.85 },
      { id: 2, top: '28%', size: 120, speed: 28, delay: -6, opacity: 0.7 },
      { id: 3, top: '38%', size: 140, speed: 42, delay: -20, opacity: 0.6 },
      { id: 4, top: '14%', size: 180, speed: 55, delay: -30, opacity: 0.75 },
      { id: 5, top: '44%', size: 100, speed: 32, delay: -15, opacity: 0.5 },
    ]);
  }, []);

  if (clouds.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {clouds.map(c => (
        <div key={c.id} style={{
          position: 'absolute',
          top: c.top,
          left: '-220px',
          width: `${c.size * 1.6}px`,
          height: `${c.size * 0.7}px`,
          opacity: c.opacity,
          animation: `cloud-fly ${c.speed}s linear infinite`,
          animationDelay: `${c.delay}s`,
        }}>
          {/* Fluffy cloud SVG */}
          <svg width="100%" height="100%" viewBox="0 0 200 90" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id={`cg${c.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="100%" stopColor="#e8f4fc" stopOpacity="0.92" />
              </linearGradient>
            </defs>
            <ellipse cx="55" cy="55" rx="48" ry="28" fill={`url(#cg${c.id})`} />
            <ellipse cx="105" cy="44" rx="56" ry="34" fill={`url(#cg${c.id})`} />
            <ellipse cx="148" cy="52" rx="42" ry="26" fill={`url(#cg${c.id})`} />
            <ellipse cx="82" cy="36" rx="38" ry="24" fill={`url(#cg${c.id})`} />
            <ellipse cx="125" cy="33" rx="32" ry="20" fill={`url(#cg${c.id})`} />
          </svg>
        </div>
      ))}
    </div>
  );
}

function SunGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Sun */}
      <div className="absolute" style={{
        right: '10%',
        top: '-3%',
        width: '170px',
        height: '170px',
        background: 'radial-gradient(circle, rgba(255,248,200,0.95) 0%, rgba(255,235,160,0.5) 25%, rgba(255,220,120,0.15) 45%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(8px)',
        animation: 'sun-pulse 5s ease-in-out infinite',
      }} />
      {/* Light rays */}
      <div className="absolute inset-0" style={{
        background: `
          linear-gradient(135deg, transparent 40%, rgba(255,250,220,0.08) 45%, transparent 50%),
          linear-gradient(160deg, transparent 45%, rgba(255,248,200,0.05) 50%, transparent 55%),
          linear-gradient(110deg, transparent 50%, rgba(255,245,210,0.06) 55%, transparent 60%)
        `,
        animation: 'rays-shift 7s ease-in-out infinite alternate',
      }} />
    </div>
  );
}

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
      <SunGlow />
      <Clouds />
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

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          section * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }

        /* Cloud flies from left to right across the entire screen */
        @keyframes cloud-fly {
          0% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(30vw) translateY(-8px); }
          50% { transform: translateX(60vw) translateY(5px); }
          75% { transform: translateX(90vw) translateY(-4px); }
          100% { transform: translateX(120vw) translateY(0); }
        }

        @keyframes sun-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.88; }
        }

        @keyframes rays-shift {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
