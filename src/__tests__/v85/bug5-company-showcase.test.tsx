/**
 * Bug 5 (P2) — CompanyShowcase flow-line animation redesigned.
 *
 * The previous look used harsh dashed strokes (stroke-dasharray). V8.5 replaced
 * it with refined SOLID gradient strokes + a soft glow, and later rounds
 * replaced the whole "data flow" block with a single thin gradient divider.
 * This test asserts the current reality:
 *   - a refined thin (h-px) divider is present and the old `about-showcase-flow`
 *     SVG is gone,
 *   - NO element renders a dashed stroke (no `dasharray` anywhere) — preserves
 *     the original "no harsh dashed strokes" intent,
 *   - the divider rule is a thin `h-px` line, not a tall `h-12` block.
 *
 * jsdom has no IntersectionObserver, so we stub it (the <Counter> + signature
 * instantiate one).
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

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

describe('Bug 5 — refined (non-dashed) divider under the photo', () => {
  it('renders the refined thin divider (no about-showcase-flow leftover)', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    expect(container.querySelector('svg.about-showcase-flow')).toBeNull();
    const rule = Array.from(container.querySelectorAll('span')).find(
      (s) => s.className.includes('h-px') && s.className.includes('flex-1')
    );
    expect(rule, 'expected a thin h-px flex-1 gradient divider span').toBeTruthy();
  });

  it('the whole rendered section uses SOLID strokes — no dasharray anywhere', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    const paths = container.querySelectorAll('path');
    for (const p of Array.from(paths)) {
      // No dashed stroke attribute
      expect(p.getAttribute('stroke-dasharray')).toBeNull();
      // No dashed stroke via inline style
      const styleAttr = (p.getAttribute('style') || '').toLowerCase();
      expect(styleAttr).not.toContain('dasharray');
    }
    // The whole section markup must be free of the dasharray keyword
    expect(container.innerHTML.toLowerCase()).not.toContain('dasharray');
  });

  it('the divider rule is a thin h-px line, not a tall h-12 block', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    const rule = Array.from(container.querySelectorAll('span')).find(
      (s) => s.className.includes('h-px') && s.className.includes('flex-1')
    );
    expect(rule, 'expected a thin h-px flex-1 gradient divider span').toBeTruthy();
    expect(rule!.className).toContain('h-px');
    expect(rule!.className).not.toContain('h-12');
  });
});
