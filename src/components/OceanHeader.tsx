'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v188 — 天青蓝韵 · 统一色调 · 协调流动
//
// v187 反馈："颜色不是很协调，以天青色、蓝色为主"
// 根因诊断：
//   ❌ 粉/玫红/金/橙/珊瑚 暖色混入 → 色彩打架
//   ❌ 5个光斑色相跨度太大(38°~330°) → 不协调
//   ❌ AuroraField 渐变里塞了太多暖色stop
//
// v188 策略：严格锁定 天青(175~195°) + 蓝(200~240°) 色域
//   ✅ 所有光斑/飘带/极光波 统一在 170~250° HSL 范围
//   ✅ 主色: 天青SkyBlue(195) + 宝石蓝RoyalBlue(220) + 深靛Indigo(235)
//   ✅ 点缀: 极淡薄荷(170) + 淡紫蓝(255) 仅作边缘过渡
//   ✅ 完全去除粉/玫/金/橙/珊瑚/品红
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
      {/* Layer 0: Canvas — 天青蓝色域动态底 */}
      <CanvasAurora />

      {/* Layer 1: CSS 极光流 — 蓝青渐变带 */}
      <AuroraField />

      {/* Layer 2: SVG 曲线飘带 */}
      <FlowingRibbons />

      {/* Layer 3: 浮动光球 */}
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
// Layer 0: Canvas — 纯天青蓝色域
// 5个光斑全部锁定 185~245° HSL（天青~深靛）
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

      // 底色：深海蓝黑 → 让天青色跳出来
      const baseGrad = ctx.createLinearGradient(0, 0, w * 0.5, h);
      baseGrad.addColorStop(0, `hsl(${218 + Math.sin(time * 0.25) * 8}, 52%, 9%)`);
      baseGrad.addColorStop(0.35, `hsl(${212 + Math.sin(time * 0.3) * 6}, 56%, 12%)`);
      baseGrad.addColorStop(0.65, `hsl(${205 + Math.sin(time * 0.28) * 7}, 58%, 15%)`);
      baseGrad.addColorStop(1, `hsl(${198 + Math.sin(time * 0.25) * 5}, 50%, 18%)`);
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // 光斑1: 右上 — 亮天青 SkyBlue (主色)
      const g1 = ctx.createRadialGradient(
        w * (0.72 + Math.sin(time * 0.42) * 0.07),
        h * (0.08 + Math.cos(time * 0.3) * 0.05), 0,
        w * (0.72 + Math.sin(time * 0.42) * 0.07),
        h * (0.08 + Math.cos(time * 0.3) * 0.05), Math.max(w, h) * 0.62
      );
      g1.addColorStop(0, `hsla(${195 + Math.sin(time * 0.5) * 15}, 85%, 68%, ${0.48 + Math.sin(time * 0.6) * 0.10})`);
      g1.addColorStop(0.3, `hsla(${205 + Math.sin(time * 0.45) * 10}, 78%, 58%, ${0.32 + Math.cos(time * 0.5) * 0.06})`);
      g1.addColorStop(0.7, `hsla(${215 + Math.sin(time * 0.4) * 8}, 65%, 48%, ${0.14 + Math.sin(time * 0.35) * 0.03})`);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, w, h);

      // 光斑2: 左侧 — 宝石蓝 RoyalBlue (次主色)
      const g2 = ctx.createRadialGradient(
        w * (0.08 + Math.cos(time * 0.36) * 0.05),
        h * (0.45 + Math.sin(time * 0.4) * 0.07), 0,
        w * (0.08 + Math.cos(time * 0.36) * 0.05),
        h * (0.45 + Math.sin(time * 0.4) * 0.07), Math.max(w, h) * 0.52
      );
      g2.addColorStop(0, `hsla(${222 + Math.sin(time * 0.45 + 1) * 18}, 88%, 62%, ${0.42 + Math.sin(time * 0.7) * 0.09})`);
      g2.addColorStop(0.35, `hsla(${230 + Math.sin(time * 0.4) * 12}, 80%, 52%, ${0.26 + Math.cos(time * 0.55) * 0.05})`);
      g2.addColorStop(0.75, `hsla(${238 + Math.sin(time * 0.35) * 8}, 68%, 44%, ${0.10 + Math.sin(time * 0.4) * 0.02})`);
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);

      // 光斑3: 中下 — 青绿 Teal (冷暖过渡)
      const g3 = ctx.createRadialGradient(
        w * (0.54 + Math.sin(time * 0.32) * 0.07),
        h * (0.78 + Math.cos(time * 0.35) * 0.04), 0,
        w * (0.54 + Math.sin(time * 0.32) * 0.07),
        h * (0.78 + Math.cos(time * 0.35) * 0.04), Math.max(w, h) * 0.46
      );
      g3.addColorStop(0, `hsla(${186 + Math.sin(time * 0.48 + 2) * 16}, 76%, 56%, ${0.36 + Math.sin(time * 0.65) * 0.08})`);
      g3.addColorStop(0.4, `hsla(${194 + Math.sin(time * 0.42) * 10}, 68%, 46%, ${0.20 + Math.cos(time * 0.5) * 0.04})`);
      g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3; ctx.fillRect(0, 0, w, h);

      // 光斑4: 左上 — 淡天青 LightSkyBlue (提亮区域)
      const g4 = ctx.createRadialGradient(
        w * (0.06 + Math.cos(time * 0.28) * 0.04),
        h * (0.1 + Math.sin(time * 0.32) * 0.04), 0,
        w * (0.06 + Math.cos(time * 0.28) * 0.04),
        h * (0.1 + Math.sin(time * 0.32) * 0.04), Math.max(w, h) * 0.36
      );
      g4.addColorStop(0, `hsla(${200 + Math.sin(time * 0.4) * 12}, 80%, 68%, ${0.24 + Math.sin(time * 0.5) * 0.06})`);
      g4.addColorStop(0.5, `hsla(${208 + Math.sin(time * 0.35) * 8}, 70%, 54%, ${0.12 + Math.cos(time * 0.4) * 0.03})`);
      g4.addColorStop(1, 'transparent');
      ctx.fillStyle = g4; ctx.fillRect(0, 0, w, h);

      // 光斑5: 右侧中 — 靛蓝 Indigo (深度)
      const g5 = ctx.createRadialGradient(
        w * (0.84 + Math.cos(time * 0.38) * 0.04),
        h * (0.52 + Math.sin(time * 0.33) * 0.05), 0,
        w * (0.84 + Math.cos(time * 0.38) * 0.04),
        h * (0.52 + Math.sin(time * 0.33) * 0.05), Math.max(w, h) * 0.38
      );
      g5.addColorStop(0, `hsla(${238 + Math.sin(time * 0.45) * 14}, 70%, 58%, ${0.26 + Math.sin(time * 0.55) * 0.07})`);
      g5.addColorStop(0.5, `hsla(${228 + Math.sin(time * 0.4) * 10}, 65%, 48%, ${0.13 + Math.cos(time * 0.45) * 0.03})`);
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
// Layer 1: AuroraField — 天青蓝极光波
// 所有渐变严格限制在天青→蓝→靛范围内
// ============================================================
function AuroraField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 主极光：天青→宝蓝 渐变大波 */}
      <div className="aurora-wave aw-main" />
      {/* 副极光：青→靛 反向 */}
      <div className="aurora-wave aw-sub" />
      {/* 顶部：淡天青扫过 */}
      <div className="aurora-wave aw-top" />
      {/* 底部：柔和过渡到白色 */}
      <div className="aurora-wave aw-bot" />
    </div>
  );
}

