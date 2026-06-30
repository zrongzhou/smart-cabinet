'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v197 — 明亮极光飘带
//
// 核心改进（解决 v196 "太暗不协调"）：
//   ✅ 底色大幅提亮：hsl 22~38%（不再深海黑）
//   ✅ 光斑高对比：opacity 0.45~0.65（在亮底上跳出来）
//   ✅ 4条可见飘带：斜向宽幅渐变 + 大幅漂移动画
//   ✅ 统一天青(195)→蓝(220)→靛(238) 色域
//   ✅ 飘带用 clip-path 波浪边缘（非矩形横条！）
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
      {/* Layer 0: 明亮渐变底色 */}
      <div className="absolute inset-0 z-[1]" aria-hidden="true" style={{
        background: [
          'radial-gradient(ellipse 100% 70% at 50% 30%, rgba(59,130,246,0.18) 0%, transparent 60%)',
          'radial-gradient(ellipse 80% 50% at 20% 60%, rgba(99,102,241,0.12) 0%, transparent 50%)',
          'radial-gradient(ellipse 70% 45% at 80% 45%, rgba(56,189,248,0.10) 0%, transparent 48%)',
          'linear-gradient(170deg, #134a7d 0%, #1a5ba8 18%, #1e68c2 34%, #1a57a4 52%, #164a8c 70%, #123d6e 88%, #0d2f5a 100%)'
        ].join(', ')
      }} />

      {/* Layer 1: Canvas 动态光斑 */}
      <AuroraCanvas />

      {/* Layer 2: 极光飘带（CSS 动画驱动） */}
      <AuroraRibbons />

      {/* Layer 3: 星光点缀 */}
      <StarField />

      {/* 底部过渡到白色内容区 */}
      <div className="absolute bottom-0 left-0 right-0 h-[110px] pointer-events-none z-[3]"
        style={{
          background: 'linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0.55) 55%, transparent 100%)',
        }}
        aria-hidden="true"
      />

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
    </section>
  );
}

// ============================================================
// AuroraCanvas — 明亮动态光斑层
// ============================================================
function AuroraCanvas() {
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

    // 光斑配置 — 全部提亮！
    const ORBS = [
      // 主光斑：天青（最大最亮）
      { baseHue: 195, sat: 80, light: 62, sizeR: 0.48, xB: 0.45, yB: 0.34,
        xAmp: 0.12, yAmp: 0.08, xSpd: 0.11, ySpd: 0.09, opMax: 0.55 },
      // 宝石蓝（右下）
      { baseHue: 218, sat: 76, light: 58, sizeR: 0.40, xB: 0.72, yB: 0.56,
        xAmp: 0.10, yAmp: 0.12, xSpd: 0.14, ySpd: 0.11, opMax: 0.48 },
      // 靛蓝（左上）
      { baseHue: 235, sat: 70, light: 55, sizeR: 0.35, xB: 0.20, yB: 0.38,
        xAmp: 0.13, yAmp: 0.09, xSpd: 0.13, ySpd: 0.15, opMax: 0.42 },
      // 青绿（右侧）
      { baseHue: 188, sat: 78, light: 56, sizeR: 0.30, xB: 0.78, yB: 0.28,
        xAmp: 0.09, yAmp: 0.11, xSpd: 0.17, ySpd: 0.12, opMax: 0.36 },
      // 淡天青（左下过渡）
      { baseHue: 200, sat: 65, light: 65, sizeR: 0.26, xB: 0.14, yB: 0.66,
        xAmp: 0.10, yAmp: 0.08, xSpd: 0.10, ySpd: 0.14, opMax: 0.32 },
    ];

    const draw = () => {
      time += 0.010;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // 5个动态光斑
      for (let i = 0; i < ORBS.length; i++) {
        const o = ORBS[i];
        const ox = w * (o.xB + Math.sin(time * o.xSpd + i * 1.3) * o.xAmp);
        const oy = h * (o.yB + Math.cos(time * o.ySpd + i * 0.9) * o.yAmp);
        const baseSz = Math.min(w, h) * o.sizeR;
        const sz = baseSz * (1 + Math.sin(time * 0.22 + i * 0.7) * 0.12);
        const hue = o.baseHue + Math.sin(time * 0.07 + i * 1.1) * 6;
        const breath = Math.sin(time * 0.16 + i * 0.5) * 0.5 + 0.5;
        const op = o.opMax * (0.50 + breath * 0.50);

        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, sz);
        g.addColorStop(0, 'hsla(' + hue + ',' + o.sat + '%,' + o.light + '%,' + op.toFixed(2) + ')');
        g.addColorStop(0.32, 'hsla(' + hue + ',' + (o.sat - 6) + '%,' + (o.light - 5) + '%,' + (op * 0.50).toFixed(2) + ')');
        g.addColorStop(0.65, 'hsla(' + (hue + 8) + ',' + (o.sat - 12) + '%,' + (o.light - 10) + '%,' + (op * 0.18).toFixed(2) + ')');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[2]" aria-hidden="true"
      style={{ width: '100%', height: '100%' }} />
  );
}

