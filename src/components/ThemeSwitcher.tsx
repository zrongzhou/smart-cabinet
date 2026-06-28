// components/ThemeSwitcher.tsx

'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { themes } from '@/lib/theme-config';
import { SunIcon, MoonIcon, SparklesIcon } from '@heroicons/react/24/solid';

const themeIcons: Record<string, any> = {
  'starry': SparklesIcon,
  'skyblue': SunIcon,
  'nature': MoonIcon,
};

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentThemeMeta = themes.find(t => t.id === theme);
  const CurrentIcon = themeIcons[theme];
  
  return (
    <div className="relative">
      {/* 当前主题按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-[var(--transition-fast)]"
        aria-label="Switch theme"
      >
        <CurrentIcon className="w-5 h-5" />
        <span className="hidden md:inline">{currentThemeMeta?.name}</span>
      </button>
      
      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-lg z-50">
          {themes.map((t) => {
            const Icon = themeIcons[t.id];
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-bg-secondary)] transition-[var(--transition-fast)] ${
                  theme === t.id ? 'bg-[var(--color-bg-secondary)]' : ''
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: t.previewColor }}
                />
                <Icon className="w-5 h-5 text-[var(--color-text-primary)]" />
                <div className="text-left">
                  <div className="text-[var(--color-text-primary)] font-medium">{t.name}</div>
                  <div className="text-[var(--color-text-secondary)] text-sm">{t.memoryPoint}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
