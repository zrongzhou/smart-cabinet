'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v244 - Vibrant Blue + Center Glow (Depth Fix)
//
// v244 Changes (DEPTH + BRIGHTNESS FIX):
// - CRITICAL FIX: Bright color changed from #1e3a8a to #3b82f6 (Tailwind blue-500, vibrant not dark)
// - Added center glow overlay (radial gradient, adds depth and volume)
// - 7-stop gradient (was 5-stop) for enhanced depth
// - Breathing cap increased: 0.75 → 0.85 (user feedback: "bright color still too dark")
//
// v243 Features (preserved):
// - Deep blue palette (not sky blue / baby blue)
// - Independent breathing cycle (10s period)
// - Meteor boost: +0.10 each (reduced from +0.15)
//
// v242 Features (preserved):
// - Independent breathing cycle (sin wave, no dependency on meteors)
// - Direct background color interpolation (no overlay)
// - 14 meteors for higher activity levels
//
// v241 Features (preserved):
// - Frame-rate independent animation (using dt)
//
// v240 Features (preserved):
// - Deep navy background with blue theme (no purple)
// - Glass-like laser beams (blue hue range)
// - Meteor system (dynamic shooting with trails, now 14 meteors)
// - 50-80 star dots scattered across canvas
// - 8-15 large soft bokeh spots (blue color scheme)
// ============================================================

interface StarDot {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  pulse: number;
  twinkleSpeed: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
  width: number;
  baseAlpha: number;
  active: boolean;
  hue: number;
}

