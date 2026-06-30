'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v186 — 流光飘带 · 曲线流动 · 消除折叠感
//
// v185反馈："没有飘带的感觉，反而有种折叠的感觉"
// 根因诊断：
//   ❌ AuroraWaves 用4条水平长条div堆叠在不同Y轴位置 = 层叠色布 = 折叠感
//   ❌ 所有元素都是水平方向 = 无流动感
//
// v186 核心改变：
//   ✅ 删除所有水平横条 div（折叠元凶）
//   ✅ 改用 SVG 贝塞尔曲线绘制真正的飘带 — 对角线+S形弯曲+变粗细
//   ✅ 飘带沿对角线流动（左上↔右下），不是水平排列
//   ✅ 保留Canvas动态底色 + 光束 + 星光（这些没问题）
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

      {/* Layer 1: SVG曲线飘带 — 真正的流动感 */}
      <FlowingRibbons />

      {/* Layer 2: 舞台光束（减弱） */}
      <LightBeams />

      {/* Layer 3: 少量精致星光 */}
      <StarSparks />

      {/* Layer 4: 底部过渡到白色内容区 */}
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

      // 基础底色 — 提亮
      const baseGrad = ctx.createLinearGradient(0, 0, w * 0.4, h);
      const hueShift = Math.sin(time * 0.35) * 15;
      baseGrad.addColorStop(0, `hsl(${230 + hueShift}, 52%, 12%)`);
      baseGrad.addColorStop(0.35, `hsl(${225 + hueShift}, 58%, 18%)`);
      baseGrad.addColorStop(0.65, `hsl(${215 + hueShift}, 60%, 24%)`);
      baseGrad.addColorStop(1, `hsl(${208 + hueShift}, 55%, 28%)`);
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // 光斑1: 右上 粉紫
      const g1 = ctx.createRadialGradient(
        w * (0.72 + Math.sin(time * 0.45) * 0.1),
        h * (0.08 + Math.cos(time * 0.32) * 0.08), 0,
        w * (0.72 + Math.sin(time * 0.45) * 0.1),
        h * (0.08 + Math.cos(time * 0.32) * 0.08), Math.max(w, h) * 0.7
      );
      const h1 = (280 + Math.sin(time * 0.55) * 25);
      g1.addColorStop(0, `hsla(${h1}, 75%, 65%, ${0.30 + Math.sin(time * 0.7) * 0.08})`);
      g1.addColorStop(0.35, `hsla(${h1 - 15}, 65%, 55%, ${0.20 + Math.cos(time * 0.6) * 0.05})`);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, w, h);

      // 光斑2: 左侧 蓝色
      const g2 = ctx.createRadialGradient(
        w * (0.1 + Math.cos(time * 0.38) * 0.08),
        h * (0.5 + Math.sin(time * 0.42) * 0.07), 0,
        w * (0.1 + Math.cos(time * 0.38) * 0.08),
        h * (0.5 + Math.sin(time * 0.42) * 0.07), Math.max(w, h) * 0.6
      );
      const h2 = (212 + Math.sin(time * 0.48 + 1) * 20);
      g2.addColorStop(0, `hsla(${h2}, 82%, 60%, ${0.26 + Math.sin(time * 0.8) * 0.07})`);
      g2.addColorStop(0.4, `hsla(${h2 + 10}, 72%, 50%, ${0.16 + Math.cos(time * 0.65) * 0.04})`);
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);

      // 光斑3: 中下 青色
      const g3 = ctx.createRadialGradient(
        w * (0.55 + Math.sin(time * 0.35) * 0.1),
        h * (0.75 + Math.cos(time * 0.38) * 0.06), 0,
        w * (0.55 + Math.sin(time * 0.35) * 0.1),
        h * (0.75 + Math.cos(time * 0.38) * 0.06), Math.max(w, h) * 0.5
      );
      const h3 = (185 + Math.sin(time * 0.5 + 2) * 18);
      g3.addColorStop(0, `hsla(${h3}, 72%, 56%, ${0.22 + Math.sin(time * 0.72) * 0.06})`);
      g3.addColorStop(0.5, `hsla(${h3 + 8}, 62%, 46%, ${0.12 + Math.cos(time * 0.58) * 0.03})`);
      g3.addColorStop(1, 'transparent');
      ctx.fillStyle = g3; ctx.fillRect(0, 0, w, h);

      // 暖光斑: 左上 金色
      const g4 = ctx.createRadialGradient(
        w * (0.05 + Math.cos(time * 0.3) * 0.06),
        h * (0.12 + Math.sin(time * 0.35) * 0.05), 0,
        w * (0.05 + Math.cos(time * 0.3) * 0.06),
        h * (0.12 + Math.sin(time * 0.35) * 0.05), Math.max(w, h) * 0.4
      );
      g4.addColorStop(0, `hsla(${42 + Math.sin(time * 0.42) * 15}, 85%, 62%, ${0.12 + Math.sin(time * 0.55) * 0.05})`);
      g4.addColorStop(1, 'transparent');
      ctx.fillStyle = g4; ctx.fillRect(0, 0, w, h);

      // 高光条
      const stripY = h * (0.4 + Math.sin(time * 0.28) * 0.12);
      const stripGrad = ctx.createLinearGradient(0, stripY - 40, 0, stripY + 40);
      stripGrad.addColorStop(0, 'transparent');
      stripGrad.addColorStop(0.5, `rgba(210, 225, 255, ${0.06 + Math.sin(time * 0.5) * 0.025})`);
      stripGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = stripGrad; ctx.fillRect(0, 0, w, h);

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
// Layer 1: SVG 流动飘带 — 真正的曲线！
// 用贝塞尔曲线路径绘制对角线方向的流动光带
// 关键：路径是 S 形弯曲线条，不是水平直条
// ============================================================
function FlowingRibbons() {
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-hidden w-full h-full"
      aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1440 500">
      <defs>
        {/* 模糊滤镜 */}
        <filter id="rib-blur-heavy"><feGaussianBlur stdDeviation="35" /></filter>
        <filter id="rib-blur-med"><feGaussianBlur stdDeviation="22" /></filter>
        <filter id="rib-blur-light"><feGaussianBlur stdDeviation="14" /></filter>

        {/* 主飘带渐变：粉→紫→蓝 沿对角线 */}
        <linearGradient id="rib-grad-a" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(236,72,153,0.25)" />
          <stop offset="25%" stopColor="rgba(168,85,247,0.32)" />
          <stop offset="50%" stopColor="rgba(139,92,246,0.28)" />
          <stop offset="75%" stopColor="rgba(99,102,241,0.22)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.12)" />
        </linearGradient>

        {/* 副飘带渐变：青→蓝→靛 */}
        <linearGradient id="rib-grad-b" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.20)" />
          <stop offset="35%" stopColor="rgba(56,189,248,0.26)" />
          <stop offset="65%" stopColor="rgba(99,102,241,0.20)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0.14)" />
        </linearGradient>

        {/* 第三飘带：淡金→粉（暖色调和） */}
        <linearGradient id="rib-grad-c" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.12)" />
          <stop offset="40%" stopColor="rgba(251,146,146,0.16)" />
          <stop offset="70%" stopColor="rgba(236,72,153,0.14)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>

        {/* 第四飘带：底部柔和蓝白过渡 */}
        <linearGradient id="rib-grad-d" x1="0%" y1="80%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="30%" stopColor="rgba(186,230,253,0.16)" />
          <stop offset="70%" stopColor="rgba(167,199,251,0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* ====== 飘带1: 主S形曲线 — 从左上流向右下 ====== */}
      {/* 路径：从左侧中上部出发，S形弯曲到右侧中部，像一条真正的光带在流动 */}
      <path
        d="M -50,120
           C 200,80   350,220  600,180
           C 850,140  1050,280 1300,200
           C 1450,160 1500,180 1500,180
           L 1500,260
           C 1250,320 1000,200 750,260
           C 500,320  250,180 0,240
           Z"
        fill="url(#rib-grad-a)"
        filter="url(#rib-blur-heavy)"
        className="ribbon-main"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* ====== 飘带2: 反向曲线 — 从右上流向左下 ====== */}
      <path
        d="M 1490,300
           C 1200,340 1000,200 750,260
           C 500,320  250,180  -20,240
           L -20,310
           C 250,370 550,270 800,320
           C 1050,370 1280,360 1490,380
           Z"
        fill="url(#rib-grad-b)"
        filter="url(#rib-blur-med)"
        className="ribbon-sub"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* ====== 飘带3: 顶部轻柔暖光曲线 ====== */}
      <path
        d="M -30,30
           C 300,-10  500,90   850,40
           C 1150,-5 1350,60  1480,30
           L 1480,90
           C 1250,120 1000,50 700,100
           C 400,150  150,80  -30,100
           Z"
        fill="url(#rib-grad-c)"
        filter="url(#rib-blur-light)"
        className="ribbon-warm"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* ====== 飘带4: 底部过渡曲线 ====== */}
      <path
        d="M -20,420
           C 300,380 600,450 900,410
           C 1150,375 1350,440 1480,400
           L 1480,500
           L -20,500
           Z"
        fill="url(#rib-grad-d)"
        filter="url(#rib-blur-light)"
        className="ribbon-bot"
      />
    </svg>
  );
}

