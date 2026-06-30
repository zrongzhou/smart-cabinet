'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v185 — 极光流彩 · 暖冷碰撞 · 光影深度
//
// v184反馈："有点感觉了，还差点意思"
// 问题诊断：
//   ❌ 颜色太单一（只有蓝紫青冷色调）
//   ❌ 整体偏暗，缺乏"惊艳感"
//   ❌ 视觉层次不够丰富
//
// v185 改进方向：
//   ✅ 暖冷色碰撞 — 粉/品红/玫红 vs 蓝/靛/青
//   ✅ 大幅提亮 — 底色从 6%~20% 提升到 12%~28%
//   ✅ 舞台光束 — 斜向光线扫过，增加戏剧性
//   ✅ 少量精致星光 — 不是密密麻麻小白点，而是几颗明亮星星
//   ✅ 更强的色彩饱和度和对比度
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
      style={{ minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Layer 0: Canvas 动态流彩背景 */}
      <CanvasAurora />

      {/* Layer 1: 舞台光束 */}
      <LightBeams />

      {/* Layer 2: 精致星光点缀 */}
      <StarSparks />

      {/* Layer 3: 呼吸光斑层 */}
      <BreathingOrbs />

      {/* Layer 4: 极光涌动带 */}
      <AuroraWaves />

      {/* Layer 5: 底部过渡到白色内容区 */}
      <div className="absolute bottom-0 left-0 right-0 h-[110px] pointer-events-none z-[2]"
        style={{
          background: 'linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0.5) 55%, transparent 100%)',
        }}
        aria-hidden="true" />

      {/* 内容区 */}
      <motion.div className="relative z-10 text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        {icon && (
          <motion.div className="flex justify-center mb-5"
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="w-[58px] h-[58px] rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.28)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.22)',
              }}
            >{icon}</div>
          </motion.div>
        )}

        {children}

        {title && (
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight leading-tight mb-5"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.15)' }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >{title}</motion.h1>
        )}

        {(description || subtitle) && (
          <motion.p
            className="text-base sm:text-lg text-white/88 max-w-xl mx-auto leading-relaxed"
            style={{ textShadow: '0 1px 12px rgba(0,0,0,0.1)' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >{description || subtitle}</motion.p>
        )}
      </motion.div>

      <style>{keyframes}</style>
    </section>
  );
}

