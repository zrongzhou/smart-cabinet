'use client';

import { createContext, useContext, ReactNode } from 'react';

export const locales = ['en', 'zh', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const LocaleContext = createContext<{
  locale: Locale;
  t: (key: string) => string;
}>({
  locale: 'en',
  t: (key: string) => key,
});

interface LocaleProviderProps {
  children: ReactNode;
  locale: Locale;
  messages: Record<string, string>;
}

export function LocaleProvider({ children, locale, messages }: LocaleProviderProps) {
  const t = (key: string): string => {
    // Support both flat dot-notation keys ("about.hero.title") AND nested object traversal
    // Try direct lookup first (flat format: { "about.hero.title": "..." })
    const direct = messages[key];
    if (direct !== undefined) return direct;

    // Fallback: try nested traversal ({ about: { hero: { title: "..." } } })
    const parts = key.split('.');
    let value: unknown = messages;
    for (const part of parts) {
      if (value && typeof value === 'object' && part in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return (typeof value === 'string' ? value : key);
  };

  return (
    <LocaleContext.Provider value={{ locale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