// ============================================================
// Layer 2: 舞台光束（弱化版）
// ============================================================
function LightBeams() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="beam" style={{
        left: '-10%', top: '-5%',
        width: '70%', height: '200%',
        background: [
          'linear-gradient(105deg,',
          'rgba(255,220,150,0.05) 0%,',
          'rgba(255,200,120,0.03) 30%,',
          'transparent 60%)'
        ].join(' '),
        transform: 'rotate(-12deg)',
        animation: 'beam-sweep-a 14s ease-in-out infinite alternate',
      }} />
      <div className="beam" style={{
        right: '-15%', top: '-10%',
        width: '60%', height: '180%',
        background: [
          'linear-gradient(285deg,',
          'rgba(180,160,255,0.04) 0%,',
          'rgba(147,130,255,0.02) 35%,',
          'transparent 60%)'
        ].join(' '),
        transform: 'rotate(8deg)',
        animation: 'beam-sweep-b 18s ease-in-out infinite alternate-reverse',
        animationDelay: '3s',
      }} />
    </div>
  );
}

// ============================================================
// Layer 3: 精致星光
// ============================================================
function StarSparks() {
  const stars = [
    { x: '15%', y: '18%', size: 2.5, delay: 0 },
    { x: '80%', y: '12%', size: 2, delay: 1.2 },
    { x: '58%', y: '35%', size: 1.8, delay: 2.5 },
    { x: '22%', y: '65%', size: 2, delay: 0.8 },
    { x: '85%', y: '52%', size: 1.5, delay: 3.1 },
    { x: '45%', y: '15%', size: 1.4, delay: 1.8 },
    { x: '6%',  y: '38%', size: 1.8, delay: 0.5 },
    { x: '94%', y: '75%', size: 1.3, delay: 2.2 },
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
          boxShadow: ['0 0 ', (s.size * 3).toString(), 'px rgba(180,200,255,', (0.3 + s.size * 0.05).toString(), '), 0 0 ', (s.size * 6).toString(), 'px rgba(147,153,255,0.15)'].join(''),
          animation: [`spark-twinkle ${(3 + s.delay % 2)}s ease-in-out infinite`, `spark-float ${(7 + i)}s ease-in-out infinite alternate`].join(', '),
          animationDelay: [s.delay.toString(), 's'].join(''),
        }} />
      ))}
    </div>
  );
}

