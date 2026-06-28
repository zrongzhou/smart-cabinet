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

// Star layer configuration - REALISTIC night sky with DEPTH
interface StarLayer {
  count: number;
  sizeRange: [number, number];
  opacityRange: [number, number];
  color: string;
  speedFactor: number;
}

const STAR_LAYERS: StarLayer[] = [
  { count: 100, sizeRange: [0.12, 0.35], opacityRange: [0.06, 0.2], color: 'rgba(170,185,220,', speedFactor: 0 },
  { count: 50, sizeRange: [0.28, 0.65], opacityRange: [0.12, 0.35], color: 'rgba(190,210,245,', speedFactor: 0 },
  { count: 25, sizeRange: [0.5, 1.2], opacityRange: [0.25, 0.55], color: 'rgba(218,235,255,', speedFactor: 0 },
  { count: 10, sizeRange: [1.8, 3.2], opacityRange: [0.5, 1.0], color: 'rgba(255,255,255,', speedFactor: 0.008 },
  { count: 3, sizeRange: [3.0, 4.8], opacityRange: [0.75, 1.0], color: 'rgba(240,248,255,', speedFactor: 0.004 },
];

// Bubble Button Component - 泡泡动态按钮
function BubbleButton({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);
  const [hovered, setHovered] = useState(false);

  // Generate random bubbles on mount
  useEffect(() => {
    const bbs = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 60 + Math.random() * 40,
      size: 4 + Math.random() * 10,
      delay: Math.random() * 2,
    }));
    setBubbles(bbs);
  }, []);

  return (
    <a
      href={href}
      className="group relative inline-flex items-center justify-center px-9 py-3.5 font-semibold rounded-full text-base text-white overflow-hidden cursor-pointer"
      style={{
        background: primary
          ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(59,130,246,0.18) 50%, rgba(139,92,246,0.22) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        border: `1px solid ${primary ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.15)'}`,
        backdropFilter: 'blur(16px)',
        boxShadow: `
          0 0 20px ${primary ? 'rgba(99,102,241,0.12)' : 'rgba(180,200,255,0.04)'},
          0 0 40px ${primary ? 'rgba(59,130,246,0.06)' : 'transparent'},
          inset 0 1px 0 rgba(255,255,255,${primary ? '0.12' : '0.06'}),
          inset 0 -1px 0 rgba(0,0,0,0.1)
        `,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rising bubbles */}
      {bubbles.map(b => (
        <span
          key={b.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${b.x}%`,
            bottom: '-8px',
            width: hovered ? b.size + 4 : b.size * 0.4,
            height: hovered ? b.size + 4 : b.size * 0.4,
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,${hovered ? 0.7 : 0.25}), rgba(147,197,253,${hovered ? 0.3 : 0.08}) transparent)`,
            boxShadow: hovered ? `0 0 ${b.size}px rgba(147,197,253,0.4)` : 'none',
            animation: hovered
              ? `bubble-rise ${1.8 + b.delay}s ease-in-out infinite`
              : `bubble-idle ${2 + b.delay}s ease-in-out infinite`,
            animationDelay: `${b.delay * 0.5}s`,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      ))}

      {/* Hover ripple wave */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${
            primary ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.08)'
          } 0%, transparent 70%)`,
          transform: hovered ? 'scale(1)' : 'scale(0.5)',
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* Glow border pulse on hover */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `2px solid ${primary ? 'rgba(129,140,248,0)' : 'rgba(255,255,255,0)'}`,
          boxShadow: hovered
            ? `0 0 20px ${primary ? 'rgba(99,102,241,0.2)' : 'rgba(200,220,255,0.1)'} inset, 0 0 30px ${primary ? 'rgba(99,102,241,0.15)' : 'rgba(180,200,255,0.08)'}`
            : 'none',
          transition: 'all 0.4s ease',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
        }}
      />

      {/* Text content */}
      <span className="relative z-10" style={{
        textShadow: hovered
          ? `0 0 12px ${primary ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.4)'}, 0 1px 3px rgba(0,0,0,0.5)`
          : `0 0 8px rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.5)`,
        transition: 'text-shadow 0.4s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        {children}
      </span>

      {/* Floating sparkle particles */}
      {hovered && Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/80 pointer-events-none"
          style={{
            left: `${20 + i * 20}%`,
            top: `${Math.random() > 0.5 ? -2 : 100}%`,
            animation: `sparkle-float ${1 + i * 0.3}s ease-out forwards`,
            animationDelay: `${i * 0.1}s`,
            boxShadow: '0 0 6px rgba(255,255,255,0.8)',
          }}
        />
      ))}
    </a>
  );
}

