'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Theme } from '@/hooks/useTheme';

interface ThemeContextType {
  theme: Theme;
  changeTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Prevent transition flash on page load
    document.documentElement.classList.add('no-transitions');

    const savedTheme = localStorage.getItem('smart-cabinet-theme') as Theme | null;
    
    if (savedTheme && ['light', 'dark', 'nature', 'ocean', 'guofeng', 'minimal', 'cyberpunk', 'fashion', 'neumorphic'].includes(savedTheme)) {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
      // Also add/remove 'dark' class for Tailwind dark: variant compatibility
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.dataset.theme = initialTheme;
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }

    // Enable transitions after theme is set
    setTimeout(() => {
      document.documentElement.classList.remove('no-transitions');
    }, 0);
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('smart-cabinet-theme', newTheme);
    document.documentElement.dataset.theme = newTheme;
    // Also add/remove 'dark' class for Tailwind dark: variant compatibility
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Always render provider to avoid SSR issues
  // During SSR (mounted = false), provide default value
  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : 'light', changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
