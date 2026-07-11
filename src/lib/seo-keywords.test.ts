/**
 * seo-keywords.test.ts — 单元测试 resolvePageKeywords
 *
 * SEO 铁律（manual > auto）：
 *  - manual 非空（字符串或数组）→ 原样返回（join），不做型号/SKU/停用词过滤。
 *  - manual 为空 / null / undefined / 空串 / 空数组 / 全空格 → 回落到 auto.join(', ')。
 *  - 返回类型始终为 string（博客/产品页直接喂给 metadata.keywords）。
 */
import { describe, it, expect } from 'vitest';
import { resolvePageKeywords } from './seo-keywords';

describe('resolvePageKeywords — manual > auto 优先级', () => {
  const AUTO = ['auto1', 'auto2'];

  describe('字符串 manual：原样返回（绕过铁律过滤）', () => {
    it('returns a manual string as-is, not filtered', () => {
      const result = resolvePageKeywords('A, B', AUTO);
      expect(result).toBe('A, B');
      expect(typeof result).toBe('string');
    });

    it('keeps model/SKU tokens in a manual string', () => {
      // 铁律会过滤 DL80-48 这类型号，但 manual 模式必须透传
      const result = resolvePageKeywords('DL80-48 cabinet', AUTO);
      expect(result).toBe('DL80-48 cabinet');
    });
  });

  describe('数组 manual：join 成逗号分隔串', () => {
    it('joins a manual array with ", "', () => {
      const result = resolvePageKeywords(['X', 'Y'], AUTO);
      expect(result).toBe('X, Y');
      expect(typeof result).toBe('string');
    });

    it('filters falsy entries from a manual array before joining', () => {
      const result = resolvePageKeywords(['X', '', null as unknown as string, 'Y'], AUTO);
      expect(result).toBe('X, Y');
    });
  });

  describe('空值 manual → 回落 auto.join(", ")', () => {
    it('falls back when manual is ""', () => {
      expect(resolvePageKeywords('', AUTO)).toBe('auto1, auto2');
    });

    it('falls back when manual is null', () => {
      expect(resolvePageKeywords(null, AUTO)).toBe('auto1, auto2');
    });

    it('falls back when manual is undefined', () => {
      expect(resolvePageKeywords(undefined, AUTO)).toBe('auto1, auto2');
    });

    it('falls back when manual is []', () => {
      expect(resolvePageKeywords([], AUTO)).toBe('auto1, auto2');
    });

    it('falls back when manual is whitespace-only', () => {
      expect(resolvePageKeywords('   ', AUTO)).toBe('auto1, auto2');
    });
  });

  describe('返回类型始终为 string', () => {
    it('is a string for every manual/auto combination', () => {
      expect(typeof resolvePageKeywords(undefined, ['a', 'b'])).toBe('string');
      expect(typeof resolvePageKeywords(['a', 'b'], ['c'])).toBe('string');
      expect(typeof resolvePageKeywords('x', ['c'])).toBe('string');
    });
  });

  describe('逐语言调用（模拟 ProductDetailView / blog 页）', () => {
    it('uses manual only for the locale that has it, else falls back to auto', () => {
      const enKw = resolvePageKeywords('en-kw', AUTO);
      const zhKw = resolvePageKeywords(null, AUTO);
      const arKw = resolvePageKeywords(undefined, AUTO);
      expect(enKw).toBe('en-kw');
      expect(zhKw).toBe('auto1, auto2');
      expect(arKw).toBe('auto1, auto2');
    });

    it('blog page passes manual string + auto array and gets a string for metadata', () => {
      const manualKw = ''; // blog?.seoKeywords 缺省
      const auto = ['smart', 'cabinet', 'tool'];
      const keywords = resolvePageKeywords(manualKw, auto);
      expect(keywords).toBe('smart, cabinet, tool');
      expect(typeof keywords).toBe('string');
    });
  });
});
