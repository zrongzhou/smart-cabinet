'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v187 — 极光爆发 · 色彩碰撞 · 动态可感知
//
// v186 反馈："好了点，还是差点意思，特别是颜色和动态这块"
// 根因诊断：
//   ❌ 所有渐变透明度太低(0.12~0.32) — 肉眼看不出颜色
//   ❌ SVG blur太大(35px) — 颜色被模糊成均匀色块
//   ❌ Canvas底色太亮(12%~28%) — 和彩色光斑没对比度
//   ❌ 动画位移太小(10~22px) — 完全感知不到在动
//
// v187 策略反转：从"含蓄优雅"→"大胆惊艳"
//   ✅ 底色压暗到8%~18%，让色彩有呼吸空间
//   ✅ 彩色光斑opacity提升到0.45~0.7，饱和度拉满
//   ✅ 飘带blur降到20px，渐变opacity 0.35~0.55
//   ✅ 动画位移放大3倍(30~60px)，加旋转/缩放变化
//   ✅ 新增CSS动态极光层——肉眼可见的颜色流动
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
      {/* Layer 0: Canvas 深邃暗底 + 高饱和光斑 */}
      <CanvasAurora />

      {/* Layer 1: CSS 动态极光层 — 最显眼的颜色流动 */}
      <AuroraField />

      {/* Layer 2: SVG 曲线飘带 — 降低blur + 提亮 */}
      <FlowingRibbons />

      {/* Layer 3: 浮动光球 — 可见的大光斑 */}
      <FloatingOrbs />

      {/* Layer 4: 底部过渡 */}
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
// Layer 0: Canvas — 压暗底色 + 高饱和大光斑
// 关键改变：底色压暗让色彩跳出来，光斑更大更亮更饱和
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
      time += 0.005;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // === 底色：压暗！8%~16%亮度，深蓝黑色 ===
      const baseGrad = ctx.createLinearGradient(0, 0, w * 0.6, h);
      const hueShift = Math.sin(time * 0.3) * 12;
      baseGrad.addColorStop(0, `hsl(${232 + hueShift}, 48%, 8%)`);
      baseGrad.addColorStop(0.3, `hsl(${228 + hueShift}, 52%, 11%)`);
      baseGrad.addColorStop(0.6, `hsl(${218 + hueShift}, 56%, 14%)`);
      baseGrad.addColorStop(1, `hsl(${210 + hueShift}, 50%, 17%)`);
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // === 光斑1: 右上 粉紫（主色）— 大而亮 ===
      const g1 = ctx.createRadialGradient(
        w * (0.72 + Math.sin(time * 0.42) * 0.08),
        h * (0.1 + Math.cos(time * 0.3) * 0.06), 0,
        w * (0.72 + Math.sin(time * 0.42) * 0.08),
        h * (0.1 + Math.cos(time * 0.3) * 0.06), Math.max(w, h) * 0.65
      );
      const h1 = (285 + Math.sin(time * 0.5) * 30);
      g1.addColorStop(0, `hsla(${h1}, 82%, 68%, ${0.50 + Math.sin(time * 0.6) * 0.12})`);
      g1.addColorStop(0.3, `hsla(${h1 - 15}, 72%, 58%, ${0.35 + Math.cos(time * 0.5) * 0.08})`);
      g1.addColorStop(0.7, `hsla(${h1 - 30}, 60%, 48%, ${0.15 + Math.sin(time * 0.4) * 0.04})`);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, w, h);

      // === 光斑2: 左侧 亮蓝（次主色）===
      const g2 = ctx.createRadialGradient(
        w * (0.08 + Math.cos(time * 0.36) * 0.06),
        h * (0.45 + Math.sin(time * 0.4) * 0.08), 0,
        w * (0.08 + Math.cos(time * 0.36) * 0.06),
        h * (0.45 + Math.sin(time * 0.4) * 0.08), Math.max(w, h) * 0.55
      );
      const h2 = (210 + Math.sin(time * 0.45 + 1) * 25);
      g2.addColorStop(0, `hsla(${h2}, 88%, 64%, ${0.44 + Math.sin(time * 0.7) * 0.10})`);
      g2.addColorStop(0.35, `hsla(${h2 + 10}, 78%, 54%, ${0.28 + Math.cos(time * 0.55) * 0.06})`);
      g2.addColorStop(0.75, `hsla(${h2 + 20}, 65%, 44%, ${0.10 + Math.sin(time * 0.4) * 0.03})`);
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);

      // === 光斑3: 中下 青绿（冷暖对比）===
      const g3 = ctx.createRadialGradient(
        w * (0.56 + Math.sin(time * 0.32) * 0.08),
        h * (0.78 + Math.cos(time * 0.35) * 0.05), 0,
        w * (0.56 + Math.sin(time * 0.32) * 0.08),
        h * (0.78 + Math.cos(time * 0.35) * 0.05), Math.max(w, h) * 0.48
      );
      const h3 = (178 + Math.sin(time * 0.48 + 2) * 22);
      g3.addColorStop(0, `hsla(${h3}, 76%, 58%, ${0.38 + Math.sin(time * 0.65) * 0.09})`);
      g3.addColorStop(0.4, `hsla(${h3 + 10}, 66%, 48%, ${0.22 + Math.cos(time * 0.5) * 0.05})`);
      g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3; ctx.fillRect(0, 0, w, h);

      // === 光斑4: 左上 暖金橙（点睛暖色）===
      const g4 = ctx.createRadialGradient(
        w * (0.06 + Math.cos(time * 0.28) * 0.05),
        h * (0.1 + Math.sin(time * 0.32) * 0.04), 0,
        w * (0.06 + Math.cos(time * 0.28) * 0.05),
        h * (0.1 + Math.sin(time * 0.32) * 0.04), Math.max(w, h) * 0.38
      );
      g4.addColorStop(0, `hsla(${38 + Math.sin(time * 0.4) * 18}, 92%, 62%, ${0.22 + Math.sin(time * 0.5) * 0.07})`);
      g4.addColorStop(0.5, `hsla(${45 + Math.sin(time * 0.35) * 12}, 80%, 52%, ${0.10 + Math.cos(time * 0.4) * 0.03})`);
      g4.addColorStop(1, 'transparent');
      ctx.fillStyle = g4; ctx.fillRect(0, 0, w, h);

      // === 光斑5: 右侧中 玫红（增加色彩层次）===
      const g5 = ctx.createRadialGradient(
        w * (0.85 + Math.cos(time * 0.38) * 0.05),
        h * (0.55 + Math.sin(time * 0.33) * 0.06), 0,
        w * (0.85 + Math.cos(time * 0.38) * 0.05),
        h * (0.55 + Math.sin(time * 0.33) * 0.06), Math.max(w, h) * 0.4
      );
      g5.addColorStop(0, `hsla(${330 + Math.sin(time * 0.45) * 20}, 80%, 60%, ${0.28 + Math.sin(time * 0.55) * 0.08})`);
      g5.addColorStop(0.5, `hsla(${320 + Math.sin(time * 0.4) * 15}, 70%, 50%, ${0.14 + Math.cos(time * 0.45) * 0.04})`);
      g5.addColorStop(1, 'transparent');
      ctx.fillStyle = g5; ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" aria-hidden="true"
      style={{ width: '100%', height: '100%' }} />
  );
}

