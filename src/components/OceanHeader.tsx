'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v184 — 动态流光质感 · 色彩呼吸 + 极光涌动
//
// 核心改进（v183反馈：太素、缺动态和色彩变化）：
//   ✅ Canvas动态渐变 — 色相持续缓慢偏移，颜色在蓝/紫/青间流动
//   ✅ 光斑带脉动动画 — 不只是漂移，还有明暗+缩放呼吸
//   ✅ 极光带增强 — 更宽更亮，颜色也在缓慢变化
//   ✅ 微妙光束 — 几道极淡的斜向光柱增加层次
//   ❌ 仍然无：点阵 / 漂浮粒子 / 噪点
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
      {/* Layer 0: Canvas动态流光背景 — 颜色持续变化 */}
      <CanvasGradient />

      {/* Layer 1: 呼吸光斑 — 带脉动的大光晕 */}
      <BreathingOrbs />

      {/* Layer 2: 极光涌动带 — 宽幅 + 颜色流动 */}
      <AuroraWaves />

      {/* Layer 3: 底部过渡到白色内容区 */}
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
// Layer 0: Canvas 动态渐变 — 色相持续流动
// 用 requestAnimationFrame 驱动颜色缓慢循环变化
// ============================================================
function CanvasGradient() {
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
      time += 0.003;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // 基础深色底
      const baseGrad = ctx.createLinearGradient(0, 0, w * 0.3, h);
      const hueShift = Math.sin(time * 0.4) * 12; // 色相偏移 ±12度
      baseGrad.addColorStop(0, `hsl(${220 + hueShift}, 45%, 6%)`);
      baseGrad.addColorStop(0.4, `hsl(${225 + hueShift}, 50%, 10%)`);
      baseGrad.addColorStop(0.7, `hsl(${215 + hueShift}, 52%, 14%)`);
      baseGrad.addColorStop(1, `hsl(${210 + hueShift}, 55%, 20%)`);
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // 大型径向光斑1 — 右上紫/品红区域，随时间变色
      const orb1X = w * (0.72 + Math.sin(time * 0.5) * 0.08);
      const orb1Y = h * (0.12 + Math.cos(time * 0.35) * 0.06);
      const orb1R = Math.max(w, h) * 0.65;
      const g1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, orb1R);
      const hue1 = (265 + Math.sin(time * 0.6) * 20); // 紫↔品红
      g1.addColorStop(0, `hsla(${hue1}, 70%, 58%, ${0.22 + Math.sin(time * 0.8) * 0.06})`);
      g1.addColorStop(0.4, `hsla(${hue1 - 10}, 60%, 48%, ${0.14 + Math.cos(time * 0.7) * 0.04})`);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // 大型径向光斑2 — 左侧蓝色区域
      const orb2X = w * (0.15 + Math.cos(time * 0.4) * 0.07);
      const orb2Y = h * (0.55 + Math.sin(time * 0.45) * 0.05);
      const orb2R = Math.max(w, h) * 0.55;
      const g2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, orb2R);
      const hue2 = (210 + Math.sin(time * 0.5 + 1) * 18); // 蓝↔靛
      g2.addColorStop(0, `hsla(${hue2}, 75%, 54%, ${0.18 + Math.sin(time * 0.9) * 0.05})`);
      g2.addColorStop(0.5, `hsla(${hue2 + 8}, 65%, 44%, ${0.10 + Math.cos(time * 0.6) * 0.03})`);
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // 大型径向光斑3 — 中下青色区域
      const orb3X = w * (0.55 + Math.sin(time * 0.38) * 0.09);
      const orb3Y = h * (0.78 + Math.cos(time * 0.42) * 0.04);
      const orb3R = Math.max(w, h) * 0.45;
      const g3 = ctx.createRadialGradient(orb3X, orb3Y, 0, orb3X, orb3Y, orb3R);
      const hue3 = (188 + Math.sin(time * 0.55 + 2) * 15); // 青↔湖蓝
      g3.addColorStop(0, `hsla(${hue3}, 68%, 50%, ${0.15 + Math.sin(time * 0.75) * 0.04})`);
      g3.addColorStop(0.6, `hsla(${hue3 + 5}, 58%, 42%, ${0.08 + Math.cos(time * 0.65) * 0.02})`);
      g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w, h);

      // 第四个微妙暖光 — 左上角极淡的金/橙色光晕
      const orb4X = w * (0.08 + Math.cos(time * 0.33) * 0.05);
      const orb4Y = h * (0.18 + Math.sin(time * 0.38) * 0.04);
      const orb4R = Math.max(w, h) * 0.35;
      const g4 = ctx.createRadialGradient(orb4X, orb4Y, 0, orb4X, orb4Y, orb4R);
      g4.addColorStop(0, `hsla(${40 + Math.sin(time * 0.4) * 12}, 60%, 55%, ${0.06 + Math.sin(time * 0.5) * 0.02})`);
      g4.addColorStop(1, 'transparent');
      ctx.fillStyle = g4;
      ctx.fillRect(0, 0, w, h);

      // 水平线性高光条 — 模拟光线扫过
      const stripY = h * (0.35 + Math.sin(time * 0.3) * 0.15);
      const stripGrad = ctx.createLinearGradient(0, stripY - 30, 0, stripY + 30);
      stripGrad.addColorStop(0, 'transparent');
      stripGrad.addColorStop(0.5, `rgba(180, 200, 255, ${0.035 + Math.sin(time * 0.6) * 0.015})`);
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
// Layer 1: 呼吸光斑 — CSS动画驱动的脉动光晕
// 比 v183 的 SoftOrbs 更有动感：opacity + scale 双重呼吸
// ============================================================
function BreathingOrbs() {
  const orbs = [
    { x: '75%', y: '8%', s: 380, c: 'rgba(139,92,246,0.20)', b: 100, anim: 'orb-breathe-a' },
    { x: '12%', y: '45%', s: 320, c: 'rgba(59,130,246,0.16)', b: 80, anim: 'orb-breathe-b' },
    { x: '60%', y: '70%', s: 260, c: 'rgba(6,182,212,0.13)', b: 65, anim: 'orb-breathe-c' },
    { x: '85%', y: '55%', s: 200, c: 'rgba(99,102,241,0.12)', b: 55, anim: 'orb-breathe-a' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: 'absolute', left: o.x, top: o.y,
          width: o.s, height: o.s, borderRadius: '50%',
          background: ['radial-gradient(circle,', o.c, ', transparent 70%)'].join(' '),
          filter: ['blur(', o.b, 'px)'].join(''),
          animation: [o.anim, ' ', (16 + i * 5), 's ease-in-out infinite alternate'].join(''),
          animationDelay: [(i * 2), 's'].join(''),
        }} />
      ))}
    </div>
  );
}

