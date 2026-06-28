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

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (numericEnd - startValue) * eased);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 300);

    return () => clearTimeout(timer);
  }, [end, duration, isAnimating]);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  return <span>{count}{end.replace(/\d/g, '')}</span>;
}

// Star layer configuration for depth effect
interface StarLayer {
  count: number;        // number of stars in this layer
  sizeRange: [number, number];   // min/max size
  speedRange: [number, number];  // min/max velocity
  opacityRange: [number, number]; // min/max base opacity
  color: string;         // fill color
  glow?: boolean;        // whether to add glow effect
}

const STAR_LAYERS: StarLayer[] = [
  // Layer 0: Distant galaxy background - tiny, dim, numerous
  { count: 350, sizeRange: [0.3, 0.8], speedRange: [0.01, 0.03], opacityRange: [0.15, 0.4], color: 'rgba(180,190,220,' },
  // Layer 1: Far stars - small, visible
  { count: 180, sizeRange: [0.5, 1.2], speedRange: [0.02, 0.06], opacityRange: [0.3, 0.6], color: 'rgba(200,215,255,' },
  // Layer 2: Mid-distance stars - medium brightness
  { count: 100, sizeRange: [1.0, 2.0], speedRange: [0.04, 0.12], opacityRange: [0.4, 0.8], color: 'rgba(224,242,254,' },
  // Layer 3: Close bright stars - large, bright, colored tints
  { count: 50, sizeRange: [1.8, 3.5], speedRange: [0.08, 0.22], opacityRange: [0.6, 1.0], color: 'rgba(255,255,255,', glow: true },
  // Layer 4: Foreground dust - very close, fastest
  { count: 18, sizeRange: [2.5, 5.0], speedRange: [0.12, 0.32], opacityRange: [0.4, 0.7], color: 'rgba(147,197,253,' },
];

