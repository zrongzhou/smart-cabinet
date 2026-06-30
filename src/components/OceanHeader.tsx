'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v213 — Canvas Caustics 焦散液体
//
// 28 版教训总结：
//   v183-v199: Canvas 2D 模糊色斑 → "一团光"，无液体感
//   v200-v210: WebGL Shader GLSL → 颜色漂白全白（11版全军覆没）
//   v211-v212: CSS blur 色斑 → 终于显示蓝色，但像蓝布不像液体
//   v209 诊断：固定深蓝 #265999 清晰可见 → 渲染管线正常
//
// v213 方向：
//   ★ Caustics 焦散纹理 ★ — 液体感的真正来源！
//   用正弦波干涉在 Canvas 2D 上绘制网状焦散图案（像泳池底部光影）
//   + 中等亮度蓝色底（v209 证实 L≈0.35-0.45 可见）
// + 锐利高光点
// + 所有颜色硬编码 RGB
// ============================================================

function CausticsLiquid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let animId = 0;
    const W = () => canvas.width;
    const H = () => canvas.height;

    // ─── resize handler ───
    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx.scale(dpr, dpr);
    }

    // ─── Caustics 核心：正弦波干涉产生网状焦散纹 ───
    // 原理：多层不同频率/方向的正弦波叠加后取绝对值
    //       波峰相交处形成明亮的"网线"，这就是 caustics 的数学模型
    function drawCaustics(t: number, w: number, h: number) {
      // 时间缩放：非常慢，模拟黏稠液体
      const tt = t * 0.0004; // 每 25 秒一个完整周期

      const imgData = ctx.createImageData(
        Math.ceil(w / 3), Math.ceil(h / 3)
      );
      const data = imgData.data;
      const iw = imgData.width;
      const ih = imgData.height;

      for (let py = 0; py < ih; py++) {
        for (let px = 0; px < iw; px++) {
          // 映射到实际坐标（3x 下采样加速渲染）
          const x = (px / iw) * w;
          const y = (py / ih) * h;
          const nx = x / w;
          const ny = y / h;

          // ══════════════════════════════
          // Caustics 纹理生成（6层正弦波干涉）
          // ══════════════════════════════
          let v = 0;

          // 层1-2: 大尺度波浪（低频，形成大网孔）
          v += Math.sin(nx * 5.0 + tt * 0.8) * Math.cos(ny * 4.0 - tt * 0.6);
          v += Math.sin(ny * 4.5 + nx * 3.0 + tt * 0.5) * 0.8;

          // 层3-4: 中尺度扭曲（中频，让网线弯曲变形）
          v += Math.sin((nx + ny) * 7.0 + tt * 1.2) * Math.cos(nx * 6.0 - ny * 5.0 + tt) * 0.6;
          v += Math.sin(nx * 8.0 - ny * 6.5 + tt * 0.9) * Math.cos(ny * 7.0 + tt * 0.7) * 0.5;

          // 层5-6: 小尺度细节（高频，增加纹理精细度）
          v += Math.sin(nx * 14.0 + ny * 11.0 + tt * 1.8) * 0.25;
          v += Math.cos(nx * 12.0 - ny * 15.0 + tt * 1.5) * 0.2;

          // 关键：取绝对值 + pow 来创建锐利的"网线"
          v = Math.abs(v);
          v = Math.pow(v, 0.55); // 降低 gamma 让亮区更突出

          // ══════════════════════════════
          // 颜色映射 — 硬编码 RGB，不依赖 HSL
          // ══════════════════════════════

          // 基础蓝色（中等亮度，参考 v209 #265999 的成功经验）
          // #265999 ≈ rgb(38,89,153) — 这个颜色被确认能正确显示
          let r = 28, g = 72, b = 138; // 深靛蓝底

          // Caustics 亮区：提亮到天蓝色（光折射效果）
          // 亮度范围从深蓝(28,72,138) 到浅天蓝(120,185,235)
          if (v > 0.35) {
            const intensity = (v - 0.35) / 0.65; // 0~1
            const ease = intensity * intensity * (3 - 2 * intensity); // smoothstep
            r = r + (120 - r) * ease * 0.75;
            g = g + (185 - g) * ease * 0.75;
            b = b + (235 - b) * ease * 0.75;
          }

          // 最亮的区域加一点青色调（光线穿过液体的感觉）
          if (v > 0.65) {
            const hi = (v - 0.65) / 0.35;
            g = g + (215 - g) * hi * 0.4;
            b = b + (245 - b) * hi * 0.3;
          }

          // 边缘暗角（微弱，营造容器感）
          const cx = nx - 0.5;
          const cy = ny - 0.5;
          const dist = Math.sqrt(cx * cx * 1.4 + cy * cy);
          const vignette = Math.max(0.78, 1 - dist * 0.32);
          r *= vignette;
          g *= vignette;
          b *= vignette;

          const idx = (py * iw + px) * 4;
          data[idx] = Math.min(255, Math.max(0, r));
          data[idx + 1] = Math.min(255, Math.max(0, g));
          data[idx + 2] = Math.min(255, Math.max(0, b));
          data[idx + 3] = 255;
        }
      }

      return imgData;
    }

    // ─── Specular 高亮点（玻璃表面反光）───
    function drawSpeculars(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {
      const tt = t * 0.0008;

      // 4-5 个主要高光点，缓慢移动
      const spots = [
        { bx: 0.22, by: 0.28, sx: 0.08, sy: 0.04, rot: -15 }, // 左上主反光
        { bx: 0.68, by: 0.22, sx: 0.06, sy: 0.03, rot: 8 },  // 右上小反光
        { bx: 0.35, by: 0.58, sx: 0.05, sy: 0.025, rot: -8 }, // 左下
        { bx: 0.75, by: 0.62, sx: 0.07, sy: 0.035, rot: 12 }, // 右下
        { bx: 0.50, by: 0.40, sx: 0.10, sy: 0.03, rot: -5 },  // 中央横条
      ];

      spots.forEach((spot, i) => {
        const phase = tt + i * 1.3;
        const x = (spot.bx + Math.sin(phase * 0.7) * 0.02) * w;
        const y = (spot.by + Math.cos(phase * 0.5) * 0.015) * h;
        const rx = spot.sx * w * (0.85 + Math.sin(phase * 1.1) * 0.15);
        const ry = spot.sy * h * (0.85 + Math.cos(phase * 0.9) * 0.15);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(((spot.rot + Math.sin(phase) * 3) * Math.PI) / 180);

        // 高光渐变：中心近白 → 边缘透明
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
        grad.addColorStop(0, 'rgba(220,240,255,0.70)');
        grad.addColorStop(0.3, 'rgba(180,220,255,0.40)');
        grad.addColorStop(0.6, 'rgba(140,200,255,0.15)');
        grad.addColorStop(1, 'rgba(100,180,255,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    }

    // ─── 微小闪烁点 ───
    function drawSparkles(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {
      const tt = t * 0.001;
      const positions = [
        [0.18, 0.24], [0.72, 0.18], [0.48, 0.52],
        [0.25, 0.68], [0.82, 0.56], [0.55, 0.30], [0.38, 0.42],
      ];

      positions.forEach(([px, py], i) => {
        const phase = tt + i * 2.1;
        const brightness = Math.pow(Math.abs(Math.sin(phase)), 5); // 尖峰闪烁
        if (brightness < 0.15) return;

        const x = px * w + Math.sin(phase * 0.8) * 6;
        const y = py * h + Math.cos(phase * 0.6) * 4;
        const size = 2 + brightness * 3;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
        grad.addColorStop(0, `rgba(255,255,255,${brightness * 0.9})`);
        grad.addColorStop(0.4, `rgba(200,235,255,${brightness * 0.5})`);
        grad.addColorStop(1, 'rgba(150,210,255,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ─── 主渲染循环 ───
    function render(time: number) {
      if (!canvas) { animId = requestAnimationFrame(render); return; }
      const rect = canvas.getBoundingClientRect();
      const displayW = rect.width;
      const displayH = rect.height;

      if (displayW <= 0 || displayH <= 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      // 1. 绘制 Caustics 焦散纹理（底层）
      const imgData = drawCaustics(time, displayW, displayH);

      // 创建临时 canvas 放置低分辨率 imageData 再放大回显示分辨率
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgData.width;
      tempCanvas.height = imgData.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.putImageData(imgData, 0, 0);

      // 清空并绘制（使用低分辨率的 smooth 放大 = 自然的模糊效果）
      ctx.clearRect(0, 0, displayW, displayH);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(tempCanvas, 0, 0, displayW, displayH);

      // 2. 叠加高光层（在显示分辨率上绘制）
      drawSpeculars(ctx, time, displayW, displayH);
      drawSparkles(ctx, time, displayW, displayH);

      animId = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full"
      style={{ background: '#1a4270' }} /* fallback 底色 */
    />
  );
}

export default memo(function OceanHeader({ title, subtitle, children, icon }: {
  title: string; subtitle?: string; children?: React.ReactNode; icon?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden" style={{ background: '#1a4270' }}>
      {/* Canvas Caustics 液体层 */}
      <CausticsLiquid />

      {/* 星光点缀 */}
      {[
        { x: '15%', y: '22%' }, { x: '82%', y: '15%' },
        { x: '72%', y: '78%' }, { x: '18%', y: '70%' }, { x: '48%', y: '12%' },
      ].map((s, i) => (
        <div key={i} className="absolute pointer-events-none z-10 rounded-full" style={{
          left: s.x, top: s.y,
          width: i === 2 ? 4 : 3, height: i === 2 ? 4 : 3,
          background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(180,220,255,0.35) 40%, rgba(180,220,255,0) 70%)',
          boxShadow: '0 0 6px rgba(160,210,255,0.45)',
          animation: `twinkle ${2 + i * 0.4}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`,
        }} />
      ))}
      <style>{'@keyframes twinkle{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}'}</style>

      {/* 内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8"
           style={{ minHeight: '320px', paddingTop: '80px', paddingBottom: '48px' }}>
        {icon && <div className="mb-4">{icon}</div>}
        {children}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 max-w-4xl leading-tight tracking-tight"
            style={{ color: 'white', textShadow: '0 2px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,0,0,0.15)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed opacity-90"
             style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 12px rgba(0,0,0,0.25)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
});
