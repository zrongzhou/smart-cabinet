import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import path from 'path';

const scriptPath = path.join(process.cwd(), 'scripts', 'validate-i18n.mjs');

describe('validate-i18n.mjs gate (V8 T7 / §7.5)', () => {
  it('passes for the current message files (consistent key sets, no residues)', () => {
    const out = execFileSync('node', [scriptPath], { encoding: 'utf8' });
    expect(out).toContain('i18n validation passed');
  });
});
