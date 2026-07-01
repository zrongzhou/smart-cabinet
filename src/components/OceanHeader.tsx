'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v235 — Canvas 2D Faceted Crystal
//
// Complete refactor from CSS to Canvas 2D:
// - 3D polygon crystals (2-3 faces each with brightness distinction)
// - Long highlight lines (not dots!) along edges
// - 8-12 laser beams radiating from top-left
// - Crystal edge outlines (1-2px white/light blue)
// - Small bubbles/light dots (15-25 across canvas)
// - BRIGHT background (#3b82f6/#2563eb, NOT #0f172a!)
// ============================================================

interface Point {
  x: number;
  y: number;
}

interface CrystalFace {
  points: Point[];
  fillColor: string;
  fillAlpha: number;
  strokeColor: string;
  lineWidth: number;
}

interface Crystal {
  faces: CrystalFace[];
  highlightLines: HighlightLine[];
  centerX: number;
  centerY: number;
}

interface HighlightLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  alpha: number;
  width: number;
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

function IceCrystalScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationStateRef = useRef<{
    crystals: Crystal[];
    laserBeams: Point[][];
    bubbles: Bubble[];
    time: number;
  } | null>(null);

  // ── Initialize Crystal Geometries ──
  const initCrystals = (w: number, h: number): Crystal[] => {
    return [
      // Crystal 1 (Left-Center, Largest) - Pentagon + 2 side faces
      {
        centerX: 0.22 * w,
        centerY: 0.35 * h,
        faces: [
          // Front face (bright)
          {
            points: [
              { x: 0.10 * w, y: 0.20 * h },
              { x: 0.35 * w, y: 0.12 * h },
              { x: 0.42 * w, y: 0.35 * h },
              { x: 0.28 * w, y: 0.55 * h },
              { x: 0.08 * w, y: 0.42 * h },
            ],
            fillColor: 'rgba(147, 197, 253, 0.38)',
            fillAlpha: 0.38,
            strokeColor: 'rgba(255, 255, 255, 0.50)',
            lineWidth: 1.5,
          },
          // Side face 1 (darker)
          {
            points: [
              { x: 0.35 * w, y: 0.12 * h },
              { x: 0.48 * w, y: 0.22 * h },
              { x: 0.45 * w, y: 0.45 * h },
              { x: 0.42 * w, y: 0.35 * h },
            ],
            fillColor: 'rgba(96, 165, 250, 0.28)',
            fillAlpha: 0.28,
            strokeColor: 'rgba(255, 255, 255, 0.38)',
            lineWidth: 1.2,
          },
          // Side face 2 (darkest)
          {
            points: [
              { x: 0.28 * w, y: 0.55 * h },
              { x: 0.42 * w, y: 0.35 * h },
              { x: 0.45 * w, y: 0.45 * h },
              { x: 0.38 * w, y: 0.65 * h },
              { x: 0.18 * w, y: 0.58 * h },
            ],
            fillColor: 'rgba(59, 130, 246, 0.25)',
            fillAlpha: 0.25,
            strokeColor: 'rgba(255, 255, 255, 0.35)',
            lineWidth: 1.0,
          },
        ],
        highlightLines: [
          { x1: 0.12 * w, y1: 0.22 * h, x2: 0.25 * w, y2: 0.18 * h, color: 'rgba(255,255,255,0.65)', alpha: 0.65, width: 2 },
          { x1: 0.15 * w, y1: 0.30 * h, x2: 0.32 * w, y2: 0.25 * h, color: 'rgba(255,255,255,0.58)', alpha: 0.58, width: 1.5 },
          { x1: 0.20 * w, y1: 0.42 * h, x2: 0.38 * w, y2: 0.38 * h, color: 'rgba(255,255,255,0.62)', alpha: 0.62, width: 2.5 },
        ],
      },
      // Crystal 2 (Top-Right) - Hexagon + side face
      {
        centerX: 0.72 * w,
        centerY: 0.22 * h,
        faces: [
          // Front face
          {
            points: [
              { x: 0.60 * w, y: 0.15 * h },
              { x: 0.78 * w, y: 0.15 * h },
              { x: 0.85 * w, y: 0.32 * h },
              { x: 0.78 * w, y: 0.48 * h },
              { x: 0.60 * w, y: 0.48 * h },
              { x: 0.53 * w, y: 0.32 * h },
            ],
            fillColor: 'rgba(125, 211, 252, 0.35)',
            fillAlpha: 0.35,
            strokeColor: 'rgba(255, 255, 255, 0.48)',
            lineWidth: 1.5,
          },
          // Side face
          {
            points: [
              { x: 0.78 * w, y: 0.15 * h },
              { x: 0.88 * w, y: 0.25 * h },
              { x: 0.85 * w, y: 0.45 * h },
              { x: 0.78 * w, y: 0.48 * h },
            ],
            fillColor: 'rgba(103, 232, 249, 0.25)',
            fillAlpha: 0.25,
            strokeColor: 'rgba(255, 255, 255, 0.35)',
            lineWidth: 1.0,
          },
        ],
        highlightLines: [
          { x1: 0.62 * w, y1: 0.18 * h, x2: 0.75 * w, y2: 0.16 * h, color: 'rgba(255,255,255,0.60)', alpha: 0.60, width: 2 },
          { x1: 0.65 * w, y1: 0.30 * h, x2: 0.82 * w, y2: 0.28 * h, color: 'rgba(255,255,255,0.55)', alpha: 0.55, width: 1.5 },
        ],
      },
      // Crystal 3 (Bottom-Right) - Diamond + side face (BRIGHTEST)
      {
        centerX: 0.75 * w,
        centerY: 0.65 * h,
        faces: [
          // Front face (brightest!)
          {
            points: [
              { x: 0.65 * w, y: 0.55 * h },
              { x: 0.85 * w, y: 0.55 * h },
              { x: 0.92 * w, y: 0.72 * h },
              { x: 0.85 * w, y: 0.88 * h },
              { x: 0.65 * w, y: 0.88 * h },
              { x: 0.58 * w, y: 0.72 * h },
            ],
            fillColor: 'rgba(224, 242, 254, 0.32)',
            fillAlpha: 0.32,
            strokeColor: 'rgba(255, 255, 255, 0.52)',
            lineWidth: 1.5,
          },
          // Side face
          {
            points: [
              { x: 0.85 * w, y: 0.55 * h },
              { x: 0.95 * w, y: 0.62 * h },
              { x: 0.92 * w, y: 0.80 * h },
              { x: 0.85 * w, y: 0.88 * h },
            ],
            fillColor: 'rgba(186, 230, 253, 0.25)',
            fillAlpha: 0.25,
            strokeColor: 'rgba(255, 255, 255, 0.38)',
            lineWidth: 1.0,
          },
        ],
        highlightLines: [
          { x1: 0.68 * w, y1: 0.58 * h, x2: 0.82 * w, y2: 0.57 * h, color: 'rgba(255,255,255,0.68)', alpha: 0.68, width: 2.5 },
          { x1: 0.70 * w, y1: 0.70 * h, x2: 0.88 * w, y2: 0.68 * h, color: 'rgba(255,255,255,0.58)', alpha: 0.58, width: 2 },
        ],
      },
    ];
  };

  // ── Initialize Laser Beams ──
  const initLaserBeams = (w: number, h: number): Point[][] => {
    return [
      [{ x: 0.05 * w, y: 0.10 * h }, { x: 0.45 * w, y: 0.90 * h }],
      [{ x: 0.0 * w, y: 0.25 * h }, { x: 0.55 * w, y: 0.95 * h }],
      [{ x: 0.15 * w, y: 0.0 * h }, { x: 0.60 * w, y: 0.85 * h }],
      [{ x: 0.08 * w, y: 0.40 * h }, { x: 0.65 * w, y: 1.0 * h }],
      [{ x: 0.20 * w, y: 0.05 * h }, { x: 0.70 * w, y: 0.88 * h }],
      [{ x: 0.02 * w, y: 0.50 * h }, { x: 0.52 * w, y: 1.05 * h }],
      [{ x: 0.12 * w, y: 0.18 * h }, { x: 0.75 * w, y: 0.92 * h }],
      [{ x: 0.0 * w, y: 0.35 * h }, { x: 0.62 * w, y: 1.02 * h }],
      [{ x: 0.18 * w, y: 0.02 * h }, { x: 0.80 * w, y: 0.82 * h }],
      [{ x: 0.06 * w, y: 0.60 * h }, { x: 0.58 * w, y: 1.08 * h }],
    ];
  };

  // ── Initialize Bubbles ──
  const initBubbles = (w: number, h: number): Bubble[] => {
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 20; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 3 + Math.random() * 5,
        speedY: 0.2 + Math.random() * 0.3,
        speedX: (Math.random() - 0.5) * 0.15,
        alpha: 0.3 + Math.random() * 0.4,
        pulse: Math.random() * Math.PI * 2,
      });
    }
    return bubbles;
  };

  // ── Draw Background ──
  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, _t: number) => {
    const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.7);
    bgGrad.addColorStop(0, '#3b82f6');
    bgGrad.addColorStop(0.5, '#2563eb');
    bgGrad.addColorStop(1, '#1e40af');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  };

  // ── Draw Laser Beams ──
  const drawLaserBeams = (ctx: CanvasRenderingContext2D, beams: Point[][], t: number, w: number, h: number) => {
    const rotationAngle = Math.sin(t * 0.3) * 0.05; // ±~3° rotation
    
    ctx.save();
    ctx.translate(w * 0.15, h * 0.2);
    ctx.rotate(rotationAngle);
    ctx.translate(-w * 0.15, -h * 0.2);

    beams.forEach((beam, i) => {
      const alpha = 0.04 + Math.sin(t * 0.5 + i * 0.8) * 0.02;
      ctx.beginPath();
      ctx.moveTo(beam[0].x, beam[0].y);
      ctx.lineTo(beam[1].x, beam[1].y);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1 + (i % 2);
      ctx.stroke();
    });

    ctx.restore();
  };

  // ── Draw Crystal ──
  const drawCrystal = (ctx: CanvasRenderingContext2D, crystal: Crystal, t: number) => {
    // Draw faces
    crystal.faces.forEach((face) => {
      ctx.beginPath();
      ctx.moveTo(face.points[0].x, face.points[0].y);
      for (let i = 1; i < face.points.length; i++) {
        ctx.lineTo(face.points[i].x, face.points[i].y);
      }
      ctx.closePath();

      // Fill with subtle animation
      const alpha = face.fillAlpha + Math.sin(t * 0.8) * 0.03;
      const fillAlpha = Math.max(0.15, alpha);
      ctx.fillStyle = face.fillColor.replace(/[\d.]+\)$/, `${fillAlpha.toFixed(2)})`);
      ctx.fill();

      // Stroke outline
      ctx.strokeStyle = face.strokeColor;
      ctx.lineWidth = face.lineWidth;
      ctx.stroke();
    });

    // Draw highlight lines
    crystal.highlightLines.forEach((line) => {
      const pulseAlpha = line.alpha + Math.sin(t * 1.2) * 0.15;
      const alpha = Math.max(0.3, Math.min(0.9, pulseAlpha));
      
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.strokeStyle = line.color.replace(/[\d.]+\)$/, `${alpha.toFixed(2)})`);
      ctx.lineWidth = line.width;
      ctx.stroke();
    });
  };

  // ── Draw Bubbles ──
  const drawBubbles = (ctx: CanvasRenderingContext2D, bubbles: Bubble[], t: number, w: number, h: number) => {
    bubbles.forEach((bubble) => {
      // Animate position
      bubble.y -= bubble.speedY;
      bubble.x += bubble.speedX + Math.sin(t * 0.5 + bubble.pulse) * 0.2;
      
      // Wrap around
      if (bubble.y < -10) {
        bubble.y = h + 10;
        bubble.x = Math.random() * w;
      }
      if (bubble.x < -10) bubble.x = w + 10;
      if (bubble.x > w + 10) bubble.x = -10;

      // Draw bubble
      const pulse = Math.sin(t * 0.8 + bubble.pulse) * 0.15;
      const alpha = Math.max(0.2, Math.min(0.7, bubble.alpha + pulse));

      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      
      // Radial gradient for 3D effect
      const grad = ctx.createRadialGradient(
        bubble.x - bubble.radius * 0.3,
        bubble.y - bubble.radius * 0.3,
        0,
        bubble.x,
        bubble.y,
        bubble.radius
      );
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(0.5, `rgba(191, 219, 254, ${alpha * 0.6})`);
      grad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = grad;
      ctx.fill();

      // Border
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });
  };

  // ── Draw Sparkle Dots ──
  const drawSparkles = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const sparkles = [
      { x: 0.15, y: 0.25, size: 2 },
      { x: 0.45, y: 0.18, size: 1.5 },
      { x: 0.30, y: 0.65, size: 2.5 },
      { x: 0.70, y: 0.35, size: 2 },
      { x: 0.85, y: 0.70, size: 1.5 },
      { x: 0.55, y: 0.82, size: 2 },
      { x: 0.25, y: 0.80, size: 1.8 },
      { x: 0.65, y: 0.15, size: 2.2 },
    ];

    sparkles.forEach((sparkle, i) => {
      const flash = Math.sin(t * 2.5 + i * 1.3);
      const alpha = flash > 0.85 ? (flash - 0.85) * 6.67 : 0;
      
      if (alpha > 0) {
        ctx.beginPath();
        ctx.arc(sparkle.x * w, sparkle.y * h, sparkle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        
        // Glow
        ctx.beginPath();
        ctx.arc(sparkle.x * w, sparkle.y * h, sparkle.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        ctx.fill();
      }
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
      
      // Re-initialize geometries on resize
      const w = rect.width;
      const h = rect.height;
      animationStateRef.current = {
        crystals: initCrystals(w, h),
        laserBeams: initLaserBeams(w, h),
        bubbles: initBubbles(w, h),
        time: 0,
      };
    }

    function animate(time: number) {
      const currentCanvas = canvasRef.current;
      const currentCtx = ctxRef.current;
      if (!currentCanvas || !currentCtx) return;
      
      const rect = currentCanvas.getBoundingClientRect();
      if (rect.width === 0) {
        animId = requestAnimationFrame(animate);
        return;
      }

      if (!animationStateRef.current) {
        resize();
      }

      const state = animationStateRef.current!;
      const t = time * 0.001; // Convert to seconds
      state.time = t;

      const w = rect.width;
      const h = rect.height;

      currentCtx.clearRect(0, 0, w, h);

      // 1. Draw background
      drawBackground(currentCtx, w, h, t);

      // 2. Draw laser beams
      drawLaserBeams(currentCtx, state.laserBeams, t, w, h);

      // 3. Draw crystals
      state.crystals.forEach((crystal) => {
        drawCrystal(currentCtx, crystal, t);
      });

      // 4. Draw sparkle dots
      drawSparkles(currentCtx, t, w, h);

      // 5. Draw bubbles
      drawBubbles(currentCtx, state.bubbles, t, w, h);

      animId = requestAnimationFrame(animate);
    }

    resize();
    animId = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(canvas);

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

      {/* Caustic effect overlay (subtle) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 40%, rgba(147, 197, 253, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(103, 232, 249, 0.06) 0%, transparent 50%
          `,
          mixBlendMode: 'screen',
          opacity: 0.4,
        }}
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
      style={{ background: '#2563eb' }}  // BRIGHT blue, not dark!
    >
      <IceCrystalScene />

      {/* Title Content */}
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