// ============================================================
// Layer 0: Canvas 动态极光流彩 — 暖冷碰撞 + 高亮度
// ============================================================
function CanvasAurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let time = 0;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    const draw = () => {
      time += 0.004;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // ====== 基础底色 — 大幅提亮 ======
      const baseGrad = ctx.createLinearGradient(0, 0, w * 0.4, h);
      const hueShift = Math.sin(time * 0.35) * 15;
      // 从深靛蓝到中蓝，整体亮度提升50%
      baseGrad.addColorStop(0, `hsl(${230 + hueShift}, 52%, 12%)`);
      baseGrad.addColorStop(0.35, `hsl(${225 + hueShift}, 58%, 18%)`);
      baseGrad.addColorStop(0.65, `hsl(${215 + hueShift}, 60%, 24%)`);
      baseGrad.addColorStop(1, `hsl(${208 + hueShift}, 55%, 28%)`);
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // ====== 主光斑1: 右上 粉紫/品红区域 (暖色) ======
      const o1x = w * (0.72 + Math.sin(time * 0.45) * 0.1);
      const o1y = h * (0.08 + Math.cos(time * 0.32) * 0.08);
      const o1r = Math.max(w, h) * 0.7;
      const g1 = ctx.createRadialGradient(o1x, o1y, 0, o1x, o1y, o1r);
      const h1 = (280 + Math.sin(time * 0.55) * 25); // 品红↔玫红↔粉
      g1.addColorStop(0, `hsla(${h1}, 75%, 65%, ${0.30 + Math.sin(time * 0.7) * 0.08})`);
      g1.addColorStop(0.35, `hsla(${h1 - 15}, 65%, 55%, ${0.20 + Math.cos(time * 0.6) * 0.05})`);
      g1.addColorStop(0.7, `hsla(${h1 - 30}, 55%, 45%, ${0.08})`);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // ====== 主光斑2: 左侧 亮蓝色 (冷色) ======
      const o2x = w * (0.1 + Math.cos(time * 0.38) * 0.08);
      const o2y = h * (0.5 + Math.sin(time * 0.42) * 0.07);
      const o2r = Math.max(w, h) * 0.6;
      const g2 = ctx.createRadialGradient(o2x, o2y, 0, o2x, o2y, o2r);
      const h2 = (212 + Math.sin(time * 0.48 + 1) * 20); // 天蓝↔钴蓝
      g2.addColorStop(0, `hsla(${h2}, 82%, 60%, ${0.26 + Math.sin(time * 0.8) * 0.07})`);
      g2.addColorStop(0.4, `hsla(${h2 + 10}, 72%, 50%, ${0.16 + Math.cos(time * 0.65) * 0.04})`);
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // ====== 主光斑3: 中下 青绿/湖蓝色 ======
      const o3x = w * (0.55 + Math.sin(time * 0.35) * 0.1);
      const o3y = h * (0.75 + Math.cos(time * 0.38) * 0.06);
      const o3r = Math.max(w, h) * 0.5;
      const g3 = ctx.createRadialGradient(o3x, o3y, 0, o3x, o3y, o3r);
      const h3 = (185 + Math.sin(time * 0.5 + 2) * 18); // 青↔翠绿
      g3.addColorStop(0, `hsla(${h3}, 72%, 56%, ${0.22 + Math.sin(time * 0.72) * 0.06})`);
      g3.addColorStop(0.5, `hsla(${h3 + 8}, 62%, 46%, ${0.12 + Math.cos(time * 0.58) * 0.03})`);
      g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w, h);

      // ====== 暖光斑4: 左上 金/琥珀色 (冷暖碰撞关键) ======
      const o4x = w * (0.05 + Math.cos(time * 0.3) * 0.06);
      const o4y = h * (0.12 + Math.sin(time * 0.35) * 0.05);
      const o4r = Math.max(w, h) * 0.4;
      const g4 = ctx.createRadialGradient(o4x, o4y, 0, o4x, o4y, o4r);
      const h4 = (42 + Math.sin(time * 0.42) * 15); // 金↔琥珀↔橙
      g4.addColorStop(0, `hsla(${h4}, 85%, 62%, ${0.12 + Math.sin(time * 0.55) * 0.05})`);
      g4.addColorStop(0.5, `hsla(${h4 + 10}, 75%, 52%, ${0.05})`);
      g4.addColorStop(1, 'transparent');
      ctx.fillStyle = g4;
      ctx.fillRect(0, 0, w, h);

      // ====== 暖光斑5: 右侧偏下 玫瑰/珊瑚色 ======
      const o5x = w * (0.88 + Math.sin(time * 0.33) * 0.05);
      const o5y = h * (0.62 + Math.cos(time * 0.4) * 0.06);
      const o5r = Math.max(w, h) * 0.35;
      const g5 = ctx.createRadialGradient(o5x, o5y, 0, o5x, o5y, o5r);
      const h5 = (340 + Math.sin(time * 0.46) * 18); // 玫瑰↔珊瑚
      g5.addColorStop(0, `hsla(${h5}, 70%, 58%, ${0.10 + Math.sin(time * 0.6) * 0.04})`);
      g5.addColorStop(1, 'transparent');
      ctx.fillStyle = g5;
      ctx.fillRect(0, 0, w, h);

      // ====== 中央高光条 — 水平光泽 ======
      const stripY = h * (0.4 + Math.sin(time * 0.28) * 0.12);
      const stripGrad = ctx.createLinearGradient(0, stripY - 40, 0, stripY + 40);
      stripGrad.addColorStop(0, 'transparent');
      stripGrad.addColorStop(0.5, `rgba(210, 225, 255, ${0.06 + Math.sin(time * 0.5) * 0.025})`);
      stripGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = stripGrad;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ============================================================