const keyframes = `
  /* ---- 飘带流动动画 — 轻微偏移模拟流动感 ---- */
  @keyframes ribbon-drift-main {
    0%   { transform: translateX(0) translateY(0) skewX(0deg); opacity: 0.85; }
    33%  { transform: translateX(18px) translateY(-6px) skewX(0.5deg); opacity: 1; }
    66%  { transform: translateX(-10px) translateY(4px) skewX(-0.3deg); opacity: 0.88; }
    100% { transform: translateX(12px) translateY(-3px) skewX(0.2deg); opacity: 0.92; }
  }
  @keyframes ribbon-drift-sub {
    0%   { transform: translateX(0) translateY(0); opacity: 0.78; }
    40%  { transform: translateX(-22px) translateY(8px); opacity: 0.96; }
    75%  { transform: translateX(14px) translateY(-5px); opacity: 0.82; }
    100% { transform: translateX(-8px) translateY(3px); opacity: 0.88; }
  }

  /* ---- 光束扫描 ---- */
  @keyframes beam-sweep-a {
    0%   { opacity: 0.4; transform: rotate(-12deg) translateX(-20px); }
    50%  { opacity: 0.9; transform: rotate(-10deg) translateX(30px); }
    100% { opacity: 0.5; transform: rotate(-13deg) translateX(10px); }
  }
  @keyframes beam-sweep-b {
    0%   { opacity: 0.3; transform: rotate(8deg) translateX(15px); }
    50%  { opacity: 0.8; transform: rotate(10deg) translateX(-25px); }
    100% { opacity: 0.4; transform: rotate(7deg) translateX(-10px); }
  }

  /* ---- 星光闪烁 ---- */
  @keyframes spark-twinkle {
    0%, 100% { opacity: 0.3; transform: scale(0.7); }
    50%      { opacity: 1; transform: scale(1.3); }
  }
  @keyframes spark-float {
    0%   { transform: translateY(0); }
    100% { transform: translateY(-8px); }
  }

  /* ---- 公共类 ---- */
  .ribbon-main {
    animation: ribbon-drift-main 16s ease-in-out infinite alternate;
  }
  .ribbon-sub {
    animation: ribbon-drift-sub 20s ease-in-out infinite alternate-reverse;
    animation-delay: 2.5s;
  }
  .ribbon-warm {
    animation: ribbon-drift-main 18s ease-in-out infinite alternate;
    animation-delay: 4s;
    opacity: 0.8;
  }
  .ribbon-bot {
    opacity: 0.9;
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
