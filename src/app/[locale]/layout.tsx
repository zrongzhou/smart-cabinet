'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BackToTop from '@/components/BackToTop';
import JsonLd from '@/components/JsonLd';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LocaleProvider, Locale } from '@/lib/i18n';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/context/CartContext';
import enMessages from '@/messages/en.json';
import zhMessages from '@/messages/zh.json';
import arMessages from '@/messages/ar.json';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale as Locale);
  const [mounted, setMounted] = useState(false);

  // Update currentLocale when URL locale changes
  useEffect(() => {
    setMounted(true);
    setCurrentLocale(locale as Locale);
  }, [locale]);

  // Update html lang/dir attributes after mount (avoid SSR mismatch)
  useEffect(() => {
    if (!mounted) return;
    const htmlEl = document.documentElement;
    htmlEl.lang = currentLocale;
    htmlEl.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
    document.body.className = `bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col ${currentLocale === 'ar' ? 'rtl' : ''}`;
  }, [currentLocale, mounted]);

  const handleLocaleChange = (newLocale: string) => {
    setCurrentLocale(newLocale as Locale);
    if (typeof window === 'undefined') return;
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/[^\/]+/, `/${newLocale}`);
    window.location.href = newPath;
  };

  // Select messages based on locale
  const messages = currentLocale === 'zh' ? zhMessages : currentLocale === 'ar' ? arMessages : enMessages;

  return (
    <ErrorBoundary>
    <LocaleProvider locale={currentLocale} messages={messages}>
      <AuthProvider>
        <CartProvider>
          {/* Preconnect to external image domain for faster loading */}
          <link rel="preconnect" href="https://www.wstoolcabinet.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://www.wstoolcabinet.com" />
          <link rel="preconnect" href="https://test.wstoolcabinet.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://test.wstoolcabinet.com" />
          
          {/* JsonLd structured data */}
          <JsonLd data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'WS Tool Cabinet',

            description: 'Professional smart tool cabinet and vending machine manufacturer.',
          }} />
          <JsonLd data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Guangzhou Qiuyuan Technology Co., Ltd.',
            alternateName: '广州秋彦科技有限公司 / WS Tool Cabinet',

            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+86-156-2216-0659',
              contactType: 'sales',
              email: 'sabina@wstoolcabinet.com',
            },
          }} />

          <Navbar onLocaleChange={handleLocaleChange} />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToTop />
        </CartProvider>
      </AuthProvider>
    </LocaleProvider>
    </ErrorBoundary>
  );
}
