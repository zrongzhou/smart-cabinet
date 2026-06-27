'use client';

import { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin, Globe, ArrowRight } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { fetchUnifiedSettings } from '@/data/unified-data';

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

  const displayName = settings ? L(settings.companyNameZh || '', settings.companyName || '', settings.companyNameAr || '') : 'WS Tool Cabinet';
  const displayCompany = settings ? L(settings.companyNameZh || '广州秋彦科技有限公司', settings.companyName || 'Guangzhou Qiuyan Technology Co., Ltd.', settings.companyNameAr || '') : 'Guangzhou Qiuyan Technology Co., Ltd.';
  // Support multi-value contact info (arrays from admin settings)
  const displayEmails = (settings?.contactEmails && Array.isArray(settings.contactEmails) && settings.contactEmails.length > 0)
    ? settings.contactEmails.filter(e => e && e.trim())
    : (settings?.contactEmail ? [settings.contactEmail] : ['sabrina@wstoolcabinet.com']);
  const displayPhones = (settings?.contactPhones && Array.isArray(settings.contactPhones) && settings.contactPhones.length > 0)
    ? settings.contactPhones.filter(p => p && p.trim())
    : (settings?.contactPhone ? [settings.contactPhone] : ['+86 156 2216 0659']);
  const displayAddress = settings ? L(settings.addressZh || '', settings.address || '', settings.addressAr || '') : '';
  const displayCopyright = settings?.footerCopyright?.replace('{year}', String(currentYear)) || `© ${currentYear} ${displayCompany}`;

  return (
    <footer className="relative bg-gray-900 dark:bg-slate-950 text-gray-300 dark:text-gray-400 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />
      <div className="absolute top-20 right-0 w-72 h-72 bg-blue-600/5 dark:bg-blue-900/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-900/10 rounded-full blur-3xl" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Top section: Company info + Newsletter + Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-12 border-b border-gray-800 dark:border-slate-700">
          {/* Column 1: Brand & Description */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">WS</span>
              </div>
              <span className="text-white dark:text-white font-bold text-xl">{displayName}</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-gray-400 dark:text-gray-500">
              {t('footer.companyDescription')}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-600">
              <Globe className="w-4 h-4" />
              <span>{displayCompany}</span>
            </div>
          </div>

          {/* Column 2: Quick Links (2 columns) */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-blue-500 rounded" />
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

            <div>
              <h4 className="text-white font-semibold mb-4 opacity-0 select-none">.</h4>
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
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-cyan-500 rounded" />
              {t('footer.contactInfo')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-900/50 transition-colors mt-0.5">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{locale === 'zh' ? '邮箱' : 'Email'}</p>
                  {displayEmails.map((email, i) => (
                    <a key={i} href={`mailto:${email}`} className="text-sm hover:text-blue-400 transition-colors block">{email}</a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-green-900/50 transition-colors mt-0.5">
                  <Phone className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{locale === 'zh' ? '电话' : 'Phone'}</p>
                  {displayPhones.map((phone, i) => (
                    <a key={i} href={`tel:${phone.replace(/\s/g, '')}`} className="text-sm hover:text-green-400 transition-colors block">{phone}</a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-red-900/50 transition-colors mt-0.5">
                  <MapPin className="w-4 h-4 text-red-400" />
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
              <div className="flex gap-3">
                {settings?.socialFacebook && (
                  <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings?.socialTwitter && (
                  <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-sky-500 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {settings?.socialYoutube && (
                  <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {settings?.socialInstagram && (
                  <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                  </a>
                )}
                {settings?.socialLinkedin && (
                  <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-blue-700 flex items-center justify-center transition-all duration-200 hover:scale-110">
                    <Linkedin className="w-4 h-4" />
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
    </footer>
  );
}
