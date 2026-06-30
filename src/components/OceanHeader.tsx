'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v198 — 液态流光 (Liquid Flow)
//
// 核心设计哲学：
//   ❌ 不再有：飘带/线条/椭圆/光帘/光球/MeshBlobs/任何"形状"
//   ✅ 只有：Canvas 驱动的噪声流体场 —— 像油彩在水中扩散交融
//   ✅ 关键参数反转：
//      - 光斑尺寸：屏幕的 45~75%（不是 20~30%）
//      - 运动周期：8~12s 一轮（不是 18~25s）
//      - 亮度：opacity 0.38~0.62（不是 0.14~0.28）
//      - 层数：只有 1 个 Canvas（不是 4 层叠加）
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
      {/* 唯一视觉层：液态流光 Canvas */}
      <LiquidFlow />

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
// LiquidFlow — 单一 Canvas 噪声流体场
//
// 技术原理：
//   1. 用多层正弦波（不同频率/相位）模拟 Perlin 噪声
//   2. 噪声值驱动每个色斑的：位置 / 大小 / 透明度 / 色相
//   3. 色斑超大（45~75%屏幕）+ 重度模糊 = 无边界的液体感
//   4. 色斑运动轨迹是李萨如曲线（Lissajous）= 有机非重复运动
// ============================================================
function LiquidFlow() {
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

    // ── 色斑配置：6个巨大液体色斑 ──
    // 每个色斑的参数都是范围而非固定值，由噪声函数实时驱动
    const BLOBS = [
      // [0] 主色斑：天青蓝（最大最亮，画面中央偏右上）
      { hue: 200, sat: 82, ltn: 58,
        xFreq: 0.07, yFreq: 0.11, xAmp: 0.18, yAmp: 0.14,  // 李萨如轨迹
        xBase: 0.55, yBase: 0.38,                           // 基准位置
        sizeBase: 0.68, sizeAmp: 0.15,                      // 53%~83% 屏幕短边
        opBase: 0.52, opAmp: 0.16,                          // 36%~68% 透明度
        hueAmp: 10 },
      // [1] 宝石蓝（右下区域）
      { hue: 220, sat: 78, ltn: 54,
        xFreq: 0.09, yFreq: 0.06, xAmp: 0.16, yAmp: 0.20,
        xBase: 0.78, yBase: 0.62,
        sizeBase: 0.55, sizeAmp: 0.12,
        opBase: 0.46, opAmp: 0.14,
        hueAmp: 8 },
      // [2] 靛蓝色（左上区域）
      { hue: 235, sat: 72, ltn: 52,
        xFreq: 0.05, yFreq: 0.09, xAmp: 0.22, yAmp: 0.13,
        xBase: 0.18, yBase: 0.28,
        sizeBase: 0.50, sizeAmp: 0.14,
        opBase: 0.42, opAmp: 0.12,
        hueAmp: 7 },
      // [3] 青色（右侧流动）
      { hue: 188, sat: 80, ltn: 55,
        xFreq: 0.10, yFreq: 0.08, xAmp: 0.14, yAmp: 0.18,
        xBase: 0.85, yBase: 0.35,
        sizeBase: 0.45, sizeAmp: 0.10,
        opBase: 0.38, opAmp: 0.10,
        hueAmp: 6 },
      // [4] 天青色（左下区域）
      { hue: 195, sat: 76, ltn: 60,
        xFreq: 0.08, yFreq: 0.07, xAmp: 0.17, yAmp: 0.15,
        xBase: 0.12, yBase: 0.70,
        sizeBase: 0.42, sizeAmp: 0.11,
        opBase: 0.34, opAmp: 0.09,
        hueAmp: 5 },
      // [5] 浅靛蓝（中央补充，增加融合）
      { hue: 228, sat: 68, ltn: 58,
        xFreq: 0.06, yFreq: 0.10, xAmp: 0.13, yAmp: 0.16,
        xBase: 0.42, yBase: 0.58,
        sizeBase: 0.48, sizeAmp: 0.13,
        opBase: 0.32, opAmp: 0.08,
        hueAmp: 6 },
    ];

    // ── 简化噪声函数（多层正弦叠加模拟 Perlin）──
    const noise = (t: number, freq1: number, freq2: number, offset: number): number => {
      return Math.sin(t * freq1 + offset)
           + Math.sin(t * freq2 + offset * 1.7) * 0.5
           + Math.sin(t * (freq1 + freq2) * 0.5 + offset * 0.3) * 0.25;
    };

    const draw = () => {
      time += 0.012; // 速度：约 8~10s 完成一个明显变化周期
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const shortEdge = Math.min(w, h);

      ctx.clearRect(0, 0, w, h);

      // ── Step 1: 绘制动态渐变底色（本身也在呼吸）──
      const bgHue = 212 + Math.sin(time * 0.04) * 6;       // 206°~218°
      const bgSat = 55 + Math.sin(time * 0.03) * 8;         // 47%~63%
      const bgLtn = 18 + Math.sin(time * 0.025) * 5;        // 13%~23%（中等亮度！不暗不刺眼）
      ctx.fillStyle = `hsl(${bgHue}, ${bgSat}%, ${bgLtn}%)`;
      ctx.fillRect(0, 0, w, h);

      // ── Step 2: 绘制 6 个巨大液体色斑 ──
      for (let i = 0; i < BLOBS.length; i++) {
        const b = BLOBS[i];

        // 位置：李萨如曲线轨迹（有机非重复运动）
        const nx = noise(time, b.xFreq, b.xFreq * 1.6, i * 2.1);
        const ny = noise(time, b.yFreq, b.yFreq * 1.4, i * 3.7);
        const bx = w * (b.xBase + (nx / 1.75) * b.xAmp);
        const by = h * (b.yBase + (ny / 1.75) * b.yAmp);

        // 尺寸：呼吸脉动
        const szNoise = Math.sin(time * 0.05 + i * 1.2) * 0.5 + 0.5;
        const radius = shortEdge * (b.sizeBase + szNoise * b.sizeAmp);

        // 透明度：呼吸 + 噪声波动
        const opNoise = Math.sin(time * 0.08 + i * 0.9) * 0.5 + 0.5;
        const op = b.opBase + opNoise * b.opAmp;

        // 色相：缓慢漂移
        const hueShift = Math.sin(time * 0.03 + i * 0.6) * b.hueAmp;
        const hslHue = b.hue + hueShift;

        // 绘制径向渐变色斑
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
        grad.addColorStop(0, `hsla(${hslHue}, ${b.sat}%, ${b.ltn}%, ${op.toFixed(2)})`);
        grad.addColorStop(0.25, `hsla(${hslHue}, ${b.sat - 4}%, ${b.ltn - 4}%, ${(op * 0.65).toFixed(2)})`);
        grad.addColorStop(0.55, `hsla(${hslHue + 4}, ${b.sat - 10}%, ${b.ltn - 8}%, ${(op * 0.30).toFixed(2)})`);
        grad.addColorStop(0.80, `hsla(${hslHue + 6}, ${b.sat - 16}%, ${b.ltn - 12}%, ${(op * 0.10).toFixed(2)})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Step 3: 流动光线（caustics 效果）──
      // 2条斜向光线持续扫过画面，增强"流动"方向感
      for (let ri = 0; ri < 2; ri++) {
        // 光线位置随时间移动
        const rx = ((time * (35 + ri * 18)) % (w * 1.4)) - w * 0.2;
        const ryBase = h * (0.25 + ri * 0.42);
        const ry = ryBase + Math.sin(time * 0.15 + ri * 2) * h * 0.12;

        // 光线角度
        const angle = (-25 + ri * 15) * Math.PI / 180;

        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(angle);

        const rayGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, shortEdge * 0.45);
        if (ri === 0) {
          rayGrad.addColorStop(0, 'rgba(147, 197, 253, 0.14)');
          rayGrad.addColorStop(0.4, 'rgba(125, 211, 252, 0.07)');
          rayGrad.addColorStop(1, 'transparent');
        } else {
          rayGrad.addColorStop(0, 'rgba(196, 181, 253, 0.10)');
          rayGrad.addColorStop(0.4, 'rgba(167, 139, 250, 0.05)');
          rayGrad.addColorStop(1, 'transparent');
        }

        // 拉伸成椭圆形（光线形态）
        ctx.scale(1, 0.18);
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.arc(0, 0, shortEdge * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
