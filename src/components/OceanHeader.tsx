'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ============================================================
// OceanHeader v196 — Canvas 极光流场
//
// 设计原则：
//   ✅ 单一 Canvas 驱动所有视觉效果（不依赖 CSS 动画 div）
//   ✅ 颜色足够亮、对比度足够高（肉眼清晰可见！）
//   ✅ 光斑大幅移动 + 亮度呼吸 + 色相偏移
//   ✅ 流光椭圆横穿画面（打破静态分色）
//   ✅ 天青+蓝+靛 统一协调色域
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
      {/* 唯一视觉层：Canvas 极光流场 */}
      <AuroraCanvas />

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
    </section>
  );
}

// ============================================================
// AuroraCanvas — 单一 Canvas 驱动的极光流场
//
// 全部视觉效果由这个 Canvas 实时绘制：
//   Layer 1: 深蓝渐变底色
//   Layer 2: 5个大型动态光斑（位置漂移 + 亮度呼吸 + 色相微偏）
//   Layer 3: 2条流动光带（椭圆横穿画面）
//   Layer 4: 6颗闪烁星光
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

    // ── 光斑配置 ──
    const ORBS = [
      // 主光斑：天青色（最亮最大）
      { baseHue: 195, sat: 82, light: 58, sizeR: 0.52, xB: 0.48, yB: 0.36,
        xAmp: 0.15, yAmp: 0.10, xSpd: 0.13, ySpd: 0.10, opMax: 0.42 },
      // 宝石蓝（右下区域）
      { baseHue: 220, sat: 78, light: 55, sizeR: 0.42, xB: 0.70, yB: 0.52,
        xAmp: 0.12, yAmp: 0.14, xSpd: 0.17, ySpd: 0.12, opMax: 0.36 },
      // 靛蓝（左上方）
      { baseHue: 238, sat: 72, light: 52, sizeR: 0.38, xB: 0.22, yB: 0.42,
        xAmp: 0.14, yAmp: 0.11, xSpd: 0.15, ySpd: 0.18, opMax: 0.32 },
      // 青绿色（右侧边缘）
      { baseHue: 187, sat: 80, light: 54, sizeR: 0.34, xB: 0.80, yB: 0.30,
        xAmp: 0.10, yAmp: 0.13, xSpd: 0.20, ySpd: 0.14, opMax: 0.28 },
      // 淡天青（左下方过渡）
      { baseHue: 202, sat: 70, light: 62, sizeR: 0.30, xB: 0.16, yB: 0.66,
        xAmp: 0.11, yAmp: 0.09, xSpd: 0.12, ySpd: 0.16, opMax: 0.24 },
    ];

    // 星星配置
    const STARS = [
      { xr: 0.22, yr: 0.18, sz: 2.5, spd: 2.8, off: 0 },
      { xr: 0.72, yr: 0.28, sz: 2.0, spd: 3.5, off: -1.2 },
      { xr: 0.48, yr: 0.12, sz: 3.0, spd: 2.2, off: -2.5 },
      { xr: 0.12, yr: 0.58, sz: 2.0, spd: 4.0, off: -0.8 },
      { xr: 0.82, yr: 0.55, sz: 2.5, spd: 3.0, off: -1.8 },
      { xr: 0.38, yr: 0.70, sz: 1.8, spd: 3.8, off: -3.0 },
    ];

    const draw = () => {
      time += 0.012;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // ═══ Layer 1: 底色 ═══
      const bg = ctx.createLinearGradient(0, 0, w * 0.5, h);
      bg.addColorStop(0, '#071426');
      bg.addColorStop(0.30, '#0b2040');
      bg.addColorStop(0.60, '#0e2a54');
      bg.addColorStop(1, '#091c38');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ═══ Layer 2: 5个动态光斑 ═══
      for (let i = 0; i < ORBS.length; i++) {
        const o = ORBS[i];
        const ox = w * (o.xB + Math.sin(time * o.xSpd + i * 1.3) * o.xAmp);
        const oy = h * (o.yB + Math.cos(time * o.ySpd + i * 0.9) * o.yAmp);
        const baseSz = Math.min(w, h) * o.sizeR;
        const sz = baseSz * (1 + Math.sin(time * 0.25 + i * 0.7) * 0.15);
        const hue = o.baseHue + Math.sin(time * 0.08 + i * 1.1) * 8;
        const breath = Math.sin(time * 0.18 + i * 0.5) * 0.5 + 0.5;
        const op = o.opMax * (0.55 + breath * 0.45);

        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, sz);
        g.addColorStop(0, 'hsla(' + hue + ',' + o.sat + '%,' + o.light + '%,' + op.toFixed(2) + ')');
        g.addColorStop(0.35, 'hsla(' + hue + ',' + (o.sat - 8) + '%,' + (o.light - 6) + '%,' + (op * 0.45).toFixed(2) + ')');
        g.addColorStop(0.70, 'hsla(' + (hue + 10) + ',' + (o.sat - 15) + '%,' + (o.light - 12) + '%,' + (op * 0.15).toFixed(2) + ')');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // ═══ Layer 3: 流光带 A — 天青→蓝，右→左横穿 ═══
      const sAx = ((time * 38) % (w * 1.5)) - w * 0.25;
      const sAy = h * (0.35 + Math.sin(time * 0.2) * 0.15);
      ctx.save();
      ctx.translate(sAx, sAy);
      ctx.scale((w * 0.35) / (h * 0.10), 1);
      const egA = ctx.createRadialGradient(0, 0, 0, 0, 0, h * 0.10);
      egA.addColorStop(0, 'rgba(125,211,252,0.24)');
      egA.addColorStop(0.40, 'rgba(59,130,246,0.16)');
      egA.addColorStop(0.75, 'rgba(99,102,241,0.06)');
      egA.addColorStop(1, 'transparent');
      ctx.fillStyle = egA;
      ctx.fillRect(-w * 0.35, -h * 0.10, w * 0.70, h * 0.20);
      ctx.restore();

      // ═══ Layer 3b: 流光带 B — 靛→青，左→右反向横穿 ═══
      const sBx = w - ((time * 28) % (w * 1.4)) - w * 0.20;
      const sBy = h * (0.60 + Math.cos(time * 0.16) * 0.12);
      ctx.save();
      ctx.translate(sBx, sBy);
      ctx.scale((w * 0.26) / (h * 0.08), 1);
      const egB = ctx.createRadialGradient(0, 0, 0, 0, 0, h * 0.08);
      egB.addColorStop(0, 'rgba(99,102,241,0.20)');
      egB.addColorStop(0.35, 'rgba(56,189,248,0.13)');
      egB.addColorStop(0.72, 'rgba(34,211,238,0.05)');
      egB.addColorStop(1, 'transparent');
      ctx.fillStyle = egB;
      ctx.fillRect(-w * 0.26, -h * 0.08, w * 0.52, h * 0.16);
      ctx.restore();

      // ═══ Layer 4: 星光闪烁 ═══
      for (let i = 0; i < STARS.length; i++) {
        const s = STARS[i];
        const tw = Math.sin(time * s.spd + s.off);
        const bright = tw > 0 ? tw * tw : 0;
        if (bright < 0.06) continue;

        const sx = s.xr * w;
        const sy = s.yr * h;
        const alpha = bright * 0.92;

        // 外发光晕
        ctx.beginPath();
        ctx.arc(sx, sy, s.sz * (1.5 + bright * 2), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(186,230,253,' + (alpha * 0.25).toFixed(2) + ')';
        ctx.fill();

        // 核心亮点
        ctx.beginPath();
        ctx.arc(sx, sy, s.sz * bright, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240,248,255,' + alpha.toFixed(2) + ')';
        ctx.fill();
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
