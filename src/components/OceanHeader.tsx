'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v199 — 明亮流场 (Luminous Fluid)
//
// v198 问题诊断：
//   ❌ 底色 bgLtn=18 (13~23%) — 太暗，整片昏沉
//   ❌ 6个中等色斑 (42~68%屏幕) — 太碎，看不出流动
//   ❌ 位移 ±18%/周期8-10s — 太微太慢，肉眼看不出
//   ❌ opBase 0.32~0.52 — 叠加后还是暗
//
// v199 策略反转：
//   ✅ 底色 42%亮度 (38~48%) — 明亮的深海蓝
//   ✅ 只有3个超大色斑 (75~95%屏幕) — 少而巨大 = 流动感
//   ✅ 亮度 ltn 62~72% — 每个色斑本身就亮
//   ✅ 位移 ±25%/周期 5-7s — 明显可感知的运动
//   ✅ screen 模式叠加 — 色斑交汇处更亮更绚
//   ✅ 2条正弦波浪线 — 强化"液体"视觉线索
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
      {/* 唯一视觉层：明亮流场 Canvas */}
      <LuminousFluid />

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
// LuminousFluid — 明亮流场
//
// 3 个超大色斑 + screen 叠加 + 正弦波浪线
// ============================================================
function LuminousFluid() {
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

    // ── 3 个超大色斑：少而巨大 = 真正的液体流动感 ──
    const BLOBS = [
      // [0] 主色斑：明亮天青（画面中央偏右，最大最亮）
      { hue: 200, sat: 82, ltn: 68,
        xBase: 0.58, yBase: 0.40,
        xFreq: 0.11, yFreq: 0.08, xAmp: 0.26, yAmp: 0.20,
        sizeBase: 0.88, sizeAmp: 0.12,
        opBase: 0.62, opAmp: 0.14,
        hueAmp: 8 },
      // [1] 宝石蓝（左下方，第二大）
      { hue: 218, sat: 78, ltn: 64,
        xBase: 0.28, yBase: 0.62,
        xFreq: 0.08, yFreq: 0.10, xAmp: 0.24, yAmp: 0.18,
        sizeBase: 0.78, sizeAmp: 0.10,
        opBase: 0.54, opAmp: 0.12,
        hueAmp: 6 },
      // [2] 青蓝色（上方横跨，第三大）
      { hue: 188, sat: 80, ltn: 66,
        xBase: 0.50, yBase: 0.18,
        xFreq: 0.09, yFreq: 0.07, xAmp: 0.28, yAmp: 0.14,
        sizeBase: 0.82, sizeAmp: 0.11,
        opBase: 0.48, opAmp: 0.10,
        hueAmp: 7 },
    ];

    // ── 噪声函数 ──
    const noise = (t: number, f1: number, f2: number, off: number): number => {
      return Math.sin(t * f1 + off)
           + Math.sin(t * f2 + off * 1.7) * 0.5
           + Math.sin(t * (f1 + f2) * 0.5 + off * 0.3) * 0.25;
    };

    const draw = () => {
      time += 0.018; // 比 v198 的 0.012 快 50%
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const shortEdge = Math.min(w, h);

      ctx.clearRect(0, 0, w, h);

      // ── Step 1: 明亮动态底色（v198 的 3 倍亮度）──
      const bgHue = 212 + Math.sin(time * 0.04) * 6;
      const bgSat = 52 + Math.sin(time * 0.03) * 8;
      const bgLtn = 42 + Math.sin(time * 0.025) * 6; // 36%~48%（明亮！）
      ctx.fillStyle = `hsl(${bgHue}, ${bgSat}%, ${bgLtn}%)`;
      ctx.fillRect(0, 0, w, h);

      // ── Step 2: 3 个超大色斑（screen 模式叠加发光）──
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < BLOBS.length; i++) {
        const b = BLOBS[i];

        // 位置：大范围李萨如运动
        const nx = noise(time, b.xFreq, b.xFreq * 1.6, i * 2.1);
        const ny = noise(time, b.yFreq, b.yFreq * 1.4, i * 3.7);
        const bx = w * (b.xBase + (nx / 1.75) * b.xAmp);
        const by = h * (b.yBase + (ny / 1.75) * b.yAmp);

        // 尺寸：巨大且呼吸脉动
        const szNoise = Math.sin(time * 0.06 + i * 1.2) * 0.5 + 0.5;
        const radius = shortEdge * (b.sizeBase + szNoise * b.sizeAmp);

        // 透明度：较高基准 + 呼吸
        const opNoise = Math.sin(time * 0.09 + i * 0.9) * 0.5 + 0.5;
        const op = b.opBase + opNoise * b.opAmp;

        // 色相漂移
        const hueShift = Math.sin(time * 0.035 + i * 0.6) * b.hueAmp;
        const hslHue = b.hue + hueShift;

        // 径向渐变（中心亮→边缘柔化）
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
        grad.addColorStop(0, `hsla(${hslHue}, ${b.sat}%, ${b.ltn}%, ${op.toFixed(2)})`);
        grad.addColorStop(0.30, `hsla(${hslHue}, ${b.sat - 3}%, ${b.ltn - 5}%, ${(op * 0.65).toFixed(2)})`);
        grad.addColorStop(0.60, `hsla(${hslHue + 3}, ${b.sat - 8}%, ${b.ltn - 10}%, ${(op * 0.30).toFixed(2)})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // 恢复正常合成模式
      ctx.globalCompositeOperation = 'source-over';

      // ── Step 3: 正弦波浪线（液体表面纹理）──
      // 2 条细波浪线增强"液体"视觉线索
      for (let wi = 0; wi < 2; wi++) {
        const waveY = h * (0.45 + wi * 0.28);
        const waveAmp = 12 + wi * 6;
        const waveFreq = 0.008 + wi * 0.003;
        const speed = time * (28 + wi * 14);
        const alpha = 0.12 - wi * 0.03;

        ctx.beginPath();
        ctx.moveTo(0, waveY);

        for (let x = 0; x <= w; x += 3) {
          const y = waveY + Math.sin(x * waveFreq + speed) * waveAmp
                        + Math.sin(x * waveFreq * 2.3 + speed * 1.5) * (waveAmp * 0.35);
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(180, 220, 255, ${alpha})`;
        ctx.lineWidth = 1.2 - wi * 0.3;
        ctx.stroke();
      }

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