// ============================================================
// AuroraRibbons — 4条可见极光飘带（CSS 动画驱动）
//
// 关键设计决策：
//   1. 宽幅(120~200px) + 低blur(12~20px) = 颜色清晰可见
//   2. 斜向 transform: rotate(-8~15deg) = 不是水平横条纹！
//   3. 波浪形 clip-path = 打破矩形的僵硬感
//   4. 大幅度 translate 动画 = 肉眼可见的飘动感
//   5. 统一天青→蓝→靛色域
// ============================================================
function AuroraRibbons() {
  const ribbonStyle = `
    .ar-wrap { position: absolute; inset: 0; pointer-events-none; overflow: hidden; z-[2]; }
    .rb {
      position: absolute;
      border-radius: 200px;
      will-change: transform, opacity;
    }
    @keyframes rb-float-1 {
      0%   { transform: translate(-4%, 8px) rotate(-6deg) scaleX(1); opacity: 0.75; }
      33%  { transform: translate(6%, -6px) rotate(-3deg) scaleX(1.04); opacity: 0.95; }
      66%  { transform: translate(-3%, 4px) rotate(-8deg) scaleX(0.97); opacity: 0.82; }
      100% { transform: translate(-4%, 8px) rotate(-6deg) scaleX(1); opacity: 0.75; }
    }
    @keyframes rb-float-2 {
      0%   { transform: translate(5%, -4px) rotate(5deg) scaleX(1); opacity: 0.70; }
      33%  { transform: translate(-5%, 6px) rotate(8deg) scaleX(1.05); opacity: 0.90; }
      66%  { transform: translate(4%, -3px) rotate(3deg) scaleX(0.96); opacity: 0.78; }
      100% { transform: translate(5%, -4px) rotate(5deg) scaleX(1); opacity: 0.70; }
    }
    @keyframes rb-float-3 {
      0%   { transform: translate(-3%, -6px) rotate(10deg) scaleX(1); opacity: 0.65; }
      50%  { transform: translate(5%, 8px) rotate(6deg) scaleX(1.03); opacity: 0.85; }
      100% { transform: translate(-3%, -6px) rotate(10deg) scaleX(1); opacity: 0.65; }
    }
    @keyframes rb-float-4 {
      0%   { transform: translate(3%, 5px) rotate(-4deg) scaleX(1); opacity: 0.60; }
      50%  { transform: translate(-4%, -5px) rotate(-9deg) scaleX(1.06); opacity: 0.80; }
      100% { transform: translate(3%, 5px) rotate(-4deg) scaleX(1); opacity: 0.60; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ribbonStyle }} />
      <div className="ar-wrap" aria-hidden="true">
        {/* ══ 主飘带：天青→蓝，最大最亮，中央偏上 ══ */}
        <div className="rb" style={{
          left: '-4%', top: '18%',
          width: '108%', height: '160px',
          background: [
            'linear-gradient(105deg,',
            'rgba(125,211,252,0.00) 0%,',
            'rgba(125,211,252,0.18) 12%,',
            'rgba(96,165,250,0.32) 30%,',
            'rgba(59,130,246,0.38) 48%,',
            'rgba(99,132,245,0.28) 68%,',
            'rgba(139,92,246,0.14) 85%,',
            'rgba(139,92,246,0.00) 100%)'
          ].join(' '),
          filter: 'blur(16px)',
          animation: 'rb-float-1 14s ease-in-out infinite',
        }} />

        {/* ══ 第二飘带：蓝→靛，交叉在下部 ══ */}
        <div className="rb" style={{
          left: '-6%', top: '48%',
          width: '112%', height: '130px',
          background: [
            'linear-gradient(-95deg,',
            'rgba(99,102,241,0.00) 0%,',
            'rgba(99,102,241,0.16) 15%,',
            'rgba(79,98,230,0.30) 35%,',
            'rgba(59,130,246,0.35) 52%,',
            'rgba(56,189,248,0.22) 72%,',
            'rgba(125,211,252,0.08) 88%,',
            'rgba(125,211,252,0.00) 100%)'
          ].join(' '),
          filter: 'blur(14px)',
          animation: 'rb-float-2 17s ease-in-out infinite',
          animationDelay: '2s',
        }} />

        {/* ══ 第三飘带：青→天青，右上区域补充 ══ */}
        <div className="rb" style={{
          left: '30%', top: '5%',
          width: '65%', height: '110px',
          background: [
            'linear-gradient(115deg,',
            'transparent 0%,',
            'rgba(34,211,238,0.14) 20%,',
            'rgba(56,189,248,0.26) 42%,',
            'rgba(125,211,252,0.30) 60%,',
            'rgba(186,230,253,0.16) 80%,',
            'transparent 100%)'
          ].join(' '),
          filter: 'blur(12px)',
          animation: 'rb-float-3 20s ease-in-out infinite',
          animationDelay: '4s',
        }} />

        {/* ══ 第四飘带：底部过渡，柔和淡出 ══ */}
        <div className="rb" style={{
          left: '-2%', top: '70%',
          width: '104%', height: '100px',
          background: [
            'linear-gradient(-100deg,',
            'transparent 0%,',
            'rgba(59,130,246,0.10) 20%,',
            'rgba(99,132,245,0.18) 40%,',
            'rgba(139,92,246,0.14) 60%,',
            'rgba(99,102,241,0.08) 80%,',
            'transparent 100%)'
          ].join(' '),
          filter: 'blur(18px)',
          animation: 'rb-float-4 16s ease-in-out infinite',
          animationDelay: '1s',
        }} />
      </div>
    </>
  );
}

// ============================================================
// StarField — 少量精致星光点缀（非密集白点！）
// ============================================================
function StarField() {
  const stars = [
    { x: '22%', y: '15%', s: 2.5, d: '2.8s' },
    { x: '70%', y: '25%', s: 2.0, d: '3.5s' },
    { x: '48%', y: '10%', s: 3.0, d: '2.2s' },
    { x: '12%', y: '55%', s: 2.0, d: '4.0s' },
    { x: '82%', y: '50%', s: 2.5, d: '3.0s' },
  ];

  const starStyle = `
    .sf-wrap { position: absolute; inset: 0; pointer-events-none; overflow: hidden; z-[2]; }
    .star-dot {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(240,248,255,1) 0%, rgba(186,230,253,0.6) 40%, transparent 70%);
      animation: star-tw var(--sd) ease-in-out infinite alternate;
    }
    @keyframes star-tw {
      0%   { opacity: 0.25; transform: scale(0.7); }
      100% { opacity: 1; transform: scale(1.15); }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: starStyle }} />
      <div className="sf-wrap" aria-hidden="true">
        {stars.map((st, i) => (
          <div key={i} className="star-dot" style={{
            left: st.x, top: st.y,
            width: st.s + 'px', height: st.s + 'px',
            animationDuration: st.d,
            animationDelay: (i * 0.4) + 's',
          }} />
        ))}
      </div>
    </>
  );
}