interface GlassBeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  baseAlpha: number;
  hue: number;
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
    meteors: Meteor[];
    glassBeams: GlassBeam[];
    bokeh: BokehSpot[];
    time: number;
    activityLevel: number;
    targetActivity: number;
  } | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Initialize Star Dots (50-80 items)
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

  // Initialize Meteor System (14 items for higher activity)
  const METEOR_COUNT = 14;

  const createMeteor = (w: number, h: number): Meteor => {
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number, angle: number;

    switch (side) {
      case 0: // From left edge
        x = -20;
        y = Math.random() * h;
        angle = (Math.random() * 60 + 15) * Math.PI / 180;
        break;
      case 1: // From top edge
        x = Math.random() * w;
        y = -20;
        angle = (Math.random() * 60 + 75) * Math.PI / 180;
        break;
      case 2: // From right edge
        x = w + 20;
        y = Math.random() * h;
        angle = (Math.random() * 60 + 195) * Math.PI / 180;
        break;
      default: // From bottom edge
        x = Math.random() * w;
        y = h + 20;
        angle = (Math.random() * 60 + 255) * Math.PI / 180;
    }

    const speed = 80 + Math.random() * 120;

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: 60 + Math.random() * 100,
      life: 0,
      maxLife: 2 + Math.random() * 3,
      width: 1 + Math.random() * 2,
      baseAlpha: 0.4 + Math.random() * 0.4,
      active: true,
      hue: 200 + Math.random() * 60,
    };
  };

  const initMeteors = (w: number, h: number): Meteor[] => {
    const meteors: Meteor[] = [];
    for (let i = 0; i < METEOR_COUNT; i++) {
      meteors.push(createMeteor(w, h));
    }
    return meteors;
  };

  // Initialize Glass Beams (3-5 static decorative items)
  const initGlassBeams = (w: number, h: number): GlassBeam[] => {
    const beams: GlassBeam[] = [];
    const count = 3 + Math.floor(Math.random() * 2);

    const beamConfigs = [
      { start: [0.05, 0.1], end: [0.45, 0.95], width: 1, alpha: 0.15, hue: 210 },
      { start: [0.15, 0.0], end: [0.6, 0.88], width: 0.8, alpha: 0.12, hue: 220 },
      { start: [0.0, 0.35], end: [0.62, 1.02], width: 0.6, alpha: 0.1, hue: 230 },
      { start: [0.2, 0.05], end: [0.7, 0.82], width: 1.2, alpha: 0.18, hue: 200 },
      { start: [0.1, 0.3], end: [0.7, 0.95], width: 0.7, alpha: 0.13, hue: 215 },
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
        hue: cfg.hue,
      });
    });

    return beams;
  };

  // Initialize Bokeh Spots (8-15 items)
  const initBokeh = (w: number, h: number): BokehSpot[] => {
    const spots: BokehSpot[] = [];
    const count = 8 + Math.floor(Math.random() * 7);

    const colorConfigs = [
      { r: 59, g: 130, b: 246 },
      { r: 96, g: 165, b: 250 },
      { r: 147, g: 197, b: 253 },
      { r: 191, g: 219, b: 254 },
      { r: 125, g: 211, b: 252 },
    ];

    for (let i = 0; i < count; i++) {
      const cfg = colorConfigs[Math.floor(Math.random() * colorConfigs.length)];
      const alpha = 0.08 + Math.random() * 0.10;

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

  // Draw Background with Activity-Based Color Interpolation
  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number, activityLevel: number) => {
    // v247: Vue-style blue (user feedback: "not blue enough, not bright enough")
    // Dark: #020617 (rgb 2, 6, 23) - near-black navy
    // Bright: #2979ff (rgb 41, 121, 255) - Vue brand blue (vibrant & deep)
    // Key fix: Reduced R 77→41, reduced G 137→121 (more blue saturation, less purple/washed feel)
    const baseR = 2;
    const baseG = 6;
    const baseB = 23;
    
    const maxR = 41;   // lower R = less purple tint
    const maxG = 121;  // lower G = less "shallow blue" feel
    const maxB = 255;  // max B = pure blue saturation
    
    const r = Math.round(baseR + (maxR - baseR) * activityLevel);
    const g = Math.round(baseG + (maxG - baseG) * activityLevel);
    const b = Math.round(baseB + (maxB - baseB) * activityLevel);

    // 7-stop vertical gradient for enhanced depth
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0,   `rgb(${Math.max(0, r-6)}, ${Math.max(0, g-4)}, ${b})`);           // dark top
    gradient.addColorStop(0.15, `rgb(${Math.max(0, r-2)}, ${Math.max(0, g-2)}, ${b})`);       // transition
    gradient.addColorStop(0.3,  `rgb(${r}, ${g}, ${b})`);                                     // base
    gradient.addColorStop(0.5,  `rgb(${Math.min(255, r+20)}, ${Math.min(255, g+25)}, ${Math.min(255, b+35)})`); // MID GLOW (brightest)
    gradient.addColorStop(0.7,  `rgb(${Math.min(255, r+10)}, ${Math.min(255, g+15)}, ${Math.min(255, b+20)})`); // transition
    gradient.addColorStop(0.85, `rgb(${Math.min(255, r+4)}, ${Math.min(255, g+6)}, ${Math.min(255, b+10)})`);  // subtle bright
    gradient.addColorStop(1,   `rgb(${Math.max(0, r-4)}, ${Math.max(0, g-2)}, ${Math.max(0, b-4)})`);   // dark bottom

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  };

  // Draw Bokeh Spots
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

  // Draw Glass-like Beam (multi-layer gradient)
  const drawGlassBeam = (
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    t: number, index: number,
    width: number, baseAlpha: number, hue: number
  ) => {
    // Outer glow (wide, blurry, low opacity)
    ctx.save();
    ctx.filter = 'blur(4px)';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `hsla(${hue}, 60%, 70%, ${baseAlpha * 0.15})`;
    ctx.lineWidth = width * 3;
    ctx.stroke();
    ctx.restore();

    // Middle layer - glass body (medium width, gradient)
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, `hsla(${hue}, 50%, 75%, ${baseAlpha * 0.3})`);
    grad.addColorStop(0.3, `hsla(${hue}, 60%, 85%, ${baseAlpha * 0.5})`);
    grad.addColorStop(0.5, `hsla(${hue}, 70%, 95%, ${baseAlpha * 0.8})`);
    grad.addColorStop(0.7, `hsla(${hue}, 60%, 85%, ${baseAlpha * 0.5})`);
    grad.addColorStop(1, `hsla(${hue}, 50%, 75%, ${baseAlpha * 0.3})`);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = grad;
    ctx.lineWidth = width * 2;
    ctx.stroke();

    // Inner layer - highlight core (narrowest, brightest)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `hsla(${hue}, 80%, 98%, ${baseAlpha * 0.9})`;
    ctx.lineWidth = width * 0.5;
    ctx.stroke();

    // Refraction highlights (move along the beam)
    const numHighlights = 2;
    for (let i = 0; i < numHighlights; i++) {
      const pos = (Math.sin(t * 0.5 + index + i * 2.5) * 0.5 + 0.5) * 0.8 + 0.1;
      const hx = x1 + (x2 - x1) * pos;
      const hy = y1 + (y2 - y1) * pos;
      const hlGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, 4);
      hlGrad.addColorStop(0, `rgba(255, 255, 255, ${baseAlpha * 0.9})`);
      hlGrad.addColorStop(0.5, `hsla(${hue}, 60%, 85%, ${baseAlpha * 0.4})`);
      hlGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = hlGrad;
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Draw Glass Beams
  const drawGlassBeams = (ctx: CanvasRenderingContext2D, beams: GlassBeam[], t: number) => {
    ctx.save();
    const centerX = ctx.canvas.width * 0.3;
    const centerY = ctx.canvas.height * 0.4;
    const rotAngle = Math.sin(t * 0.2) * 0.035;
    ctx.translate(centerX, centerY);
    ctx.rotate(rotAngle);
    ctx.translate(-centerX, -centerY);

    beams.forEach((beam, i) => {
      const pulse = Math.sin(t * 0.3 + i * 0.8) * 0.03;
      const alpha = Math.max(0.05, Math.min(0.25, beam.baseAlpha + pulse));

      drawGlassBeam(
        ctx,
        beam.x1, beam.y1,
        beam.x2, beam.y2,
        t, i,
        beam.width, alpha, beam.hue
      );
    });

    ctx.restore();
  };

  // Update and Draw Meteors
  const updateAndDrawMeteors = (ctx: CanvasRenderingContext2D, meteors: Meteor[], dt: number, w: number, h: number) => {
    meteors.forEach((m, i) => {
      if (!m.active) {
        meteors[i] = createMeteor(w, h);
        return;
      }

      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.life += dt;

      if (m.life > m.maxLife || m.x < -200 || m.x > w + 200 || m.y < -200 || m.y > h + 200) {
        m.active = false;
        return;
      }

      const speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
      const tailX = m.x - (m.vx / speed) * m.length;
      const tailY = m.y - (m.vy / speed) * m.length;

      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, `hsla(${m.hue}, 80%, 85%, ${m.baseAlpha})`);
      grad.addColorStop(0.3, `hsla(${m.hue}, 70%, 75%, ${m.baseAlpha * 0.7})`);
      grad.addColorStop(1, `hsla(${m.hue}, 60%, 60%, 0)`);

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = m.width;
      ctx.lineCap = 'round';
      ctx.stroke();

      const headGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 4);
      headGrad.addColorStop(0, `rgba(255, 255, 255, ${m.baseAlpha})`);
      headGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Draw Star Dots
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

  // Main Animation Loop
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
        meteors: initMeteors(w, h),
        glassBeams: initGlassBeams(w, h),
        bokeh: initBokeh(w, h),
        time: 0,
        activityLevel: 0,
        targetActivity: 0,
      };
      lastTimeRef.current = 0;
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
      const dt = lastTimeRef.current === 0 ? 0.016 : Math.min((time - lastTimeRef.current) * 0.001, 0.05);
      lastTimeRef.current = time;
      state.time = t;

      const w = rect.width;
      const h = rect.height;

      // Calculate base breathing (independent sin wave, 10-second cycle, range 0.15-0.65)
      // v243: Reduced amplitude to stay within deep blue palette (never goes too bright)
      const breathCycle = (t % 10) / 10;  // 0-1, 10-second cycle (slower = more elegant)
      const baseActivity = 0.15 + 0.50 * (0.5 + 0.5 * Math.sin(breathCycle * Math.PI * 2 - Math.PI / 2));  // 0.15-0.65

      // Meteor linkage boost (each active meteor +0.10, reduced from 0.15)
      const activeCount = state.meteors.filter(m => m.active).length;
      const meteorBoost = Math.min(0.35, activeCount * 0.10);  // max +0.35 (was 0.5)

      // Combine: base breathing + meteor boost (capped at 0.85 for vibrant blue)
      // v244: Increased cap from 0.75 to 0.85 (user feedback: "bright color still too dark")
      state.targetActivity = Math.min(0.85, baseActivity + meteorBoost);

      // Smooth interpolation (slightly faster for responsive feel)
      state.activityLevel += (state.targetActivity - state.activityLevel) * 0.06;

      // When approaching 0, force to 0 to avoid floating point issues
      if (state.targetActivity < 0.01 && state.activityLevel < 0.02) {
        state.activityLevel = 0;
      }

      currentCtx.clearRect(0, 0, w, h);

      // Draw background with activity-based color interpolation (main breathing effect)
      drawBackground(currentCtx, w, h, state.activityLevel);

      // Draw center glow overlay (adds depth and volume)
      if (state.activityLevel > 0.2) {
        const glowIntensity = (state.activityLevel - 0.2) * 0.4;  // 0.2-0.85 range → 0-0.26 alpha
        const glowGrad = currentCtx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.7);
        glowGrad.addColorStop(0, `rgba(59, 130, 246, ${glowIntensity})`);   // blue-500 glow
        glowGrad.addColorStop(0.5, `rgba(37, 99, 235, ${glowIntensity * 0.6})`);  // blue-600
        glowGrad.addColorStop(1, 'transparent');
        currentCtx.fillStyle = glowGrad;
        currentCtx.fillRect(0, 0, w, h);
      }

      drawBokeh(currentCtx, state.bokeh, t, w, h);

      // Draw glass beams (static decorative)
      drawGlassBeams(currentCtx, state.glassBeams, t);

      // Update and draw meteors (dynamic)
      updateAndDrawMeteors(currentCtx, state.meteors, dt, w, h);

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
        background: 'linear-gradient(135deg, #020617 0%, #0a0a2a 25%, #0f172a 50%, #1e293b 75%, #1e3a8a 100%)',
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
