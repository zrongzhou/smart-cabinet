'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v194 — 真正的极光彩带 · 曲线流动 · 协调蓝青
//
// v193 反馈："不像彩带的感觉"
// 根因（致命）：
//   ❌ 无论怎么调椭圆+blur → 永远是"一团光晕"，不是"飘带"
//   ❌ 椭圆没有方向性/长度感 = 无法模拟丝带/布条
//   ❌ rotate + translate 的动画 = 整块晃动 ≠ 飘带流动
//
// v194 策略：TRUE RIBBONS（真彩带）
//   ✅ 用 SVG <path> 贝塞尔曲线绘制真正的长条形光带
//   ✅ stroke 描边（非 fill 填充）→ 有线条感/长度感
//   ✅ 路径本身呈波浪形弯曲 → 天然的飘动感
//   ✅ 路径上有颜色渐变 → 彩虹/极光的色带感
//   ✅ 动画：路径上的 dashoffset 移动 → 光沿带子流动
//   ✅ 色域锁定：天青195° + 蓝220° + 靛238°
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
      {/* Layer 1: Canvas — 明亮深海底色 */}
      <BrightOceanBase />

      {/* Layer 2: 极光彩带 — SVG贝塞尔曲线（核心！） */}
      <AuroraRibbons />

      {/* Layer 3: 微尘星光 */}
      <DustSparkles />

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
// BrightOceanBase — 明亮深海渐变底色
// ============================================================
function BrightOceanBase() {
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
      time += 0.006;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // ── 底色：明亮海洋渐变 ──
      const hueShift = Math.sin(time * 0.25) * 5;
      const bg = ctx.createLinearGradient(0, 0, w * 0.45, h);
      bg.addColorStop(0, `hsl(${200 + hueShift}, 50%, ${15 + Math.sin(time * 0.35) * 2}%)`);
      bg.addColorStop(0.35, `hsl(${210 + hueShift}, 52%, ${18 + Math.cos(time * 0.3) * 2}%)`);
      bg.addColorStop(0.65, `hsl(${218 + hueShift}, 48%, ${22 + Math.sin(time * 0.28) * 1.5}%)`);
      bg.addColorStop(1, `hsl(${212 + hueShift}, 45%, ${16}%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── 中央环境光晕 ──
      const gx = w * (0.50 + Math.sin(time * 0.22) * 0.10);
      const gy = h * (0.38 + Math.cos(time * 0.20) * 0.08);
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.55);
      glow.addColorStop(0, `rgba(110, 190, 255, ${0.12 + Math.sin(time * 0.35) * 0.04})`);
      glow.addColorStop(0.35, `rgba(70, 150, 230, ${0.06})`);
      glow.addColorStop(0.70, `rgba(50, 120, 200, ${0.02})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
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
// AuroraRibbons — 真正的极光彩带！
//
// 关键技术：
//   - SVG <path> 贝塞尔曲线（不是 ellipse！）
//   - stroke 描边（不是 fill！）→ 有线条感/长度感
//   - 路径呈波浪形 S形弯曲 → 天然飘动感
//   - stroke 渐变色 → 色带感
//   - filter: drop-shadow + blur → 发光效果
//   - CSS animation: stroke-dashoffset → 光沿带子流动
//   - CSS animation: 路径整体微微波动
// ============================================================
function AuroraRibbons() {
  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible"
      aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 1440 400">
      <defs>
        {/* 发光滤镜 */}
        <filter id="ribbon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="ribbon-glow-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="20" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* 主带渐变：天青→蓝→靛 */}
        <linearGradient id="ribbon-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(125,211,252,0.05)" />
          <stop offset="15%" stopColor="rgba(125,211,252,0.30)" />
          <stop offset="38%" stopColor="rgba(96,165,250,0.50)" />
          <stop offset="58%" stopColor="rgba(59,130,246,0.42)" />
          <stop offset="78%" stopColor="rgba(99,102,241,0.28)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0.04)" />
        </linearGradient>

        {/* 第二带渐变：靛蓝偏移 */}
        <linearGradient id="ribbon-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(165,180,252,0.03)" />
          <stop offset="20%" stopColor="rgba(139,92,246,0.32)" />
          <stop offset="48%" stopColor="rgba(99,102,241,0.46)" />
          <stop offset="70%" stopColor="rgba(79,70,229,0.30)" />
          <stop offset="100%" stopColor="rgba(79,70,229,0.03)" />
        </linearGradient>

        {/* 第三带渐变：青色 */}
        <linearGradient id="ribbon-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(103,232,249,0.02)" />
          <stop offset="25%" stopColor="rgba(34,211,238,0.26)" />
          <stop offset="52%" stopColor="rgba(6,182,212,0.40)" />
          <stop offset="75%" stopColor="rgba(59,130,246,0.22)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.02)" />
        </linearGradient>

        {/* 第四带渐变：淡天青（顶部柔光）*/}
        <linearGradient id="ribbon-grad-4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="30%" stopColor="rgba(186,230,253,0.18)" />
          <stop offset="55%" stopColor="rgba(147,197,253,0.28)" />
          <stop offset="75%" stopColor="rgba(125,211,252,0.16)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>

        {/* 第五带渐变：底部过渡 */}
        <linearGradient id="ribbon-grad-5" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="25%" stopColor="rgba(96,165,250,0.14)" />
          <stop offset="55%" stopColor="rgba(59,130,246,0.10)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* ══════════════ 彩带 1：主带 —— 最粗最亮的天青蓝大波浪 ══════════════ */}
      <path className="ar-ribbon ar-ribbon-1"
        d="M -80,160
           C 150,90 300,240 520,170
           C 720,100 900,260 1120,180
           C 1320,110 1450,190 1520,160"
        filter="url(#ribbon-glow)"
      />

      {/* ══════════════ 彩带 2：副带 —— 靛蓝色交叉波浪 ══════════════ */}
      <path className="ar-ribbon ar-ribbon-2"
        d="M -60,280
           C 180,200 360,340 580,260
           C 780,190 980,320 1180,250
           C 1350,195 1480,270 1540,250"
        filter="url(#ribbon-glow)"
      />

      {/* ══════════════ 彩带 3：侧带 —— 青色细波 ══════════════ */}
      <path className="ar-ribbon ar-ribbon-3"
        d="M 100,-20
           C 280,60 420,140 600,100
           C 800,50 1000,150 1200,90
           C 1380,30 1480,80 1550,60"
        filter="url(#ribbon-glow-soft)"
      />

      {/* ══════════════ 彩带 4：顶带 —— 柔和天青过渡 ══════════════ */}
      <path className="ar-ribbon ar-ribbon-4"
        d="M -40,50
           C 200,10 450,80 700,35
           C 920,-5 1150,65 1380,25
           C 1490,5 1530,40 1560,30"
        filter="url(#ribbon-glow-soft)"
      />

      {/* ══════════════ 彩带 5：底带 —— 过渡到白色内容区 ══════════════ */}
      <path className="ar-ribbon ar-ribbon-5"
        d="M 100,350
           C 320,310 550,380 780,340
           C 1000,300 1220,365 1420,330
           C 1500,315 1540,345 1580,330"
        filter="url(#ribbon-glow-soft)"
      />
    </svg>
  );
}

