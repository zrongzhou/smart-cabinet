'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, Award, Globe, Factory, ShieldCheck, Cpu, Zap, Building, 
  TrendingUp, Clock, CheckCircle, Car, ChevronRight, Star,
  PenTool, Settings, BadgeCheck, Truck
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchUnifiedSettings, SiteSettings } from '@/data/unified-data';
import OceanHeader from '@/components/OceanHeader';

// Page data type (from API or localStorage)
interface PageData {
  id?: string;
  slug?: string;
  title?: { zh: string; en: string; ar: string };
  blocks: any[];
  createdAt?: string;
  updatedAt?: string;
}

// Animated counter component — enhanced with entrance animation
function CountUp({ target, suffix = '', prefix = '', locale = 'en' }: { target: number; suffix?: string; prefix?: string; locale?: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setTimeout(() => animateCount(), 200);
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
  
    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCount = () => {
    const duration = 2200;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <div ref={elementRef} className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className="text-5xl lg:text-[4.5rem] font-black mb-2 tracking-tighter text-gray-900" style={{ lineHeight: 1.05 }}>
        {prefix}{count.toLocaleString(locale === 'zh' ? 'zh-Hans' : locale === 'ar' ? 'ar-SA' : 'en-US')}{suffix}
      </div>
    </div>
  );
}

// Timeline item component with connection line animation — enhanced with per-item colors
function TimelineItem({ year, titleKey, descriptionKey, isLeft, locale, t, index = 0 }: { year: string; titleKey: string; descriptionKey: string; isLeft: boolean; locale: string; t: (key: string) => string; index?: number }) {
  const isRTL = locale === 'ar';
  const showLeft = isRTL ? !isLeft : isLeft;
  const itemRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Per-item color palette for visual variety
  const timelineColors = [
    { accent: '#3b82f6', bgGrad: 'from-blue-50 to-indigo-50', borderGlow: 'shadow-blue-100/40', dotColor: 'bg-blue-500', ringColor: 'ring-blue-200' },
    { accent: '#10b981', bgGrad: 'from-emerald-50 to-teal-50', borderGlow: 'shadow-emerald-100/40', dotColor: 'bg-emerald-500', ringColor: 'ring-emerald-200' },
    { accent: '#8b5cf6', bgGrad: 'from-violet-50 to-purple-50', borderGlow: 'shadow-violet-100/40', dotColor: 'bg-violet-500', ringColor: 'ring-violet-200' },
    { accent: '#f59e0b', bgGrad: 'from-amber-50 to-orange-50', borderGlow: 'shadow-amber-100/40', dotColor: 'bg-amber-500', ringColor: 'ring-amber-200' },
    { accent: '#ec4899', bgGrad: 'from-pink-50 to-rose-50', borderGlow: 'shadow-pink-100/40', dotColor: 'bg-pink-500', ringColor: 'ring-pink-200' },
    { accent: '#06b6d4', bgGrad: 'from-cyan-50 to-sky-50', borderGlow: 'shadow-cyan-100/40', dotColor: 'bg-cyan-500', ringColor: 'ring-cyan-200' },
    { accent: '#ef4444', bgGrad: 'from-red-50 to-rose-50', borderGlow: 'shadow-red-100/40', dotColor: 'bg-red-500', ringColor: 'ring-red-200' },
    { accent: '#84cc16', bgGrad: 'from-lime-50 to-green-50', borderGlow: 'shadow-lime-100/40', dotColor: 'bg-lime-500', ringColor: 'ring-lime-200' },
    { accent: '#a855f7', bgGrad: 'from-fuchsia-50 to-purple-50', borderGlow: 'shadow-fuchsia-100/40', dotColor: 'bg-fuchsia-500', ringColor: 'ring-fuchsia-200' },
  ];
  const tc = timelineColors[index % timelineColors.length];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.25 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={itemRef}
      className={`flex items-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${showLeft ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Content side */}
      <div className={`w-5/12 ${showLeft ? 'text-right pr-8' : 'text-left pl-8'}`}>
        <div className={`rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100/80 bg-gradient-to-br ${tc.bgGrad} group overflow-hidden`}>
          {/* Top colored accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(90deg, ${tc.accent}, transparent)` }}
          />
          
          <div className="text-2xl font-bold mb-2" style={{ color: tc.accent }}>{year}</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text transition-all duration-300"
            style={{ backgroundImage: `linear-gradient(135deg, ${tc.accent}, #475569)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            {t(titleKey)}
          </h3>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            {t(descriptionKey)}
          </p>
        </div>
      </div>

      {/* Center dot with pulse animation */}
      <div className="w-2/12 flex justify-center">
        <div className={`w-5 h-5 ${tc.dotColor} rounded-full border-4 z-10 shadow-md ${isVisible ? 'animate-pulse' : ''}`} 
          style={{ borderColor: `${tc.accent}33` }}
        />
      </div>

      {/* Empty side */}
      <div className="w-5/12" />
    </div>
  );
}

// ===== 3D Book Flip Component for Core Values (v134) =====
// Value item type
interface ValueItem {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
}

function ValuesBookFlip({ values, t, locale }: { values: ValueItem[]; t: (key: string) => string; locale: string }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // === v141: Enhanced sci-fi text scramble with glitch + matrix rain ===
  const [scrambleTitle, setScrambleTitle] = useState('');
  const [scrambleDesc, setScrambleDesc] = useState('');
  const [glitchActive, setGlitchActive] = useState(false);
  const [textGlowIntensity, setTextGlowIntensity] = useState(0);
  const scrambleRef = useRef({ frame: 0, animId: 0 });
  // Extended charset with more tech/cyber glyphs
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=<>[]{}|/\\~ΔΘΛΠΣΨΩαβγδεζηθλμξπσςφψω';
  const BINARY = '01';

  const runScramble = (targetTitle: string, targetDesc: string) => {
    // Cancel previous
    if (scrambleRef.current.animId) cancelAnimationFrame(scrambleRef.current.animId);
    let frame = 0;
    const totalFrames = 55; // ~0.92s at 60fps — longer for more dramatic effect
    const glitchFrames = 8; // initial glitch burst
    // Track per-character resolve state
    const titleResolved = new Array(targetTitle.length).fill(false);
    const descResolved = new Array(targetDesc.length).fill(false);

    const tick = () => {
      frame++;
      const progress = frame / totalFrames;
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2; // ease-in-out

      // Glitch activation pulse at start
      if (frame <= glitchFrames + 5) {
        setGlitchActive(true);
        setTextGlowIntensity(Math.min(1, frame / 10));
      } else if (frame > totalFrames - 8) {
        setGlitchActive(false);
        setTextGlowIntensity(Math.max(0, (totalFrames - frame) / 8));
      } else {
        setGlitchActive(frame % 20 < 3); // occasional micro-glitch
        setTextGlowIntensity(0.3 + Math.sin(frame * 0.15) * 0.25);
      }

      // Phase 1 (frames 1-8): Pure glitch burst — all random/noise
      // Phase 2 (frames 9-40): Progressive left-to-right resolve with occasional regression
      // Phase 3 (frames 41-55): Final lock-in with settling shimmer

      let newTitle = '';
      for (let i = 0; i < targetTitle.length; i++) {
        const charDelay = (i / targetTitle.length) * 0.6;
        const charProgress = Math.min(1, Math.max(0, (eased - charDelay) * 1.6));

        if (frame <= glitchFrames) {
          // Glitch phase: pure chaos
          newTitle += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else if (charProgress >= 0.98) {
          // Fully resolved
          newTitle += targetTitle[i];
          titleResolved[i] = true;
        } else if (charProgress > 0.3) {
          // Resolving phase — mostly correct but with glitch regression
          if (!titleResolved[i] && Math.random() < 0.08 && frame % 7 < 2) {
            // Glitch regression — briefly flip back to noise
            newTitle += Math.random() > 0.5 ? BINARY[Math.floor(Math.random() * 2)] : CHARS[Math.floor(Math.random() * CHARS.length)];
          } else {
            newTitle += Math.random() > (1 - charProgress) * 1.2
              ? targetTitle[i]
              : CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        } else {
          // Still scrambling — mix of chars and binary
          newTitle += Math.random() > 0.4
            ? CHARS[Math.floor(Math.random() * CHARS.length)]
            : BINARY[Math.floor(Math.random() * 2)];
        }
      }

      // Description: similar but slightly delayed, uses binary more
      let newDesc = '';
      for (let i = 0; i < targetDesc.length; i++) {
        const charDelay = 0.05 + (i / targetDesc.length) * 0.45;
        const charProgress = Math.min(1, Math.max(0, (eased - charDelay) * 1.7));

        if (frame <= glitchFrames) {
          newDesc += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else if (charProgress >= 0.97) {
          newDesc += targetDesc[i];
          descResolved[i] = true;
        } else if (charProgress > 0.25) {
          if (!descResolved[i] && Math.random() < 0.06 && frame % 9 < 2) {
            newDesc += BINARY[Math.floor(Math.random() * 2)];
          } else {
            newDesc += Math.random() > (1 - charProgress) * 1.5
              ? targetDesc[i]
              : (Math.random() > 0.35 ? CHARS[Math.floor(Math.random() * CHARS.length)] : BINARY[Math.floor(Math.random() * 2)]);
          }
        } else {
          newDesc += Math.random() > 0.3
            ? CHARS[Math.floor(Math.random() * CHARS.length)]
            : BINARY[Math.floor(Math.random() * 2)];
        }
      }

      setScrambleTitle(newTitle);
      setScrambleDesc(newDesc);

      if (frame < totalFrames) {
        scrambleRef.current.animId = requestAnimationFrame(tick);
      } else {
        setScrambleTitle(targetTitle);
        setScrambleDesc(targetDesc);
        setGlitchActive(false);
        setTextGlowIntensity(0);
      }
    };
    scrambleRef.current.animId = requestAnimationFrame(tick);
  };

  // Trigger scramble on page change
  useEffect(() => {
    const current = values[currentPage];
    if (!current) return;
    const titleText = t(current.titleKey);
    const descText = t(current.descriptionKey);
    // Immediate show on first render, scramble on transition
    if (scrambleTitle === '') {
      setScrambleTitle(titleText);
      setScrambleDesc(descText);
    } else {
      runScramble(titleText, descText);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Auto-transition every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentPage(prev => (prev + 1) % values.length);
          setIsTransitioning(false);
        }, 800);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [values.length, isTransitioning]);

  // Premium multi-tone holographic themes — rich color palettes (v138)
  const holoThemes = [
    { accent: '#00e5ff', secondary: '#00b8d4', tertiary: '#18ffff', glow: 'rgba(0,229,255,0.5)', beam: 'rgba(0,229,255,0.18)', bg1: 'rgba(0,20,40,0.97)', bg2: 'rgba(2,10,30,0.95)' },
    { accent: '#e040fb', secondary: '#aa00ff', tertiary: '#ea80fc', glow: 'rgba(224,64,251,0.5)', beam: 'rgba(224,64,251,0.18)', bg1: 'rgba(20,5,35,0.97)', bg2: 'rgba(15,2,25,0.95)' },
    { accent: '#00e676', secondary: '#00c853', tertiary: '#69f0ae', glow: 'rgba(0,230,118,0.5)', beam: 'rgba(0,230,118,0.18)', bg1: 'rgba(0,25,15,0.97)', bg2: 'rgba(2,15,10,0.95)' },
    { accent: '#ffab00', secondary: '#ff6d00', tertiary: '#ffd740', glow: 'rgba(255,171,0,0.45)', beam: 'rgba(255,171,0,0.15)', bg1: 'rgba(30,20,0,0.97)', bg2: 'rgba(20,12,0,0.95)' },
    { accent: '#ff5252', secondary: '#d50000', tertiary: '#ff8a80', glow: 'rgba(255,82,82,0.45)', beam: 'rgba(255,82,82,0.15)', bg1: 'rgba(35,5,5,0.97)', bg2: 'rgba(25,2,2,0.95)' },
  ];

  const current = values[currentPage];
  const Icon = current.icon;
  const ht = holoThemes[currentPage % holoThemes.length];

  return (
    <div className="flex justify-center py-4">
      {/* ===== PREMIUM HOLOGRAPHIC 3D DISPLAY v138 — cinematic sci-fi ===== */}
      <div className="relative w-full max-w-[800px] mx-auto" style={{ perspective: '1400px' }}>
        {/* Outer ambient glow — large soft halo */}
        <div className="absolute -inset-16 rounded-full pointer-events-none" style={{
          background: `radial-gradient(circle, ${ht.glow} 0%, ${ht.beam} 30%, transparent 70%)`,
          animation: 'v138-ambientPulse 4s ease-in-out infinite alternate',
          filter: 'blur(40px)',
        }} />

        {/* Bottom projector beam — wider, more dramatic */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[280px] h-[160px] opacity-50 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${ht.beam} 0%, ${ht.accent}15 40%, transparent 100%)`,
            clipPath: 'polygon(35% 100%, 65% 100%, 85% 0%, 15% 0%)',
            filter: 'blur(12px)',
            animation: 'v138-beamPulse 3.5s ease-in-out infinite',
          }}
        />
        {/* Projector base */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full blur-lg pointer-events-none"
          style={{ background: ht.accent, opacity: 0.4, animation: 'v138-beamPulse 3.5s ease-in-out infinite' }}
        />

        {/* Main holographic panel — premium glass-morphic (force dark to prevent theme override) */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, #000810 0%, #0a0f1e 50%, #000810 100%) !important`,
            border: `1.5px solid ${ht.accent} !important`,
            boxShadow: `
              0 0 40px ${ht.glow},
              0 0 80px ${ht.beam},
              0 0 120px ${ht.accent}10,
              inset 0 1px 0 ${ht.accent}25,
              inset 0 -1px 0 rgba(0,0,0,0.3),
              0 30px 80px rgba(0,0,0,0.6)
            `,
            transformStyle: 'preserve-3d',
            animation: 'v138-holoFloat 6s ease-in-out infinite',
          }}
          onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
          onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
        >
          {/* Layer 1: Hexagonal grid pattern overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden" style={{ opacity: 0.06 }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hexGrid" width="30" height="51.96" patternUnits="userSpaceOnUse">
                  <path d="M15 0 L30 8.66 L30 25.98 L15 34.64 L0 25.98 L0 8.66 Z" fill="none" stroke={ht.accent} strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexGrid)" />
            </svg>
          </div>

          {/* Layer 2: Scan lines + moving scan beam */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {/* Fine horizontal scan lines */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 3px)',
            }} />
            {/* Main scan line — thicker, brighter, with trail */}
            <div className="absolute left-0 right-0 h-[4px]"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${ht.accent}60 20%, ${ht.accent} 50%, ${ht.tertiary}80 80%, transparent 100%)`,
                boxShadow: `0 0 20px ${ht.accent}, 0 0 40px ${ht.glow}, 0 0 60px ${ht.beam}`,
                animation: 'v138-scanLine 3.2s linear infinite',
              }}
            />
            {/* Secondary faint scan line offset */}
            <div className="absolute left-0 right-0 h-[2px]" style={{
              background: `linear-gradient(90deg, transparent, ${ht.secondary}40, transparent)`,
              animation: 'v138-scanLine 3.2s linear infinite reverse',
              animationDelay: '1.6s',
              opacity: 0.3,
            }} />
          </div>

          {/* Layer 3: Circuit-board trace decoration */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden" style={{ opacity: 0.08 }}>
            <svg width="100%" height="100%">
              <path d="M0,80 L120,80 L140,100 L300,100 L320,80 L500,80 L520,120 L700,120" stroke={ht.accent} strokeWidth="1" fill="none" />
              <path d="M800,200 L600,200 L580,170 L400,170 L380,200 L200,200 L180,230 L0,230" stroke={ht.secondary} strokeWidth="0.8" fill="none" />
              <path d="M0,350 L200,350 L220,320 L450,320 L470,350 L650,350 L670,310 L800,310" stroke={ht.tertiary} strokeWidth="0.8" fill="none" />
              {[...Array(8)].map((_, i) => (
                <circle key={i} cx={`${100 + i * 95}`} cy={`${80 + (i % 3) * 150}`} r="3" fill={ht.accent} opacity="0.6" />
              ))}
            </svg>
          </div>

          {/* Layer 4: Corner tech brackets — enhanced */}
          {[[0,0],[0,1],[1,0],[1,1]].map(([v,h], i) => (
            <div key={i} className="absolute pointer-events-none"
              style={{
                top: v ? undefined : '10px', bottom: v ? '10px' : undefined,
                left: h ? undefined : '10px', right: h ? '10px' : undefined,
                width: '28px', height: '28px',
                borderTop: v ? 'none' : `2.5px solid ${ht.accent}`,
                borderBottom: v ? `2.5px solid ${ht.accent}` : 'none',
                borderLeft: h ? 'none' : `2.5px solid ${ht.accent}`,
                borderRight: h ? `2.5px solid ${ht.accent}` : 'none',
                opacity: 0.7,
                boxShadow: `0 0 8px ${ht.glow}`,
              }}
            >
              {/* Corner dot */}
              <div className="absolute w-1.5 h-1.5 rounded-full" style={{
                background: ht.accent,
                top: v ? undefined : '-1px', bottom: v ? '-1px' : undefined,
                left: h ? undefined : '-1px', right: h ? '-1px' : undefined,
                boxShadow: `0 0 6px ${ht.accent}`,
              }} />
            </div>
          ))}

          {/* Layer 5: Rich particle system — 30+ particles with varying behavior */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
            {/* Tiny ambient dust particles */}
            {[...Array(20)].map((_, pi) => (
              <span key={`d-${pi}`} className="absolute rounded-full" style={{
                width: `${1 + (pi % 2)}px`, height: `${1 + (pi % 2)}px`,
                left: `${3 + pi * 4.9}%`, top: `${5 + (pi * 17) % 90}%`,
                background: pi % 3 === 0 ? ht.accent : pi % 3 === 1 ? ht.secondary : ht.tertiary,
                opacity: 0.2 + (pi % 4) * 0.15,
                animation: `v138-dustFloat ${4 + pi * 0.3}s ease-in-out infinite`,
                animationDelay: `${pi * 0.25}s`,
              }} />
            ))}
            {/* Medium data nodes — glowing orbs */}
            {[...Array(10)].map((_, ni) => (
              <span key={`n-${ni}`} className="absolute rounded-full" style={{
                width: `${3 + ni % 3}px`, height: `${3 + ni % 3}px`,
                left: `${8 + ni * 9}%`, top: `${10 + (ni * 23) % 80}%`,
                background: `radial-gradient(circle, ${ht.tertiary} 0%, ${ht.accent}50, transparent 70%)`,
                boxShadow: `0 0 ${8 + ni * 2}px ${ht.glow}`,
                opacity: 0.4 + (ni % 3) * 0.2,
                animation: `v138-nodePulse ${2 + ni * 0.4}s ease-in-out infinite`,
                animationDelay: `${ni * 0.4}s`,
              }} />
            ))}
            {/* Large floating data fragments — rectangular chips */}
            {[...Array(4)].map((_, fi) => (
              <span key={`f-${fi}`} className="absolute rounded-sm pointer-events-none" style={{
                width: `${14 + fi * 4}px`, height: '3px',
                left: `${15 + fi * 22}%`, top: `${20 + fi * 18}%`,
                background: `linear-gradient(90deg, ${ht.accent}40, ${ht.secondary}30, transparent)`,
                opacity: 0.25,
                animation: `v138-chipDrift ${6 + fi * 2}s ease-in-out infinite`,
                animationDelay: `${fi * 1.2}s`,
              }} />
            ))}
          </div>

          {/* ===== v141 NEW: Layer 6 — Binary Rain (Matrix-style columns) ===== */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden" style={{ opacity: 0.12 }}>
            {[...Array(12)].map((_, ci) => {
              const colChars = [...Array(8 + (ci % 5))].map(() =>
                Math.random() > 0.3 ? BINARY[Math.floor(Math.random() * 2)] : ''
              ).join('');
              return (
                <div key={`br-${ci}`} className="absolute text-[7px] font-mono leading-tight"
                  style={{
                    left: `${4 + ci * 8}%`,
                    top: '-40px',
                    color: ht.accent,
                    opacity: 0.4 + (ci % 3) * 0.25,
                    animation: `v141-binRain ${3 + ci * 0.5}s linear infinite`,
                    animationDelay: `${ci * 0.35}s`,
                    textShadow: `0 0 4px ${ht.glow}`,
                  }}
                >
                  {colChars.split('').map((c, i) => (
                    <div key={i}>{c || '\u00A0'}</div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* ===== v141 NEW: Layer 7 — Floating hex code snippets ===== */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden" style={{ opacity: 0.09 }}>
            {[...Array(6)].map((_, hi) => {
              const hexStr = Array.from({ length: 6 + (hi % 4) }, () =>
                '0123456789ABCDEF'[Math.floor(Math.random() * 16)]
              ).join('');
              return (
                <span key={`hx-${hi}`} className="absolute font-mono text-[8px] tracking-wider"
                  style={{
                    left: `${10 + hi * 15}%`,
                    top: `${15 + (hi * 23) % 70}%`,
                    color: ht.tertiary,
                    opacity: 0.35 + (hi % 3) * 0.2,
                    animation: `v138-chipDrift ${8 + hi * 1.5}s ease-in-out infinite`,
                    animationDelay: `${hi * 0.8}s`,
                    textShadow: `0 0 3px ${ht.accent}30`,
                  }}
                >
                  {'0x' + hexStr}
                </span>
              );
            })}
          </div>

          {/* ===== v141 NEW: Layer 8 — Horizontal data sweep lines ===== */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
            {[...Array(3)].map((_, si) => (
              <div key={`sw-${si}`} className="absolute left-0 h-px"
                style={{
                  top: `${22 + si * 25}%`,
                  width: '0%',
                  background: `linear-gradient(90deg, transparent, ${ht.accent}${40 + si * 15}, ${ht.tertiary}60, transparent)`,
                  boxShadow: `0 0 6px ${ht.glow}`,
                  animation: `v141-dataSweep ${4 + si * 1.5}s ease-in-out infinite`,
                  animationDelay: `${si * 1.2}s`,
                }}
              />
            ))}
          </div>

          {/* ===== v141 NEW: Layer 9 — Radial pulse rings from center ===== */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {[...Array(3)].map((_, ri) => (
              <div key={`pr-${ri}`} className="absolute rounded-full" style={{
                width: `${80 + ri * 60}px`,
                height: `${80 + ri * 60}px`,
                border: `1px solid ${ht.accent}${15 - ri * 4}`,
                animation: `v141-pulseRing ${3 + ri * 0.7}s ease-out infinite`,
                animationDelay: `${ri * 0.6}s`,
              }} />
            ))}
          </div>

          {/* Content area */}
          <div
            className="min-h-[400px] sm:min-h-[440px] p-8 sm:p-12 relative flex flex-col items-center text-center justify-center transition-all duration-700"
            style={{
              opacity: isTransitioning ? 0.25 : 1,
              transform: isTransitioning ? 'scale(0.96) translateY(12px)' : 'scale(1) translateY(0)',
              filter: isTransitioning ? 'blur(6px)' : 'blur(0)',
            }}
          >
            {/* Central holographic icon display — upgraded energy core */}
            <div className="relative mb-7">
              {/* Outer rotating hexagonal frame */}
              <div className="absolute -inset-5 pointer-events-none" style={{
                animation: 'v138-hexRotate 12s linear infinite',
              }}>
                <svg width="100%" height="100%" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id={`hexGrad${currentPage}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={ht.accent} stopOpacity="0.8" />
                      <stop offset="50%" stopColor={ht.secondary} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={ht.tertiary} stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <polygon points="60,2 108,32 108,88 60,118 12,88 12,32"
                    fill="none" stroke={`url(#hexGrad${currentPage})`} strokeWidth="1.5"
                    style={{ filter: `drop-shadow(0 0 8px ${ht.glow})` }}
                  />
                  {/* Inner hexagon counter-rotating */}
                  <polygon points="60,18 96,42 96,78 60,102 24,78 24,42"
                    fill="none" stroke={`${ht.accent}40`} strokeWidth="1"
                    style={{ animation: 'v138-hexRotate 8s linear infinite reverse' }}
                  />
                </svg>
              </div>

              {/* Pulsing energy rings */}
              {[...Array(3)].map((_, ri) => (
                <div key={ri} className="absolute rounded-full pointer-events-none" style={{
                  inset: `${-12 - ri * 14}px`,
                  border: `1.5px solid ${ht.accent}${ri === 0 ? '50' : ri === 1 ? '30' : '15'}`,
                  borderRadius: '50%',
                  animation: `v138-ringPulse ${2.5 + ri * 0.8}s ease-in-out infinite`,
                  animationDelay: `${ri * 0.5}s`,
                }} />
              ))}

              {/* Core icon container — glassmorphic orb */}
              <div className="w-26 h-26 sm:w-30 sm:h-30 rounded-full flex items-center justify-center relative"
                style={{
                  background: `
                    radial-gradient(circle at 35% 30%, ${ht.glow} 0%, transparent 60%),
                    radial-gradient(circle at 50% 50%, ${ht.accent}15 0%, ${ht.secondary}08 50%, transparent 70%),
                    linear-gradient(135deg, ${ht.bg1}ee 0%, ${ht.bg2}dd 100%)
                  `,
                  border: `1.5px solid ${ht.accent}45`,
                  boxShadow: `
                    0 0 40px ${ht.glow},
                    0 0 80px ${ht.beam},
                    inset 0 0 25px ${ht.beam}
                  `,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Icon className="w-12 h-12 sm:w-14 sm:h-14" style={{
                  color: ht.accent,
                  filter: `drop-shadow(0 0 12px ${ht.accent}) drop-shadow(0 0 24px ${ht.glow})`,
                }} strokeWidth={1.2} />
                {/* Inner rotating arc */}
                <div className="absolute inset-0 rounded-full" style={{
                  borderTop: `2px solid ${ht.tertiary}60`,
                  borderRight: `2px solid transparent`,
                  animation: 'v138-arcSpin 3s linear infinite',
                }} />
              </div>
            </div>

            {/* Title — v141: enhanced glowing typography with dynamic glitch + scramble */}
            <h3 className="text-2xl sm:text-3xl font-black mb-4 leading-tight tracking-wide"
              style={{
                color: '#ffffff',
                textShadow: `
                  0 0 ${10 + textGlowIntensity * 25}px ${ht.glow},
                  0 0 ${20 + textGlowIntensity * 50}px ${ht.beam},
                  0 0 ${30 + textGlowIntensity * 80}px ${ht.accent}20,
                  ${glitchActive ? '2px 0 #ff0040, -2px 0 #00ffff' : 'none'}
                `,
                letterSpacing: '0.02em',
                minHeight: '2.8rem',
                fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
                transform: glitchActive ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 2 - 1}px)` : 'translate(0,0)',
                transition: 'transform 0.05s linear',
                filter: glitchActive ? `hue-rotate(${Math.random() * 30 - 15}deg)` : 'hue-rotate(0deg)',
              }}
            >
              {scrambleTitle || t(current.titleKey)}
            </h3>

            {/* Description — v141: scramble + subtle glitch glow */}
            <p className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-6"
              style={{
                color: glitchActive ? '#ffffff' : 'rgba(210,225,255,0.85)',
                minHeight: '4.5rem',
                fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
                textShadow: glitchActive ? `0 0 15px ${ht.glow}, 0 0 30px ${ht.accent}30` : 'none',
                opacity: glitchActive ? 0.9 : 1,
                transition: 'color 0.1s, opacity 0.1s',
              }}
            >
              {scrambleDesc || t(current.descriptionKey)}
            </p>

            {/* Animated data visualization bars */}
            <div className="flex gap-2 mb-7 items-end" style={{ height: '24px' }}>
              {[...Array(7)].map((_, di) => {
                const heights = [10, 18, 14, 24, 16, 20, 12];
                const isActive = di === currentPage % 7;
                return (
                  <div key={di} className="rounded-sm transition-all duration-500" style={{
                  width: isActive ? '38px' : `${10 + di * 3}px`,
                  height: `${heights[di]}px`,
                  background: isActive
                    ? `linear-gradient(to top, ${ht.accent}, ${ht.tertiary})`
                    : `${ht.accent}18`,
                  boxShadow: isActive ? `0 0 12px ${ht.glow}` : 'none',
                  opacity: isActive ? 1 : 0.5,
                  animation: !isActive ? `v138-barWave ${2 + di * 0.3}s ease-in-out infinite` : undefined,
                  animationDelay: `${di * 0.2}s`,
                }} />
                );
              })}
            </div>

            {/* Page indicators — futuristic pills */}
            <div className="flex items-center gap-3 mt-auto pt-3">
              {values.map((_, vi) => {
                const isActive = vi === currentPage;
                return (
                  <button key={vi}
                    onClick={() => !isTransitioning && vi !== currentPage && (setIsTransitioning(true), setCurrentPage(vi), setTimeout(() => setIsTransitioning(false), 700))}
                    className="cursor-pointer transition-all duration-400"
                    style={{
                      width: isActive ? '36px' : '9px',
                      height: '9px',
                      borderRadius: isActive ? '9999px' : '50%',
                      background: isActive
                        ? `linear-gradient(90deg, ${ht.accent}, ${ht.tertiary})`
                        : 'rgba(255,255,255,0.12)',
                      boxShadow: isActive ? `0 0 16px ${ht.glow}, 0 0 8px ${ht.accent}60` : 'none',
                      border: isActive ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    }}
                    disabled={isTransitioning}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Nav buttons — sleek holographic style */}
        <button onClick={() => !isTransitioning && (setIsTransitioning(true), setCurrentPage(p => (p - 1 + values.length) % values.length), setTimeout(() => setIsTransitioning(false), 800))}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[58%] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${isTransitioning ? 'opacity-25' : 'opacity-75 hover:opacity-100 hover:-translate-x-3'}`}
          disabled={isTransitioning}
          style={{
            background: `linear-gradient(135deg, ${ht.accent}20 0%, ${ht.secondary}12 100%)`,
            border: `1.5px solid ${ht.accent}35`,
            backdropFilter: 'blur(12px)',
            color: ht.accent,
            boxShadow: `0 0 20px ${ht.beam}, inset 0 0 12px ${ht.accent}10`,
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => !isTransitioning && (setIsTransitioning(true), setCurrentPage(p => (p + 1) % values.length), setTimeout(() => setIsTransitioning(false), 800))}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-[58%] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${isTransitioning ? 'opacity-25' : 'opacity-75 hover:opacity-100 hover:translate-x-3'}`}
          disabled={isTransitioning}
          style={{
            background: `linear-gradient(135deg, ${ht.accent}20 0%, ${ht.secondary}12 100%)`,
            border: `1.5px solid ${ht.accent}35`,
            backdropFilter: 'blur(12px)',
            color: ht.accent,
            boxShadow: `0 0 20px ${ht.beam}, inset 0 0 12px ${ht.accent}10`,
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { locale: rawLocale, t } = useLocale();
  const locale = rawLocale || 'en';
  const isRTL = locale === 'ar';
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Load data from API
  // TEMP: Commented out to debug JSX parse error
  // useEffect(() => {
  //   async function loadData() {
  //     try {
  //       // Load settings
  //       const s = await fetchUnifiedSettings();
  //       setSettings(s);
  //     } catch (e) {
  //       console.error('Failed to load site settings:', e);
  //     }

  //     // Load page data from API (for dynamic content from editor)
  //     try {
  //       const pageRes = await fetch(`/api/pages/page_about`);
  //       if (pageRes.ok) {
  //         const page = await pageRes.json();
  //         setPageData(page);
  //         console.log('[About] Loaded page data from API:', page);
  //       } else {
  //         console.log('[About] Page API returned', pageRes.status, '- using i18n fallback');
          
  //         // Fallback: try to load from localStorage (editor saves there too)
  //         if (typeof window !== 'undefined') {
  //           const localData = localStorage.getItem('admin_page_about');
  //           if (localData) {
  //             try {
  //               const parsed = JSON.parse(localData);
  //               setPageData({ blocks: parsed });
  //               console.log('[About] Loaded page data from localStorage fallback');
  //             } catch (e) {
  //               console.warn('[About] Failed to parse localStorage data');
  //             }
  //           }
  //         }
  //       }
  //     } catch (e) {
  //       console.log('[About] Page API not available - trying localStorage fallback');
  //       // Fallback to localStorage
  //       if (typeof window !== 'undefined') {
  //         const localData = localStorage.getItem('admin_page_about');
  //         if (localData) {
  //           try {
  //             const parsed = JSON.parse(localData);
  //             setPageData({ blocks: parsed });
  //           } catch (e) {
  //             // Ignore
  //           }
  //         }
  //       }
  //     } finally {
  //       setPageLoading(false);
  //     }
  //   }
  //   loadData();
  // }, []);

  // Core statistics data
  const stats = [
    { number: 2015, suffix: '', prefix: '', labelKey: 'about.stat.founded', icon: Clock },
    { number: 85, suffix: '+', prefix: '', labelKey: 'about.stat.employees', icon: Users },
    { number: 500, suffix: '+', prefix: '', labelKey: 'about.stat.clients', icon: Award },
    { number: 60, suffix: '+', prefix: '', labelKey: 'about.stat.countries', icon: Globe },
    { number: 5, suffix: '', prefix: '', labelKey: 'about.stat.certifications', icon: ShieldCheck },
    { number: 10, suffix: '+', prefix: '', labelKey: 'about.stat.patents', icon: Cpu },
  ];

  // Timeline data
  const timeline = [
    { year: '2015', titleKey: 'about.timeline.2015.title', descriptionKey: 'about.timeline.2015.description', isLeft: true },
    { year: '2016', titleKey: 'about.timeline.2016.title', descriptionKey: 'about.timeline.2016.description', isLeft: false },
    { year: '2017', titleKey: 'about.timeline.2017.title', descriptionKey: 'about.timeline.2017.description', isLeft: true },
    { year: '2018', titleKey: 'about.timeline.2018.title', descriptionKey: 'about.timeline.2018.description', isLeft: false },
    { year: '2019', titleKey: 'about.timeline.2019.title', descriptionKey: 'about.timeline.2019.description', isLeft: true },
    { year: '2021', titleKey: 'about.timeline.2021.title', descriptionKey: 'about.timeline.2021.description', isLeft: false },
    { year: '2022', titleKey: 'about.timeline.2022.title', descriptionKey: 'about.timeline.2022.description', isLeft: true },
    { year: '2023', titleKey: 'about.timeline.2023.title', descriptionKey: 'about.timeline.2023.description', isLeft: false },
    { year: '2024', titleKey: 'about.timeline.2024.title', descriptionKey: 'about.timeline.2024.description', isLeft: true },
  ];

  // Values data - 5 core values
  const values = [
    { icon: Cpu, titleKey: 'about.values.innovation.title', descriptionKey: 'about.values.innovation.description' },
    { icon: ShieldCheck, titleKey: 'about.values.quality.title', descriptionKey: 'about.values.quality.description' },
    { icon: Users, titleKey: 'about.values.service.title', descriptionKey: 'about.values.service.description' },
    { icon: Globe, titleKey: 'about.values.customer.title', descriptionKey: 'about.values.customer.description' },
    { icon: TrendingUp, titleKey: 'about.values.global.title', descriptionKey: 'about.values.global.description' },
  ];

  // Certifications data
  const certifications = [
    { name: 'CE', fullNameKey: 'about.certifications.ce', icon: CheckCircle },
    { name: 'ISO 9001', fullNameKey: 'about.certifications.iso9001', icon: Award },
    { name: 'ISO 27001', fullNameKey: 'about.certifications.iso27001', icon: ShieldCheck },
    { name: 'ISO 14001', fullNameKey: 'about.certifications.iso14001', icon: Award },
    { name: 'ISO 45001', fullNameKey: 'about.certifications.iso45001', icon: Award },
    { name: '10+ Patents', fullNameKey: 'about.certifications.patents', icon: Cpu },
  ];

  // Industries data - expanded to cover all major sectors
  const industries = [
    { icon: Factory, titleKey: 'about.industries.manufacturing' },
    { icon: Car, titleKey: 'about.industries.automotive' },
    { icon: Zap, titleKey: 'about.industries.electronics' },
    { icon: Building, titleKey: 'about.industries.construction' },
    { icon: Users, titleKey: 'about.industries.food' },
    { icon: Globe, titleKey: 'about.industries.general' },
    { icon: Cpu, titleKey: 'about.industries.aerospace' },
    { icon: Truck, titleKey: 'about.industries.railway' },
    { icon: ShieldCheck, titleKey: 'about.industries.energy' },
    { icon: Award, titleKey: 'about.industries.education' },
  ];

  // Factory capabilities
  const capabilities = [
    { icon: PenTool, titleKey: 'about.capabilities.design', descriptionKey: 'about.capabilities.designDesc' },
    { icon: Settings, titleKey: 'about.capabilities.manufacturing', descriptionKey: 'about.capabilities.manufacturingDesc' },
    { icon: BadgeCheck, titleKey: 'about.capabilities.quality', descriptionKey: 'about.capabilities.qualityDesc' },
  ];

  const contactEmail = settings?.contactEmail || 'sabrina@wstoolcabinet.com';
  const contactPhone = settings?.contactPhone || '+86 156 2216 0659';

  // Helper to check if a value looks like an image URL (defined before IIFE that uses it)
  const isImageUrl = (val: any): boolean => {
    if (typeof val !== 'string' || !val) return false;
    if (val.startsWith('http://') || val.startsWith('https://')) return true;
    if (val.startsWith('/') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(val)) return true;
    if (val.startsWith('data:image/')) return true;
    return false;
  };

  // Extract company image from pageData (set by editor)
  // TEMP: Commented out IIFE to debug JSX parse error
  // const companyImageFromEditor = (() => {
  //   if (!pageData?.blocks) return null;
  //   const blocks = Array.isArray(pageData.blocks) ? pageData.blocks : [];
  //   for (const block of blocks) {
  //     if (block.content?.imageUrl && isImageUrl(block.content.imageUrl)) {
  //       return block.content.imageUrl;
  //     }
  //     if (block.images && block.images.length > 0 && block.images[0].url) {
  //       return block.images[0].url;
  //     }
  //   }
  //   return null;
  // })();
  const companyImageFromEditor = null; // TEMP

  return (
    <div style={{ backgroundColor: '#f0f9ff' }} suppressHydrationWarning>
      {/* Hero Section — Ocean Header */}
      <OceanHeader
        title={t('about.hero.title')}
        subtitle={t('about.hero.description')}
        icon={
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        }
      >
        {/* Breadcrumb inside OceanHeader */}
        <nav className="flex items-center space-x-2 text-sm text-blue-200/80 mb-4">
          <a href={`/${locale}`} className="hover:text-white transition-colors">
            {t('about.breadcrumb.home')}
          </a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">{t('about.breadcrumb.about')}</span>
        </nav>
      </OceanHeader>

      {/* Company Introduction with Icon Cards — Enhanced with gradient bg + bottom waves */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        {/* Subtle animated background gradient */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          background: 'radial-gradient(ellipse at 30% 50%, #3b82f6 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, #8b5cf6 0%, transparent 55%)',
          animation: 'about-intro-bg-pulse 10s ease-in-out infinite alternate',
        }} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Company Image */}
          <div className={`relative h-96 rounded-2xl overflow-hidden shadow-2xl ${isRTL ? 'lg:order-2' : ''}`}>
            <img
              src={companyImageFromEditor || "/images/about/company-hero.svg"}
              alt={t('company.name')}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== "/images/about/company-hero.svg") {
                  target.src = "/images/about/company-hero.svg";
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent flex items-end">
              <div className="p-8 text-white">
                <p className="font-bold text-2xl mb-2">{t('company.name')}</p>
                <p className="text-blue-200 text-lg">{t('company.tagline')}</p>
              </div>
            </div>
          </div>

          {/* Text Content with Icon Cards */}
          <div className={isRTL ? 'lg:order-1 text-right' : ''}>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('about.intro.title')}</h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-lg">
              {t('about.intro.text1')}
            </p>
            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
              {t('about.intro.text2')}
            </p>

            {/* Icon Cards for Key Metrics — Enhanced with gradient colors */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Clock, label: '2015', sublabelKey: 'about.stat.founded', grad: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-50 ring-blue-200' },
                { icon: Globe, label: '60+', sublabelKey: 'about.stat.countries', grad: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-50 ring-emerald-200' },
                { icon: Award, label: '500+', sublabelKey: 'about.stat.clients', grad: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-50 ring-violet-200' },
                { icon: Cpu, label: '10+', sublabelKey: 'about.stat.patents', grad: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-50 ring-amber-200' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="group rounded-xl p-5 border border-gray-100/80 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl" style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.7) 100%)',
                  }}>
                    <div className={`w-11 h-11 mx-auto mb-3 rounded-xl ${item.iconBg} flex items-center justify-center ring-3 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                      <Icon className={`w-5 h-5`} style={{ color: item.grad.includes('blue') ? '#2563eb' : item.grad.includes('emerald') ? '#059669' : item.grad.includes('violet') ? '#7c3aed' : '#d97706' }} strokeWidth={1.8} />
                    </div>
                    <div className="text-2xl font-black text-gray-900 tracking-tight">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-medium">{t(item.sublabelKey)}</div>
                    {/* Subtle top accent line */}
                    <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(90deg, transparent, ${item.grad.split(' ')[0].replace('from-', '')}, transparent)` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===== BOTTOM WAVE ANIMATION — Ocean wave separator ===== */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none" style={{ transform: 'translateY(95%)' }}>
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ height: '100%' }}>
            <defs>
              <linearGradient id="companyWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            {/* Wave layer 1 - back */}
            <path d="M0,40 Q180,10 360,35 T720,30 T1080,40 T1440,25 L1440,100 L0,100Z"
              fill="url(#companyWaveGrad)" opacity="0.4"
              style={{ animation: 'v135-waveBack 9s ease-in-out infinite' }}
            />
            {/* Wave layer 2 - mid */}
            <path d="M0,55 Q200,30 400,55 T800,45 T1200,58 T1440,42 L1440,100 L0,100Z"
              fill="#bae6fd" opacity="0.35"
              style={{ animation: 'v135-waveMid 7s ease-in-out infinite reverse' }}
            />
            {/* Wave layer 3 - front */}
            <path d="M0,68 Q160,52 320,70 T640,62 T960,75 T1280,60 T1440,72 L1440,100 L0,100Z"
              fill="#e0f2fe" opacity="0.5"
              style={{ animation: 'v135-waveFront 5.5s ease-in-out infinite' }}
            />
            {/* Foam line on wave crest */}
            <path d="M0,70 Q160,54 320,72 T640,64 T960,77 T1280,62 T1440,74"
              stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" strokeLinecap="round"
              style={{ animation: 'v135-waveFront 5.5s ease-in-out infinite' }}
            />
          </svg>
        </div>
      </section>

      {/* Core Statistics — Premium card design with depth, color & animation */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #eef2ff 100%)',
      }}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1e40af 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        {/* Floating gradient orbs */}
        <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full blur-3xl opacity-[0.07]" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute bottom-10 right-[10%] w-72 h-72 rounded-full blur-3xl opacity-[0.06]" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section title with accent */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider mb-4 bg-blue-100 text-blue-700">
              {locale === 'zh' ? '核心数据' : locale === 'ar' ? 'بيانات أساسية' : 'Key Metrics'}
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">{t('about.stats.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">{t('about.stats.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              // Premium color palettes with shimmer accents
              const palettes = [
                { name: 'blue',    grad: 'from-blue-600 to-indigo-600',   shadowColor: 'rgba(59,130,246,0.15)', iconBg: '#eff6ff', ringColor: 'rgba(59,130,246,0.2)', textColor: '#2563eb', barColor: '#3b82f6', glowColor: 'rgba(59,130,246,0.25)' },
                { name: 'emerald', grad: 'from-emerald-600 to-teal-600', shadowColor: 'rgba(16,185,129,0.15)', iconBg: '#ecfdf5', ringColor: 'rgba(16,185,129,0.2)', textColor: '#059669', barColor: '#10b981', glowColor: 'rgba(16,185,129,0.25)' },
                { name: 'violet',  grad: 'from-violet-600 to-purple-600', shadowColor: 'rgba(139,92,246,0.15)', iconBg: '#f5f3ff', ringColor: 'rgba(139,92,246,0.2)', textColor: '#7c3aed', barColor: '#8b5cf6', glowColor: 'rgba(139,92,246,0.25)' },
                { name: 'amber',   grad: 'from-amber-500 to-orange-600',  shadowColor: 'rgba(245,158,11,0.15)', iconBg: '#fffbeb', ringColor: 'rgba(245,158,11,0.2)', textColor: '#d97706', barColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.25)' },
                { name: 'rose',    grad: 'from-rose-600 to-pink-600',    shadowColor: 'rgba(225,29,72,0.15)', iconBg: '#fff1f2', ringColor: 'rgba(225,29,72,0.2)', textColor: '#e11d48', barColor: '#f43f5e', glowColor: 'rgba(225,29,72,0.25)' },
                { name: 'cyan',    grad: 'from-cyan-600 to-sky-600',    shadowColor: 'rgba(6,182,212,0.15)', iconBg: '#ecfeff', ringColor: 'rgba(6,182,212,0.2)', textColor: '#0891b2', barColor: '#06b6d4', glowColor: 'rgba(6,182,212,0.25)' },
              ];
              const p = palettes[index % palettes.length];
              return (
                <div key={index} className="group perspective-1000">
                  <div ref={useRef<HTMLDivElement>(null)} className={`relative rounded-2xl p-6 lg:p-8 bg-white/90 backdrop-blur-sm border border-gray-100/80 transition-all duration-700 ease-out group-hover:-translate-y-3 group-hover:shadow-2xl overflow-hidden`}
                    style={{
                      boxShadow: `0 4px 24px ${p.shadowColor}, 0 1px 3px rgba(0,0,0,0.04)`,
                      animation: `statCardEnter 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.12}s both`,
                    }}
                  >
                    {/* Top gradient line with shimmer */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${p.grad} w-full animate-shimmer-bar`} />
                    </div>

                    {/* Rotating gradient border glow on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{
                      background: `conic-gradient(from 0deg at 50% 50%, transparent 0%, ${p.glowColor} 10%, transparent 20%, transparent 80%, ${p.glowColor} 90%, transparent)`,
                      padding: '1px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude',
                    }} />

                    {/* Large colorful rising bubbles instead of tiny dots (v135) */}
                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full opacity-25" style={{
                      background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, ${p.barColor} 50%, transparent 75%)`,
                      boxShadow: `0 0 ${14}px ${p.glowColor}`,
                      animation: `statBubbleFloat ${3 + index * 0.35}s ease-in-out infinite`,
                    }} />
                    <div className="absolute bottom-12 left-5 w-9 h-9 rounded-full opacity-20" style={{
                      background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.85) 0%, ${p.barColor} 45%, transparent 70%)`,
                      boxShadow: `0 0 ${18}px ${p.glowColor}`,
                      animation: `statBubbleFloat ${3.8 + index * 0.3}s ease-in-out infinite reverse`,
                      animationDelay: '1s',
                    }} />

                    <div className="relative z-10">
                      {/* Icon — premium glassmorphic container */}
                      <div className="w-[72px] h-[72px] mx-auto mb-5 relative">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                          background: `conic-gradient(from 0deg, ${p.ringColor}, transparent 60%, ${p.ringColor})`,
                          animation: 'iconRingSpin 4s linear infinite',
                          padding: '2px',
                        }}>
                          <div className="w-full h-full rounded-2xl bg-white" />
                        </div>
                        {/* Main icon container with glass effect */}
                        <div className={`w-full h-full rounded-2xl flex items-center justify-center relative overflow-hidden`}
                          style={{
                            background: `linear-gradient(135deg, ${p.iconBg} 0%, white 100%)`,
                            boxShadow: `inset 0 -2px 6px ${p.shadowColor}, 0 4px 16px ${p.shadowColor}`,
                            border: `1px solid ${p.ringColor}`,
                          }}
                        >
                          {/* Shimmer overlay */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                            style={{ background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%)` }}
                          />
                          <Icon className={`w-8 h-8 ${p.textColor}`} strokeWidth={1.6}
                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
                          />
                        </div>
                        {/* Pulse ring on hover */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{
                          boxShadow: `0 0 0 0 ${p.glowColor}`,
                          animation: 'iconPulse 2s ease-in-out infinite',
                        }} />
                      </div>

                      {/* Number — Animated CountUp with subtle glow */}
                      <div className="text-5xl lg:text-[4.25rem] font-black mb-1.5 tracking-tighter text-center relative" style={{ lineHeight: 1.05, color: '#111827' }}>
                        <CountUp target={stat.number} suffix={stat.suffix} prefix={stat.prefix} locale={locale === 'zh' ? 'zh' : locale} />
                        {/* Number underline accent */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-[2px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 group-hover:w-20"
                          style={{ background: `linear-gradient(90deg, ${p.barColor}, transparent)` }}
                        />
                      </div>

                      {/* Label */}
                      <p className="text-[14px] font-bold uppercase tracking-wider mt-1 text-center text-gray-600">
                        {t(stat.labelKey)}
                      </p>

                      {/* Bottom decorative large bubbles with color variation (v135) */}
                      <div className="flex justify-center gap-2.5 mt-4 opacity-25 group-hover:opacity-50 transition-opacity duration-500">
                        {[...Array(3)].map((_, di) => {
                          const bubbleHues = [p.barColor, p.glowColor, p.textColor];
                          const bSize = 8 + di * 3; // 8, 11, 14px
                          return (
                          <div key={di} className="rounded-full" style={{
                            width: `${bSize}px`,
                            height: `${bSize}px`,
                            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, ${bubbleHues[di]} 50%, transparent 75%)`,
                            boxShadow: `0 0 ${bSize * 0.6}px ${bubbleHues[di]}`,
                            animation: `statBubblePulse ${2 + di * 0.4}s ease-in-out infinite`,
                            animationDelay: `${di * 0.15}s`,
                          }} />
                        )})}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Development Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('about.timeline.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('about.timeline.subtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Vertical line with gradient — enhanced */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-[3px] rounded-full bg-gradient-to-b from-blue-400 via-purple-400 to-emerald-400 opacity-60"
            style={{ boxShadow: '0 0 12px rgba(59,130,246,0.15)' }}
          />

          {/* Timeline items */}
          {timeline.map((item, index) => (
            <TimelineItem
              key={index}
              year={item.year}
              titleKey={item.titleKey}
              descriptionKey={item.descriptionKey}
              isLeft={item.isLeft}
              locale={locale}
              t={t}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Factory Workshop with Capability Cards — Enhanced */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #f0fdfa 0%, #eff6ff 50%, #faf5ff 100%)',
      }}>
        {/* Subtle animated background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #0d9488 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t('about.factory.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.factory.subtitle')}
            </p>
          </div>

          {/* Factory Images Grid — Local images with Glass Effect & Rich Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { src: '/images/about/factory-design.jpg', altKey: 'about.factory.design', label: { en: 'DESIGN', zh: '设计', ar: 'تصميم' }, color: '#3b82f6', desc: { en: 'CAD/CAM engineering center with SolidWorks, UG & DFM analysis', zh: 'CAD/CAM 工程设计中心，支持 SolidWorks、UG 等主流软件，DFM 面向制造设计分析', ar: 'مركز هندسة CAD/CAM مع SolidWorks و UG وتحليل DFM' } },
              { src: '/images/about/factory-cutting.jpg', altKey: 'about.factory.cutting', label: { en: 'CUTTING', zh: '钣金切割', ar: 'قص الصفائح' }, color: '#ef4444', desc: { en: 'High-precision laser cutting + CNC punching, ±0.01mm accuracy', zh: '高精度激光切割 + 数控冲床，精度 ±0.01mm，支持碳钢/不锈钢/铝板多材质', ar: 'قص بالليزر عالي الدقة + قطع CNC، دقة ±0.01mm' } },
              { src: '/images/about/factory-bending.jpg', altKey: 'about.factory.bending', label: { en: 'BENDING', zh: '折弯工艺', ar: 'ثني الصفائح' }, color: '#10b981', desc: { en: 'CNC bending machine 100T/3200, multi-angle complex bending', zh: '数控折弯机 100T/3200，多角度复合折弯，圆弧折弯最小 R0.5', ar: 'ماكينة ثني CNC 100T/3200، ثني زاوي معقد، أدنى نصف قطر R0.5' } },
              { src: '/images/about/factory-assembly.jpg', altKey: 'about.factory.assembly', label: { en: 'ASSEMBLY', zh: '组装流水线', ar: 'خط التجميع' }, color: '#f59e0b', desc: { en: 'Standardized assembly workstations + pneumatic fixtures, 200+ units/day', zh: '标准化装配工作站 + 气动夹具，模块化组装流程，日产能 200+ 台', ar: 'محطات تجميع قياسية + مشابك هوائية، خط تجميع معياري، 200+ وحدة/يوم' } },
              { src: '/images/about/factory-welding.jpg', altKey: 'about.factory.welding', label: { en: 'WELDING', zh: '焊接工艺', ar: 'لحام' }, color: '#dc2626', desc: { en: 'Robotic welding + TIG/MIG manual welding, weld strength 95%+', zh: '机器人焊接 + TIG/MIG 手工焊，氩弧焊保护，焊缝强度达母材 95%+', ar: 'لحام روبوتي + لحام TIG/MIG يدوي، حماية لحام بالغاز الخامل، قوة اللحام 95%+ عام' } },
              { src: '/images/about/factory-quality.jpg', altKey: 'about.factory.quality', label: { en: 'QUALITY CONTROL', zh: '质量检测', ar: 'مراقبة الجودة' }, color: '#06b6d4', desc: { en: 'CMM + optical measuring, ISO 9001 full inspection, zero-defect goal', zh: '三坐标测量仪 + 二次元影像仪，ISO 9001 全检流程，出货零缺陷目标', ar: 'مقياس CMM + قياس بصري، فحص كامل ISO 9001، هدف صفر عيب' } },
            ].map((item, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2" style={{ height: '280px' }}>
                {/* Image with zoom on hover */}
                <img
                  src={item.src}
                  alt={t(item.altKey)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                
                {/* Glass overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                  {/* Glass card content area */}
                  <div className="p-6 w-full backdrop-blur-sm" style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.06) 100%)',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                  }}>
                    {/* Category label badge */}
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-2 text-white/90"
                      style={{ background: `${item.color}25`, border: `1px solid ${item.color}40` }}
                    >
                      {typeof item.label === 'object' ? item.label[locale] || item.label.en : item.label}
                    </span>
                    <h3 className="text-xl font-bold text-white drop-shadow-md">{t(item.altKey)}</h3>
                    <p className="text-sm text-white/70 mt-1.5 leading-relaxed drop-shadow-sm">{typeof item.desc === 'object' ? item.desc[locale] || item.desc.en : item.desc}</p>
                    
                    {/* Decorative glass shimmer line */}
                    <div className="mt-3 h-[2px] rounded-full opacity-50 transition-all duration-500 group-hover:w-full group-hover:opacity-80 w-16"
                      style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                    />
                  </div>
                </div>

                {/* Hover glass reflection effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Capability Cards — Enhanced with richer content & glass effect */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {capabilities.map((cap, index) => {
              const Icon = cap.icon;
              const cardColors = [
                { grad: 'from-blue-600 to-indigo-700', iconBg: 'from-blue-500 to-blue-600', accent: '#3b82f6', lightBg: 'rgba(59,130,246,0.08)', descColor: '#1e40af' },
                { grad: 'from-emerald-600 to-teal-700', iconBg: 'from-emerald-500 to-teal-600', accent: '#059669', lightBg: 'rgba(5,150,105,0.08)', descColor: '#047857' },
                { grad: 'from-violet-600 to-purple-700', iconBg: 'from-violet-500 to-purple-600', accent: '#7c3aed', lightBg: 'rgba(124,58,237,0.08)', descColor: '#5b21b6' },
              ];
              const cc = cardColors[index % cardColors.length];
              
              // Feature list per capability for richer content (multilingual)
              const features = [
                { en: ['Custom CAD/CAM design', 'Rapid prototyping', 'DFM analysis'], zh: ['定制 CAD/CAM 设计', '快速原型制作', 'DFM 面向制造分析'], ar: ['تصميم CAD/CAM مخصص', 'النماذج الأولية السريعة', 'تحليل DFM'] },
                { en: ['CNC machining center', 'Precision ±0.01mm', 'Multi-axis capability'], zh: ['CNC 加工中心', '精度 ±0.01mm', '多轴加工能力'], ar: ['مركز تشغيل CNC', 'دقة ±0.01mm', 'قدرة متعددة المحاور'] },
                { en: ['ISO 9001 certified', '100% inspection rate', 'Traceability system'], zh: ['ISO 9001 认证', '全检率 100%', '可追溯系统'], ar: ['معتمد ISO 9001', 'معدل فحص 100%', 'نظام التتبع'] },
              ];
              
              return (
                <div key={index} className="group rounded-2xl p-8 lg:p-10 border transition-all duration-400 hover:-translate-y-2.5 hover:shadow-2xl relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(248,250,252,0.75) 100%)',
                    borderColor: `${cc.accent}20`,
                    borderWidth: '1px',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {/* Glass shimmer overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                    background: `radial-gradient(circle at 50% 0%, ${cc.lightBg} 0%, transparent 70%)`,
                  }} />
                  
                  {/* Top gradient bar — always visible but subtle */}
                  <div className="absolute top-0 left-0 right-0 h-[4px] rounded-t-2xl opacity-60"
                    style={{ background: `linear-gradient(90deg, ${cc.accent}, transparent)` }}
                  />

                  <div className="relative z-10">
                    {/* Icon — larger with glow */}
                    <div className={`w-20 h-20 bg-gradient-to-br ${cc.iconBg} rounded-2xl flex items-center justify-center mb-7 shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-400`}
                      style={{ boxShadow: `0 8px 24px ${cc.lightBg}` }}
                    >
                      <Icon className="w-10 h-10 text-white drop-shadow-lg" strokeWidth={1.8} />
                    </div>
                    
                    <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300"
                      style={{ backgroundImage: `linear-gradient(90deg, ${cc.accent}, ${index === 1 ? '#14b8a6' : index === 2 ? '#a855f7' : '#6366f1'})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                      {t(cap.titleKey)}
                    </h3>
                    
                    {/* Description — larger and bolder */}
                    <p className="text-gray-600 leading-relaxed text-base font-medium mb-5">{t(cap.descriptionKey)}</p>
                    
                    {/* Feature tags for richer content */}
                    <div className="space-y-2.5">
                      {(features[index][locale] || features[index].en).map((feat, fi) => (
                        <div key={fi} className="flex items-center gap-2.5 text-sm" style={{ color: cc.descColor }}>
                          <CheckCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                          <span className="font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Bottom accent bar */}
                    <div className="mt-6 h-[3px] rounded-full opacity-20 transition-all duration-400 group-hover:w-full group-hover:opacity-50 w-12"
                      style={{ background: `linear-gradient(90deg, ${cc.accent}, transparent)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Company Values — BOOK FLIP ANIMATION (v134) ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #334155 30%, #475569 60%, #64748b 100%)',
      }}>
        {/* Ambient bookshelf pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fbbf24 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {t('about.values.title')}
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </div>

          {/* ===== 3D BOOK WITH PAGE FLIP ===== */}
          <ValuesBookFlip values={values} t={t} locale={locale} />
        </div>
      </section>

      {/* Certifications — Enhanced with shimmer and color */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #eff6ff 0%, #f0fdf4 50%, #fefce8 100%)',
      }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #2563eb 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('about.certifications')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            {t('about.certificationsText')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              // Each cert gets a subtle different color
              const certColors = [
                'rgba(59,130,246,0.12)',   // blue
                'rgba(139,92,246,0.11)',    // violet
                'rgba(16,185,129,0.11)',    // emerald
                'rgba(6,182,212,0.12)',     // cyan
                'rgba(245,158,11,0.11)',    // amber
                'rgba(236,72,153,0.10)',    // pink
              ];
              const iconGradients = [
                'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
              ];
              return (
                <div
                  key={index}
                  className="group rounded-xl p-6 border border-gray-100/80 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.85) 100%)' }}
                >
                  {/* Shimmer overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                    background: `radial-gradient(circle at 50% -20%, ${certColors[index]} 0%, transparent 65%)`,
                  }} />
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300" style={{
                    background: certColors[index],
                    boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.04), 0 4px 14px ${certColors[index]}`,
                  }}>
                    <Icon className="w-7 h-7" style={{ color: index === 0 ? '#2563eb' : index === 1 ? '#7c3aed' : index === 2 ? '#059669' : index === 3 ? '#0891b2' : index === 4 ? '#d97706' : '#db2777' }} />
                    {/* Subtle ring pulse on hover */}
                    <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      style={{ boxShadow: `0 0 0 3px ${certColors[index]}` }}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {t(cert.fullNameKey)}
                  </p>
                  {/* Bottom accent dot */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full opacity-40 transition-opacity duration-300 group-hover:opacity-80"
                    style={{ background: iconGradients[index] }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industries We Serve - Tag Cloud Style */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t('about.industries.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.industries.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {industries.map((industry, index) => {
              const Icon = industry.icon;
              const colors = [
                'from-blue-500 to-blue-600',
                'from-purple-500 to-purple-600',
                'from-green-500 to-green-600',
                'from-orange-500 to-orange-600',
                'from-pink-500 to-pink-600',
                'from-teal-500 to-teal-600',
              ];
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-r ${colors[index % colors.length]} text-white rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-default`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{t(industry.titleKey)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== SUNRISE BEACH CTA v141 — 远处小太阳 + 云朵半遮面 + 空间层次感 ===== */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden"
        style={{
          /* v141: Refined sunrise palette — softer top, warmer mid-gold */
          background: 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 5%, #e0f2fe 10%, #fce7f3 16%, #fecdd3 22%, #fed7aa 30%, #fdba74 40%, #fb923c 50%, #f97316 60%, #ea580c 70%, #dc2626 78%, #f59e0b 86%, #fbbf24 92%, #fef3c7 98%, #fffbeb 100%)',
        }}
      >
        {/* === v141: DISTANT SUN — 小太阳放远处，营造距离感和空间层次 === */}
        <div className="absolute bottom-[46%] left-[8%] sm:left-[12%] pointer-events-none">
          {/* Subtle ambient glow — reduced for distance effect */}
          <div className="absolute -inset-[45px] rounded-full" style={{
            background: 'radial-gradient(circle, rgba(255,250,220,0.2) 0%, rgba(251,191,36,0.08) 25%, rgba(251,146,60,0.03) 50%, transparent 70%)',
            animation: 'v135-sunGlow 5s ease-in-out infinite alternate',
          }} />
          {/* Gentle light rays — fewer, softer for distant sun */}
          <div className="absolute w-28 h-28 sm:w-36 sm:h-36 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {[...Array(8)].map((_, i) => {
              const angle = (i * 360 / 8);
              return (
                <div key={i} className="absolute top-1/2 left-1/2 origin-left" style={{
                  width: `${18 + i * 3}px`,
                  height: `${1.5 + (i % 2) * 0.5}px`,
                  background: `linear-gradient(90deg,
                    rgba(255,250,220,0.35) 0%,
                    rgba(251,191,36,0.12) 35%,
                    transparent 100%)`,
                  transform: `rotate(${angle}deg) translateY(-50%)`,
                  borderRadius: '2px',
                  animation: `v135-rayPulse ${3 + i * 0.15}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.12}s`,
                }} />
              );
            })}
          </div>
          {/* Main sun body — v141: smaller, more distant feel */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full" style={{
            background: 'radial-gradient(circle at 42% 40%, #ffffff 0%, #fffbeb 8%, #fef9c3 20%, #fde047 38%, #facc15 55%, #f59e0b 72%, #d97706 88%, #b45309 100%)',
            boxShadow: `
              0 0 50px rgba(253,224,71,0.45),
              0 0 100px rgba(245,158,11,0.25),
              0 0 180px rgba(217,119,6,0.1),
              inset 3px 3px 12px rgba(255,255,255,0.45),
              inset -3px -2px 8px rgba(180,83,9,0.15)
            `,
            animation: 'v138-sunBreath 6s ease-in-out infinite alternate',
          }}>
            {/* Inner bright core */}
            <div className="absolute rounded-full" style={{
              width: '36%', height: '28%', top: '22%', left: '21%',
              background: 'radial-gradient(ellipse, rgba(255,255,252,0.98) 0%, rgba(255,255,245,0.45) 70%, transparent 85%)',
            }} />
            {/* Surface sunspot */}
            <div className="absolute rounded-full opacity-10" style={{ width: '11%', height: '8%', bottom: '28%', right: '22%', background: 'rgba(180,83,9,0.3)' }} />
          </div>

          {/* ===== v141 NEW: 半遮面云朵 — 云朵遮挡太阳，增加层次 ===== */}
          {/* Cloud A — upper-left soft cloud partially over sun */}
          <div className="absolute -top-6 -left-8 pointer-events-none" style={{
            width: '120px', height: '36px',
            background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.65) 0%, rgba(255,248,230,0.35) 40%, rgba(255,240,220,0.12) 70%, transparent 100%)',
            filter: 'blur(6px)',
            borderRadius: '50%',
            animation: 'v141-cloudFloatA 14s ease-in-out infinite',
          }} />
          <div className="absolute -top-2 -left-4 pointer-events-none" style={{
            width: '80px', height: '26px',
            background: 'radial-gradient(ellipse at 50% 55%, rgba(255,255,255,0.5) 0%, rgba(255,245,225,0.25) 50%, transparent 80%)',
            filter: 'blur(5px)',
            borderRadius: '50%',
            animation: 'v141-cloudFloatB 11s ease-in-out infinite reverse',
          }} />
          {/* Cloud B — right side wispy cloud */}
          <div className="absolute top-2 -right-10 pointer-events-none" style={{
            width: '90px', height: '28px',
            background: 'radial-gradient(ellipse at 60% 50%, rgba(255,255,255,0.4) 0%, rgba(255,245,235,0.2) 45%, transparent 75%)',
            filter: 'blur(7px)',
            borderRadius: '50%',
            animation: 'v141-cloudFloatC 17s ease-in-out infinite 2s',
          }} />
          {/* Cloud C — lower semi-transparent veil across sun bottom */}
          <div className="absolute -bottom-3 -right-4 pointer-events-none" style={{
            width: '100px', height: '22px',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(255,240,220,0.3) 0%, rgba(255,230,200,0.12) 40%, transparent 70%)',
            filter: 'blur(8px)',
            borderRadius: '50%',
            animation: 'v141-cloudFloatA 13s ease-in-out infinite 4s',
          }} />
        </div>

        {/* === ATMOSPHERIC CLOUDS — soft layered clouds near horizon (v139) === */}
        <div className="absolute top-[8%] left-0 right-0 pointer-events-none" style={{ height: '18%' }}>
          {/* Cloud layer 1 — distant, soft */}
          <div className="absolute top-[30%] left-[12%] w-48 h-10 rounded-full opacity-40"
            style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 70%)', filter: 'blur(8px)', animation: 'v139-cloudDrift 25s ease-in-out infinite' }}
          />
          <div className="absolute top-[45%] right-[18%] w-64 h-12 rounded-full opacity-30"
            style={{ background: 'radial-gradient(ellipse, rgba(255,248,220,0.5) 0%, transparent 70%)', filter: 'blur(10px)', animation: 'v139-cloudDrift 20s ease-in-out infinite reverse' }}
          />
          {/* Cloud layer 2 — mid, slightly defined */}
          <div className="absolute top-[55%] left-[35%] w-56 h-8 rounded-full opacity-25"
            style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 65%)', filter: 'blur(6px)', animation: 'v139-cloudDrift 18s ease-in-out infinite 2s' }}
          />
          {/* Golden hour glow band at horizon */}
          <div className="absolute bottom-0 left-0 right-0 h-8 rounded-full opacity-60"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.15) 20%, rgba(251,146,60,0.2) 50%, rgba(251,191,36,0.15) 80%, transparent 100%)', filter: 'blur(4px)' }}
          />
        </div>

            {/* Seagulls in sky — 海鸥飞过日出天空 (v137) */}
          <div className="absolute top-[1%] left-0 right-0 pointer-events-none overflow-visible" style={{ height: '22%' }}>
            {/* Gull 1 — main soaring gull, prominent */}
            <svg className="absolute" style={{ left: '5%', top: '18%', width: '46px', height: '25px', animation: 'v137-gullSoar1 11s ease-in-out infinite' }} viewBox="0 0 48 26">
              <path d="M0,13 Q12,-6 24,13 Q36,-6 48,13" fill="none" stroke="rgba(55,38,28,0.65)" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            {/* Gull 2 — high distant */}
            <svg className="absolute" style={{ left: '68%', top: '5%', width: '34px', height: '19px', animation: 'v137-gullSoar2 8s ease-in-out infinite 1.2s' }} viewBox="0 0 34 19">
              <path d="M0,9.5 Q8.5,-3 17,9.5 Q25.5,-3 34,9.5" fill="none" stroke="rgba(55,38,28,0.48)" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M0,7.5 Q6.5,-2 13,7.5 Q19.5,-2 26,7.5" fill="none" stroke="rgba(60,40,30,0.40)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            {/* Gull 3 — distant, wing tips only */}
            <svg className="absolute" style={{ left: '45%', top: '35%', width: '18px', height: '10px', animation: 'v137-gullSoar3 14s ease-in-out infinite 0.8s' }} viewBox="0 0 18 10">
              <path d="M0,5 Q4.5,-1 9,5 Q13.5,-1 18,5" fill="none" stroke="rgba(60,40,30,0.28)" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
          </div>
          {/* === OCEAN WAVES — 三层海浪 + 泡沫高光 (v135) === */}
          <div className="absolute bottom-[16%] left-0 right-0 h-[26%] overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ height: '100%' }}>
            <defs>
              <linearGradient id="oceanGrad135" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0369a1" stopOpacity="0.82" />
                <stop offset="50%" stopColor="#075985" stopOpacity="0.90" />
                <stop offset="100%" stopColor="#0c4a6e" stopOpacity="1" />
              </linearGradient>
              <filter id="waveGlow135">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Layer 1 — Deep back wave */}
            <path d="M0,130 Q200,85 400,118 T800,108 T1200,125 T1440,105 L1440,220 L0,220Z"
              fill="url(#oceanGrad135)" opacity="0.45"
              style={{ animation: 'v135-waveBack 9s ease-in-out infinite' }}
            />
            {/* Layer 2 — Mid wave */}
            <path d="M0,145 Q240,105 480,138 T960,128 T1440,140 L1440,220 L0,220Z"
              fill="#0ea5e9" opacity="0.62"
              style={{ animation: 'v135-waveMid 7s ease-in-out infinite reverse' }}
            />
            {/* Layer 3 — Front wave with foam */}
            <path d="M0,162 Q180,138 380,168 T760,155 T1140,172 T1440,158 L1440,220 L0,220Z"
              fill="#38bdf8" opacity="0.80"
              style={{ animation: 'v135-waveFront 5.5s ease-in-out infinite', filter: 'url(#waveGlow135)' }}
            />
            {/* Foam highlight line on wave crest */}
            <path d="M0,164 Q180,140 380,170 T760,157 T1140,174 T1440,160"
              stroke="rgba(255,255,255,0.42)" strokeWidth="2.5" fill="none"
              strokeLinecap="round"
              style={{ animation: 'v135-waveFront 5.5s ease-in-out infinite' }}
            />
            {/* Secondary foam line */}
            <path d="M0,150 Q240,115 440,148 T880,135 T1320,152 T1440,142"
              stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" fill="none"
              style={{ animation: 'v135-waveMid 7s ease-in-out infinite' }}
            />

            {/* Sparkles on water surface */}
            {[...Array(8)].map((_, si) => (
              <circle key={si} cx={`${120 + si * 165}`} cy={`${145 + (si % 3) * 14}`} r={1.2 + (si % 2) * 0.6}
                fill="white" opacity={0.22 + (si % 3) * 0.1}
                style={{ animation: `v135-sparkle ${2 + si * 0.35}s ease-in-out infinite`, animationDelay: `${si * 0.45}s` }}
              />
            ))}
            {/* Fish silhouettes in water (v138) */}
            <g style={{ opacity: 0.35 }}>
              <path d="M320,185 Q340,175 365,183 Q355,195 340,192 Q355,200 365,195 Q340,205 320,195 Q330,190 320,185Z" fill="#0c4a6e" style={{ animation:'v137-fishSwim1 7s ease-in-out infinite' }} />
              <path d="M780,192 Q800,182 825,190 Q815,202 800,199 Q815,207 825,202 Q800,212 780,202 Q790,197 780,192Z" fill="#075985" style={{ animation:'v137-fishSwim2 9s ease-in-out infinite 1.2s' }} />
              <path d="M1050,188 Q1065,180 1085,187 Q1075,197 1062,194 Q1075,204 1085,200 Q1065,210 1050,200 Q1058,195 1050,188Z" fill="#0c4a6e" style={{ animation:'v137-fishSwim3 6s ease-in-out infinite 0.6s' }} />
            </g>
            {/* Air bubbles rising from water */}
            {[...Array(5)].map((_, bi) => (
              <circle key={bi} cx={`${480 + bi * 155}`} cy={`${178 + (bi % 2) * 8}`} r={0.8 + (bi % 3) * 0.4}
                fill="rgba(255,255,255,0.18)" style={{ animation:`v137-bubbleRise ${3.5 + bi * 0.5}s ease-in infinite`, animationDelay:`${bi * 0.7}s` }} />
            ))}
          </svg>
        </div>

        {/* === SANDY BEACH — 沙滩纹理 + 远近层次 (v135) === */}
        <div className="absolute bottom-0 left-0 right-0 h-[22%] overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 210" preserveAspectRatio="none" style={{ height: '100%' }}>
            <defs>
              <filter id="sandTexture135" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" result="noise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.93 0 0 0  0 0.65 0 0 0  0 0 0 0.2 0" in="noise" result="coloredNoise" />
                <feBlend in="SourceGraphic" in2="coloredNoise" mode="multiply" />
              </filter>
            </defs>
            {/* Far beach — lightest, atmospheric haze */}
            <path d="M0,210 L0,125 Q270,88 540,120 Q810,82 1080,115 Q1260,92 1440,122 L1440,210Z"
              fill="#fef9c3" opacity="0.50" />
            {/* Mid beach */}
            <path d="M0,210 L0,152 Q230,118 450,155 Q680,122 900,156 Q1120,130 1330,158 L1440,168 L1440,210Z"
              fill="#fef08a" opacity="0.76" />
            {/* Near beach with texture */}
            <path d="M0,210 L0,178 Q280,152 560,188 Q840,156 1120,186 Q1280,168 1440,190 L1440,210Z"
              fill="#fde68a" filter="url(#sandTexture135)" />
            {/* Frontmost sand — warm golden tone */}
            <path d="M0,210 L0,195 Q320,176 640,198 Q960,172 1280,196 Q1380,188 1440,200 L1440,210Z"
              fill="#fcd34d" />
            {/* Wet sand darker strip near water edge */}
            <path d="M0,210 Q360,195 720,204 Q1080,194 1440,206 L1440,210Z"
              fill="#fbbf24" opacity="0.6" />
            {/* Sand ripple textures */}
            <path d="M0,212 Q370,200 750,208 Q1100,198 1440,209" stroke="rgba(217,119,6,0.08)" strokeWidth="1" fill="none" />
            <path d="M0,222 Q400,214 780,218 Q1160,213 1440,221" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" fill="none" />
            {/* Sand footprints — MORE VISIBLE (v138) */}
            <g style={{ opacity: 0.32 }}>
              {/* Footprint 1 — left foot */}
              <ellipse cx="320" cy="208" rx="8" ry="14" fill="#fde68a" transform="rotate(-8 320 208)" />
              <circle cx="316" cy="196" r="3.2" fill="#fde68a" />
              <circle cx="322" cy="195" r="2.8" fill="#fde68a" />
              <circle cx="327" cy="196" r="2.5" fill="#fde68a" />
              <circle cx="314" cy="200" r="2" fill="#fde68a" />
              {/* Footprint 2 — right foot */}
              <ellipse cx="345" cy="212" rx="8" ry="14" fill="#fcd34d" transform="rotate(5 345 212)" />
              <circle cx="341" cy="200" r="3" fill="#fcd34d" />
              <circle cx="347" cy="199" r="2.6" fill="#fcd34d" />
              <circle cx="352" cy="200" r="2.3" fill="#fcd34d" />
              <circle cx="339" cy="204" r="1.9" fill="#fcd34d" />
              {/* Footprint 3 — left foot, further */}
              <ellipse cx="880" cy="206" rx="7" ry="13" fill="#fde68a" transform="rotate(-3 880 206)" />
              <circle cx="877" cy="195" r="2.8" fill="#fde68a" />
              <circle cx="882" cy="194" r="2.4" fill="#fde68a" />
              <circle cx="887" cy="195" r="2.1" fill="#fde68a" />
              {/* Footprint 4 — right foot */}
              <ellipse cx="905" cy="210" rx="7.5" ry="13.5" fill="#fcd34d" transform="rotate(7 905 210)" />
              <circle cx="902" cy="198" r="2.9" fill="#fcd34d" />
              <circle cx="907" cy="197" r="2.5" fill="#fcd34d" />
              <circle cx="912" cy="198" r="2.2" fill="#fcd34d" />
            </g>
          </svg>
          {/* Sand particles drifting */}
          {[...Array(10)].map((_, pi) => (
            <div key={pi} className="absolute rounded-sm pointer-events-none" style={{
              left: `${3 + pi * 10}%`,
              bottom: `${2 + (pi % 4) * 4}%`,
              width: 1.5 + (pi % 3) * 0.5,
              height: 1.5 + (pi % 3) * 0.5,
              background: pi % 3 === 0 ? '#fef08a' : pi % 3 === 1 ? 'rgba(253,218,138,0.65)' : 'rgba(255,255,255,0.35)',
              animation: `v135-sandDrift ${3.5 + (pi % 3) * 1.2}s ease-in-out infinite`,
              animationDelay: `${pi * 0.32}s`,
            }} />
          ))}
        </div>

        {/* Content — centered, elevated above waves (v140: dark text for bright sky) */}
        <div className="max-w-4xl mx-auto text-center relative z-10 pt-4 pb-36">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 drop-shadow-lg"
            style={{
              color: '#1e293b',
              textShadow: '0 2px 8px rgba(255,255,255,0.6), 0 0 30px rgba(251,191,36,0.15)',
            }}
          >{t('about.cta.title')}</h2>
          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#334155', textShadow: '0 1px 4px rgba(255,255,255,0.4)' }}
          >{t('about.cta.subtitle')}</p>

          {/* Buttons — sunrise themed with enhanced glow (v139) */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-8">
            <a href={`/${locale}/contact`} className="group relative inline-flex items-center justify-center px-10 py-4.5 font-bold rounded-full overflow-hidden cursor-pointer text-base transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 30%,#fde68a 60%,#fbbf24 100%)',
                color: '#92400e',
                boxShadow: '0 8px 32px rgba(146,64,14,0.35), 0 0 0 1.5px rgba(255,255,255,0.6), 0 0 50px rgba(253,218,109,0.25), inset 0 1px 0 rgba(255,255,255,0.5)',
              }}
            >
              <span style={{ position:'relative',zIndex:10,display:'inline-flex',alignItems:'center',gap:'6px' }}>{t('nav.contact')}<ChevronRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
            </a>
            <a href={`tel:${contactPhone.replace(/\s/g,'')}`}
              className="group relative inline-flex items-center justify-center px-10 py-4.5 font-bold rounded-full overflow-hidden cursor-pointer text-base text-white transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(135deg,rgba(255,255,255,0.28),rgba(255,255,255,0.12))',
                border: '1.5px solid rgba(255,255,255,0.45)',
                backdropFilter: 'blur(16px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2),0 6px 24px rgba(0,0,0,0.15), 0 0 40px rgba(251,191,36,0.1)',
              }}
            ><ChevronRight className="mr-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />{contactPhone}</a>
          </div>

          <div className="flex items-center justify-center drop-shadow-sm" style={{ color:'#bae6fd', fontSize: '14px' }}>
            <span>{contactEmail}</span>
          </div>
        </div>
      </section>

      {/* ===== ALL ANIMATION KEYFRAMES (v134) ===== */}
      <style>{`
        /* ===== Premium stat card animations ===== */
        @keyframes statCardEnter {
          0%{opacity:0;transform:translateY(40px) scale(0.92);filter:blur(4px)}
          60%{opacity:1;transform:translateY(-6px) scale(1.02);filter:blur(0)}
          100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}
        }
        @keyframes floatParticle {
          0%,100%{transform:translate(0,0) scale(1);opacity:0.2}
          33%{transform:translate(6px,-10px) scale(1.3);opacity:0.35}
          66%{transform:translate(-4px,6px) scale(0.8);opacity:0.15}
        }
        @keyframes statBubbleFloat {
          0%,100%{transform:translate(0,0) translateY(0) scale(1);opacity:0.2}
          25%{opacity:0.4; transform:translate(8px,-12px) scale(1.15)}
          50%{opacity:0.28; transform:translate(-5px,8px) scale(0.9)}
          75%{opacity:0.35; transform:translate(4px,-6px) scale(1.05)}
        }
        @keyframes statBubblePulse {
          0%,100%{transform:scale(1); opacity:0.25; box-shadow: 0 0 5px currentColor}
          50%{transform:scale(1.25); opacity:0.45; box-shadow: 0 0 12px currentColor}
        }
        @keyframes iconRingSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes iconPulse {
          0%{box-shadow:0 0 0 0 var(--glow, rgba(59,130,246,0.25))}
          50%{box-shadow:0 0 0 12px transparent}
          100%{box-shadow:0 0 0 0 transparent}
        }
        @keyframes shimmer-bar {
          0%{transform:translateX(-100%)} 100%{transform:translateX(200%)}
        }
        @keyframes about-intro-bg-pulse { 0%{opacity:.03;transform:scale(1)} 100%{opacity:.07;transform:scale(1.05)} }

        /* ===== Beach CTA animations (v135 — Real sun + Ocean waves + Sand) ===== */
        @keyframes v135-sunBreath {
          0%{transform:scale(1); filter:brightness(1) saturate(1.1)}
          100%{transform:scale(1.04); filter:brightness(1.06) saturate(1.2)}
        }
        /* v138 sunrise enhancements */
        @keyframes v138-coronaPulse {
          0%{opacity:0.3; transform:scale(1)}
          100%{opacity:0.6; transform:scale(1.08)}
        }
        @keyframes v138-raySweep {
          0%{opacity:0.08; transform:rotate(var(--r, 0deg)) scaleX(1)}
          100%{opacity:0.18; transform:rotate(var(--r, 0deg)) scaleX(1.15)}
        }
        @keyframes v138-rayPulse {
          0%{opacity:0.4; transform:rotate(var(--r, 0deg)) translateY(-50%) scaleX(1) scaleY(1)}
          100%{opacity:0.8; transform:rotate(var(--r, 0deg)) translateY(-50%) scaleX(1.12) scaleY(1.3)}
        }
        @keyframes v138-sunBreath {
          0%{transform:scale(1); filter:brightness(1) saturate(1.15)}
          50%{transform:scale(1.03); filter:brightness(1.04) saturate(1.25)}
          100%{transform:scale(1.05); filter:brightness(1.07) saturate(1.2)}
        }
        @keyframes v135-sunGlow {
          0%{opacity:0.3; transform:scale(1)}
          100%{opacity:0.55; transform:scale(1.08)}
        }
        @keyframes v135-rayPulse {
          0%{opacity:0.25; transform:rotate(var(--r,0)) translateY(-50%) scaleX(1)}
          100%{opacity:0.65; transform:rotate(var(--r,0)) translateY(-50%) scaleX(1.15)}
        }
        @keyframes v135-waveBack {
          0%,100%{transform:translateX(0) translateY(0)}
          50%{transform:translateX(-22px) translateY(-4px)}
        }
        @keyframes v135-waveMid {
          0%,100%{transform:translateX(0) translateY(0)}
          50%{transform:translateX(28px) translateY(3px)}
        }
        @keyframes v135-waveFront {
          0%,100%{transform:translateX(0) translateY(0)}
          50%{transform:translateX(-18px) translateY(-5px)}
        }
        @keyframes v135-sparkle {
          0%,100%{opacity:0.18; transform:scale(1)}
          50%{opacity:0.55; transform:scale(1.5)}
        }
        @keyframes v135-sandDrift {
          0%{transform:translateY(0) translateX(0); opacity:0.4}
          50%{transform:translateY(-3px) translateX(2px); opacity:0.8}
          100%{transform:translateY(0) translateX(-1px); opacity:0.4}
        }

        /* ===== Premium Holographic 3D Display animations (v138) ===== */
        @keyframes v138-ambientPulse {
          0%{opacity:0.4; transform:scale(1)}
          100%{opacity:0.7; transform:scale(1.08)}
        }
        @keyframes v138-beamPulse {
          0%,100%{opacity:0.35; transform:scaleY(1)}
          50%{opacity:0.65; transform:scaleY(1.12)}
        }
        @keyframes v138-holoFloat {
          0%,100%{transform:perspective(1400px) translateY(0) rotateX(0.15deg) rotateY(-0.2deg)}
          25%{transform:perspective(1400px) translateY(-10px) rotateX(-0.1deg) rotateY(0.35deg)}
          50%{transform:perspective(1400px) translateY(-5px) rotateX(0.08deg) rotateY(-0.4deg)}
          75%{transform:perspective(1400px) translateY(-8px) rotateX(-0.05deg) rotateY(0.25deg)}
        }
        @keyframes v138-scanLine {
          0%{top:-4%; opacity:0}
          6%{opacity:1}
          94%{opacity:1}
          100%{top:104%; opacity:0}
        }
        @keyframes v138-hexRotate { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes v138-ringPulse {
          0%,100%{opacity:0.2; transform:scale(0.96); borderWidth:'1px'}
          50%{opacity:0.55; transform:scale(1.06); borderWidth:'2px'}
        }
        @keyframes v138-arcSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes v138-dustFloat {
          0%{transform:translate(0,0); opacity:0.15}
          33%{transform:translate(8px,-18px); opacity:0.38}
          66%{transform:translate(-6px,-10px); opacity:0.22}
          100%{transform:translate(0,0); opacity:0.15}
        }
        @keyframes v138-nodePulse {
          0%,100%{opacity:0.35; transform:scale(1)}
          50%{opacity:0.7; transform:scale(1.6); box-shadow:0 0 14px currentColor}
        }
        @keyframes v138-chipDrift {
          0%{transform:translateX(0) translateY(0); opacity:0.2}
          33%{transform:translateX(12px) translateY(-8px); opacity:0.35}
          66%{transform:translateX(-8px) translateY(-4px); opacity:0.2}
          100%{transform:translateX(0) translateY(0); opacity:0.2}
        }
        @keyframes v138-barWave {
          0%,100%{opacity:0.45; transform:scaleY(0.7)}
          50%{opacity:0.85; transform:scaleY(1.15)}
        }
        /* ===== v137 Beach CTA enhancements ===== */
        @keyframes v137-gullSoar1 {
          0%{transform:translate(0,0) scale(0.9); opacity:0.5}
          25%{transform:translate(40px,-28px) scale(1.05); opacity:0.7}
          50%{transform:translate(90px,-12px) scale(0.95); opacity:0.55}
          75%{transform:translate(150px,-30px) scale(1.1); opacity:0.65}
          100%{transform:translate(220px,-8px) scale(0.88); opacity:0.4}
        }
        @keyframes v137-gullSoar2 {
          0%{transform:translate(0,0) scale(0.7); opacity:0.35}
          30%{transform:translate(-35px,-18px) scale(0.85); opacity:0.55}
          60%{transform:translate(-80px,-6px) scale(0.75); opacity:0.4}
          100%{transform:translate(-140px,-22px) scale(0.68); opacity:0.25}
        }
        @keyframes v137-gullSoar3 {
          0%{transform:translate(0,0) scale(0.5); opacity:0.2}
          40%{transform:translate(60px,-14px) scale(0.6); opacity:0.35}
          100%{transform:translate(160px,-4px) scale(0.45); opacity:0.15}
        }
        @keyframes v137-fishSwim1 {
          0%{transform:translate(0,0) scale(0.9); opacity:0.2}
          50%{transform:translate(30px,-8px) scale(1.05); opacity:0.35}
          100%{transform:translate(-10px,5px) scale(0.85); opacity:0.15}
        }
        @keyframes v137-fishSwim2 {
          0%{transform:translate(0,0) scale(0.85); opacity:0.18}
          50%{transform:translate(-25px,6px) scale(1); opacity:0.3}
          100%{transform:translate(15px,-4px) scale(0.8); opacity:0.12}
        }
        @keyframes v137-fishSwim3 {
          0%{transform:translate(0,0) scale(0.95); opacity:0.22}
          50%{transform:translate(20px,7px) scale(1.1); opacity:0.38}
          100%{transform:translate(-15px,-6px) scale(0.82); opacity:0.1}
        }
        @keyframes v137-bubbleRise {
          0%{transform:translate(0,0); opacity:0.18}
          40%{transform:translate(8px,-25px); opacity:0.28}
          100%{transform:translate(-5px,-60px); opacity:0}
        }
        /* v139 CTA cloud drift */
        @keyframes v139-cloudDrift {
          0%{transform:translateX(0); opacity:1}
          50%{transform:translateX(25px); opacity:0.7}
          100%{transform:translateX(0); opacity:1}
        }
        /* ===== v141: Enhanced sci-fi animations ===== */
        @keyframes v141-binRain {
          0%{transform:translateY(-40px); opacity:0}
          10%{opacity:1}
          90%{opacity:0.6}
          100%{transform:translateY(480px); opacity:0}
        }
        @keyframes v141-dataSweep {
          0%{width:0; left:0; opacity:0}
          20%{opacity:1}
          80%{opacity:0.7}
          100%{width:100%; left:100%; opacity:0}
        }
        @keyframes v141-pulseRing {
          0%{transform:scale(0.3); opacity:0.5}
          50%{opacity:0.15}
          100%{transform:scale(2.5); opacity:0}
        }
        @keyframes v141-cloudFloatA {
          0%,100%{transform:translate(0,0) scale(1); opacity:1}
          33%{transform:translate(8px,-4px) scale(1.04); opacity:0.85}
          66%{transform:translate(-5px,3px) scale(0.97); opacity:0.92}
        }
        @keyframes v141-cloudFloatB {
          0%,100%{transform:translate(0,0) scale(1); opacity:1}
          33%{transform:translate(-6px,2px) scale(1.03); opacity:0.88}
          66%{transform:translate(7px,-3px) scale(0.98); opacity:0.9}
        }
        @keyframes v141-cloudFloatC {
          0%,100%{transform:translate(0,0); opacity:0.8}
          40%{transform:translate(10px,5px); opacity:0.6}
          70%{transform:translate(-6px,-2px); opacity:0.75}
        }
      `}</style>
    </div>
  );
}
