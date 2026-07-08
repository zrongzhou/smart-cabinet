/**
 * Bug 4 (P1) — The admin console is fixed to Chinese.
 *
 * getAdminLocale() must always resolve 'zh', and adminT() must resolve keys from
 * the Chinese dictionary (or fall back to it), never rendering an empty string or
 * an English value. We import the real module so the actual zh dictionaries are
 * exercised. No mocks needed.
 */
import { describe, it, expect } from 'vitest';
import { getAdminLocale, adminT } from '@/lib/admin-i18n';

describe('Bug 4 — admin console fixed to Chinese', () => {
  it('getAdminLocale() always returns "zh"', () => {
    expect(getAdminLocale()).toBe('zh');
  });

  it('adminT returns the Chinese value for a key present in the zh dict', () => {
    expect(adminT('nav.dashboard')).toBe('仪表盘');
    expect(adminT('nav.products')).toBe('产品管理');
  });

  it('adminT falls back to the zh dictionary when the resolved locale lacks the key', () => {
    // An unrecognized locale has no DICTS entry, so adminT must fall back to zh.
    expect(adminT('nav.dashboard', 'xx' as any)).toBe('仪表盘');
    expect(adminT('nav.products', 'xx' as any)).toBe('产品管理');
  });

  it('adminT returns the key itself for an unknown key (never an empty string)', () => {
    const unknown = 'totally.unknown.key';
    expect(adminT(unknown)).toBe(unknown);
    expect(adminT(unknown)).not.toBe('');
  });
});
