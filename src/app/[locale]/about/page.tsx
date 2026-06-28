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

// Animated counter component
function CountUp({ target, suffix = '', prefix = '', locale = 'en' }: { target: number; suffix?: string; prefix?: string; locale?: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          animateCount();
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
  
    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCount = () => {
    const duration = 2000;
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
    <div ref={elementRef} className="text-center">
      <div className="text-5xl font-bold text-white mb-2">
        {prefix}{count}{suffix}
      </div>
    </div>
  );
}

// Timeline item component with connection line animation
function TimelineItem({ year, titleKey, descriptionKey, isLeft, locale, t }: { year: string; titleKey: string; descriptionKey: string; isLeft: boolean; locale: string; t: (key: string) => string }) {
  const isRTL = locale === 'ar';
  const showLeft = isRTL ? !isLeft : isLeft;
  const itemRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
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
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
          <div className="text-2xl font-bold text-blue-600 mb-2">{year}</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t(titleKey)}
          </h3>
          <p className="text-gray-600">
            {t(descriptionKey)}
          </p>
        </div>
      </div>

      {/* Center dot with pulse animation */}
      <div className="w-2/12 flex justify-center">
        <div className={`w-4 h-4 bg-blue-600 rounded-full border-4 border-blue-200 z-10 ${isVisible ? 'animate-pulse' : ''}`} />
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
              // Rich color palette per card
              const palettes = [
                { name: 'blue',    grad: 'from-blue-600 to-indigo-600',   shadow: 'hover:shadow-blue-200/50', iconBg: 'bg-blue-50', ring: 'ring-blue-200', textColor: 'text-blue-600' },
                { name: 'emerald', grad: 'from-emerald-600 to-teal-600', shadow: 'hover:shadow-emerald-200/50', iconBg: 'bg-emerald-50', ring: 'ring-emerald-200', textColor: 'text-emerald-600' },
                { name: 'violet',  grad: 'from-violet-600 to-purple-600', shadow: 'hover:shadow-violet-200/50', iconBg: 'bg-violet-50', ring: 'ring-violet-200', textColor: 'text-violet-600' },
                { name: 'amber',   grad: 'from-amber-500 to-orange-600',  shadow: 'hover:shadow-amber-200/50', iconBg: 'bg-amber-50', ring: 'ring-amber-200', textColor: 'text-amber-600' },
                { name: 'rose',    grad: 'from-rose-600 to-pink-600',    shadow: 'hover:shadow-rose-200/50', iconBg: 'bg-rose-50', ring: 'ring-rose-200', textColor: 'text-rose-600' },
                { name: 'cyan',    grad: 'from-cyan-600 to-sky-600',    shadow: 'hover:shadow-cyan-200/50', iconBg: 'bg-cyan-50', ring: 'ring-cyan-200', textColor: 'text-cyan-600' },
              ];
              const p = palettes[index % palettes.length];
              return (
                <div key={index} className="group perspective-1000">
                  <div className={`relative rounded-2xl p-7 lg:p-9 bg-white border border-gray-100 shadow-sm ${p.shadow} transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-2xl overflow-hidden`}>
                    {/* Top gradient bar — thicker, more visible */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${p.grad}`} />
                    {/* Subtle corner decoration */}
                    <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${p.grad} opacity-[0.04] blur-2xl group-hover:opacity-[0.08] transition-opacity duration-500`} />
                    <div className={`absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-tr ${p.grad} opacity-[0.04] blur-xl group-hover:opacity-[0.08] transition-opacity duration-500`} />

                    <div className="relative z-10">
                      {/* Icon — larger, with ring + gradient background */}
                      <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl ${p.iconBg} flex items-center justify-center ring-4 ${p.ring} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-8 h-8 ${p.textColor} drop-shadow-sm`} strokeWidth={1.8} />
                      </div>

                      {/* Number — Animated CountUp for visual impact */}
                      <div className="text-5xl lg:text-[3.75rem] font-black mb-2 tracking-tighter text-gray-900" style={{ lineHeight: 1 }}>
                        <CountUp target={stat.number} suffix={stat.suffix} prefix={stat.prefix} locale={locale === 'zh' ? 'zh' : locale} />
                      </div>

                      {/* Label */}
                      <p className="text-sm font-semibold uppercase tracking-wide mt-1 text-gray-600">
                        {t(stat.labelKey)}
                      </p>
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
          {/* Vertical line with gradient */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-200 to-blue-400" />

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

          {/* Factory Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { src: '/images/about/workshop-design.svg', altKey: 'about.factory.design' },
              { src: '/images/about/workshop-cutting.svg', altKey: 'about.factory.cutting' },
              { src: '/images/about/workshop-bending.svg', altKey: 'about.factory.bending' },
              { src: '/images/about/workshop-assembly.svg', altKey: 'about.factory.assembly' },
              { src: '/images/about/workshop-welding.svg', altKey: 'about.factory.welding' },
              { src: '/images/about/workshop-quality.svg', altKey: 'about.factory.quality' },
            ].map((item, index) => (
              <div key={index} className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                <img
                  src={item.src}
                  alt={t(item.altKey)}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h3 className="text-xl font-bold">{t(item.altKey)}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Capability Cards — Each with unique gradient color */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capabilities.map((cap, index) => {
              const Icon = cap.icon;
              const cardColors = [
                { grad: 'from-blue-600 to-indigo-700', iconBg: 'from-blue-500 to-blue-600', accent: '#3b82f6', lightBg: 'rgba(59,130,246,0.06)' },
                { grad: 'from-emerald-600 to-teal-700', iconBg: 'from-emerald-500 to-teal-600', accent: '#059669', lightBg: 'rgba(5,150,105,0.06)' },
                { grad: 'from-violet-600 to-purple-700', iconBg: 'from-violet-500 to-purple-600', accent: '#7c3aed', lightBg: 'rgba(124,58,237,0.06)' },
              ];
              const cc = cardColors[index];
              return (
                <div key={index} className="group rounded-2xl p-8 border border-gray-100/80 transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.8) 100%)' }}
                >
                  {/* Hover glow overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{
                    background: `radial-gradient(circle at 50% 0%, ${cc.lightBg} 0%, transparent 70%)`,
                  }} />
                  <div className={`w-16 h-16 bg-gradient-to-br ${cc.iconBg} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300"
                    style={{ backgroundImage: `linear-gradient(90deg, ${cc.accent}, ${index === 1 ? '#14b8a6' : index === 2 ? '#a855f7' : '#6366f1'})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {t(cap.titleKey)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{t(cap.descriptionKey)}</p>
                  {/* Top accent bar on hover */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: `linear-gradient(90deg, ${cc.accent}, ${index === 1 ? '#14b8a6' : index === 2 ? '#a855f7' : '#6366f1'})` }}
                  />
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
                { grad: 'from-blue-600 to-cyan-600', accent: '#0ea5e9', lightBg: 'rgba(14,165,233,0.07)', ringColor: 'ring-blue-100' },
                { grad: 'from-emerald-600 to-green-600', accent: '#10b981', lightBg: 'rgba(16,185,129,0.07)', ringColor: 'ring-emerald-100' },
                { grad: 'from-violet-600 to-purple-600', accent: '#8b5cf6', lightBg: 'rgba(139,92,246,0.07)', ringColor: 'ring-violet-100' },
                { grad: 'from-orange-500 to-amber-500', accent: '#f59e0b', lightBg: 'rgba(245,158,11,0.07)', ringColor: 'ring-amber-100' },
              ];
              const vc = vColors[index];
              return (
                <div key={index} className="group rounded-2xl p-10 border border-gray-100/80 transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,252,255,0.85) 100%)' }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                    background: `radial-gradient(circle at 30% 30%, ${vc.lightBg} 0%, transparent 70%)`,
                  }} />
                  <div className={`w-20 h-20 bg-gradient-to-br ${vc.grad} rounded-2xl flex items-center justify-center mb-8 shadow-lg ring-4 ${vc.ringColor} group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                    <Icon className="w-10 h-10 text-white drop-shadow-md" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300"
                    style={{ backgroundImage: `linear-gradient(90deg, ${vc.accent}, ${index === 1 ? '#34d399' : index === 2 ? '#a78bfa' : '#fbbf24'})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {t(value.titleKey)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{t(value.descriptionKey)}</p>
                  {/* Decorative corner */}
                  <div className={`absolute top-4 right-4 w-12 h-12 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500`}
                    style={{ background: vc.accent }}
                  />
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

      {/* ===== BEACH-THEMED CTA SECTION — 沙滩主题 ===== */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0c4a6e 0%, #075985 20%, #0369a1 40%, #fcd34d 78%, #fbbf24 88%, #f59e0b 100%)',
        }}
      >
        {/* === SUN with rotating rays === */}
        <div className="absolute -top-16 right-[8%] sm:right-[12%] w-32 h-32 sm:w-44 sm:h-44 rounded-full" style={{
          background: 'radial-gradient(circle at 35% 35%, #fef3c7, #fcd34d 40%, #f59e0b 70%, #d97706 100%)',
          boxShadow: '0 0 80px rgba(251,191,36,0.5), 0 0 160px rgba(245,158,11,0.25), inset 0 -8px 20px rgba(217,119,6,0.3)',
          animation: 'sun-pulse 4s ease-in-out infinite alternate',
        }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="absolute top-1/2 left-1/2 origin-left" style={{
              width: `${3 + i * 1.8}px`, height: `${24 + i * 4}px`,
              background: `linear-gradient(to bottom, rgba(255,251,235,0.85) 0%, rgba(251,191,36,0.25) 70%, transparent)`,
              transform: `rotate(${i * 36}deg) translateY(-50%)`,
              borderRadius: '50%',
              animation: `sun-ray-sway ${2 + i * 0.12}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
          <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-yellow-200/60 to-transparent opacity-80" />
        </div>

        {/* === OCEAN WAVES at top of sand === */}
        <div className="absolute top-[45%] left-0 right-0 h-24 overflow-hidden pointer-events-none">
          <svg className="absolute w-[250%] h-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path d="M0,30 Q150,10 300,30 T600,30 T900,30 T1200,30 T1500,30 T1800,30 L1800,100 L0,100 Z" fill="rgba(14,116,144,0.35)" style={{ animation: 'bw1 7s linear infinite' }} />
            <path d="M0,45 Q200,65 400,42 T800,48 T1200,38 T1600,50 L1600,100 L0,100 Z" fill="rgba(8,145,178,0.25)" style={{ animation: 'bw2 9s linear infinite reverse' }} />
            <path d="M0,58 Q180,42 360,58 T720,55 T1080,62 T1440,52 L1440,100 L0,100 Z" fill="rgba(56,189,248,0.15)" style={{ animation: 'bw3 11s linear infinite' }} />
          </svg>
        </div>

        {/* === SMALL FISH in ocean === */}
        <div className="absolute top-[48%] left-[3%]" style={{ animation: 'fish-beach 14s ease-in-out infinite' }}>
          <svg width="26" height="13" viewBox="0 0 26 13"><ellipse cx="12" cy="6.5" rx="10" ry="5.5" fill="#7dd3fc" opacity=".8"/><polygon points="24,6.5 26,2 26,11" fill="#7dd3fc"/><circle cx="7" cy="4.5" r="1.4" fill="#0c4a6e"/></svg>
        </div>
        <div className="absolute top-[54%] right-[18%]" style={{ animation: 'fish-beach-rev 18s ease-in-out infinite', animationDelay: '-5s', transform: 'scaleX(-1)' }}>
          <svg width="20" height="10" viewBox="0 0 20 10"><ellipse cx="9" cy="5" rx="8" ry="4.5" fill="#a5f3fc" opacity=".7"/><polygon points="0,5 -2,2 -2,8" fill="#a5f3fc"/><circle cx="13" cy="3.5" r="1.1" fill="#0c4a6e"/></svg>
        </div>

        {/* === SEASHELLS on sand === */}
        <div className="absolute bottom-[12%] left-[8%] opacity-70" style={{ animation: 'shell-glow 5s ease-in-out infinite alternate' }}>
          <svg width="26" height="20" viewBox="0 0 26 20"><path d="M2,16 Q13,-2 24,16 Q13,22 2,16Z" fill="#fde68a" stroke="#d97706" strokeWidth=".8"/><path d="M5,15 Q13,3 21,15" stroke="#d97706" strokeWidth=".6" fill="none"/></svg>
        </div>
        <div className="absolute bottom-[18%] right-[14%] opacity-60" style={{ animation: 'shell-glow 6s ease-in-out infinite alternate-reverse' }}>
          <svg width="22" height="17" viewBox="0 0 22 17"><ellipse cx="11" cy="9" rx="9" ry="6.5" fill="#fef3c7" stroke="#d97706" strokeWidth=".7"/></svg>
        </div>
        {/* STARFISH */}
        <div className="absolute bottom-[14%] right-[7%] opacity-65" style={{ animation: 'star-wiggle 4s ease-in-out infinite alternate' }}>
          <svg width="32" height="32" viewBox="0 0 32 32"><path d="M16,2 L18.5,11 L27,9 L20,16 L26,23 L17,19 L13,29 L15,19 L5,21 L12,15 Z" fill="#fb923c" stroke="#ea580c" strokeWidth=".8"/><circle cx="16" cy="16" r="2.8" fill="#fde68a" opacity=".6"/></svg>
        </div>

        {/* Sand bubbles rising */}
        {[...Array(7)].map((_, i) => (
          <span key={i} className="absolute rounded-full pointer-events-none" style={{
            left: `${8 + i * 13}%`, bottom: `${4 + Math.random() * 7}%`, width: 2 + Math.random() * 3.5, height: 2 + Math.random() * 3.5,
            background: i % 2 ? 'rgba(186,230,253,.55)' : 'rgba(253,224,175,.45)',
            boxShadow: `0 0 ${3 + i}px ${i % 2 ? 'rgba(125,211,252,.25)' : 'rgba(251,191,36,.18)'}`,
            animation: `sand-bubble ${3 + Math.random() * 3.5}s ease-in-out infinite`, animationDelay: `${i * 0.55}s`,
          }} />
        ))}

        {/* Content */}
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,.2)' }}>{t('about.cta.title')}</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: '#e0f2fe', textShadow: '0 1px 4px rgba(0,0,0,.15)' }}>{t('about.cta.subtitle')}</p>

          {/* Buttons — Beach themed */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <a href={`/${locale}/contact`} className="group relative inline-flex items-center justify-center px-10 py-5 font-bold rounded-full overflow-hidden cursor-pointer text-lg transition-all duration-400 hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg,#fff 0%,#fefce8 100%)', color: '#0369a1', boxShadow: '0 6px 24px rgba(3,105,161,.3), 0 0 0 1px rgba(255,255,255,.3)' }}
            >
              {[...Array(4)].map((_, i) => (
                <span key={i} className="absolute w-1 h-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-80" style={{
                  left: `${15 + i * 18}%`, top: `${20 + (i % 2) * 30}%`, background: '#f59e0b', boxShadow: '0 0 4px #fbbf24',
                  animation: `sand-spark ${.8 + i * .2}s ease-in-out infinite`, animationDelay: `${i * .1}s`
                }} />
              ))}
              <span style={{ position:'relative',zIndex:10,display:'inline-flex',alignItems:'center',gap:'6px' }}>{t('nav.contact')}<ChevronRight className="ml-1 w-6 h-6" /></span>
            </a>
            <a href={`tel:${contactPhone.replace(/\s/g,'')}`} className="group relative inline-flex items-center justify-center px-10 py-5 font-bold rounded-full overflow-hidden cursor-pointer text-lg text-white transition-all duration-400 hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.08))', border: '1.5px solid rgba(255,255,255,.35)', backdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.15),0 4px 20px rgba(0,0,0,.15)' }}
            ><ChevronRight className="mr-2 w-5 h-5" />{contactPhone}</a>
          </div>

          <div className="flex items-center justify-center space-x-2 drop-shadow-sm" style={{ color:'#bae6fd' }}><span>{contactEmail}</span></div>
        </div>
      </section>

      {/* ===== ALL ANIMATION KEYFRAMES ===== */}
      <style>{`
        @keyframes about-bubble-active {
          0%{transform:translateY(0) scale(.5);opacity:0} 15%{opacity:.6}
          50%{transform:translateY(-20px) scale(1.2);opacity:.85}
          85%{transform:translateY(-42px) scale(.7);opacity:.2}
          100%{transform:translateY(-54px) scale(.3);opacity:0}
        }
        @keyframes about-intro-bg-pulse { 0%{opacity:.03;transform:scale(1)} 100%{opacity:.07;transform:scale(1.05)} }
        @keyframes sun-pulse {
          0%{box-shadow:0 0 60px rgba(251,191,36,.4),0 0 140px rgba(245,158,11,.2);transform:scale(1)}
          100%{box-shadow:0 0 100px rgba(251,191,36,.6),0 0 200px rgba(245,158,11,.35);transform:scale(1.04)}
        }
        @keyframes sun-ray-sway { 0%{opacity:.4;transform:rotate(var(--r,0)) translateY(-50%) scaleX(1)} 100%{opacity:.8;transform:rotate(var(--r,0)) translateY(-50%) scaleX(1.15)} }
        @keyframes bw1 { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        @keyframes bw2 { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        @keyframes bw3 { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        @keyframes fish-beach { 0%{transform:translateX(-30px);opacity:0} 10%{opacity:.8} 90%{opacity:.8} 100%{transform:translateX(calc(90vw)) translateY(-15px);opacity:0} }
        @keyframes fish-beach-rev { 0%{transform:translateX(calc(90vw)) scaleX(-1);opacity:0} 10%{opacity:.7} 90%{opacity:.7} 100%{transform:translateX(-50px) translateY(12px) scaleX(-1);opacity:0} }
        @keyframes shell-glow { 0%{filter:brightness(1)} 100%{filter:brightness(1.15) drop-shadow(0 0 5px rgba(251,191,36,.35))} }
        @keyframes star-wiggle { 0%{transform:rotate(-5deg) scale(1)} 100%{transform:rotate(8deg) scale(1.08)} }
        @keyframes sand-bubble { 0%{transform:translateY(0) scale(.5);opacity:0} 20%{opacity:.7} 80%{opacity:.3} 100%{transform:translateY(-75px) scale(1.2);opacity:0} }
        @keyframes sand-sparkle { 0%{transform:translateY(0) scale(0);opacity:0} 50%{transform:translateY(-8px) scale(1);opacity:1} 100%{transform:translateY(-16px) scale(0);opacity:0} }
      `}</style>
    </div>
  );
}
