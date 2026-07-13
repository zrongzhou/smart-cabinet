/**
 * httpsRedirect.test.ts — Round G (feature B) nginx "Force HTTPS" toggle tests.
 *
 * Strategy (no real nginx, no arbitrary disk writes):
 *  - Mock `fs` so `readFileSync` returns a TEMP copy of the nginx config and
 *    `writeFileSync` is a spy (no real file is written; we assert on its args).
 *  - Mock `@/lib/services/runCommand` so `nginx -t` / `nginx -s reload` are
 *    faked — nginx is NEVER executed.
 *  - Use the REAL `nginxConfig` writer/backup logic (it calls our mocked
 *    `writeFileSync` / `runCommand`), so the white-list + applyToggle behaviour
 *    is genuinely exercised.
 *  - Mock `@prisma/client` so the audit log doesn't hit a database.
 */

vi.mock('fs');
vi.mock('@/lib/services/runCommand', () => ({ runCommand: vi.fn() }));
vi.mock('@prisma/client', () => {
  class PrismaClient {
    siteSettings = {
      findUnique: async () => null,
      upsert: async () => ({ key: 'audit', value: [] }),
    };
    $disconnect = async () => {};
  }
  return { PrismaClient };
});

import { readFileSync, writeFileSync } from 'fs';
import { runCommand } from '@/lib/services/runCommand';
import { NGINX_CONF_PATH } from '@/lib/services/nginxConfig';
import { HttpsRedirectService } from '@/lib/services/httpsRedirect';

/** HTTP server block WITH the `return 301` marker (redirect ON). */
const CONFIG_WITH_REDIRECT = `server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
    location / {
        client_max_body_size 50m;
        proxy_pass http://localhost:3000;
    }
}
server {
    listen 443 ssl;
    server_name example.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}
`;

/** HTTP server block WITHOUT the `return 301` marker (redirect OFF, HTTP direct). */
const CONFIG_WITHOUT_REDIRECT = `server {
    listen 80;
    server_name example.com;
    location / {
        client_max_body_size 50m;
        proxy_pass http://localhost:3000;
    }
}
server {
    listen 443 ssl;
    server_name example.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}
`;

/** Make runCommand report a successful `nginx -t` + `nginx -s reload`. */
function runCommandSuccess() {
  vi.mocked(runCommand).mockImplementation(async (_cmd: string, args?: string[]) => {
    const a = args ?? [];
    if (a[0] === '-t') {
      return {
        stdout: 'nginx: configuration file test is successful',
        stderr: '',
        code: 0,
      };
    }
    return { stdout: '', stderr: '', code: 0 };
  });
}

/** Make `nginx -t` fail (so setRedirect should roll back and NOT reload). */
function runCommandTestFails() {
  vi.mocked(runCommand).mockImplementation(async (_cmd: string, args?: string[]) => {
    const a = args ?? [];
    if (a[0] === '-t') {
      return { stdout: 'nginx: [emerg] unknown directive "foobar"', stderr: '', code: 1 };
    }
    return { stdout: '', stderr: '', code: 0 };
  });
}

/** All writes succeed (no-op). */
function writeSucceeds() {
  vi.mocked(writeFileSync).mockImplementation(() => undefined);
}

/** Only the ACTIVE config write fails; `.bak` writes still succeed. */
function writeActiveFails() {
  vi.mocked(writeFileSync).mockImplementation((p: any) => {
    if (String(p).includes('.bak')) return; // backups are fine
    throw new Error('disk full (simulated)');
  });
}

function mainWrites(): unknown[][] {
  return vi.mocked(writeFileSync).mock.calls.filter((c) => String(c[0]) === NGINX_CONF_PATH);
}

beforeEach(() => {
  vi.mocked(readFileSync).mockReset();
  vi.mocked(writeFileSync).mockReset();
  vi.mocked(runCommand).mockReset();
  writeSucceeds();
});

describe('HttpsRedirectService.getState', () => {
  it('parses the live config and reports ON when `return 301` is present', async () => {
    vi.mocked(readFileSync).mockReturnValue(CONFIG_WITH_REDIRECT);
    const svc = new HttpsRedirectService();
    await expect(svc.getState()).resolves.toBe(true);
  });

  it('reports OFF when `return 301` is absent', async () => {
    vi.mocked(readFileSync).mockReturnValue(CONFIG_WITHOUT_REDIRECT);
    const svc = new HttpsRedirectService();
    await expect(svc.getState()).resolves.toBe(false);
  });

  it('defaults to ON (conservative) when the config cannot be read', async () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('ENOENT simulated');
    });
    const svc = new HttpsRedirectService();
    await expect(svc.getState()).resolves.toBe(true);
  });
});