// ============================================================
// Layer 1: AuroraField — CSS动态极光层
// 这是整个效果中最"抢眼"的层：大面积颜色缓慢流动
// 用多个超大渐变圆 + CSS animation 实现可见的颜色变化
// ============================================================
function AuroraField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 主极光带：横跨画面的大型渐变色条，明显漂移 */}
      <div className="aurora-wave aw-main" />

      {/* 第二极光带：反向流动，不同色调 */}
      <div className="aurora-wave aw-sub" />

      {/* 第三极光带：顶部边缘扫过 */}
      <div className="aurora-wave aw-top" />

      {/* 第四极光带：底部过渡 */}
      <div className="aurora-wave aw-bot" />
    </div>
  );
}

// ============================================================
// Layer 2: SVG 流动飘带 — 降低blur + 大幅提亮
// ============================================================
function FlowingRibbons() {
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-hidden w-full h-full"
      aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1440 500">
      <defs>
        {/* 降低blur等级让颜色清晰可见 */}
        <filter id="rb-heavy"><feGaussianBlur stdDeviation="18" /></filter>
        <filter id="rb-med"><feGaussianBlur stdDeviation="12" /></filter>
        <filter id="rb-light"><feGaussianBlur stdDeviation="8" /></filter>

        {/* 主飘带：粉→紫→靛 — 高透明度！ */}
        <linearGradient id="rg-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(236,72,153,0.50)" />
          <stop offset="22%" stopColor="rgba(192,38,211,0.55)" />
          <stop offset="48%" stopColor="rgba(139,92,246,0.48)" />
          <stop offset="72%" stopColor="rgba(99,102,241,0.40)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.25)" />
        </linearGradient>

        {/* 副飘带：青→蓝→紫 */}
        <linearGradient id="rg-b" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.42)" />
          <stop offset="30%" stopColor="rgba(56,189,248,0.48)" />
          <stop offset="60%" stopColor="rgba(99,102,241,0.38)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0.28)" />
        </linearGradient>

        {/* 第三飘带：金→珊瑚→玫红（暖色冲击）*/}
        <linearGradient id="rg-c" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.28)" />
          <stop offset="35%" stopColor="rgba(251,146,146,0.35)" />
          <stop offset="65%" stopColor="rgba(244,114,182,0.30)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* 飘带1: 主S形曲线 */}
      <path d="M -50,130 C 180,70 380,240 620,170 C 880,100 1080,290 1320,200 C 1450,155 1500,175 1500,175 L 1500,275 C 1220,340 980,190 720,270 C 480,350 220,195 0,260 Z"
        fill="url(#rg-a)" filter="url(#rb-heavy)"
        className="rib-path rib-p1" style={{ mixBlendMode: 'screen' }} />

      {/* 飘带2: 反向曲线 */}
      <path d="M 1490,310 C 1180,360 980,190 720,270 C 480,350 220,195 -20,260 L -20,330 C 260,400 560,290 820,350 C 1080,400 1280,390 1490,410 Z"
        fill="url(#rg-b)" filter="url(#rb-med)"
        className="rib-path rib-p2" style={{ mixBlendMode: 'screen' }} />

      {/* 飘带3: 顶部暖光曲线 */}
      <path d="M -30,25 C 280,-15 520,95 820,35 C 1120,-10 1340,70 1480,35 L 1480,105 C 1220,140 960,60 680,115 C 400,170 140,90 -30,115 Z"
        fill="url(#rg-c)" filter="url(#rb-light)"
        className="rib-path rib-p3" style={{ mixBlendMode: 'screen' }} />
    </svg>
  );
}

