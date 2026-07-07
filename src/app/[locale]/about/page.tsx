'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, Award, Globe, Factory, ShieldCheck, Cpu, Zap, Building, 
  TrendingUp, Clock, CheckCircle, Car, ChevronRight, Star,
  PenTool, Settings, BadgeCheck, Truck, Phone, Mail, MapPin,
  AlertTriangle, XCircle, BarChart3, Boxes, Plug, Headphones
} from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchUnifiedSettings, SiteSettings } from '@/data/unified-data';
import OceanHeader from '@/components/OceanHeader';
import Image from 'next/image';
import CompanyShowcase from '@/components/about/CompanyShowcase';
import ValuesBook from '@/components/about/ValuesBook';
import ClientWall from '@/components/about/ClientWall';

// Page data type (from API or localStorage)
interface PageData {
  id?: string;
  slug?: string;
  title?: { zh: string; en: string; ar: string };
  blocks: any[];
  createdAt?: string;
  updatedAt?: string;
}

// (V7) CountUp animation component removed — stats now render as static numbers for reliability.

// (V8) Bubble/shatter effects removed — replaced with gradient progress bar below number.

// ===== V6 FLOATING DECORATION ORBS =====
function V6FloatOrbs({ colors, count = 4 }: { colors: string[]; count?: number }) {
  const positions = [
    { top: '10%', left: '5%', size: 200 }, { top: '18%', right: '7%', size: 240 },
    { top: '62%', left: '10%', size: 170 }, { top: '72%', right: '12%', size: 210 },
    { top: '42%', left: '46%', size: 150 },
  ];
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const p = positions[i % positions.length];
        const color = colors[i % colors.length];
        return (
          <div key={i} className="absolute rounded-full pointer-events-none blur-3xl opacity-[0.16]" style={{ top: p.top, left: p.left, right: p.right, width: p.size, height: p.size, background: `radial-gradient(circle, ${color}, transparent 70%)`, animation: `v6-orbFloat ${9 + (i % 4) * 1.4}s ease-in-out infinite`, animationDelay: `${i * 1.2}s` }} />
        );
      })}
    </>
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
      className={`flex items-center mb-12 transition-all duration-700 opacity-100 ${isVisible ? 'translate-y-0' : 'translate-y-8'} ${showLeft ? 'flex-row' : 'flex-row-reverse'}`}
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

// ===== Core Values — rendered by <ValuesBook> (see src/components/about/ValuesBook.tsx) =====

