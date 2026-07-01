'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v232 DEBUG — Make Crystals VISIBLE
//
// DEBUG VERSION: Using bright impossible-to-miss colors
// to diagnose why crystals are not rendering.
//
// v232 DEBUG Strategy:
// - Crystal 1: BRIGHT RED (must be visible!)
// - Crystal 2: BRIGHT GREEN (must be visible!)
// - Crystal 3: BRIGHT BLUE (must be visible!)
// - Crystal 4: BRIGHT YELLOW (must be visible!)
// - Each crystal has 3px solid bright border
// - Simplified to 2 layers only (main body + border)
// - Background opacity reduced to 0.4
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

  // ── DEBUG Crystal Configurations (BRIGHT COLORS) ──
  const crystalConfigs = [
    {
      id: 1,
      clipPath: 'polygon(50% 0%, 85% 25%, 85% 75%, 50% 100%, 15% 75%, 15% 25%)',
      width: '35vw',
      height: '40vh',
      left: '5%',
      top: '10%',
      // BRIGHT RED - MUST BE VISIBLE!
      backgroundColor: 'rgba(255, 50, 50, 0.85)',
      borderColor: 'rgb(255, 0, 0)',
      borderWidth: '4px',
      animation: 'crystal-float-1 18s ease-in-out infinite',
      animationDelay: '0s',
      label: 'RED DEBUG',
    },
    {
      id: 2,
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
      width: '30vw',
      height: '35vh',
      right: '5%',
      top: '15%',
      // BRIGHT GREEN - MUST BE VISIBLE!
      backgroundColor: 'rgba(50, 255, 50, 0.85)',
      borderColor: 'rgb(0, 255, 0)',
      borderWidth: '4px',
      animation: 'crystal-float-2 22s ease-in-out infinite',
      animationDelay: '-3s',
      label: 'GREEN DEBUG',
    },
    {
      id: 3,
      clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
      width: '38vw',
      height: '38vh',
      left: '15%',
      bottom: '8%',
      // BRIGHT BLUE - MUST BE VISIBLE!
      backgroundColor: 'rgba(50, 50, 255, 0.85)',
      borderColor: 'rgb(0, 0, 255)',
      borderWidth: '4px',
      animation: 'crystal-float-3 20s ease-in-out infinite',
      animationDelay: '-6s',
      label: 'BLUE DEBUG',
    },
    {
      id: 4,
      clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      width: '25vw',
      height: '30vh',
      right: '10%',
      bottom: '10%',
      // BRIGHT YELLOW - MUST BE VISIBLE!
      backgroundColor: 'rgba(255, 255, 50, 0.85)',
      borderColor: 'rgb(255, 255, 0)',
      borderWidth: '4px',
      animation: 'crystal-float-4 24s ease-in-out infinite',
      animationDelay: '-9s',
      label: 'YELLOW DEBUG',
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* ===== DEBUG INDICATOR ===== */}
      <div
        className="absolute top-4 right-4 z-50 px-3 py-1 rounded"
        style={{
          backgroundColor: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >
        v232 DEBUG MODE
      </div>

      {/* ===== Layer 0: Reduced Opacity Background ===== */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, 
              rgba(30, 58, 138, 0.4) 0%, 
              rgba(30, 64, 175, 0.4) 25%, 
              rgba(29, 78, 216, 0.4) 45%, 
              rgba(30, 58, 95, 0.4) 65%, 
              rgba(15, 23, 42, 0.4) 100%
            )
          `,
        }}
      />

      {/* ===== Layer 1: Canvas (reduced opacity) ===== */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen', opacity: 0.3 }}
      />

      {/* ===== Layer 2: DEBUG Crystals (BRIGHT COLORS) ===== */}
      {crystalConfigs.map((crystal) => (
        <div
          key={`crystal-${crystal.id}`}
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
          {/* Main Body - BRIGHT SOLID COLOR */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              clipPath: crystal.clipPath,
              backgroundColor: crystal.backgroundColor,
              border: `${crystal.borderWidth} solid ${crystal.borderColor}`,
            }}
          />

          {/* Label for DEBUG */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              textShadow: '0 0 4px black',
              pointerEvents: 'none',
            }}
          >
            {crystal.label}
          </div>
        </div>
      ))}

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
