/**
 * Independent QA verification for the AboutBowKnot logo rework
 * (commit 60068282 — "recolor AboutBowKnot to cool ice-blue glassmorphism",
 *  branch work/logo-glassmorphism).
 *
 * Validates the ICE-BLUE recolour spec (warm → cool) + structure / brand /
 * caller compatibility:
 *   A. Colour replacement completeness
 *        - NO warm tokens (#fcd34d #fbbf24 #fb923c #fdba74 + the warm rgba*
 *          set) anywhere in the logo component.
 *        - Cool blue tokens MUST be present (#93c5fd #3b82f6 #6366f1 #a5b4fc
 *          #dbeafe and the cool rgba* fills/glow).
 *   B. Structure / function unchanged
 *        - glassmorphism (backdrop-filter blur + saturate) retained.
 *        - three-part layout: glass chip (秋彦) + dual wordmark (Qtech) +
 *          tagline (SMART STORAGE · IOT).
 *        - top decorative divider bk-divider / bk-top-rule / bk-top-dot present.
 *        - NO bottom line (bk-line / bk-pearl absent, in source AND DOM).
 *        - animations retained: entrance reveal (.is-visible/.bk-rise),
 *          one-shot light sweep (bk-sweep, 1 forwards), hover float
 *          (.bk-colophon:hover translateY), prefers-reduced-motion block.
 *   C. Brand compliance
 *        - NO forbidden legacy strings (秋渊 / Qiuyuan / WS Tool Cabinet) in src.
 *        - correct brand (秋彦 + Qtech + SMART STORAGE · IOT) present.
 *   D. Caller compatibility
 *        - CompanyShowcase imports AboutBowKnot as default export and invokes
 *          <AboutBowKnot t={t} locale={locale} /> with unchanged props.
 *   E. Build / syntax
 *        - the component renders under vitest (esbuild-transform = syntax gate)
 *          and a scoped `tsc --noEmit` type check passes (see QA run log).
 *
 * IMPORTANT SCOPE NOTE: warm colours still legitimately exist in OTHER
 * components (HeroSection.tsx, AboutClient.tsx) for unrelated decorations.
 * Colour assertions (A) are therefore scoped to AboutBowKnot.tsx — the file
 * actually reworked in this commit — NOT the whole `src` tree.
 *
 * Method note: styled-jsx `<style jsx>` is not inspectable at runtime in
 * jsdom, so the colour / animation checks (A & B-structure) are done as
 * source-level regex assertions on the .tsx file, exactly as the team-lead
 * permitted ("grep + 正则做源码级断言"). DOM checks (brand text, glass plate,
 * divider absence) are real rendered assertions.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import AboutBowKnot from '@/components/about/AboutBowKnot';
import CompanyShowcase from '@/components/about/CompanyShowcase';

const t = (k: string) => k;

// jsdom has no IntersectionObserver; AboutBowKnot instantiates one in useEffect.
beforeAll(() => {
  (globalThis as any).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
});

const ABOUT_TSX = readFileSync(
  join(process.cwd(), 'src/components/about/AboutBowKnot.tsx'),
  'utf-8',
);
const SHOWCASE_TSX = readFileSync(
  join(process.cwd(), 'src/components/about/CompanyShowcase.tsx'),
  'utf-8',
);

/** Recursively collect all product source under a directory into one string. */
function collectSource(dir: string): string {
  let out = '';
  const walk = (p: string) => {
    for (const entry of readdirSync(p, { withFileTypes: true })) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.next' ||
        entry.name === 'dist' ||
        entry.name === 'out' ||
        // Exclude test files: this verification file itself contains the
        // forbidden brand strings inside its assertion messages, which would
        // create a false positive. Brand compliance is about product source.
        entry.name === '__tests__'
      ) {
        continue;
      }
      const full = join(p, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        out += readFileSync(full, 'utf-8') + '\n';
      }
    }
  };
  walk(dir);
  return out;
}

/**
 * A) Warm tokens that must be GONE from the logo component.
 * Covers the exact warm hex set from the rework spec plus the warm rgba*
 * fills/borders/shadows used by the previous warm version. Whitespace inside
 * rgba() is optional (source uses `rgba(255, 247, 237)` with spaces).
 */
