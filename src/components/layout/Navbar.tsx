'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Package, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { useAuth } from '@/components/AuthProvider';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { fetchUnifiedSettings } from '@/data/unified-data';
import { useThemeContext } from '@/app/providers/ThemeProvider';

// Touch target size for mobile (44x44px minimum as per WCAG/Apple guidelines)
const TOUCH_TARGET_CLASSES = 'min-h-[44px] min-w-[44px]';

interface NavbarProps {
  onLocaleChange?: (newLocale: string) => void;
}

export default function Navbar({ onLocaleChange }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { locale, t } = useLocale();
  const { user, isAuthenticated, logout } = useAuth();
  const [siteName, setSiteName] = useState('WS Tool Cabinet');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoError, setLogoError] = useState(false);
  const { theme } = useThemeContext();
  const isRTL = locale === 'ar';

  // Load site settings from API
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await fetchUnifiedSettings();
        if (locale === 'zh' && settings.companyNameZh) setSiteName(settings.companyNameZh);
        else if (locale === 'ar' && settings.companyNameAr) setSiteName(settings.companyNameAr);
        else if (settings.companyName) setSiteName(settings.companyName);
        if (settings.logo) setLogoUrl(settings.logo);
      } catch (e) {
        console.error('Failed to load site settings:', e);
      }
    }
    loadSettings();
  }, [locale]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { key: 'home', label: t('nav.home'), href: `/${locale}` },
    { key: 'products', label: t('nav.products'), href: `/${locale}/products` },
    { key: 'about', label: t('nav.about'), href: `/${locale}/about` },
    { key: 'solutions', label: t('nav.solutions'), href: `/${locale}/solutions` },
    { key: 'blog', label: t('nav.blog'), href: `/${locale}/blog` },
    { key: 'faq', label: t('nav.faq'), href: `/${locale}/faq` },
    { key: 'contact', label: t('nav.contact'), href: `/${locale}/contact` },
  ];

  const languages = [
    { code: 'en', label: 'EN', fullName: 'English' },
    { code: 'zh', label: '中文', fullName: '简体中文' },
    { code: 'ar', label: 'AR', fullName: 'العربية' },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const handleLocaleChange = (newLocale: string) => {
    setIsLangMenuOpen(false);
    if (onLocaleChange) {
      onLocaleChange(newLocale);
    } else {
      // Simple client-side navigation with locale change
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(/^\/[^\/]+/, `/${newLocale}`);
      window.location.href = newPath;
    }
  };

  // Get theme-aware nav background
  const getNavBg = () => {
    if (isScrolled) {
      switch(theme) {
        case 'dark':
          return 'bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-700';
        case 'nature':
          return 'bg-green-50/95 backdrop-blur-md shadow-md border-b border-green-200';
        case 'ocean':
          return 'bg-blue-50/95 backdrop-blur-md shadow-md border-b border-blue-200';
        default:
          return 'bg-white/95 backdrop-blur-md shadow-md';
      }
    }
    // Not scrolled - lighter background
    switch(theme) {
      case 'dark':
        return 'bg-slate-900 shadow-sm';
      case 'nature':
        return 'bg-green-50/90 shadow-sm';
      case 'ocean':
        return 'bg-blue-50/90 shadow-sm';
      default:
        return 'bg-white shadow-sm';
    }
  };

  // Get theme-aware text color for nav links
  const getNavTextColor = () => {
    switch(theme) {
      case 'dark':
        return 'text-gray-200 hover:text-white';
      default:
        return 'text-gray-700 hover:text-blue-600';
    }
  };

  // Get theme-aware mobile sidebar background
  const getSidebarBg = () => {
    switch(theme) {
      case 'dark':
        return 'bg-slate-800';
      case 'nature':
        return 'bg-green-50';
      case 'ocean':
        return 'bg-blue-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${getNavBg()}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Company Name (always show both) */}
            <a href={`/${locale}`} className="flex items-center space-x-2">
              {logoUrl && !logoError ? (
                <img 
                  src={logoUrl} 
                  alt={siteName} 
                  className="h-8 w-auto object-contain" 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Package className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              )}
              {/* Always show company name, regardless of logo */}
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{siteName}</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium text-sm"
                >
                  {link.label}
                </a>
              ))}

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-colors duration-200 text-sm font-medium"
                >
                  <span>{currentLang.label}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Language Dropdown */}
                {isLangMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLocaleChange(lang.code)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                          locale === lang.code
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{lang.label}</span>
                        <span className="text-gray-500 ml-2">{lang.fullName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Switcher */}
              <ThemeSwitcher />

              {/* Auth UI */}
              {isAuthenticated && user ? (
                /* User Menu */
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white text-sm font-medium">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.name?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <a
                          href={`/${locale}/account`}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                          <User className="w-4 h-4" />
                          <span>{locale === 'zh' ? '个人中心' : locale === 'ar' ? 'الملف الشخصي' : 'Account'}</span>
                        </a>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{locale === 'zh' ? '退出登录' : locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Login/Register Buttons */
                <div className="flex items-center space-x-2">
                  <a
                    href={`/${locale}/login`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {locale === 'zh' ? '登录' : locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  </a>
                  <a
                    href={`/${locale}/register`}
                    className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-lg hover:opacity-90 transition-all duration-200"
                  >
                    {locale === 'zh' ? '注册' : locale === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                  </a>
                </div>
              )}

              {/* Get a Quote Button */}
              <a
                href={`/${locale}/contact`}
                className="inline-flex items-center px-5 py-2 bg-[var(--primary-color)] text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 text-sm shadow-sm hover:shadow-md"
              >
                {t('nav.getQuote')}
              </a>
            </div>

            {/* Mobile Menu Button - 44x44px touch target */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Sidebar - theme aware background, RTL-aware positioning */}
          <div className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-64 z-50 shadow-xl transform transition-transform duration-300 md:hidden ${
            getSidebarBg()
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  <span className="font-bold text-gray-900">WS Tool Cabinet</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Language Switcher Mobile */}
              <div className="mb-6">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">{t('nav.language')}</p>
                <div className="flex space-x-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLocaleChange(lang.code)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        locale === lang.code
                          ? 'bg-[var(--primary-color)] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth UI Mobile */}
              {isAuthenticated && user ? (
                <>
                  {/* User Info */
                  }
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white font-medium">
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Link */
                  }
                  <a
                    href={`/${locale}/account`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2.5 px-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium mb-2"
                  >
                    <User className="w-5 h-5" />
                    <span>{locale === 'zh' ? '个人中心' : locale === 'ar' ? 'الملف الشخصي' : 'Account'}</span>
                  </a>

                  {/* Logout Button */
                  }
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 py-2.5 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium w-full mb-6"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{locale === 'zh' ? '退出登录' : locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                  </button>
                </>
              ) : (
                /* Login/Register Links */
                <div className="mb-6 space-y-2">
                  <a
                    href={`/${locale}/login`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2.5 px-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    {locale === 'zh' ? '登录' : locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                  </a>
                  <a
                    href={`/${locale}/register`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2.5 px-3 text-white bg-[var(--primary-color)] hover:opacity-90 rounded-lg transition-all duration-200 font-medium text-center"
                  >
                    {locale === 'zh' ? '注册' : locale === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                  </a>
                </div>
              )}

              {/* Navigation Links - 44px min touch targets */}
              <nav className="space-y-1 mb-6">
                {navLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium min-h-[44px] flex items-center"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* Get a Quote Button Mobile */}
              <a
                href={`/${locale}/contact`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-3 bg-[var(--primary-color)] text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200"
              >
                {t('nav.getQuote')}
              </a>
            </div>
          </div>
        </>
      )}

      {/* Close dropdowns when clicking outside */}
      {(isLangMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsLangMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </>
  );
}
