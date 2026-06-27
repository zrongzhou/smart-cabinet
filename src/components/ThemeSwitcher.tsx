'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';
import { useThemeContext } from '@/app/providers/ThemeProvider';
import { useLocale } from '@/lib/i18n';
import { themeNames, themeColors } from '@/hooks/useTheme';

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, changeTheme } = useThemeContext();
  const { locale, t } = useLocale();

  const themes: Array<'light' | 'dark' | 'nature' | 'ocean' | 'guofeng' | 'minimal' | 'cyberpunk' | 'fashion' | 'neumorphic'> = ['light', 'dark', 'nature', 'ocean', 'guofeng', 'minimal', 'cyberpunk', 'fashion', 'neumorphic'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        aria-label="Switch theme"
      >
        <Palette className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
            <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
              {locale === 'zh' ? '主题' : locale === 'ar' ? 'المظهر' : 'Theme'}
            </p>
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => {
                  changeTheme(t);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center space-x-3 ${
                  theme === t
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {/* Color preview block */}
                <div
                  className="w-6 h-6 rounded-md border border-gray-200"
                  style={{ backgroundColor: themeColors[t] }}
                />
                <span>{themeNames[t][locale as 'en' | 'zh' | 'ar'] || themeNames[t].en}</span>
                {theme === t && (
                  <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
