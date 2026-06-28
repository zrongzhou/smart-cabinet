'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Package, ChevronDown } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

export default function HeroSection() {
  const { locale, t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-40 right-20 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '3s' }} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className={`relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8 hover:bg-white/15 transition-colors duration-300">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-blue-100">{t('hero.badge')}</span>
        </div>

        {/* Icon + Title */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-xl animate-pulse" />
            <Package className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-blue-300" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-extrabold tracking-tight ml-4 bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
            {t('hero.title')}
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl lg:text-3xl mb-6 text-blue-200 font-light tracking-wide">
          {t('hero.subtitle')}
        </p>

        {/* Description */}
        <p className="text-base sm:text-lg mb-12 text-blue-300/80 max-w-2xl mx-auto leading-relaxed">
          {t('hero.description')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`/${locale}/products`}
            className="group inline-flex items-center justify-center px-10 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1"
          >
            {t('hero.ctaProducts')}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href={`/${locale}/contact`}
            className="group inline-flex items-center justify-center px-10 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
          >
            {t('hero.ctaContact')}
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-14 px-4">
          {[
            { number: '10+', labelKey: 'hero.statModels' },
            { number: '60+', labelKey: 'hero.statCountries' },
            { number: '500+', labelKey: 'hero.statClients' },
          ].map((stat, i) => (
            <div key={i} className="text-center flex-shrink-0">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.number}</div>
              <div className="text-xs sm:text-sm text-blue-300">{t(stat.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/40" />
      </div>
    </section>
  );
}
