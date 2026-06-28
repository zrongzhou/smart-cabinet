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

// Star layer configuration - realistic night sky with depth
interface StarLayer {
  count: number;
  sizeRange: [number, number];
  opacityRange: [number, number];
  color: string;
  // Most stars are STATIC; only the closest layer has tiny drift
  speedFactor: number; // 0 = completely static
}

const STAR_LAYERS: StarLayer[] = [
  // Layer 0: Deep background - tiny, dim, numerous, STATIC (the "sea of distant stars")
  { count: 120, sizeRange: [0.15, 0.4], opacityRange: [0.08, 0.25], color: 'rgba(180,190,220,', speedFactor: 0 },
  // Layer 1: Far stars - small, dim, STATIC (twinkle only)
  { count: 60, sizeRange: [0.3, 0.7], opacityRange: [0.15, 0.4], color: 'rgba(200,215,255,', speedFactor: 0 },
  // Layer 2: Mid-distance - medium, slightly brighter, STATIC
  { count: 30, sizeRange: [0.6, 1.3], opacityRange: [0.3, 0.6], color: 'rgba(224,242,254,', speedFactor: 0 },
  // Layer 3: Close bright stars - larger, bright, VERY slow drift
  { count: 12, sizeRange: [1.2, 2.5], opacityRange: [0.5, 0.95], color: 'rgba(255,255,255,', speedFactor: 0.015 },
  // Layer 4: Foreground "diamond" stars - brightest, cross-shaped sparkle, nearly static
  { count: 4, sizeRange: [2.0, 3.5], opacityRange: [0.7, 1.0], color: 'rgba(255,255,255,', speedFactor: 0.008 },
];

