import { describe, it, expect } from 'vitest';
import { pickTrilingualDescription, pickTrilingual, normalizeLocale } from '@/lib/seo-page-meta';
import type { Trilingual } from '@/lib/seo-page-meta';

const enOnly: Trilingual = { en: 'English description', zh: '', ar: '' };
const full: Trilingual = {
  en: 'English description',
  zh: '中文描述',
  ar: 'الوصف العربي',
};

/**
 * N2 regression: pickTrilingualDescription must (1) return the explicit
 * zh/ar translation when present, (2) fall back to the localized page
 * title when the trilingual value is missing for that locale, and (3) finally
 * fall back to English. It must NOT fabricate copy.
 */
describe('N2 pickTrilingualDescription — explicit translation wins', () => {
  it('returns the explicit en / zh / ar value when present', () => {
    expect(pickTrilingualDescription(full, 'en')).toBe('English description');
    expect(pickTrilingualDescription(full, 'zh')).toBe('中文描述');
    expect(pickTrilingualDescription(full, 'ar')).toBe('الوصف العربي');
  });

  it('normalises full locale tags (zh-CN, ar-SA) to their base locale', () => {
    expect(pickTrilingualDescription(full, 'zh-CN')).toBe('中文描述');
    expect(pickTrilingualDescription(full, 'ar-SA')).toBe('الوصف العربي');
  });
});

describe('N2 pickTrilingualDescription — fallback to localized title', () => {
  it('zh missing + fallbackTitle provided -> returns the localized title', () => {
    expect(pickTrilingualDescription(enOnly, 'zh', '定制智能柜')).toBe('定制智能柜');
  });

  it('ar missing + fallbackTitle provided -> returns the localized title', () => {
    expect(pickTrilingualDescription(enOnly, 'ar', 'خزانة ذكية')).toBe('خزانة ذكية');
  });

  it('does NOT fall back to title when the title equals the English value', () => {
    // If the localized title is just the English string, keep English (no dup).
    expect(pickTrilingualDescription(enOnly, 'zh', 'English description')).toBe(
      'English description',
    );
  });

  it('returns English when no fallback title is supplied for a missing locale', () => {
    expect(pickTrilingualDescription(enOnly, 'zh')).toBe('English description');
    expect(pickTrilingualDescription(enOnly, 'ar', '')).toBe('English description');
  });
});

describe('N2 pickTrilingualDescription — value/undefined edges', () => {
  it('undefined value + fallbackTitle -> returns the fallback', () => {
    expect(pickTrilingualDescription(undefined, 'zh', '标题')).toBe('标题');
  });

  it('undefined value + no fallback -> empty string', () => {
    expect(pickTrilingualDescription(undefined, 'en')).toBe('');
  });

  it('explicit translation always beats the fallback title', () => {
    expect(pickTrilingualDescription(full, 'zh', '别的标题')).toBe('中文描述');
  });
});

describe('normalizeLocale — robustness', () => {
  it('maps full tags and bare codes', () => {
    expect(normalizeLocale('zh-CN')).toBe('zh');
    expect(normalizeLocale('ar')).toBe('ar');
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale(undefined)).toBe('en');
  });
});

describe('pickTrilingual — original simple fallback still works', () => {
  it('returns localized value or English', () => {
    expect(pickTrilingual(full, 'zh')).toBe('中文描述');
    expect(pickTrilingual(enOnly, 'zh')).toBe('English description');
    expect(pickTrilingual(undefined, 'en')).toBe('');
  });
});
