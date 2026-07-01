'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v228 �?Aurora Soul (极光之魂) �?修复画面静止Bug
//
// �?v228 修复记录 �?//
// v226/v227 问题:
//   - CSS transform 属性冲突导致光球漂移动画失�?//   - 光球基础alpha太低 (0.36~0.50)，可见度不足
//   - blur太大 (40~55px)，细节被吃掉
//   - 动画周期太长 (14~22s + 9s)，变化无法感�?//
// v228 修复方案:
//   �?�?wrapper div 分离 transform 动画 (float控制translate, pulse控制scale+opacity)
//   �?大幅提高光球基础alpha (0.65~0.80)
//   �?降低 blur (20~35px)
//   �?缩短动画周期 (float 10~14s, pulse 6~8s)
//   �?加大呼吸幅度 (0.08~1.0)
//   �?保持蓝色系配�?+ 现有架构
// ============================================================

function AuroraSoul() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── 极简Canvas噪声 (只做底层有机纹理, 不是主角!) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    let animId = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
    }

    function noise(x: number, y: number): number {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return (n - Math.floor(n)) * 2 - 1;
    }

    function render(time: number) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) { animId = requestAnimationFrame(render); return; }

      resize();
      const w = canvas.width, h = canvas.height;
      const t = time * 0.0008;

      ctx.clearRect(0, 0, w, h);

      // 只画6个大而柔和的光斑 (不是逐像素FBM!)
      const orbs = [
        { x: 0.25 + Math.sin(t * 0.7) * 0.08, y: 0.30 + Math.cos(t * 0.5) * 0.06, r: 0.35, hue: 220 },
        { x: 0.70 + Math.sin(t * 0.5 + 1) * 0.10, y: 0.25 + Math.cos(t * 0.6) * 0.07, r: 0.30, hue: 200 },
        { x: 0.45 + Math.sin(t * 0.6 + 2) * 0.07, y: 0.65 + Math.cos(t * 0.4) * 0.08, r: 0.38, hue: 235 },
        { x: 0.15 + Math.sin(t * 0.8 + 3) * 0.09, y: 0.70 + Math.cos(t * 0.55) * 0.05, r: 0.28, hue: 195 },
        { x: 0.82 + Math.sin(t * 0.45 + 4) * 0.06, y: 0.60 + Math.cos(t * 0.65) * 0.09, r: 0.32, hue: 215 },
        { x: 0.55 + Math.sin(t * 0.55 + 5) * 0.11, y: 0.42 + Math.cos(t * 0.48) * 0.07, r: 0.25, hue: 205 },
      ];

      orbs.forEach((orb) => {
        const ox = orb.x * w;
        const oy = orb.y * h;
        const or = Math.max(orb.r * w, orb.r * h);

        // 每个光斑有微妙的色相偏移 (随时间变�?
        const hueDrift = Math.sin(t * 0.3 + orb.hue) * 12;
        const sat = 60 + Math.sin(t * 0.4 + orb.x * 10) * 15;
        const light = 45 + Math.cos(t * 0.25 + orb.y * 10) * 12;

        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, or);
        grad.addColorStop(0, `hsla(${orb.hue + hueDrift}, ${sat}%, ${light + 25}%, 0.30)`);
        grad.addColorStop(0.4, `hsla(${orb.hue + hueDrift + 5}, ${sat - 5}%, ${light + 15}%, 0.18)`);
        grad.addColorStop(0.7, `hsla(${orb.hue + hueDrift + 10}, ${sat - 10}%, ${light + 5}%, 0.08)`);
        grad.addColorStop(1, `hsla(${orb.hue}, ${sat}%, ${light}%, 0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      animId = requestAnimationFrame(render);
    }

    resize();
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── CSS动画光球的参�?(wrapper + inner分离架构) ──
  const cssOrbs = [
    {
      wrapperClass: 'aurora-orb-wrapper-1',
      innerClass: 'aurora-orb-1',
      wrapperDelay: '0s',
      innerDelay: '0s',
    },
    {
      wrapperClass: 'aurora-orb-wrapper-2',
      innerClass: 'aurora-orb-2',
      wrapperDelay: '0s',
      innerDelay: '-2s',
    },
    {
      wrapperClass: 'aurora-orb-wrapper-3',
      innerClass: 'aurora-orb-3',
      wrapperDelay: '0s',
      innerDelay: '-4s',
    },
    {
      wrapperClass: 'aurora-orb-wrapper-4',
      innerClass: 'aurora-orb-4',
      wrapperDelay: '0s',
      innerDelay: '-1s',
    },
  ];

  // ── 星点 ──
  const stars = Array.from({ length: 14 }, (_, i) => ({
    x: 8 + ((i * 17 + 3) % 84),
    y: 10 + ((i * 23 + 7) % 80),
    size: 1 + (i % 3),
    delay: `${-(i * 1.7)}s`,
    dur: `${2.5 + (i % 4) * 1.2}s`,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* ===== Layer 0: 多色渐变底色 (CSS, 不是单一蓝色!) ===== */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(165deg,
              #0c1929 0%,
              #1e3a5f 18%,
              #1d4ed8 38%,
              #1e40af 52%,
              #1e3a8a 68%,
              #172554 82%,
              #0f172a 100%
            )
          `,
        }}
      />

      {/* ===== Layer 1: 极简Canvas噪声 (低alpha, 只是纹理!) ===== */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-[0.55]"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* ===== Layer 2: CSS动画光球 (wrapper + inner分离架构!) ===== */}
      {cssOrbs.map((orb, i) => (
        <div
          key={`wrapper-${i}`}
          className={`absolute ${orb.wrapperClass}`}
          style={{ animationDelay: orb.wrapperDelay }}
        >
          <div
            className={`absolute inset-0 rounded-full ${orb.innerClass}`}
            style={{ animationDelay: orb.innerDelay }}
          />
        </div>
      ))}

      {/* ===== Layer 3: 流动光带 ===== */}
      <div className="aurora-beam aurora-beam-1" />
      <div className="aurora-beam aurora-beam-2" />

      {/* ===== Layer 4: 中央高光 (模拟光源) ===== */}
      <div className="aurora-glow-center" />

      {/* ===== Layer 5: 星点闪烁 ===== */}
      {stars.map((star, i) => (
        <div
          key={`star-${i}`}
          className="absolute rounded-full bg-white aurora-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.dur,
          }}
        />
      ))}

      {/* ===== 关键帧样�?(内联style标签) ===== */}
      <style>{`
        /* ============================================================
           光球架构说明:
           - wrapper div: 只控�?transform: translate() (漂移动画)
           - inner div: 只控�?opacity + transform: scale() (呼吸动画)
           这样两个动画不会冲突!
           ============================================================ */

        /* ── 光球wrapper: 只负责漂�?(控制 transform/translate) ── */
        .aurora-orb-wrapper-1 {
          left: -10%; top: -8%;
          width: 55vw; height: 40vh;
          animation: aurora-float-1 10s ease-in-out infinite alternate;
        }
        .aurora-orb-wrapper-2 {
          right: -12%; top: 18%;
          width: 48vw; height: 38vh;
          animation: aurora-float-2 12s ease-in-out infinite alternate;
        }
        .aurora-orb-wrapper-3 {
          left: 18%; bottom: -15%;
          width: 52vw; height: 42vh;
          animation: aurora-float-3 14s ease-in-out infinite alternate;
        }
        .aurora-orb-wrapper-4 {
          right: 5%; bottom: 5%;
          width: 40vw; height: 32vh;
          animation: aurora-float-4 11s ease-in-out infinite alternate;
        }

        /* ── 光球inner: 只负责呼�?(控制 opacity + scale) ── */
        .aurora-orb-1 {
          background: radial-gradient(ellipse at center,
            rgba(96, 165, 250, 0.80) 0%,
            rgba(59, 130, 246, 0.60) 35%,
            rgba(37, 99, 235, 0.35) 65%,
            transparent 100%
          );
          animation: aurora-pulse-1 6s ease-in-out infinite;
          filter: blur(25px);
        }
        .aurora-orb-2 {
          background: radial-gradient(ellipse at center,
            rgba(96, 165, 250, 0.75) 0%,
            rgba(59, 130, 246, 0.55) 40%,
            rgba(37, 99, 235, 0.30) 70%,
            transparent 100%
          );
          animation: aurora-pulse-2 7s ease-in-out infinite;
          filter: blur(20px);
        }
        .aurora-orb-3 {
          background: radial-gradient(ellipse at center,
            rgba(56, 189, 248, 0.78) 0%,
            rgba(14, 165, 233, 0.58) 38%,
            rgba(2, 132, 199, 0.32) 68%,
            transparent 100%
          );
          animation: aurora-pulse-3 8s ease-in-out infinite;
          filter: blur(30px);
        }
        .aurora-orb-4 {
          background: radial-gradient(ellipse at center,
            rgba(96, 165, 250, 0.72) 0%,
            rgba(59, 130, 246, 0.52) 45%,
            rgba(37, 99, 235, 0.28) 75%,
            transparent 100%
          );
          animation: aurora-pulse-4 6.5s ease-in-out infinite;
          filter: blur(22px);
        }

        /* ── 光球漂移路径 (只控�?translate, 不控�?scale!) ── */
        @keyframes aurora-float-1 {
          0%   { transform: translate(0%, 0%); }
          33%  { transform: translate(8%, 5%); }
          66%  { transform: translate(-4%, 8%); }
          100% { transform: translate(6%, 3%); }
        }
        @keyframes aurora-float-2 {
          0%   { transform: translate(0%, 0%); }
          33%  { transform: translate(-10%, 4%); }
          66%  { transform: translate(5%, -6%); }
          100% { transform: translate(-3%, 7%); }
        }
        @keyframes aurora-float-3 {
          0%   { transform: translate(0%, 0%); }
          33%  { transform: translate(6%, -8%); }
          66%  { transform: translate(-8%, -3%); }
          100% { transform: translate(4%, 5%); }
        }
        @keyframes aurora-float-4 {
          0%   { transform: translate(0%, 0%); }
          33%  { transform: translate(-6%, -5%); }
          66%  { transform: translate(8%, 3%); }
          100% { transform: translate(-4%, -2%); }
        }

        /* ── 光球呼吸动画 (只控�?opacity + scale, 不控�?translate!) ── */
        @keyframes aurora-pulse-1 {
          0%   { opacity: 0.08; transform: scale(0.85); }
          25%  { opacity: 0.45; transform: scale(0.95); }
          45%  { opacity: 1.0;  transform: scale(1.15); }
          70%  { opacity: 0.35; transform: scale(1.0); }
          100% { opacity: 0.08; transform: scale(0.85); }
        }
        @keyframes aurora-pulse-2 {
          0%   { opacity: 0.10; transform: scale(0.90); }
          30%  { opacity: 0.50; transform: scale(1.0); }
          50%  { opacity: 1.0;  transform: scale(1.12); }
          75%  { opacity: 0.40; transform: scale(0.98); }
          100% { opacity: 0.10; transform: scale(0.90); }
        }
        @keyframes aurora-pulse-3 {
          0%   { opacity: 0.08; transform: scale(0.88); }
          28%  { opacity: 0.48; transform: scale(0.96); }
          48%  { opacity: 1.0;  transform: scale(1.10); }
          72%  { opacity: 0.38; transform: scale(1.02); }
          100% { opacity: 0.08; transform: scale(0.88); }
        }
        @keyframes aurora-pulse-4 {
          0%   { opacity: 0.09; transform: scale(0.86); }
          22%  { opacity: 0.42; transform: scale(0.94); }
          45%  { opacity: 1.0;  transform: scale(1.14); }
          68%  { opacity: 0.36; transform: scale(1.01); }
          100% { opacity: 0.09; transform: scale(0.86); }
        }

        /* ── 流动光带 (检查是否有transform冲突) ── */
        .aurora-beam {
          position: absolute;
          pointer-events: none;
          opacity: 0.22;
        }
        .aurora-beam-1 {
          left: -10%; top: 10%;
          width: 70vw; height: 4px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(191, 219, 254, 0.75) 15%,
            rgba(147, 197, 253, 0.95) 40%,
            rgba(96, 165, 250, 0.85) 60%,
            rgba(191, 219, 254, 0.75) 85%,
            transparent 100%
          );
          animation: beam-sweep-1 7s ease-in-out infinite;
          filter: blur(3px);
        }
        .aurora-beam-2 {
          right: -8%; top: 45%;
          width: 55vw; height: 3px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(191, 219, 254, 0.65) 20%,
            rgba(147, 197, 253, 0.85) 50%,
            rgba(96, 165, 250, 0.75) 75%,
            transparent 100%
          );
          animation: beam-sweep-2 8s ease-in-out infinite;
          filter: blur(2px);
        }
        /* 光带动画: 只用一个animation, 所以没有冲�?*/
        @keyframes beam-sweep-1 {
          0%   { transform: rotate(-24deg) translateX(-5%); opacity: 0.10; }
          25%  { transform: rotate(-22deg) translateX(-1%); opacity: 0.32; }
          48%  { transform: rotate(-19deg) translateX(4%); opacity: 0.65; }
          72%  { transform: rotate(-23deg) translateX(6%); opacity: 0.25; }
          100% { transform: rotate(-26deg) translateX(8%); opacity: 0.10; }
        }
        @keyframes beam-sweep-2 {
          0%   { transform: rotate(18deg) translateX(5%); opacity: 0.08; }
          28%  { transform: rotate(20deg) translateX(2%); opacity: 0.28; }
          50%  { transform: rotate(23deg) translateX(-2%); opacity: 0.58; }
          73%  { transform: rotate(20deg) translateX(-5%); opacity: 0.22; }
          100% { transform: rotate(15deg) translateX(-8%); opacity: 0.08; }
        }

        /* ── 中央高光 (光源�? ── */
        .aurora-glow-center {
          position: absolute;
          left: 50%; top: 28%;
          width: 55vw; height: 38vh;
          background: radial-gradient(ellipse at center,
            rgba(191, 219, 254, 0.45) 0%,
            rgba(147, 197, 253, 0.30) 30%,
            rgba(96, 165, 250, 0.15) 55%,
            transparent 80%
          );
          animation: center-glow 7s ease-in-out infinite;
          filter: blur(35px);
        }
        /* 中央高光: 只用一个animation, 所以没有冲�?*/
        @keyframes center-glow {
          0%   { opacity: 0.10; transform: translate(-50%, -50%) scale(0.85); }
          25%  { opacity: 0.50; transform: translate(-49%, -51%) scale(0.95); }
          45%  { opacity: 1.0;  transform: translate(-48%, -52%) scale(1.20); }
          70%  { opacity: 0.45; transform: translate(-51%, -49%) scale(1.05); }
          100% { opacity: 0.10; transform: translate(-50%, -50%) scale(0.85); }
        }

        /* ── 星点闪烁 ── */
        .aurora-star {
          animation: star-twinkle var(--dur, 3s) ease-in-out infinite;
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.3); }
          50%      { opacity: 0.85; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export default memo(function OceanHeader({ title, subtitle, children, icon }: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <header
      className="relative overflow-hidden"
      style={{ background: '#0f172a' }}
    >
      <AuroraSoul />

      {/* 标题内容 */}
      <div className="relative z-10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {icon && (
            <div className="mb-4 text-5xl opacity-80 flex justify-center" aria-hidden="true">
              {typeof icon === 'string' ? <i className={icon} /> : icon}
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-xl text-blue-100 sm:text-2xl drop-shadow">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </header>
  );
});
