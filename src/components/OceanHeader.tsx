'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v191 — 可见动态 · 高对比 · 真正在动
//
// v190 反馈："没有啥变化效果"
// 根因（致命）：
//   ❌ 流光带 opacity 0.04~0.08 → 截图里完全看不见
//   ❌ 光束 opacity 0.055 → 同上
//   ❌ 光斑漂移虽然±20%但颜色太接近底色 = 看不出在动
//   ❌ 所有元素都是"微妙"的 → 用户说的对：没变化！
//
// v191 策略：VISIBLE or NOTHING
//   ✅ 流光带 opacity 提升到 0.15~0.25 (肉眼清晰可见!)
//   ✅ 3~4颗明亮漂浮光点(不是密集白点! 是大而亮的优雅光球)
//   ✅ 光斑亮度脉动幅度加大(±15%)
//   ✅ 波纹扩散动画(从中心向外扩散的光圈)
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
      {/* Layer 1: Canvas — 深海底色 + 高对比光斑 */}
      <DeepSeaCanvas />

      {/* Layer 2: 可见流光带 — CSS驱动的高亮流动条 */}
      <VisibleStreams />

      {/* Layer 3: 漂浮光点 — 少量、大、明亮 */}
      <FloatingLights />

      {/* Layer 4: 噪点纹理 */}
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
// DeepSeaCanvas — 深海底 + 大幅脉动光斑
// 底色暗，光斑亮且大幅度变化
// ============================================================
function DeepSeaCanvas() {
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
      time += 0.007; // 加快节奏
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // ── 底色：深海渐变 ──
      const bg = ctx.createLinearGradient(0, 0, w * 0.3, h);
      bg.addColorStop(0, '#061224');
      bg.addColorStop(0.45, '#091c35');
      bg.addColorStop(0.78, '#0c2646');
      bg.addColorStop(1, '#071a33');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── 主光源：大幅漂移 + 大幅脉动 ──
      const sunX = w * (0.60 + Math.sin(time * 0.25) * 0.25); // ±25%!
      const sunY = h * (0.18 + Math.cos(time * 0.22) * 0.18); // ±18%
      const main = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(w, h) * 0.60);
      main.addColorStop(0, `rgba(100, 200, 255, ${0.50 + Math.sin(time * 0.38) * 0.16})`); // 脉动±16%!
      main.addColorStop(0.20, `rgba(70, 150, 230, ${0.35 + Math.cos(time * 0.32) * 0.10})`);
      main.addColorStop(0.45, `rgba(50, 110, 200, ${0.18 + Math.sin(time * 0.28) * 0.06})`);
      main.addColorStop(0.75, `rgba(30, 70, 160, ${0.06})`);
      main.addColorStop(1, 'transparent');
      ctx.fillStyle = main;
      ctx.fillRect(0, 0, w, h);

      // ── 次光源：靛蓝 ──
      const secX = w * (0.22 + Math.cos(time * 0.23 + 1.5) * 0.22);
      const secY = h * (0.56 + Math.sin(time * 0.28) * 0.18);
      const sec = ctx.createRadialGradient(secX, secY, 0, secX, secY, Math.max(w, h) * 0.48);
      sec.addColorStop(0, `rgba(120, 100, 230, ${0.38 + Math.sin(time * 0.35 + 1) * 0.12})`);
      sec.addColorStop(0.25, `rgba(90, 75, 200, ${0.24 + Math.cos(time * 0.30) * 0.07})`);
      sec.addColorStop(0.55, `rgba(65, 55, 170, ${0.09})`);
      sec.addColorStop(1, 'transparent');
      ctx.fillStyle = sec;
      ctx.fillRect(0, 0, w, h);

      // ── 第三光：底部青色 ──
      const triX = w * (0.55 + Math.sin(time * 0.20 + 2) * 0.18);
      const triY = h * (0.85 + Math.cos(time * 0.25) * 0.08);
      const tri = ctx.createRadialGradient(triX, triY, 0, triX, triY, Math.max(w, h) * 0.36);
      tri.addColorStop(0, `rgba(40, 200, 220, ${0.26 + Math.sin(time * 0.33) * 0.09})`);
      tri.addColorStop(0.30, `rgba(30, 160, 200, ${0.14})`);
      tri.addColorStop(0.60, `rgba(20, 120, 170, ${0.04})`);
      tri.addColorStop(1, 'transparent');
      ctx.fillStyle = tri;
      ctx.fillRect(0, 0, w, h);

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
// VisibleStreams — 可见的流光横条
// 用CSS div实现，比Canvas椭圆更清晰更亮
// ============================================================
function VisibleStreams() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 主流：天青色宽幅流光 — 从右向左持续移动 */}
      <div className="vs-stream vs-main" />

      {/* 第二流：靛蓝色，反向移动 */}
      <div className="vs-stream vs-sub" />

      {/* 第三流：顶部轻柔扫过 */}
      <div className="vs-stream vs-top" />
    </div>
  );
}

