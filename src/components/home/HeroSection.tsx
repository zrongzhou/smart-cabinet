'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/i18n';

export default function HeroSection() {
  const { locale, t } = useLocale();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Industrial background overlay with grid texture */}
      <div className="absolute inset-0 opacity-5 z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Substantial glow orbs - B2B industrial feel */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl" />

      {/* Content */}
      <div className={`relative z-10 text-center text-white px-6 max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

        {/* Badge */}
        <div className="inline-flex items-center space-x-3 bg-blue-600/30 backdrop-blur-md border border-blue-400/40 rounded-full px-6 py-2.5 mb-8 hover:bg-blue-600/40 transition-colors duration-300">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
          <span className="text-sm font-bold text-blue-100 tracking-wide">{t('hero.badge')}</span>
        </div>

        {/* Title - bold and substantial */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
          {t('hero.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl lg:text-2xl mb-6 text-gray-300 font-medium max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>

        {/* Description */}
        <p className="text-base md:text-lg mb-12 text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
          {t('hero.description')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
          <a
            href={`/${locale}/products`}
            className="group inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:-translate-y-1 text-lg"
          >
            {t('hero.ctaProducts')}
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href={`/${locale}/contact`}
            className="group inline-flex items-center justify-center px-10 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 text-lg"
          >
            {t('hero.ctaContact')}
          </a>
        </div>

        {/* Stats - bold numbers with backdrop */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { number: '10+', labelKey: 'hero.statModels' },
            { number: '60+', labelKey: 'hero.statCountries' },
            { number: '500+', labelKey: 'hero.statClients' },
          ].map((stat, i) => (
            <div key={i} className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-sm text-gray-400 font-medium">{t(stat.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