// Layer 1: 舞台光束 — 斜向光线增加戏剧性
// ============================================================
function LightBeams() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 主光束：左上→右下，淡金色 */}
      <div className="beam" style={{
        left: '-10%', top: '-5%',
        width: '70%', height: '200%',
        background: [
          'linear-gradient(105deg,',
          'rgba(255,220,150,0.07) 0%,',
          'rgba(255,200,120,0.04) 30%,',
          'transparent 60%)'
        ].join(' '),
        transform: 'rotate(-12deg)',
        animation: 'beam-sweep-a 12s ease-in-out infinite alternate',
      }} />

      {/* 副光束：右上→左下，淡蓝紫色 */}
      <div className="beam" style={{
        right: '-15%', top: '-10%',
        width: '60%', height: '180%',
        background: [
          'linear-gradient(285deg,',
          'rgba(180,160,255,0.06) 0%,',
          'rgba(147,130,255,0.03) 35%,',
          'transparent 60%)'
        ].join(' '),
        transform: 'rotate(8deg)',
        animation: 'beam-sweep-b 16s ease-in-out infinite alternate-reverse',
        animationDelay: '3s',
      }} />
    </div>
  );
}

// ============================================================
// Layer 2: 精致星光 — 少量明亮星点（不是密集小白点）
// ============================================================
function StarSparks() {
  // 固定位置的大星星，每颗独立闪烁
  const stars = [
    { x: '18%', y: '22%', size: 3, delay: 0 },
    { x: '78%', y: '15%', size: 2.5, delay: 1.2 },
    { x: '62%', y: '38%', size: 2, delay: 2.5 },
    { x: '25%', y: '68%', size: 2.2, delay: 0.8 },
    { x: '88%', y: '55%', size: 1.8, delay: 3.1 },
    { x: '42%', y: '18%', size: 1.6, delay: 1.8 },
    { x: '8%', y: '42%', size: 2, delay: 0.5 },
    { x: '92%', y: '78%', size: 1.5, delay: 2.2 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map((s, i) => (
        <div key={i} className="star-spark" style={{
          left: s.x,
          top: s.y,
          width: s.size,
          height: s.size,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(200,220,255,0.6) 40%, transparent 70%)',
          boxShadow: `0 0 ${s.size * 3}px rgba(180,200,255,${0.3 + s.size * 0.05}), 0 0 ${s.size * 6}px rgba(147,153,255,0.15)`,
          animation: [`spark-twinkle ${(3 + s.delay % 2)}s ease-in-out infinite`, `spark-float ${(6 + i)}s ease-in-out infinite alternate`].join(', '),
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  );
}

// ============================================================
// Layer 3: 呼吸光斑 — CSS 动画驱动
// ============================================================
function BreathingOrbs() {
  const orbs = [
    { x: '70%', y: '12%', s: 400, c: 'rgba(236,72,153,0.18)', b: 110, anim: 'orb-breathe-a' },
    { x: '8%',  y: '50%', s: 350, c: 'rgba(59,130,246,0.16)', b: 90,  anim: 'orb-breathe-b' },
    { x: '55%', y: '75%', s: 300, c: 'rgba(34,211,238,0.14)', b: 75,  anim: 'orb-breathe-c' },
    { x: '82%', y: '48%', s: 240, c: 'rgba(167,139,250,0.13)', b: 65,  anim: 'orb-breathe-a' },
    { x: '28%', y: '20%', s: 200, c: 'rgba(251,191,36,0.10)', b: 55,  anim: 'orb-breathe-d' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {orbs.map((o, i) => (
        <div key={i} className="aur-orb" style={{
          left: o.x,
          top: o.y,
          width: o.s,
          height: o.s,
          background: ['radial-gradient(circle,', o.c, ', transparent 70%)'].join(' '),
          filter: ['blur(', o.b, 'px)'].join(''),
          animation: [o.anim, ' ', (14 + i * 4), 's ease-in-out infinite alternate'].join(''),
          animationDelay: [(i * 1.5), 's'].join(''),
        }} />
      ))}
    </div>
  );
}

// ============================================================
// Layer 4: 极光涌动带 — 更宽更亮更丰富
// ============================================================
function AuroraWaves() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">

      {/* 主极光波：横贯中上部，粉→紫→蓝渐变 */}
      <div className="aur-wave" style={{
        left: '-5%', top: '12%',
        width: '110%', height: '160px',
        background: [
          'linear-gradient(95deg,',
          'transparent 0%,',
          'rgba(236,72,153,0.16) 8%',     // 粉
          'rgba(168,85,247,0.26) 25%',    // 紫
          'rgba(139,92,246,0.28) 40%',    // 靛紫
          'rgba(99,102,241,0.24) 55%',    // 靛蓝
          'rgba(59,130,246,0.20) 70%',    // 蓝
          'rgba(34,211,238,0.14) 85%',    // 青
          'transparent 100%)'
        ].join(' '),
        filter: 'blur(40px)',
        animation: 'aur-wave-main 14s ease-in-out infinite alternate',
      }} />

      {/* 第二波：中下部，青→蓝→紫 */}
      <div className="aur-wave" style={{
        left: '-8%', top: '50%',
        width: '116%', height: '110px',
        background: [
          'linear-gradient(88deg,',
          'transparent 0%,',
          'rgba(34,211,238,0.17) 12%',   // 青
          'rgba(56,189,248,0.24) 30%',   // 天蓝
          'rgba(99,102,241,0.20) 48%',   // 靛蓝
          'rgba(167,139,250,0.15) 68%',  // 紫
          'transparent 100%)'
        ].join(' '),
        filter: 'blur(34px)',
        animation: 'aur-wave-sub 18s ease-in-out infinite alternate-reverse',
        animationDelay: '2s',
      }} />

      {/* 第三波：顶部边缘，淡金+粉 */}
      <div className="aur-wave" style={{
        left: '-3%', top: '0%',
        width: '106%', height: '70px',
        background: [
          'linear-gradient(96deg,',
          'transparent 0%,',
          'rgba(251,191,36,0.10) 15%',   // 金
          'rgba(251,146,146,0.14) 35%',  // 珊瑚
          'rgba(236,72,153,0.16) 55%',   // 粉
          'rgba(167,139,250,0.12) 75%',  // 紫
          'transparent 100%)'
        ].join(' '),
        filter: 'blur(26px)',
        animation: 'aur-wave-top 16s ease-in-out infinite alternate',
        animationDelay: '4s',
      }} />

      {/* 底部过渡光带：柔和蓝白 */}
      <div className="aur-wave" style={{
        left: '-6%', top: '76%',
        width: '112%', height: '80px',
        background: [
          'linear-gradient(90deg,',
          'transparent 0%,',
          'rgba(186,230,253,0.14) 20%',  // 浅蓝
          'rgba(167,199,251,0.16) 45%',  // 蓝
          'rgba(196,181,253,0.11) 70%',  // 淡紫
          'transparent 100%)'
        ].join(' '),
        filter: 'blur(28px)',
        animation: 'aur-wave-bot 20s ease-in-out infinite alternate-reverse',
        animationDelay: '1s',
      }}

    /></div>
  );
}

const keyframes = `
  /* ---- 光斑呼吸动画 ---- */
  @keyframes orb-breathe-a {
    0%   { transform: translate(0, 0) scale(1); opacity: 0.70; }
    33%  { transform: translate(14px, -10px) scale(1.15); opacity: 1; }
    66%  { transform: translate(-8px, 8px) scale(0.93); opacity: 0.78; }
    100% { transform: translate(10px, -5px) scale(1.08); opacity: 0.88; }
  }
  @keyframes orb-breathe-b {
    0%   { transform: translate(0, 0) scale(1); opacity: 0.62; }
    40%  { transform: translate(-12px, 12px) scale(1.18); opacity: 0.94; }
    75%  { transform: translate(10px, -8px) scale(0.91); opacity: 0.70; }
    100% { transform: translate(-8px, 5px) scale(1.10); opacity: 0.84; }
  }
  @keyframes orb-breathe-c {
    0%   { transform: translate(0, 0) scale(1); opacity: 0.55; }
    50%  { transform: translate(16px, -6px) scale(1.20); opacity: 0.88; }
    100% { transform: translate(-10px, 10px) scale(0.95); opacity: 0.64; }
  }
  @keyframes orb-breathe-d {
    0%   { transform: translate(0, 0) scale(1); opacity: 0.48; }
    45%  { transform: translate(10px, -8px) scale(1.14); opacity: 0.80; }
    100% { transform: translate(-6px, 6px) scale(0.96); opacity: 0.58; }
  }

  /* ---- 光束扫描动画 ---- */
  @keyframes beam-sweep-a {
    0%   { opacity: 0.5; transform: rotate(-12deg) translateX(-20px); }
    50%  { opacity: 1; transform: rotate(-10deg) translateX(30px); }
    100% { opacity: 0.6; transform: rotate(-13deg) translateX(10px); }
  }
  @keyframes beam-sweep-b {
    0%   { opacity: 0.4; transform: rotate(8deg) translateX(15px); }
    50%  { opacity: 0.9; transform: rotate(10deg) translateX(-25px); }
    100% { opacity: 0.5; transform: rotate(7deg) translateX(-10px); }
  }

  /* ---- 星光闪烁动画 ---- */
  @keyframes spark-twinkle {
    0%, 100% { opacity: 0.3; transform: scale(0.7); }
    50%      { opacity: 1; transform: scale(1.3); }
  }
  @keyframes spark-float {
    0%   { transform: translateY(0); }
    100% { transform: translateY(-8px); }
  }

  /* ---- 极光波浪动画 ---- */
  @keyframes aur-wave-main {
    0%   { transform: translateX(0) scaleX(1); opacity: 0.80; }
    30%  { transform: translateX(30px) scaleX(1.04); opacity: 1; }
    65%  { transform: translateX(-15px) scaleX(0.97); opacity: 0.86; }
    100% { transform: translateX(20px) scaleX(1.02); opacity: 0.93; }
  }
  @keyframes aur-wave-sub {
    0%   { transform: translateX(0) scaleX(1); opacity: 0.70; }
    35%  { transform: translateX(-25px) scaleX(1.03); opacity: 0.95; }
    70%  { transform: translateX(15px) scaleX(0.98); opacity: 0.78; }
    100% { transform: translateX(-10px) scaleX(1.01); opacity: 0.88; }
  }
  @keyframes aur-wave-top {
    0%   { transform: translateX(0); opacity: 0.65; }
    50%  { transform: translateX(22px); opacity: 0.95; }
    100% { transform: translateX(-12px); opacity: 0.72; }
  }
  @keyframes aur-wave-bot {
    0%   { transform: translateX(0); opacity: 0.58; }
    45%  { transform: translateX(-18px); opacity: 0.86; }
    100% { transform: translateX(12px); opacity: 0.66; }
  }

  /* ---- 公共类 ---- */
  .aur-wave {
    position: absolute;
    border-radius: 50%;
  }
  .aur-orb {
    position: absolute;
    border-radius: 50%;
  }
  .beam {
    position: absolute;
    pointer-events: none;
  }
  .star-spark {
    position: absolute;
    pointer-events: none;
  }
`;
