import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./runCommand', () => ({
  runCommand: vi.fn(),
}));

import { runCommand } from './runCommand';
import {
  generateNginxConfig,
  isWritePathAllowed,
  writeNginxConfig,
  reloadNginx,
  NGINX_CONF_PATH,
} from './nginxConfig';

const runCommandMock = vi.mocked(runCommand);

describe('nginxConfig (V8 T5 / Q2)', () => {
  beforeEach(() => {
    runCommandMock.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fills template placeholders and adds a provenance comment', () => {
    const out = generateNginxConfig({ domain: 'www.example.com', port: 3000, sslEmail: 'a@b.com' });
    expect(out).toContain('www.example.com');
    expect(out).toContain('3000');
    expect(out).toContain('# ssl email: a@b.com');
    expect(out).not.toContain('__DOMAIN__');
    expect(out).not.toContain('__PORT__');
  });

  it('omits the ssl email comment when not supplied', () => {
    const out = generateNginxConfig({ domain: 'www.example.com', port: 8080 });
    expect(out).not.toContain('# ssl email');
  });

  it('only allows the white-listed nginx conf path for writes', () => {
    expect(isWritePathAllowed(NGINX_CONF_PATH)).toBe(true);
    expect(isWritePathAllowed('/etc/nginx/other.conf')).toBe(false);
    expect(isWritePathAllowed('/tmp/smart-cabinet.conf')).toBe(false);
  });

  it('refuses to write to a non-white-listed path (security)', () => {
    expect(() => writeNginxConfig('/tmp/evil.conf', 'data')).toThrow(/Refused to write/);
  });

  it('reloadNginx returns ok:true when nginx test + reload succeed', async () => {
    runCommandMock.mockResolvedValue({
      stdout: 'nginx: configuration file test is successful',
      stderr: '',
      code: 0,
    });
    const res = await reloadNginx();
    expect(res.ok).toBe(true);
    expect(res.code).toBe(0);
    expect(runCommandMock).toHaveBeenCalledWith('nginx', ['-t']);
    expect(runCommandMock).toHaveBeenCalledWith('nginx', ['-s', 'reload']);
  });

  it('reloadNginx skips reload and returns ok:false when nginx -t fails', async () => {
    runCommandMock.mockResolvedValue({ stdout: '', stderr: 'nginx: [emerg] invalid', code: 1 });
    const res = await reloadNginx();
    expect(res.ok).toBe(false);
    expect(res.code).toBe(1);
  });
});