export default function AboutPage() {
  const { locale: rawLocale, t } = useLocale();
  const locale = rawLocale || 'en';
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

  // Core statistics data — V8 restored to 6 items with new data
  const stats = [
    { number: 11, suffix: '+', prefix: '', labelKey: 'about.stat.founded', icon: Clock },
    { number: 10, suffix: '+', prefix: '', labelKey: 'about.stat.models', icon: Cpu },
    { number: 60, suffix: '+', prefix: '', labelKey: 'about.stat.countries', icon: Globe },
    { number: 800, suffix: '+', prefix: '', labelKey: 'about.stat.clients', icon: Users },
    { number: 5,  suffix: '',  prefix: '', labelKey: 'about.stat.certifications', icon: ShieldCheck },
    { number: 10, suffix: '+', prefix: '', labelKey: 'about.stat.patents', icon: Award },
  ];

  // Timeline data
  // V8.4 fix: bug 2 — restructured milestone timeline: 7 milestones, 2015 → 2026.
  const timeline = [
    { year: '2015', titleKey: 'about.timeline.2015.title', descriptionKey: 'about.timeline.2015.description', isLeft: true },
    { year: '2018', titleKey: 'about.timeline.2018.title', descriptionKey: 'about.timeline.2018.description', isLeft: false },
    { year: '2019', titleKey: 'about.timeline.2019.title', descriptionKey: 'about.timeline.2019.description', isLeft: true },
    { year: '2021', titleKey: 'about.timeline.2021.title', descriptionKey: 'about.timeline.2021.description', isLeft: false },
    { year: '2022', titleKey: 'about.timeline.2022.title', descriptionKey: 'about.timeline.2022.description', isLeft: true },
    { year: '2024', titleKey: 'about.timeline.2024.title', descriptionKey: 'about.timeline.2024.description', isLeft: false },
    { year: '2026 to Present', titleKey: 'about.timeline.2026.title', descriptionKey: 'about.timeline.2026.description', isLeft: true },
  ];

  // Values data - 5 core values
  const values = [
    { icon: Cpu, titleKey: 'about.values.innovation.title', descriptionKey: 'about.values.innovation.description', highlightKey: 'about.values.innovation.highlight', statKey: 'about.values.innovation.stat' },
    { icon: ShieldCheck, titleKey: 'about.values.quality.title', descriptionKey: 'about.values.quality.description', highlightKey: 'about.values.quality.highlight', statKey: 'about.values.quality.stat' },
    { icon: Users, titleKey: 'about.values.service.title', descriptionKey: 'about.values.service.description', highlightKey: 'about.values.service.highlight', statKey: 'about.values.service.stat' },
    { icon: Globe, titleKey: 'about.values.customer.title', descriptionKey: 'about.values.customer.description', highlightKey: 'about.values.customer.highlight', statKey: 'about.values.customer.stat' },
    { icon: TrendingUp, titleKey: 'about.values.global.title', descriptionKey: 'about.values.global.description', highlightKey: 'about.values.global.highlight', statKey: 'about.values.global.stat' },
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

  // Customer Pain Points data (6 items)
  const painPointItems = [
    { icon: AlertTriangle, titleKey: 'about.painPoints.item1.title', descKey: 'about.painPoints.item1.desc' },
    { icon: XCircle, titleKey: 'about.painPoints.item2.title', descKey: 'about.painPoints.item2.desc' },
    { icon: AlertTriangle, titleKey: 'about.painPoints.item3.title', descKey: 'about.painPoints.item3.desc' },
    { icon: XCircle, titleKey: 'about.painPoints.item4.title', descKey: 'about.painPoints.item4.desc' },
    { icon: AlertTriangle, titleKey: 'about.painPoints.item5.title', descKey: 'about.painPoints.item5.desc' },
    { icon: XCircle, titleKey: 'about.painPoints.item6.title', descKey: 'about.painPoints.item6.desc' },
  ];

  // Our Solutions data (7 items)
  const solutionItems = [
    { icon: ShieldCheck, titleKey: 'about.solutions.item1.title', descKey: 'about.solutions.item1.desc' },
    { icon: Zap, titleKey: 'about.solutions.item2.title', descKey: 'about.solutions.item2.desc' },
    { icon: AlertTriangle, titleKey: 'about.solutions.item3.title', descKey: 'about.solutions.item3.desc' },
    { icon: CheckCircle, titleKey: 'about.solutions.item4.title', descKey: 'about.solutions.item4.desc' },
    { icon: BarChart3, titleKey: 'about.solutions.item5.title', descKey: 'about.solutions.item5.desc' },
    { icon: Boxes, titleKey: 'about.solutions.item6.title', descKey: 'about.solutions.item6.desc' },
    { icon: Plug, titleKey: 'about.solutions.item7.title', descKey: 'about.solutions.item7.desc' },
  ];

  // Our Advantages data (6 items, title + description)
  const advantageItems = [
    { icon: Award, titleKey: 'about.advantages.item1.title', descKey: 'about.advantages.item1.desc' },
    { icon: BadgeCheck, titleKey: 'about.advantages.item2.title', descKey: 'about.advantages.item2.desc' },
    { icon: Settings, titleKey: 'about.advantages.item3.title', descKey: 'about.advantages.item3.desc' },
    { icon: Plug, titleKey: 'about.advantages.item4.title', descKey: 'about.advantages.item4.desc' },
    { icon: Zap, titleKey: 'about.advantages.item5.title', descKey: 'about.advantages.item5.desc' },
    { icon: Headphones, titleKey: 'about.advantages.item6.title', descKey: 'about.advantages.item6.desc' },
  ];

  // Why Choose Us data (7 items)
  const whyChooseItems = [
    { icon: Award, titleKey: 'about.whyChoose.item1.title', descKey: 'about.whyChoose.item1.desc' },
    { icon: BadgeCheck, titleKey: 'about.whyChoose.item2.title', descKey: 'about.whyChoose.item2.desc' },
    { icon: Settings, titleKey: 'about.whyChoose.item3.title', descKey: 'about.whyChoose.item3.desc' },
    { icon: Boxes, titleKey: 'about.whyChoose.item4.title', descKey: 'about.whyChoose.item4.desc' },
    { icon: Plug, titleKey: 'about.whyChoose.item5.title', descKey: 'about.whyChoose.item5.desc' },
    { icon: Zap, titleKey: 'about.whyChoose.item6.title', descKey: 'about.whyChoose.item6.desc' },
    { icon: Headphones, titleKey: 'about.whyChoose.item7.title', descKey: 'about.whyChoose.item7.desc' },
  ];

  // ===== V6 UNIFIED PER-SECTION CARD STYLE SYSTEM =====
  // Soft, cohesive gradients per section — warm accent only for Pain Points icons,
  // cool cyan/blue for Solutions, indigo/violet for Advantages & Why Choose.

  // Pain Points (6) — soft warm gradients + top-to-bottom left accent bar
  const painIconStyles = [
    { grad: 'linear-gradient(135deg, #fcd34d 0%, #fb923c 100%)', glow: 'rgba(251,146,60,0.32)', bar: 'linear-gradient(to bottom, #fbbf24 0%, #fb923c 55%, #fca5a5 100%)' },
    { grad: 'linear-gradient(135deg, #fde68a 0%, #fdba74 100%)', glow: 'rgba(251,146,60,0.28)', bar: 'linear-gradient(to bottom, #fcd34d 0%, #fdba74 55%, #fecaca 100%)' },
    { grad: 'linear-gradient(135deg, #fed7aa 0%, #fda4af 100%)', glow: 'rgba(251,113,133,0.28)', bar: 'linear-gradient(to bottom, #fdba74 0%, #fb7185 55%, #fca5a5 100%)' },
    { grad: 'linear-gradient(135deg, #fecaca 0%, #f9a8d4 100%)', glow: 'rgba(244,114,182,0.26)', bar: 'linear-gradient(to bottom, #fca5a5 0%, #f472b6 55%, #c4b5fd 100%)' },
    { grad: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)', glow: 'rgba(251,191,36,0.30)', bar: 'linear-gradient(to bottom, #fde68a 0%, #fbbf24 55%, #fdba74 100%)' },
    { grad: 'linear-gradient(135deg, #fda4af 0%, #c4b5fd 100%)', glow: 'rgba(167,139,250,0.26)', bar: 'linear-gradient(to bottom, #f9a8d4 0%, #c4b5fd 55%, #a5b4fc 100%)' },
  ];

  // Solutions (7) — cyan/blue/green gradients, capsule top bars
  const solutionBarStyles = [
    'linear-gradient(90deg, #22d3ee, #67e8f9)',
    'linear-gradient(90deg, #2dd4bf, #5eead4)',
    'linear-gradient(90deg, #38bdf8, #7dd3fc)',
    'linear-gradient(90deg, #34d399, #6ee7b7)',
    'linear-gradient(90deg, #22d3ee, #2dd4bf)',
    'linear-gradient(90deg, #60a5fa, #93c5fd)',
    'linear-gradient(90deg, #2dd4bf, #22d3ee)',
  ];
  const solutionIconStyles = [
    { grad: 'linear-gradient(135deg, #67e8f9 0%, #22d3ee 100%)', glow: 'rgba(34,211,238,0.30)' },
    { grad: 'linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)', glow: 'rgba(45,212,191,0.30)' },
    { grad: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)', glow: 'rgba(56,189,248,0.30)' },
    { grad: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)', glow: 'rgba(52,211,153,0.30)' },
    { grad: 'linear-gradient(135deg, #5eead4 0%, #22d3ee 100%)', glow: 'rgba(34,211,238,0.28)' },
    { grad: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)', glow: 'rgba(96,165,250,0.30)' },
    { grad: 'linear-gradient(135deg, #67e8f9 0%, #2dd4bf 100%)', glow: 'rgba(45,212,191,0.28)' },
  ];

  // Advantages (6) — indigo/violet, numbered badges with gradient fill + divider
  const advantageNumStyles = [
    { numGrad: 'linear-gradient(135deg, #a5b4fc, #6366f1)', numBorder: 'rgba(99,102,241,0.35)' },
    { numGrad: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)', numBorder: 'rgba(139,92,246,0.35)' },
    { numGrad: 'linear-gradient(135deg, #d8b4fe, #a855f7)', numBorder: 'rgba(168,85,247,0.35)' },
    { numGrad: 'linear-gradient(135deg, #93c5fd, #3b82f6)', numBorder: 'rgba(59,130,246,0.35)' },
    { numGrad: 'linear-gradient(135deg, #a5b4fc, #4f46e5)', numBorder: 'rgba(79,70,229,0.35)' },
    { numGrad: 'linear-gradient(135deg, #c4b5fd, #7c3aed)', numBorder: 'rgba(124,58,237,0.35)' },
  ];

  // Why Choose Us (7) — violet/magenta, 2px full-width top bar fading to ends
  const whyChooseTopAccents = [
    'linear-gradient(90deg, transparent 0%, #8b5cf6 35%, #d946ef 65%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, #d946ef 35%, #f472b6 65%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, #7c3aed 35%, #8b5cf6 65%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, #ec4899 35%, #f472b6 65%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, #a855f7 35%, #d946ef 65%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, #8b5cf6 35%, #a855f7 65%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, #7c3aed 35%, #8b5cf6 65%, transparent 100%)',
  ];
  const whyIconStyles = [
    { grad: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', glow: 'rgba(139,92,246,0.30)' },
    { grad: 'linear-gradient(135deg, #e879f9 0%, #d946ef 100%)', glow: 'rgba(217,70,239,0.30)' },
    { grad: 'linear-gradient(135deg, #c4b5fd 0%, #7c3aed 100%)', glow: 'rgba(124,58,237,0.30)' },
    { grad: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', glow: 'rgba(236,72,153,0.30)' },
    { grad: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)', glow: 'rgba(217,70,239,0.28)' },
    { grad: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', glow: 'rgba(124,58,237,0.28)' },
    { grad: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 100%)', glow: 'rgba(139,92,246,0.30)' },
  ];

  const contactEmail = settings?.contactEmail || 'sabina@wstoolcabinet.com';
  const contactPhone = settings?.contactPhone || '+86 156 2216 0659';

  // (Legacy editor-driven company image extraction removed — V2 uses a fixed asset)

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

      {/* Company Introduction — extracted to <CompanyShowcase> (V8 visual refresh) */}
      <CompanyShowcase t={t} locale={locale} />

      {/* Customer Pain Points — V6 glassmorphism diagnosis rows */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-stone-50/60 to-white">
        <V6FloatOrbs colors={['#fbbf24', '#fb923c', '#fca5a5']} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 v6-title-reveal">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t('about.painPoints.title')}</h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">{t('about.painPoints.subtitle')}</p>
            <div className="v6-shimmer-line w-24 h-1.5 mx-auto mt-4 rounded-full" style={{ background: 'linear-gradient(90deg, #fbbf24, #fb923c, #fca5a5)' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPointItems.map((item, idx) => {
              const Icon = item.icon;
              const p = painIconStyles[idx % painIconStyles.length];
              return (
                <div key={idx} className="group relative rounded-2xl backdrop-blur-sm bg-white/80 border border-white/60 p-5 shadow-[0_4px_20px_-8px_rgba(251,146,60,0.18)] transition-all duration-300 hover:shadow-[0_18px_46px_-14px_rgba(251,146,60,0.30)] hover:-translate-y-1.5 hover:border-orange-200/70 overflow-hidden" style={{ animation: 'v6-cardEnter 0.7s cubic-bezier(0.22,1,0.36,1) backwards', animationDelay: `${idx * 0.1}s` }}>
                  <div className="absolute start-0 top-4 bottom-4 w-[3px] rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-300" style={{ background: p.bar }} />
                  <span className="absolute end-4 top-1/2 -translate-y-1/2 text-5xl font-black text-orange-200/0 group-hover:text-orange-200/40 transition-colors duration-300 select-none pointer-events-none">{String(idx + 1).padStart(2, '0')}</span>
                  <div className="relative flex gap-4 ps-4">
                    <div className="relative shrink-0">
                      <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `conic-gradient(from 0deg, transparent 0%, ${p.glow} 30%, transparent 60%)`, animation: 'iconRingSpin 4s linear infinite' }} />
                      <div className="relative w-12 h-12 rounded-full flex items-center justify-center text-white shadow-[0_4px_16px_-3px_rgba(251,146,60,0.35)] group-hover:scale-105 transition-transform duration-300" style={{ background: p.grad, animation: 'v6-iconBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) backwards', animationDelay: `${idx * 0.1 + 0.2}s` }}>
                        <Icon className="w-5 h-5" strokeWidth={1.8} />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1.5">{t(item.titleKey)}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{t(item.descKey)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Solutions — V6 centered glass feature cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-cyan-50/40 to-white">
        <V6FloatOrbs colors={['#22d3ee', '#2dd4bf', '#38bdf8']} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #06b6d4 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 v6-title-reveal">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t('about.solutions.title')}</h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">{t('about.solutions.subtitle')}</p>
            <div className="v6-shimmer-line w-24 h-1.5 mx-auto mt-4 rounded-full" style={{ background: 'linear-gradient(90deg, #22d3ee, #2dd4bf, #38bdf8)' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutionItems.map((item, idx) => {
              const Icon = item.icon;
              const s = solutionIconStyles[idx % solutionIconStyles.length];
              const bar = solutionBarStyles[idx % solutionBarStyles.length];
              return (
                <div key={idx} className={`group relative rounded-2xl backdrop-blur-sm bg-white/80 border border-white/60 p-6 shadow-[0_4px_20px_-8px_rgba(34,211,238,0.16)] transition-all duration-300 hover:shadow-[0_20px_52px_-14px_rgba(34,211,238,0.30)] hover:-translate-y-1.5 hover:border-cyan-200/70 flex flex-col items-center text-center overflow-hidden${idx === solutionItems.length - 1 ? ' lg:col-start-2' : ''}`} style={{ animation: 'v6-cardEnter 0.7s cubic-bezier(0.22,1,0.36,1) backwards', animationDelay: `${idx * 0.1}s` }}>
                  <div className="w-16 h-1.5 rounded-full mb-5" style={{ background: bar }} />
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `conic-gradient(from 0deg, transparent 0%, ${s.glow} 30%, transparent 60%)`, animation: 'iconRingSpin 4s linear infinite' }} />
                    <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_8px_24px_-6px_rgba(34,211,238,0.35)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" style={{ background: s.grad, animation: 'v6-iconBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) backwards', animationDelay: `${idx * 0.1 + 0.2}s` }}>
                      <Icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-5">{t(item.titleKey)}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{t(item.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Advantages — V6 compact numbered glass bars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-indigo-50/30 to-white">
        <V6FloatOrbs colors={['#818cf8', '#8b5cf6', '#a855f7']} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 v6-title-reveal">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t('about.advantages.title')}</h2>
            <div className="v6-shimmer-line w-24 h-1.5 mx-auto mt-4 rounded-full" style={{ background: 'linear-gradient(90deg, #818cf8, #6366f1, #8b5cf6)' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantageItems.map((item, idx) => {
              const Icon = item.icon;
              const numStyle = advantageNumStyles[idx % advantageNumStyles.length];
              return (
                <div key={idx} className="group relative rounded-2xl backdrop-blur-sm bg-white/80 border border-white/60 p-8 shadow-[0_4px_20px_-8px_rgba(99,102,241,0.16)] transition-all duration-300 hover:shadow-[0_20px_52px_-14px_rgba(99,102,241,0.30)] hover:-translate-y-1.5 hover:border-indigo-200/70 flex flex-col items-center text-center overflow-hidden min-h-[220px]" style={{ animation: 'v6-cardEnter 0.7s cubic-bezier(0.22,1,0.36,1) backwards', animationDelay: `${idx * 0.1}s` }}>
                  {/* Top gradient accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl opacity-70" style={{ background: 'linear-gradient(90deg, #818cf8, #6366f1)' }} />
                  {/* Numbered circle */}
                  <div className="relative w-14 h-14 rounded-full flex items-center justify-center text-lg font-black text-white select-none mb-5 shadow-[0_6px_18px_-4px_rgba(99,102,241,0.45)]" style={{ background: numStyle.numGrad, border: `1.5px solid ${numStyle.numBorder}` }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{t(item.titleKey)}</h3>
                  <div className="w-10 h-[2px] rounded-full mb-4 opacity-50" style={{ background: numStyle.numGrad }} />
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{t(item.descKey)}</p>
                  {/* Decorative icon */}
                  <div className="mt-4 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6" strokeWidth={1.8} style={{ color: numStyle.numBorder }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us — V6 glass benefit cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-violet-50/25 to-white">
        <V6FloatOrbs colors={['#8b5cf6', '#a855f7', '#d946ef']} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #8b5cf6 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 v6-title-reveal">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{t('about.whyChoose.title')}</h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">{t('about.whyChoose.subtitle')}</p>
            <div className="v6-shimmer-line w-24 h-1.5 mx-auto mt-4 rounded-full" style={{ background: 'linear-gradient(90deg, #8b5cf6, #a855f7, #d946ef)' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseItems.map((item, idx) => {
              const Icon = item.icon;
              const iconStyle = whyIconStyles[idx % whyIconStyles.length];
              const accent = whyChooseTopAccents[idx % whyChooseTopAccents.length];
              return (
                <div key={idx} className={`group relative rounded-2xl overflow-hidden backdrop-blur-sm bg-white/80 border border-white/60 p-6 shadow-[0_4px_20px_-8px_rgba(139,92,246,0.16)] transition-all duration-300 hover:shadow-[0_22px_56px_-14px_rgba(139,92,246,0.32)] hover:-translate-y-1.5 hover:rotate-1 hover:border-violet-200/70 flex gap-5${idx === whyChooseItems.length - 1 ? ' lg:col-start-2' : ''}`} style={{ animation: 'v6-cardEnter 0.7s cubic-bezier(0.22,1,0.36,1) backwards', animationDelay: `${idx * 0.1}s` }}>
                  <div className="absolute start-0 top-0 w-full h-[2px]" style={{ background: accent }} />
                  <div className="shrink-0">
                    <div className="relative">
                      <div className="absolute -inset-1.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `conic-gradient(from 0deg, transparent 0%, ${iconStyle.glow} 30%, transparent 60%)`, animation: 'iconRingSpin 4s linear infinite' }} />
                      <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_6px_20px_-4px_rgba(139,92,246,0.35)] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" style={{ background: iconStyle.grad, animation: 'v6-iconBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) backwards', animationDelay: `${idx * 0.1 + 0.2}s` }}>
                        <Icon className="w-6 h-6" strokeWidth={1.6} />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{t(item.titleKey)}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{t(item.descKey)}</p>
                  </div>
                </div>
              );
            })}
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

                      {/* Number — static (CountUp animation removed in V7) */}
                      <div className="text-5xl lg:text-[4.25rem] font-black mb-1.5 tracking-tighter text-center relative" style={{ lineHeight: 1.05, color: '#111827' }}>
                        <span>{stat.prefix}{stat.number}{stat.suffix}</span>
                        {/* Number underline accent */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-[2px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 group-hover:w-20"
                          style={{ background: `linear-gradient(90deg, ${p.barColor}, transparent)` }}
                        />
                      </div>

                      {/* V8: Gradient progress bar under number (replaces bubble/shatter effect) */}
                      <div className="mt-1 h-1 rounded-full overflow-hidden mx-auto" style={{ maxWidth: '120px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)' }}>
                        <div className="h-full" style={{
                          background: `linear-gradient(90deg, ${p.barColor}, ${p.glowColor})`,
                          width: `${stat.number * 8 + 20}%`,
                          transition: 'width 1.5s ease-out 0.5s',
                        }} />
                      </div>

                      {/* Label */}
                      <p className="text-[14px] font-bold uppercase tracking-wider mt-3 text-center text-gray-600">
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

      {/* Factory Photo Carousel — V7: real factory scenes grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('about.factoryCarousel.title')}</h2>
            <p className="text-lg text-gray-600">{t('about.factoryCarousel.subtitle')}</p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
              {[
                '/images/about/factory-carousel-1.jpg',
                '/images/about/factory-carousel-2.jpg',
                '/images/about/factory-carousel-3.jpg',
                '/images/about/factory-carousel-4.jpg',
                '/images/about/factory-carousel-5.jpg',
                '/images/about/factory-carousel-6.jpg',
              ].map((src, i) => (
                <div key={i} className="relative aspect-[4/3] group">
                  <Image src={src} alt={`Factory ${i + 1}`} fill className="object-cover" loading="lazy" quality={80} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-sm tracking-wider">
                      {locale === 'zh'
                        ? ['智能柜生产车间', 'PUSH 发货检测区', '成品组装流水线', '多型号智能柜展示', '安装调试现场', '批量出厂质检'][i]
                        : ['Smart Cabinet Workshop', 'PUSH Testing Area', 'Assembly Line', 'Multi-model Display', 'Installation Site', 'QC Inspection'][i]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
          {/* V8.4 fix: bug 2 — intro paragraph between the heading and the milestones */}
          <p className="text-base text-gray-500 max-w-3xl mx-auto mt-5 leading-relaxed">
            {t('about.timeline.intro')}
          </p>
        </div>

        <div className="relative pb-4">
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
                <Image
                  src={item.src}
                  alt={t(item.altKey)}
                  fill={true}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  quality={80}
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
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 30%, #f0fdf4 60%, #fffbeb 100%)',
      }}>
        {/* Ambient soft pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t('about.values.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </div>

          {/* ===== 3D BOOK WITH PAGE FLIP ===== */}
          <ValuesBook values={values} t={t} locale={locale} />
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

          {/* Real certification photo wall */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-xl border border-gray-200/60">
            <Image
              src="/images/about/certificates-real.jpg"
              alt="Certifications"
              width={1200}
              height={500}
              className="w-full h-auto object-cover"
              quality={90}
            />
          </div>

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

      {/* Main Clients — extracted to <ClientWall> (V8 visual refresh) */}
      <ClientWall t={t} locale={locale} />

      {/* ===== CTA v264 — 明亮水晶水族馆（Crystal-Clear Aquarium） ===== */}
      <section
        className="py-24 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #67e8f9 0%, #06b6d4 35%, #0e7490 68%, #0369a1 100%)',
        }}
      >
        {/* === 背景装饰层 v264 — 明亮水晶水族馆 === */}

        {/* 1) God Rays 光柱（更宽更亮更动感，从顶部射入水面） */}
        {[0, 1, 2, 3].map((i) => (
          <div key={`ray-${i}`} className="absolute pointer-events-none" style={{
            top: '-20%',
            left: `${4 + i * 24}%`,
            width: `${18 + (i % 2) * 4}%`,
            height: '150%',
            background: 'linear-gradient(105deg, transparent 38%, rgba(220,245,255,0.26) 50%, transparent 62%)',
            transformOrigin: 'top center',
            transform: 'rotate(6deg)',
            animation: `ocean-godRay ${8 + i * 1.2}s ease-in-out infinite`,
            animationDelay: `${(i * 0.9).toFixed(1)}s`,
          }} />
        ))}

        {/* 2) 水面波光层（水晶感核心：阳光在水面的反射光斑，缓慢呼吸） */}
        {[
          { left: '11%', top: '7%', w: 340, h: 190, d: '0s' },
          { left: '37%', top: '2%', w: 440, h: 210, d: '1.4s' },
          { left: '63%', top: '9%', w: 360, h: 190, d: '2.8s' },
          { left: '83%', top: '4%', w: 300, h: 160, d: '0.7s' },
        ].map((spot, i) => (
          <div key={`shimmer-${i}`} className="absolute pointer-events-none" style={{
            left: spot.left,
            top: spot.top,
            width: spot.w,
            height: spot.h,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.20) 0%, rgba(224,247,250,0.10) 45%, transparent 72%)',
            animation: 'ocean-shimmer 6s ease-in-out infinite',
            animationDelay: spot.d,
          }} />
        ))}

        {/* 3) 水中焦散纹（水底光影，提亮增强） */}
        <div className="absolute pointer-events-none" style={{
          left: '0',
          bottom: '0',
          width: '100%',
          height: '55%',
          background:
            'radial-gradient(ellipse 42% 60% at 14% 100%, rgba(165,243,252,0.25) 0%, transparent 62%),' +
            'radial-gradient(ellipse 36% 54% at 38% 100%, rgba(186,230,253,0.22) 0%, transparent 60%),' +
            'radial-gradient(ellipse 30% 46% at 62% 100%, rgba(103,232,249,0.20) 0%, transparent 60%),' +
            'radial-gradient(ellipse 28% 44% at 86% 100%, rgba(167,243,208,0.18) 0%, transparent 60%)',
          animation: 'ocean-caustic 16s ease-in-out infinite',
        }} />

        {/* 4) 漂浮微粒（Plankton / 水中尘埃，提亮、幅度增大） */}
        {['12%', '22%', '35%', '47%', '57%', '67%', '73%', '81%', '88%', '15%', '28%', '42%', '62%', '79%', '91%', '33%'].map((left, i) => (
          <div key={`plk-${i}`} className="absolute rounded-full pointer-events-none" style={{
            left,
            top: `${8 + ((i * 11) % 78)}%`,
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            background: 'rgba(255,255,255,0.7)',
            animation: `ocean-plankton ${12 + (i % 7) * 2.5}s ease-in-out infinite`,
            animationDelay: `${(i * 0.5).toFixed(1)}s`,
          }} />
        ))}

        {/* 5) 游动的鱼群剪影（更快更显眼，带正弦上下浮动 + 白色高光描边）
             V9 FIX: use pre-mirrored paths instead of transform:scaleX(-1) to avoid CSS animation override
             - right-facing fish: head at x=116
             - left-facing fish: mirrored path with head at x=4 */}
        {[
          { top: '16%', size: 130, dur: 18, delay: '0s', dir: 'right', color: 'rgba(64,190,220,0.85)', colorLight: 'rgba(150,235,245,0.95)' },
          { top: '31%', size: 78, dur: 22, delay: '4s', dir: 'left', color: 'rgba(80,200,180,0.82)', colorLight: 'rgba(160,235,215,0.95)' },
          { top: '47%', size: 158, dur: 24, delay: '2.5s', dir: 'right', color: 'rgba(56,189,248,0.85)', colorLight: 'rgba(150,220,250,0.95)' },
          { top: '39%', size: 56, dur: 15, delay: '9s', dir: 'left', color: 'rgba(94,200,230,0.84)', colorLight: 'rgba(170,230,245,0.95)' },
          { top: '58%', size: 104, dur: 20, delay: '6s', dir: 'right', color: 'rgba(72,200,200,0.82)', colorLight: 'rgba(160,235,225,0.95)' },
          { top: '24%', size: 72, dur: 17, delay: '12s', dir: 'left', color: 'rgba(80,200,180,0.8)', colorLight: 'rgba(160,235,215,0.95)' },
          { top: '66%', size: 92, dur: 21, delay: '15s', dir: 'right', color: 'rgba(60,190,225,0.85)', colorLight: 'rgba(150,225,245,0.95)' },
        ].map((fish, i) => {
          const rightPath = "M4,30 C20,12 70,12 90,24 L116,4 L106,30 L116,56 L90,36 C70,48 20,48 4,30 Z";
          const leftPath = "M116,30 C100,48 50,48 30,36 L4,56 L14,30 L4,4 L30,24 C50,12 100,12 116,30 Z";
          const fishPath = fish.dir === 'left' ? leftPath : rightPath;
          return (
            <div key={`fish-${i}`} className="absolute pointer-events-none" style={{
              top: fish.top,
              left: '0',
              width: fish.size,
              height: fish.size / 2,
              animation: `ocean-fish-${fish.dir} ${fish.dur}s linear infinite`,
              animationDelay: fish.delay,
              transformOrigin: 'center center',
            }}>
              {/* Wrapper div for horizontal mirror (scaleX) — isolated from animation's transform */}
              <div style={{ width: '100%', height: '100%', transform: 'scaleX(-1)' }}>
                <svg viewBox="0 0 120 60" width="100%" height="100%" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id={`fishGrad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={fish.colorLight} />
                      <stop offset="100%" stopColor={fish.color} />
                    </linearGradient>
                  </defs>
                  <path
                    d={fishPath}
                    fill={`url(#fishGrad-${i})`}
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          );
        })}

        {/* 6) 上升气泡（增强版：更多更亮 + 高光点） */}
        {[...Array(16)].map((_, i) => (
          <div key={`bubble-${i}`} className="absolute rounded-full pointer-events-none" style={{
            left: `${2 + i * 6.1}%`,
            bottom: '8px',
            width: `${4 + (i % 5) * 3}px`,
            height: `${4 + (i % 5) * 3}px`,
            background: 'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.85) 0%, rgba(186,230,253,0.28) 55%, transparent 72%)',
            border: '1px solid rgba(255,255,255,0.45)',
            boxShadow: '0 0 10px rgba(186,230,253,0.6), inset 0 0 4px rgba(255,255,255,0.5)',
            animation: `ocean-bubble-rise ${7 + (i % 6) * 1.4}s ease-in-out infinite`,
            animationDelay: `${(i * 0.7).toFixed(1)}s`,
          }}>
            <span style={{
              position: 'absolute', top: '16%', left: '20%',
              width: '34%', height: '34%', borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
            }} />
          </div>
        ))}

        {/* 7) 底部水草 / 海草（随水流摇摆，提亮加宽） */}
        {['left', 'right'].map((side, s) => (
          <div key={`weed-${side}`} className="absolute pointer-events-none" style={{
            left: side === 'left' ? '0' : undefined,
            right: side === 'right' ? '0' : undefined,
            bottom: '0',
            width: '150px',
            height: '210px',
          }}>
            {[0, 1, 2, 3].map((b) => (
              <div key={`b-${b}`} style={{
                position: 'absolute',
                bottom: '0',
                left: `${(side === 'left' ? 12 : 8) + b * 30}px`,
                width: `${18 - b * 2}px`,
                height: `${80 + b * 30}px`,
                borderRadius: '60% 60% 50% 50% / 0 0 100% 100%',
                background: 'linear-gradient(to top, rgba(20,184,166,0) 0%, rgba(20,184,166,0.65) 100%)',
                transformOrigin: 'bottom center',
                animation: `ocean-seaweed ${(5 + b * 0.7 + s * 0.6).toFixed(1)}s ease-in-out infinite`,
                animationDelay: `${(b * 0.4).toFixed(1)}s`,
              }} />
            ))}
          </div>
        ))}

        {/* 内容区 — 水族馆观景玻璃面板 */}
        <div className="relative z-10 mx-auto max-w-3xl px-4">
          <div
            className="rounded-3xl px-7 py-12 sm:px-12 text-center"
            style={{
              background: 'linear-gradient(160deg, rgba(6,45,80,0.50) 0%, rgba(8,40,70,0.62) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(165,243,252,0.28)',
              boxShadow: '0 18px 50px rgba(4,30,60,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {/* 标题 */}
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight text-white"
              style={{ textShadow: '0 2px 18px rgba(2,40,70,0.45)' }}
            >
              {t('about.cta.title')}
            </h2>
            <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed text-white" style={{ textShadow: '0 1px 10px rgba(2,40,70,0.4)' }}>
              {t('about.cta.subtitle')}
            </p>

            {/* 按钮组 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a href={`/${locale}/contact`}
                className="group relative inline-flex items-center justify-center px-10 py-4 font-bold rounded-xl overflow-hidden cursor-pointer text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(20,184,166,0.95) 0%, rgba(13,148,136,0.9) 50%, rgba(16,185,129,0.9) 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 32px rgba(20,184,166,0.45), inset 0 1px 0 rgba(255,255,255,0.35), 0 0 0 1px rgba(255,255,255,0.2) inset',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {t('nav.contact')}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              <a href={`tel:${contactPhone.replace(/\s/g, '')}`}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl cursor-pointer text-base transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1.5px solid rgba(165,243,252,0.55)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  boxShadow: '0 6px 20px rgba(4,30,60,0.18)',
                }}
              >
                <Phone className="mr-2 w-4 h-4" />
                {contactPhone}
              </a>
            </div>

            {/* 联系信息 */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white" style={{ textShadow: '0 1px 8px rgba(2,40,70,0.38)' }}>
              <a href={`mailto:${contactEmail}`} className="hover:text-cyan-100 transition-colors inline-flex items-center gap-1.5 opacity-95 hover:opacity-100">
                <Mail className="w-3.5 h-3.5" /> {contactEmail}
              </a>
              <span className="hidden sm:inline" style={{ opacity: 0.55 }}>|</span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Guangzhou, China
              </span>
            </div>
          </div>
        </div>

        {/* 底部渐变淡出 — 平滑过渡到 Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, transparent, rgba(3,40,70,0.45))',
        }} />
      </section>

      {/* ===== ALL ANIMATION KEYFRAMES (v134) ===== */}
      <style>{`
        /* ===== Premium stat card animations ===== */

        @keyframes v6-cardEnter {
          0% { opacity: 0; transform: translateY(40px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes v6-iconBounce {
          0% { opacity: 0; transform: scale(0) rotate(-10deg); }
          60% { opacity: 1; transform: scale(1.15) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes v6-titleReveal {
          0% { opacity: 0; transform: translateY(20px); letter-spacing: 0.3em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: normal; }
        }
        @keyframes v6-orbFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .v6-title-reveal { animation: v6-titleReveal 0.8s cubic-bezier(0.22,1,0.36,1) backwards; }
        .v6-shimmer-line { position: relative; overflow: hidden; }
        .v6-shimmer-line::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent);
          transform: translateX(-100%);
          animation: shimmer-bar 2.6s ease-in-out infinite;
        }

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
        /* V8: Bubble/shatter animations removed — replaced with gradient progress bar */
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

        /* ===== Professional CTA animations (v180 — 商务蓝主题) ===== */
        @keyframes v180-glowDrift1 {
          0%{transform:translate(0,0) scale(1); opacity:0.6}
          100%{transform:translate(-30px, 20px) scale(1.15); opacity:1}
        }
        @keyframes v180-glowDrift2 {
          0%{transform:translate(0,0) scale(1); opacity:0.5}
          100%{transform:translate(40px, -25px) scale(1.2); opacity:0.85}
        }
        @keyframes v180-beamSweep {
          0%{transform:rotate(-25deg) translate(20%, -20%) rotate(0deg)}
          100%{transform:rotate(-25deg) translate(20%, -20%) rotate(360deg)}
        }
        @keyframes v180-particleFloat {
          0%,100%{transform:translate(0,0) translateY(0); opacity:0.3}
          25%{opacity:0.7; transform:translate(4px,-12px)}
          50%{opacity:0.4; transform:translate(-3px,-20px)}
          75%{opacity:0.65; transform:translate(5px,-8px)}
        }

        /* ===== CTA v264 — 明亮水晶水族馆动画（Crystal-Clear Aquarium） ===== */

        /* God Rays 光柱大角度摇曳（更亮更动感） */
        @keyframes ocean-godRay {
          0%,100%{ transform: rotate(2deg) translateX(-15px); opacity: 0.6; }
          50%{ transform: rotate(18deg) translateX(15px); opacity: 1; }
        }
        /* 水面波光：阳光反射光斑缓慢呼吸（水晶感核心） */
        @keyframes ocean-shimmer {
          0%,100%{ transform: translate(0,0) scale(1); opacity: 0.6; }
          50%{ transform: translate(2%, 1%) scale(1.05); opacity: 1; }
        }
        /* 水中焦散纹缓慢位移（提亮） */
        @keyframes ocean-caustic {
          0%,100%{ transform: translateX(-3%) translateY(0); opacity: 0.85; }
          50%{ transform: translateX(3%) translateY(-8px); opacity: 1; }
        }
        /* 漂浮微粒缓慢漂移（提亮、幅度增大） */
        @keyframes ocean-plankton {
          0%,100%{ transform: translate(0,0); opacity: 0.35; }
          50%{ transform: translate(18px,-30px); opacity: 0.75; }
        }
        /* 鱼群 — 从左向右游（更快，带正弦上下浮动） */
        @keyframes ocean-fish-right {
          0%   { transform: translateX(-160px) translateY(0); opacity: 0; }
          8%   { opacity: 1; }
          25%  { transform: translateX(20vw) translateY(-8px); }
          50%  { transform: translateX(45vw) translateY(8px); }
          75%  { transform: translateX(70vw) translateY(-8px); }
          92%  { opacity: 1; }
          100% { transform: translateX(120vw) translateY(0); opacity: 0; }
        }
        /* 鱼群 — 从右向左游（更快，带正弦上下浮动） */
        @keyframes ocean-fish-left {
          0%   { transform: translateX(120vw) translateY(0); opacity: 0; }
          8%   { opacity: 1; }
          25%  { transform: translateX(70vw) translateY(-8px); }
          50%  { transform: translateX(45vw) translateY(8px); }
          75%  { transform: translateX(20vw) translateY(-8px); }
          92%  { opacity: 1; }
          100% { transform: translateX(-160px) translateY(0); opacity: 0; }
        }
        /* 上升气泡：带左右摇摆路径 + 高光 */
        @keyframes ocean-bubble-rise {
          0%{ transform: translate(0,0) scale(0.6); opacity: 0; }
          10%{ opacity: 0.85; }
          50%{ transform: translate(12px,-45vh) scale(1); }
          75%{ transform: translate(-10px,-68vh) scale(0.92); }
          92%{ opacity: 0.6; }
          100%{ transform: translate(5px,-90vh) scale(0.7); opacity: 0; }
        }
        /* 水草随水流摇摆 */
        @keyframes ocean-seaweed {
          0%,100%{ transform: rotate(-6deg); }
          50%{ transform: rotate(6deg); }
        }

        /* ===== Subtle wave separator animations ===== */
        @keyframes v135-waveBack {
          0%,100%{transform:translateX(0) translateY(0)}
          50%{transform:translateX(-35px) translateY(-7px)}
        }
        @keyframes v135-waveMid {
          0%,100%{transform:translateX(0) translateY(0)}
          50%{transform:translateX(28px) translateY(3px)}
        }
        @keyframes v135-waveFront {
          0%,100%{transform:translateX(0) translateY(0)}
          50%{transform:translateX(28px) translateY(-8px)}
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
          0%,100%{opacity:0.2; transform:scale(0.96); border-width: 1px}
          50%{opacity:0.55; transform:scale(1.06); border-width: 2px}
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
        /* ===== CTA content fade-in-up animation ===== */
        @keyframes cta-fade-in-up {
          0%{opacity:0; transform:translateY(32px)}
          100%{opacity:1; transform:translateY(0)}
        }
      `}</style>
    </div>
  );
}
