'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from '@/lib/i18n';
import { motion } from 'framer-motion';

// Count-up animation component
function CountUp({ end, duration = 2 }: { end: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isAnimating) return;
    const numericEnd = parseInt(end.replace(/\D/g, '')) || 0;
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (numericEnd - startValue) * eased);
      setCount(current);
      if (progress < 1) requestAnimationFrame(animate);
    };

    const timer = setTimeout(() => requestAnimationFrame(animate), 300);
    return () => clearTimeout(timer);
  }, [end, duration, isAnimating]);

  useEffect(() => setIsAnimating(true), []);
  return <span>{count}{end.replace(/\d/g, '')}</span>;
}

// ============================================================
// BUBBLE BUTTON — ALWAYS ACTIVE bubble animation (Green theme)
// ============================================================
function BubbleButton({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; size: number; delay: number; duration: number; color: string }[]>([]);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const colors = primary
      ? ['rgba(134,239,172,0.6)', 'rgba(74,222,128,0.5)', 'rgba(34,197,94,0.4)', 'rgba(16,185,129,0.35)']
      : ['rgba(200,220,255,0.5)', 'rgba(147,197,253,0.4)', 'rgba(255,255,255,0.4)'];
    const bbs = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      size: 3 + Math.random() * 8,
      delay: Math.random() * 2.5,
      duration: 2 + Math.random() * 2,
      color: colors[i % colors.length],
    }));
    setBubbles(bbs);
  }, []);

  return (
    <a
      href={href}
      className="group relative inline-flex items-center justify-center px-9 py-3.5 font-semibold rounded-full text-base text-gray-800 overflow-visible cursor-pointer"
      style={{
        background: primary
          ? 'linear-gradient(135deg, rgba(16,185,129,0.85) 0%, rgba(5,150,105,0.75) 50%, rgba(22,163,74,0.8) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(248,250,252,0.6) 100%)',
        border: `1px solid ${primary ? 'rgba(16,185,129,0.5)' : 'rgba(148,163,184,0.3)'}`,
        backdropFilter: 'blur(16px)',
        boxShadow: `
          0 0 20px ${primary ? 'rgba(16,185,129,0.15)' : 'rgba(180,200,255,0.05)'},
          0 0 40px ${primary ? 'rgba(5,150,105,0.08)' : 'transparent'},
          inset 0 1px 0 rgba(255,255,255,${primary ? '0.14' : '0.07'}),
          inset 0 -1px 0 rgba(0,0,0,0.1)
        `,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ALWAYS ACTIVE rising bubbles — visible even without hover */}
      {bubbles.map(b => (
        <span
          key={b.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${b.x}%`,
            bottom: '-10px',
            width: hovered ? b.size * 1.8 : b.size * 0.9,
            height: hovered ? b.size * 1.8 : b.size * 0.9,
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,${hovered ? 0.85 : 0.55}), ${b.color})`,
            boxShadow: hovered
              ? `0 0 ${b.size * 2}px ${b.color}, 0 0 ${b.size * 4}px ${b.color.replace('0.', '0.0')}`
              : `0 0 ${b.size}px ${b.color}`,
            animation: `bubble-rise-active ${b.duration}s ease-in-out infinite`,
            animationDelay: `${b.delay}s`,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      ))}

      {/* Hover ripple wave */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${
            primary ? 'rgba(134,239,172,0.18)' : 'rgba(255,255,255,0.10)'
          } 0%, transparent 70%)`,
          transform: hovered ? 'scale(1)' : 'scale(0.5)',
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* Glow border pulse */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `2px solid ${primary ? 'rgba(134,239,172,0)' : 'rgba(255,255,255,0)'}`,
          boxShadow: hovered
            ? `0 0 20px ${primary ? 'rgba(16,185,129,0.25)' : 'rgba(200,220,255,0.12)'} inset, 0 0 30px ${primary ? 'rgba(16,185,129,0.18)' : 'rgba(180,200,255,0.10)'}`
            : `0 0 8px ${primary ? 'rgba(16,185,129,0.08)' : 'rgba(180,200,255,0.04)'} inset`,
          transition: 'all 0.4s ease',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
        }}
      />

      {/* Text content */}
      <span className="relative z-10" style={{
        textShadow: hovered
          ? `0 0 14px ${primary ? 'rgba(134,239,172,0.55)' : 'rgba(0,0,0,0.15)'}, 0 1px 3px rgba(0,0,0,0.3)`
          : `0 0 10px ${primary ? 'rgba(134,239,172,0.25)' : 'rgba(0,0,0,0.1)'}, 0 1px 3px rgba(0,0,0,0.3)`,
        transition: 'text-shadow 0.4s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        {children}
      </span>

      {/* ALWAYS ACTIVE floating sparkles (more when hovered) */}
      {Array.from({ length: hovered ? 6 : 3 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            left: `${12 + i * 16 + Math.random() * 8}%`,
            bottom: '10%',
            width: hovered ? 3 : 1.5,
            height: hovered ? 3 : 1.5,
            background: `radial-gradient(circle, rgba(255,255,255,${hovered ? 0.95 : 0.7}), transparent)`,
            boxShadow: `0 0 ${hovered ? 8 : 4}px rgba(134,239,172,${hovered ? 0.6 : 0.3})`,
            animation: `sparkle-float-always ${hovered ? 1.2 : 2 + i * 0.4}s ease-out infinite`,
            animationDelay: `${i * (hovered ? 0.15 : 0.4)}s`,
          }}
        />
      ))}
    </a>
  );
}

// Pulsing Light Dots Divider (updated colors for natural theme)
function PulsingLightDotsDivider() {
  return (
    <div className="w-full max-w-md mx-auto relative h-[1px] my-6 overflow-hidden">
      <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }} />
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${i * 8}%`,
              width: i % 3 === 0 ? 4 : (i % 3 === 1 ? 2.5 : 1.5),
              height: i % 3 === 0 ? 4 : (i % 3 === 1 ? 2.5 : 1.5),
              background: i % 3 === 0
                ? 'radial-gradient(circle, rgba(34,197,94,0.95), rgba(22,163,74,0.4))'
                : i % 3 === 1
                  ? 'radial-gradient(circle, rgba(96,165,250,0.85), rgba(59,130,246,0.3))'
                  : 'radial-gradient(circle, rgba(255,255,255,0.7), rgba(200,220,255,0.2))',
              boxShadow: i % 3 === 0
                ? `0 0 8px rgba(34,197,94,0.6), 0 0 16px rgba(22,163,74,0.25)`
                : i % 3 === 1
                  ? `0 0 6px rgba(96,165,250,0.5), 0 0 12px rgba(59,130,246,0.2)`
                  : `0 0 4px rgba(255,255,255,0.3)`,
              animation: `dot-pulse ${1.2 + i * 0.15}s ease-in-out infinite, dot-glow ${(2 + i * 0.2)}s ease-in-out infinite`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 10, height: 10,
          background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(34,197,94,0.5), transparent)',
          boxShadow: '0 0 8px rgba(34,197,94,0.6), 0 0 16px rgba(22,163,74,0.2), 0 0 28px rgba(16,185,129,0.1)',
          animation: 'light-head-travel 3s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 80, height: 1.5,
          background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.2), rgba(22,163,74,0.35), rgba(96,165,250,0.2), transparent)',
          filter: 'blur(2px)',
          animation: 'tail-travel 3s ease-in-out infinite',
        }}
      />
    </div>
  );
}

