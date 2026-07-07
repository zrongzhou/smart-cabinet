import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { LocaleProvider, useLocale } from './i18n';

describe('i18n t() resolver (V8 T7)', () => {
  it('resolves flat dot-notation keys directly', () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: ({ children }) => (
        <LocaleProvider locale="en" messages={{ 'about.title': 'About Us', 'nav.home': 'Home' }}>
          {children}
        </LocaleProvider>
      ),
    });
    expect(result.current.t('about.title')).toBe('About Us');
    expect(result.current.t('nav.home')).toBe('Home');
  });

  it('falls back to nested object traversal', () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: ({ children }) => (
        <LocaleProvider locale="en" messages={{ nav: { home: 'Home' } } as any}>
          {children}
        </LocaleProvider>
      ),
    });
    expect(result.current.t('nav.home')).toBe('Home');
  });

  it('returns the key itself when missing', () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: ({ children }) => (
        <LocaleProvider locale="en" messages={{}}>
          {children}
        </LocaleProvider>
      ),
    });
    expect(result.current.t('missing.key')).toBe('missing.key');
  });
});
