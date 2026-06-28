'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/i18n';
import { fetchUnifiedSettings, SiteSettings } from '@/data/unified-data';

export default function CtaSection() {
  const { locale, t } = useLocale();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await fetchUnifiedSettings();
        setSettings(s);
      } catch (e) {
        console.error('Failed to load site settings:', e);
      }
    }
    loadSettings();
  }, []);

  const contactEmail = settings?.contactEmail || 'sabrina@wstoolcabinet.com';
  const contactPhone = settings?.contactPhone || '+86 156 2216 0659';

  return (
    <section className="relative py-20 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full" />
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-blue-100">{t('cta.badge')}</span>
        </div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">
          {t('cta.readyTitle')}
        </h2>
        <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-blue-100">
          {t('cta.readyDesc')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <a
            href={`/${locale}/contact`}
            className="group inline-flex items-center justify-center px-10 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:-translate-y-1 text-lg"
          >
            {t('cta.button')}
            <svg className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href={`tel:${contactPhone.replace(/\s/g, '')}`}
            className="group inline-flex items-center justify-center px-10 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 text-lg"
          >
            <svg className="mr-3 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 011 .948l.893 7.554a1 1 0 01-.502.998L8.97 10.95a11.012 11.012 0 004.148 4.148l1.42-1.42a1 1 0 01.998-.502l7.554.893a1 1 0 01.948 1V21a2 2 0 01-2 2h-1C9.715 23 3 16.285 3 8V5z" />
            </svg>
            {contactPhone}
          </a>
        </div>

        {/* Contact Info */}
        <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm font-semibold px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white">
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 border border-white/30">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <span>{contactEmail}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/30" />
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 border border-white/30">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 011 .948l.893 7.554a1 1 0 01-.502.998L8.97 10.95a11.012 11.012 0 004.148 4.148l1.42-1.42a1 1 0 01.998-.502l7.554.893a1 1 0 01.948 1V21a2 2 0 01-2 2h-1C9.715 23 3 16.285 3 8V5z" />
              </svg>
            </span>
            <span>{contactPhone.replace(/^\s*/, '')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
