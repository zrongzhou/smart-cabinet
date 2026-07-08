/**
 * Bug 5 (P2) — CompanyShowcase flow-line animation redesigned.
 *
 * The previous look used harsh dashed strokes (stroke-dasharray). V8.5 replaces
 * it with refined SOLID gradient strokes + a soft glow + slow drifting light
 * points, and the flow container is h-12 tall. We assert:
 *   - the animated flow SVG is present (class about-showcase-flow),
 *   - none of the flow <path>s use a dashed stroke (no dasharray anywhere),
 *   - the flow container carries the h-12 height.
 *
 * jsdom has no IntersectionObserver, so we stub it (the <Counter> instantiates one).
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

describe('Bug 5 — refined (non-dashed) flow-line animation', () => {
  it('renders the animated flow SVG', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    expect(container.querySelector('svg.about-showcase-flow')).not.toBeNull();
  });

  it('flow lines are SOLID strokes — no dasharray in any path or the SVG markup', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    const svg = container.querySelector('svg.about-showcase-flow') as SVGSVGElement;
    expect(svg).not.toBeNull();

    const paths = svg.querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(3);

    for (const p of Array.from(paths)) {
      // No dashed stroke attribute
      expect(p.getAttribute('stroke-dasharray')).toBeNull();
      // No dashed stroke via inline style
      const styleAttr = (p.getAttribute('style') || '').toLowerCase();
      expect(styleAttr).not.toContain('dasharray');
    }

    // The whole SVG markup must be free of the dasharray keyword
    expect(svg.outerHTML.toLowerCase()).not.toContain('dasharray');
  });

  it('the flow animation container keeps the refined h-12 height', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    const flowWrap = Array.from(container.querySelectorAll('div')).find((d) =>
      d.className.includes('h-12')
    );
    expect(flowWrap, 'expected a div with class h-12 for the flow animation').toBeTruthy();
  });
});
