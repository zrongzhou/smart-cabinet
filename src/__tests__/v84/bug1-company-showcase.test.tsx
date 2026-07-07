/**
 * Bug 1 — About image container height + animated SVG flow lines.
 * Renders <CompanyShowcase/> (a 'use client' component that uses next/image,
 * which is mocked to null in test/setup.tsx) and asserts:
 *   - the image wrapper keeps `max-h-[300px]`
 *   - an animated flow SVG exists with class `about-showcase-flow`
 *   - the SVG defines the `aboutShowcaseFlowGrad` gradient (3+ stops)
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

// jsdom has no IntersectionObserver; CompanyShowcase's <Counter> instantiates one.
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

describe('Bug 1 — CompanyShowcase image + animated flow lines', () => {
  it('image container is capped at max-h-[300px]', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    const imgWrap = Array.from(container.querySelectorAll('div')).find((d) =>
      d.className.includes('max-h-[300px]')
    );
    expect(imgWrap, 'expected an element whose class contains max-h-[300px]').toBeTruthy();
  });

  it('renders the animated flow SVG (class about-showcase-flow)', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    const svg = container.querySelector('svg.about-showcase-flow');
    expect(svg, 'expected an <svg class="about-showcase-flow">').not.toBeNull();
  });

  it('defines the aboutShowcaseFlowGrad gradient with 3 stops', () => {
    const { container } = render(<CompanyShowcase t={t} locale="en" />);
    const grad = container.querySelector('#aboutShowcaseFlowGrad');
    expect(grad, 'expected #aboutShowcaseFlowGrad gradient def').not.toBeNull();
    expect(grad!.querySelectorAll('stop').length).toBeGreaterThanOrEqual(3);
  });
});
