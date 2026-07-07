#!/usr/bin/env node
/**
 * scripts/validate-i18n.mjs
 *
 * Zero-dependency (Node built-in `fs`/`path` only) i18n gate for smart-cabinet.
 *
 * - Validates that every locale in a group shares the *same* flat key set
 *   (so no translation silently drops a key the UI expects).
 * - Detects untranslated "value === key" residues (e.g. `"nav.home": "nav.home"`)
 *   and lists them.
 *
 * Designed as a local / CI gate (see ARCHITECTURE-V8 §7.5). A key-set mismatch
 * is fatal (exit 1); "value === key" residues are warnings (non-fatal) so the
 * check can run incrementally while translations are still being completed.
 *
 * Usage:
 *   node scripts/validate-i18n.mjs
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MESSAGES_DIR = path.join(ROOT, 'src', 'messages');

/** Locale groups to validate. Each file is a flat dot-notation JSON. */
const GROUPS = [
  {
    name: 'public',
    files: [
      { file: 'en.json', locale: 'en' },
      { file: 'zh.json', locale: 'zh' },
      { file: 'ar.json', locale: 'ar' },
    ],
  },
  {
    name: 'admin',
    files: [
      { file: 'admin.en.json', locale: 'en' },
      { file: 'admin.zh.json', locale: 'zh' },
      { file: 'admin.ar.json', locale: 'ar' },
    ],
  },
];

/** Flatten a (possibly nested) JSON object into dot-notation keys. */
function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v, key, out);
    } else {
      out[key] = v;
    }
  }
  return out;
}

/** Load every locale file in a group into a flat key->value map. */
function loadGroup(group) {
  const result = {};
  for (const { file, locale } of group.files) {
    const full = path.join(MESSAGES_DIR, file);
    let raw;
    try {
      raw = readFileSync(full, 'utf8');
    } catch (err) {
      console.error(`  ✖ Cannot read ${path.relative(ROOT, full)}: ${err.message}`);
      process.exit(1);
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error(`  ✖ Invalid JSON in ${path.relative(ROOT, full)}: ${err.message}`);
      process.exit(1);
    }
    result[locale] = flatten(parsed);
  }
  return result;
}

let hadError = false;

for (const group of GROUPS) {
  console.log(`\n=== Group: ${group.name} ===`);
  const dicts = loadGroup(group);
  const locales = group.files.map((f) => f.locale);

  // 1) Key-set consistency (union of all keys vs each locale's keys).
  const union = new Set();
  for (const loc of locales) {
    for (const k of Object.keys(dicts[loc])) union.add(k);
  }

  let missingReported = false;
  for (const loc of locales) {
    const keys = new Set(Object.keys(dicts[loc]));
    const missing = [...union].filter((k) => !keys.has(k)).sort();
    if (missing.length) {
      hadError = true;
      missingReported = true;
      console.error(`  ✖ [${loc}] missing ${missing.length} key(s):`);
      for (const k of missing) console.error(`      - ${k}`);
    }
  }
  if (!missingReported) {
    console.log(`  ✓ Key sets consistent (${union.size} keys × ${locales.length} locales)`);
  }

  // 2) "value === key" residues (untranslated stubs).
  let residueCount = 0;
  for (const loc of locales) {
    for (const [k, v] of Object.entries(dicts[loc])) {
      if (typeof v === 'string' && v === k) {
        residueCount++;
        console.warn(`  ⚠ [${loc}] value equals key: "${k}"`);
      }
    }
  }
  if (residueCount === 0) {
    console.log('  ✓ No "value === key" residues');
  } else {
    console.warn(`  ⚠ ${residueCount} "value === key" residue(s) found`);
  }
}

if (hadError) {
  console.error('\n✖ i18n validation FAILED (key-set mismatch).');
  process.exit(1);
}

console.log('\n✓ i18n validation passed.\n');
process.exit(0);
