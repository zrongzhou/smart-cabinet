// @vitest-environment node
/**
 * test-notify-webhook/route.test.ts — Round G (feature A) real-push test API.
 *
 * POST triggers a real send (delegated to PersonalWechatPushService.sendTest)
 * and records the result. Requires admin. Returns 400 when no webhook URL is
 * available. `fetch` is mocked at the service layer (the service itself is
 * mocked), so no network call escapes.
 */

const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }));

const svc = vi.hoisted(() => ({
  sendTest: vi.fn(),
  recordTestResult: vi.fn(),
}));

vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return { ...actual, requireAdmin: auth.requireAdmin };
});

vi.mock('@/lib/services/personalWechatPush', () => ({
  PersonalWechatPushService: class {
    sendTest = svc.sendTest;
    recordTestResult = svc.recordTestResult;
  },
}));

vi.mock('@prisma/client', () => {
  class PrismaClient {
    siteSettings = { findUnique: async () => null, upsert: async () => ({}) };
    $disconnect = async () => {};
  }
  return { PrismaClient };
});

import { NextRequest } from 'next/server';
import { POST } from './route';

const ADMIN = { sub: '1', username: 'admin', role: 'admin' } as const;

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/admin/settings/test-notify-webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer x' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  (auth.requireAdmin as any).mockResolvedValue(ADMIN);
  svc.sendTest.mockReset();
  svc.recordTestResult.mockReset();
  svc.recordTestResult.mockResolvedValue(undefined);
});

describe('POST /api/admin/settings/test-notify-webhook', () => {
  it('requires admin (401 when unauthenticated)', async () => {
    (auth.requireAdmin as any).mockResolvedValue(null);
    const res = await POST(makeReq({ webhookUrl: 'https://sctapi.ftqq.com/K.send' }));
    expect(res.status).toBe(401);
    expect(svc.sendTest).not.toHaveBeenCalled();
  });

  it('validates the `format` enum', async () => {
    const res = await POST(makeReq({ webhookUrl: 'https://sctapi.ftqq.com/K.send', format: 'html' }));
    expect(res.status).toBe(400);
    expect(svc.sendTest).not.toHaveBeenCalled();
  });

  it('triggers a real send and records the result', async () => {
    svc.sendTest.mockResolvedValue({
      ok: true,
      provider: 'serverchan',
      httpStatus: 200,
      message: 'sent',
    });
    const res = await POST(makeReq({ webhookUrl: 'https://sctapi.ftqq.com/K.send', format: 'markdown' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.provider).toBe('serverchan');
    expect(json.httpStatus).toBe(200);
    expect(svc.sendTest).toHaveBeenCalledWith('https://sctapi.ftqq.com/K.send', 'markdown');
    expect(svc.recordTestResult).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when no webhook URL is supplied and none is stored', async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
    expect(svc.sendTest).not.toHaveBeenCalled();
  });
});