// ============================================================
// DustSparkles — 微尘星光
// ============================================================
function DustSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="ds-sparkle ds-1" />
      <div className="ds-sparkle ds-2" />
      <div className="ds-sparkle ds-3" />
      <div className="ds-sparkle ds-4" />
      <div className="ds-sparkle ds-5" />
      <div className="ds-sparkle ds-6" />
    </div>
  );
}

const styles = `
  /* ====== 极光彩带（核心！）====== */
  .ar-ribbon {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    will-change: stroke-dashoffset, opacity, transform;
    mix-blend-mode: screen;
    pointer-events: none;
  }

  /* 主带：最粗最亮 */
  .ar-ribbon-1 {
    stroke: url(#ribbon-grad-1);
    stroke-width: 36;
    animation:
      ar-flow-1 11s linear infinite,
      ar-wave-1 17s ease-in-out infinite alternate,
      ar-breathe 7s ease-in-out infinite alternate;
  }

  /* 副带：靛蓝色 */
  .ar-ribbon-2 {
    stroke: url(#ribbon-grad-2);
    stroke-width: 28;
    animation:
      ar-flow-2 14s linear infinite reverse,
      ar-wave-2 19s ease-in-out infinite alternate-reverse,
      ar-breathe 9s ease-in-out infinite alternate-reverse;
    animation-delay: -3s;
  }

  /* 侧带：青色 */
  .ar-ribbon-3 {
    stroke: url(#ribbon-grad-3);
    stroke-width: 20;
    animation:
      ar-flow-3 9s linear infinite,
      ar-wave-3 13s ease-in-out infinite alternate,
      ar-breathe 6s ease-in-out infinite alternate;
    animation-delay: -5s;
  }

  /* 顶带：柔和天青 */
  .ar-ribbon-4 {
    stroke: url(#ribbon-grad-4);
    stroke-width: 16;
    animation:
      ar-flow-4 16s linear infinite reverse,
      ar-wave-4 21s ease-in-out infinite alternate-reverse,
      ar-breathe 10s ease-in-out infinite alternate;
    animation-delay: -7s;
  }

  /* 底带：过渡 */
  .ar-ribbon-5 {
    stroke: url(#ribbon-grad-5);
    stroke-width: 14;
    animation:
      ar-flow-5 12s linear infinite,
      ar-wave-5 15s ease-in-out infinite alternate,
      ar-breathe 8s ease-in-out infinite alternate-reverse;
    animation-delay: -2s;
  }

  /* ---- 光沿带子流动（stroke-dashoffset 动画）---- */
  @keyframes ar-flow-1 {
    from { stroke-dasharray: 400 800; stroke-dashoffset: 1200; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes ar-flow-2 {
    from { stroke-dasharray: 300 700; stroke-dashoffset: 1000; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes ar-flow-3 {
    from { stroke-dasharray: 200 500; stroke-dashoffset: 700; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes ar-flow-4 {
    from { stroke-dasharray: 250 600; stroke-dashoffset: 850; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes ar-flow-5 {
    from { stroke-dasharray: 200 500; stroke-dashoffset: 700; }
    to   { stroke-dashoffset: 0; }
  }

  /* ---- 路径整体波动（transform） ---- */
  @keyframes ar-wave-1 {
    0%   { transform: translateY(0) scaleY(1); opacity: 0.88; }
    33%  { transform: translateY(-12px) scaleY(1.06); opacity: 1; }
    66%  { transform: translateY(8px) scaleY(0.96); opacity: 0.92; }
    100% { transform: translateY(-5px) scaleY(1.02); opacity: 0.96; }
  }
  @keyframes ar-wave-2 {
    0%   { transform: translateY(0); opacity: 0.82; }
    40%  { transform: translateY(10px); opacity: 1; }
    75%  { transform: translateY(-8px); opacity: 0.88; }
    100% { transform: translateY(5px); opacity: 0.94; }
  }
  @keyframes ar-wave-3 {
    0%   { transform: translateY(0) scaleX(1); }
    50%  { transform: translateY(-10px) scaleX(1.04); }
    100% { transform: translateY(6px) scaleX(0.98); }
  }
  @keyframes ar-wave-4 {
    0%   { transform: translateY(0); }
    50%  { transform: translateY(8px); }
    100% { transform: translateY(-4px); }
  }
  @keyframes ar-wave-5 {
    0%   { transform: translateY(0); }
    50%  { transform: translateY(-6px); }
    100% { transform: translateY(4px); }
  }

  /* ---- 呼吸透明度脉动 ---- */
  @keyframes ar-breathe {
    0%   { opacity: 0.76; }
    50%  { opacity: 1; }
    100% { opacity: 0.86; }
  }

  /* ====== 微尘星光 ====== */
  .ds-sparkle {
    position: absolute;
    border-radius: 50%;
    will-change: transform, opacity;
    pointer-events: none;
  }

  .ds-1 {
    width: 3.5px; height: 3.5px;
    left: 22%; top: 18%;
    background: rgba(186, 230, 253, 0.95);
    box-shadow: 0 0 8px 2.5px rgba(147, 197, 253, 0.45);
    animation: ds-twinkle 3.5s ease-in-out infinite;
  }
  .ds-2 {
    width: 2.5px; height: 2.5px;
    right: 28%; top: 30%;
    background: rgba(167, 139, 250, 0.88);
    box-shadow: 0 0 6px 2px rgba(139, 92, 246, 0.38);
    animation: ds-twinkle 4.5s ease-in-out infinite reverse;
    animation-delay: -1.2s;
  }
  .ds-3 {
    width: 2.5px; height: 2.5px;
    left: 52%; top: 12%;
    background: rgba(125, 211, 252, 0.92);
    box-shadow: 0 0 6px 2px rgba(96, 165, 250, 0.40);
    animation: ds-twinkle 3s ease-in-out infinite;
    animation-delay: -2.5s;
  }
  .ds-4 {
    width: 3px; height: 3px;
    left: 10%; top: 52%;
    background: rgba(103, 232, 249, 0.85);
    box-shadow: 0 0 7px 2px rgba(34, 211, 238, 0.35);
    animation: ds-twinkle 5.5s ease-in-out infinite reverse;
    animation-delay: -3.5s;
  }
  .ds-5 {
    width: 2px; height: 2px;
    right: 15%; top: 58%;
    background: rgba(196, 181, 253, 0.78);
    box-shadow: 0 0 5px 1.2px rgba(167, 139, 250, 0.30);
    animation: ds-twinkle 4s ease-in-out infinite;
    animation-delay: -0.6s;
  }
  .ds-6 {
    width: 3px; height: 3px;
    left: 38%; top: 68%;
    background: rgba(147, 197, 253, 0.82);
    box-shadow: 0 0 6px 2px rgba(96, 165, 250, 0.32);
    animation: ds-twinkle 6s ease-in-out infinite reverse;
    animation-delay: -4.8s;
  }

  @keyframes ds-twinkle {
    0%, 100% { opacity: 0.4; transform: scale(0.7); }
    50%      { opacity: 1; transform: scale(1.4); }
  }
`;
