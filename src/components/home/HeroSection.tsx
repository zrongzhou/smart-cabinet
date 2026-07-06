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

// Star layer configuration
interface StarLayer {
  count: number;
  sizeRange: [number, number];
  opacityRange: [number, number];
  color: string;
  speedFactor: number;
}

const STAR_LAYERS: StarLayer[] = [
  // Layer 0: 远景微尘 — 基础亮度提升 + 更大尺寸
  { count: 120, sizeRange: [0.18, 0.5], opacityRange: [0.15, 0.38], color: 'rgba(170,185,220,', speedFactor: 0 },
  // Layer 1: 中景星群 — 明显可见的背景星星
  { count: 65, sizeRange: [0.35, 0.8], opacityRange: [0.25, 0.55], color: 'rgba(190,210,245,', speedFactor: 0 },
  // Layer 2: 近景中等亮度 — 清晰可辨
  { count: 30, sizeRange: [0.6, 1.5], opacityRange: [0.4, 0.72], color: 'rgba(218,235,255,', speedFactor: 0 },
  // Layer 3: 亮星 — 带十字光芒，强闪烁
  { count: 12, sizeRange: [1.8, 3.5], opacityRange: [0.6, 1.0], color: 'rgba(255,255,255,', speedFactor: 0.008 },
  // Layer 4: 超亮星 — 最醒目，最慢移动
  { count: 4, sizeRange: [3.2, 5.5], opacityRange: [0.82, 1.0], color: 'rgba(240,248,255,', speedFactor: 0.004 },
];

