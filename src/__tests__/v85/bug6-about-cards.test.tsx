/**
 * Bug 6 (P2) — About page card grids filled out (8 + 8, 40 clients).
 *
 * Verifies the i18n data that backs the balanced grids: the 8th Solutions and
 * 8th Why-Choose entries exist in all three locales (en/zh/ar) with both a title
 * and a description, and the ClientWall actually renders all 40 client cards.
 *
 * We validate the i18n keys by importing the real message dictionaries (the same
 * files the page renders from) and render <ClientWall/> to count its cards.
 */
import { describe, it, expect } from 'vitest';
import en from '@/messages/en.json';
import zh from '@/messages/zh.json';
import ar from '@/messages/ar.json';
import { render, cleanup } from '@testing-library/react';

import ClientWall from '@/components/about/ClientWall';

afterEach(() => cleanup());

const dicts: Record<string, Record<string, string>> = { en, zh, ar };

describe('Bug 6 — About page card grids balanced (8 + 8, 40 clients)', () => {
  it('about.solutions.item8 exists with title+desc in all three locales', () => {
    for (const [loc, d] of Object.entries(dicts)) {
      expect(d['about.solutions.item8.title'], `solutions.item8.title missing in ${loc}`).toBeTruthy();
      expect(d['about.solutions.item8.desc'], `solutions.item8.desc missing in ${loc}`).toBeTruthy();
      expect(typeof d['about.solutions.item8.title']).toBe('string');
      expect(typeof d['about.solutions.item8.desc']).toBe('string');
    }
  });

  it('about.whyChoose.item8 exists with title+desc in all three locales', () => {
    for (const [loc, d] of Object.entries(dicts)) {
      expect(d['about.whyChoose.item8.title'], `whyChoose.item8.title missing in ${loc}`).toBeTruthy();
      expect(d['about.whyChoose.item8.desc'], `whyChoose.item8.desc missing in ${loc}`).toBeTruthy();
      expect(typeof d['about.whyChoose.item8.title']).toBe('string');
      expect(typeof d['about.whyChoose.item8.desc']).toBe('string');
    }
  });

  it('ClientWall renders exactly 40 client cards', () => {
    const t = (k: string) => k;
    const { container } = render(<ClientWall t={t} locale="en" />);
    const cards = container.querySelectorAll('.client-card');
    expect(cards.length).toBe(40);
  });
});
