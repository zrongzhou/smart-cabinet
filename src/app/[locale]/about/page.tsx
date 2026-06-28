'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, Award, Globe, Factory, ShieldCheck, Cpu, Zap, Building, 
  TrendingUp, Clock, CheckCircle, Car, ChevronRight, Star,
  PenTool, Settings, BadgeCheck, Truck
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchUnifiedSettings, SiteSettings } from '@/data/unified-data';

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
      {/* Hero Section with Breadcrumb */}
      <section className="relative text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        {/* Gradient glow ornaments */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center space-x-2 text-sm text-blue-200">
            <a href={`/${locale}`} className="hover:text-white transition-colors">
              {t('about.breadcrumb.home')}
            </a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{t('about.breadcrumb.about')}</span>
          </nav>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white">
            {t('about.hero.title')}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            {t('about.hero.description')}
          </p>
        </div>
      </section>

      {/* Company Introduction with Icon Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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

            {/* Icon Cards for Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Clock, label: '2015', sublabelKey: 'about.stat.founded' },
                { icon: Globe, label: '60+', sublabelKey: 'about.stat.countries' },
                { icon: Award, label: '500+', sublabelKey: 'about.stat.clients' },
                { icon: Cpu, label: '10+', sublabelKey: 'about.stat.patents' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                    <Icon className="w-8 h-8 text-blue-600 mb-3" />
                    <div className="text-2xl font-bold text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-600">{t(item.sublabelKey)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Core Statistics — Premium card design with depth & color */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1e40af 1px, transparent 0)', backgroundSize: '32px 32px' }} />

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

                      {/* Number — solid color for reliability across all themes (gradient text was invisible on light themes) */}
                      <div className="text-5xl lg:text-[3.75rem] font-black mb-2 tracking-tighter text-gray-900" style={{ lineHeight: 1 }}>
                        {stat.prefix}{stat.number}{stat.suffix}
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

      {/* Factory Workshop with Capability Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
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

          {/* Capability Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capabilities.map((cap, index) => {
              const Icon = cap.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {t(cap.titleKey)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(cap.descriptionKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Values - 2x2 Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
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
              return (
                <div key={index} className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-8">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {t(value.titleKey)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {t(value.descriptionKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {t('about.certifications')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            {t('about.certificationsText')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6 15%, rgba(59,130,246,0.08), transparent)' }}>
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.name}</h3>
                  <p className="text-xs text-gray-500">
                    {t(cert.fullNameKey)}
                  </p>
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

      {/* CTA Section */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            {t('about.cta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('about.cta.subtitle')}
          </p>

          {/* CTA Buttons - Bubble Effect */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            {(() => {
              // Inline bubble button component for About page
              const [hovered1, setHovered1] = useState(false);
              const [hovered2, setHovered2] = useState(false);
              return (
                <>
                  <a
                    href={`/${locale}/contact`}
                    className="group relative inline-flex items-center justify-center px-10 py-5 font-bold rounded-full overflow-hidden cursor-pointer text-lg"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
                      border: 'none',
                      boxShadow: hovered1 ? '0 8px 25px rgba(37,99,235,0.4), 0 0 50px rgba(59,130,246,0.15)' : '0 6px 20px rgba(37,99,235,0.35), 0 0 40px rgba(59,130,246,0.12)',
                      color: '#2563eb',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                    onMouseEnter={(e) => { setHovered1(true); }}
                    onMouseLeave={() => setHovered1(false)}
                  >
                    {/* Bubbles */}
                    {[0,1,2,3].map(i => (
                      <span key={i} className="absolute rounded-full pointer-events-none" style={{
                        left: `${12 + i * 20}%`, bottom: '-8px',
                        width: hovered1 ? 6 + i * 1.5 : 3,
                        height: hovered1 ? 6 + i * 1.5 : 3,
                        background: `radial-gradient(circle, rgba(255,255,255,${hovered1 ? 0.9 : 0.5}), rgba(147,197,253,${hovered1 ? 0.5 : 0.15}))`,
                        boxShadow: hovered1 ? `0 0 ${8 + i * 2}px rgba(59,130,246,0.4)` : 'none',
                        animation: hovered1 ? `about-bubble-up ${1.5 + i * 0.2}s ease-in-out infinite` : `about-bubble-idle ${(2 + i * 0.3)}s ease-in-out infinite`,
                        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }} />
                    ))}
                    <span style={{ position: 'relative', zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: '6px', textShadow: hovered1 ? '0 0 16px rgba(255,255,255,0.6)' : 'none', transition: 'text-shadow 0.3s' }}>
                      {t('nav.contact')}
                      <ChevronRight className="ml-1 w-6 h-6" style={{ transform: hovered1 ? 'translateX(4px)' : 'none', transition: 'transform 0.3s' }} />
                    </span>
                  </a>
                  <a
                    href={`tel:${contactPhone.replace(/\s/g, '')}`}
                    className="group relative inline-flex items-center justify-center px-10 py-5 font-bold rounded-full overflow-hidden cursor-pointer text-lg text-white"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(59,130,246,0.2) 50%, rgba(139,92,246,0.26) 100%)',
                      border: '1px solid rgba(129,140,248,0.35)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: hovered2 ? '0 0 30px rgba(99,102,241,0.18) inset, 0 0 40px rgba(139,92,246,0.12)' : '0 0 20px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.12)',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                    onMouseEnter={() => setHovered2(true)}
                    onMouseLeave={() => setHovered2(false)}
                  >
                    {[0,1,2,3].map(i => (
                      <span key={i} className="absolute rounded-full pointer-events-none" style={{
                        left: `${12 + i * 20}%`, bottom: '-8px',
                        width: hovered2 ? 5 + i * 1.5 : 2.5,
                        height: hovered2 ? 5 + i * 1.5 : 2.5,
                        background: `radial-gradient(circle, rgba(255,255,255,${hovered2 ? 0.7 : 0.25}), rgba(167,139,250,${hovered2 ? 0.35 : 0.08}))`,
                        boxShadow: hovered2 ? `0 0 ${6 + i * 2}px rgba(167,139,250,0.35)` : 'none',
                        animation: hovered2 ? `about-bubble-up ${1.6 + i * 0.2}s ease-in-out infinite` : `about-bubble-idle ${(2.2 + i * 0.3)}s ease-in-out infinite`,
                        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }} />
                    ))}
                    <span style={{ position: 'relative', zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: '6px', textShadow: hovered2 ? '0 0 14px rgba(167,139,250,0.5)' : '0 0 8px rgba(255,255,255,0.12)', transition: 'text-shadow 0.3s' }}>
                      <ChevronRight className="mr-2 w-5 h-5" />
                      {contactPhone}
                    </span>
                  </a>
                </>
              );
            })()}
          </div>

          <div className="flex items-center justify-center space-x-2 text-white/60">
            <span>{contactEmail}</span>
          </div>
        </div>
      </section>

      {/* Bubble button animations for About CTA */}
      <style>{`
        @keyframes about-bubble-up {
          0%   { transform: translateY(0) scale(1); opacity: 0.6; }
          50%  { transform: translateY(-22px) scale(1.3); opacity: 0.9; }
          100% { transform: translateY(-44px) scale(0.6); opacity: 0; }
        }
        @keyframes about-bubble-idle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.15; }
          50%      { transform: translateY(-5px) scale(1.1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
