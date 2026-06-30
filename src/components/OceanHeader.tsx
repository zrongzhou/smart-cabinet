'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v189 — 深海流光 · 精简至2层 · 质感优先
//
// v188 反馈："颜色不协调，质感差"
// 根因诊断：
//   ❌ 4个装饰层(Canvas+AuroraField+Ribbons+Orbs)全是模糊色块
//   ❌ 所有元素 blur 16~28px → 叠加后像一锅蓝色浆糊
//   ❌ 颜色都在窄蓝范围(185~250°)无对比
//   ❌ 无任何锐利边缘或纹理 → 廉价感
//
// v189 策略：做减法
//   ✅ 只保留 2 层：Canvas深海流光 + CSS有机光晕
//   ✅ 删除 AuroraField / FlowingRibbons / FloatingOrbs
//   ✅ 高对比度：暗底(6~12%) + 亮光斑(65~75%)
//   ✅ 微妙噪点纹理 → 玻璃/金属质感
//   ✅ 光线穿透效果(caustics) → 动态焦点
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
      {/* Layer 1: Canvas — 深海流光底（唯一动态层） */}
      <DeepOceanCanvas />

      {/* Layer 2: 有机光晕 — 2个大光斑 + 光束 */}
      <OrganicGlow />

      {/* Layer 3: 微妙噪点纹理 */}
      <NoiseTexture />

      {/* 底部过渡 */}
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

      <style>{styles}</style>
    </section>
  );
}

// ============================================================
// Layer 1: DeepOceanCanvas — 深海流光
// 核心：深暗底色 + 少量高对比度光斑 + 光束穿透
// ============================================================
function DeepOceanCanvas() {
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

      // ── 底色：深邃深海渐变（很暗！让光线跳出来）──
      const bg = ctx.createLinearGradient(0, 0, w * 0.3, h);
      bg.addColorStop(0, '#040e1a');
      bg.addColorStop(0.3, '#071829');
      bg.addColorStop(0.6, '#0a2040');
      bg.addColorStop(1, '#06162b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── 主光源：右上角大面积天青光（唯一最亮的区域）──
      const sunX = w * (0.68 + Math.sin(time * 0.35) * 0.05);
      const sunY = h * (0.08 + Math.cos(time * 0.28) * 0.04);
      const main = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(w, h) * 0.7);
      main.addColorStop(0, `rgba(56, 189, 248, ${0.52 + Math.sin(time * 0.5) * 0.10})`);
      main.addColorStop(0.15, `rgba(96, 165, 250, ${0.38 + Math.cos(time * 0.4) * 0.06})`);
      main.addColorStop(0.35, `rgba(59, 130, 246, ${0.22 + Math.sin(time * 0.35) * 0.04})`);
      main.addColorStop(0.6, `rgba(30, 64, 175, ${0.10 + Math.cos(time * 0.3) * 0.02})`);
      main.addColorStop(1, 'transparent');
      ctx.fillStyle = main;
      ctx.fillRect(0, 0, w, h);

      // ── 次光源：左侧中部 宝石蓝光 ──
      const secX = w * (0.1 + Math.cos(time * 0.3) * 0.04);
      const secY = h * (0.5 + Math.sin(time * 0.35) * 0.05);
      const sec = ctx.createRadialGradient(secX, secY, 0, secX, secY, Math.max(w, h) * 0.5);
      sec.addColorStop(0, `rgba(99, 102, 241, ${0.34 + Math.sin(time * 0.45 + 1) * 0.08})`);
      sec.addColorStop(0.2, `rgba(79, 70, 229, ${0.22 + Math.cos(time * 0.4) * 0.04})`);
      sec.addColorStop(0.5, `rgba(67, 56, 202, ${0.10})`);
      sec.addColorStop(1, 'transparent');
      ctx.fillStyle = sec;
      ctx.fillRect(0, 0, w, h);

      // ── 底部反光：青绿色微光（增加深度）──
      const botX = w * (0.5 + Math.sin(time * 0.25) * 0.06);
      const botY = h * (0.88 + Math.cos(time * 0.3) * 0.03);
      const bot = ctx.createRadialGradient(botX, botY, 0, botX, botY, Math.max(w, h) * 0.4);
      bot.addColorStop(0, `rgba(6, 182, 212, ${0.18 + Math.sin(time * 0.38) * 0.05})`);
      bot.addColorStop(0.3, `rgba(34, 211, 238, ${0.10})`);
      bot.addColorStop(1, 'transparent');
      ctx.fillStyle = bot;
      ctx.fillRect(0, 0, w, h);

      // ── 光束：从右上角射入的斜向光线 ──
      ctx.save();
      ctx.globalAlpha = 0.04 + Math.sin(time * 0.3) * 0.015;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(w * (0.2 + Math.sin(time * 0.2) * 0.1), h);
      ctx.lineTo(w * (0.35 + Math.cos(time * 0.25) * 0.08), h);
      ctx.closePath();
      const beamGrad = ctx.createLinearGradient(sunX, sunY, w * 0.28, h);
      beamGrad.addColorStop(0, 'rgba(186, 230, 253, 0.6)');
      beamGrad.addColorStop(0.5, 'rgba(125, 211, 252, 0.2)');
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.fill();
      ctx.restore();

      // ── 第二道光束（更弱）──
      ctx.save();
      ctx.globalAlpha = 0.025 + Math.cos(time * 0.25) * 0.01;
      ctx.beginPath();
      ctx.moveTo(sunX + 30, sunY + 20);
      ctx.lineTo(w * (0.4 + Math.cos(time * 0.22) * 0.08), h);
      ctx.lineTo(w * (0.55 + Math.sin(time * 0.18) * 0.06), h);
      ctx.closePath();
      const beam2 = ctx.createLinearGradient(sunX, sunY, w * 0.48, h);
      beam2.addColorStop(0, 'rgba(147, 197, 253, 0.4)');
      beam2.addColorStop(1, 'transparent');
      ctx.fillStyle = beam2;
      ctx.fill();
      ctx.restore();

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
// Layer 2: OrganicGlow — 2个静态大光晕 + 脉动
// 用CSS实现高性能、低开销的光斑呼吸效果
// ============================================================
function OrganicGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 光晕A：右上主光区 — 大而柔和的天青光晕 */}
      <div className="og-glow og-a" />

      {/* 光晕B：左中副光区 — 靛蓝光晕 */}
      <div className="og-glow og-b" />
    </div>
  );
}

