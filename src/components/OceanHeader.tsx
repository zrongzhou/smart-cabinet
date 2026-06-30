'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v195 — Mesh Gradient 流动色场
//
// 彻底放弃所有"形状"(带子/线条/椭圆/光帘)
// 改用现代 Mesh Gradient 风格：
//   ✅ 多个巨大径向渐变色斑，缓慢呼吸漂移交融
//   ✅ 像油彩在水中扩散 —— 有机、流动、无边界
//   ✅ 参考 Vercel / Linear / Raycast 的 hero 背景
//   ✅ 色域：天青 + 蓝 + 靛（统一协调）
//   ✅ 微妙噪点纹理增加质感深度
//   ✅ 少量精致星光点缀
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
      {/* Layer 1: Canvas 深海底色 + 动态光斑 */}
      <MeshCanvas />

      {/* Layer 2: CSS Mesh 色斑层 — 巨大模糊色球缓慢飘移 */}
      <MeshBlobs />

      {/* Layer 3: 精致星光 */}
      <Sparkles />

      {/* 底部过渡到白色内容区 */}
      <div className="absolute bottom-0 left-0 right-0 h-[110px] pointer-events-none z-[3]"
        style={{
          background: 'linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0.5) 55%, transparent 100%)',
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

      <style>{styles}</style>
    </section>
  );
}

// ============================================================
// MeshCanvas — 深海底色 + Canvas 动态光晕
// ============================================================
function MeshCanvas() {
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
      time += 0.008;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // ── 底色：深蓝渐变（不要太暗） ──
      const bgGrad = ctx.createLinearGradient(0, 0, w * 0.6, h);
      bgGrad.addColorStop(0, '#0a1628');
      bgGrad.addColorStop(0.35, '#0d2137');
      bgGrad.addColorStop(0.65, '#102a48');
      bgGrad.addColorStop(1, '#0c1e33');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── 中央主光晕：天青蓝色大范围环境光 ──
      const cx = w * (0.50 + Math.sin(time * 0.18) * 0.08);
      const cy = h * (0.42 + Math.cos(time * 0.15) * 0.06);
      const mainGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
      mainGlow.addColorStop(0, 'rgba(56,189,248,' + (0.14 + Math.sin(time * 0.25) * 0.04) + ')');
      mainGlow.addColorStop(0.30, 'rgba(59,130,246,0.08)');
      mainGlow.addColorStop(0.60, 'rgba(99,102,241,0.03)');
      mainGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = mainGlow;
      ctx.fillRect(0, 0, w, h);

      // ── 左上副光晕：靛蓝色 ──
      const lx = w * (0.20 + Math.cos(time * 0.22) * 0.06);
      const ly = h * (0.25 + Math.sin(time * 0.18) * 0.05);
      const leftGlow = ctx.createRadialGradient(lx, ly, 0, lx, ly, w * 0.38);
      leftGlow.addColorStop(0, 'rgba(99,102,241,' + (0.10 + Math.cos(time * 0.30) * 0.03) + ')');
      leftGlow.addColorStop(0.45, 'rgba(79,70,229,0.04)');
      leftGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = leftGlow;
      ctx.fillRect(0, 0, w, h);

      // ── 右下副光晕：青绿色 ──
      const rx = w * (0.78 + Math.sin(time * 0.20) * 0.05);
      const ry = h * (0.68 + Math.cos(time * 0.16) * 0.07);
      const rightGlow = ctx.createRadialGradient(rx, ry, 0, rx, ry, w * 0.32);
      rightGlow.addColorStop(0, 'rgba(34,211,238,' + (0.08 + Math.sin(time * 0.28) * 0.03) + ')');
      rightGlow.addColorStop(0.50, 'rgba(6,182,212,0.03)');
      rightGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = rightGlow;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true"
      style={{ width: '100%', height: '100%' }} />
  );
}

// ============================================================
// MeshBlobs — 巨大 CSS 色斑缓慢飘移交融（核心视觉层！）
//
// 关键设计原则：
//   - 每个 blob 是 400~700px 的超大径向渐变圆
//   - blur 70~120px → 边缘完全融化，无硬边界
//   - 缓慢的 translate 动画（15~25s 一轮）→ 有机漂浮感
//   - mix-blend-mode: screen → 色彩叠加发光
//   - 不同颜色/大小/位置/速度 → 自然不重复
// ============================================================
function MeshBlobs() {
  const blobs = [
    // Blob A: 主色斑 — 天青蓝（最大最亮）
    { x: '28%', y: '32%', size: 600, colorA: 'rgba(56,189,248,0.28)', colorB: 'rgba(125,211,252,0.10)', blur: 90,
      moveX: 80, moveY: 55, duration: 18, delay: 0 },
    // Blob B: 宝石蓝（右侧）
    { x: '62%', y: '45%', size: 520, colorA: 'rgba(59,130,246,0.25)', colorB: 'rgba(96,165,250,0.08)', blur: 80,
      moveX: -60, moveY: 45, duration: 22, delay: -4 },
    // Blob C: 靛蓝（左上）
    { x: '18%', y: '55%', size: 480, colorA: 'rgba(99,102,241,0.22)', colorB: 'rgba(139,92,246,0.06)', blur: 75,
      moveX: 55, moveY: -40, duration: 20, delay: -8 },
    // Blob D: 青绿（底部）
    { x: '72%', y: '68%', size: 420, colorA: 'rgba(34,211,238,0.18)', colorB: 'rgba(103,232,249,0.05)', blur: 70,
      moveX: -45, moveY: -35, duration: 25, delay: -12 },
    // Blob E: 淡靛（右上小点缀）
    { x: '82%', y: '22%', size: 340, colorA: 'rgba(129,140,248,0.16)', colorB: 'rgba(165,180,252,0.04)', blur: 65,
      moveX: -35, moveY: 30, duration: 16, delay: -3 },
    // Blob F: 天青淡（左侧）
    { x: '8%', y: '35%', size: 380, colorA: 'rgba(147,197,253,0.14)', colorB: 'rgba(186,230,253,0.04)', blur: 70,
      moveX: 40, moveY: -30, duration: 24, delay: -7 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]" aria-hidden="true">
      {blobs.map((b, i) => (
        <div key={i} className="mesh-blob" style={{
          left: b.x,
          top: b.y,
          width: b.size + 'px',
          height: b.size + 'px',
          background: 'radial-gradient(circle, ' + b.colorA + ' 0%, ' + b.colorB + ' 45%, transparent 70%)',
          filter: 'blur(' + b.blur + 'px)',
          animation: 'mesh-float-' + i + ' ' + b.duration + 's ease-in-out infinite alternate',
          animationDelay: b.delay + 's',
        }} />
      ))}
    </div>
  );
}