export default function HeroSection() {
  const { locale, t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => setIsVisible(true), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    interface Star {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      baseOpacity: number;
      color: string;
      twinkleOffset: number;
      twinkleSpeed: number;
      layer: number;
      hasCross: boolean;
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

          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            baseOpacity: layer.opacityRange[0] + Math.random() * (layer.opacityRange[1] - layer.opacityRange[0]),
            color: layer.color,
            twinkleOffset: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.8 + Math.random() * 2.0,
            layer: layerIndex,
            hasCross: layerIndex >= 4 && size > 1.8,
          });
        }
      });
    };

    // Draw static Milky Way background (very subtle)
    const drawMilkyWay = () => {
      ctx.save();
      ctx.globalAlpha = 0.035 + Math.sin(Date.now() * 0.00008) * 0.01;
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

    // Draw nebula hints (very subtle colored clouds)
    const drawNebulae = () => {
      const t = Date.now() * 0.00005;

      // Purple-blue top-left
      const g1 = ctx.createRadialGradient(
        canvas.width * 0.12 + Math.sin(t) * 20,
        canvas.height * 0.18 + Math.cos(t * 0.7) * 15, 0,
        canvas.width * 0.12, canvas.height * 0.18, canvas.width * 0.3
      );
      g1.addColorStop(0, `rgba(99, 102, 241, ${0.06 + Math.sin(t * 1.3) * 0.02})`);
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyan bottom-right
      const g2 = ctx.createRadialGradient(
        canvas.width * 0.82 + Math.cos(t * 0.8) * 20,
        canvas.height * 0.78 + Math.sin(t * 1.1) * 15, 0,
        canvas.width * 0.82, canvas.height * 0.78, canvas.width * 0.28
      );
      g2.addColorStop(0, `rgba(6, 182, 212, ${0.04 + Math.cos(t * 0.9) * 0.015})`);
      g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      const time = Date.now() * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Static deep space background elements
      drawNebulae();
      drawMilkyWay();

      // Draw all stars (sorted by layer for painter's algorithm)
      const sorted = [...stars].sort((a, b) => a.layer - b.layer);

      sorted.forEach((star) => {
        // Movement: only closest layers drift, very slowly
        if (STAR_LAYERS[star.layer].speedFactor > 0) {
          star.x += star.vx * STAR_LAYERS[star.layer].speedFactor;
          star.y += star.vy * STAR_LAYERS[star.layer].speedFactor;
          // Wrap around
          if (star.x < -5) star.x = canvas.width + 5;
          if (star.x > canvas.width + 5) star.x = -5;
          if (star.y < -5) star.y = canvas.height + 5;
          if (star.y > canvas.height + 5) star.y = -5;
        }

        // Twinkle: natural-looking sine wave brightness variation
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        // Use asymmetric wave so stars spend more time at peak brightness than dim
        const twinkleFactor = 0.65 + ((twinkle + 1) * 0.175) + (Math.pow(Math.max(0, twinkle), 2) * 0.15);
        const currentOpacity = Math.min(1, Math.max(0.04, star.baseOpacity * twinkleFactor));

        // Glow halo for bright close stars (layers 3-4)
        if (star.layer >= 3 && currentOpacity > 0.5 && star.size > 1.2) {
          const glowSize = star.size * (3.5 + star.layer);
          const glowGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
          glowGrad.addColorStop(0, `rgba(180, 200, 255, ${currentOpacity * 0.12})`);
          glowGrad.addColorStop(0.4, `rgba(140, 170, 220, ${currentOpacity * 0.05})`);
          glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color + currentOpacity + ')';
        ctx.fill();

        // Cross-shaped diffraction spikes on the brightest foreground stars
        if (star.hasCross && currentOpacity > 0.72) {
          const spikeLen = star.size * (2.5 + (currentOpacity - 0.72) * 8);
          const spikeOpacity = (currentOpacity - 0.72) * 2.8;
          ctx.strokeStyle = `rgba(220, 235, 255, ${spikeOpacity * 0.35})`;
          ctx.lineWidth = 0.4;
          ctx.beginPath();
          ctx.moveTo(star.x - spikeLen, star.y);
          ctx.lineTo(star.x + spikeLen, star.y);
          ctx.moveTo(star.x, star.y - spikeLen);
          ctx.lineTo(star.x, star.y + spikeLen);
          ctx.stroke();
        }
      });

      // Rare shooting star (0.8% chance per frame = roughly every 2 seconds)
      if (Math.random() < 0.008) {
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

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Framer Motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
  };
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.18 } }
  };

  return (
    <section
      className="homepage-starry relative min-h-[75vh] flex items-center justify-center overflow-hidden"
      style={{ minHeight: '75vh' }}
    >
      {/* Multi-layer deep space gradient background */}
      <div className="absolute inset-0 z-0" style={{
        background: `radial-gradient(ellipse at 50% 35%, rgba(25, 33, 68, 0.35) 0%, transparent 60%),
                   radial-gradient(ellipse at 15% 85%, rgba(45, 35, 90, 0.18) 0%, transparent 45%),
                   radial-gradient(ellipse at 85% 15%, rgba(25, 50, 85, 0.2) 0%, transparent 45%),
                   linear-gradient(178deg, #02010a 0%, #060b1a 16%, #0a1028 32%, #0d1535 48%, #09142c 66%, #050e21 84%, #020814 100%)`,
      }} />

      {/* Star field canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" style={{ width: '100%', height: '100%' }} />

      {/* Subtle vignette for depth focus */}
      <div className="absolute inset-0 z-[1]" style={{
        background: `radial-gradient(ellipse 75% 55% at 50% 42%, transparent 0%, rgba(2, 4, 12, 0.3) 65%, rgba(2, 4, 12, 0.52) 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Ambient light orbs behind content */}
      <div className="absolute top-[8%] left-[3%] w-[450px] h-[450px] rounded-full blur-[130px] z-0"
        style={{ backgroundColor: 'rgba(59, 130, 246, 0.10)' }} />
      <div className="absolute bottom-[12%] right-[3%] w-[350px] h-[350px] rounded-full blur-[110px] z-0"
        style={{ backgroundColor: 'rgba(139, 92, 246, 0.07)' }} />

      {/* Content - text with star-like glow */}
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

            {/* Title - STAR GLOW EFFECT */}
            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.15] hero-title-glow"
              style={{ color: '#ffffff' }}
            >
              {t('hero.title')}
            </motion.h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p variants={fadeInUp}
            className="text-base md:text-lg lg:text-xl mb-4 font-medium max-w-2xl mx-auto subtitle-glow"
            style={{ color: '#bfdbfe', textShadow: '0 0 20px rgba(147, 197, 253, 0.15), 0 2px 12px rgba(0, 0, 0, 0.45)' }}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Description */}
          <motion.p variants={fadeInUp}
            className="text-sm md:text-base mb-10 max-w-2xl mx-auto leading-relaxed font-normal opacity-85"
            style={{ color: '#cbd5e1', textShadow: '0 1px 8px rgba(0, 0, 0, 0.35)' }}
          >
            {t('hero.description')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href={`/${locale}/products`}
              className="group inline-flex items-center justify-center px-8 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:-translate-y-1 text-base cta-primary-btn"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                boxShadow: '0 4px 18px rgba(59, 130, 246, 0.35), 0 0 28px rgba(99, 102, 241, 0.12)',
              }}
            >
              {t('hero.ctaProducts')}
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a href={`/${locale}/contact`}
              className="group inline-flex items-center justify-center px-8 py-3 font-semibold rounded-lg hover:bg-white/[0.08] transition-all duration-300 text-base text-white border border-white/20"
              style={{ backdropFilter: 'blur(10px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              {t('hero.ctaContact')}
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div ref={statsRef} variants={fadeInUp}
            className="flex flex-wrap justify-center gap-8 md:gap-14 max-w-2xl mx-auto mt-10 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {[
              { number: '10+', labelKey: 'hero.statModels', icon: '◆' },
              { number: '60+', labelKey: 'hero.statCountries', icon: '◇' },
              { number: '500+', labelKey: 'hero.statClients', icon: '○' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold mb-1 stat-number-glow inline-block" style={{ color: '#ffffff' }}>
                  <span className="text-sm mr-1.5 opacity-30 group-hover:opacity-50 transition-opacity">{stat.icon}</span>
                  {statsVisible ? <CountUp end={stat.number} /> : stat.number}
                </div>
                <div className="text-xs md:text-sm font-medium opacity-50" style={{ color: '#94a3b8' }}>{t(stat.labelKey)}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* CSS Animations: title glow + stat pulse */}
      <style>{`
        @keyframes hero-title-glow {
          0%, 100% { text-shadow: 0 0 30px rgba(147,197,253,0.12), 0 0 60px rgba(59,130,246,0.08), 0 2px 16px rgba(0,0,0,0.5); }
          50% { text-shadow: 0 0 40px rgba(147,197,253,0.2), 0 0 80px rgba(99,102,241,0.12), 0 2px 16px rgba(0,0,0,0.5); }
        }
        .hero-title-glow { animation: hero-title-glow 4s ease-in-out infinite; }

        @keyframes subtitle-glow {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; text-shadow: 0 0 24px rgba(147,197,253,0.2); }
        }
        .subtitle-glow { animation: subtitle-glow 5s ease-in-out infinite; }

        @keyframes stat-pulse {
          0%, 100% { text-shadow: 0 0 20px rgba(125,211,252,0.2), 0 0 40px rgba(59,130,246,0.1); }
          50% { text-shadow: 0 0 28px rgba(125,211,252,0.35), 0 0 56px rgba(59,130,246,0.15); }
        }
        .stat-number-glow { animation: stat-pulse 3.5s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
