'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Phone, Mail } from 'lucide-react';
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
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 2px 2px, white 1px, transparent 0)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
      
      {/* Floating elements */}
      <div className="absolute top-20 right-20 w-20 h-20 border-2 border-white/10 rotate-45 rounded-2xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-16 h-16 border-2 border-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-10 hover:bg-white/15 transition-colors duration-300">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-blue-100">{t('cta.badge')}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-8 tracking-tight leading-tight" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
          {t('cta.readyTitle')}
        </h2>
        <p className="text-xl mb-14 max-w-3xl mx-auto leading-relaxed font-light" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 10px rgba(0,0,0,0.2)' }}>
          {t('cta.readyDesc')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <a
            href={`/${locale}/contact`}
            className="group inline-flex items-center justify-center px-12 py-5 bg-white text-blue-900 font-extrabold rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2 text-lg"
          >
            {t('cta.button')}
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
          </a>
          <a
            href={`tel:${contactPhone.replace(/\s/g, '')}`}
            className="group inline-flex items-center justify-center px-12 py-5 border-2 border-white/40 text-white font-extrabold rounded-2xl hover:bg-white/15 hover:border-white/60 transition-all duration-300 backdrop-blur-md text-lg bg-white/5"
          >
            <Phone className="mr-3 w-5 h-5" />
            {contactPhone}
          </a>
        </div>

        {/* Contact Info */}
        <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm font-medium px-6 py-3.5 rounded-full bg-black/40 backdrop-blur-lg border border-white/10" style={{ color: 'rgba(255,255,255,0.98)', textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <Mail className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold">{contactEmail}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/30" />
          <div className="flex items-center space-x-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <Phone className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold">{contactPhone.replace(/^\s*/, '')}</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