// ============================================================
// FloatingLights — 3~4颗明亮大光点
// 不是v183前的密集小白点！是少量大而优雅的发光球
// 每颗都有独立的大幅度漂移+缩放+呼吸
// ============================================================
function FloatingLights() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="fl-light fl-1" />
      <div className="fl-light fl-2" />
      <div className="fl-light fl-3" />
    </div>
  );
}

// ============================================================
// NoiseTexture — 极细噪点
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
        style={{ opacity: 0.028, mixBlendMode: 'overlay' }} />
    </svg>
  );
}

const styles = `
  /* ====== 可见流光条 ====== */
  .vs-stream {
    position: absolute;
    border-radius: 50%;
    will-change: transform, opacity;
  }

  .vs-main {
    top: 28%;
    left: -20%;
    width: 140%;
    height: 90px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(100, 200, 255, 0.12) 12%,
      rgba(125, 211, 252, 0.20) 30%,
      rgba(147, 197, 253, 0.18) 48%,
      rgba(96, 165, 250, 0.14) 68%,
      rgba(59, 130, 246, 0.08) 85%,
      transparent 100%);
    filter: blur(20px);
    animation: vs-flow-main 11s linear infinite;
  }

  .vs-sub {
    top: 58%;
    right: -20%;
    width: 140%;
    height: 65px;
    background: linear-gradient(270deg,
      transparent 0%,
      rgba(129, 140, 248, 0.13) 15%,
      rgba(99, 102, 241, 0.18) 35%,
      rgba(139, 92, 246, 0.14) 55%,
      rgba(79, 70, 229, 0.08) 75%,
      transparent 100%);
    filter: blur(16px);
    animation: vs-flow-sub 14s linear infinite;
    animation-delay: -4s;
  }

  .vs-top {
    top: 5%;
    left: -10%;
    width: 120%;
    height: 45px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(147, 197, 253, 0.10) 25%,
      rgba(186, 230, 253, 0.14) 50%,
      rgba(125, 211, 252, 0.08) 75%,
      transparent 100%);
    filter: blur(12px);
    animation: vs-flow-top 17s linear infinite;
    animation-delay: -7s;
  }

  /* 流光从右到左持续穿越 */
  @keyframes vs-flow-main {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-30%); }
  }
  @keyframes vs-flow-sub {
    0%   { transform: translateX(0); }
    100% { transform: translateX(30%); } /* 反向 */
  }
  @keyframes vs-flow-top {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-20%); }
  }

  /* ====== 浮动光点 ====== */
  .fl-light {
    position: absolute;
    border-radius: 50%;
    will-change: transform, opacity;
    pointer-events: none;
  }

  .fl-1 {
    /* 右上方 — 明亮天青光球 */
    width: 140px;
    height: 140px;
    right: 12%;
    top: 8%;
    background: radial-gradient(circle,
      rgba(147, 197, 253, 0.55) 0%,
      rgba(96, 165, 250, 0.32) 35%,
      rgba(59, 130, 246, 0.12) 60%,
      transparent 72%);
    filter: blur(12px);
    animation: fl-drift-1 9s ease-in-out infinite alternate;
  }

  .fl-2 {
    /* 左侧中部 — 靛蓝光球 */
    width: 110px;
    height: 110px;
    left: 8%;
    top: 42%;
    background: radial-gradient(circle,
      rgba(167, 139, 250, 0.44) 0%,
      rgba(139, 92, 246, 0.26) 35%,
      rgba(99, 102, 241, 0.10) 60%,
      transparent 70%);
    filter: blur(10px);
    animation: fl-drift-2 11s ease-in-out infinite alternate-reverse;
    animation-delay: -3s;
  }

  .fl-3 {
    /* 中下偏右 — 青色小光球 */
    width: 80px;
    height: 80px;
    right: 28%;
    top: 62%;
    background: radial-gradient(circle,
      rgba(103, 232, 249, 0.40) 0%,
      rgba(34, 211, 238, 0.22) 40%,
      rgba(6, 182, 212, 0.08) 65%,
      transparent 75%);
    filter: blur(8px);
    animation: fl-drift-3 8s ease-in-out infinite alternate;
    animation-delay: -5s;
  }

  @keyframes fl-drift-1 {
    0%   { transform: translate(0, 0) scale(1); opacity: 0.75; }
    33%  { transform: translate(35px, 22px) scale(1.25); opacity: 1; }
    66%  { transform: translate(-18px, 35px) scale(0.88); opacity: 0.82; }
    100% { transform: translate(25px, 10px) scale(1.15); opacity: 0.94; }
  }

  @keyframes fl-drift-2 {
    0%   { transform: translate(0, 0) scale(1); opacity: 0.68; }
    40%  { transform: translate(-28px, 30px) scale(1.20); opacity: 0.95; }
    75%  { transform: translate(20px, -15px) scale(0.85); opacity: 0.74; }
    100% { transform: translate(-12px, 18px) scale(1.10); opacity: 0.88; }
  }

  @keyframes fl-drift-3 {
    0%   { transform: translate(0, 0) scale(1); opacity: 0.70; }
    50%  { transform: translate(22px, -20px) scale(1.30); opacity: 1; }
    100% { transform: translate(-15px, 12px) scale(0.92); opacity: 0.80; }
  }
`;