// ============================================================
// BUBBLE BUTTON — ALWAYS ACTIVE bubble animation
// ============================================================
function BubbleButton({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; size: number; delay: number; duration: number; color: string }[]>([]);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const colors = primary
      ? ['rgba(167,139,250,0.6)', 'rgba(96,165,250,0.6)', 'rgba(139,92,246,0.5)', 'rgba(192,132,252,0.5)']
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
      className="group relative inline-flex items-center justify-center px-9 py-3.5 font-semibold rounded-full text-base text-white overflow-visible cursor-pointer"
      style={{
        background: primary
          ? 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(59,130,246,0.20) 50%, rgba(139,92,246,0.25) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        border: `1px solid ${primary ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.18)'}`,
        backdropFilter: 'blur(16px)',
        boxShadow: `
          0 0 20px ${primary ? 'rgba(99,102,241,0.15)' : 'rgba(180,200,255,0.05)'},
          0 0 40px ${primary ? 'rgba(59,130,246,0.08)' : 'transparent'},
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
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,${hovered ? 0.85 : 0.55}), ${b.color}${hovered ? '' : '00'} transparent)`,
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
            primary ? 'rgba(129,140,248,0.18)' : 'rgba(255,255,255,0.10)'
          } 0%, transparent 70%)`,
          transform: hovered ? 'scale(1)' : 'scale(0.5)',
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* Glow border pulse */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `2px solid ${primary ? 'rgba(129,140,248,0)' : 'rgba(255,255,255,0)'}`,
          boxShadow: hovered
            ? `0 0 20px ${primary ? 'rgba(99,102,241,0.25)' : 'rgba(200,220,255,0.12)'} inset, 0 0 30px ${primary ? 'rgba(99,102,241,0.18)' : 'rgba(180,200,255,0.10)'}`
            : `0 0 8px ${primary ? 'rgba(99,102,241,0.08)' : 'rgba(180,200,255,0.04)'} inset`,
          transition: 'all 0.4s ease',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
        }}
      />

      {/* Text content */}
      <span className="relative z-10" style={{
        textShadow: hovered
          ? `0 0 14px ${primary ? 'rgba(167,139,250,0.55)' : 'rgba(255,255,255,0.45)'}, 0 1px 3px rgba(0,0,0,0.5)`
          : `0 0 10px ${primary ? 'rgba(147,197,253,0.25)' : 'rgba(255,255,255,0.2)'}, 0 1px 3px rgba(0,0,0,0.5)`,
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
            boxShadow: `0 0 ${hovered ? 8 : 4}px rgba(167,139,250,${hovered ? 0.6 : 0.3})`,
            animation: `sparkle-float-always ${hovered ? 1.2 : 2 + i * 0.4}s ease-out infinite`,
            animationDelay: `${i * (hovered ? 0.15 : 0.4)}s`,
          }}
        />
      ))}
    </a>
  );
}

// Pulsing Light Dots Divider
function PulsingLightDotsDivider() {
  return (
    <div className="w-full max-w-md mx-auto relative h-[1px] my-6 overflow-hidden">
      <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
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
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 10, height: 10,
          background: 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(167,139,250,0.5), transparent)',
          boxShadow: '0 0 8px rgba(167,139,250,0.6), 0 0 16px rgba(139,92,246,0.2), 0 0 28px rgba(99,102,241,0.1)',
          animation: 'light-head-travel 3s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 80, height: 1.5,
          background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.2), rgba(139,92,246,0.35), rgba(96,165,250,0.2), transparent)',
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
      'rgba(167,139,250,', 'rgba(96,165,250,', 'rgba(52,211,153,',
      'rgba(251,207,232,', 'rgba(255,255,255,',
      'rgba(129,140,248,', 'rgba(56,189,248,',
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
      // 呼吸式脉动：更明显的明暗周期（4秒一周期）
      const breathe = 0.06 + Math.sin(Date.now() * 0.0015) * 0.035;
      ctx.globalAlpha = breathe;
      ctx.translate(canvas.width * 0.5, canvas.height * 0.45);
      ctx.rotate(-0.35);
      ctx.scale(1, 0.22);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, canvas.width * 0.55);
      grad.addColorStop(0, 'rgba(210, 215, 240, 0.92)');
      grad.addColorStop(0.35, 'rgba(195, 205, 235, 0.55)');
      grad.addColorStop(0.7, 'rgba(170, 185, 220, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
      ctx.restore();
    };

    const drawNebulae = () => {
      const t = Date.now() * 0.00005;
      // Nebula 1: 紫色星云 — 大幅提亮，肉眼可见的紫雾
      const g1 = ctx.createRadialGradient(
        canvas.width * 0.12 + Math.sin(t) * 25,
        canvas.height * 0.18 + Math.cos(t * 0.7) * 18, 0,
        canvas.width * 0.12, canvas.height * 0.18, canvas.width * 0.36
      );
      g1.addColorStop(0, `rgba(120, 100, 230, ${0.22 + Math.sin(t * 1.3) * 0.07})`);
      g1.addColorStop(0.4, `rgba(99, 102, 241, ${0.12 + Math.cos(t * 0.8) * 0.04})`);
      g1.addColorStop(0.7, `rgba(79, 70, 200, ${0.05 + Math.sin(t * 0.5) * 0.02})`);
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Nebula 2: 青色星云 — 稍提亮
      const pulse2 = 0.08 + Math.sin(t * 0.9) * 0.04;
      const g2 = ctx.createRadialGradient(
        canvas.width * 0.82 + Math.cos(t * 0.8) * 25,
        canvas.height * 0.78 + Math.sin(t * 1.1) * 18, 0,
        canvas.width * 0.82, canvas.height * 0.78, canvas.width * 0.30
      );
      g2.addColorStop(0, `rgba(6, 182, 212, ${pulse2})`);
      g2.addColorStop(0.5, `rgba(6, 182, 212, ${pulse2 * 0.4})`);
      g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Nebula 3: 紫罗兰暖光 — 提亮，与Nebula 1形成双紫呼应
      const g3 = ctx.createRadialGradient(
        canvas.width * 0.58 + Math.sin(t * 0.6) * 30,
        canvas.height * 0.52 + Math.cos(t * 1.4) * 20, 0,
        canvas.width * 0.58, canvas.height * 0.52, canvas.width * 0.30
      );
      g3.addColorStop(0, `rgba(139, 92, 246, ${0.11 + Math.sin(t * 1.1) * 0.04})`);
      g3.addColorStop(0.5, `rgba(124, 85, 235, ${0.06 + Math.cos(t * 0.7) * 0.025})`);
      g3.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Nebula 4: 底部淡紫弥漫 — 填补底部暗区
      const g4 = ctx.createRadialGradient(
        canvas.width * 0.50,
        canvas.height * 0.88, 0,
        canvas.width * 0.50, canvas.height * 0.88, canvas.width * 0.45
      );
      g4.addColorStop(0, `rgba(80, 60, 180, ${0.06 + Math.sin(t * 0.6) * 0.02})`);
      g4.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g4;
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
          // 亮星：强闪烁 + 偶发闪光（breathing burst）
          const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
          const flash = Math.pow(Math.max(0, twinkle), 4); // 更尖锐的闪光峰
          const breathe = Math.sin(time * star.twinkleSpeed * 0.37 + star.twinkleOffset * 1.7); // 慢呼吸
          twinkleFactor = 0.45 + ((twinkle + 1) * 0.18) + flash * 0.45 + breathe * 0.12;
        } else {
          // 普通星：深呼吸——从很暗到很亮，明显起伏
          const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
          const deepBreath = Math.sin(time * star.twinkleSpeed * 0.25 + star.twinkleOffset * 2.3); // 慢周期深呼吸
          // 呼吸范围：0.35 ~ 1.35（允许短暂超亮）
          twinkleFactor = 0.5 + ((twinkle + 1) * 0.25) + deepBreath * 0.2;
        }
        const currentOpacity = Math.min(1, Math.max(0.03, star.baseOpacity * twinkleFactor));

        if (star.layer >= 3 && currentOpacity > 0.35 && star.size > 1.5) {
          // 更大更亮的光晕——营造"星星在呼吸发光"的感觉
          const glowSize = star.size * (5 + star.layer * 2);
          const glowGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
          glowGrad.addColorStop(0, `rgba(200, 225, 255, ${currentOpacity * 0.28})`);
          glowGrad.addColorStop(0.25, `rgba(160, 200, 245, ${currentOpacity * 0.14})`);
          glowGrad.addColorStop(0.55, `rgba(120, 170, 230, ${currentOpacity * 0.06})`);
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

      // Shooting stars
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

  const statColors = [
    ['#c084fc', '#818cf8', '#38bdf8'],
    ['#34d399', '#38bdf8', '#a78bfa'],
    ['#fb923c', '#f472b6', '#818cf8'],
    ['#60a5fa', '#a78bfa', '#818cf8'],
  ];

  return (
    <section
      className="homepage-starry relative min-h-[75vh] flex items-center justify-center overflow-hidden"
      style={{ minHeight: '75vh' }}
    >
      {/* Multi-layer deep space gradient — 紫调提亮 */}
      <div className="absolute inset-0 z-0" style={{
        background: `radial-gradient(ellipse at 50% 32%, rgba(30, 42, 90, 0.55) 0%, transparent 58%),
                   radial-gradient(ellipse at 12% 82%, rgba(55, 38, 115, 0.40) 0%, transparent 45%),
                   radial-gradient(ellipse at 88% 12%, rgba(32, 55, 95, 0.35) 0%, transparent 45%),
                   linear-gradient(178deg, #050312 0%, #0a0c22 14%, #101838 28%, #151e48 44%, #121c40 60%, #0c1632 78%, #080d1e 92%, #040610 100%)`,
      }} />

      {/* Star field canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" style={{ width: '100%', height: '100%' }} />

      {/* Vignette for depth focus — 减弱暗角，让紫色星云透出来 */}
      <div className="absolute inset-0 z-[1]" style={{
        background: `radial-gradient(ellipse 70% 52% at 50% 40%, transparent 0%, rgba(4, 6, 18, 0.30) 58%, rgba(4, 6, 18, 0.55) 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Ambient light orbs behind content — 提亮紫色光晕 */}
      <div className="absolute top-[8%] left-[3%] w-[450px] h-[450px] rounded-full blur-[130px] z-0"
        style={{ backgroundColor: 'rgba(59, 130, 246, 0.14)' }} />
      <div className="absolute bottom-[12%] right-[3%] w-[350px] h-[350px] rounded-full blur-[110px] z-0"
        style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)' }} />
      <div className="absolute top-[45%] left-[50%] -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[120px] z-0"
        style={{ backgroundColor: 'rgba(99, 102, 241, 0.06)' }} />

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

            {/* Title */}
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
            className="flex flex-wrap justify-center gap-8 md:gap-14 max-w-3xl mx-auto pt-4"
          >
            {[
              { number: '11+', labelKey: 'hero.statExperience' },
              { number: '10+', labelKey: 'hero.statModels' },
              { number: '60+', labelKey: 'hero.statCountries' },
              { number: '800+', labelKey: 'hero.statClients' },
            ].map((stat, i) => (
              <div key={i} className="text-center relative z-10">
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
                  >{['✦', '✧', '◇', '❖'][i]}</span>
                  {statsVisible ? <CountUp end={stat.number} /> : stat.number}
                </div>
                <div className="text-xs font-medium opacity-40 transition-opacity duration-500 hover:opacity-70"
                  style={{ color: '#94a3b8', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
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

        /* ===== STAT COLOR CYCLING ===== */
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
        @keyframes stat-color-shift-3 {
          0%, 33%   { color: #ffffff; text-shadow: 0 0 16px rgba(96,165,250,0.4), 0 0 32px rgba(167,139,250,0.2), 0 2px 6px rgba(0,0,0,0.6); }
          34%, 66%  { color: #e0e7ff; text-shadow: 0 0 16px rgba(167,139,250,0.5), 0 0 32px rgba(129,140,248,0.2), 0 2px 6px rgba(0,0,0,0.6); }
          67%, 100% { color: #f0f9ff; text-shadow: 0 0 16px rgba(56,189,248,0.5), 0 0 32px rgba(96,165,250,0.2), 0 2px 6px rgba(0,0,0,0.6); }
        }
      `}</style>
    </section>
  );
}
