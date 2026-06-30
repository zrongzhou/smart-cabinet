'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v193 — 明亮极光光帘 · 强动态 · 协调蓝青
//
// v192 反馈："光帘和动态效果要更明显，整体亮度提亮，颜色需要协调"
// 根因：
//   ❌ 光帘 opacity 0.16~0.32 + blur 24~28px = 太淡看不清
//   ❌ 底色 hsl 7~13% = 太暗，光帘对比度不够
//   ❌ 摇曳动画 translate 仅 6~22px = 动态不明显
//   ❌ 5条光帘分散各处 = 没有视觉焦点
//
// v193 策略：BRIGHT AURORA（明亮极光）
//   ✅ 光帘提亮 2.5x：opacity 0.35~0.62（vs 之前 0.16~0.32）
//   ✅ 光帘 blur 降低：14~20px（vs 之前 20~28px）→ 颜色更清晰
//   ✅ 底色提亮 2x：hsl 12~22%（vs 之前 7~13%）
//   ✅ 摇曳幅度加大：translate 15~45px（vs 之前 6~22px）
//   ✅ 新增：中央主光帘更宽更大（420×560px）
//   ✅ 色域严格锁定：天青195° + 蓝220° + 靛238° + 青185°
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
      {/* Layer 1: Canvas — 提亮深海渐变底色 */}
      <BrightOceanBase />

      {/* Layer 2: 极光光帘 — 提亮+加大+强动态（核心视觉层） */}
      <AuroraCurtainsBright />

      {/* Layer 3: 微尘星光 — 少量精致亮点 */}
      <DustSparklesBright />

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
// BrightOceanBase — 提亮深海渐变底色
// 比v192亮2倍，让彩色光帘能跳出来
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

      // ── 底色：提亮深海渐变（hsl 12~22% vs 之前 7~13%）──
      const hueShift = Math.sin(time * 0.25) * 5;
      const bg = ctx.createLinearGradient(0, 0, w * 0.45, h);
      bg.addColorStop(0, `hsl(${200 + hueShift}, 50%, ${14 + Math.sin(time * 0.35) * 2}%)`);
      bg.addColorStop(0.35, `hsl(${210 + hueShift}, 52%, ${17 + Math.cos(time * 0.3) * 2}%)`);
      bg.addColorStop(0.65, `hsl(${218 + hueShift}, 48%, ${20 + Math.sin(time * 0.28) * 1.5}%)`);
      bg.addColorStop(1, `hsl(${212 + hueShift}, 45%, ${15}%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── 中央环境光晕：更亮更明显 ──
      const gx = w * (0.50 + Math.sin(time * 0.22) * 0.10);
      const gy = h * (0.38 + Math.cos(time * 0.20) * 0.08);
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.55);
      glow.addColorStop(0, `rgba(110, 190, 255, ${0.10 + Math.sin(time * 0.35) * 0.04})`);
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
// AuroraCurtainsBright — 提亮极光光帘
//
// 核心改进：
//   1. opacity 提亮 2.5x（0.35~0.62 vs 之前 0.16~0.32）
//   2. blur 降低（14~20px vs 之前 20~28px）→ 颜色更清晰
//   3. 中央主光帘加大（420×560px vs 之前 320×480px）
//   4. 摇曳幅度加大（translate 15~45px）
//   5. 呼吸脉动幅度加大（opacity 0.72~1.0 vs 之前 0.78~1.0）
// ============================================================
function AuroraCurtainsBright() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 光帘 1：中央主光帘 — 最大最亮，横跨画面中央 */}
      <div className="acb-curtain acb-main" />

      {/* 光帘 2：左上副帘 — 交叉重叠 */}
      <div className="acb-curtain acb-second" />

      {/* 光帘 3：右侧帘 — 青色调 */}
      <div className="acb-curtain acb-third" />

      {/* 光帘 4：顶部薄帘 — 柔和过渡 */}
      <div className="acb-curtain acb-fourth" />

      {/* 光帘 5：底部柔帘 — 过渡白色内容区 */}
      <div className="acb-curtain acb-bottom" />
    </div>
  );
}

// ============================================================
// DustSparklesBright — 微尘星光（提亮版）
// ============================================================
function DustSparklesBright() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="dsb-sparkle dsb-1" />
      <div className="dsb-sparkle dsb-2" />
      <div className="dsb-sparkle dsb-3" />
      <div className="dsb-sparkle dsb-4" />
      <div className="dsb-sparkle dsb-5" />
      <div className="dsb-sparkle dsb-6" />
    </div>
  );
}

const styles = `
  /* ====== 极光光帘（提亮版）====== */
  .acb-curtain {
    position: absolute;
    border-radius: 50%;
    will-change: transform, opacity;
    mix-blend-mode: screen;
    pointer-events: none;
  }

  /* 中央主光帘：最大最亮，天青→蓝色渐变 */
  .acb-main {
    width: 420px;
    height: 560px;
    left: 18%;
    top: -12%;
    transform: rotate(18deg);
    background: radial-gradient(ellipse 65% 85% at 50% 25%,
      rgba(125, 211, 252, 0.52) 0%,
      rgba(96, 165, 250, 0.42) 20%,
      rgba(59, 130, 246, 0.32) 42%,
      rgba(37, 99, 235, 0.18) 65%,
      rgba(29, 78, 216, 0.08) 82%,
      transparent 100%);
    filter: blur(18px);
    animation:
      acb-sway-main 12s ease-in-out infinite alternate,
      acb-breathe 6s ease-in-out infinite alternate;
  }

  /* 左上副帘：靛蓝色，交叉重叠 */
  .acb-second {
    width: 320px;
    height: 480px;
    right: 12%;
    top: -8%;
    transform: rotate(-14deg);
    background: radial-gradient(ellipse 60% 80% at 52% 28%,
      rgba(165, 180, 252, 0.45) 0%,
      rgba(139, 92, 246, 0.35) 25%,
      rgba(99, 102, 241, 0.24) 48%,
      rgba(79, 70, 229, 0.12) 70%,
      transparent 100%);
    filter: blur(16px);
    animation:
      acb-sway-second 15s ease-in-out infinite alternate-reverse,
      acb-breathe 8s ease-in-out infinite alternate-reverse;
    animation-delay: -2.5s;
  }

  /* 右侧帘：青色调 */
  .acb-third {
    width: 260px;
    height: 400px;
    right: 2%;
    top: 12%;
    transform: rotate(22deg);
    background: radial-gradient(ellipse 55% 75% at 48% 30%,
      rgba(103, 232, 249, 0.38) 0%,
      rgba(34, 211, 238, 0.28) 28%,
      rgba(6, 182, 212, 0.16) 52%,
      rgba(8, 145, 178, 0.06) 75%,
      transparent 100%);
    filter: blur(14px);
    animation:
      acb-sway-third 10s ease-in-out infinite alternate,
      acb-breathe 7s ease-in-out infinite alternate;
    animation-delay: -4s;
  }

  /* 顶部薄帘：柔和天青色过渡 */
  .acb-fourth {
    width: 500px;
    height: 220px;
    left: 25%;
    top: -5%;
    transform: rotate(6deg);
    background: radial-gradient(ellipse 70% 60% at 50% 40%,
      rgba(186, 230, 253, 0.28) 0%,
      rgba(147, 197, 253, 0.18) 32%,
      rgba(125, 211, 252, 0.10) 58%,
      transparent 100%);
    filter: blur(16px);
    animation:
      acb-sway-fourth 17s ease-in-out infinite alternate-reverse,
      acb-breathe 10s ease-in-out infinite alternate;
    animation-delay: -6s;
  }

  /* 底部柔帘：过渡到白色内容区 */
  .acb-bottom {
    width: 440px;
    height: 180px;
    left: 20%;
    bottom: 5%;
    transform: rotate(-4deg);
    background: radial-gradient(ellipse 80% 55% at 50% 45%,
      rgba(96, 165, 250, 0.20) 0%,
      rgba(59, 130, 246, 0.12) 38%,
      rgba(37, 99, 235, 0.05) 65%,
      transparent 100%);
    filter: blur(14px);
    animation: acb-sway-bottom 13s ease-in-out infinite alternate;
    animation-delay: -1.5s;
  }

  /* ---- 光帘摇曳动画（加大幅度）---- */
  @keyframes acb-sway-main {
    0%   { transform: rotate(18deg) translate(0, 0) scale(1); }
    25%  { transform: rotate(24deg) translate(22px, 28px) scale(1.06); }
    50%  { transform: rotate(15deg) translate(-12px, 35px) scale(0.96); }
    75%  { transform: rotate(22deg) translate(18px, 15px) scale(1.03); }
    100% { transform: rotate(20deg) translate(-8px, 28px) scale(1.01); }
  }
  @keyframes acb-sway-second {
    0%   { transform: rotate(-14deg) translate(0, 0) scale(1); }
    30%  { transform: rotate(-10deg) translate(-20px, 18px) scale(1.04); }
    60%  { transform: rotate(-18deg) translate(15px, -10px) scale(0.97); }
    100% { transform: rotate(-12deg) translate(-10px, 22px) scale(1.02); }
  }
  @keyframes acb-sway-third {
    0%   { transform: rotate(22deg) translate(0, 0) scale(1); }
    40%  { transform: rotate(28deg) translate(15px, 25px) scale(1.07); }
    75%  { transform: rotate(18deg) translate(-12px, 10px) scale(0.95); }
    100% { transform: rotate(25deg) translate(8px, 18px) scale(1.03); }
  }
  @keyframes acb-sway-fourth {
    0%   { transform: rotate(6deg) translate(0, 0); }
    45%  { transform: rotate(12deg) translate(25px, 10px); }
    100% { transform: rotate(3deg) translate(-15px, 6px); }
  }
  @keyframes acb-sway-bottom {
    0%   { transform: rotate(-4deg) translate(0, 0); }
    50%  { transform: rotate(-1deg) translate(18px, -8px); }
    100% { transform: rotate(-7deg) translate(-12px, 5px); }
  }

  /* ---- 光帘呼吸动画（加大幅度）---- */
  @keyframes acb-breathe {
    0%   { opacity: 0.72; }
    40%  { opacity: 1; }
    70%  { opacity: 0.85; }
    100% { opacity: 0.95; }
  }

  /* ====== 微尘星光（提亮版）====== */
  .dsb-sparkle {
    position: absolute;
    border-radius: 50%;
    will-change: transform, opacity;
    pointer-events: none;
  }

  .dsb-1 {
    width: 3.5px;
    height: 3.5px;
    left: 25%;
    top: 20%;
    background: rgba(186, 230, 253, 0.95);
    box-shadow: 0 0 8px 2.5px rgba(147, 197, 253, 0.45);
    animation: dsb-twinkle 3.5s ease-in-out infinite;
  }
  .dsb-2 {
    width: 2.5px;
    height: 2.5px;
    right: 30%;
    top: 32%;
    background: rgba(167, 139, 250, 0.88);
    box-shadow: 0 0 6px 2px rgba(139, 92, 246, 0.38);
    animation: dsb-twinkle 4.5s ease-in-out infinite reverse;
    animation-delay: -1.2s;
  }
  .dsb-3 {
    width: 2px;
    height: 2px;
    left: 52%;
    top: 14%;
    background: rgba(125, 211, 252, 0.92);
    box-shadow: 0 0 5px 1.5px rgba(96, 165, 250, 0.40);
    animation: dsb-twinkle 3s ease-in-out infinite;
    animation-delay: -2.5s;
  }
  .dsb-4 {
    width: 4px;
    height: 4px;
    left: 12%;
    top: 55%;
    background: rgba(103, 232, 249, 0.85);
    box-shadow: 0 0 8px 2.5px rgba(34, 211, 238, 0.35);
    animation: dsb-twinkle 5.5s ease-in-out infinite reverse;
    animation-delay: -3.5s;
  }
  .dsb-5 {
    width: 2px;
    height: 2px;
    right: 18%;
    top: 60%;
    background: rgba(196, 181, 253, 0.78);
    box-shadow: 0 0 5px 1.2px rgba(167, 139, 250, 0.30);
    animation: dsb-twinkle 4s ease-in-out infinite;
    animation-delay: -0.6s;
  }
  .dsb-6 {
    width: 3px;
    height: 3px;
    left: 40%;
    top: 70%;
    background: rgba(147, 197, 253, 0.82);
    box-shadow: 0 0 6px 2px rgba(96, 165, 250, 0.32);
    animation: dsb-twinkle 6s ease-in-out infinite reverse;
    animation-delay: -4.8s;
  }

  @keyframes dsb-twinkle {
    0%, 100% { opacity: 0.4; transform: scale(0.7); }
    50%      { opacity: 1; transform: scale(1.4); }
  }
`;