describe('HttpsRedirectService.setRedirect(true) — enable', () => {
  it('keeps `return 301` and removes the dormant `location /`, then reloads once', async () => {
    vi.mocked(readFileSync).mockReturnValue(CONFIG_WITHOUT_REDIRECT);
    runCommandSuccess();
    const svc = new HttpsRedirectService();
    const result = await svc.setRedirect(true, 'admin');

    expect(result.ok).toBe(true);
    expect(result.enabled).toBe(true);
    expect(result.reloaded).toBe(true);
    expect(result.rolledBack).toBe(false);
    expect(result.backupPath).toBeDefined();

    // The written active config contains the redirect marker in the HTTP block,
    // but the HTTP block has NO proxy `location /` (redirect short-circuits, so
    // it is removed). The HTTPS (443) block legitimately keeps its own
    // `location /`, so we scope the assertion to the HTTP server block.
    const writes = mainWrites();
    expect(writes.length).toBe(1);
    const written = String(writes[0][1]);
    const httpBlock = written.split('listen 443')[0];
    expect(httpBlock).toContain('return 301 https://$host$request_uri;');
    expect(httpBlock).not.toContain('location /');

    // A `.bak` backup was created (latest + timestamped copy).
    const bakWrites = vi
      .mocked(writeFileSync)
      .mock.calls.filter((c) => String(c[0]).includes('.bak'));
    expect(bakWrites.length).toBeGreaterThanOrEqual(1);

    // nginx -t AND nginx -s reload were both executed exactly once.
    const calls = vi.mocked(runCommand).mock.calls;
    expect(calls.filter((c) => c[1]?.[0] === '-t').length).toBe(1);
    expect(calls.filter((c) => c[1]?.[0] === '-s' && c[1]?.[1] === 'reload').length).toBe(1);
  });
});

describe('HttpsRedirectService.setRedirect(false) — disable (HTTP direct)', () => {
  it('removes `return 301`, keeps `location /` proxy, and reloads once', async () => {
    vi.mocked(readFileSync).mockReturnValue(CONFIG_WITH_REDIRECT);
    runCommandSuccess();
    const svc = new HttpsRedirectService();
    const result = await svc.setRedirect(false, 'admin');

    expect(result.ok).toBe(true);
    expect(result.enabled).toBe(false);
    expect(result.reloaded).toBe(true);
    expect(result.rolledBack).toBe(false);

    const writes = mainWrites();
    expect(writes.length).toBe(1);
    const written = String(writes[0][1]);
    expect(written).not.toContain('return 301');
    expect(written).toContain('location /');
    expect(written).toContain('proxy_pass http://localhost:3000');

    const calls = vi.mocked(runCommand).mock.calls;
    expect(calls.filter((c) => c[1]?.[0] === '-t').length).toBe(1);
    expect(calls.filter((c) => c[1]?.[0] === '-s' && c[1]?.[1] === 'reload').length).toBe(1);
  });
});

describe('HttpsRedirectService.setRedirect — rollback (active write fails)', () => {
  it('does NOT run nginx -t / reload and keeps the original state', async () => {
    vi.mocked(readFileSync).mockReturnValue(CONFIG_WITH_REDIRECT);
    writeActiveFails();
    const svc = new HttpsRedirectService();
    const result = await svc.setRedirect(false, 'admin');

    expect(result.ok).toBe(false);
    expect(result.reloaded).toBe(false);
    // Backups were written (they don't fail), but the active write did.
    const bakWrites = vi
      .mocked(writeFileSync)
      .mock.calls.filter((c) => String(c[0]).includes('.bak'));
    expect(bakWrites.length).toBeGreaterThanOrEqual(1);
    // The active config was attempted exactly once and it threw.
    expect(mainWrites().length).toBe(1);
    // Crucially: reload (nginx -t) was NEVER reached.
    expect(runCommand).not.toHaveBeenCalled();
  });
});

describe('HttpsRedirectService.setRedirect — rollback (nginx -t fails)', () => {
  it('rolls the original config back and does NOT run `nginx -s reload`', async () => {
    vi.mocked(readFileSync).mockReturnValue(CONFIG_WITH_REDIRECT);
    runCommandTestFails();
    const svc = new HttpsRedirectService();
    const result = await svc.setRedirect(false, 'admin');

    expect(result.ok).toBe(false);
    expect(result.reloaded).toBe(false);
    expect(result.rolledBack).toBe(true);
    expect(result.nginxError).toBeTruthy();

    // nginx -t was run once; nginx -s reload was NOT run (because -t failed).
    const calls = vi.mocked(runCommand).mock.calls;
    expect(calls.filter((c) => c[1]?.[0] === '-t').length).toBe(1);
    expect(calls.filter((c) => c[1]?.[0] === '-s' && c[1]?.[1] === 'reload').length).toBe(0);

    // The active config was written twice: first the new (disabled) content,
    // then rolled back to the original (which still contains `return 301`).
    const writes = mainWrites();
    expect(writes.length).toBe(2);
    const rolledBack = String(writes[1][1]);
    expect(rolledBack).toContain('return 301 https://$host$request_uri;');
  });
});
