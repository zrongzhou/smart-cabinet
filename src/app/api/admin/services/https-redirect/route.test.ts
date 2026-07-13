// @vitest-environment node
/**
 * https-redirect/route.test.ts — Round G (feature B) admin API tests.
 *
 * GET  → returns the real current redirect state (delegated to the service) and
 *        requires admin.
 * POST → toggles the redirect (delegated to the service, with the admin
 *        username as the audit actor) and requires admin.
 *
 * `requireAdmin` and `HttpsRedirectService` are mocked; the service's own
 * logic + rollback behaviour is covered by httpsRedirect.test.ts.
 */

const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }));

const svc = vi.hoisted(() => ({
  getState: vi.fn(),
  setRedirect: vi.fn(),
}));

vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return { ...actual, requireAdmin: auth.requireAdmin };
});

vi.mock('@/lib/services/httpsRedirect', () => ({
  HttpsRedirectService: class {
    getState = svc.getState;
    setRedirect = svc.setRedirect;
  },
}));

import { NextRequest } from 'next/server';
import { GET, POST } from './route';

const ADMIN = { sub: '1', username: 'admin', role: 'admin' } as const;

function makeReq(method: string, body?: unknown): NextRequest {
  return new NextRequest('http://localhost/api/admin/services/https-redirect', {
    method,
    headers: { 'content-type': 'application/json', authorization: 'Bearer x' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  (auth.requireAdmin as any).mockResolvedValue(ADMIN);
  svc.getState.mockReset();
  svc.setRedirect.mockReset();
});

describe('GET /api/admin/services/https-redirect', () => {
  it('requires admin (401 when unauthenticated)', async () => {
    (auth.requireAdmin as any).mockResolvedValue(null);
    const res = await GET(makeReq('GET'));
    expect(res.status).toBe(401);
    expect(svc.getState).not.toHaveBeenCalled();
  });

  it('returns the current real state from the service', async () => {
    svc.getState.mockResolvedValue(true);
    const res = await GET(makeReq('GET'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.enabled).toBe(true);
    expect(svc.getState).toHaveBeenCalledTimes(1);
  });
});

describe('POST /api/admin/services/https-redirect', () => {
  it('requires admin (401 when unauthenticated)', async () => {
    (auth.requireAdmin as any).mockResolvedValue(null);
    const res = await POST(makeReq('POST', { enabled: true }));
    expect(res.status).toBe(401);
    expect(svc.setRedirect).not.toHaveBeenCalled();
  });

  it('validates that `enabled` is a boolean', async () => {
    const res = await POST(makeReq('POST', { enabled: 'on' }));
    expect(res.status).toBe(400);
    expect(svc.setRedirect).not.toHaveBeenCalled();
  });

  it('toggles the redirect and forwards the admin username as actor', async () => {
    svc.setRedirect.mockResolvedValue({
      ok: true,
      enabled: true,
      reloaded: true,
      rolledBack: false,
      backupPath: '/etc/nginx/conf.d/smart-cabinet.conf.bak',
      message: 'ok',
    });
    const res = await POST(makeReq('POST', { enabled: true }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.enabled).toBe(true);
    expect(svc.setRedirect).toHaveBeenCalledWith(true, 'admin');
  });

  it('propagates a failed toggle result (success:false)', async () => {
    svc.setRedirect.mockResolvedValue({
      ok: false,
      enabled: false,
      reloaded: false,
      rolledBack: true,
      nginxError: 'nginx: [emerg] bad',
      message: 'rollback',
    });
    const res = await POST(makeReq('POST', { enabled: false }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.rolledBack).toBe(true);
    expect(svc.setRedirect).toHaveBeenCalledWith(false, 'admin');
  });
});
