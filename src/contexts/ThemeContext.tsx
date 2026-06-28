// contexts/ThemeContext.tsx

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Theme, ThemeContextType } from '@/types/theme';
import { DEFAULT_THEME, THEME_STORAGE_KEY, themes } from '@/lib/theme-config';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  // 客户端hydration后，从localStorage读取
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (savedTheme && ['starry', 'skyblue', 'nature'].includes(savedTheme)) {
        setThemeState(savedTheme);
      } else {
        // 可选：检测系统偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState(prefersDark ? 'starry' : 'skyblue');
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
    }
    setMounted(true);
  }, []);

  // 主题切换时，更新DOM + localStorage
  useEffect(() => {
    if (mounted) {
      try {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  // 避免hydration闪烁：服务端渲染时返回空div
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
