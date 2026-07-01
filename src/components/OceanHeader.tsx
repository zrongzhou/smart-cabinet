'use client';
import { useEffect, useRef, memo } from 'react';

// ============================================================
// OceanHeader v231 — Ice Crystal / Aquatic Theme (Enhanced 3D)
//
// v231 Enhancements:
// - Multi-layer pseudo-3D crystal structures (4-5 layers per crystal)
// - Enhanced color variations (blue→cyan→purple gradients)
// - Internal refraction lines for detail
// - Enhanced bloom with hue-rotate animation
// - Increased bubble visibility
// - Enhanced light ray alpha
// ============================================================

function IceCrystalScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Subtle Caustic Pattern (underwater light pattern) ──
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

      // Draw subtle caustic light patterns (underwater effect)
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

  // ── Crystal Shapes Configuration (Multi-layer 3D Structure) ──
  const crystalConfigs = [
    {
      id: 1,
      clipPath: 'polygon(50% 0%, 85% 25%, 85% 75%, 50% 100%, 15% 75%, 15% 25%)',
      width: '28vw',
      height: '35vh',
      left: '5%',
      top: '10%',
      animation: 'crystal-float-1 18s ease-in-out infinite',
      animationDelay: '0s',
      // Layer B: Main body - Blue→Cyan→Light Purple
      mainGradient: 'linear-gradient(135deg, rgba(147, 197, 253, 0.72) 0%, rgba(103, 232, 249, 0.58) 25%, rgba(196, 181, 253, 0.48) 50%, rgba(96, 165, 250, 0.62) 75%, rgba(30, 58, 138, 0.52) 100%)',
      // Layer C: Highlight direction
      highlightDirection: '135deg',
    },
    {
      id: 2,
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
      width: '22vw',
      height: '28vh',
      right: '8%',
      top: '15%',
      animation: 'crystal-float-2 22s ease-in-out infinite',
      animationDelay: '-3s',
      // Layer B: Main body - Cyan→Blue-Green→Sky Blue
      mainGradient: 'linear-gradient(225deg, rgba(103, 232, 249, 0.70) 0%, rgba(56, 189, 248, 0.55) 30%, rgba(147, 197, 253, 0.65) 60%, rgba(96, 165, 250, 0.50) 100%)',
      highlightDirection: '225deg',
    },
    {
      id: 3,
      clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
      width: '32vw',
      height: '30vh',
      left: '20%',
      bottom: '5%',
      animation: 'crystal-float-3 20s ease-in-out infinite',
      animationDelay: '-6s',
      // Layer B: Main body - Purple→Indigo→Lake Blue
      mainGradient: 'linear-gradient(160deg, rgba(196, 181, 253, 0.68) 0%, rgba(165, 180, 252, 0.55) 35%, rgba(103, 232, 249, 0.50) 65%, rgba(59, 130, 246, 0.58) 100%)',
      highlightDirection: '160deg',
    },
    {
      id: 4,
      clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
      width: '18vw',
      height: '24vh',
      right: '15%',
      bottom: '12%',
      animation: 'crystal-float-4 24s ease-in-out infinite',
      animationDelay: '-9s',
      // Layer B: Main body - Sky Blue→Cyan→Light Purple
      mainGradient: 'linear-gradient(200deg, rgba(147, 197, 253, 0.75) 0%, rgba(103, 232, 249, 0.52) 40%, rgba(196, 181, 253, 0.45) 70%, rgba(96, 165, 250, 0.55) 100%)',
      highlightDirection: '200deg',
    },
  ];

  // ── Refraction Lines Configuration ──
  const getRefractionLines = (crystalId: number) => {
    const lines = {
      1: [
        { rotate: -25, top: '35%', left: '20%', width: '60%' },
        { rotate: 15, top: '55%', left: '15%', width: '50%' },
        { rotate: -40, top: '25%', left: '25%', width: '45%' },
      ],
      2: [
        { rotate: 20, top: '30%', left: '18%', width: '55%' },
        { rotate: -10, top: '60%', left: '22%', width: '48%' },
      ],
      3: [
        { rotate: -30, top: '40%', left: '20%', width: '58%' },
        { rotate: 25, top: '50%', left: '15%', width: '52%' },
        { rotate: -15, top: '28%', left: '28%', width: '42%' },
      ],
      4: [
        { rotate: 18, top: '32%', left: '22%', width: '53%' },
        { rotate: -22, top: '58%', left: '18%', width: '46%' },
      ],
    };
    return lines[crystalId as keyof typeof lines] || [];
  };

  // ── Bubbles Configuration (Enhanced visibility) ──
  const bubbles = Array.from({ length: 18 }, (_, i) => ({
    id: `bubble-${i}`,
    left: `${5 + ((i * 37) % 90)}%`,
    top: `${15 + ((i * 41) % 70)}%`,
    size: 6 + (i % 11),
    animationDuration: `${10 + (i % 8) * 2}s`,
    animationDelay: `${-(i * 1.3)}s`,
    opacity: 0.5 + (i % 4) * 0.12, // Increased from 0.35
  }));

  // ── Specular Highlights Configuration ──
  const speculars = Array.from({ length: 12 }, (_, i) => ({
    id: `spec-${i}`,
    left: `${3 + ((i * 31) % 94)}%`,
    top: `${5 + ((i * 43) % 88)}%`,
    size: 3 + (i % 5),
    animationDuration: `${2.5 + (i % 3) * 0.8}s`,
    animationDelay: `${-(i * 0.9)}s`,
    opacity: 0.6 + (i % 3) * 0.13,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* ===== Layer 0: Deep Blue Gradient Background ===== */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, 
              #1e3a8a 0%, 
              #1e40af 25%, 
              #1d4ed8 45%, 
              #1e3a5f 65%, 
              #0f172a 100%
            )
          `,
        }}
      />

      {/* ===== Layer 1: Subtle Caustic Canvas ===== */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen', opacity: 0.6 }}
      />

      {/* ===== Layer 2: Multi-layer 3D Crystals ===== */}
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
              background: 'rgba(15, 23, 42, 0.55)',
              filter: 'blur(8px)',
              opacity: 0.7,
            }}
          />

          {/* Layer B: Main Body (Multi-color Gradient) */}
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

          {/* Layer C: Highlight (Bright Face) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              clipPath: crystal.clipPath,
              background: `linear-gradient(${crystal.highlightDirection}, rgba(255, 255, 255, 0.50) 0%, transparent 60%)`,
              animation: `highlight-pulse-${crystal.id} 6s ease-in-out infinite`,
            }}
          />

          {/* Layer D: Edge Glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              clipPath: crystal.clipPath,
              boxShadow: `
                0 0 20px rgba(147, 197, 253, 0.5),
                0 0 40px rgba(103, 232, 249, 0.3),
                inset 0 0 20px rgba(255, 255, 255, 0.15)
              `,
              border: '1px solid rgba(255, 255, 255, 0.4)',
            }}
          />

          {/* Layer E: Internal Refraction Lines */}
          {getRefractionLines(crystal.id).map((line, idx) => (
            <div
              key={`refraction-${crystal.id}-${idx}`}
              style={{
                position: 'absolute',
                width: line.width,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent)',
                transform: `rotate(${line.rotate}deg)`,
                top: line.top,
                left: line.left,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
        </div>
      ))}

      {/* ===== Layer 3: Bubbles (Enhanced Visibility) ===== */}
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

      {/* ===== Layer 4: Specular Highlights (Sharp Bright Dots) ===== */}
      {speculars.map((spec) => (
        <div
          key={spec.id}
          className="absolute rounded-full"
          style={{
            left: spec.left,
            top: spec.top,
            width: spec.size,
            height: spec.size,
            background: `radial-gradient(circle at 30% 30%, 
              rgba(255, 255, 255, 0.95), 
              rgba(224, 242, 254, 0.7) 45%, 
              transparent 70%
            )`,
            filter: 'blur(0.5px)',
            animation: `specular-twinkle ${spec.animationDuration} ease-in-out infinite`,
            animationDelay: spec.animationDelay,
          }}
        />
      ))}

      {/* ===== Layer 5: Light Rays (Enhanced Alpha) ===== */}
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

      {/* ===== Layer 6: Bloom Glow (Enhanced with Hue-Rotate) ===== */}
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
      <div
        className="absolute"
        style={{
          right: '15%',
          bottom: '10%',
          width: '40vw',
          height: '40vh',
          background: `radial-gradient(ellipse at center, 
            rgba(196, 181, 253, 0.20) 0%, 
            rgba(165, 180, 252, 0.12) 40%, 
            transparent 75%
          )`,
          filter: 'blur(45px) hue-rotate(0deg)',
          animation: 'bloom-pulse-2 15s ease-in-out infinite, bloom-hue-rotate-2 25s linear infinite',
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

        /* ── Highlight Pulse Animations (Simulate Light Changes) ── */
        @keyframes highlight-pulse-1 {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.8; }
        }
        @keyframes highlight-pulse-2 {
          0%, 100% { opacity: 0.45; }
          50%      { opacity: 0.85; }
        }
        @keyframes highlight-pulse-3 {
          0%, 100% { opacity: 0.42; }
          50%      { opacity: 0.82; }
        }
        @keyframes highlight-pulse-4 {
          0%, 100% { opacity: 0.38; }
          50%      { opacity: 0.78; }
        }

        /* ── Bubble Float Animation ── */
        @keyframes bubble-float {
          0%   { transform: translateY(0px) translateX(0px) scale(1.0); opacity: 0.5; }
          25%  { transform: translateY(-25px) translateX(3px) scale(1.05); opacity: 0.7; }
          50%  { transform: translateY(-50px) translateX(-2px) scale(0.98); opacity: 0.6; }
          75%  { transform: translateY(-75px) translateX(4px) scale(1.03); opacity: 0.75; }
          100% { transform: translateY(-100px) translateX(0px) scale(1.0); opacity: 0.5; }
        }

        /* ── Specular Highlight Twinkle ── */
        @keyframes specular-twinkle {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50%      { opacity: 1.0; transform: scale(1.3); }
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
        @keyframes bloom-pulse-2 {
          0%, 100% { opacity: 0.45; transform: scale(1.0); }
          50%      { opacity: 0.75; transform: scale(1.08); }
        }

        /* ── Bloom Hue-Rotate (Color Cycling) ── */
        @keyframes bloom-hue-rotate {
          0%   { filter: blur(50px) hue-rotate(0deg); }
          50%  { filter: blur(50px) hue-rotate(30deg); }
          100% { filter: blur(50px) hue-rotate(0deg); }
        }
        @keyframes bloom-hue-rotate-2 {
          0%   { filter: blur(45px) hue-rotate(0deg); }
          50%  { filter: blur(45px) hue-rotate(-25deg); }
          100% { filter: blur(45px) hue-rotate(0deg); }
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