// ============================================================
// Sparkles — 极少量精致星光（不是密集白点！）
// ============================================================
function Sparkles() {
  const stars = [
    { x: '24%', y: '22%', size: 2.5, color: 'rgba(186,230,253,0.90)', glow: 'rgba(147,197,253,0.40)' },
    { x: '68%', y: '35%', size: 2, color: 'rgba(165,180,252,0.85)', glow: 'rgba(139,92,246,0.35)' },
    { x: '45%', y: '15%', size: 3, color: 'rgba(125,211,252,0.88)', glow: 'rgba(56,189,248,0.38)' },
    { x: '14%', y: '62%', size: 2, color: 'rgba(103,232,249,0.80)', glow: 'rgba(34,211,238,0.30)' },
    { x: '78%', y: '58%', size: 2.5, color: 'rgba(196,181,253,0.75)', glow: 'rgba(167,139,250,0.28)' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[3]" aria-hidden="true">
      {stars.map((s, i) => (
        <div key={i} className="sp-star" style={{
          left: s.x,
          top: s.y,
          width: s.size + 'px',
          height: s.size + 'px',
          borderRadius: '50%',
          background: s.color,
          boxShadow: '0 0 ' + (s.size * 2.5) + 'px ' + (s.size * 0.8) + 'px ' + s.glow,
          animation: 'sparkle-twinkle ' + (3 + i * 1.2) + 's ease-in-out infinite',
          animationDelay: (i * -1.5) + 's',
        }} />
      ))}
    </div>
  );
}

const styles = `
  /* ====== Mesh 色斑动画 ======
     每个blob有独立的移动轨迹和节奏
     使用 translate 让巨大的模糊圆缓慢漂移 */
  .mesh-blob {
    position: absolute;
    border-radius: 50%;
    will-change: transform, opacity;
    pointer-events: none;
    opacity: 0.95;
  }

  @keyframes mesh-float-0 {
    0%   { transform: translate(0, 0) scale(1); }
    33%  { transform: translate(80px, 55px) scale(1.08); }
    66%  { transform: translate(-30px, 30px) scale(0.95); }
    100% { transform: translate(40px, -20px) scale(1.04); }
  }
  @keyframes mesh-float-1 {
    0%   { transform: translate(0, 0) scale(1); }
    40%  { transform: translate(-60px, 45px) scale(1.05); }
    75%  { transform: translate(25px, -15px) scale(0.97); }
    100% { transform: translate(-35px, 30px) scale(1.02); }
  }
  @keyframes mesh-float-2 {
    0%   { transform: translate(0, 0) scale(1); }
    35%  { transform: translate(55px, -40px) scale(1.06); }
    70%  { transform: translate(-20px, 25px) scale(0.94); }
    100% { transform: translate(35px, -15px) scale(1.03); }
  }
  @keyframes mesh-float-3 {
    0%   { transform: translate(0, 0) scale(1); }
    45%  { transform: translate(-45px, -35px) scale(1.04); }
    80%  { transform: translate(20px, 15px) scale(0.98); }
    100% { transform: translate(-25px, 20px) scale(1.01); }
  }
  @keyframes mesh-float-4 {
    0%   { transform: translate(0, 0) scale(1); }
    30%  { transform: translate(-35px, 30px) scale(1.05); }
    65%  { transform: translate(15px, -20px) scale(0.96); }
    100% { transform: translate(-18px, 12px) scale(1.02); }
  }
  @keyframes mesh-float-5 {
    0%   { transform: translate(0, 0) scale(1); }
    50%  { transform: translate(40px, -30px) scale(1.04); }
    85%  { transform: translate(-18px, 18px) scale(0.97); }
    100% { transform: translate(22px, -10px) scale(1.01); }
  }

  /* ====== 星光闪烁 ====== */
  .sp-star {
    will-change: transform, opacity;
    pointer-events: none;
  }

  @keyframes sparkle-twinkle {
    0%, 100% { opacity: 0.30; transform: scale(0.6); }
    50%      { opacity: 1; transform: scale(1.3); }
  }
`;
