'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from '@/lib/i18n';
import { motion, useSpring } from 'framer-motion';

// Count-up animation component
function CountUp({ end, duration = 2 }: { end: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const springValue = useSpring(0, { 
    stiffness: 50, 
    damping: 10 
  });

  useEffect(() => {
    const numericEnd = parseInt(end.replace(/\D/g, '')) || 0;
    const timer = setTimeout(() => {
      springValue.set(numericEnd);
    }, 300);
    
    const unsubscribe = springValue.on('change', (value) => {
      setCount(Math.floor(value));
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [end, springValue]);

  return <span>{count}{end.replace(/\d/g, '')}</span>;
}

export default function HeroSection() {
  const { locale, t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

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

  // Particle options
  const particlesOptions = {
    particles: {
      number: { value: 80, density: { enable: true } },
      color: { value: ['#ffffff', '#f6ad55', '#63b3ed'] },
      opacity: { value: 0.3, random: true },
      size: { value: 2, random: true },
      move: {
        enable: true,
        speed: 0.5,
        direction: 'none' as const,
        random: true,
        straight: false,
      },
      links: {
        enable: true,
        distance: 150,
        color: '#ffffff',
        opacity: 0.1,
        width: 1,
      },
    },
    detectRetina: true,
  };

  // Particles init
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  useEffect(() => {
    // Initialize particles
    particlesInit;
  }, [particlesInit]);

  return (
    <section 
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1a365d 50%, #2a4a7f 100%)',
        minHeight: '80vh'
      }}
    >
      {/* Particle Animation Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          id="tsparticles"
          options={particlesOptions}
        />
      </div>

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
              onMouseEnter={(e) => {
                e.currentTarget.style.animation = 'pulse-glow 2s ease-in-out infinite';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animation = 'none';
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
