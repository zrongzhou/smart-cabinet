'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v2 — 全新重写版
// 亮色海洋主题：明亮渐变背景 + 可见鱼群 + 漂浮水母 + 海底焦散光
// ============================================================

// ===== BRIGHT OCEAN BACKGROUND =====
const OCEAN_GRADIENT = `linear-gradient(180deg,
  #0ea5e9 0%,
  #0284c7 20%,
  #0369a1 40%,
  #075985 60%,
  #0c4a6e 80%,
  #082f49 100%)`;

// ===== FISH SCHOOL — 使用 Canvas 绘制，确保绝对可见 =====
function FishSwarm() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // Fish data
    interface FishData {
      x: number;
      y: number;
      size: number;
      speed: number;
      color: string;
      dir: number;     // 1=right, -1=left
      tailPhase: number;
      yOffset: number; // vertical oscillation
    }

    const fishColors = [
      '#fcd34d', // amber/gold
      '#fb923c', // orange
      '#f472b6', // pink
      '#38bdf8', // sky blue
      '#34d399', // emerald
      '#c084fc', // purple
      '#f87171', // red coral
      '#fbbf24', // yellow
    ];

    const fishes: FishData[] = Array.from({ length: 14 }, (_, i) => ({
      x: i % 2 === 0 ? Math.random() * -200 : canvas.width + Math.random() * 200,
      y: 30 + Math.random() * (canvas.height * 0.6),
      size: 16 + Math.random() * 18,       // 16-34px — 明显可见
      speed: 0.4 + Math.random() * 0.8,    // 0.4-1.2 px/frame
      color: fishColors[i % fishColors.length],
      dir: i % 2 === 0 ? 1 : -1,
      tailPhase: Math.random() * Math.PI * 2,
      yOffset: 15 + Math.random() * 25,     // 上下浮动幅度
    }));

    function drawFish(f: FishData) {
      ctx.save();
      ctx.translate(f.x, f.y);
      if (f.dir < 0) ctx.scale(-1, 1);

      // Tail wagging
      f.tailPhase += 0.12;
      const tailWag = Math.sin(f.tailPhase) * 5;

      // Body shadow
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;

      // Fish body (ellipse)
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, f.size * 0.55, f.size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail fin
      ctx.beginPath();
      ctx.moveTo(-f.size * 0.45, 0);
      ctx.lineTo(-f.size * 0.72, -f.size * 0.22 + tailWag);
      ctx.lineTo(-f.size * 0.68, 0);
      ctx.lineTo(-f.size * 0.72, f.size * 0.22 + tailWag);
      ctx.closePath();
      ctx.fill();

      // Dorsal fin
      ctx.fillStyle = f.color;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(-f.size * 0.1, -f.size * 0.28);
      ctx.quadraticCurveTo(f.size * 0.05, -f.size * 0.45, f.size * 0.2, -f.size * 0.26);
      ctx.fill();

      // Pectoral fin
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(f.size * 0.05, f.size * 0.12, f.size * 0.12, f.size * 0.06, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(f.size * 0.28, -f.size * 0.04, f.size * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(f.size * 0.3, -f.size * 0.03, f.size * 0.045, 0, Math.PI * 2);
      ctx.fill();

      // Highlight on body
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.ellipse(f.size * 0.05, -f.size * 0.1, f.size * 0.2, f.size * 0.1, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      fishes.forEach((f, i) => {
        // Move
        f.x += f.speed * f.dir;

        // Gentle vertical sine wave
        const time = Date.now() * 0.001 + i;
        f.y += Math.sin(time * 0.8) * 0.3;

        // Wrap around
        if (f.dir > 0 && f.x > canvas.width + 50) {
          f.x = -50;
          f.y = 30 + Math.random() * (canvas.height * 0.6);
        }
        if (f.dir < 0 && f.x < -50) {
          f.x = canvas.width + 50;
          f.y = 30 + Math.random() * (canvas.height * 0.6);
        }

        drawFish(f);
      });

      animId = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ===== BEAUTIFUL JELLYFISH — 半透明发光体 + 飘逸触须 =====
interface JellyfishData {
  id: number;
  x: string;   // percentage
  y: string;   // percentage
  size: number;
  hue: number; // color hue for variety
  delay: number;
}

function JellyfishV2({ jf }: { jf: JellyfishData }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: jf.x,
        top: jf.y,
        width: jf.size,
        height: jf.size * 1.3,
        animation: `jelly-drift-v2 ${7 + jf.id}s ease-in-out infinite`,
        animationDelay: `${jf.delay}s`,
      }}
    >
      <svg viewBox="0 0 60 78" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
        filter: 'drop-shadow(0 0 12px hsla(' + jf.hue + ', 70%, 65%, 0.4))',
        width: '100%',
        height: '100%',
      }}>
        {/* Outer glow */}
        <ellipse cx="30" cy="24" rx="26" ry="22" fill={`hsla(${jf.hue}, 70%, 70%, 0.08)`} />
        
        {/* Bell dome — main body */}
        <path d="M4 26 C4 8, 56 8, 56 26 C54 32, 36 34, 30 34 C24 34, 6 32, 4 26Z"
              fill={`url(#jellyBell-${jf.id})`}
              stroke={`hsla(${jf.hue}, 60%, 80%, 0.3)`}
              strokeWidth="0.8"
              className="jelly-bell-v2"
        />

        {/* Inner bell highlight */}
        <path d="M10 24 C10 12, 50 12, 50 24 C48 28, 36 29, 30 29 C24 29, 12 28, 10 24Z"
              fill={`hsla(${jf.hue}, 50%, 90%, 0.15)`}
        />

        {/* Tentacles — long flowing curves */}
        {[14, 23, 30, 37, 46].map((tx, ti) => {
          const swayDir = ti % 2 === 0 ? 1 : -1;
          const length = 28 + ti * 4 + Math.sin(ti) * 6;
          const cp1x = tx + swayDir * (6 + ti * 1.5);
          const cp1y = 46 + ti * 2;
          const cp2x = tx + swayDir * (4 + ti);
          const cp2y = 58 + ti * 3;
          const endX = tx + swayDir * (2 + ti * 0.8);
          const endY = 44 + length;
          
          return (
            <path
              key={ti}
              d={`M ${tx} 34 Q ${cp1x} ${cp1y}, ${cp2x} ${cp2y} T ${endX} ${endY}`}
              stroke={`hsla(${jf.hue + ti * 8}, 65%, 75%, ${0.4 + ti * 0.07})`}
              strokeWidth={1.2 + ti * 0.15}
              strokeLinecap="round"
              fill="none"
              className={`jelly-tentacle-v2-${ti}`}
              style={{ animationDelay: `${ti * 0.3 + jf.delay * 0.5}s` }}
            />
          );
        })}

        {/* Oral arms — shorter, frilly tentacles in center */}
        {[21, 27, 33, 39].map((tx, ti) => (
          <path
            key={'oa' + ti}
            d={`M ${tx} 33 Q ${tx + (ti % 2 === 0 ? 3 : -3)} 42, ${tx + (ti % 3 === 0 ? 1 : -1)} 52`}
            stroke={`hsla(${jf.hue}, 55%, 85%, ${0.25 + ti * 0.05})`}
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
        ))}

        {/* Bell top rim highlight */}
        <ellipse cx="30" cy="11" rx="18" ry="4" fill={`hsla(${jf.hue}, 60%, 95%, 0.2)`} stroke={`hsla(${jf.hue}, 60%, 85%, 0.25)`} strokeWidth="0.5" />

        {/* Gradient definitions */}
        <defs>
          <radialGradient id={`jellyBell-${jf.id}`} cx="48%" cy="35%" r="60%">
            <stop offset="0%" stopColor={`hsla(${jf.hue}, 75%, 82%, 0.55)`} />
            <stop offset="55%" stopColor={`hsla(${jf.hue + 20}, 65%, 65%, 0.35)`} />
            <stop offset="100%" stopColor={`hsla(${jf.hue + 40}, 55%, 55%, 0.15)`} />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

// ===== SEA SPARKLES / PLANKTON — 小亮点粒子让海洋有生气 =====
function SeaSparkles() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 5,
    })));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full" style={{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          background: 'white',
          boxShadow: '0 0 4px rgba(255,255,255,0.6)',
          animation: `sparkle-fade ${p.duration}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  );
}

// ===== CAUSTIC LIGHTS — 海底焦散光纹（水面折射的光斑效果） =====
function CausticLights() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none overflow-hidden opacity-[0.15]"
         style={{ mixBlendMode: 'screen' }}>
      {/* Animated caustic pattern using overlapping ellipses */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
               style={{
                 left: `${i * 13 + Math.random() * 5}%`,
                 bottom: `${Math.random() * 40}px`,
                 width: `${60 + Math.random() * 80}px`,
                 height: `${20 + Math.random() * 25px`,
                 borderRadius: '50%',
                 filter: 'blur(8px)',
                 animation: `caustic-move ${3 + Math.random() * 3}s ease-in-out infinite alternate`,
                 animationDelay: `${i * 0.4}s`,
               }}
          />
        ))}
      </div>
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
  const jellyfishList: JellyfishData[] = [
    { id: 0, x: '8%',  y: '20%', size: 52,  hue: 320, delay: 0 },    // pink/magenta
    { id: 1, x: '78%', y: '12%', size: 62, hue: 280, delay: 1.5 },   // purple
    { id: 2, x: '55%', y: '58%', size: 42, hue: 200, delay: 3 },     // cyan-blue
    { id: 3, x: '22%', y: '62%', size: 36, hue: 340, delay: 4.5 },   // hot pink (small)
  ];

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
      {/* === LAYER 1: Background ambient glow orbs === */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[400px] h-[250px] rounded-full blur-[100px]"
             style={{ backgroundColor: 'rgba(56,189,248,0.15)' }} />
        <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[200px] rounded-full blur-[90px]"
             style={{ backgroundColor: 'rgba(167,139,250,0.1)' }} />
        <div className="absolute top-[50%] left-[50%] w-[500px] h-[300px] rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"
             style={{ backgroundColor: 'rgba(6,182,212,0.08)' }} />
      </div>

      {/* === LAYER 2: Sea sparkles (ambient particles) === */}
      <SeaSparkles />

      {/* === LAYER 3: Fish swarm (Canvas) === */}
      <FishSwarm />

      {/* === LAYER 4: Jellyfish (SVG, above fish) === */}
      {jellyfishList.map(jf => <JellyfishV2 key={jf.id} jf={jf} />)}

      {/* === LAYER 5: Caustic lights (bottom) === */}
      <CausticLights />

      {/* === CONTENT (top layer) === */}
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

      {/* ===== ALL ANIMATIONS ===== */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          section * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }

        /* Jellyfish drift */
        @keyframes jelly-drift-v2 {
          0%, 100% { transform: translateY(0) translateX(0) rotate(-2deg); }
          25%      { transform: translateY(-16px) translateX(8px) rotate(1.5deg); }
          50%      { transform: translateY(-6px) translateX(-5px) rotate(-1deg); }
          75%      { transform: translateY(-20px) translateX(6px) rotate(2deg); }
        }

        /* Jellyfish bell pulse */
        .jelly-bell-v2 {
          transform-origin: center bottom;
          animation: jelly-pulse-v2 3s ease-in-out infinite;
        }
        @keyframes jelly-pulse-v2 {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          50%      { transform: scaleY(0.93) scaleX(1.04); }
        }

        /* Jellyfish tentacle sway */
        ${[0,1,2,3,4].map(i => `
          .jelly-tentacle-v2-${i} {
            animation: tentacle-sway-v2 ${2.2 + i * 0.4}s ease-in-out infinite alternate;
            transform-origin: 0 34px;
          }
        `).join('')}

        @keyframes tentacle-sway-v2 {
          0%   { transform: rotate(0deg) translateX(0); }
          100% { transform: rotate(${Math.random() > 0.5 ? '' : '-'}${6 + Math.random() * 8}deg) translateX(${3 + Math.random() * 5}px); }
        }

        /* Sea sparkle fade */
        @keyframes sparkle-fade {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%      { opacity: 0.9; transform: scale(1.2); }
        }

        /* Caustic light movement */
        @keyframes caustic-move {
          0%   { transform: translateX(0) scaleX(1); opacity: 0.4; }
          100% { transform: translateX(${15 + Math.random() * 20}px) scaleX(1.15); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}