// Pulsing Light Dots Divider - 脉光点从左到右加载的分割线
function PulsingLightDotsDivider() {
  return (
    <div className="w-full max-w-md mx-auto relative h-[3px] my-6 overflow-hidden">
      {/* Background track */}
      <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* Animated light dots traveling left to right */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${i * 8}%`,
              width: i % 3 === 0 ? 6 : (i % 3 === 1 ? 4 : 3),
              height: i % 3 === 0 ? 6 : (i % 3 === 1 ? 4 : 3),
              background: i % 3 === 0
                ? 'radial-gradient(circle, rgba(167,139,250,0.95), rgba(139,92,246,0.4))'
                : i % 3 === 1
                  ? 'radial-gradient(circle, rgba(96,165,250,0.85), rgba(59,130,246,0.3))'
                  : 'radial-gradient(circle, rgba(255,255,255,0.7), rgba(200,220,255,0.2))',
              boxShadow: i % 3 === 0
                ? `0 0 8px rgba(167,139,250,0.6), 0 0 16px rgba(139,92,246,0.25)`
                : i % 3 === 1
                  ? `0 0 6px rgba(96,165,250,0.5), 0 0 12px rgba(59,130,246,0.2)`
                  : `0 0 4px rgba(255,255,255,0.3)`,
              animation: `dot-pulse ${1.2 + i * 0.15}s ease-in-out infinite, dot-glow ${(2 + i * 0.2)}s ease-in-out infinite`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>

      {/* Leading bright head that travels across */}
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 16,
          height: 16,
          background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(167,139,250,0.5), transparent)',
          boxShadow: '0 0 12px rgba(167,139,250,0.7), 0 0 24px rgba(139,92,246,0.3), 0 0 40px rgba(99,102,241,0.15)',
          animation: 'light-head-travel 3s ease-in-out infinite',
        }}
      />

      {/* Trailing tail glow */}
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 80,
          height: 3,
          background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.2), rgba(139,92,246,0.35), rgba(96,165,250,0.2), transparent)',
          filter: 'blur(2px)',
          animation: 'tail-travel 3s ease-in-out infinite',
        }}
      />
    </div>
  );
}

// Meteor Shower Canvas for stats area - 流星群动画（数字区域专用）
function MeteorShowerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let meteors: { x: number; y: number; len: number; speed: number; angle: number; opacity: number; thickness: number; color: string }[] = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || 600;
      canvas.height = 120;
    };

    const createMeteor = () => ({
      x: -20 - Math.random() * 100,
      y: Math.random() * canvas.height * 0.5,
      len: 30 + Math.random() * 60,
      speed: 2 + Math.random() * 4,
      angle: Math.PI / 5 + Math.random() * 0.3,
      opacity: 0.4 + Math.random() * 0.5,
      thickness: 0.8 + Math.random() * 1.5,
      color: ['rgba(167,139,250,', 'rgba(96,165,250,', 'rgba(52,211,153,', 'rgba(251,207,232,', 'rgba(255,255,255,'][Math.floor(Math.random() * 5)],
    });

    // Initialize meteors
    for (let i = 0; i < 5; i++) {
      const m = createMeteor();
      m.x = Math.random() * canvas.width;
      meteors.push(m);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Randomly spawn new meteor
      if (Math.random() < 0.03 && meteors.length < 8) {
        meteors.push(createMeteor());
      }

      meteors.forEach((m, idx) => {
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.opacity *= 0.998;

        if (m.x > canvas.width + 50 || m.y > canvas.height + 30 || m.opacity < 0.05) {
          meteors[idx] = createMeteor();
          return;
        }

        // Draw meteor tail
        const grad = ctx.createLinearGradient(
          m.x, m.y,
          m.x - Math.cos(m.angle) * m.len,
          m.y - Math.sin(m.angle) * m.len
        );
        grad.addColorStop(0, `${m.color}${m.opacity})`);
        grad.addColorStop(0.3, `${m.color}${m.opacity * 0.5})`);
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
        const headGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 4);
        headGrad.addColorStop(0, `${m.color}${m.opacity})`);
        headGrad.addColorStop(1, `${m.color}0)`);
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full" style={{ height: '120px' }} />;
}

export default function HeroSection() {
  const { locale, t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => setIsVisible(true), []);

  // Stats visibility observer
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !statsVisible) setStatsVisible(true);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Star field canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;

    interface Star {
      x: number; y: number; vx: number; vy: number;
      size: number; baseOpacity: number; color: string;
      twinkleOffset: number; twinkleSpeed: number;
      layer: number; hasCross: boolean;
    }
    let stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      stars = [];
      STAR_LAYERS.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.count; i++) {
          const size = layer.sizeRange[0] + Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]);
          const speed = 0.01 + Math.random() * 0.02;
          const angle = Math.random() * Math.PI * 2;
          const twinkleSpeedMult = layerIndex >= 3 ? 1.8 : 1;
          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            baseOpacity: layer.opacityRange[0] + Math.random() * (layer.opacityRange[1] - layer.opacityRange[0]),
            color: layer.color,
            twinkleOffset: Math.random() * Math.PI * 2,
            twinkleSpeed: (0.6 + Math.random() * 1.8) * twinkleSpeedMult,
            layer: layerIndex,
            hasCross: layerIndex >= 3 && size > 2.0,
          });
        }
      });
    };

    const drawMilkyWay = () => {
      ctx.save();
      ctx.globalAlpha = 0.03 + Math.sin(Date.now() * 0.00008) * 0.01;
      ctx.translate(canvas.width * 0.5, canvas.height * 0.45);
      ctx.rotate(-0.35);
      ctx.scale(1, 0.22);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, canvas.width * 0.55);
      grad.addColorStop(0, 'rgba(210, 215, 240, 0.85)');
      grad.addColorStop(0.4, 'rgba(190, 200, 230, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
      ctx.restore();
    };

    const drawNebulae = () => {
      const t = Date.now() * 0.00005;
      const g1 = ctx.createRadialGradient(
        canvas.width * 0.12 + Math.sin(t) * 20,
        canvas.height * 0.18 + Math.cos(t * 0.7) * 15, 0,
        canvas.width * 0.12, canvas.height * 0.18, canvas.width * 0.3
      );
      g1.addColorStop(0, `rgba(99, 102, 241, ${0.05 + Math.sin(t * 1.3) * 0.015})`);
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const g2 = ctx.createRadialGradient(
        canvas.width * 0.82 + Math.cos(t * 0.8) * 20,
        canvas.height * 0.78 + Math.sin(t * 1.1) * 15, 0,
        canvas.width * 0.82, canvas.height * 0.78, canvas.width * 0.28
      );
      g2.addColorStop(0, `rgba(6, 182, 212, ${0.03 + Math.cos(t * 0.9) * 0.01})`);
      g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      const time = Date.now() * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawNebulae();
      drawMilkyWay();

      const sorted = [...stars].sort((a, b) => a.layer - b.layer);

      sorted.forEach((star) => {
        if (STAR_LAYERS[star.layer].speedFactor > 0) {
          star.x += star.vx * STAR_LAYERS[star.layer].speedFactor;
          star.y += star.vy * STAR_LAYERS[star.layer].speedFactor;
          if (star.x < -5) star.x = canvas.width + 5;
          if (star.x > canvas.width + 5) star.x = -5;
          if (star.y < -5) star.y = canvas.height + 5;
          if (star.y > canvas.height + 5) star.y = -5;
        }

        let twinkleFactor: number;
        if (star.layer >= 3) {
          const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
          const flash = Math.pow(Math.max(0, twinkle), 3);
          twinkleFactor = 0.55 + ((twinkle + 1) * 0.2) + flash * 0.35;
        } else {
          const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
          twinkleFactor = 0.70 + ((twinkle + 1) * 0.15);
        }
        const currentOpacity = Math.min(1, Math.max(0.03, star.baseOpacity * twinkleFactor));

        if (star.layer >= 3 && currentOpacity > 0.4 && star.size > 1.5) {
          const glowSize = star.size * (4 + star.layer * 1.5);
          const glowGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
          glowGrad.addColorStop(0, `rgba(180, 210, 255, ${currentOpacity * 0.18})`);
          glowGrad.addColorStop(0.35, `rgba(140, 180, 230, ${currentOpacity * 0.08})`);
          glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color + currentOpacity + ')';
        ctx.fill();

        if (star.hasCross && currentOpacity > 0.6) {
          const intensity = Math.min(1, (currentOpacity - 0.6) / 0.4);
          const spikeLen = star.size * (2.8 + intensity * 6);
          const spikeOpacity = intensity * 0.45;
          ctx.strokeStyle = `rgba(220, 240, 255, ${spikeOpacity})`;
          ctx.lineWidth = 0.6 + intensity * 0.4;
          ctx.beginPath();
          ctx.moveTo(star.x - spikeLen, star.y);
          ctx.lineTo(star.x + spikeLen, star.y);
          ctx.moveTo(star.x, star.y - spikeLen);
          ctx.lineTo(star.x, star.y + spikeLen);
          ctx.stroke();
          if (star.layer >= 4 && intensity > 0.5) {
            const diagLen = spikeLen * 0.5;
            ctx.strokeStyle = `rgba(200, 225, 255, ${spikeOpacity * 0.3})`;
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(star.x - diagLen, star.y - diagLen);
            ctx.lineTo(star.x + diagLen, star.y + diagLen);
            ctx.moveTo(star.x + diagLen, star.y - diagLen);
            ctx.lineTo(star.x - diagLen, star.y + diagLen);
            ctx.stroke();
          }
        }
      });

      // Shooting stars in main canvas
      if (Math.random() < 0.006) {
        const sx = Math.random() * canvas.width * 0.7;
        const sy = Math.random() * canvas.height * 0.25;
        const slen = 80 + Math.random() * 140;
        const sangle = Math.PI / 4.5 + Math.random() * 0.25;
        const shootGrad = ctx.createLinearGradient(sx, sy, sx + Math.cos(sangle) * slen, sy + Math.sin(sangle) * slen);
        shootGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shootGrad.addColorStop(0.3, 'rgba(220, 235, 255, 0.3)');
        shootGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.7)');
        shootGrad.addColorStop(1, 'rgba(200, 220, 255, 0)');
        ctx.strokeStyle = shootGrad;
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(sangle) * slen, sy + Math.sin(sangle) * slen);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createStars();
    draw();
    window.addEventListener('resize', () => { resize(); createStars(); });
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

  // Color palette for stat number animations
  const statColors = [
    ['#c084fc', '#818cf8', '#38bdf8'], // purple → indigo → cyan
    ['#34d399', '#38bdf8', '#a78bfa'], // emerald → cyan → purple
    ['#fb923c', '#f472b6', '#818cf8'], // orange → pink → indigo
  ];

  return (
    <section
      className="homepage-starry relative min-h-[75vh] flex items-center justify-center overflow-hidden"
      style={{ minHeight: '75vh' }}
    >
      {/* Multi-layer deep space gradient */}
      <div className="absolute inset-0 z-0" style={{
        background: `radial-gradient(ellipse at 50% 35%, rgba(25, 33, 68, 0.38) 0%, transparent 60%),
                   radial-gradient(ellipse at 15% 85%, rgba(45, 35, 90, 0.2) 0%, transparent 45%),
                   radial-gradient(ellipse at 85% 15%, rgba(25, 50, 85, 0.22) 0%, transparent 45%),
                   linear-gradient(178deg, #02010a 0%, #060b1a 16%, #0a1028 32%, #0d1535 48%, #09142c 66%, #050e21 84%, #020814 100%)`,
      }} />

      {/* Star field canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" style={{ width: '100%', height: '100%' }} />

      {/* Vignette for depth focus */}
      <div className="absolute inset-0 z-[1]" style={{
        background: `radial-gradient(ellipse 70% 50% at 50% 42%, transparent 0%, rgba(2, 4, 12, 0.35) 60%, rgba(2, 4, 12, 0.58) 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Ambient light orbs behind content */}
      <div className="absolute top-[8%] left-[3%] w-[450px] h-[450px] rounded-full blur-[130px] z-0"
        style={{ backgroundColor: 'rgba(59, 130, 246, 0.10)' }} />
      <div className="absolute bottom-[12%] right-[3%] w-[350px] h-[350px] rounded-full blur-[110px] z-0"
        style={{ backgroundColor: 'rgba(139, 92, 246, 0.07)' }} />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
        <motion.div variants={staggerChildren} initial="hidden" animate="visible">
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-5">
            <div className="inline-flex items-center space-x-2 backdrop-blur-md border rounded-full px-4 py-1.5 mb-4"
              style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', borderColor: 'rgba(96, 165, 250, 0.2)' }}>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"
                style={{ boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }} />
              <span className="text-xs font-medium tracking-wide" style={{ color: '#93c5fd' }}>{t('hero.badge')}</span>
            </div>

            {/* Title - 3D GLOW EFFECT */}
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.15] hero-title-glow"
              style={{
                color: '#ffffff',
                textShadow: `
                  0 0 40px rgba(147, 197, 253, 0.35),
                  0 0 80px rgba(59, 130, 246, 0.18),
                  0 0 120px rgba(99, 102, 241, 0.08),
                  0 2px 4px rgba(0, 0, 0, 0.8),
                  0 4px 16px rgba(0, 0, 0, 0.5),
                  0 0 1px rgba(200, 220, 255, 0.6)
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
              color: '#e0f2fe',
              textShadow: `
                0 0 24px rgba(147, 197, 253, 0.25),
                0 0 48px rgba(59, 130, 246, 0.12),
                0 2px 8px rgba(0, 0, 0, 0.6),
                0 1px 0 rgba(255, 255, 255, 0.15)
              `,
            }}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Description */}
          <motion.p variants={fadeInUp}
            className="text-sm md:text-base mb-10 max-w-2xl mx-auto leading-relaxed font-normal opacity-90"
            style={{
              color: '#cbd5e1',
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.5), 0 0 16px rgba(147, 197, 253, 0.08)',
            }}
          >
            {t('hero.description')}
          </motion.p>

          {/* CTA Buttons - BUBBLE EFFECT */}
          <motion.div variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
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

          {/* Stats bar - smaller numbers with color animation + meteor shower */}
          <motion.div ref={statsRef} variants={fadeInUp}
            className="relative flex flex-wrap justify-center gap-8 md:gap-14 max-w-2xl mx-auto pt-4"
          >
            {/* Meteor shower overlay for stats area */}
            <MeteorShowerCanvas />

            {[
              { number: '10+', labelKey: 'hero.statModels' },
              { number: '60+', labelKey: 'hero.statCountries' },
              { number: '500+', labelKey: 'hero.statClients' },
            ].map((stat, i) => (
              <div key={i} className="text-center relative z-10">
                {/* Number - slightly smaller, with color cycling animation */}
                <div
                  className="text-xl md:text-2xl font-bold mb-1 inline-block"
                  style={{
                    color: '#ffffff',
                    textShadow: `
                      0 0 16px ${statColors[i][0]}66,
                      0 0 32px ${statColors[i][1]}33,
                      0 2px 6px rgba(0, 0, 0, 0.6)
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
                {/* Label */}
                <div className="text-xs font-medium opacity-40 transition-opacity duration-500 hover:opacity-70"
                  style={{
                    color: '#94a3b8',
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  }}
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
        /* Title glow */
        @keyframes hero-title-glow {
          0%, 100% {
            text-shadow:
              0 0 40px rgba(147,197,253,0.30),
              0 0 80px rgba(59,130,246,0.15),
              0 0 120px rgba(99,102,241,0.06),
              0 2px 4px rgba(0,0,0,0.8),
              0 4px 16px rgba(0,0,0,0.5),
              0 0 1px rgba(200,220,255,0.5);
          }
          50% {
            text-shadow:
              0 0 50px rgba(147,197,253,0.45),
              0 0 100px rgba(99,102,241,0.20),
              0 0 150px rgba(139,92,246,0.08),
              0 2px 4px rgba(0,0,0,0.8),
              0 4px 16px rgba(0,0,0,0.5),
              0 0 1px rgba(220,240,255,0.7);
          }
        }
        .hero-title-glow { animation: hero-title-glow 4s ease-in-out infinite; }

        @keyframes subtitle-glow {
          0%, 100% { opacity: 0.88; }
          50% { opacity: 1; }
        }
        .subtitle-glow { animation: subtitle-glow 5s ease-in-out infinite; }

        /* ===== BUBBLE BUTTON ANIMATIONS ===== */
        @keyframes bubble-rise {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-28px) scale(1.3); opacity: 0.9; }
          100% { transform: translateY(-56px) scale(0.6); opacity: 0; }
        }
        @keyframes bubble-idle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-8px) scale(1.1); opacity: 0.4; }
        }
        @keyframes sparkle-float {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-20px) scale(0); opacity: 0; }
        }

        /* ===== PULSING LIGHT DOTS ANIMATIONS ===== */
        @keyframes dot-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          50% { transform: translate(-50%, -50%) scale(1.6); opacity: 1; }
        }
        @keyframes dot-glow {
          0%, 100% { box-shadow: 0 0 4px currentColor; }
          50% { box-shadow: 0 0 12px currentColor, 0 0 24px currentColor; }
        }
        @keyframes light-head-travel {
          0% { left: -5%; opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { left: 105%; opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        }
        @keyframes tail-travel {
          0% { left: -10%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 105%; opacity: 0; }
        }

        /* ===== STAT NUMBER COLOR CYCLING ===== */
        @keyframes stat-color-shift-0 {
          0%, 33%   { color: #ffffff; text-shadow: 0 0 16px rgba(192,132,252,0.4), 0 0 32px rgba(129,140,248,0.2), 0 2px 6px rgba(0,0,0,0.6); }
          34%, 66%  { color: #e0e7ff; text-shadow: 0 0 16px rgba(129,140,248,0.5), 0 0 32px rgba(56,189,248,0.2), 0 2px 6px rgba(0,0,0,0.6); }
          67%, 100% { color: #f0f9ff; text-shadow: 0 0 16px rgba(56,189,248,0.5), 0 0 32px rgba(192,132,252,0.2), 0 2px 6px rgba(0,0,0,0.6); }
        }
        @keyframes stat-color-shift-1 {
          0%, 33%   { color: #ffffff; text-shadow: 0 0 16px rgba(52,211,153,0.4), 0 0 32px rgba(56,189,248,0.2), 0 2px 6px rgba(0,0,0,0.6); }
          34%, 66%  { color: #ecfdf5; text-shadow: 0 0 16px rgba(56,189,248,0.5), 0 0 32px rgba(167,139,250,0.2), 0 2px 6px rgba(0,0,0,0.6); }
          67%, 100% { color: #f0fdfa; text-shadow: 0 0 16px rgba(167,139,250,0.5), 0 0 32px rgba(52,211,153,0.2), 0 2px 6px rgba(0,0,0,0.6); }
        }
        @keyframes stat-color-shift-2 {
          0%, 33%   { color: #ffffff; text-shadow: 0 0 16px rgba(251,146,60,0.4), 0 0 32px rgba(244,114,182,0.2), 0 2px 6px rgba(0,0,0,0.6); }
          34%, 66%  { color: #fff7ed; text-shadow: 0 0 16px rgba(244,114,182,0.5), 0 0 32px rgba(129,140,248,0.2), 0 2px 6px rgba(0,0,0,0.6); }
          67%, 100% { color: #fdf2f8; text-shadow: 0 0 16px rgba(129,140,248,0.5), 0 0 32px rgba(251,146,60,0.2), 0 2px 6px rgba(0,0,0,0.6); }
        }
      `}</style>
    </section>
  );
}
