'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader — 海洋主题动态页面头组件
// Features: 鲸鱼群游、海浪、气泡上升、光线、水母、鱼群
// Usage: <OceanHeader title="..." subtitle="..." icon={<Icon />} />
// ============================================================

interface Bubble {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface Fish {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  color: string;
  direction: number; // 1 = right, -1 = left
}

function RisingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // 18 bubbles for rich visual
    const bbs: Bubble[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 4 + Math.random() * 10,
      delay: Math.random() * 6,
      duration: 5 + Math.random() * 4,
      opacity: 0.15 + Math.random() * 0.3,
    }));
    setBubbles(bbs);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {bubbles.map(b => (
        <div
          key={b.id}
          className="absolute rounded-full"
          style={{
            left: `${b.x}%`,
            bottom: '-10px',
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,${b.opacity + 0.2}), rgba(147,197,253,${b.opacity * 0.5}) transparent)`,
            willChange: 'transform, opacity',
            animation: `ocean-bubble-rise ${b.duration}s ease-in-out infinite`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function FishSchool() {
  const [fishes, setFishes] = useState<Fish[]>([]);

  useEffect(() => {
    const colors = [
      '#60a5fa', // blue-400
      '#a78bfa', // purple-400
      '#34d399', // emerald-400
      '#fbbf24', // amber-400
      '#f87171', // red-400
      '#2dd4bf', // teal-400
    ];
    const school: Fish[] = Array.from({ length: 8 }, (_, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      const startX = dir === 1 ? -15 : 115;
      return {
        id: i,
        x: startX,
        y: 20 + (i * 9) % 60,
        size: 24 + Math.random() * 14, // BIGGER: 24-38px
        speed: 10 + Math.random() * 7, // SLOWER: 10-17s for smooth swim
        delay: Math.random() * 8, // staggered entry
        color: colors[i % colors.length],
        direction: dir,
      };
    });
    setFishes(school);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {fishes.map(f => (
        <div
          key={f.id}
          className="absolute"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            willChange: 'transform',
            animation: `fish-swim-${f.direction === 1 ? 'right' : 'left'} ${f.speed}s ease-in-out infinite`,
            animationDelay: `${f.delay}s`,
          }}
        >
          {/* Larger fish SVG with body wiggle */}
          <svg width={f.size} height={f.size * 0.55} viewBox="0 0 24 13"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }}>
            <g className="fish-body" style={{
              transformOrigin: '12px 6.5px',
              animation: `fish-wiggle ${0.4 + Math.random() * 0.3}s ease-in-out infinite`,
            }}>
              <ellipse cx="10" cy="6.5" rx="9" ry="5.5" fill={f.color} />
              <polygon points="19,6.5 24,1 22,6.5 24,12" fill={f.color} />
              <circle cx="4" cy="5.5" r="1.8" fill="rgba(255,255,255,0.85)" />
              <circle cx="3.5" cy="5.3" r="0.8" fill="rgba(0,0,0,0.35)" />
            </g>
          </svg>
        </div>
      ))}
    </div>
  );
}

// Whale SVG component — swimming whale with tail animation
function WhaleSwim({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="absolute whale-container" style={{ ...style }}>
      <svg width="120" height="50" viewBox="0 0 120 50" className="whale-svg">
        <defs>
          <linearGradient id="whaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(99,130,246,0.45)" />
            <stop offset="100%" stopColor="rgba(67,97,248,0.25)" />
          </linearGradient>
          <filter id="whaleGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Body */}
        <ellipse cx="52" cy="26" rx="42" ry="18" fill="url(#whaleGrad)" filter="url(#whaleGlow)" opacity="0.85" />
        {/* Belly highlight */}
        <ellipse cx="54" cy="32" rx="28" ry="9" fill="rgba(180,210,255,0.12)" />
        {/* Tail fin */}
        <g className="whale-tail">
          <path d="M10 26 Q0 14 4 8 Q12 16 10 26 Z" fill="url(#whaleGrad)" opacity="0.75" />
          <path d="M10 26 Q0 38 4 44 Q12 36 10 26 Z" fill="url(#whaleGrad)" opacity="0.75" />
        </g>
        {/* Pectoral fin */}
        <path d="M40 40 Q34 48 38 46 Q44 43 42 39 Z" fill="rgba(67,97,248,0.3)" />
        {/* Dorsal fin */}
        <path d="M56 8 Q60 0 64 6 Q62 10 58 9 Z" fill="rgba(67,97,248,0.3)" />
        {/* Eye */}
        <circle cx="76" cy="22" r="2.5" fill="rgba(255,255,255,0.6)" />
        <circle cx="76.8" cy="21.5" r="1" fill="rgba(30,58,138,0.5)" />
        {/* Mouth line */}
        <path d="M82 29 Q88 31 92 28" stroke="rgba(67,97,248,0.3)" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* Water spout (optional small spray) */}
        <circle cx="80" cy="6" r="2" fill="rgba(200,220,255,0.25)" className="spout-drop" />
        <circle cx="83" cy="3" r="1.5" fill="rgba(200,220,255,0.2)" className="spout-drop" style={{ animationDelay: '0.3s' }} />
        <circle cx="77" cy="4" r="1" fill="rgba(200,220,255,0.15)" className="spout-drop" style={{ animationDelay: '0.6s' }} />
      </svg>
    </div>
  );
}

// Small whale for background
function SmallWhale({ style, delay }: { style?: React.CSSProperties; delay?: string }) {
  return (
    <div className="absolute small-whale" style={{ ...style, animationDelay: delay || '0s' }}>
      <svg width="70" height="30" viewBox="0 0 70 30" className="whale-svg-small">
        <defs>
          <linearGradient id="smallWhaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(139,92,246,0.35)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.18)" />
          </linearGradient>
        </defs>
        <ellipse cx="30" cy="15" rx="24" ry="11" fill="url(#smallWhaleGrad)" opacity="0.7" />
        <g className="whale-tail-sm">
          <path d="M6 15 Q0 8 3 4 Q8 10 6 15 Z" fill="url(#smallWhaleGrad)" opacity="0.6" />
          <path d="M6 15 Q0 22 3 26 Q8 20 6 15 Z" fill="url(#smallWhaleGrad)" opacity="0.6" />
        </g>
        <circle cx="46" cy="12" r="1.5" fill="rgba(255,255,255,0.5)" />
      </svg>
    </div>
  );
}

// Jellyfish floating — larger, more visible
function Jellyfish({ style, delay }: { style?: React.CSSProperties; delay?: string }) {
  return (
    <div className="absolute jellyfish-float" style={{ ...style, animationDelay: delay || '0s' }}>
      <svg width="44" height="60" viewBox="0 0 32 45">
        <defs>
          <radialGradient id="jellyGrad" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(236,72,153,0.5)" />
            <stop offset="60%" stopColor="rgba(167,139,250,0.35)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.12)" />
          </radialGradient>
          <filter id="jellyGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Bell (dome) */}
        <path d="M2 18 Q2 2 16 2 Q30 2 30 18 Q28 22 16 22 Q4 22 2 18Z"
              fill="url(#jellyGrad)" filter="url(#jellyGlow)"
              className="jelly-bell" />
        {/* Tentacles — more visible */}
        {[6, 11, 16, 21, 26].map((tx, ti) => (
          <path
            key={ti}
            d={`M${tx} 21 Q ${tx + (ti % 2 === 0 ? 5 : -5)} 33 ${tx + (ti % 3 === 0 ? 3 : -3)} 44`}
            stroke={`rgba(${ti % 2 === 0 ? '236,72,153' : '167,139,249'},${0.3 + ti * 0.07})`}
            strokeWidth="1.5"
            fill="none"
            className={`jelly-tentacle-${ti}`}
            style={{ animationDelay: `${ti * 0.25}s` }}
          />
        ))}
        {/* Inner glow dots — brighter */}
        <circle cx="11" cy="11" r="2.5" fill="rgba(255,255,255,0.4)" />
        <circle cx="21" cy="13" r="1.8" fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
}

// Light rays from surface - fixed for hydration
interface LightRay {
  left: number;
  width: number;
  opacity: number;
  rotate: number;
}

function LightRays() {
  const [rays, setRays] = useState<LightRay[]>([]);
  
  useEffect(() => {
    setRays(Array.from({ length: 5 }, (_, i) => ({
      left: 10 + i * 20,
      width: 30 + Math.random() * 40,
      opacity: 0.06 + i * 0.015,
      rotate: -8 + i * 5,
    })));
  }, []);
  
  if (rays.length === 0) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {rays.map((ray, i) => (
        <div
          key={i}
          className="absolute light-ray"
          style={{
            left: `${ray.left}%`,
            top: '-10%',
            width: `${ray.width}px`,
            height: '120%',
            background: `linear-gradient(180deg, rgba(147,197,253,${ray.opacity}), rgba(147,197,253,${ray.opacity * 0.15}) 60%, transparent)`,
            transform: `rotate(${ray.rotate}deg)`,
            animation: `light-ray-sway ${4 + i * 0.8}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

// Wave layers at bottom - fixed for hydration
interface FoamParticle {
  left: number;
  bottom: number;
  width: number;
  height: number;
  duration: number;
  delay: number;
}

function OceanWaves() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[20px] pointer-events-none overflow-hidden">
      {/* Single subtle light wave — no dark area */}
      <div
        className="absolute inset-0"
        style={{
          background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 20'%3E%3Cpath d='M0 10 C150 2 350 18 600 10 C850 2 1050 18 1200 10 L1200 20 L0 20Z' fill='rgba(96,165,250,0.08)'/%3E%3C/svg%3E") no-repeat bottom center / cover`,
          animation: 'wave-move-front 5.5s ease-in-out infinite',
        }}
      />
    </div>
  );
}

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
      className="relative text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden ocean-header-wrapper"
      style={{
        minHeight: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(175deg,
          #0c2845 0%,
          #0a3a6d 15%,
          #0e4d8a 35%,
          #0f5a9e 50%,
          #0d4d8a 70%,
          #0a3d6e 90%,
          #0c2845 100%)`,
      }}
    >
      {/* Deep ocean ambient gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[5%] w-[500px] h-[300px] rounded-full blur-[120px]"
             style={{ backgroundColor: 'rgba(59,130,246,0.08)' }} />
        <div className="absolute bottom-0 right-[8%] w-[400px] h-[250px] rounded-full blur-[100px]"
             style={{ backgroundColor: 'rgba(6,182,212,0.07)' }} />
        <div className="absolute top-[40%] right-[15%] w-[300px] h-[300px] rounded-full blur-[90px]"
             style={{ backgroundColor: 'rgba(139,92,246,0.05)' }} />
      </div>

      {/* Light rays REMOVED per user request */}

      {/* Rising bubbles */}
      <RisingBubbles />

      {/* Fish school */}
      <FishSchool />

      {/* Whale group — main whale + baby whales */}
      <WhaleSwim style={{
        bottom: '15%',
        left: '-8%',
        animation: 'whale-swim-across 22s linear infinite',
      }} />
      <SmallWhale style={{
        bottom: '35%',
        right: '-6%',
        animation: 'whale-swim-reverse 18s linear infinite',
      }} delay="3s" />
      <SmallWhale style={{
        bottom: '55%',
        left: '-5%',
        animation: 'whale-swim-across 26s linear infinite',
        animationDelay: '8s',
      }} delay="0s" />

      {/* Jellyfish - 4 jellyfish for rich visual */}
      <Jellyfish style={{ top: '15%', right: '12%' }} delay="0s" />
      <Jellyfish style={{ top: '40%', left: '8%' }} delay="2s" />
      <Jellyfish style={{ top: '65%', right: '25%', transform: 'scale(0.7)' }} delay="4s" />
      <Jellyfish style={{ top: '25%', left: '30%', transform: 'scale(0.6)' }} delay="1s" />

      {/* Subtle wave line at bottom — no dark area */}
      <OceanWaves />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.15))',
              border: '1px solid rgba(147,197,253,0.2)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 20px rgba(59,130,246,0.1)',
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
            textShadow: '0 0 30px rgba(147,197,253,0.25), 0 2px 8px rgba(0,0,0,0.5), 0 0 1px rgba(220,240,255,0.5)',
          }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-xl text-blue-100"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
          >
            {subtitle}
          </motion.p>
        )}
        {children}
      </div>

      {/* All CSS Animations for Ocean Theme */}
      <style>{`
        /* ===== PREFER REDUCED MOTION - Disable all animations for accessibility & performance ===== */
        @media (prefers-reduced-motion: reduce) {
          .ocean-header-wrapper * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* ===== BUBBLE RISE ===== */
        @keyframes ocean-bubble-rise {
          0%   { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; }
          10%  { opacity: var(--bubble-opacity, 0.5); }
          50%  { transform: translateY(-120px) translateX(6px) scale(1); }
          90%  { opacity: 0.25; }
          100% { transform: translateY(-260px) translateX(-4px) scale(0.6); opacity: 0; }
        }

        /* ===== FISH SWIM (bidirectional, smooth) ===== */
        @keyframes fish-swim-right {
          0%   { transform: translateX(0) translateY(0); }
          20%  { transform: translateX(18vw) translateY(-6px); }
          40%  { transform: translateX(38vw) translateY(4px); }
          60%  { transform: translateX(58vw) translateY(-3px); }
          80%  { transform: translateX(78vw) translateY(5px); }
          100% { transform: translateX(115vw) translateY(0); }
        }
        @keyframes fish-swim-left {
          0%   { transform: scaleX(-1) translateX(0) translateY(0); }
          20%  { transform: scaleX(-1) translateX(18vw) translateY(4px); }
          40%  { transform: scaleX(-1) translateX(38vw) translateY(-3px); }
          60%  { transform: scaleX(-1) translateX(58vw) translateY(5px); }
          80%  { transform: scaleX(-1) translateX(78vw) translateY(-2px); }
          100% { transform: translateX(-115vw) translateY(0); }
        }
        /* Fish body wiggle — makes fish look alive */
        @keyframes fish-wiggle {
          0%, 100% { transform: rotate(0deg) scaleY(1); }
          25%      { transform: rotate(2deg) scaleY(0.95); }
          50%      { transform: rotate(0deg) scaleY(1); }
          75%      { transform: rotate(-2deg) scaleY(0.96); }
        }

        /* ===== WHALE SWIM ===== */
        @keyframes whale-swim-across {
          0%   { transform: translateX(-140px) translateY(0); }
          20%  { transform: translateX(20vw) translateY(-8px); }
          40%  { transform: translateX(40vw) translateY(5px); }
          60%  { transform: translateX(65vw) translateY(-3px); }
          80%  { transform: translateX(90vw) translateY(6px); }
          100% { transform: translateX(calc(100vw + 140px)) translateY(0); }
        }
        @keyframes whale-swim-reverse {
          0%   { transform: scaleX(-1) translateX(-140px) translateY(0); }
          20%  { transform: scaleX(-1) translateX(20vw) translateY(6px); }
          40%  { transform: scaleX(-1) translateX(40vw) translateY(-5px); }
          60%  { transform: scaleX(-1) translateX(65vw) translateY(4px); }
          80%  { transform: scaleX(-1) translateX(90vw) translateY(-6px); }
          100% { transform: scaleX(-1) translateX(calc(100vw + 140px)) translateY(0); }
        }

        /* Whale tail wagging */
        @keyframes whale-tail-wag {
          0%, 100% { transform: rotate(0deg); }
          25%      { transform: rotate(8deg); }
          75%      { transform: rotate(-6deg); }
        }
        .whale-tail {
          transform-origin: 12px 26px;
          animation: whale-tail-wag 2.5s ease-in-out infinite;
        }
        .whale-tail-sm {
          transform-origin: 6px 15px;
          animation: whale-tail-wag 2s ease-in-out infinite;
        }

        /* Spout drops */
        @keyframes spout-rise {
          0%   { transform: translateY(0) scale(1); opacity: 0.3; }
          100% { transform: translateY(-12px) scale(0); opacity: 0; }
        }
        .spout-drop {
          animation: spout-rise 2s ease-out infinite;
        }

        /* Whale container hover effect */
        .whale-container:hover .whale-svg {
          filter: drop-shadow(0 0 15px rgba(96,165,250,0.3));
          transition: filter 0.4s ease;
        }

        /* ===== JELLYFISH ===== */
        @keyframes jellyfish-drift {
          0%, 100% { transform: translateY(0) translateX(0) rotate(-3deg); }
          25%      { transform: translateY(-12px) translateX(6px) rotate(2deg); }
          50%      { transform: translateY(-4px) translateX(-4px) rotate(-1deg); }
          75%      { transform: translateY(-16px) translateX(8px) rotate(3deg); }
        }
        .jellyfish-float {
          animation: jellyfish-drift 8s ease-in-out infinite;
        }

        /* Jelly bell pulsing */
        @keyframes jelly-pulse {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50%      { transform: scaleY(0.92) scaleX(1.03); }
        }
        .jelly-bell {
          transform-origin: center bottom;
          animation: jelly-pulse 3s ease-in-out infinite;
        }

        /* Jelly tentacles swaying */
        @keyframes tentacle-sway {
          0%, 100% { d: path('M{tx} 21 Q {tx+4} 33 {tx+2} 44'); }
          50%      { d: path('M{tx} 21 Q {tx-4} 33 {tx-2} 44'); }
        }

        /* ===== LIGHT RAYS (REMOVED) ===== */

        /* ===== OCEAN WAVES (simplified) ===== */
        @keyframes wave-move-front {
          0%   { transform: translateX(0) translateZ(0); }
          50%  { transform: translateX(-25px) translateZ(0); }
          100% { transform: translateX(0) translateZ(0); }
        }
        @keyframes wave-move-mid {
          0%   { transform: translateX(0) translateZ(0); }
          50%  { transform: translateX(18px) translateZ(0); }
          100% { transform: translateX(0) translateZ(0); }
        }
        @keyframes wave-move-back {
          0%   { transform: translateX(0) translateZ(0); }
          50%  { transform: translateX(-12px) translateZ(0); }
          100% { transform: translateX(0) translateZ(0); }
        }

        .wave-layer-front {
          position: absolute;
          bottom: 0; left: -20px; right: -20px; top: 0;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 20'%3E%3Cpath d='M0 10 C150 2 350 18 600 10 C850 2 1050 18 1200 10 L1200 20 L0 20Z' fill='rgba(96,165,250,0.08)'/%3E%3C/svg%3E") no-repeat bottom center / cover;
          animation: wave-move-front 5.5s ease-in-out infinite;
        }

        /* Small whale specific */
        .small-whale {
          animation: whale-swim-across 20s linear infinite;
        }

        /* Ocean header wrapper ensures children are positioned correctly */
        .ocean-header-wrapper {
          perspective: 800px;
        }
      `}</style>
    </section>
  );
}
