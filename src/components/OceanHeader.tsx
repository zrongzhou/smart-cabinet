'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v190 — 流光溢彩 · 动态优先 · 打破静态
//
// v189 反馈："形成两边颜色，没有动态效果"
// 根因诊断：
//   ❌ 3个光斑位置几乎固定(仅±4~7%微移) → 左边一坨靛、右边一坨青 = 两边分色
//   ❌ 光束opacity 0.025~0.04 → 完全不可见
//   ❌ 所有动画都是"慢呼吸" → 肉眼看不出在动
//   ❌ 无任何横向/纵向流动元素 → 静态感
//
// v190 策略：让每一帧都不同
//   ✅ 光斑大范围漂移(±12~18%) + 大幅度脉动
//   ✅ 流光带横穿画面 — 从右到左缓缓流动
//   ✅ 底色随时间微妙变化(不是死黑)
//   ✅ 保留噪点纹理(质感)
//   ✅ 删除CSS光晕层(改由Canvas统一控制)
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
      {/* Layer 1: Canvas — 全动态流光底 */}
      <FlowingOcean />

      {/* Layer 2: 微妙噪点纹理 */}
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
// FlowingOcean — 全动态Canvas流光
// 核心：所有元素都在大幅度移动 + 流光带穿越
// ============================================================
function FlowingOcean() {
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
      time += 0.006; // 稍微加快节奏
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // ── 底色：深海洋渐变（微微变化）──
      const bg = ctx.createLinearGradient(0, 0, w * 0.4, h);
      bg.addColorStop(0, `hsl(${212 + Math.sin(time * 0.15) * 10}, 50%, ${7 + Math.sin(time * 0.12) * 2}%)`);
      bg.addColorStop(0.5, `hsl(${218 + Math.cos(time * 0.18) * 8}, 52%, ${10 + Math.cos(time * 0.15) * 2}%)`);
      bg.addColorStop(1, `hsl(${205 + Math.sin(time * 0.13) * 6}, 48%, ${13 + Math.sin(time * 0.1) * 2}%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── 流光带：从右向左缓缓穿越画面（最关键的动态元素！）──
      // 这条光带是横向的，会打破"左右分色"的静态格局
      const streamX = ((time * 40) % (w * 1.6)) - w * 0.3; // 从右向左持续流动
      const streamY = h * (0.35 + Math.sin(time * 0.25) * 0.15);
      ctx.save();
      ctx.globalAlpha = 0.06 + Math.sin(time * 0.4) * 0.02;
      const streamGrad = ctx.createLinearGradient(streamX - 200, streamY, streamX + 300, streamY);
      streamGrad.addColorStop(0, 'transparent');
      streamGrad.addColorStop(0.3, 'rgba(125, 211, 252, 0.35)');
      streamGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.45)');
      streamGrad.addColorStop(0.7, 'rgba(147, 197, 253, 0.30)');
      streamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = streamGrad;
      ctx.beginPath();
      ctx.ellipse(streamX, streamY, w * 0.38, h * 0.22, Math.sin(time * 0.2) * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── 第二条流光（稍低，反向移动）──
      const stream2X = ((-time * 28) % (w * 1.5)) - w * 0.25;
      const stream2Y = h * (0.62 + Math.cos(time * 0.22) * 0.12);
      ctx.save();
      ctx.globalAlpha = 0.045 + Math.cos(time * 0.35) * 0.015;
      const stream2Grad = ctx.createLinearGradient(stream2X - 150, stream2Y, stream2X + 250, stream2Y);
      stream2Grad.addColorStop(0, 'transparent');
      stream2Grad.addColorStop(0.35, 'rgba(99, 102, 241, 0.30)');
      stream2Grad.addColorStop(0.55, 'rgba(129, 140, 248, 0.38)');
      stream2Grad.addColorStop(0.75, 'rgba(96, 165, 250, 0.25)');
      stream2Grad.addColorStop(1, 'transparent');
      ctx.fillStyle = stream2Grad;
      ctx.beginPath();
      ctx.ellipse(stream2X, stream2Y, w * 0.32, h * 0.16, Math.cos(time * 0.18) * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── 主光源：大幅度漂移的光斑（不再固定在右上角！）──
      const sunX = w * (0.55 + Math.sin(time * 0.28) * 0.20); // ±20%！之前才±5%
      const sunY = h * (0.15 + Math.cos(time * 0.24) * 0.15); // ±15%
      const main = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(w, h) * 0.65);
      main.addColorStop(0, `rgba(56, 189, 248, ${0.46 + Math.sin(time * 0.42) * 0.12})`);
      main.addColorStop(0.18, `rgba(96, 165, 250, ${0.34 + Math.cos(time * 0.36) * 0.08})`);
      main.addColorStop(0.4, `rgba(59, 130, 246, ${0.20 + Math.sin(time * 0.3) * 0.05})`);
      main.addColorStop(0.65, `rgba(37, 99, 235, ${0.08})`);
      main.addColorStop(1, 'transparent');
      ctx.fillStyle = main;
      ctx.fillRect(0, 0, w, h);

      // ── 次光源：也大幅度移动 ──
      const secX = w * (0.25 + Math.cos(time * 0.26 + 1.5) * 0.18); // ±18%
      const secY = h * (0.58 + Math.sin(time * 0.32) * 0.16); // ±16%
      const sec = ctx.createRadialGradient(secX, secY, 0, secX, secY, Math.max(w, h) * 0.5);
      sec.addColorStop(0, `rgba(99, 102, 241, ${0.30 + Math.sin(time * 0.4 + 1) * 0.09})`);
      sec.addColorStop(0.25, `rgba(79, 70, 229, ${0.20 + Math.cos(time * 0.35) * 0.05})`);
      sec.addColorStop(0.55, `rgba(67, 56, 202, ${0.08})`);
      sec.addColorStop(1, 'transparent');
      ctx.fillStyle = sec;
      ctx.fillRect(0, 0, w, h);

      // ── 第三光：底部青绿 ──
      const triX = w * (0.60 + Math.sin(time * 0.22 + 2) * 0.15); // ±15%
      const triY = h * (0.82 + Math.cos(time * 0.28) * 0.08); // ±8%
      const tri = ctx.createRadialGradient(triX, triY, 0, triX, triY, Math.max(w, h) * 0.38);
      tri.addColorStop(0, `rgba(6, 182, 212, ${0.22 + Math.sin(time * 0.38) * 0.06})`);
      tri.addColorStop(0.3, `rgba(34, 211, 238, ${0.12})`);
      tri.addColorStop(0.6, `rgba(56, 189, 248, ${0.05})`);
      tri.addColorStop(1, 'transparent');
      ctx.fillStyle = tri;
      ctx.fillRect(0, 0, w, h);

      // ── 斜向光束（从主光源射出，跟随主光源移动！）──
      ctx.save();
      ctx.globalAlpha = 0.055 + Math.sin(time * 0.35) * 0.02;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY + 20);
      ctx.lineTo(w * (0.05 + Math.sin(time * 0.18) * 0.15), h); // 终点也在动
      ctx.lineTo(w * (0.25 + Math.cos(time * 0.22) * 0.1), h);
      ctx.closePath();
      const beamGrad = ctx.createLinearGradient(sunX, sunY, w * 0.15, h);
      beamGrad.addColorStop(0, 'rgba(186, 230, 253, 0.55)');
      beamGrad.addColorStop(0.4, 'rgba(125, 211, 252, 0.25)');
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
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
// NoiseTexture — 极细微噪点（玻璃质感）
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
        style={{ opacity: 0.032, mixBlendMode: 'overlay' }} />
    </svg>
  );
}

const styles = ``;