// ============================================================
// Layer 2: SVG 曲线飘带 — 全蓝青色系
// ============================================================
function FlowingRibbons() {
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-hidden w-full h-full"
      aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1440 500">
      <defs>
        <filter id="rb-heavy"><feGaussianBlur stdDeviation="16" /></filter>
        <filter id="rb-med"><feGaussianBlur stdDeviation="11" /></filter>
        <filter id="rb-light"><feGaussianBlur stdDeviation="7" /></filter>

        {/* 飘带1: 天青→宝蓝→靛蓝 */}
        <linearGradient id="rg-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(56,189,248,0.52)" />
          <stop offset="25%" stopColor="rgba(59,130,246,0.55)" />
          <stop offset="50%" stopColor="rgba(99,102,241,0.48)" />
          <stop offset="75%" stopColor="rgba(79,70,229,0.38)" />
          <stop offset="100%" stopColor="rgba(67,56,202,0.20)" />
        </linearGradient>

        {/* 飘带2: 青→天蓝→宝蓝 */}
        <linearGradient id="rg-b" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.44)" />
          <stop offset="30%" stopColor="rgba(103,232,249,0.48)" />
          <stop offset="55%" stopColor="rgba(96,165,250,0.40)" />
          <stop offset="85%" stopColor="rgba(129,140,248,0.28)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>

        {/* 飘带3: 淡天青（顶部轻柔） */}
        <linearGradient id="rg-c" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(125,211,252,0.32)" />
          <stop offset="40%" stopColor="rgba(147,197,253,0.36)" />
          <stop offset="70%" stopColor="rgba(167,139,250,0.22)" />
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

      {/* 飘带3: 顶部 */}
      <path d="M -30,25 C 280,-15 520,95 820,35 C 1120,-10 1340,70 1480,35 L 1480,105 C 1220,140 960,60 680,115 C 400,170 140,90 -30,115 Z"
        fill="url(#rg-c)" filter="url(#rb-light)"
        className="rib-path rib-p3" style={{ mixBlendMode: 'screen' }} />
    </svg>
  );
}

