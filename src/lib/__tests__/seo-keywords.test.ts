import { describe, it, expect } from 'vitest';
import {
  buildStaticPageKeywords,
  buildDetailPageKeywords,
  buildListPageKeywords,
  tokenizeName,
} from '@/lib/seo-keywords';

/**
 * N3 regression: landing pages (managed-items/[slug], industries/[slug],
 * custom-smart-cabinet, factory-display, shipping-delivery) must derive their
 * <meta keywords> from the page title via the existing seo-keywords engine.
 *
 * IMPORTANT: these tests only *call* the exported engine API — they never
 * modify its internals. We assert the engine's documented contract:
 *   - keywords are 100% derived from the title (no hardcoded seeds),
 *   - model/SKU numbers are excluded,
 *   - the display (localized) title is appended as the secondary keyword.
 */
describe('N3 buildStaticPageKeywords — homepage usage', () => {
  const EN_TITLE = 'Smart Tool Cabinets & Industrial Vending Machines | Qtech';

  it('extracts English primary tokens and drops the "| brand" suffix', () => {
    const kw = buildStaticPageKeywords(EN_TITLE, EN_TITLE);
    expect(Array.isArray(kw)).toBe(true);
    const joined = kw.join(',');
    expect(joined).toContain('smart');
    expect(joined).toContain('tool');
    expect(joined).toContain('cabinets'); // note: source title spelling kept
    expect(joined).toContain('industrial');
    expect(joined).toContain('vending');
    expect(joined).toContain('machines');
    // brand suffix after "|" must be split off
    expect(joined.toLowerCase()).not.toContain('qtech');
  });

  it('appends the localized (zh) display title as a secondary keyword', () => {
    const ZH_TITLE = '智能工具柜与工业自动售货机 | Qtech';
    const kw = buildStaticPageKeywords(EN_TITLE, ZH_TITLE);
    expect(kw.join(',')).toContain('智能工具柜与工业自动售货机');
  });
});

describe('N3 buildDetailPageKeywords — title + slug union, no model leak', () => {
  it('unions English title tokens with URL slug tokens', () => {
    const kw = buildDetailPageKeywords(
      'CNC Tool Vending Machine',
      'CNC Tool Vending Machine',
      'tool-vending-machine-cnc-tools.html',
    );
    const joined = kw.join(',');
    expect(joined).toContain('cnc');
    expect(joined).toContain('tool');
    expect(joined).toContain('vending');
    // URL slug contributes "tools" (plural) alongside title "machine"
    expect(joined).toContain('machine');
    expect(joined).toContain('tools');
    // full display name appended
    expect(joined).toContain('CNC Tool Vending Machine');
  });

  it('excludes model/SKU-like tokens from the slug', () => {
    const kw = buildDetailPageKeywords(
      'Custom Cabinet',
      'Custom Cabinet',
      'custom-cabinet-QT-DL80-48.html',
    );
    const joined = kw.join(',');
    expect(joined).toContain('custom');
    expect(joined).toContain('cabinet');
    // model numbers must not leak into keywords
    expect(joined).not.toContain('QT-DL80-48');
    expect(joined).not.toContain('dl80');
  });

  it('falls back to the display name for tokenisation when English name is empty', () => {
    const kw = buildDetailPageKeywords('', 'Smart Locker', 'smart-locker.html');
    expect(kw.join(',')).toContain('smart');
    expect(kw.join(',')).toContain('locker');
  });
});

describe('N3 buildListPageKeywords — common primary + localized secondary', () => {
  it('returns the localized display names as secondary keywords', () => {
    const kw = buildListPageKeywords(
      ['CNC Tool Vending Machine', 'Smart Tool Locker'],
      ['CNC Tool Vending Machine', '智能工具柜'],
    );
    const joined = kw.join(',');
    expect(joined).toContain('CNC Tool Vending Machine');
    expect(joined).toContain('智能工具柜');
  });
});

describe('seo-keywords engine — tokenizeName purity', () => {
  it('drops English stopwords and keeps shared product terms', () => {
    const tokens = tokenizeName('Smart Tool Cabinet for the CNC Workshop');
    expect(tokens).toContain('smart');
    expect(tokens).toContain('tool');
    expect(tokens).toContain('cabinet');
    expect(tokens).toContain('cnc');
    expect(tokens).toContain('workshop');
    // stopwords removed
    expect(tokens).not.toContain('the');
    expect(tokens).not.toContain('for');
  });
});
