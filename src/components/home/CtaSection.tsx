'use client';

import { useState, useEffect } from 'react';
import { useLocale } from '@/lib/i18n';
import { fetchUnifiedSettings, SiteSettings } from '@/data/unified-data';
import { motion } from 'framer-motion';

// Reusable Bubble Button for CTA sections - 泡泡动态按钮
function BubbleBtn({ href, children, primary = false, light = false }: { href: string; children: React.ReactNode; primary?: boolean; light?: boolean }) {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const bbs = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 8 + Math.random() * 84,
      y: 55 + Math.random() * 45,
      size: 4 + Math.random() * 9,
      delay: Math.random() * 2,
    }));
    setBubbles(bbs);
  }, []);

  return (
    <a
      href={href}
      className="group relative inline-flex items-center justify-center px-10 py-4 font-bold rounded-full text-lg overflow-hidden cursor-pointer"
      style={{
        background: light
          ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,248,255,0.9) 100%)'
          : primary
            ? `linear-gradient(135deg, ${
                light ? '#3b82f6' : 'rgba(99,102,241,0.3)'
              } 0%, ${
                light ? '#2563eb' : 'rgba(59,130,246,0.22)'
              } 50%, ${
                light ? '#1d4ed8' : 'rgba(139,92,246,0.28)'
              } 100%)`
            : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        border: light
          ? 'none'
          : `1px solid ${primary ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.18)'}`,
        backdropFilter: light ? 'none' : 'blur(16px)',
        boxShadow: light
          ? '0 6px 20px rgba(37,99,235,0.35), 0 0 40px rgba(59,130,246,0.12)'
          : `
              0 0 20px ${primary ? 'rgba(99,102,241,0.12)' : 'rgba(180,200,255,0.04)'},
              0 0 40px ${primary ? 'rgba(59,130,246,0.06)' : 'transparent'},
              inset 0 1px 0 rgba(255,255,255,${primary ? '0.12' : '0.06'}),
              inset 0 -1px 0 rgba(0,0,0,0.08)
            `,
        color: light ? '#ffffff' : '#ffffff',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rising bubbles */}
      {bubbles.map(b => (
        <span
          key={b.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${b.x}%`,
            bottom: '-8px',
            width: hovered ? b.size + 4 : b.size * 0.4,
            height: hovered ? b.size + 4 : b.size * 0.4,
            background: light
              ? `radial-gradient(circle at 30% 30%, rgba(255,255,255,${hovered ? 0.9 : 0.5}), rgba(147,197,253,${hovered ? 0.4 : 0.15}) transparent)`
              : `radial-gradient(circle at 30% 30%, rgba(255,255,255,${hovered ? 0.7 : 0.25}), rgba(147,197,253,${hovered ? 0.3 : 0.08}) transparent)`,
            boxShadow: hovered && !light ? `0 0 ${b.size}px rgba(147,197,253,0.4)` : (hovered && light ? `0 0 ${b.size}px rgba(59,130,246,0.5)` : 'none'),
            animation: hovered
              ? `bubble-rise-cta ${1.6 + b.delay}s ease-in-out infinite`
              : `bubble-idle-cta ${(2 + b.delay)}s ease-in-out infinite`,
            animationDelay: `${b.delay * 0.5}s`,
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      ))}

      {/* Hover ripple wave */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${
            light ? 'rgba(255,255,255,0.2)' : (primary ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.08)')
          } 0%, transparent 70%)`,
          transform: hovered ? 'scale(1)' : 'scale(0.5)',
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />

      {/* Glow border pulse on hover */}
      <span
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: light ? 'none' : `2px solid ${primary ? 'rgba(129,140,248,0)' : 'rgba(255,255,255,0)'}`,
          boxShadow: hovered && !light
            ? `0 0 20px ${primary ? 'rgba(99,102,241,0.2)' : 'rgba(200,220,255,0.1)'} inset, 0 0 30px ${primary ? 'rgba(99,102,241,0.15)' : 'rgba(180,200,255,0.08)'}`
            : (hovered && light ? `0 0 20px rgba(59,130,246,0.25) inset` : 'none'),
          transition: 'all 0.4s ease',
          transform: hovered ? 'scale(1.03)' : 'scale(1)',
        }}
      />

      {/* Text content */}
      <span className="relative z-10" style={{
        textShadow: hovered
          ? (light ? '0 0 16px rgba(255,255,255,0.6), 0 1px 3px rgba(37,99,235,0.3)' : `0 0 12px ${primary ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.4)'}, 0 1px 3px rgba(0,0,0,0.5)`)
          : (light ? '0 1px 3px rgba(37,99,235,0.3)' : '0 0 8px rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.5)'),
        transition: 'text-shadow 0.4s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        {children}
      </span>

      {/* Floating sparkle particles */}
      {hovered && Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            left: `${18 + i * 20}%`,
            top: `${Math.random() > 0.5 ? -2 : 100}%`,
            background: light ? 'rgb(255,255,255)' : 'rgba(255,255,255,0.85)',
            animation: `sparkle-float-cta ${1 + i * 0.3}s ease-out forwards`,
            animationDelay: `${i * 0.1}s`,
            boxShadow: light ? '0 0 6px rgba(255,255,255,0.9)' : '0 0 6px rgba(255,255,255,0.8)',
          }}
        />
      ))}
    </a>
  );
}

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
    <section className="relative py-24 px-6 overflow-hidden cta-sky-container">
      {/* ===== SKY BACKGROUND ===== */}
      {/* Multi-layer sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            #87CEEB 0%,    /* sky blue top */
            #B0E0E6 25%,   /* powder blue */
            #E0F4FF 50%,   /* very light blue mid */
            #F0F8FF 75%,   /* alice blue */
            #FFFFFF 100%   /* white horizon */
          )`,
        }}
      />

      {/* Sun glow - warm light from upper right */}
      <div
        className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,248,220,0.7) 0%, rgba(255,223,150,0.3) 30%, rgba(135,206,235,0) 65%)',
          filter: 'blur(40px)',
          animation: 'sun-pulse 8s ease-in-out infinite',
        }}
      />

      {/* ===== ANIMATED CLOUDS ===== */}
      {/* Cloud 1: Large background cloud, slow */}
      <div className="cloud-layer cloud-slow" style={{
        position: 'absolute',
        top: '8%',
        left: '-200px',
        animation: 'cloud-drift1 45s linear infinite',
      }}>
        <svg width="280" height="120" viewBox="0 0 280 120" fill="none">
          <ellipse cx="80" cy="80" rx="70" ry="38" fill="rgba(255,255,255,0.85)" />
          <ellipse cx="140" cy="60" rx="60" ry="42" fill="rgba(255,255,255,0.9)" />
          <ellipse cx="200" cy="72" rx="55" ry="35" fill="rgba(255,255,255,0.85)" />
          <ellipse cx="140" cy="48" rx="45" ry="32" fill="rgba(255,255,255,0.95)" />
          <ellipse cx="100" cy="62" rx="40" ry="28" fill="#fff" />
        </svg>
      </div>

      {/* Cloud 2: Mid-sized, medium speed */}
      <div className="cloud-layer cloud-mid" style={{
        position: 'absolute',
        top: '22%',
        right: '-180px',
        width: '220px',
        animation: 'cloud-drift2 35s linear infinite',
        animationDelay: '-10s',
      }}>
        <svg width="220" height="95" viewBox="0 0 220 95" fill="none">
          <ellipse cx="65" cy="62" rx="52" ry="30" fill="rgba(255,255,255,0.82)" />
          <ellipse cx="115" cy="46" rx="48" ry="34" fill="rgba(255,255,255,0.88)" />
          <ellipse cx="165" cy="56" rx="44" ry="28" fill="rgba(255,255,255,0.82)" />
          <ellipse cx="115" cy="36" rx="36" ry="26" fill="rgba(255,255,255,0.94)" />
          <ellipse cx="85" cy="50" rx="32" ry="22" fill="#fff" />
        </svg>
      </div>

      {/* Cloud 3: Small foreground cloud, faster */}
      <div className="cloud-layer cloud-fast" style={{
        position: 'absolute',
        top: '55%',
        left: '-120px',
        animation: 'cloud-drift1 28s linear infinite',
        animationDelay: '-18s',
      }}>
        <svg width="160" height="70" viewBox="0 0 160 70" fill="none">
          <ellipse cx="48" cy="46" rx="38" ry="22" fill="rgba(255,255,255,0.78)" />
          <ellipse cx="85" cy="34" rx="35" ry="25" fill="rgba(255,255,255,0.86)" />
          <ellipse cx="122" cy="42" rx="32" ry="20" fill="rgba(255,255,255,0.78)" />
          <ellipse cx="85" cy="26" rx="27" ry="19" fill="rgba(255,255,255,0.92)" />
          <ellipse cx="64" cy="36" rx="23" ry="16" fill="#fff" />
        </svg>
      </div>

      {/* Cloud 4: Small accent cloud, opposite direction */}
      <div className="cloud-layer cloud-reverse" style={{
        position: 'absolute',
        top: '38%',
        left: '-100px',
        animation: 'cloud-drift-reverse 40s linear infinite',
        animationDelay: '-5s',
      }}>
        <svg width="130" height="58" viewBox="0 0 130 58" fill="none">
          <ellipse cx="40" cy="38" rx="30" ry="18" fill="rgba(255,255,255,0.75)" />
          <ellipse cx="70" cy="28" rx="28" ry="20" fill="rgba(255,255,255,0.84)" />
          <ellipse cx="100" cy="34" rx="26" ry="16" fill="rgba(255,255,255,0.74)" />
          <ellipse cx="70" cy="22" rx="22" ry="15" fill="rgba(255,255,255,0.90)" />
        </svg>
      </div>

      {/* Cloud 5: Tiny wispy cloud, very fast (foreground parallax) */}
      <div className="cloud-layer cloud-fast" style={{
        position: 'absolute',
        bottom: '15%',
        right: '-80px',
        animation: 'cloud-drift2 22s linear infinite',
        animationDelay: '-12s',
      }}>
        <svg width="100" height="44" viewBox="0 0 100 44" fill="none">
          <ellipse cx="30" cy="29" rx="23" ry="14" fill="rgba(255,255,255,0.7)" />
          <ellipse cx="54" cy="21" rx="21" ry="16" fill="rgba(255,255,255,0.8)" />
          <ellipse cx="78" cy="26" rx="19" ry="12" fill="rgba(255,255,255,0.68)" />
          <ellipse cx="54" cy="16" rx="17" ry="12" fill="rgba(255,255,255,0.88)" />
        </svg>
      </div>

      {/* ===== ANIMATED BIRDS ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: '12%', size: 18, duration: 18, delay: 0,    direction: 1,  opacity: 0.55 },
          { top: '18%', size: 14, duration: 22, delay: -5,   direction: 1,  opacity: 0.40 },
          { top: '8%',  size: 22, duration: 15, delay: -3,   direction: 1,  opacity: 0.65 },
          { top: '25%', size: 12, duration: 25, delay: -8,   direction: -1, opacity: 0.35 },
          { top: '15%', size: 16, duration: 20, delay: -12,  direction: 1,  opacity: 0.45 },
        ].map((bird, i) => (
          <div
            key={`bird-${i}`}
            className="absolute"
            style={{
              top: bird.top,
              left: bird.direction > 0 ? '-60px' : 'calc(100% + 20px)',
              animation: `${bird.direction > 0 ? 'bird-fly-right' : 'bird-fly-left'} ${bird.duration}s linear infinite`,
              animationDelay: `${bird.delay}s`,
              opacity: bird.opacity,
              zIndex: 1,
            }}
          >
            {/* Simple bird shape: two angled wings */}
            <svg
              width={bird.size}
              height={Math.round(bird.size * 0.55)}
              viewBox="0 0 30 16"
              fill="none"
              style={{
                transform: bird.direction > 0 ? 'scaleX(1)' : 'scaleX(-1)',
                animation: `bird-flap 0.6s ease-in-out infinite`,
              }}
            >
              <path
                d="M2 8 C8 2, 18 1, 28 7"
                stroke="#1e3a5f"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M2 8 C8 14, 18 15, 28 9"
                stroke="#1e3a5f"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* ===== FLOATING LIGHT PARTICLES (dust motes in sunlight) ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${3 + Math.random() * 5}px`,
              height: `${3 + Math.random() * 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(255, 255, 200, ${0.3 + Math.random() * 0.4})`,
              boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(255, 240, 150, ${0.2 + Math.random() * 0.3})`,
              animation: `particle-float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${-Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* ===== CONTENT ===== */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Badge - glass style to match sky theme */}
        <div
          className="inline-flex items-center space-x-2 backdrop-blur-md border rounded-full px-6 py-2.5 mb-8"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderColor: 'rgba(147, 197, 253, 0.5)',
            boxShadow: '0 2px 12px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse bg-green-500" style={{ boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)' }} />
          <span className="text-sm font-semibold text-blue-700">{t('cta.badge')}</span>
        </div>

        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
          style={{ color: '#1e3a5f' }}
        >
          {t('cta.readyTitle')}
        </h2>
        <p
          className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          style={{ color: '#475569' }}
        >
          {t('cta.readyDesc')}
        </p>

        {/* CTA Buttons - BUBBLE EFFECT */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <BubbleBtn href={`/${locale}/contact`} primary light>
            {t('cta.button')}
            <svg className="ml-2 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </BubbleBtn>
          <BubbleBtn href={`tel:${contactPhone.replace(/\s/g, '')}`}>
            <svg className="mr-3 w-5 h-5" style={{ opacity: 0.8 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 011 .948l.893 7.554a1 1 0 01-.502.998L8.97 10.95a11.012 110.012 0 004.148 4.148l1.42-1.42a1 1 0 01.998-.502l7.554.893a1 1 0 01.948 1V21a2 2 0 01-2 2h-1C9.715 23 3 16.285 3 8V5z" />
            </svg>
            {contactPhone}
          </BubbleBtn>
        </div>

        {/* Contact Info - glass card style */}
        <div
          className="inline-flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm font-semibold px-6 py-4 rounded-2xl border"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(147, 197, 253, 0.35)',
            boxShadow: '0 2px 16px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
            color: '#475569',
          }}
        >
          <div className="flex items-center space-x-2.5">
            <span
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <span>{contactEmail}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-blue-200" />
          <div className="flex items-center space-x-2.5">
            <span
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 011 .948l.893 7.554a1 1 0 01-.502.998L8.97 10.95a11.012 110.012 0 004.148 4.148l1.42-1.42a1 1 0 01.998-.502l7.554.893a1 1 0 01.948 1V21a2 2 0 01-2 2h-1C9.715 23 3 16.285 3 8V5z" />
              </svg>
            </span>
            <span>{contactPhone.replace(/^\s*/, '')}</span>
          </div>
        </div>
      </motion.div>

      {/* ===== CSS KEYFRAMES FOR ALL ANIMATIONS ===== */}
      <style>{`
        /* Cloud drift animations */
        @keyframes cloud-drift1 {
          0% { transform: translateX(-250px); }
          100% { transform: translateX(calc(100vw + 300px)); }
        }

        @keyframes cloud-drift2 {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(calc(100vw + 250px)); }
        }

        @keyframes cloud-drift-reverse {
          0% { transform: translateX(calc(100vw + 150px)); }
          100% { transform: translateX(-200px); }
        }

        /* Sun pulse */
        @keyframes sun-pulse {
          0%, 100% {
            opacity: 0.85;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        /* Particle float */
        @keyframes particle-float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.4;
          }
          25% {
            transform: translateY(-15px) translateX(8px);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-8px) translateX(-5px);
            opacity: 0.5;
          }
          75% {
            transform: translateY(-20px) translateX(3px);
            opacity: 0.8;
          }
        }

        /* Bird flight — right direction */
        @keyframes bird-fly-right {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 80px)); }
        }
        /* Bird flight — left direction */
        @keyframes bird-fly-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100vw - 80px)); }
        }
        /* Bird wing flap */
        @keyframes bird-flap {
          0%, 100% { transform: scaleY(1); }
          50%        { transform: scaleY(0.55); }
        }

        /* ===== BUBBLE BUTTON ANIMATIONS (CTA) ===== */
        @keyframes bubble-rise-cta {
          0%   { transform: translateY(0) scale(1); opacity: 0.6; }
          50%  { transform: translateY(-24px) scale(1.35); opacity: 0.9; }
          100% { transform: translateY(-48px) scale(0.6); opacity: 0; }
        }
        @keyframes bubble-idle-cta {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50%      { transform: translateY(-6px) scale(1.12); opacity: 0.4; }
        }
        @keyframes sparkle-float-cta {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-18px) scale(0); opacity: 0; }
        }

        /* CTA container ensures proper positioning context */
        .cta-sky-container {
          min-height: 500px;
        }
      `}</style>
    </section>
  );
}