// ============================================================
// Layer 2: 极光涌动带 — 宽幅 + 颜色流动 + 波浪形变
// 比 v183 的 AuroraFlow 更宽更亮更有动感
// ============================================================
function AuroraWaves() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">

      {/* 主极光波：横贯中上部，最宽最亮 */}
      <div className="aur-wave" style={{
        left: '-5%', top: '15%',
        width: '110%', height: '140px',
        background: [
          'linear-gradient(95deg,',
          'transparent 0%,',
          'rgba(99,102,241,0.20) 8%,',
          'rgba(139,92,246,0.26) 25%,',
          'rgba(168,85,247,0.22) 42%,',
          'rgba(139,92,246,0.24) 58%,',
          'rgba(59,130,246,0.19) 75%,',
          'rgba(6,182,212,0.13) 88%,',
          'transparent 100%)'
        ].join(' '),
        filter: 'blur(36px)',
        animation: 'aur-wave-main 16s ease-in-out infinite alternate',
      }} />

      {/* 第二波：中下部，青蓝色调 */}
      <div className="aur-wave" style={{
        left: '-8%', top: '52%',
        width: '116%', height: '95px',
        background: [
          'linear-gradient(88deg,',
          'transparent 0%,',
          'rgba(6,182,212,0.15) 12%,',
          'rgba(56,189,248,0.21) 30%,',
          'rgba(59,130,246,0.18) 50%,',
          'rgba(99,102,241,0.14) 70%,',
          'transparent 100%)'
        ].join(' '),
        filter: 'blur(30px)',
        animation: 'aur-wave-sub 20s ease-in-out infinite alternate-reverse',
        animationDelay: '2.5s',
      }} />

      {/* 第三波：顶部边缘，淡紫光晕 */}
      <div className="aur-wave" style={{
        left: '-3%', top: '2%',
        width: '106%', height: '60px',
        background: [
          'linear-gradient(96deg,',
          'transparent 0%,',
          'rgba(167,139,250,0.14) 20%,',
          'rgba(139,92,246,0.18) 40%,',
          'rgba(99,102,241,0.14) 60%,',
          'transparent 100%)'
        ].join(' '),
        filter: 'blur(22px)',
        animation: 'aur-wave-top 18s ease-in-out infinite alternate',
        animationDelay: '4s',
      }} />

      {/* 底部过渡光带 */}
      <div className="aur-wave" style={{
        left: '-6%', top: '78%',
        width: '112%', height: '70px',
        background: [
          'linear-gradient(90deg,',
          'transparent 0%,',
          'rgba(125,211,252,0.11) 15%,',
          'rgba(56,189,248,0.15) 40%,',
          'rgba(147,197,253,0.09) 65%,',
          'transparent 100%)'
        ].join(' '),
        filter: 'blur(24px)',
        animation: 'aur-wave-bot 22s ease-in-out infinite alternate-reverse',
        animationDelay: '1s',
      }}

    /></div>
  );
}

