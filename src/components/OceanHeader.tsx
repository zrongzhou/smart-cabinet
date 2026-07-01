'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v234 — Faceted Crystal (刻面水晶)
//
// v234 Enhancement: From "flat plastic" to "faceted crystal"
// - Hard-stop gradients (3 zones: bright/middle/dark)
// - Sharp edge highlights (2-3px white lines)
// - Sharp specular dots (3-5px, no blur)
// - Sparkle flash effects (random timed blinks)
// - Enhanced refraction lines (wider, more visible)
// ============================================================

function IceCrystalScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Subtle Caustic Pattern ──
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

    function render(time: number) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) { animId = requestAnimationFrame(render); return; }

      resize();
      const w = canvas.width, h = canvas.height;
      const t = time * 0.0003;

      ctx.clearRect(0, 0, w, h);

      const caustics = [
        { x: 0.3, y: 0.4, r: 0.25, phase: 0 },
        { x: 0.6, y: 0.3, r: 0.20, phase: 1.5 },
        { x: 0.45, y: 0.65, r: 0.22, phase: 3.0 },
        { x: 0.2, y: 0.55, r: 0.18, phase: 4.5 },
      ];

      caustics.forEach((caustic) => {
        const cx = (caustic.x + Math.sin(t * 0.5 + caustic.phase) * 0.03) * w;
        const cy = (caustic.y + Math.cos(t * 0.4 + caustic.phase) * 0.03) * h;
        const cr = Math.max(caustic.r * w, caustic.r * h);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
        grad.addColorStop(0, `rgba(186, 230, 253, ${0.06 + Math.sin(t + caustic.phase) * 0.02})`);
        grad.addColorStop(0.5, `rgba(147, 197, 253, ${0.03 + Math.cos(t * 0.7 + caustic.phase) * 0.015})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      animId = requestAnimationFrame(render);
    }

    resize();
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── Crystal Configurations (Faceted with Hard-Stop Gradients) ──
  const crystalConfigs = [
    {
      id: 1,
      clipPath: 'polygon(50% 0%, 85% 25%, 85% 75%, 50% 100%, 15% 75%, 15% 25%)',
      width: '35vw',
      height: '40vh',
      left: '5%',
      top: '10%',
      // Faceted gradient: 135° with HARD STOPS (write % twice!)
      mainGradient: `linear-gradient(135deg, 
        rgba(224, 242, 254, 0.95) 0%, 35%,
        rgba(147, 197, 253, 0.80) 35%, 70%,
        rgba(59, 130, 246, 0.85) 70%, 100%
      )`,
      // Zone 1 (0-35%): Bright face - ice white
      // Zone 2 (35-70%): Middle face - bright blue  
      // Zone 3 (70-100%): Dark face - deep blue
      edgeAngle: '135deg',
      animation: 'crystal-float-1 18s ease-in-out infinite',
      animationDelay: '0s',
    },
    {
      id: 2,
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
      width: '30vw',
      height: '35vh',
      right: '5%',
      top: '15%',
      // Faceted gradient: 120° with HARD STOPS
      mainGradient: `linear-gradient(120deg, 
        rgba(224, 242, 254, 0.92) 0%, 30%,
        rgba(103, 232, 249, 0.78) 30%, 65%,
        rgba(37, 99, 235, 0.82) 65%, 100%
      )`,
      edgeAngle: '120deg',
      animation: 'crystal-float-2 22s ease-in-out infinite',
      animationDelay: '-3s',
    },
    {
      id: 3,
      clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
      width: '38vw',
      height: '38vh',
      left: '15%',
      bottom: '8%',
      // Faceted gradient: 145° with HARD STOPS
      mainGradient: `linear-gradient(145deg, 
        rgba(255, 255, 255, 0.55) 0%, 5%,
        rgba(196, 181, 253, 0.88) 5%, 40%,
        rgba(103, 232, 249, 0.75) 40%, 75%,
        rgba(91, 33, 182, 0.80) 75%, 100%
      )`,
      // Extra bright zone at start (0-5%) for sharp highlight
      edgeAngle: '145deg',
      animation: 'crystal-float-3 20s ease-in-out infinite',
      animationDelay: '-6s',
    },
    {
      id: 4,
      clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      width: '25vw',
      height: '30vh',
      right: '10%',
      bottom: '10%',
      // Faceted gradient: 125° with HARD STOPS
      mainGradient: `linear-gradient(125deg, 
        rgba(224, 242, 254, 0.93) 0%, 35%,
        rgba(125, 211, 252, 0.82) 35%, 68%,
        rgba(59, 130, 246, 0.86) 68%, 100%
      )`,
      edgeAngle: '125deg',
      animation: 'crystal-float-4 24s ease-in-out infinite',
      animationDelay: '-9s',
    },
  ];

  // ── Sharp Specular Dots (2-3 per crystal) ──
  const getSpecularDots = (crystalId: number) => {
    const dots = {
      1: [
        { top: '22%', left: '28%', size: 4 },
        { top: '35%', left: '38%', size: 3 },
        { top: '18%', left: '45%', size: 5 },
      ],
      2: [
        { top: '20%', left: '32%', size: 4 },
        { top: '30%', left: '40%', size: 3 },
      ],
      3: [
        { top: '25%', left: '30%', size: 5 },
        { top: '15%', left: '42%', size: 3 },
        { top: '35%', left: '25%', size: 4 },
      ],
      4: [
        { top: '22%', left: '35%', size: 4 },
        { top: '28%', left: '30%', size: 3 },
      ],
    };
    return dots[crystalId as keyof typeof dots] || [];
  };

  // ── Sparkle Flash Points (3-5 random timed) ──
  const sparkles = Array.from({ length: 5 }, (_, i) => ({
    id: `sparkle-${i}`,
    top: `${10 + Math.random() * 70}%`,
    left: `${10 + Math.random() * 80}%`,
    size: 2 + Math.floor(Math.random() * 3),
    animationDelay: `${-(i * 1.7 + Math.random() * 2)}s`,
    animationDuration: `${3 + Math.random() * 2}s`,
  }));

  // ── Enhanced Refraction Lines ──
  const getRefractionLines = (crystalId: number) => {
    const lines = {
      1: [
        { rotate: -25, top: '30%', left: '15%', width: '70%', height: '3px' },
        { rotate: 15, top: '50%', left: '12%', width: '65%', height: '2px' },
        { rotate: -40, top: '22%', left: '20%', width: '55%', height: '3px' },
        { rotate: 30, top: '65%', left: '18%', width: '50%', height: '2px' },
      ],
      2: [
        { rotate: 20, top: '28%', left: '15%', width: '68%', height: '3px' },
        { rotate: -10, top: '55%', left: '20%', width: '58%', height: '2px' },
        { rotate: 35, top: '40%', left: '10%', width: '60%', height: '3px' },
      ],
      3: [
        { rotate: -30, top: '35%', left: '18%', width: '72%', height: '3px' },
        { rotate: 25, top: '48%', left: '14%', width: '62%', height: '2px' },
        { rotate: -15, top: '25%', left: '22%', width: '52%', height: '3px' },
        { rotate: 40, top: '60%', left: '16%', width: '48%', height: '2px' },
      ],
      4: [
        { rotate: 18, top: '30%', left: '16%', width: '66%', height: '3px' },
        { rotate: -22, top: '52%', left: '20%', width: '56%', height: '2px' },
        { rotate: 30, top: '42%', left: '12%', width: '60%', height: '3px' },
      ],
    };
    return lines[crystalId as keyof typeof lines] || [];
  };

  // ── Bubbles Configuration ──
  const bubbles = Array.from({ length: 18 }, (_, i) => ({
    id: `bubble-${i}`,
    left: `${5 + ((i * 37) % 90)}%`,
    top: `${15 + ((i * 41) % 70)}%`,
    size: 6 + (i % 11),
    animationDuration: `${10 + (i % 8) * 2}s`,
    animationDelay: `${-(i * 1.3)}s`,
    opacity: 0.5 + (i % 4) * 0.12,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* ===== Layer 0: Background ===== */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, 
              rgba(30, 58, 138, 0.7) 0%, 
              rgba(30, 64, 175, 0.7) 25%, 
              rgba(29, 78, 216, 0.7) 45%, 
              rgba(30, 58, 95, 0.7) 65%, 
              rgba(15, 23, 42, 0.7) 100%
            )
          `,
        }}
      />

      {/* ===== Layer 1: Canvas ===== */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen', opacity: 0.5 }}
      />

      {/* ===== Layer 2: Faceted Crystals ===== */}
      {crystalConfigs.map((crystal) => (
        <div
          key={`crystal-group-${crystal.id}`}
          className="absolute"
          style={{
            width: crystal.width,
            height: crystal.height,
            left: crystal.left || 'auto',
            right: crystal.right || 'auto',
            top: crystal.top || 'auto',
            bottom: crystal.bottom || 'auto',
            animation: crystal.animation,
            animationDelay: crystal.animationDelay,
          }}
        >
          {/* Layer A: Dark Outline (Shadow) */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              width: '100%',
              height: '100%',
              clipPath: crystal.clipPath,
              background: 'rgba(15, 23, 42, 0.50)',
              filter: 'blur(8px)',
              opacity: 0.7,
            }}
          />

          {/* Layer B: Main Body (Faceted Hard-Stop Gradient) ★ */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              clipPath: crystal.clipPath,
              background: crystal.mainGradient,
            }}
          />

          {/* Layer C: Sharp Edge Highlight (2-3px white line on top-left edge) ★ */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              clipPath: crystal.clipPath,
              background: `linear-gradient(${crystal.edgeAngle}, 
                rgba(255, 255, 255, 0.85) 0%, 
                rgba(255, 255, 255, 0.4) 15%,
                transparent 30%
              )`,
            }}
          />

          {/* Layer D: Sharp Specular Dots (2-3 small sharp white dots) ★ */}
          {getSpecularDots(crystal.id).map((dot, idx) => (
            <div
              key={`spec-dot-${crystal.id}-${idx}`}
              style={{
                position: 'absolute',
                top: dot.top,
                left: dot.left,
                width: dot.size,
                height: dot.size,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 6px 2px rgba(255, 255, 255, 0.8)',
                filter: 'blur(0px)',
                animation: `specular-pulse-${crystal.id}-${idx} ${2.5 + idx * 0.5}s ease-in-out infinite`,
              }}
            />
          ))}

          {/* Layer E: Edge Glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              clipPath: crystal.clipPath,
              boxShadow: `0 0 20px rgba(147, 197, 253, 0.5)`,
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}
          />

          {/* Layer F: Enhanced Refraction Lines (3-4 lines, wider, more visible) */}
          {getRefractionLines(crystal.id).map((line, idx) => (
            <div
              key={`refraction-${crystal.id}-${idx}`}
              style={{
                position: 'absolute',
                width: line.width,
                height: line.height,
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.50), transparent)',
                transform: `rotate(${line.rotate}deg)`,
                top: line.top,
                left: line.left,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
        </div>
      ))}

      {/* ===== Sparkle Flash Points (3-5 random timed) ★ ===== */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute rounded-full"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: '#ffffff',
            boxShadow: '0 0 8px 3px rgba(255, 255, 255, 0.9)',
            animation: `sparkle-flash ${sparkle.animationDuration} ease-in-out infinite`,
            animationDelay: sparkle.animationDelay,
          }}
        />
      ))}

      {/* ===== Layer 3: Bubbles ===== */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            left: bubble.left,
            top: bubble.top,
            width: bubble.size,
            height: bubble.size,
            background: `radial-gradient(circle at 30% 30%, 
              rgba(255, 255, 255, ${bubble.opacity + 0.3}), 
              rgba(191, 219, 254, ${bubble.opacity * 0.7}) 40%, 
              rgba(96, 165, 250, ${bubble.opacity * 0.4}) 70%, 
              transparent 100%
            )`,
            border: '1px solid rgba(255, 255, 255, 0.5)',
            animation: `bubble-float ${bubble.animationDuration} ease-in-out infinite`,
            animationDelay: bubble.animationDelay,
          }}
        />
      ))}

      {/* ===== Layer 4: Light Rays ===== */}
      <div
        className="absolute"
        style={{
          left: '-15%',
          top: '-20%',
          width: '90vw',
          height: '120vh',
          background: `linear-gradient(125deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.08) 15%, 
            rgba(191, 219, 254, 0.12) 35%, 
            rgba(147, 197, 253, 0.08) 55%, 
            transparent 75%
          )`,
          transform: 'rotate(-28deg)',
          transformOrigin: 'top left',
          animation: 'ray-sweep-1 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute"
        style={{
          right: '-10%',
          top: '-15%',
          width: '70vw',
          height: '110vh',
          background: `linear-gradient(215deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.06) 20%, 
            rgba(196, 181, 253, 0.10) 40%, 
            rgba(147, 197, 253, 0.07) 60%, 
            transparent 80%
          )`,
          transform: 'rotate(18deg)',
          transformOrigin: 'top right',
          animation: 'ray-sweep-2 28s ease-in-out infinite',
        }}
      />

      {/* ===== Layer 5: Bloom Glow ===== */}
      <div
        className="absolute"
        style={{
          left: '25%',
          top: '5%',
          width: '55vw',
          height: '55vh',
          background: `radial-gradient(ellipse at center, 
            rgba(191, 219, 254, 0.25) 0%, 
            rgba(147, 197, 253, 0.14) 35%, 
            rgba(96, 165, 250, 0.07) 60%, 
            transparent 80%
          )`,
          filter: 'blur(50px) hue-rotate(0deg)',
          animation: 'bloom-pulse 12s ease-in-out infinite, bloom-hue-rotate 20s linear infinite',
        }}
      />

      {/* ===== Inline Styles for Animations ===== */}
      <style>{`
        /* ── Crystal Floating Animations ── */
        @keyframes crystal-float-1 {
          0%   { transform: translate(0%, 0%) rotate(0deg) scale(1.0); }
          25%  { transform: translate(3%, 2%) rotate(1.5deg) scale(1.02); }
          50%  { transform: translate(-2%, 4%) rotate(-1deg) scale(0.98); }
          75%  { transform: translate(4%, -1%) rotate(2deg) scale(1.03); }
          100% { transform: translate(0%, 0%) rotate(0deg) scale(1.0); }
        }
        @keyframes crystal-float-2 {
          0%   { transform: translate(0%, 0%) rotate(0deg) scale(1.0); }
          30%  { transform: translate(-4%, 3%) rotate(-2deg) scale(1.03); }
          55%  { transform: translate(2%, -2%) rotate(1.8deg) scale(0.97); }
          80%  { transform: translate(-3%, 4%) rotate(-1.5deg) scale(1.01); }
          100% { transform: translate(0%, 0%) rotate(0deg) scale(1.0); }
        }
        @keyframes crystal-float-3 {
          0%   { transform: translate(0%, 0%) rotate(0deg) scale(1.0); }
          20%  { transform: translate(5%, 1%) rotate(1.2deg) scale(1.01); }
          45%  { transform: translate(-3%, 5%) rotate(-2.2deg) scale(0.99); }
          70%  { transform: translate(4%, -3%) rotate(1.8deg) scale(1.02); }
          100% { transform: translate(0%, 0%) rotate(0deg) scale(1.0); }
        }
        @keyframes crystal-float-4 {
          0%   { transform: translate(0%, 0%) rotate(0deg) scale(1.0); }
          35%  { transform: translate(-5%, -2%) rotate(-1.8deg) scale(1.04); }
          60%  { transform: translate(3%, 3%) rotate(2.2deg) scale(0.96); }
          85%  { transform: translate(-2%, 5%) rotate(-1deg) scale(1.02); }
          100% { transform: translate(0%, 0%) rotate(0deg) scale(1.0); }
        }

        /* ── Sharp Specular Dot Pulse Animations ── */
        @keyframes specular-pulse-1-0 {
          0%, 100% { opacity: 0.6; transform: scale(0.9); }
          50%      { opacity: 1.0; transform: scale(1.2); }
        }
        @keyframes specular-pulse-1-1 {
          0%, 100% { opacity: 0.55; transform: scale(0.85); }
          50%      { opacity: 0.95; transform: scale(1.15); }
        }
        @keyframes specular-pulse-1-2 {
          0%, 100% { opacity: 0.65; transform: scale(0.95); }
          50%      { opacity: 1.0; transform: scale(1.25); }
        }
        @keyframes specular-pulse-2-0 {
          0%, 100% { opacity: 0.58; transform: scale(0.88); }
          50%      { opacity: 0.98; transform: scale(1.18); }
        }
        @keyframes specular-pulse-2-1 {
          0%, 100% { opacity: 0.62; transform: scale(0.92); }
          50%      { opacity: 1.0; transform: scale(1.22); }
        }
        @keyframes specular-pulse-3-0 {
          0%, 100% { opacity: 0.57; transform: scale(0.87); }
          50%      { opacity: 0.97; transform: scale(1.17); }
        }
        @keyframes specular-pulse-3-1 {
          0%, 100% { opacity: 0.63; transform: scale(0.93); }
          50%      { opacity: 1.0; transform: scale(1.23); }
        }
        @keyframes specular-pulse-3-2 {
          0%, 100% { opacity: 0.6; transform: scale(0.9); }
          50%      { opacity: 0.98; transform: scale(1.2); }
        }
        @keyframes specular-pulse-4-0 {
          0%, 100% { opacity: 0.59; transform: scale(0.89); }
          50%      { opacity: 0.99; transform: scale(1.19); }
        }
        @keyframes specular-pulse-4-1 {
          0%, 100% { opacity: 0.61; transform: scale(0.91); }
          50%      { opacity: 1.0; transform: scale(1.21); }
        }

        /* ── Sparkle Flash Animation ★ ── */
        @keyframes sparkle-flash {
          0%, 85%, 100% { opacity: 0; transform: scale(0.3); }
          88%           { opacity: 1; transform: scale(1.3); }
          92%           { opacity: 0.7; transform: scale(0.9); }
        }

        /* ── Bubble Float Animation ── */
        @keyframes bubble-float {
          0%   { transform: translateY(0px) translateX(0px) scale(1.0); opacity: 0.5; }
          25%  { transform: translateY(-25px) translateX(3px) scale(1.05); opacity: 0.7; }
          50%  { transform: translateY(-50px) translateX(-2px) scale(0.98); opacity: 0.6; }
          75%  { transform: translateY(-75px) translateX(4px) scale(1.03); opacity: 0.75; }
          100% { transform: translateY(-100px) translateX(0px) scale(1.0); opacity: 0.5; }
        }

        /* ── Light Ray Sweep ── */
        @keyframes ray-sweep-1 {
          0%   { transform: rotate(-28deg); opacity: 0.5; }
          50%  { transform: rotate(-23deg); opacity: 0.85; }
          100% { transform: rotate(-28deg); opacity: 0.5; }
        }
        @keyframes ray-sweep-2 {
          0%   { transform: rotate(18deg); opacity: 0.45; }
          50%  { transform: rotate(23deg); opacity: 0.75; }
          100% { transform: rotate(18deg); opacity: 0.45; }
        }

        /* ── Bloom Pulse ── */
        @keyframes bloom-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1.0); }
          50%      { opacity: 0.85; transform: scale(1.12); }
        }

        /* ── Bloom Hue-Rotate ── */
        @keyframes bloom-hue-rotate {
          0%   { filter: blur(50px) hue-rotate(0deg); }
          50%  { filter: blur(50px) hue-rotate(30deg); }
          100% { filter: blur(50px) hue-rotate(0deg); }
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