// ============================================================
// METEOR SHOWER CANVAS — Positioned near buttons (not stats)
// ============================================================
function ButtonMeteorShower() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    interface Meteor {
      x: number; y: number; len: number; speed: number;
      angle: number; opacity: number; thickness: number;
      color: string; phase: number;
    }
    let meteors: Meteor[] = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || 600;
      canvas.height = 160;
    };

    const colors = [
      'rgba(34,197,94,', 'rgba(96,165,250,', 'rgba(251,207,232,',
      'rgba(255,255,255,',
      'rgba(16,185,129,', 'rgba(56,189,248,',
    ];

    const createMeteor = (): Meteor => ({
      x: -20 - Math.random() * 80,
      y: 10 + Math.random() * 100,
      len: 25 + Math.random() * 50,
      speed: 1.5 + Math.random() * 3.5,
      angle: Math.PI / 5 + Math.random() * 0.35,
      opacity: 0.35 + Math.random() * 0.5,
      thickness: 0.6 + Math.random() * 1.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
    });

    // Initialize
    for (let i = 0; i < 6; i++) {
      const m = createMeteor();
      m.x = Math.random() * (canvas.width || 600);
      meteors.push(m);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new meteor randomly
      if (Math.random() < 0.04 && meteors.length < 10) {
        meteors.push(createMeteor());
      }

      const time = Date.now() * 0.001;

      meteors.forEach((m, idx) => {
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.phase += 0.02;

        // Gentle opacity oscillation
        const oscOp = m.opacity * (0.75 + 0.25 * Math.sin(m.phase));

        if (m.x > canvas.width + 60 || m.y > canvas.height + 40 || m.opacity < 0.03) {
          meteors[idx] = createMeteor();
          return;
        }

        // Tail gradient
        const grad = ctx.createLinearGradient(
          m.x, m.y,
          m.x - Math.cos(m.angle) * m.len,
          m.y - Math.sin(m.angle) * m.len
        );
        grad.addColorStop(0, `${m.color}${oscOp})`);
        grad.addColorStop(0.3, `${m.color}${oscOp * 0.45})`);
        grad.addColorStop(1, `${m.color}0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = m.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(
          m.x - Math.cos(m.angle) * m.len,
          m.y - Math.sin(m.angle) * m.len
        );
        ctx.stroke();

        // Head glow
        const headGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 5);
        headGrad.addColorStop(0, `${m.color}${oscOp})`);
        headGrad.addColorStop(1, `${m.color}0)`);
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full" style={{ height: '160px', bottom: '-20px', left: 0 }} />;
}

export default function HeroSection() {
  const { locale, t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => setIsVisible(true), []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !statsVisible) setStatsVisible(true);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Sky Meadow canvas — replacing star field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;

    interface Cloud { x: number; y: number; w: number; h: number; speed: number; opacity: number; }
    interface GrassBlade { x: number; baseY: number; height: number; phase: number; speed: number; color: string; }
    
    let clouds: Cloud[] = [];
    let grass: GrassBlade[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initClouds();
      initGrass();
    };

    const initClouds = () => {
      clouds = Array.from({ length: 8 }, () => ({
        x: Math.random() * (canvas.width || 1200),
        y: 20 + Math.random() * (canvas.height * 0.35),
        w: 100 + Math.random() * 200,
        h: 35 + Math.random() * 60,
        speed: 0.15 + Math.random() * 0.35,
        opacity: 0.5 + Math.random() * 0.4,
      }));
    };

    const initGrass = () => {
      grass = [];
      const count = Math.floor((canvas.width || 1200) / 8);
      for (let i = 0; i < count; i++) {
        grass.push({
          x: i * 8 + Math.random() * 4,
          baseY: canvas.height - 10 - Math.random() * 60,
          height: 25 + Math.random() * 45,
          phase: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random() * 1.5,
          color: ['#22c55e', '#16a34a', '#15803d', '#4ade80', '#86efac'][Math.floor(Math.random() * 5)],
        });
      }
    };

    const drawCloud = (c: Cloud, time: number) => {
      const sway = Math.sin(time * 0.0005 + c.x * 0.01) * 10;
      ctx.save();
      ctx.globalAlpha = c.opacity;
      
      // Cloud body composed of multiple circles for fluffy effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.filter = 'blur(15px)';
      
      // Main body
      ctx.beginPath();
      ctx.ellipse(c.x + c.w * 0.5 + sway, c.y, c.w * 0.45, c.h * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Left cluster
      ctx.beginPath();
      ctx.ellipse(c.x + c.w * 0.25 + sway, c.y + c.h * 0.15, c.w * 0.3, c.h * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Right cluster
      ctx.beginPath();
      ctx.ellipse(c.x + c.w * 0.75 + sway, c.y + c.h * 0.1, c.w * 0.32, c.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.filter = 'blur(10px)';
      ctx.beginPath();
      ctx.ellipse(c.x + c.w * 0.42 + sway, c.y - c.h * 0.15, c.w * 0.28, c.h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawGrass = (time: number) => {
      const t = time * 0.001;
      grass.forEach((g) => {
        const wind = Math.sin(t * g.speed + g.phase) * 6;
        const leanX = wind;
        
        ctx.strokeStyle = g.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(g.x, g.baseY);
        ctx.quadraticCurveTo(
          g.x + leanX * 0.5,
          g.baseY - g.height * 0.5,
          g.x + leanX,
          g.baseY - g.height
        );
        ctx.stroke();
        
        // Grass tip highlight
        if (g.height > 40) {
          ctx.strokeStyle = 'rgba(134, 234, 172, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(g.x + leanX * 0.4, g.baseY - g.height * 0.6);
          ctx.quadraticCurveTo(
            g.x + leanX * 0.7,
            g.baseY - g.height * 0.85,
            g.x + leanX,
            g.baseY - g.height
          );
          ctx.stroke();
        }
      });
    };

    const drawSunGlow = (time: number) => {
      const pulse = 0.92 + Math.sin(time * 0.0008) * 0.08;
      const sunGrad = ctx.createRadialGradient(
        canvas.width * 0.78, canvas.height * 0.18, 0,
        canvas.width * 0.78, canvas.height * 0.18, 180 * pulse
      );
      sunGrad.addColorStop(0, 'rgba(255, 248, 220, 0.95)');
      sunGrad.addColorStop(0.15, 'rgba(255, 235, 180, 0.65)');
      sunGrad.addColorStop(0.35, 'rgba(254, 215, 170, 0.25)');
      sunGrad.addColorStop(0.6, 'rgba(251, 191, 36, 0.08)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawBird = (x: number, y: number, wingPhase: number) => {
      const wingAngle = Math.sin(wingPhase) * 0.4;
      ctx.strokeStyle = 'rgba(55, 65, 81, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(x - 8, y + 2);
      ctx.quadraticCurveTo(x, y - 4 + wingAngle * 6, x + 8, y + 2);
      ctx.stroke();
    };

    let birds: Array<{ x: number; y: number; speed: number; phase: number; }> = [];

    const initBirds = () => {
      birds = Array.from({ length: 4 }, (_, i) => ({
        x: -50 - Math.random() * 200,
        y: 80 + i * 35 + Math.random() * 30,
        speed: 0.6 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      const time = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sun glow
      drawSunGlow(time);

      // Clouds
      clouds.forEach(c => {
        drawCloud(c, time);
        c.x += c.speed;
        if (c.x > canvas.width + c.w) {
          c.x = -c.w * 1.5;
          c.y = 20 + Math.random() * (canvas.height * 0.35);
        }
      });

      // Distant mountain silhouette
      ctx.fillStyle = 'rgba(74, 124, 156, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.75);
      for (let x = 0; x <= canvas.width; x += 60) {
        const h = Math.sin(x * 0.004) * 50 + Math.sin(x * 0.008) * 30 + 70;
        ctx.lineTo(x, canvas.height * 0.75 - h);
      }
      ctx.lineTo(canvas.width, canvas.height * 0.75);
      ctx.closePath();
      ctx.fill();

      // Nearby grass waves
      ctx.fillStyle = 'rgba(34, 160, 94, 0.12)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.85);
      for (let x = 0; x <= canvas.width; x += 30) {
        const t = time * 0.001;
        const wave = Math.sin(x * 0.01 + t * 0.8) * 12 + Math.sin(x * 0.02 + t * 1.2) * 8;
        ctx.lineTo(x, canvas.height * 0.85 + wave);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Grass blades
      drawGrass(time);

      // Flying birds
      birds.forEach(b => {
        b.x += b.speed;
        b.phase += 0.06;
        drawBird(b.x, b.y, b.phase);
        if (b.x > canvas.width + 50) b.x = -50 - Math.random() * 100;
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    initBirds();
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
  };
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.18 } }
  };

  const statColors = [
    ['#22c55e', '#16a34a', '#15803b'],
    ['#3b82f6', '#60a5fa', '#93c5fd'],
    ['#f97316', '#fb923c', '#fdba74'],
  ];

  return (
    <section
      className="homepage-sky-meadow relative min-h-[75vh] flex items-center justify-center overflow-hidden"
      style={{ minHeight: '75vh' }}
    >
      {/* Blue sky + grassland gradient */}
      <div className="absolute inset-0 z-0" style={{
        background: `radial-gradient(ellipse at 50% 0%, rgba(135, 206, 250, 0.4) 0%, transparent 60%),
                   radial-gradient(ellipse at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 40%),
                   linear-gradient(180deg,
                     #1e90ff 0%,
                     #3b82f6 15%,
                     #60a5fa 30%,
                     #93c5fd 48%,
                     #bfdbfe 62%,
                     #dbeafe 72%,
                     #ecfdf5 82%,
                     #dcfce7 88%,
                     #bbf7d0 95%,
                     #86efac 100%
                   )`,
      }} />

      {/* Sky Meadow canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" style={{ width: '100%', height: '100%' }} />

      {/* Vignette — reduced for bright natural feel */}
      <div className="absolute inset-0 z-[1]" style={{
        background: `radial-gradient(ellipse 70% 52% at 50% 40%, transparent 0%, rgba(15, 23, 42, 0.12) 58%, rgba(15, 23, 42, 0.22) 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Ambient light orbs — natural warm tones */}
      <div className="absolute top-[5%] left-[5%] w-[400px] h-[400px] rounded-full blur-[120px] z-0"
        style={{ backgroundColor: 'rgba(254, 240, 138, 0.15)' }} />
      <div className="absolute bottom-[15%] right-[5%] w-[350px] h-[250px] rounded-full blur-[110px] z-0"
        style={{ backgroundColor: 'rgba(134, 239, 172, 0.12)' }} />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[120px] z-0"
        style={{ backgroundColor: 'rgba(147, 197, 253, 0.08)' }} />

      {/* Content */}
      <div className="relative z-10 text-center text-gray-800 px-6 max-w-5xl mx-auto">
        <motion.div variants={staggerChildren} initial="hidden" animate="visible">
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-5">
            <div className="inline-flex items-center space-x-2 backdrop-blur-md border rounded-full px-4 py-1.5 mb-4"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(52, 211, 153, 0.25)' }}>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"
                style={{ boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }} />
              <span className="text-xs font-medium tracking-wide" style={{ color: '#166534' }}>{t('hero.badge')}</span>
            </div>

            {/* Title */}
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.15] hero-title-glow"
              style={{
                color: '#0f172a',
                textShadow: `
                  0 0 30px rgba(148, 163, 184, 0.3),
                  0 0 60px rgba(203, 213, 225, 0.15),
                  0 2px 4px rgba(0, 0, 0, 0.15),
                  0 4px 16px rgba(0, 0, 0, 0.08)
                `,
              }}
            >
              {t('hero.title')}
            </motion.h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p variants={fadeInUp}
            className="text-base md:text-lg lg:text-xl mb-4 font-medium max-w-2xl mx-auto subtitle-glow"
            style={{
              color: '#334155',
              textShadow: `
                0 0 16px rgba(148, 163, 184, 0.15),
                0 2px 6px rgba(0, 0, 0, 0.08),
              `,
            }}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Description */}
          <motion.p variants={fadeInUp}
            className="text-sm md:text-base mb-10 max-w-2xl mx-auto leading-relaxed font-normal opacity-90"
            style={{
              color: '#475569',
              textShadow: '0 1px 4px rgba(255, 255, 255, 0.5), 0 0 12px rgba(148, 163, 184, 0.05)',
            }}
          >
            {t('hero.description')}
          </motion.p>

          {/* CTA Buttons with METEOR SHOWER nearby */}
          <motion.div variants={fadeInUp}
            className="relative flex flex-col sm:flex-row gap-4 justify-center mb-10">
            {/* Meteor shower canvas overlaying the button area */}
            <ButtonMeteorShower />

            <BubbleButton href={`/${locale}/products`} primary>
              {t('hero.ctaProducts')}
              <svg className="ml-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </BubbleButton>
            <BubbleButton href={`/${locale}/contact`}>
              {t('hero.ctaContact')}
            </BubbleButton>
          </motion.div>

          {/* PULSING LIGHT DOTS DIVIDER */}
          <PulsingLightDotsDivider />

          {/* Stats bar */}
          <motion.div ref={statsRef} variants={fadeInUp}
            className="flex flex-wrap justify-center gap-8 md:gap-14 max-w-2xl mx-auto pt-4"
          >
            {[
              { number: '10+', labelKey: 'hero.statModels' },
              { number: '60+', labelKey: 'hero.statCountries' },
              { number: '500+', labelKey: 'hero.statClients' },
            ].map((stat, i) => (
              <div key={i} className="text-center relative z-10">
                <div
                  className="text-xl md:text-2xl font-bold mb-1 inline-block"
                  style={{
                    color: '#1e293b',
                    textShadow: `
                      0 0 14px ${statColors[i][0]}44,
                      0 0 28px ${statColors[i][1]}22,
                      0 2px 4px rgba(0, 0, 0, 0.1)
                    `,
                    animation: `stat-color-shift-${i} 4s ease-in-out infinite`,
                  }}
                >
                  <span
                    className="inline-block mr-1.5 text-sm opacity-50"
                    style={{
                      color: statColors[i][0],
                      textShadow: `0 0 8px ${statColors[i][0]}55`,
                    }}
                  >{['✦', '✧', '◇'][i]}</span>
                  {statsVisible ? <CountUp end={stat.number} /> : stat.number}
                </div>
                <div className="text-xs font-medium opacity-40 transition-opacity duration-500 hover:opacity-70"
                  style={{ color: '#64748b', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}
                >
                  {t(stat.labelKey)}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* CSS Animations */}
      <style>{`
        /* Title glow — adapted for light background */
        @keyframes hero-title-glow {
          0%, 100% {
            text-shadow:
              0 0 30px rgba(148,163,184,0.25),
              0 0 60px rgba(203,213,225,0.12),
              0 2px 4px rgba(0,0,0,0.15),
              0 4px 16px rgba(0,0,0,0.08);
          }
          50% {
            text-shadow:
              0 0 38px rgba(148,163,184,0.35),
              0 0 76px rgba(226,232,240,0.18),
              0 2px 4px rgba(0,0,0,0.15),
              0 4px 16px rgba(0,0,0,0.08);
          }
        }
        .hero-title-glow { animation: hero-title-glow 4s ease-in-out infinite; }

        @keyframes subtitle-glow {
          0%, 100% { opacity: 0.88; }
          50% { opacity: 1; }
        }
        .subtitle-glow { animation: subtitle-glow 5s ease-in-out infinite; }

        /* ===== ALWAYS ACTIVE BUBBLE ANIMATION ===== */
        @keyframes bubble-rise-active {
          0%   { transform: translateY(0) scale(0.6); opacity: 0; }
          15%  { opacity: 0.7; }
          50%  { transform: translateY(-22px) scale(1.2); opacity: 0.85; }
          85%  { transform: translateY(-48px) scale(0.8); opacity: 0.3; }
          100% { transform: translateY(-62px) scale(0.3); opacity: 0; }
        }

        /* Always active sparkles */
        @keyframes sparkle-float-always {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.9; }
          40%  { opacity: 0.7; }
          100% { transform: translateY(-28px) translateX(${Math.random() > 0.5 ? '' : '-'}8px) scale(0); opacity: 0; }
        }

        /* ===== PULSING LIGHT DOTS ===== */
        @keyframes dot-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          50% { transform: translate(-50%, -50%) scale(1.6); opacity: 1; }
        }
        @keyframes dot-glow {
          0%, 100% { box-shadow: 0 0 4px currentColor; }
          50% { box-shadow: 0 0 12px currentColor, 0 0 24px currentColor; }
        }
        @keyframes light-head-travel {
          0%   { left: -5%; opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          15%  { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          85%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { left: 105%; opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        }
        @keyframes tail-travel {
          0%   { left: -10%; opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { left: 105%; opacity: 0; }
        }

        /* ===== STAT COLOR CYCLING — adapted for light background ===== */
        @keyframes stat-color-shift-0 {
          0%, 33%   { color: #1e293b; text-shadow: 0 0 14px rgba(34,197,94,0.3), 0 0 28px rgba(22,163,74,0.15), 0 2px 4px rgba(0,0,0,0.1); }
          34%, 66%  { color: #0f172a; text-shadow: 0 0 14px rgba(22,163,74,0.35), 0 0 28px rgba(21,128,61,0.15), 0 2px 4px rgba(0,0,0,0.1); }
          67%, 100% { color: #1e293b; text-shadow: 0 0 14px rgba(21,128,61,0.3), 0 0 28px rgba(34,197,94,0.15), 0 2px 4px rgba(0,0,0,0.1); }
        }
        @keyframes stat-color-shift-1 {
          0%, 33%   { color: #1e293b; text-shadow: 0 0 14px rgba(59,130,246,0.3), 0 0 28px rgba(96,165,250,0.15), 0 2px 4px rgba(0,0,0,0.1); }
          34%, 66%  { color: #0f172a; text-shadow: 0 0 14px rgba(96,165,250,0.35), 0 0 28px rgba(147,197,253,0.15), 0 2px 4px rgba(0,0,0,0.1); }
          67%, 100% { color: #1e293b; text-shadow: 0 0 14px rgba(147,197,253,0.3), 0 0 28px rgba(59,130,246,0.15), 0 2px 4px rgba(0,0,0,0.1); }
        }
        @keyframes stat-color-shift-2 {
          0%, 33%   { color: #1e293b; text-shadow: 0 0 14px rgba(249,115,22,0.3), 0 0 28px rgba(251,146,60,0.15), 0 2px 4px rgba(0,0,0,0.1); }
          34%, 66%  { color: #0f172a; text-shadow: 0 0 14px rgba(251,146,60,0.35), 0 0 28px rgba(253,186,116,0.15), 0 2px 4px rgba(0,0,0,0.1); }
          67%, 100% { color: #1e293b; text-shadow: 0 0 14px rgba(253,186,116,0.3), 0 0 28px rgba(249,115,22,0.15), 0 2px 4px rgba(0,0,0,0.1); }
        }
      `}</style>
    </section>
  );
}
