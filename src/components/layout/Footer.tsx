'use client';

import { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin, Globe, ArrowRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchUnifiedSettings } from '@/data/unified-data';
import Logo from '@/components/Logo';

// Firefly component - separated to avoid hydration mismatch
function Firefly({ index }: { index: number }) {
  const [style, setStyle] = useState<React.CSSProperties | null>(null);

  useEffect(() => {
    // Generate random values ONLY on client side (after hydration)
    const fireflyColors = [
      { core: '#fef08a', glow: 'rgba(254,240,138,0.7)', outer: 'rgba(253,224,71,0.25)' },
      { core: '#d9f99d', glow: 'rgba(217,249,157,0.65)', outer: 'rgba(163,230,53,0.2)' },
      { core: '#a5f3fc', glow: 'rgba(165,243,252,0.55)', outer: 'rgba(34,211,238,0.18)' },
    ];
    const fc = fireflyColors[index % 3];
    const fSize = 3 + (index % 4) * 1.5;
    
    setStyle({
      left: `${2 + Math.random() * 95}%`,
      bottom: `${Math.random() * 70}%`,
      width: `${fSize}px`,
      height: `${fSize}px`,
      background: `radial-gradient(circle, ${fc.core} 0%, ${fc.glow} 40%, transparent 75%)`,
      boxShadow: `0 0 ${fSize * 2}px ${fc.glow}, 0 0 ${fSize * 4}px ${fc.outer}`,
      animation: `firefly-drift ${6 + Math.random() * 10}s ease-in-out infinite, firefly-flicker ${1.5 + Math.random() * 2}s ease-in-out infinite`,
      animationDelay: `${Math.random() * 10}s`,
    });
  }, [index]);

  if (!style) return null;

  return (
    <span
      className="absolute rounded-full"
      style={style}
    />
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { locale, t } = useLocale();
  const isRTL = locale === 'ar';

  const [settings, setSettings] = useState<{
    companyName: string; companyNameZh: string; companyNameAr: string;
    logo: string; favicon: string;
    contactEmail: string; contactPhone: string; contactWhatsApp: string;
    contactEmails: string[]; contactPhones: string[]; contactWhatsAppNumbers: string[];
    address: string; addressZh: string; addressAr: string;
    seoTitle: string; seoDescription: string; seoKeywords: string; seoOgImage: string;
    socialFacebook: string; socialTwitter: string; socialLinkedin: string;
    socialYoutube: string; socialInstagram: string; socialWechat: string; socialWeibo: string;
    footerCopyright: string; footerLinks: string;
  } | null>(null);

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

  // Helper to get localized value
  const L = (zhVal: string, enVal: string, arVal: string) =>
    locale === 'zh' ? zhVal : locale === 'ar' ? arVal : enVal;

  const displayCompany = settings ? L(settings.companyNameZh || '广州秋彦科技有限公司', settings.companyName || 'Guangzhou Qiuyan Technology Co., Ltd.', settings.companyNameAr || '') : 'Guangzhou Qiuyan Technology Co., Ltd.';
  // Support multi-value contact info (arrays from admin settings)
  const displayEmails = (settings?.contactEmails && Array.isArray(settings.contactEmails) && settings.contactEmails.length > 0)
    ? settings.contactEmails.filter(e => e && e.trim())
    : (settings?.contactEmail ? [settings.contactEmail] : ['sabina@wstoolcabinet.com']);
  const displayPhones = (settings?.contactPhones && Array.isArray(settings.contactPhones) && settings.contactPhones.length > 0)
    ? settings.contactPhones.filter(p => p && p.trim())
    : (settings?.contactPhone ? [settings.contactPhone] : ['+86 156 2216 0659']);
  const displayAddress = settings ? L(settings.addressZh || '', settings.address || '', settings.addressAr || '') : '';
  const displayCopyright = settings?.footerCopyright?.replace('{year}', String(currentYear)) || `© ${currentYear} ${displayCompany}`;

  return (
    <footer className="relative text-gray-200 overflow-hidden" style={{ backgroundColor: '#334155' }}>
      {/* ===== DYNAMIC BACKGROUND EFFECTS ===== */}
      {/* Animated gradient mesh - very subtle */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.3) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.25) 0%, transparent 50%),
          radial-gradient(ellipse at 60% 80%, rgba(6,182,212,0.2) 0%, transparent 50%)
        `,
        animation: 'footer-bg-drift 12s ease-in-out infinite alternate',
        filter: 'blur(60px)',
      }} />

      {/* Fireflies — reduced to 4, very subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <Firefly key={i} index={i} />
        ))}
      </div>

      {/* Top accent line — animated gradient sweep */}
      <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
          style={{ animation: 'footer-line-sweep 4s ease-in-out infinite' }}
        />
      </div>

      {/* Subtle wave lines at the very bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none opacity-[0.03]">
        <svg className="absolute bottom-0 w-[200%] h-full" viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path d="M0,40 C200,70 400,10 600,45 C800,75 1000,20 1200,50 L1200,80 L0,80 Z" fill="url(#fw1)" style={{ animation: 'footer-wave-move 14s linear infinite' }} />
          <path d="M0,55 C300,30 500,65 750,42 C1000,18 1100,58 1200,48 L1200,80 L0,80 Z" fill="url(#fw2)" style={{ animation: 'footer-wave-move 11s linear infinite reverse' }} />
          <defs>
            <linearGradient id="fw1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="fw2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Ambient glow orbs — slow pulse */}
      <div className="absolute top-20 right-0 w-72 h-72 rounded-full blur-3xl z-0" style={{ backgroundColor: 'rgba(59, 130, 246, 0.06)', animation: 'footer-glow-pulse 6s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-32 left-0 w-96 h-96 rounded-full blur-3xl z-0" style={{ backgroundColor: 'rgba(245, 158, 11, 0.04)', animation: 'footer-glow-pulse 8s ease-in-out infinite alternate-reverse' }} />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Top section: Company info + Quick Links + Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-700/60">
          {/* Column 1: Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <Logo size={40} textClassName="text-white" />
            </div>
            <p className="text-sm leading-relaxed mb-5 text-gray-300">
              {t('footer.companyDescription')}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Globe className="w-4 h-4 flex-shrink-0" />
              <span>{displayCompany}</span>
            </div>
          </div>

          {/* Column 2: Quick Links Part A */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
              <span className="w-6 h-0.5 bg-blue-500 rounded" />
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: t('nav.home'), href: `/${locale}` },
                { label: t('nav.products'), href: `/${locale}/products` },
                { label: t('nav.about'), href: `/${locale}/about` },
                { label: t('nav.solutions'), href: `/${locale}/solutions` },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-blue-400 transition-colors text-sm flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links Part B */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm opacity-0 select-none h-0">&nbsp;</h4>
            <ul className="space-y-2.5 mt-[38px]">
              {[
                { label: t('nav.faq'), href: `/${locale}/faq` },
                { label: t('nav.contact'), href: `/${locale}/contact` },
                { label: locale === 'zh' ? '博客' : 'Blog', href: `/${locale}/blog` },
                { label: t('product.category.smartCabinets') || 'Smart Cabinets', href: `/${locale}/products?category=smart-cabinets` },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-blue-400 transition-colors text-sm flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
              <span className="w-6 h-0.5 bg-cyan-500 rounded" />
              {t('footer.contactInfo')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gray-800/80 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-900/50 transition-colors mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{locale === 'zh' ? '邮箱' : 'Email'}</p>
                  {displayEmails.map((email, i) => (
                    <a key={i} href={`mailto:${email}`} className="text-sm hover:text-blue-400 transition-colors block">{email}</a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gray-800/80 flex items-center justify-center flex-shrink-0 group-hover:bg-green-900/50 transition-colors mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{locale === 'zh' ? '电话' : 'Phone'}</p>
                  {displayPhones.map((phone, i) => (
                    <a key={i} href={`tel:${phone.replace(/\s/g, '')}`} className="text-sm hover:text-green-400 transition-colors block">{phone}</a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gray-800/80 flex items-center justify-center flex-shrink-0 group-hover:bg-red-900/50 transition-colors mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{locale === 'zh' ? '地址' : 'Address'}</p>
                  <p className="text-sm leading-relaxed">{displayAddress || (isRTL ? 'الصين، غوانغتشو، بانيو، شارع دالونغ، رقم 131، الطابق الثاني' : '2nd Floor No.131, Jinlong Road, Dalong Street, Panyu, Guangzhou, China')}</p>
                </div>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-3">{locale === 'zh' ? '关注我们' : 'Follow Us'}</p>
              <div className="flex gap-2.5">
                {settings?.socialFacebook && (
                  <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-800/80 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                )}
                {settings?.socialTwitter && (
                  <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-800/80 hover:bg-sky-500 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <Twitter className="w-3.5 h-3.5" />
                  </a>
                )}
                {settings?.socialYoutube && (
                  <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-800/80 hover:bg-red-600 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.121 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {settings?.socialInstagram && (
                  <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-800/80 hover:bg-pink-600 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                  </a>
                )}
                {settings?.socialLinkedin && (
                  <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-800/80 hover:bg-blue-700 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright + Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} {displayCompany} {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <a href={`/${locale}`} className="hover:text-gray-400 transition-colors">{t('nav.home')}</a>
            <span>|</span>
            <a href={`/${locale}/privacy`} className="hover:text-gray-400 transition-colors">{locale === 'zh' ? '隐私政策' : 'Privacy Policy'}</a>
            <span>|</span>
            <a href={`/${locale}/terms`} className="hover:text-gray-400 transition-colors">{locale === 'zh' ? '服务条款' : 'Terms of Service'}</a>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ANIMATION KEYFRAMES (v135 — Firefly effects) ===== */}
      <style>{`
        @keyframes footer-bg-drift {
          0%   { transform: scale(1) translateX(0); }
          100% { transform: scale(1.08) translateX(-2%); }
        }
        @keyframes firefly-drift {
          0%   { transform: translate(0, 0); opacity: 0; }
          10%  { opacity: 0.9; }
          30%  { transform: translate(20px, -40px); opacity: 0.6; }
          55%  { transform: translate(10px, -80px); opacity: 0.85; }
          80%  { opacity: 0.4; }
          100% { transform: translate(-15px, -140px); opacity: 0; }
        }
        @keyframes firefly-flicker {
          0%,100% { opacity: 0.7; box-shadow: 0 0 8px currentColor; }
          25%     { opacity: 1; box-shadow: 0 0 16px currentColor, 0 0 28px currentColor; }
          50%     { opacity: 0.4; box-shadow: 0 0 4px currentColor; }
          75%     { opacity: 0.95; box-shadow: 0 0 14px currentColor, 0 0 22px currentColor; }
        }
        @keyframes footer-line-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes footer-wave-move {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes footer-glow-pulse {
          0%   { opacity: 0.04; transform: scale(1); }
          100% { opacity: 0.1; transform: scale(1.15); }
        }
      `}</style>
    </footer>
  );
}
