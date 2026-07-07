/**
 * Bug 2 — About page development-history copy replacement.
 * Verifies the i18n dictionaries expose exactly the 7 reworked milestones
 * (2015, 2018, 2019, 2021, 2022, 2024, 2026→Present) across en/zh/ar, with no
 * leftover 2016/2017/2023 entries, plus the `about.timeline.intro` paragraph.
 *
 * This is a pure JSON-contract test (node env), so it cannot be broken by the
 * pre-existing __tests__ vitest infra issues.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../..');
const MESSAGES_DIR = path.join(ROOT, 'src/messages');

const LANGS = ['en.json', 'zh.json', 'ar.json'];
const EXPECTED_YEARS = ['2015', '2018', '2019', '2021', '2022', '2024', '2026'];
const FORBIDDEN_YEARS = ['2016', '2017', '2023'];

function loadMessages(file: string): Record<string, unknown> {
  const raw = fs.readFileSync(path.join(MESSAGES_DIR, file), 'utf-8');
  // JSON.parse throws on syntax errors — that failure is itself a valid signal.
  return JSON.parse(raw) as Record<string, unknown>;
}

describe('Bug 2 — about.timeline i18n (7 milestones, 3 languages)', () => {
  for (const lang of LANGS) {
    describe(lang, () => {
      const data = loadMessages(lang);

      it('is valid JSON and a non-empty object', () => {
        expect(data).toBeTypeOf('object');
        expect(Object.keys(data).length).toBeGreaterThan(0);
      });

      it('exposes about.timeline.intro', () => {
        expect(data['about.timeline.intro']).toBeTruthy();
        expect(typeof data['about.timeline.intro']).toBe('string');
      });

      it('exposes title + description for each of the 7 milestones', () => {
        for (const y of EXPECTED_YEARS) {
          expect(data[`about.timeline.${y}.title`], `missing about.timeline.${y}.title`).toBeTruthy();
          expect(data[`about.timeline.${y}.description`], `missing about.timeline.${y}.description`).toBeTruthy();
        }
      });

      it('does NOT contain removed years 2016 / 2017 / 2023', () => {
        for (const y of FORBIDDEN_YEARS) {
          expect(data[`about.timeline.${y}.title`]).toBeUndefined();
          expect(data[`about.timeline.${y}.description`]).toBeUndefined();
        }
      });
    });
  }
});