// ============================================================
// Layer 3: FloatingOrbs — 可见的大光球
// 这些是明确可见的、发光的圆形光斑
// 每个都有独立的漂移+脉动+缩放动画
// ============================================================
function FloatingOrbs() {
  const orbs = [
    { x: '18%', y: '22%', size: 160, hue: 270, css: 'orb-pink' },
    { x: '72%', y: '14%', size: 200, hue: 210, css: 'orb-blue' },
    { x: '55%', y: '62%', size: 140, hue: 185, css: 'orb-cyan' },
    { x: '12%', y: '68%', size: 120, hue: 320, css: 'orb-magenta' },
    { x: '84%', y: '58%', size: 100, hue: 45, css: 'orb-gold' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {orbs.map((o, i) => (
        <div key={i} className={`floating-orb ${o.css}`} style={{
          left: o.x,
          top: o.y,
          width: o.size,
          height: o.size,
          borderRadius: '50%',
          background: `radial-gradient(circle,
            hsla(${o.hue}, 80%, 65%, 0.35) 0%,
            hsla(${o.hue}, 70%, 55%, 0.18) 40%,
            transparent 70%)`,
          filter: 'blur(25px)',
          animationDelay: `${i * 1.2}s`,
        }} />
      ))}
    </div>
  );
}

const keyframes = `
  /* ====== AuroraField: 大型极光波 — 肉眼可见的颜色流动 ====== */
  .aurora-wave {
    position: absolute;
    border-radius: 50%;
    opacity: 0.9;
    will-change: transform, opacity;
  }

  /* 主极光：最大最亮 */
  .aw-main {
    left: -15%;
    top: 20%;
    width: 130%;
    height: 180px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(139, 92, 246, 0.30) 10%,
      rgba(192, 38, 211, 0.40) 25%,
      rgba(236, 72, 153, 0.35) 40%,
      rgba(139, 92, 246, 0.32) 55%,
      rgba(99, 102, 241, 0.28) 70%,
      rgba(59, 130, 246, 0.20) 85%,
      transparent 100%);
    filter: blur(30px);
    animation: aurora-shift-main 12s ease-in-out infinite alternate;
  }

  /* 副极光：反向流动 */
  .aw-sub {
    left: -10%;
    top: 50%;
    width: 120%;
    height: 140px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(34, 211, 238, 0.28) 10%,
      rgba(56, 189, 248, 0.36) 30%,
      rgba(99, 102, 241, 0.32) 50%,
      rgba(167, 139, 250, 0.26) 70%,
      transparent 90%);
    filter: blur(24px);
    animation: aurora-shift-sub 15s ease-in-out infinite alternate-reverse;
    animation-delay: 3s;
  }

  /* 顶部极光：轻柔扫过 */
  .aw-top {
    left: -5%;
    top: -3%;
    width: 110%;
    height: 90px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(251, 191, 36, 0.18) 20%,
      rgba(251, 146, 146, 0.25) 40%,
      rgba(236, 72, 153, 0.20) 60%,
      transparent 80%);
    filter: blur(18px);
    animation: aurora-shift-top 18s ease-in-out infinite alternate;
    animationDelay: 1.5s;
  }

  /* 底部过渡 */
  .aw-bot {
    left: 0;
    top: 72%;
    width: 100%;
    height: 120px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(56, 189, 248, 0.18) 25%,
      rgba(186, 230, 253, 0.14) 50%,
      rgba(167, 199, 251, 0.10) 75%,
      transparent 100%);
    filter: blur(20px);
    animation: aurora-shift-bot 20s ease-in-out infinite alternate-reverse;
    animationDelay: 4s;
  }

  @keyframes aurora-shift-main {
    0%   { transform: translateX(-30px) translateY(0) scaleX(1); opacity: 0.85; }
    33%  { transform: translateX(40px) translateY(-12px) scaleX(1.06); opacity: 1; }
    66%  { transform: translateX(-20px) translateY(8px) scaleX(0.97); opacity: 0.9; }
    100% { transform: translateX(35px) translateY(-5px) scaleX(1.03); opacity: 0.95; }
  }

  @keyframes aurora-shift-sub {
    0%   { transform: translateX(25px) translateY(5px); opacity: 0.8; }
    40%  { transform: translateX(-40px) translateY(-10px); opacity: 1; }
    75%  { transform: translateX(20px) translateY(8px); opacity: 0.85; }
    100% { transform: translateX(-25px) translateY(-3px); opacity: 0.9; }
  }

  @keyframes aurora-shift-top {
    0%   { transform: translateX(0) translateY(5px); opacity: 0.7; }
    50%  { transform: translateX(50px) translateY(0); opacity: 1; }
    100% { transform: translateX(20px) translateY(8px); opacity: 0.8; }
  }

  @keyframes aurora-shift-bot {
    0%   { transform: translateX(-20px) translateY(0); opacity: 0.75; }
    50%  { transform: translateX(30px) translateY(5px); opacity: 0.95; }
    100% { transform: translateX(10px) translateY(-3px); opacity: 0.8; }
  }

  /* ====== SVG 飘带动画 — 更大幅度 ====== */
  .rib-path {
    will-change: transform, opacity;
  }

  .rib-p1 {
    animation: rib-flow-1 14s ease-in-out infinite alternate;
  }

  .rib-p2 {
    animation: rib-flow-2 17s ease-in-out infinite alternate-reverse;
    animation-delay: 2s;
  }

  .rib-p3 {
    animation: rib-flow-3 19s ease-in-out infinite alternate;
    animation-delay: 4s;
  }

  @keyframes rib-flow-1 {
    0%   { transform: translateX(0) translateY(0) skewX(0deg); opacity: 0.88; }
    33%  { transform: translateX(35px) translateY(-12px) skewX(1deg); opacity: 1; }
    66%  { transform: translateX(-18px) translateY(8px) skewX(-0.5deg); opacity: 0.9; }
    100% { transform: translateX(25px) translateY(-6px) skewX(0.5deg); opacity: 0.94; }
  }

  @keyframes rib-flow-2 {
    0%   { transform: translateX(0) translateY(0); opacity: 0.82; }
    40%  { transform: translateX(-40px) translateY(15px); opacity: 1; }
    75%  { transform: translateX(22px) translateY(-8px); opacity: 0.86; }
    100% { transform: translateX(-15px) translateY(5px); opacity: 0.9; }
  }

  @keyframes rib-flow-3 {
    0%   { transform: translateX(0) translateY(0); opacity: 0.78; }
    50%  { transform: translateX(28px) translateY(-10px); opacity: 0.96; }
    100% { transform: translateX(-15px) translateY(6px); opacity: 0.85; }
  }

  /* ====== 浮动光球动画 ====== */
  .floating-orb {
    position: absolute;
    animation: orb-float 10s ease-in-out infinite alternate,
               orb-pulse 6s ease-in-out infinite alternate;
  }

  @keyframes orb-float {
    0%   { transform: translate(0, 0) scale(1); }
    33%  { transform: translate(25px, -18px) scale(1.12); }
    66%  { transform: translate(-15px, 12px) scale(0.94); }
    100% { transform: translate(20px, -8px) scale(1.06); }
  }

  @keyframes orb-pulse {
    0%   { opacity: 0.7; }
    50%  { opacity: 1; }
    100% { opacity: 0.8; }
  }
`;