// ============================================================
// Layer 3: FloatingOrbs — 蓝青色光球
// ============================================================
function FloatingOrbs() {
  const orbs = [
    { x: '16%', y: '20%', size: 180, css: 'orb-sky', grad: 'radial-gradient(circle, rgba(125,211,252,0.38) 0%, rgba(56,189,248,0.18) 40%, transparent 70%)' },
    { x: '74%', y: '12%', size: 220, css: 'orb-royal', grad: 'radial-gradient(circle, rgba(96,165,250,0.42) 0%, rgba(59,130,246,0.20) 40%, transparent 70%)' },
    { x: '52%', y: '58%', size: 150, css: 'orb-teal', grad: 'radial-gradient(circle, rgba(34,211,238,0.34) 0%, rgba(103,232,249,0.16) 40%, transparent 70%)' },
    { x: '10%', y: '65%', size: 130, css: 'orb-indigo', grad: 'radial-gradient(circle, rgba(129,140,248,0.30) 0%, rgba(99,102,241,0.14) 40%, transparent 70%)' },
    { x: '82%', y: '55%', size: 110, css: 'orb-cobalt', grad: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, rgba(79,70,229,0.12) 40%, transparent 70%)' },
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
          background: o.grad,
          filter: 'blur(24px)',
          animationDelay: `${i * 1.2}s`,
        }} />
      ))}
    </div>
  );
}

