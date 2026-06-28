'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/i18n';
import { fetchUnifiedSettings, SiteSettings } from '@/data/unified-data';
import { motion } from 'framer-motion';

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
    <section className="relative py-20 px-6 overflow-hidden" style={{ backgroundColor: '#0d1b2a' }}>
      {/* Geometric pattern overlay */}
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundImage: `linear-gradient(135deg, #0d1b2a 0%, #1a365d 100%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundBlendMode: 'overlay'
        }} 
      />

      {/* Decorative Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Content */}
      <motion.div 
        className="relative z-10 max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Badge */}
        <div 
          className="inline-flex items-center space-x-2 backdrop-blur-sm border rounded-full px-6 py-2 mb-8"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#4ade80' }} />
          <span className="text-sm font-semibold" style={{ color: '#bfdbfe' }}>{t('cta.badge')}</span>
        </div>

        <h2 
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
          style={{ color: '#ffffff' }}
        >
          {t('cta.readyTitle')}
        </h2>
        <p 
          className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: '#cbd5e0' }}
        >
          {t('cta.readyDesc')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <a
            href={`/${locale}/contact`}
            className="group inline-flex items-center justify-center px-10 py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
            style={{ 
              background: 'linear-gradient(135deg, #ed8936 0%, #f6ad55 100%)',
              boxShadow: '0 4px 14px rgba(237, 137, 54, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.animation = 'cta-pulse 2s ease-in-out infinite';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = 'none';
            }}
          >
            {t('cta.button')}
            <svg className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href={`tel:${contactPhone.replace(/\s/g, '')}`}
            className="group inline-flex items-center justify-center px-10 py-4 font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 text-lg"
            style={{ 
              borderWidth: '2px', 
              borderColor: '#ffffff',
              color: '#ffffff',
              borderStyle: 'solid'
            }}
          >
            <svg className="mr-3 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 011 .948l.893 7.554a1 1 0 01-.502.998L8.97 10.95a11.012 11.012 0 004.148 4.148l1.42-1.42a1 1 0 01.998-.502l7.554.893a1 1 0 01.948 1V21a2 2 0 01-2 2h-1C9.715 23 3 16.285 3 8V5z" />
            </svg>
            {contactPhone}
          </a>
        </div>

        {/* Contact Info */}
        <div 
          className="inline-flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm font-semibold px-6 py-3.5 rounded-full border"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff'
          }}
        >
          <div className="flex items-center space-x-2.5">
            <span 
              className="flex items-center justify-center w-7 h-7 rounded-full border"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <span>{contactEmail}</span>
          </div>
          <div className="hidden sm:block w-px h-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
          <div className="flex items-center space-x-2.5">
            <span 
              className="flex items-center justify-center w-7 h-7 rounded-full border"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 011 .948l.893 7.554a1 1 0 01-.502.998L8.97 10.95a11.012 11.012 0 004.148 4.148l1.42-1.42a1 1 0 01.998-.502l7.554.893a1 1 0 01.948 1V21a2 2 0 01-2 2h-1C9.715 23 3 16.285 3 8V5z" />
              </svg>
            </span>
            <span>{contactPhone.replace(/^\s*/, '')}</span>
          </div>
        </div>
      </motion.div>

      {/* CSS for CTA pulse animation */}
      <style>{`
        @keyframes cta-pulse {
          0%, 100% { 
            box-shadow: 0 4px 14px rgba(237, 137, 54, 0.4); 
          }
          50% { 
            box-shadow: 0 4px 30px rgba(237, 137, 54, 0.8); 
          }
        }
      `}</style>
    </section>
  );
}
