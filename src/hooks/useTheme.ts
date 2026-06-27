'use client';

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'nature' | 'ocean' | 'guofeng' | 'minimal' | 'cyberpunk' | 'fashion' | 'neumorphic';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem('smart-cabinet-theme') as Theme | null;
    
    if (savedTheme && ['light', 'dark', 'nature', 'ocean', 'guofeng', 'minimal', 'cyberpunk', 'fashion', 'neumorphic'].includes(savedTheme)) {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.dataset.theme = initialTheme;
    }
  }, []);

  // Apply theme change
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('smart-cabinet-theme', newTheme);
    document.documentElement.dataset.theme = newTheme;
  };

  return { theme, changeTheme, mounted };
}

export const themeNames: Record<Theme, { en: string; zh: string; ar: string }> = {
  light: { en: 'Light', zh: '浅色', ar: 'فاتح' },
  dark: { en: 'Dark', zh: '深色', ar: 'داكن' },
  nature: { en: 'Nature', zh: '自然', ar: 'طبيعة' },
  ocean: { en: 'Ocean', zh: '海洋', ar: 'محيط' },
  guofeng: { en: 'Chinese', zh: '国风', ar: 'صيني' },
  minimal: { en: 'Minimal', zh: '简约', ar: 'بسيط' },
  cyberpunk: { en: 'Cyberpunk', zh: '科幻', ar: 'سايبربنك' },
  fashion: { en: 'Fashion', zh: '时尚', ar: 'موضة' },
  neumorphic: { en: 'Neumorphic', zh: '拟态', ar: 'نيومورفيك' },
};

export const themeColors: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#0f172a',
  nature: '#f0fdf4',
  ocean: '#eff6ff',
  guofeng: '#C41E3A',
  minimal: '#000000',
  cyberpunk: '#0A0A0F',
  fashion: '#E91E63',
  neumorphic: '#E0E5EC',
};
