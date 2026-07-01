'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v237 — Starry Laser Beam Style
// (based on reference image)
//
// v237 Features:
// - Deep navy background with purple-pink nebula glow
// - 15-20 laser beams (thin white/light blue lines crossing)
// - 50-80 star dots scattered across canvas
// - 8-15 large soft bokeh spots (blur 15-40px)
// - Nebula glow region (bottom-right corner)
// - Subtle elegant animations (not noisy)
// ============================================================

interface StarDot {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  pulse: number;
  twinkleSpeed: number;
}

interface LaserBeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  baseAlpha: number;
  colorType: string;
  pulseSpeed: number;
}

interface BokehSpot {
  x: number;
  y: number;
  radius: number;
  baseR: number;
  baseG: number;
  baseB: number;
  baseAlpha: number;
  driftX: number;
  driftY: number;
  driftSpeedX: number;
  driftSpeedY: number;
}

function StarryScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const stateRef = useRef<{
    stars: StarDot[];
    beams: LaserBeam[];
    bokeh: BokehSpot[];
    time: number;
  } | null>(null);

  // ── Initialize Star Dots (50-80 items) ──
  const initStars = (w: number, h: number): StarDot[] => {
    const stars: StarDot[] = [];
    const count = 50 + Math.floor(Math.random() * 30);

    for (let i = 0; i < count; i++) {
      const sizeRand = Math.random();
      const radius = sizeRand > 0.85 ? 1.5 + Math.random() * 1.5 : 0.5 + Math.random() * 1.0;

      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius,
        baseAlpha: 0.3 + Math.random() * 0.6,
        pulse: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.3 + Math.random() * 0.7,
      });
    }
    return stars;
  };

  // ── Initialize Laser Beams (15-20 items) ──
  const initBeams = (w: number, h: number): LaserBeam[] => {
    const beams: LaserBeam[] = [];
    const count = 15 + Math.floor(Math.random() * 5);

    const beamConfigs = [
      { start: [0.05, 0.1], end: [0.45, 0.95], width: 1, alpha: 0.18, colorType: 'white' },
      { start: [0.0, 0.25], end: [0.55, 1.0], width: 0.5, alpha: 0.15, colorType: 'white' },
      { start: [0.15, 0.0], end: [0.6, 0.88], width: 1, alpha: 0.2, colorType: 'white' },
      { start: [0.08, 0.4], end: [0.65, 1.08], width: 0.5, alpha: 0.12, colorType: 'white' },
      { start: [0.2, 0.05], end: [0.7, 0.82], width: 1.5, alpha: 0.25, colorType: 'white' },
      { start: [0.02, 0.5], end: [0.52, 1.05], width: 0.5, alpha: 0.13, colorType: 'white' },
      { start: [0.12, 0.18], end: [0.75, 0.92], width: 1, alpha: 0.16, colorType: 'white' },
      { start: [0.0, 0.35], end: [0.62, 1.02], width: 0.5, alpha: 0.14, colorType: 'lightblue' },
      { start: [0.18, 0.02], end: [0.8, 0.78], width: 1, alpha: 0.22, colorType: 'white' },
      { start: [0.06, 0.6], end: [0.58, 1.1], width: 0.5, alpha: 0.11, colorType: 'lightpurple' },
      { start: [0.25, 0.0], end: [0.75, 0.85], width: 1, alpha: 0.19, colorType: 'white' },
      { start: [0.0, 0.45], end: [0.48, 1.0], width: 0.5, alpha: 0.12, colorType: 'white' },
      { start: [0.1, 0.3], end: [0.7, 0.95], width: 1, alpha: 0.21, colorType: 'white' },
      { start: [0.03, 0.55], end: [0.53, 1.06], width: 0.5, alpha: 0.13, colorType: 'lightblue' },
      { start: [0.22, 0.08], end: [0.72, 0.88], width: 1.5, alpha: 0.23, colorType: 'white' },
      { start: [0.0, 0.15], end: [0.6, 0.92], width: 0.5, alpha: 0.14, colorType: 'white' },
    ];

    beamConfigs.forEach((cfg, i) => {
      if (i >= count) return;
      beams.push({
        x1: cfg.start[0] * w,
        y1: cfg.start[1] * h,
        x2: cfg.end[0] * w,
        y2: cfg.end[1] * h,
        width: cfg.width,
        baseAlpha: cfg.alpha,
        colorType: cfg.colorType,
        pulseSpeed: 0.5 + Math.random() * 0.5,
      });
    });

    return beams;
  };

  // ── Initialize Bokeh Spots (8-15 items) ──
  const initBokeh = (w: number, h: number): BokehSpot[] => {
    const spots: BokehSpot[] = [];
    const count = 8 + Math.floor(Math.random() * 7);

    const colorConfigs = [
      { r: 96, g: 165, b: 250 },
      { r: 147, g: 197, b: 253 },
      { r: 196, g: 181, b: 253 },
      { r: 244, g: 114, b: 182 },
      { r: 251, g: 191, b: 36 },
    ];

    for (let i = 0; i < count; i++) {
      const cfg = colorConfigs[Math.floor(Math.random() * colorConfigs.length)];
      const alpha = cfg.r === 251
        ? 0.05 + Math.random() * 0.07
        : cfg.r === 244
          ? 0.06 + Math.random() * 0.08
          : 0.08 + Math.random() * 0.10;

      spots.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 20 + Math.random() * 60,
        baseR: cfg.r,
        baseG: cfg.g,
        baseB: cfg.b,
        baseAlpha: alpha,
        driftX: (Math.random() - 0.5) * w * 0.1,
        driftY: (Math.random() - 0.5) * h * 0.1,
        driftSpeedX: (Math.random() - 0.5) * 0.03,
        driftSpeedY: (Math.random() - 0.5) * 0.03,
      });
    }
    return spots;
  };

  // ── Draw Background ──
  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.3, '#0f172a');
    grad.addColorStop(0.6, '#1e3a8a');
    grad.addColorStop(0.85, '#312e81');
    grad.addColorStop(1, '#4c1d95');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  };

  // ── Draw Nebula Glow ──
  const drawNebula = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    const nx = w * 0.7;
    const ny = h * 0.75;
    const nr = Math.max(w, h) * 0.4;

    const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
    const pulse = Math.sin(t * 0.2) * 0.02;
    grad.addColorStop(0, `rgba(196, 181, 253, ${0.15 + pulse})`);
    grad.addColorStop(0.4, `rgba(244, 114, 182, ${0.08 + pulse * 0.5})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  };

  // ── Draw Bokeh Spots ──
  const drawBokeh = (ctx: CanvasRenderingContext2D, bokeh: BokehSpot[], t: number, w: number, h: number) => {
    bokeh.forEach((spot) => {
      spot.driftX += spot.driftSpeedX;
      spot.driftY += spot.driftSpeedY;

      if (spot.driftX < -spot.radius * 2) spot.driftX = w + spot.radius;
      if (spot.driftX > w + spot.radius * 2) spot.driftX = -spot.radius;
      if (spot.driftY < -spot.radius * 2) spot.driftY = h + spot.radius;
      if (spot.driftY > h + spot.radius * 2) spot.driftY = -spot.radius;

      ctx.save();
      ctx.filter = 'blur(25px)';

      const grad = ctx.createRadialGradient(
        spot.x + spot.driftX * 0.1, spot.y + spot.driftY * 0.1, 0,
        spot.x, spot.y, spot.radius
      );
      const pulse = Math.sin(t * 0.15 + spot.x * 0.01) * 0.02;
      const alpha = Math.max(0.03, Math.min(0.2, spot.baseAlpha + pulse));

      grad.addColorStop(0, `rgba(${spot.baseR}, ${spot.baseG}, ${spot.baseB}, ${alpha.toFixed(2)})`);
      grad.addColorStop(0.6, `rgba(${spot.baseR}, ${spot.baseG}, ${spot.baseB}, ${(alpha * 0.5).toFixed(2)})`);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  // ── Draw Laser Beams ──
  const drawBeams = (ctx: CanvasRenderingContext2D, beams: LaserBeam[], t: number) => {
    ctx.save();
    const centerX = ctx.canvas.width * 0.3;
    const centerY = ctx.canvas.height * 0.4;
    const rotAngle = Math.sin(t * 0.2) * 0.035;
    ctx.translate(centerX, centerY);
    ctx.rotate(rotAngle);
    ctx.translate(-centerX, -centerY);

    beams.forEach((beam, i) => {
      const pulse = Math.sin(t * beam.pulseSpeed + i * 0.8) * 0.03;
      const alpha = Math.max(0.08, Math.min(0.35, beam.baseAlpha + pulse));

      let strokeStyle: string;
      if (beam.colorType === 'white') {
        strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      } else if (beam.colorType === 'lightblue') {
        strokeStyle = `rgba(147, 197, 253, ${alpha})`;
      } else {
        strokeStyle = `rgba(196, 181, 253, ${alpha})`;
      }

      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = beam.width;
      ctx.stroke();
    });

    ctx.restore();
  };

  // ── Draw Star Dots ──
  const drawStars = (ctx: CanvasRenderingContext2D, stars: StarDot[], t: number) => {
    stars.forEach((star) => {
      const twinkle = Math.sin(t * star.twinkleSpeed + star.pulse);
      const alpha = twinkle > 0.7
        ? star.baseAlpha + (twinkle - 0.7) * 1.5
        : star.baseAlpha * 0.6;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(0.95, alpha))})`;
      ctx.fill();
    });
  };

  // ── Main Animation Loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    ctxRef.current = ctx;

    let animId = 0;

    function resize() {
      const currentCanvas = canvasRef.current;
      const currentCtx = ctxRef.current;
      if (!currentCanvas || !currentCtx) return;

      const rect = currentCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      currentCanvas.width = Math.max(1, rect.width * dpr);
      currentCanvas.height = Math.max(1, rect.height * dpr);
      currentCtx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;

      stateRef.current = {
        stars: initStars(w, h),
        beams: initBeams(w, h),
        bokeh: initBokeh(w, h),
        time: 0,
      };
    }

    function animate(time: number) {
      const currentCtx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!currentCtx || !canvas) {
        animId = requestAnimationFrame(animate);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) {
        animId = requestAnimationFrame(animate);
        return;
      }

      if (!stateRef.current) {
        resize();
      }

      const state = stateRef.current;
      if (!state) {
        animId = requestAnimationFrame(animate);
        return;
      }

      const t = time * 0.001;
      state.time = t;

      const w = rect.width;
      const h = rect.height;

      currentCtx.clearRect(0, 0, w, h);

      drawBackground(currentCtx, w, h);
      drawBokeh(currentCtx, state.bokeh, t, w, h);
      drawNebula(currentCtx, w, h, t);
      drawBeams(currentCtx, state.beams, t);
      drawStars(currentCtx, state.stars, t);

      animId = requestAnimationFrame(animate);
    }

    resize();
    animId = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(canvasRef.current!);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />
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
      style={{
        background: 'linear-gradient(135deg, #0a0a1a 0%, #0f172a 30%, #1e3a8a 60%, #312e81 85%, #4c1d95 100%)',
      }}
    >
      <StarryScene />

      <div className="relative z-10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.25) 60%, transparent 100%)',
        }} />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          {icon && (
            <div className="mb-4 text-5xl opacity-90 flex justify-center" aria-hidden="true">
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
