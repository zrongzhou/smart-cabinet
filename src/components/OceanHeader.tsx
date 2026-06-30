'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v192 — 极光光帘 · 天青蓝韵 · 垂幔流光
//
// v191 反馈："不是彩带的感觉，颜色不协调"
// 根因：
//   ❌ VisibleStreams = 3条水平横条(div+blur) = PPT色带条纹
//   ❌ FloatingLights = 3个散落光球(左紫右蓝底青) = 各玩各的
//   ❌ 所有元素都是水平排列 → 折叠感/条纹感
//
// v192 策略：POLAR CURTAINS（极光垂幔）
//   ✅ 光帘形状：高窄椭圆 × 旋转15~30° = 像光之帷幕垂下
//   ✅ 方向统一：全部斜向垂幔（不是水平条！）
//   ✅ 色域锁定：天青195° + 蓝220° + 靛238°（严格协调）
//   ✅ 融合方式：screen混合 = 光与光叠加发光
//   ✅ 动态：缓慢摇曳 + 呼吸 + 微妙漂移
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
      {/* Layer 1: Canvas — 深海渐变底色 */}
      <DeepOceanBase />

      {/* Layer 2: 极光光帘 — 斜向垂幔（核心视觉层） */}
      <AuroraCurtains />

      {/* Layer 3: 微尘星光 — 少量精致亮点（非密集白点！） */}
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
// DeepOceanBase — 统一深海渐变底色
// 不再有多光源分色！只有一个干净的渐变底
// ============================================================
function DeepOceanBase() {
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

      // ── 底色：深邃海洋渐变（微弱呼吸）──
      const hueShift = Math.sin(time * 0.3) * 4; // ±4°色相偏移
      const bg = ctx.createLinearGradient(0, 0, w * 0.4, h);
      bg.addColorStop(0, `hsl(${212 + hueShift}, 45%, ${7 + Math.sin(time * 0.4) * 1.5}%)`);
      bg.addColorStop(0.40, `hsl(${218 + hueShift}, 50%, ${10 + Math.cos(time * 0.35) * 1.5}%)`);
      bg.addColorStop(0.70, `hsl(${222 + hueShift}, 48%, ${13 + Math.sin(time * 0.3) * 1}%)`);
      bg.addColorStop(1, `hsl(${215 + hueShift}, 42%, ${8}%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── 单一环境光晕：画面中央微微发亮 ──
      const gx = w * (0.50 + Math.sin(time * 0.2) * 0.08);
      const gy = h * (0.40 + Math.cos(time * 0.18) * 0.06);
      const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.50);
      glow.addColorStop(0, `rgba(100, 180, 255, ${0.06 + Math.sin(time * 0.4) * 0.02})`);
      glow.addColorStop(0.40, `rgba(60, 130, 220, ${0.03})`);
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
// AuroraCurtains — 极光光帘（核心！）
//
// 关键设计决策：
//   1. 形状 = 高窄椭圆 + 旋转15~28° = "光之垂幔"
//   2. 不是水平条！！是倾斜的窗帘状光幕
//   3. 多层重叠 + screen混合 = 自然融合
//   4. 每条光帘独立动画：摇曳 + 呼吸 + 漂移
// ============================================================
function AuroraCurtains() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 光帘 1：主幔 — 最宽最亮，天青→蓝色渐变，从左上向右下垂 */}
      <div className="ac-curtain ac-main" />

      {/* 光帘 2：副幔 — 略窄，靛蓝调，交叉重叠在主幔上 */}
      <div className="ac-curtain ac-second" />

      {/* 光帘 3：侧幔 — 较窄较淡，青色调，右侧补充 */}
      <div className="ac-curtain ac-third" />

      {/* 光帘 4：薄幔 — 最淡最长，顶部边缘柔光过渡 */}
      <div className="ac-curtain ac-fourth" />

      {/* 光帘 5：底部柔幔 — 底部过渡到白色区域 */}
      <div className="ac-curtain ac-bottom" />
    </div>
  );
}

// ============================================================
// DustSparkles — 尘埃星光
// 仅 4~5颗精致小亮点，不是密集小白点！
// 作用：增加"空气感"和精致度
// ============================================================
function DustSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="ds-sparkle ds-1" />
      <div className="ds-sparkle ds-2" />
      <div className="ds-sparkle ds-3" />
      <div className="ds-sparkle ds-4" />
      <div className="ds-sparkle ds-5" />
    </div>
  );
}

const styles = `
  /* ====== 极光光帘 ======
     核心设计：高窄椭圆 + 大角度旋转 = 光之垂幔
     不是水平条！是斜向的窗帘状光幕！
  ====== */
  .ac-curtain {
    position: absolute;
    border-radius: 50%;
    will-change: transform, opacity;
    mix-blend-mode: screen;
    pointer-events: none;
  }

  /* 主幔：最大最亮的中央光幕 */
  .ac-main {
    width: 320px;
    height: 480px;
    left: 22%;
    top: -8%;
    transform: rotate(20deg);
    background: radial-gradient(ellipse 65% 85% at 50% 25%,
      rgba(125, 211, 252, 0.32) 0%,
      rgba(96, 165, 250, 0.24) 25%,
      rgba(59, 130, 246, 0.16) 48%,
      rgba(37, 99, 235, 0.07) 72%,
      transparent 100%);
    filter: blur(28px);
    animation:
      ac-sway-main 13s ease-in-out infinite alternate,
      ac-breathe 7s ease-in-out infinite alternate;
  }

  /* 副幔：靛蓝色，交叉重叠 */
  .ac-second {
    width: 260px;
    height: 420px;
    right: 18%;
    top: -5%;
    transform: rotate(-16deg);
    background: radial-gradient(ellipse 60% 80% at 52% 28%,
      rgba(165, 180, 252, 0.28) 0%,
      rgba(139, 92, 246, 0.20) 28%,
      rgba(99, 102, 241, 0.12) 52%,
      rgba(79, 70, 229, 0.05) 75%,
      transparent 100%);
    filter: blur(24px);
    animation:
      ac-sway-second 16s ease-in-out infinite alternate-reverse,
      ac-breathe 9s ease-in-out infinite alternate-reverse;
    animation-delay: -3s;
  }

  /* 侧幔：青色调，右侧 */
  .ac-third {
    width: 200px;
    height: 340px;
    right: 5%;
    top: 15%;
    transform: rotate(25deg);
    background: radial-gradient(ellipse 55% 75% at 48% 30%,
      rgba(103, 232, 249, 0.22) 0%,
      rgba(34, 211, 238, 0.15) 30%,
      rgba(6, 182, 212, 0.08) 55%,
      transparent 82%);
    filter: blur(20px);
    animation:
      ac-sway-third 11s ease-in-out infinite alternate,
      ac-breathe 8s ease-in-out infinite alternate;
    animation-delay: -5s;
  }

  /* 薄幔：顶部柔和过渡 */
  .ac-fourth {
    width: 400px;
    height: 180px;
    left: 30%;
    top: -3%;
    transform: rotate(8deg);
    background: radial-gradient(ellipse 70% 60% at 50% 40%,
      rgba(186, 230, 253, 0.16) 0%,
      rgba(147, 197, 253, 0.10) 35%,
      rgba(125, 211, 252, 0.05) 60%,
      transparent 100%);
    filter: blur(22px);
    animation:
      ac-sway-fourth 18s ease-in-out infinite alternate-reverse,
      ac-breathe 11s ease-in-out infinite alternate;
    animation-delay: -7s;
  }

  /* 底部柔幔：过渡到白区 */
  .ac-bottom {
    width: 360px;
    height: 140px;
    left: 25%;
    bottom: 8%;
    transform: rotate(-5deg);
    background: radial-gradient(ellipse 80% 55% at 50% 45%,
      rgba(96, 165, 250, 0.12) 0%,
      rgba(59, 130, 246, 0.07) 40%,
      transparent 78%);
    filter: blur(18px);
    animation: ac-sway-bottom 14s ease-in-out infinite alternate;
    animation-delay: -2s;
  }

  /* ---- 光帘摇曳动画（模拟极光的波浪摆动）---- */
  @keyframes ac-sway-main {
    0%   { transform: rotate(20deg) translate(0, 0) scale(1); }
    33%  { transform: rotate(24deg) translate(12px, 18px) scale(1.04); }
    66%  { transform: rotate(17deg) translate(-8px, 12px) scale(0.97); }
    100% { transform: rotate(22deg) translate(6px, 22px) scale(1.02); }
  }
  @keyframes ac-sway-second {
    0%   { transform: rotate(-16deg) translate(0, 0) scale(1); }
    40%  { transform: rotate(-12deg) translate(-15px, 10px) scale(1.03); }
    75%  { transform: rotate(-20deg) translate(10px, -8px) scale(0.98); }
    100% { transform: rotate(-14deg) translate(-6px, 15px) scale(1.01); }
  }
  @keyframes ac-sway-third {
    0%   { transform: rotate(25deg) translate(0, 0) scale(1); }
    50%  { transform: rotate(29deg) translate(8px, 15px) scale(1.05); }
    100% { transform: rotate(22deg) translate(-10px, 8px) scale(0.96); }
  }
  @keyframes ac-sway-fourth {
    0%   { transform: rotate(8deg) translate(0, 0); }
    50%  { transform: rotate(12deg) translate(18px, 6px); }
    100% { transform: rotate(5deg) translate(-10px, 4px); }
  }
  @keyframes ac-sway-bottom {
    0%   { transform: rotate(-5deg) translate(0, 0); }
    50%  { transform: rotate(-2deg) translate(12px, -6px); }
    100% { transform: rotate(-8deg) translate(-8px, 3px); }
  }

  /* ---- 光帘呼吸动画（透明度脉动）---- */
  @keyframes ac-breathe {
    0%   { opacity: 0.78; }
    50%  { opacity: 1; }
    100% { opacity: 0.85; }
  }

  /* ====== 尘埃星光 ======
     仅5颗精致小亮点，不是密集小白点！
  ====== */
  .ds-sparkle {
    position: absolute;
    border-radius: 50%;
    will-change: transform, opacity;
    pointer-events: none;
  }

  .ds-1 {
    width: 3px;
    height: 3px;
    left: 28%;
    top: 22%;
    background: rgba(186, 230, 253, 0.85);
    box-shadow: 0 0 6px 2px rgba(147, 197, 253, 0.35);
    animation: ds-twinkle 4s ease-in-out infinite;
  }
  .ds-2 {
    width: 2.5px;
    height: 2.5px;
    right: 32%;
    top: 35%;
    background: rgba(167, 139, 250, 0.75);
    box-shadow: 0 0 5px 1.5px rgba(139, 92, 246, 0.28);
    animation: ds-twinkle 5s ease-in-out infinite reverse;
    animation-delay: -1.5s;
  }
  .ds-3 {
    width: 2px;
    height: 2px;
    left: 55%;
    top: 15%;
    background: rgba(125, 211, 252, 0.80);
    box-shadow: 0 0 5px 1.5px rgba(96, 165, 250, 0.30);
    animation: ds-twinkle 3.5s ease-in-out infinite;
    animation-delay: -2.8s;
  }
  .ds-4 {
    width: 3.5px;
    height: 3.5px;
    left: 15%;
    top: 58%;
    background: rgba(103, 232, 249, 0.70);
    box-shadow: 0 0 6px 2px rgba(34, 211, 238, 0.25);
    animation: ds-twinkle 6s ease-in-out infinite reverse;
    animation-delay: -4s;
  }
  .ds-5 {
    width: 2px;
    height: 2px;
    right: 20%;
    top: 62%;
    background: rgba(196, 181, 253, 0.65);
    box-shadow: 0 0 4px 1px rgba(167, 139, 250, 0.22);
    animation: ds-twinkle 4.5s ease-in-out infinite;
    animation-delay: -0.8s;
  }

  @keyframes ds-twinkle {
    0%, 100% { opacity: 0.35; transform: scale(0.8); }
    50%      { opacity: 1; transform: scale(1.3); }
  }
`;
