import { describe, it, expect } from 'vitest';
import { runCommand } from './runCommand';

describe('runCommand — safe execFile wrapper (V8 T5 / Q2)', () => {
  it('resolves with stdout and exit code 0 for a successful command', async () => {
    const res = await runCommand('node', ['-e', "process.stdout.write('hello')"]);
    expect(res.code).toBe(0);
    expect(res.stdout).toBe('hello');
    expect(typeof res.stderr).toBe('string');
  });

  it('captures stderr', async () => {
    const res = await runCommand('node', ['-e', "process.stderr.write('boom')"]);
    expect(res.code).toBe(0);
    expect(res.stderr).toBe('boom');
  });

  it('never rejects — resolves with a non-zero code on failure', async () => {
    const res = await runCommand('this-binary-does-not-exist-xyz', []);
    expect(res.code).not.toBe(0);
    expect(typeof res.stdout).toBe('string');
    expect(typeof res.stderr).toBe('string');
  });
});
