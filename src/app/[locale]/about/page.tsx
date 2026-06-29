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

          {/* Factory Images Grid — Local images with Glass Effect */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { src: '/images/about/factory-design.jpg', altKey: 'about.factory.design', label: 'DESIGN', color: '#3b82f6' },
              { src: '/images/about/factory-cutting.jpg', altKey: 'about.factory.cutting', label: 'CUTTING', color: '#ef4444' },
              { src: '/images/about/factory-bending.jpg', altKey: 'about.factory.bending', label: 'BENDING', color: '#10b981' },
              { src: '/images/about/factory-assembly.jpg', altKey: 'about.factory.assembly', label: 'ASSEMBLY', color: '#f59e0b' },
              { src: '/images/about/factory-welding.jpg', altKey: 'about.factory.welding', label: 'WELDING', color: '#dc2626' },
              { src: '/images/about/factory-quality.jpg', altKey: 'about.factory.quality', label: 'QUALITY CONTROL', color: '#06b6d4' },
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

      {/* Company Values - 2x2 Grid — Each card unique color */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #fefce8 50%, #fdf4ff 100%)',
      }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #b45309 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t('about.values.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              const vColors = [
                { grad: 'from-blue-600 to-cyan-600', accent: '#0ea5e9', lightBg: 'rgba(14,165,233,0.09)', ringColor: 'ring-blue-100', textColor: '#0369a1', descText: '#0c4a6e' },
                { grad: 'from-emerald-600 to-green-600', accent: '#10b981', lightBg: 'rgba(16,185,129,0.09)', ringColor: 'ring-emerald-100', textColor: '#047857', descText: '#065f46' },
                { grad: 'from-violet-600 to-purple-600', accent: '#8b5cf6', lightBg: 'rgba(139,92,246,0.09)', ringColor: 'ring-violet-100', textColor: '#6d28d9', descText: '#4c1d95' },
                { grad: 'from-orange-500 to-amber-500', accent: '#f59e0b', lightBg: 'rgba(245,158,11,0.09)', ringColor: 'ring-amber-100', textColor: '#b45309', descText: '#78350f' },
                { grad: 'from-rose-500 to-pink-600', accent: '#ec4899', lightBg: 'rgba(236,72,153,0.08)', ringColor: 'ring-rose-100', textColor: '#be185d', descText: '#831843' },
              ];
              const vc = vColors[index % vColors.length];
              
              return (
                <div key={index} className="group rounded-2xl p-10 lg:p-12 border transition-all duration-400 hover:-translate-y-2.5 hover:shadow-2xl relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(250,252,255,0.88) 100%)`,
                    borderColor: `${vc.accent}25`,
                    borderWidth: '1px',
                  }}
                >
                  {/* Animated background glow */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    style={{
                      background: `radial-gradient(circle at 20% 20%, ${vc.lightBg} 0%, transparent 65%)`,
                    }}
                  />
                  {/* Corner decorative dot */}
                  <div className={`absolute top-5 right-5 w-3 h-3 rounded-full transition-all duration-500 group-hover:scale-150`}
                    style={{ background: vc.accent, opacity: 0.4 }}
                  />
                  
                  <div className="relative z-10">
                    {/* Icon — larger with enhanced glow */}
                    <div className={`w-24 h-24 bg-gradient-to-br ${vc.grad} rounded-2xl flex items-center justify-center mb-8 shadow-lg ring-4 ${vc.ringColor} group-hover:scale-110 group-hover:-rotate-6 transition-all duration-400`}
                      style={{ boxShadow: `0 8px 24px ${vc.lightBg}` }}
                    >
                      <Icon className="w-12 h-12 text-white drop-shadow-md" strokeWidth={1.8} />
                    </div>
                    
                    {/* Title — larger and bolder */}
                    <h3 className="text-[28px] font-black text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300"
                      style={{ backgroundImage: `linear-gradient(90deg, ${vc.accent}, ${index === 1 ? '#34d399' : index === 2 ? '#a78bfa' : index === 3 ? '#fbbf24' : '#f472b6'})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                      {t(value.titleKey)}
                    </h3>
                    
                    {/* Description — larger font */}
                    <p className="leading-relaxed text-lg mb-5" style={{ color: vc.descText }}>{t(value.descriptionKey)}</p>
                    
                    {/* Decorative animated line */}
                    <div className={`h-[3px] rounded-full transition-all duration-500 group-hover:w-full opacity-30 group-hover:opacity-70 w-14`}
                      style={{ background: `linear-gradient(90deg, ${vc.accent}, transparent)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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

      {/* ===== SUNRISE BEACH CTA — 精致日出沙滩 (v133) ===== */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0c4a6e 0%, #075985 12%, #0369a1 24%, #0ea5e9 40%, #7dd3fc 52%, #fef3c7 68%, #fde68a 78%, #fcd34d 88%, #fbbf24 100%)',
        }}
      >
        {/* === OCEAN HORIZON LINE (where sun sits) === */}
        <div className="absolute top-[58%] left-0 right-0 h-[2px] opacity-30"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
        />

        {/* === HALF-SUN RISING — 半遮面初生太阳 === */}
        <div className="absolute top-[55%] left-[8%] sm:left-[12%] w-28 h-28 sm:w-36 sm:h-36 overflow-hidden rounded-full" style={{
          // Clip bottom half for "half-rising" effect via positioning inside parent
        }}>
          {/* Sun body — positioned so only top half shows above horizon */}
          <div className="absolute -bottom-[50%] left-0 w-full h-full rounded-full" style={{
            background: 'radial-gradient(circle at 50% 45%, #fffbeb 0%, #fef08a 15%, #fde047 35%, #facc15 55%, #eab308 75%, #ca8a04 95%)',
            boxShadow: '0 0 60px rgba(250,204,21,0.5), 0 0 120px rgba(234,179,8,0.25), 0 10px 40px rgba(202,138,4,0.3), inset 2px 2px 8px rgba(255,255,255,0.3)',
            animation: 'sunrise-glow 6s ease-in-out infinite alternate',
          }}>
            {/* Sun surface detail — inner texture for realism */}
            <div className="absolute inset-[12%] rounded-full" style={{
              background: 'radial-gradient(ellipse at 40% 35%, rgba(255,255,240,0.6) 0%, transparent 50%), radial-gradient(ellipse at 60% 60%, rgba(234,179,8,0.3) 0%, transparent 40%)',
            }} />
            {/* Soft corona glow around sun edge */}
            <div className="absolute -inset-[15%] rounded-full" style={{
              background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)',
              animation: 'sunCorona 4s ease-in-out infinite alternate',
            }} />
          </div>
        </div>

        {/* === SUBTLE SUN RAYS (fewer, softer) === */}
        <div className="absolute top-[54%] left-[6%] sm:left-[10%] w-36 h-36 sm:w-44 sm:h-44 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 origin-center" style={{
              width: `${1 + i * 0.6}px`, height: `${14 + i * 4}px`,
              background: `linear-gradient(to bottom, rgba(255,251,235,0.5) 0%, rgba(250,204,21,0.15) 50%, transparent)`,
              transform: `rotate(${i * 30}deg) translateY(-50%)`,
              borderRadius: '50%',
              animation: `sunRaySoft ${3 + i * 0.3}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>

        {/* === TEXTURED CURVED SAND BEACH — 沙粒感弧形沙滩 (smaller, detailed) === */}
        <div className="absolute bottom-0 left-0 right-0 h-[22%] overflow-hidden">
          <svg className="absolute bottom-0 left-0 w-full" style={{ height: '100%' }} viewBox="0 0 1440 280" preserveAspectRatio="none">
            <defs>
              <filter id="sandGrain" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" result="noise" />
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.95 0 0 0  0 0.7 0 0 0  0 0 0 0.25 0" in="noise" result="coloredNoise" />
                <feBlend in="SourceGraphic" in2="coloredNoise" mode="multiply" />
              </filter>
            </defs>
            {/* Far sand layer (lightest, atmospheric perspective) */}
            <path d="M0,280 L0,140 Q200,90 400,130 Q720,70 1040,120 Q1280,85 1440,135 L1440,280Z"
              fill="#fef9c3" opacity="0.6" />
            {/* Mid sand layer */}
            <path d="M0,280 L0,170 Q180,125 360,160 Q540,110 720,155 Q900,115 1080,150 Q1260,120 1440,165 L1440,280Z"
              fill="#fef08a" opacity="0.8" />
            {/* Near sand layer with grain texture */}
            <path d="M0,280 L0,200 Q220,165 440,195 Q660,150 880,190 Q1100,158 1320,185 L1440,195 L1440,280Z"
              fill="#fde68a" filter="url(#sandGrain)" />
            {/* Frontmost sand (deepest) */}
            <path d="M0,280 L0,230 Q260,200 520,228 Q780,190 1040,225 Q1280,198 1440,230 L1440,280Z"
              fill="#fcd34d" />

            {/* Sand ripples / texture lines */}
            <path d="M0,245 Q360,230 720,242 Q1080,228 1440,245" stroke="rgba(217,119,6,0.12)" strokeWidth="1.5" fill="none" />
            <path d="M0,262 Q360,250 720,258 Q1080,248 1440,262" stroke="rgba(217,119,6,0.08)" strokeWidth="1" fill="none" />
            {/* Subtle highlight on sand crest */}
            <path d="M0,205 Q360,185 720,198 Q1080,182 1440,202" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
          </svg>

          {/* Sand grain particles (sparse, subtle) */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute rounded-sm pointer-events-none" style={{
              left: `${4 + i * 7.5}%`,
              bottom: `${5 + (i % 4) * 4 + Math.random() * 6}%`,
              width: 1.5 + (i % 3),
              height: 1.5 + (i % 3),
              background: i % 3 === 0 ? 'rgba(254,240,138,0.9)' : i % 3 === 1 ? 'rgba(253,224,71,0.7)' : 'rgba(255,255,255,0.5)',
              animation: `sandGrainFloat ${4 + (i % 3) * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }} />
          ))}
        </div>

        {/* Small seashell decoration */}
        <div className="absolute bottom-[8%] left-[18%] opacity-50" style={{ animation: 'shell-glow 5s ease-in-out infinite alternate' }}>
          <svg width="20" height="16" viewBox="0 0 20 16"><path d="M2,13 Q10,-2 18,13 Q10,18 2,13Z" fill="#fde68a" stroke="#d97706" strokeWidth="0.5"/><path d="M4,12 Q10,3 16,12" stroke="#d97706" strokeWidth="0.35" fill="none"/></svg>
        </div>
        <div className="absolute bottom-[11%] right-[22%] opacity-40" style={{ animation: 'star-wiggle 5s ease-in-out infinite alternate' }}>
          <svg width="22" height="22" viewBox="0 0 22 22"><path d="M11,2 L13,8 L19,8 L14,12 L16,18 L11,14 L6,18 L8,12 L3,8 L9,8 Z" fill="#fb923c" stroke="#ea580c" strokeWidth="0.5"/><circle cx="11" cy="11" r="2" fill="#fde68a" opacity="0.5"/></svg>
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

      {/* ===== ALL ANIMATION KEYFRAMES ===== */}
      <style>{`
        /* ===== Premium stat card animations (v133) ===== */
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
        @keyframes about-bubble-active {
          0%{transform:translateY(0) scale(.5);opacity:0} 15%{opacity:.6}
          50%{transform:translateY(-20px) scale(1.2);opacity:.85}
          85%{transform:translateY(-42px) scale(.7);opacity:.2}
          100%{transform:translateY(-54px) scale(.3);opacity:0}
        }
        @keyframes sunrise-glow {
          0%{box-shadow:0 0 50px rgba(250,204,21,0.4),0 0 100px rgba(234,179,8,0.2);transform:scale(1)}
          100%{box-shadow:0 0 80px rgba(250,204,21,0.6),0 0 160px rgba(234,179,8,0.35);transform:scale(1.04)}
        }
        @keyframes sunCorona {
          0%{opacity:0.3;transform:scale(1)}
          100%{opacity:0.6;transform:scale(1.08)}
        }
        @keyframes sunRaySoft {
          0%{opacity:0.3;transform:rotate(var(--r,0)) translateY(-50%) scaleX(1)}
          100%{opacity:0.7;transform:rotate(var(--r,0)) translateY(-50%) scaleX(1.15)}
        }
        @keyframes sandGrainFloat {
          0%{transform:translateY(0) translateX(0);opacity:0.5}
          50%{transform:translateY(-4px) translateX(2px);opacity:0.9}
          100%{transform:translateY(0) translateX(-1px);opacity:0.5}
        }
        @keyframes bw1 { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        @keyframes bw2 { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        @keyframes bw3 { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        @keyframes shell-glow { 0%{filter:brightness(1)} 100%{filter:brightness(1.18) drop-shadow(0 0 6px rgba(251,191,36,0.4))} }
        @keyframes star-wiggle { 0%{transform:rotate(-6deg) scale(1)} 100%{transform:rotate(9deg) scale(1.1)} }
        @keyframes sand-sparkle { 0%{transform:translateY(0) scale(0);opacity:0} 50%{transform:translateY(-10px) scale(1.1);opacity:1} 100%{transform:translateY(-20px) scale(0);opacity:0} }
      `}</style>
    </div>
  );
}