// ============================================================
// Layer 3: NoiseTexture — 极细微噪点
// 用SVG feTurbulence生成非常细密的噪点
// opacity极低(0.03~0.05)，只提供玻璃/金属质感
// 不是v181那种粗糙塑料颗粒！
// ============================================================
function NoiseTexture() {
  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full"
      aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 400 300">
      <defs>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#noise)"
        style={{ opacity: 0.035, mixBlendMode: 'overlay' }} />
    </svg>
  );
}

const styles = `
  /* ====== OrganicGlow: 大光晕呼吸 ====== */
  .og-glow {
    position: absolute;
    border-radius: 50%;
    will-change: transform, opacity;
  }

  .og-a {
    right: -8%;
    top: -15%;
    width: 70%;
    height: 70%;
    background: radial-gradient(ellipse at center,
      rgba(56, 189, 248, 0.18) 0%,
      rgba(96, 165, 250, 0.10) 30%,
      rgba(59, 130, 246, 0.05) 55%,
      transparent 70%);
    filter: blur(48px);
    animation: og-pulse-a 14s ease-in-out infinite alternate;
  }

  .og-b {
    left: -5%;
    top: 35%;
    width: 55%;
    height: 55%;
    background: radial-gradient(ellipse at center,
      rgba(99, 102, 241, 0.14) 0%,
      rgba(79, 70, 229, 0.08) 35%,
      rgba(67, 56, 202, 0.03) 60%,
      transparent 72%);
    filter: blur(42px);
    animation: og-pulse-b 17s ease-in-out infinite alternate-reverse;
    animation-delay: 3s;
  }

  @keyframes og-pulse-a {
    0%   { transform: scale(1) translate(0, 0); opacity: 0.7; }
    33%  { transform: scale(1.08) translate(18px, -12px); opacity: 1; }
    66%  { transform: scale(0.97) translate(-10px, 8px); opacity: 0.82; }
    100% { transform: scale(1.05) translate(12px, -5px); opacity: 0.92; }
  }

  @keyframes og-pulse-b {
    0%   { transform: scale(1) translate(0, 0); opacity: 0.6; }
    40%  { transform: scale(1.1) translate(-15px, 10px); opacity: 0.9; }
    75%  { transform: scale(0.95) translate(8px, -6px); opacity: 0.7; }
    100% { transform: scale(1.04) translate(-8px, 4px); opacity: 0.84; }
  }
`;