const keyframes = `
  /* 光斑呼吸动画 — 缩放+透明度双重变化 */
  @keyframes orb-breathe-a {
    0%   { transform: translate(0, 0) scale(1); opacity: 0.70; }
    33%  { transform: translate(12px, -8px) scale(1.12); opacity: 0.95; }
    66%  { transform: translate(-6px, 6px) scale(0.94); opacity: 0.78; }
    100% { transform: translate(8px, -4px) scale(1.06); opacity: 0.85; }
  }
  @keyframes orb-breathe-b {
    0%   { transform: translate(0, 0) scale(1); opacity: 0.62; }
    40%  { transform: translate(-10px, 10px) scale(1.15); opacity: 0.90; }
    75%  { transform: translate(8px, -6px) scale(0.92); opacity: 0.70; }
    100% { transform: translate(-6px, 4px) scale(1.08); opacity: 0.82; }
  }
  @keyframes orb-breathe-c {
    0%   { transform: translate(0, 0) scale(1); opacity: 0.55; }
    50%  { transform: translate(14px, -5px) scale(1.18); opacity: 0.85; }
    100% { transform: translate(-8px, 8px) scale(0.96); opacity: 0.65; }
  }

  /* 极光波浪动画 */
  @keyframes aur-wave-main {
    0%   { transform: translateX(0) scaleX(1); opacity: 0.78; }
    30%  { transform: translateX(25px) scaleX(1.03); opacity: 1; }
    65%  { transform: translateX(-12px) scaleX(0.97); opacity: 0.85; }
    100% { transform: translateX(15px) scaleX(1.01); opacity: 0.90; }
  }
  @keyframes aur-wave-sub {
    0%   { transform: translateX(0) scaleX(1); opacity: 0.68; }
    35%  { transform: translateX(-20px) scaleX(1.02); opacity: 0.92; }
    70%  { transform: translateX(12px) scaleX(0.98); opacity: 0.76; }
    100% { transform: translateX(-8px) scaleX(1.01); opacity: 0.84; }
  }
  @keyframes aur-wave-top {
    0%   { transform: translateX(0); opacity: 0.65; }
    50%  { transform: translateX(18px); opacity: 0.90; }
    100% { transform: translateX(-10px); opacity: 0.72; }
  }
  @keyframes aur-wave-bot {
    0%   { transform: translateX(0); opacity: 0.58; }
    45%  { transform: translateX(-15px); opacity: 0.84; }
    100% { transform: translateX(10px); opacity: 0.66; }
  }

  .aur-wave {
    position: absolute;
    border-radius: 50%;
  }
`;
