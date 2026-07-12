/**
 * Bug 1 — About image container height + brand signature / divider.
 * Renders <CompanyShowcase/> (a 'use client' component that uses next/image,
 * which is mocked to null in test/setup.tsx) and asserts:
 *   - the image wrapper keeps `max-h-[300px]`
 *   - a refined gradient divider sits under the photo (thin h-px gradient rule
 *     + a factory label) — this replaced the old animated `about-showcase-flow`
 *     SVG that was removed in earlier rounds (V8.4/V8.5).
 *   - the dual-brand signature (AboutBowKnot) renders its SVG emblem carrying
 *     both 「秋彦」 and 「Qtech」 plus the `SMART STORAGE · IOT` tagline.
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

// jsdom has no IntersectionObserver; CompanyShowcase's <Counter> (and the
// AboutBowKnot signature) instantiate one.
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

import CompanyShowcase from '@/components/about/CompanyShowcase';

afterEach(() => cleanup());

const t = (k: string) => k;

describe('Bug 1 — CompanyShowcase image + divider + brand signature', () => {
  it('image container is capped at max-h-[300px]', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    const imgWrap = Array.from(container.querySelectorAll('div')).find((d) =>
      d.className.includes('max-h-[300px]')
    );
    expect(imgWrap, 'expected an element whose class contains max-h-[300px]').toBeTruthy();
  });

  it('renders a refined gradient divider (h-px rule + factory label) under the photo', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    const rule = Array.from(container.querySelectorAll('span')).find(
      (s) => s.className.includes('h-px') && s.className.includes('flex-1')
    );
    expect(rule, 'expected a thin h-px flex-1 gradient divider span').toBeTruthy();
    expect(container.textContent).toContain('about.showcase.factoryTitle');
  });

  it('renders the dual-brand signature SVG (AboutBowKnot) with 秋彦 + Qtech + tagline', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    const emblem = container.querySelector('svg[role="img"][aria-label*="品牌标识"]');
    expect(emblem, 'expected the AboutBowKnot brand emblem svg').not.toBeNull();
    const text = emblem!.textContent || '';
    expect(text).toContain('秋彦');
    expect(text).toContain('Qtech');
    expect(text).toContain('SMART STORAGE · IOT');
  });
});
