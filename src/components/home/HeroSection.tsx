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

  // Particle animation (pure Canvas, no external library)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ['rgba(255,255,255,', 'rgba(246,173,85,', 'rgba(99,179,237,'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.fill();

        // Draw lines between close particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.1 * (1 - dist / 150)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
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
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1a365d 50%, #2a4a7f 100%)',
        minHeight: '80vh'
      }}
    >
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ opacity: 0.05 }}
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Particle animation canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Glow orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl z-0" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl z-0" style={{ backgroundColor: 'rgba(245, 173, 85, 0.2)' }} />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-7xl mx-auto">
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center space-x-3 backdrop-blur-md border rounded-full px-6 py-2.5 mb-8 hover:bg-white/10 transition-colors duration-300"
            style={{ 
              backgroundColor: 'rgba(37, 99, 235, 0.3)', 
              borderColor: 'rgba(96, 165, 250, 0.4)' 
            }}
          >
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)' }} />
            <span className="text-sm font-bold tracking-wide" style={{ color: '#bfdbfe' }}>{t('hero.badge')}</span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-tight"
            style={{ color: '#ffffff' }}
          >
            {t('hero.title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl lg:text-2xl mb-6 font-medium max-w-2xl mx-auto"
            style={{ color: '#cbd5e0' }}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Description */}
          <motion.p 
            variants={fadeInUp}
            className="text-base md:text-lg mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
            style={{ color: '#cbd5e0' }}
          >
            {t('hero.description')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-5 justify-center mb-16"
          >
            <a
              href={`/${locale}/products`}
              className="group inline-flex items-center justify-center px-10 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-lg"
              style={{ 
                background: 'linear-gradient(135deg, #ed8936 0%, #f6ad55 100%)',
                boxShadow: '0 4px 14px rgba(237, 137, 54, 0.4)',
              }}
            >
              {t('hero.ctaProducts')}
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href={`/${locale}/contact`}
              className="group inline-flex items-center justify-center px-10 py-4 font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 text-lg"
              style={{ 
                borderWidth: '2px', 
                borderColor: 'rgba(255, 255, 255, 0.3)', 
                color: '#ffffff',
                borderStyle: 'solid'
              }}
            >
              {t('hero.ctaContact')}
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div 
            ref={statsRef}
            variants={fadeInUp}
            className="grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { number: '10+', labelKey: 'hero.statModels' },
              { number: '60+', labelKey: 'hero.statCountries' },
              { number: '500+', labelKey: 'hero.statClients' },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="text-center rounded-xl p-6"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="text-4xl font-bold mb-2" style={{ color: '#f6ad55' }}>
                  {statsVisible ? <CountUp end={stat.number} /> : stat.number}
                </div>
                <div className="text-sm font-medium" style={{ color: '#cbd5e0' }}>{t(stat.labelKey)}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* CSS for pulse glow animation */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 4px 14px rgba(237, 137, 54, 0.4); }
          50% { box-shadow: 0 4px 24px rgba(237, 137, 54, 0.7); }
        }
      `}</style>
    </section>
  );
}
