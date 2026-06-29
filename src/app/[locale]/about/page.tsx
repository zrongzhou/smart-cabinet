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
  const [isFlipping, setIsFlipping] = useState(false);

  // Auto-flip every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [values.length]);

  const handleNext = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % values.length);
      setIsFlipping(false);
    }, 600);
  };

  const handlePrev = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage((prev) => (prev - 1 + values.length) % values.length);
      setIsFlipping(false);
    }, 600);
  };

  // Color palette per value page
  const pageColors = [
    { accent: '#0ea5e9', grad: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)', iconBg: 'rgba(14,165,233,0.15)', descColor: '#bae6fd' },
    { accent: '#10b981', grad: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)', iconBg: 'rgba(16,185,129,0.15)', descColor: '#a7f3d0' },
    { accent: '#8b5cf6', grad: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', iconBg: 'rgba(139,92,246,0.15)', descColor: '#ddd6fe' },
    { accent: '#f59e0b', grad: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)', iconBg: 'rgba(245,158,11,0.15)', descColor: '#fef3c7' },
    { accent: '#ec4899', grad: 'linear-gradient(135deg, #db2777 0%, #ec4899 50%, #f472b6 100%)', iconBg: 'rgba(236,72,153,0.15)', descColor: '#fce7f3' },
  ];

  const current = values[currentPage];
  const Icon = current.icon;
  const pc = pageColors[currentPage % pageColors.length];

  return (
    <div className="flex justify-center" style={{ perspective: '1500px' }}>
      {/* ===== BOOK CONTAINER ===== */}
      <div
        className="relative w-full max-w-[720px] mx-auto"
        style={{
          transformStyle: 'preserve-3d',
          animation: 'bookFloat 6s ease-in-out infinite',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused'; }}
        onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running'; }}
      >
        {/* Book shadow/floor */}
        <div className="absolute -bottom-8 left-[8%] right-[8%] h-6 rounded-full blur-xl"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        />

        {/* Book body */}
        <div className="relative rounded-lg overflow-hidden shadow-2xl border border-white/10"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
            transformStyle: 'preserve-3d',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6), inset -2px 0 8px rgba(0,0,0,0.08)',
          }}
        >
          {/* Spine (left edge) */}
          <div className="absolute top-0 left-0 bottom-0 w-4 sm:w-6 rounded-l-lg"
            style={{
              background: 'linear-gradient(180deg, #78716c 0%, #a8a29e 20%, #d6d3d1 45%, #a8a29e 70%, #78716c 100%)',
              boxShadow: 'inset -3px 0 8px rgba(0,0,0,0.25), 3px 0 12px rgba(0,0,0,0.08)',
              borderRight: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {/* Spine decoration lines */}
            {[...Array(8)].map((_, li) => (
              <div key={li} className="absolute left-1/2 -translate-x-1/2 h-[1px]"
                style={{
                  width: '40%',
                  top: `${12 + li * 11}%`,
                  background: `rgba(120,113,108,${0.15 + (li % 2) * 0.1})`,
                }}
              />
            ))}
            {/* Bookmark ribbon */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-1.5 py-4 rounded-b-md text-xs font-bold tracking-wider rotate-[-4deg]"
              style={{
                background: pc.grad,
                color: 'white',
                fontSize: '9px',
                letterSpacing: '0.08em',
                animation: 'bookmarkPulse 3s ease-in-out infinite',
                boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
              }}
            >
              {String(currentPage + 1).padStart(2, '0')}
            </div>
          </div>

          {/* Page content area */}
          <div
            className="min-h-[380px] sm:min-h-[420px] p-6 sm:p-10 pl-10 sm:pl-14 relative overflow-hidden transition-all duration-500"
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              transform: isFlipping ? 'rotateY(-15deg)' : 'rotateY(0deg)',
              opacity: isFlipping ? 0.6 : 1,
            }}
          >
            {/* Page corner fold effect */}
            <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-[18px] h-[18px] origin-top-right rotate-45 translate-x-[2px] translate-y-[2px]"
                style={{ background: 'linear-gradient(135deg, rgba(241,245,249,1) 0%, rgba(226,232,240,1) 100%)', boxShadow: '-2px 2px 6px rgba(0,0,0,0.06)' }}
              />
            </div>

            {/* Page number top-right */}
            <div className="absolute top-4 right-5 text-xs font-mono text-slate-300">
              — {currentPage + 1}/{values.length} —
            </div>

            {/* Value Content */}
            <div className="flex flex-col items-center text-center pt-4">
              {/* Icon in a decorative circle */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-6 relative"
                style={{
                  background: pc.iconBg,
                  border: `2px solid ${pc.accent}30`,
                  boxShadow: `0 0 24px ${pc.iconBg}, inset 0 -3px 8px ${pc.accent}15`,
                }}
              >
                <Icon className="w-9 h-9 sm:w-11 sm:h-11" style={{ color: pc.accent }} strokeWidth={1.6} />
                {/* Rotating ring around icon */}
                <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                  border: `2px solid transparent`,
                  borderTopColor: pc.accent,
                  animation: 'iconRingSpin 6s linear infinite',
                }} />
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-black mb-4 leading-tight"
                style={{ color: '#1e293b' }}
              >
                {t(current.titleKey)}
              </h3>

              {/* Description */}
              <p className="text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-6"
                style={{ color: '#475569' }}
              >
                {t(current.descriptionKey)}
              </p>

              {/* Decorative line */}
              <div className="h-[3px] rounded-full w-20 mx-auto mb-6 opacity-40"
                style={{ background: `linear-gradient(90deg, ${pc.accent}, transparent)` }}
              />

              {/* Progress dots for pages */}
              <div className="flex items-center gap-2 mt-2">
                {values.map((_, vi) => (
                  <button key={vi}
                    onClick={() => { if (!isFlipping && vi !== currentPage) { setIsFlipping(true); setTimeout(() => { setCurrentPage(vi); setIsFlipping(false); }, 400); } }}
                    className="rounded-full transition-all duration-300 cursor-pointer"
                    style={{
                      width: vi === currentPage ? '24px' : '8px',
                      height: '8px',
                      background: vi === currentPage ? pc.grad : 'rgba(148,163,184,0.3)',
                      boxShadow: vi === currentPage ? `0 0 8px ${pc.accent}40` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[60%] w-11 h-11 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 bg-white/90 hover:bg-white shadow-lg border border-slate-200 transition-all duration-200 hover:-translate-x-2 z-20 disabled:opacity-30"
          disabled={isFlipping}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[60%] w-11 h-11 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 bg-white/90 hover:bg-white shadow-lg border border-slate-200 transition-all duration-200 hover:translate-x-2 z-20 disabled:opacity-30"
          disabled={isFlipping}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { locale, t } = useLocale();
  const isRTL = locale === 'ar';
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    async function loadData() {
      try {
        // Load settings
        const s = await fetchUnifiedSettings();
        setSettings(s);
      } catch (e) {
        console.error('Failed to load site settings:', e);
      }

      // Load page data from API (for dynamic content from editor)
      try {
        const pageRes = await fetch(`/api/pages/page_about`);
        if (pageRes.ok) {
          const page = await pageRes.json();
          setPageData(page);
          console.log('[About] Loaded page data from API:', page);
        } else {
          console.log('[About] Page API returned', pageRes.status, '- using i18n fallback');
          
          // Fallback: try to load from localStorage (editor saves there too)
          if (typeof window !== 'undefined') {
            const localData = localStorage.getItem('admin_page_about');
            if (localData) {
              try {
                const parsed = JSON.parse(localData);
                setPageData({ blocks: parsed });
                console.log('[About] Loaded page data from localStorage fallback');
              } catch (e) {
                console.warn('[About] Failed to parse localStorage data');
              }
            }
          }
        }
      } catch (e) {
        console.log('[About] Page API not available - trying localStorage fallback');
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          const localData = localStorage.getItem('admin_page_about');
          if (localData) {
            try {
              const parsed = JSON.parse(localData);
              setPageData({ blocks: parsed });
            } catch (e) {
              // Ignore
            }
          }
        }
      } finally {
        setPageLoading(false);
      }
    }
    loadData();
  }, []);

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
  const companyImageFromEditor = (() => {
    if (!pageData?.blocks) return null;
    const blocks = Array.isArray(pageData.blocks) ? pageData.blocks : [];
    // Look for image block or text block with imageUrl
    for (const block of blocks) {
      // Check if block has imageUrl in content
      if (block.content?.imageUrl && isImageUrl(block.content.imageUrl)) {
        return block.content.imageUrl;
      }
      // Check images array
      if (block.images && block.images.length > 0 && block.images[0].url) {
        return block.images[0].url;
      }
    }
    return null;
  })();

  return (
    <div style={{ backgroundColor: '#f0f9ff' }}>
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

      {/* Company Introduction with Icon Cards — Enhanced with gradient bg */}
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

                    {/* Subtle floating particles */}
                    <div className="absolute top-6 right-6 w-2 h-2 rounded-full opacity-20" style={{
                      background: p.barColor,
                      animation: `floatParticle ${3 + index * 0.4}s ease-in-out infinite`,
                    }} />
                    <div className="absolute bottom-10 left-8 w-1.5 h-1.5 rounded-full opacity-15" style={{
                      background: p.barColor,
                      animation: `floatParticle ${3.5 + index * 0.3}s ease-in-out infinite reverse`,
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

                      {/* Bottom decorative dots */}
                      <div className="flex justify-center gap-1.5 mt-4 opacity-25 group-hover:opacity-50 transition-opacity duration-500">
                        {[...Array(3)].map((_, di) => (
                          <div key={di} className="w-1.5 h-1.5 rounded-full" style={{
                            background: p.barColor,
                            animationDelay: `${di * 0.15}s`,
                          }} />
                        ))}
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
              { src: '/images/about/factory-design.jpg', altKey: 'about.factory.design', label: 'DESIGN', labelZh: '设计图纸', color: '#3b82f6', desc: 'CAD/CAM 工程设计中心，支持 SolidWorks、UG 等主流软件，DFM 面向制造设计分析' },
              { src: '/images/about/factory-cutting.jpg', altKey: 'about.factory.cutting', label: 'CUTTING', labelZh: '钣金切割', color: '#ef4444', desc: '高精度激光切割 + 数控冲床，精度 ±0.01mm，支持碳钢/不锈钢/铝板多材质' },
              { src: '/images/about/factory-bending.jpg', altKey: 'about.factory.bending', label: 'BENDING', labelZh: '折弯工艺', color: '#10b981', desc: '数控折弯机 100T/3200，多角度复合折弯，圆弧折弯最小 R0.5' },
              { src: '/images/about/factory-assembly.jpg', altKey: 'about.factory.assembly', label: 'ASSEMBLY', labelZh: '组装流水线', color: '#f59e0b', desc: '标准化装配工作站 + 气动夹具，模块化组装流程，日产能 200+ 台' },
              { src: '/images/about/factory-welding.jpg', altKey: 'about.factory.welding', label: 'WELDING', labelZh: '焊接工艺', color: '#dc2626', desc: '机器人焊接 + TIG/MIG 手工焊，氩弧焊保护，焊缝强度达母材 95%+' },
              { src: '/images/about/factory-quality.jpg', altKey: 'about.factory.quality', label: 'QUALITY CONTROL', labelZh: '质量检测', color: '#06b6d4', desc: '三坐标测量仪 + 二次元影像仪，ISO 9001 全检流程，出货零缺陷目标' },
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
                      {item.label}
                    </span>
                    <h3 className="text-xl font-bold text-white drop-shadow-md">{t(item.altKey)}</h3>
                    <p className="text-sm text-white/70 mt-1.5 leading-relaxed drop-shadow-sm">{item.desc}</p>
                    
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
              
              // Feature list per capability for richer content
              const features = [
                ['Custom CAD/CAM design', 'Rapid prototyping', 'DFM analysis'],
                ['CNC machining center', 'Precision ±0.01mm', 'Multi-axis capability'],
                ['ISO 9001 certified', '100% inspection rate', 'Traceability system'],
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
                      {features[index].map((feat, fi) => (
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

      {/* ===== SUNRISE BEACH CTA — 左上角初生太阳 + 海浪 + 沙滩 (v134) ===== */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 15%, #3b5998 28%, #e87a4f 48%, #f4a261 58%, #fcd34d 70%, #fde68a 82%, #fef3c7 92%, #fffbeb 100%)',
        }}
      >
        {/* === SUN — Upper-left corner, small half-rising sun with corona === */}
        <div className="absolute top-[12%] left-[5%] sm:left-[8%] w-24 h-24 sm:w-32 sm:h-32 overflow-hidden rounded-full" style={{
          filter: 'drop-shadow(0 0 40px rgba(251,191,36,0.5)) drop-shadow(0 0 80px rgba(245,158,11,0.3))',
        }}>
          {/* Sun body — only top half visible (half-rising effect) */}
          <div className="absolute -bottom-[45%] left-0 w-full h-full rounded-full" style={{
            background: 'radial-gradient(circle at 50% 40%, #fffbeb 0%, #fef08a 12%, #fde047 28%, #facc15 48%, #f59e0b 68%, #d97706 88%)',
            boxShadow: 'inset 2px 2px 8px rgba(255,255,255,0.4), inset -2px -1px 6px rgba(180,83,9,0.3), 0 0 60px rgba(251,191,36,0.45)',
            animation: 'v134-sunPulse 5s ease-in-out infinite alternate',
          }}>
            {/* Inner bright core */}
            <div className="absolute inset-[15%] rounded-full" style={{
              background: 'radial-gradient(ellipse at 35% 30%, rgba(255,255,240,0.7) 0%, transparent 55%)',
            }} />
          </div>
          {/* Outer corona glow */}
          <div className="absolute -inset-[20%] rounded-full pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.08) 40%, transparent 70%)',
            animation: 'v134-corona 4s ease-in-out infinite alternate',
          }} />
        </div>

        {/* Soft sun rays radiating outward */}
        <div className="absolute top-[10%] left-[3%] sm:left-[6%] w-36 h-36 sm:w-44 sm:h-44 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 origin-center" style={{
              width: `${1 + i * 0.4}px`,
              height: `${16 + i * 5}px`,
              background: `linear-gradient(to bottom, rgba(255,248,220,0.35) 0%, rgba(251,191,36,0.1) 50%, transparent)`,
              transform: `rotate(${i * 22.5}deg) translateY(-50%)`,
              borderRadius: '50%',
              animation: `v134-ray ${3 + i * 0.25}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>

        {/* === OCEAN WAVES — Middle layer with animated waves === */}
        <div className="absolute bottom-[18%] left-0 right-0 h-[24%] overflow-hidden pointer-events-none">
          {/* Deep water base */}
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ height: '100%' }}>
            <defs>
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0369a1" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#075985" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#0c4a6e" stopOpacity="1" />
              </linearGradient>
              <filter id="waveGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Wave layer 1 — back, slower */}
            <path d="M0,120 Q180,80 360,110 T720,105 T1080,115 T1440,100 L1440,200 L0,200Z"
              fill="url(#oceanGrad)" opacity="0.5"
              style={{ animation: 'v134-wave1 8s ease-in-out infinite' }}
            />

            {/* Wave layer 2 — mid */}
            <path d="M0,135 Q200,100 400,130 T800,120 T1200,140 T1440,125 L1440,200 L0,200Z"
              fill="#0ea5e9" opacity="0.65"
              style={{ animation: 'v134-wave2 6s ease-in-out infinite reverse' }}
            />

            {/* Wave layer 3 — front, faster with foam highlight */}
            <path d="M0,150 Q160,125 360,155 T720,145 T1080,160 T1440,148 L1440,200 L0,200Z"
              fill="#38bdf8" opacity="0.75"
              style={{ animation: 'v134-wave3 5s ease-in-out infinite', filter: 'url(#waveGlow)' }}
            />

            {/* Wave foam/highlight line on crest */}
            <path d="M0,152 Q160,127 360,157 T720,147 T1080,162 T1440,150"
              stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none"
              style={{ animation: 'v134-wave3 5s ease-in-out infinite' }}
            />

            {/* Subtle sparkles on water */}
            {[...Array(6)].map((_, si) => (
              <circle key={si} cx={`${150 + si * 210}`} cy={`${140 + (si % 3) * 12}`} r={1 + (si % 2)} fill="white" opacity={0.25 + (si % 3) * 0.1}
                style={{ animation: `v134-sparkle ${2 + si * 0.4}s ease-in-out infinite`, animationDelay: `${si * 0.5}s` }}
              />
            ))}
          </svg>
        </div>

        {/* === SANDY BEACH — Bottom layer with grain texture === */}
        <div className="absolute bottom-0 left-0 right-0 h-[20%] overflow-hidden">
          <svg className="absolute bottom-0 left-0 w-full" style={{ height: '100%' }} viewBox="0 0 1440 200" preserveAspectRatio="none">
            <defs>
              <filter id="sandTexture" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" result="noise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.92 0 0 0  0 0.65 0 0 0  0 0 0 0.2 0" in="noise" result="coloredNoise" />
                <feBlend in="SourceGraphic" in2="coloredNoise" mode="multiply" />
              </filter>
            </defs>
            {/* Far beach (lightest, atmospheric) */}
            <path d="M0,200 L0,130 Q240,95 480,125 Q720,85 960,115 Q1200,90 1440,120 L1440,200Z" fill="#fef9c3" opacity="0.55" />
            {/* Mid beach */}
            <path d="M0,200 L0,155 Q200,125 420,158 Q640,128 860,156 Q1080,130 1280,158 L1440,165 L1440,200Z" fill="#fef08a" opacity="0.78" />
            {/* Near beach with texture */}
            <path d="M0,200 L0,178 Q260,155 520,182 Q780,152 1040,180 Q1280,162 L1440,183 L1440,200Z" fill="#fde68a" filter="url(#sandTexture)" />
            {/* Frontmost sand */}
            <path d="M0,200 L0,192 Q300,175 600,195 Q900,170 1200,193 Q1350,185 1440,196 L1440,200Z" fill="#fcd34d" />
            {/* Sand ripple lines */}
            <path d="M0,202 Q360,190 720,198 Q1080,188 1440,202" stroke="rgba(217,119,6,0.1)" strokeWidth="1.2" fill="none" />
            <path d="M0,212 Q360,204 720,210 Q1080,203 1440,213" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" fill="none" />
          </svg>
          {/* Sand particles */}
          {[...Array(8)].map((_, pi) => (
            <div key={pi} className="absolute rounded-sm pointer-events-none" style={{
              left: `${5 + pi * 11}%`,
              bottom: `${3 + (pi % 3) * 5}%`,
              width: 1.5 + (pi % 3),
              height: 1.5 + (pi % 3),
              background: pi % 3 === 0 ? '#fef08a' : pi % 3 === 1 ? 'rgba(253,218,138,0.7)' : 'rgba(255,255,255,0.4)',
              animation: `v134-grainFloat ${3.5 + (pi % 3) * 1.2}s ease-in-out infinite`,
              animationDelay: `${pi * 0.35}s`,
            }} />
          ))}
        </div>

        {/* Content — centered, elevated */}
        <div className="max-w-4xl mx-auto text-center relative z-10 pt-4 pb-32">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 text-white drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{t('about.cta.title')}</h2>
          <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: '#e0f2fe', textShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>{t('about.cta.subtitle')}</p>

          {/* Buttons — Warm sunrise themed */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-8">
            <a href={`/${locale}/contact`} className="group relative inline-flex items-center justify-center px-9 py-4 font-bold rounded-full overflow-hidden cursor-pointer text-base transition-all duration-400 hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 50%,#fde68a 100%)', color: '#92400e', boxShadow: '0 6px 24px rgba(146,64,14,0.25), 0 0 0 1px rgba(255,255,255,0.4)' }}
            >
              <span style={{ position:'relative',zIndex:10,display:'inline-flex',alignItems:'center',gap:'5px' }}>{t('nav.contact')}<ChevronRight className="ml-1 w-5 h-5" /></span>
            </a>
            <a href={`tel:${contactPhone.replace(/\s/g,'')}`} className="group relative inline-flex items-center justify-center px-9 py-4 font-bold rounded-full overflow-hidden cursor-pointer text-base text-white transition-all duration-400 hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.1))', border: '1.5px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15),0 4px 16px rgba(0,0,0,0.1)' }}
            ><ChevronRight className="mr-2 w-4 h-4" />{contactPhone}</a>
          </div>

          <div className="flex items-center justify-center drop-shadow-sm" style={{ color:'#bae6fd', fontSize: '14px' }}><span>{contactEmail}</span></div>
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

        /* ===== Beach CTA animations (v134 — Sun upper-left + Ocean Waves) ===== */
        @keyframes v134-sunPulse {
          0%{transform:scale(1); filter:brightness(1)}
          100%{transform:scale(1.06); filter:brightness(1.08)}
        }
        @keyframes v134-corona {
          0%{opacity:0.25; transform:scale(1)}
          100%{opacity:0.5; transform:scale(1.12)}
        }
        @keyframes v134-ray {
          0%{opacity:0.25; transform:rotate(var(--r,0)) translateY(-50%) scaleX(1)}
          100%{opacity:0.6; transform:rotate(var(--r,0)) translateY(-50%) scaleX(1.2)}
        }
        @keyframes v134-wave1 {
          0%,100%{transform:translateX(0) translateY(0)}
          50%{transform:translateX(-20px) translateY(-5px)}
        }
        @keyframes v134-wave2 {
          0%,100%{transform:translateX(0) translateY(0)}
          50%{transform:translateX(25px) translateY(3px)}
        }
        @keyframes v134-wave3 {
          0%,100%{transform:translateX(0) translateY(0)}
          50%{transform:translateX(-15px) translateY(-4px)}
        }
        @keyframes v134-sparkle {
          0%,100%{opacity:0.15; transform:scale(1)}
          50%{opacity:0.5; transform:scale(1.4)}
        }
        @keyframes v134-grainFloat {
          0%{transform:translateY(0) translateX(0); opacity:0.45}
          50%{transform:translateY(-3px) translateX(1.5px); opacity:0.85}
          100%{transform:translateY(0) translateX(-1px); opacity:0.45}
        }

        /* ===== Book flip animations (v134) ===== */
        @keyframes bookFloat {
          0%,100%{transform:translateY(0) rotateY(0deg)}
          50%{transform:translateY(-8px) rotateY(0.5deg)}
        }
        @keyframes pageFlipLeft {
          0%{transform:perspective(1500px) rotateY(0deg)}
          100%{transform:perspective(1500px) rotateY(-160deg)}
        }
        @keyframes pageFlipRight {
          0%{transform:perspective(1500px) rotateY(0deg)}
          100%{transform:perspective(1500px) rotateY(160deg)}
        }
        @keyframes bookmarkPulse {
          0%,100%{transform:scale(1)}
          50%{transform:scale(1.1)}
        }
      `}</style>
    </div>
  );
}