const WARM_TOKENS =
  /#(fcd34d|fbbf24|fb923c|fdba74)|rgba\(\s*251,\s*146,\s*60|rgba\(\s*252,\s*211,\s*77|rgba\(\s*255,\s*247,\s*237|rgba\(\s*254,\s*215,\s*170|rgba\(\s*217,\s*119,\s*6|rgba\(\s*249,\s*115,\s*22|rgba\(\s*255,\s*237,\s*213/i;

/** A) Cool blue/indigo tokens that MUST be present in the ice-blue logo. */
const COOL_TOKENS = [
  '#93c5fd', // gradient start (blue-300)
  '#3b82f6', // blue-500 accent
  '#6366f1', // indigo-500
  '#a5b4fc', // indigo-300
  'rgba(59, 130, 246', // cool glow blob (blue-500)
  'rgba(99, 102, 241', // cool glow blob (indigo-500)
  'rgba(240, 249, 255', // sky-50 translucent fill
  'rgba(219, 234, 254', // blue-100 translucent fill
];

describe('Req A — colour replacement completeness (source-level, AboutBowKnot.tsx)', () => {
  it('contains NO warm tokens (hex + rgba warm set)', () => {
    expect(ABOUT_TSX, 'warm token found in ice-blue logo source').not.toMatch(
      WARM_TOKENS,
    );
  });

  it('contains the required cool blue/indigo tokens', () => {
    for (const token of COOL_TOKENS) {
      expect(
        ABOUT_TSX,
        `expected cool token "${token}" to be present in ice-blue logo`,
      ).toContain(token);
    }
  });

  it('brand wordmark uses a cool gradient (blue→indigo), not warm', () => {
    // HUE constant drives both the chip monogram and the Qtech wordmark.
    expect(ABOUT_TSX).toMatch(
      /linear-gradient\(120deg,\s*#93c5fd[^)]*#3b82f6[^)]*#6366f1[^)]*#a5b4fc/i,
    );
  });
});

describe('Req B — structure / function unchanged (DOM + source)', () => {
  it('renders the frosted-glass plate (.bk-glass) with the 3-part lockup', () => {
    const { container } = render(<AboutBowKnot t={t} locale="en" />);
    const glass = container.querySelector('.bk-glass');
    expect(glass, 'expected the frosted-glass plate (.bk-glass)').not.toBeNull();

    // chip carrying 秋彦
    const emblem = container.querySelector('.bk-emblem .bk-emblem-text');
    expect(emblem, 'expected the glass chip (.bk-emblem) carrying 秋彦').not.toBeNull();
    // dual wordmark + tagline
    const brandEn = container.querySelector('.bk-brand-en');
    const tag = container.querySelector('.bk-tag');
    expect(brandEn, 'expected the Qtech wordmark (.bk-brand-en)').not.toBeNull();
    expect(tag, 'expected the tagline (.bk-tag)').not.toBeNull();

    const text = glass!.textContent || '';
    expect(text).toContain('秋彦'); // Chinese brand monogram (chip)
    expect(text).toContain('Qtech'); // Latin wordmark
    expect(text).toContain('SMART STORAGE · IOT'); // tagline
  });

  it('keeps glassmorphism (backdrop-filter blur + saturate) on plate and chip', () => {
    const blurSaturate = /backdrop-filter:\s*blur\([^)]*\)\s*saturate\(/;
    const matches = ABOUT_TSX.match(new RegExp(blurSaturate.source, 'g')) || [];
    expect(
      matches.length,
      'expected at least 2 glassmorphism layers (plate + chip)',
    ).toBeGreaterThanOrEqual(2);
  });

  it('top decorative divider (bk-divider / bk-top-rule / bk-top-dot) is present', () => {
    const { container } = render(<AboutBowKnot t={t} locale="en" />);
    expect(
      container.querySelector('.bk-divider'),
      'expected .bk-divider',
    ).not.toBeNull();
    expect(
      container.querySelector('.bk-top-rule'),
      'expected .bk-top-rule',
    ).not.toBeNull();
    expect(
      container.querySelector('.bk-top-dot'),
      'expected .bk-top-dot',
    ).not.toBeNull();
  });

  it('REMOVED the bottom decorative line — no .bk-line / .bk-pearl (DOM + source)', () => {
    const { container } = render(<AboutBowKnot t={t} locale="en" />);
    expect(
      container.querySelector('.bk-line'),
      'FAILED: .bk-line still rendered (bottom line not removed)',
    ).toBeNull();
    expect(
      container.querySelector('.bk-pearl'),
      'FAILED: .bk-pearl still rendered (bottom line not removed)',
    ).toBeNull();
    // Source-level guarantee too.
    expect(ABOUT_TSX, 'bk-line should not exist in source').not.toMatch(/bk-line/);
    expect(ABOUT_TSX, 'bk-pearl should not exist in source').not.toMatch(/bk-pearl/);
  });

  it('retains entrance reveal + one-shot light sweep + hover float + reduced-motion', () => {
    // Entrance reveal
    expect(ABOUT_TSX).toMatch(/bk-rise/);
    expect(ABOUT_TSX).toMatch(/\.bk-colophon\.is-visible/);
    // One-shot light sweep (1 iteration, fill forwards)
    const sweep = ABOUT_TSX.match(/animation:\s*bk-sweep[^;]*;/);
    expect(sweep, 'bk-sweep animation declaration missing').not.toBeNull();
    expect(
      sweep![0],
      'bk-sweep must be one-shot (iteration 1 + fill forwards)',
    ).toMatch(/\b1\s+forwards\b/);
    // Hover float
    expect(ABOUT_TSX).toMatch(/\.bk-colophon:hover/);
    expect(ABOUT_TSX).toMatch(/translateY/);
    // Reduced motion
    expect(ABOUT_TSX).toMatch(/prefers-reduced-motion/);
    // No accidental infinite breathing loop
    expect(ABOUT_TSX, 'no infinite loops allowed').not.toMatch(/infinite/);
    expect(ABOUT_TSX, 'bk-breathe must not exist').not.toMatch(/bk-breathe/);
  });
});

describe('Req C — brand compliance (full src scan)', () => {
  const allSrc = collectSource(join(process.cwd(), 'src'));

  it('contains NO forbidden legacy brand strings (秋渊 / Qiuyuan / WS Tool Cabinet)', () => {
    expect(allSrc, 'forbidden brand 秋渊 found').not.toMatch(/秋渊/);
    expect(allSrc, 'forbidden brand Qiuyuan found').not.toMatch(/Qiuyuan/);
    expect(
      allSrc,
      'forbidden brand WS Tool Cabinet found',
    ).not.toMatch(/WS Tool Cabinet/);
  });

  it('still carries the correct brand (秋彦 / Qtech / SMART STORAGE · IOT)', () => {
    expect(allSrc).toMatch(/秋彦/);
    expect(allSrc).toMatch(/Qtech/);
    expect(allSrc).toMatch(/SMART STORAGE · IOT/);
  });
});

describe('Req D — caller compatibility (CompanyShowcase)', () => {
  it('CompanyShowcase imports AboutBowKnot as default export', () => {
    expect(SHOWCASE_TSX).toMatch(
      /import AboutBowKnot from ['"]@\/components\/about\/AboutBowKnot['"]/,
    );
  });

  it('CompanyShowcase calls <AboutBowKnot t={t} locale={locale} /> with unchanged props', () => {
    expect(SHOWCASE_TSX).toMatch(
      /<AboutBowKnot\s+t=\{t\}\s+locale=\{locale\}\s*\/>/,
    );
  });

  it('AboutBowKnot default export + public props (t, locale) preserved', () => {
    expect(ABOUT_TSX).toMatch(/export default function AboutBowKnot/);
    expect(ABOUT_TSX).toMatch(/t:\s*\(key:\s*string\)\s*=>\s*string/);
    expect(ABOUT_TSX).toMatch(/locale:\s*string/);
  });
});