export default function HeroSection() {
  const { locale, t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsVisible(true);

    // Intersection observer for stats
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Multi-layer depth star field with parallax
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    interface Star {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseOpacity: number;
      color: string;
      twinkleOffset: number;
      twinkleSpeed: number;
      layer: number;
      hasGlow: boolean;
      hue?: number; // for colored tint on bright stars
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
          const speed = layer.speedRange[0] + Math.random() * (layer.speedRange[1] - layer.speedRange[0]);
          const angle = Math.random() * Math.PI * 2;
          const hue = layer.glow ? (Math.random() > 0.7 ? 200 + Math.random() * 60 : undefined) : undefined; // blue-ish tints

          stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            baseOpacity: layer.opacityRange[0] + Math.random() * (layer.opacityRange[1] - layer.opacityRange[0]),
            color: layer.color,
            twinkleOffset: Math.random() * Math.PI * 2,
            twinkleSpeed: 1.5 + Math.random() * 2.5,
            layer: layerIndex,
            hasGlow: layer.glow || false,
            hue,
          });
        }
      });
    };

    // Pre-draw nebula clouds (visible, atmospheric)
    const drawNebulae = (time: number) => {
      // Purple-blue nebula top-left (more visible)
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.15, canvas.height * 0.2, 0,
        canvas.width * 0.15, canvas.height * 0.2, canvas.width * 0.35
      );
      gradient1.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
      gradient1.addColorStop(0.5, 'rgba(139, 92, 246, 0.06)');
      gradient1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyan-blue nebula bottom-right (more visible)
      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.85, canvas.height * 0.75, 0,
        canvas.width * 0.85, canvas.height * 0.75, canvas.width * 0.3
      );
      gradient2.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      gradient2.addColorStop(0.5, 'rgba(59, 130, 246, 0.04)');
      gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.height, canvas.height);

      // Milky way band (more visible diagonal stripe)
      ctx.save();
      ctx.globalAlpha = 0.04 + Math.sin(time * 0.1) * 0.015;
      ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
      ctx.rotate(-0.4); // tilted band
      ctx.scale(1, 0.25); // flatten to create band shape
      const milkyWayGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, canvas.width * 0.6);
      milkyWayGrad.addColorStop(0, 'rgba(220, 220, 255, 0.9)');
      milkyWayGrad.addColorStop(0.3, 'rgba(200, 210, 255, 0.5)');
      milkyWayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = milkyWayGrad;
      ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
      ctx.restore();
    };

    const draw = () => {
      const time = Date.now() * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw static nebulae (very subtle)
      drawNebulae(time);

      // Sort by layer so distant stars are drawn first (painter's algorithm)
      const sortedStars = [...stars].sort((a, b) => a.layer - b.layer);

      sortedStars.forEach((star) => {
        // Update position - closer layers move faster (parallax)
        const parallaxFactor = 0.5 + star.layer * 0.25;
        star.x += star.vx * parallaxFactor;
        star.y += star.vy * parallaxFactor;

        // Wrap around edges
        if (star.x < -10) star.x = canvas.width + 10;
        if (star.x > canvas.width + 10) star.x = -10;
        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;

        // Twinkle effect - each star twinkles independently
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        const currentOpacity = Math.min(1.0, star.baseOpacity * twinkle);

        // Glow effect for bright close stars
        if (star.hasGlow && currentOpacity > 0.6 && star.size > 2) {
          const glowGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
          if (star.hue !== undefined) {
            glowGrad.addColorStop(0, `hsla(${star.hue}, 80%, 70%, ${currentOpacity * 0.15})`);
          } else {
            glowGrad.addColorStop(0, `rgba(200, 220, 255, ${currentOpacity * 0.12})`);
          }
          glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw the star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

        if (star.hue !== undefined && currentOpacity > 0.7) {
          // Colored bright star
          ctx.fillStyle = `hsla(${star.hue}, 85%, 75%, ${currentOpacity})`;
        } else {
          ctx.fillStyle = star.color + currentOpacity + ')';
        }
        ctx.fill();

        // Cross-shaped sparkle for the brightest stars
        if (star.hasGlow && star.size > 2.2 && currentOpacity > 0.75) {
          const sparkleLen = star.size * 2;
          const sparkleOpacity = (currentOpacity - 0.75) * 2.5; // 0 to ~0.6
          ctx.strokeStyle = `rgba(255, 255, 255, ${sparkleOpacity * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - sparkleLen, star.y);
          ctx.lineTo(star.x + sparkleLen, star.y);
          ctx.moveTo(star.x, star.y - sparkleLen);
          ctx.lineTo(star.x, star.y + sparkleLen);
          ctx.stroke();
        }
      });

      // Occasional shooting star (4% chance per frame - more frequent)
      if (Math.random() < 0.015) {
        const sx = Math.random() * canvas.width * 0.8;
        const sy = Math.random() * canvas.height * 0.3;
        const slen = 60 + Math.random() * 100;
        const sangle = Math.PI / 4 + Math.random() * 0.3;

        const shootGrad = ctx.createLinearGradient(sx, sy, sx + Math.cos(sangle) * slen, sy + Math.sin(sangle) * slen);
        shootGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        shootGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
        shootGrad.addColorStop(1, 'rgba(200, 220, 255, 0)');

        ctx.strokeStyle = shootGrad;
        ctx.lineWidth = 1.5;
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

    window.addEventListener('resize', () => {
      resize();
      createStars();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Framer Motion variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section
      className="homepage-starry relative min-h-[70vh] flex items-center justify-center overflow-hidden"
      style={{ minHeight: '70vh' }}
    >
      {/* Deep space background - multi-stop gradient for depth */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, rgba(30, 41, 82, 0.4) 0%, transparent 65%),
                       radial-gradient(ellipse at 20% 80%, rgba(55, 48, 107, 0.2) 0%, transparent 50%),
                       radial-gradient(ellipse at 80% 20%, rgba(30, 64, 95, 0.25) 0%, transparent 50%),
                       linear-gradient(175deg, #03010a 0%, #070b1c 18%, #0c1229 36%, #101a38 56%, #0b1530 76%, #060e1f 100%)`,
        }}
      />

      {/* Particle animation canvas - multi-layer depth starfield */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Atmospheric fog overlay - creates depth separation between bg and text */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 45%, transparent 0%, rgba(3, 5, 15, 0.35) 70%, rgba(3, 5, 15, 0.55) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Ambient glow orbs behind content - enhanced visibility */}
      <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full blur-[120px] z-0" style={{ backgroundColor: 'rgba(59, 130, 246, 0.14)' }} />
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full blur-[100px] z-0" style={{ backgroundColor: 'rgba(168, 85, 247, 0.10)' }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-[100px] z-0" style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)' }} />

      {/* Content - elevated with glass-like backdrop for foreground pop */}
      <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          {/* Title - Badge integrated inline */}
          <motion.div variants={fadeInUp} className="mb-5">
            {/* Badge integrated as part of title block */}
            <div className="inline-flex items-center space-x-2 backdrop-blur-md border rounded-full px-4 py-1.5 mb-4"
              style={{
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                borderColor: 'rgba(96, 165, 250, 0.25)',
              }}
            >
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 6px rgba(74, 222, 128, 0.5)' }} />
              <span className="text-xs font-medium tracking-wide" style={{ color: '#93c5fd' }}>{t('hero.badge')}</span>
            </div>

            <motion.h1
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.15]"
              style={{
                color: '#ffffff',
                textShadow: '0 0 40px rgba(59, 130, 246, 0.18), 0 2px 16px rgba(0, 0, 0, 0.5)',
              }}
            >
              {t('hero.title')}
            </motion.h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg lg:text-xl mb-4 font-medium max-w-2xl mx-auto"
            style={{
              color: '#93c5fd',
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="text-sm md:text-base mb-10 max-w-2xl mx-auto leading-relaxed font-normal opacity-90"
            style={{
              color: '#cbd5e1',
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.3)',
            }}
          >
            {t('hero.description')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
          >
            <a
              href={`/${locale}/products`}
              className="group inline-flex items-center justify-center px-8 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-base"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.1)',
              }}
            >
              {t('hero.ctaProducts')}
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href={`/${locale}/contact`}
              className="group inline-flex items-center justify-center px-8 py-3 font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 text-base text-white border-2 border-white/30"
              style={{
                backdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              {t('hero.ctaContact')}
            </a>
          </motion.div>

          {/* Stats - integrated horizontal bar, not floating cards */}
          <motion.div
            ref={statsRef}
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-8 md:gap-14 max-w-2xl mx-auto mt-14 pt-8"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {[
              { number: '10+', labelKey: 'hero.statModels', icon: '◆' },
              { number: '60+', labelKey: 'hero.statCountries', icon: '◇' },
              { number: '500+', labelKey: 'hero.statClients', icon: '○' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl md:text-4xl font-bold mb-1 relative inline-block" style={{
                  color: '#ffffff',
                  textShadow: '0 0 25px rgba(125, 211, 252, 0.35), 0 0 50px rgba(59, 130, 246, 0.15)',
                }}>
                  <span className="text-sm mr-1.5 opacity-40 group-hover:opacity-70 transition-opacity">{stat.icon}</span>
                  {statsVisible ? <CountUp end={stat.number} /> : stat.number}
                </div>
                <div className="text-xs md:text-sm font-medium opacity-60" style={{ color: '#94a3b8' }}>{t(stat.labelKey)}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* CSS for pulse glow animation */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 4px 24px rgba(139, 92, 246, 0.7); }
        }
      `}</style>
    </section>
  );
}
