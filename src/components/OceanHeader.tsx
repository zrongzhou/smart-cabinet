'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v236 — Water Drops + Frost + Multi-color Cubes
// (based on 7 reference images)
//
// v236 Features:
// - Isometric 3D cubes (3 visible faces with brightness distinction)
// - Water dropets on crystal surfaces (8-15 per crystal)
// - Frost texture (30-50 tiny white dots per crystal)
// - Bright multi-color background (purple→pink→blue→cyan)
// - Bubble system (20-30 across canvas)
// - Sharp specular highlights
// ============================================================

interface Point {
  x: number;
  y: number;
}

interface CrystalFace {
  points: Point[];
  fillColor: string;
  strokeColor: string;
  lineWidth: number;
}

interface WaterDropet {
  x: number;
  y: number;
  radius: number;
  offsetX: number;
  offsetY: number;
  speedX: number;
  speedY: number;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  alpha: number;
  pulse: number;
}

interface Crystal {
  faces: CrystalFace[];
  dropets: WaterDropet[];
  frostDots: Point[];
  centerX: number;
  centerY: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rotatePoint(point: Point, center: Point, angle: number): Point {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cosA - dy * sinA,
    y: center.y + dx * sinA + dy * cosA,
  };
}

function getPolygonBounds(face: Point[]): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  face.forEach(p => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });
  return { minX, maxX, minY, maxY };
}

function isPointInPolygon(x: number, y: number, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function createIsometricCube(
  centerX: number, centerY: number, size: number,
  colors: { top: string; left: string; right: string },
  angle: number
): Crystal {
  const hSize = size * 0.5;
  const vSize = size * 0.3;

  const topCenter = { x: centerX, y: centerY - vSize * 0.5 };
  const top = [
    rotatePoint({ x: centerX - hSize, y: topCenter.y }, topCenter, angle),
    rotatePoint({ x: centerX, y: topCenter.y - vSize }, topCenter, angle),
    rotatePoint({ x: centerX + hSize, y: topCenter.y }, topCenter, angle),
    rotatePoint({ x: centerX, y: topCenter.y + vSize }, topCenter, angle),
  ];

  const left = [
    top[0],
    top[3],
    { x: top[3].x - hSize * 0.3, y: top[3].y + vSize },
    { x: top[0].x - hSize * 0.3, y: top[0].y + vSize },
  ];

  const right = [
    top[3],
    top[2],
    { x: top[2].x + hSize * 0.3, y: top[2].y + vSize },
    { x: top[3].x + hSize * 0.3, y: top[3].y + vSize },
  ];

  const dropets = generateWaterDropets(top, 10);
  const frostDots = [
    ...generateFrostDots(top, 15),
    ...generateFrostDots(left, 10),
    ...generateFrostDots(right, 10),
  ];

  return {
    centerX,
    centerY,
    faces: [
      { points: top, fillColor: colors.top, strokeColor: 'rgba(255,255,255,0.55)', lineWidth: 1.5 },
      { points: left, fillColor: colors.left, strokeColor: 'rgba(255,255,255,0.45)', lineWidth: 1.2 },
      { points: right, fillColor: colors.right, strokeColor: 'rgba(255,255,255,0.40)', lineWidth: 1.0 },
    ],
    dropets,
    frostDots,
  };
}

function generateWaterDropets(face: Point[], count: number): WaterDropet[] {
  const dropets: WaterDropet[] = [];
  const bounds = getPolygonBounds(face);

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let x, y;
    do {
      x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
      attempts++;
    } while (attempts < 10 && !isPointInPolygon(x, y, face));

    if (attempts < 10) {
      dropets.push({
        x,
        y,
        radius: 3 + Math.random() * 9,
        offsetX: 0,
        offsetY: 0,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
      });
    }
  }
  return dropets;
}

function generateFrostDots(face: Point[], count: number): Point[] {
  const dots: Point[] = [];
  const bounds = getPolygonBounds(face);

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let x, y;
    do {
      x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
      attempts++;
    } while (attempts < 10 && !isPointInPolygon(x, y, face));

    if (attempts < 10) {
      dots.push({ x, y });
    }
  }
  return dots;
}

function IceCrystalScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationStateRef = useRef<{
    crystals: Crystal[];
    bubbles: Bubble[];
    time: number;
  } | null>(null);

  const initCrystals = (w: number, h: number): Crystal[] => {
    const cubeSize = w * 0.12;
    const isoAngle = Math.PI / 6;

    return [
      createIsometricCube(0.20 * w, 0.35 * h, cubeSize * 1.2, { top: '#93c5fd', left: '#60a5fa', right: '#3b82f6' }, isoAngle),
      createIsometricCube(0.70 * w, 0.25 * h, cubeSize * 0.9, { top: '#c4b5fd', left: '#a78bfa', right: '#7c3aed' }, isoAngle),
      createIsometricCube(0.72 * w, 0.65 * h, cubeSize * 1.0, { top: '#67e8f9', left: '#22d3ee', right: '#06b6d4' }, isoAngle),
      createIsometricCube(0.45 * w, 0.55 * h, cubeSize * 0.7, { top: '#a7f3d0', left: '#6ee7b7', right: '#059669' }, isoAngle),
    ];
  };

  const initBubbles = (w: number, h: number): Bubble[] => {
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 25; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 4 + Math.random() * 14,
        speedY: 0.15 + Math.random() * 0.25,
        speedX: (Math.random() - 0.5) * 0.12,
        alpha: 0.25 + Math.random() * 0.35,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    return bubbles;
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#a78bfa');
    bgGrad.addColorStop(0.3, '#f0abfc');
    bgGrad.addColorStop(0.6, '#93c5fd');
    bgGrad.addColorStop(1, '#67e8f9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const haloGrad = ctx.createRadialGradient(w * 0.4, h * 0.3, 0, w * 0.4, h * 0.3, w * 0.6);
    haloGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
    haloGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(0, 0, w, h);
  };

  const drawCrystal = (ctx: CanvasRenderingContext2D, crystal: Crystal, t: number) => {
    crystal.faces.forEach((face, faceIdx) => {
      ctx.beginPath();
      ctx.moveTo(face.points[0].x, face.points[0].y);
      for (let i = 1; i < face.points.length; i++) {
        ctx.lineTo(face.points[i].x, face.points[i].y);
      }
      ctx.closePath();

      const baseColor = face.fillColor;
      const alphaOffset = Math.sin(t * 0.6 + faceIdx * 0.5) * 0.03;
      const baseAlpha = 0.7;
      ctx.fillStyle = hexToRgba(baseColor, Math.max(0.4, Math.min(1, baseAlpha + alphaOffset)));
      ctx.fill();

      ctx.strokeStyle = face.strokeColor;
      ctx.lineWidth = face.lineWidth;
      ctx.stroke();
    });

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    crystal.frostDots.forEach((dot) => {
      const pulse = Math.sin(t * 0.8 + dot.x * 0.1) * 0.1;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 0.5 + pulse, 0, Math.PI * 2);
      ctx.fill();
    });

    crystal.dropets.forEach((droplet) => {
      droplet.offsetX += droplet.speedX;
      droplet.offsetY += droplet.speedY;
      if (Math.abs(droplet.offsetX) > 5) droplet.speedX *= -1;
      if (Math.abs(droplet.offsetY) > 5) droplet.speedY *= -1;

      const dx = droplet.x + droplet.offsetX;
      const dy = droplet.y + droplet.offsetY;

      const grad = ctx.createRadialGradient(dx - droplet.radius * 0.3, dy - droplet.radius * 0.3, 0, dx, dy, droplet.radius);
      grad.addColorStop(0, 'rgba(255,255,255,0.85)');
      grad.addColorStop(0.4, 'rgba(255,255,255,0.5)');
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(dx, dy, droplet.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  const drawBubbles = (ctx: CanvasRenderingContext2D, bubbles: Bubble[], t: number, w: number, h: number) => {
    bubbles.forEach((bubble) => {
      bubble.y -= bubble.speedY;
      bubble.x += bubble.speedX + Math.sin(t * 0.5 + bubble.pulse) * 0.15;

      if (bubble.y < -20) {
        bubble.y = h + 20;
        bubble.x = Math.random() * w;
      }
      if (bubble.x < -20) bubble.x = w + 20;
      if (bubble.x > w + 20) bubble.x = -20;

      const pulse = Math.sin(t * 0.8 + bubble.pulse) * 0.12;
      const alpha = Math.max(0.15, Math.min(0.6, bubble.alpha + pulse));

      const grad = ctx.createRadialGradient(bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, 0, bubble.x, bubble.y, bubble.radius);
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(0.5, `rgba(191,219,254,${alpha * 0.6})`);
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.55})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  const drawSparkles = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const sparkles = [
      { x: 0.18, y: 0.22, size: 2.5 },
      { x: 0.42, y: 0.15, size: 1.8 },
      { x: 0.28, y: 0.62, size: 2.2 },
      { x: 0.68, y: 0.32, size: 2.0 },
      { x: 0.82, y: 0.68, size: 1.8 },
      { x: 0.52, y: 0.78, size: 2.5 },
      { x: 0.22, y: 0.75, size: 2.0 },
      { x: 0.62, y: 0.12, size: 2.2 },
      { x: 0.35, y: 0.45, size: 1.5 },
      { x: 0.78, y: 0.48, size: 2.0 },
    ];

    sparkles.forEach((sparkle, i) => {
      const flash = Math.sin(t * 2.2 + i * 1.5);
      const alpha = flash > 0.82 ? (flash - 0.82) * 5.56 : 0;

      if (alpha > 0) {
        ctx.beginPath();
        ctx.arc(sparkle.x * w, sparkle.y * h, sparkle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sparkle.x * w, sparkle.y * h, sparkle.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.25})`;
        ctx.fill();
      }
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    ctxRef.current = ctx;

    let animId = 0;

    function resize() {
      const currentCanvas = canvasRef.current;
      if (!currentCanvas) return;

      const rect = currentCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      currentCanvas.width = Math.max(1, rect.width * dpr);
      currentCanvas.height = Math.max(1, rect.height * dpr);

      const currentCtx = ctxRef.current;
      if (!currentCtx) return;
      currentCtx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      animationStateRef.current = {
        crystals: initCrystals(w, h),
        bubbles: initBubbles(w, h),
        time: 0,
      };
    }

    function animate(time: number) {
      const currentCtx = ctxRef.current;
      if (!currentCtx) {
        animId = requestAnimationFrame(animate);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(animate);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) {
        animId = requestAnimationFrame(animate);
        return;
      }

      if (!animationStateRef.current) {
        resize();
      }

      const state = animationStateRef.current;
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
      drawBubbles(currentCtx, state.bubbles, t, w, h);

      state.crystals.forEach((crystal) => {
        drawCrystal(currentCtx, crystal, t);
      });

      drawSparkles(currentCtx, t, w, h);

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
      style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #f0abfc 30%, #93c5fd 60%, #67e8f9 100%)' }}
    >
      <IceCrystalScene />

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
            <p className="mt-4 text-xl text-purple-100 sm:text-2xl drop-shadow">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </header>
  );
});