const keyframes = `
  /* ====== AuroraField: 天青蓝极光波 ====== */
  .aurora-wave { position: absolute; border-radius: 50%; opacity: 0.92; }

  .aw-main {
    left: -15%; top: 20%; width: 130%; height: 180px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(56,189,248,0.28) 8%,
      rgba(96,165,250,0.38) 22%,
      rgba(129,140,248,0.35) 38%,
      rgba(99,102,241,0.32) 55%,
      rgba(79,70,229,0.25) 72%,
      rgba(67,56,202,0.15) 85%,
      transparent 100%);
    filter: blur(28px);
    animation: aur-shift-main 12s ease-in-out infinite alternate;
  }

  .aw-sub {
    left: -10%; top: 50%; width: 120%; height: 140px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(34,211,238,0.26) 10%,
      rgba(103,232,249,0.34) 28%,
      rgba(147,197,253,0.30) 50%,
      rgba(129,140,248,0.22) 70%,
      transparent 90%);
    filter: blur(22px);
    animation: aur-shift-sub 15s ease-in-out infinite alternate-reverse;
    animation-delay: 3s;
  }

  .aw-top {
    left: -5%; top: -3%; width: 110%; height: 85px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(147,197,253,0.22) 20%,
      rgba(125,211,252,0.28) 40%,
      rgba(186,230,253,0.18) 60%,
      transparent 80%);
    filter: blur(16px);
    animation: aur-shift-top 18s ease-in-out infinite alternate;
    animationDelay: 1.5s;
  }

  .aw-bot {
    left: 0; top: 72%; width: 100%; height: 120px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(186,230,253,0.16) 25%,
      rgba(167,199,251,0.12) 50%,
      transparent 75%);
    filter: blur(18px);
    animation: aur-shift-bot 20s ease-in-out infinite alternate-reverse;
    animationDelay: 4s;
  }

  @keyframes aur-shift-main {
    0%   { transform: translateX(-30px) translateY(0) scaleX(1); opacity: 0.86; }
    33%  { transform: translateX(40px) translateY(-12px) scaleX(1.06); opacity: 1; }
    66%  { transform: translateX(-20px) translateY(8px) scaleX(0.97); opacity: 0.91; }
    100% { transform: translateX(35px) translateY(-5px) scaleX(1.03); opacity: 0.95; }
  }
  @keyframes aur-shift-sub {
    0%   { transform: translateX(25px) translateY(5px); opacity: 0.8; }
    40%  { transform: translateX(-40px) translateY(-10px); opacity: 1; }
    75%  { transform: translateX(20px) translateY(8px); opacity: 0.85; }
    100% { transform: translateX(-25px) translateY(-3px); opacity: 0.9; }
  }
  @keyframes aur-shift-top {
    0%   { transform: translateX(0) translateY(5px); opacity: 0.7; }
    50%  { transform: translateX(50px) translateY(0); opacity: 1; }
    100% { transform: translateX(20px) translateY(8px); opacity: 0.8; }
  }
  @keyframes aur-shift-bot {
    0%   { transform: translateX(-20px) translateY(0); opacity: 0.74; }
    50%  { transform: translateX(30px) translateY(5px); opacity: 0.94; }
    100% { transform: translateX(10px) translateY(-3px); opacity: 0.82; }
  }

  /* ====== SVG 飘带动画 ====== */
  .rib-path { will-change: transform, opacity; }
  .rib-p1 { animation: rib-f1 14s ease-in-out infinite alternate; }
  .rib-p2 { animation: rib-f2 17s ease-in-out infinite alternate-reverse; animation-delay: 2s; }
  .rib-p3 { animation: rib-f3 19s ease-in-out infinite alternate; animation-delay: 4s; }

  @keyframes rib-f1 {
    0%   { transform: translateX(0) translateY(0) skewX(0deg); opacity: 0.88; }
    33%  { transform: translateX(35px) translateY(-12px) skewX(1deg); opacity: 1; }
    66%  { transform: translateX(-18px) translateY(8px) skewX(-0.5deg); opacity: 0.9; }
    100% { transform: translateX(25px) translateY(-6px) skewX(0.5deg); opacity: 0.94; }
  }
  @keyframes rib-f2 {
    0%   { transform: translateX(0) translateY(0); opacity: 0.82; }
    40%  { transform: translateX(-40px) translateY(15px); opacity: 1; }
    75%  { transform: translateX(22px) translateY(-8px); opacity: 0.86; }
    100% { transform: translateX(-15px) translateY(5px); opacity: 0.9; }
  }
  @keyframes rib-f3 {
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
