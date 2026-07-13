// @vitest-environment node
/**
 * notify-webhook/route.test.ts — Round G (feature A) admin API tests.
 *
 * GET  → returns the MASKED config (never the ciphertext) and requires admin.
 * PUT  → encrypts + persists; 500 when NOTIFY_AES_KEY is missing; validates input.
 *
 * `requireAdmin` is mocked (auth gate); `PersonalWechatPushService` is mocked
 * (so we assert the delegation, not a real DB/encrypt round-trip — that is
 * covered by personalWechatPush.test.ts). `isEncryptionConfigured` is REAL
 * (reads process.env.NOTIFY_AES_KEY), so the missing-key guard is exercised.
 */

const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }));

const svc = vi.hoisted(() => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
}));

vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return { ...actual, requireAdmin: auth.requireAdmin };
});

vi.mock('@/lib/services/personalWechatPush', () => ({
  PersonalWechatPushService: class {
    getSettings = svc.getSettings;
    saveSettings = svc.saveSettings;
  },
}));

import { NextRequest } from 'next/server';
import { GET, PUT } from './route';

const ADMIN = { sub: '1', username: 'admin', role: 'admin' } as const;
const HEX_KEY = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';

function makeReq(method: string, body?: unknown): NextRequest {
  return new NextRequest('http://localhost/api/admin/settings/notify-webhook', {
    method,
    headers: { 'content-type': 'application/json', authorization: 'Bearer x' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function allowAdmin() {
  (auth.requireAdmin as any).mockResolvedValue(ADMIN);
}
function denyAdmin() {
  (auth.requireAdmin as any).mockResolvedValue(null);
}

beforeEach(() => {
  process.env.NOTIFY_AES_KEY = HEX_KEY;
  svc.getSettings.mockReset();
  svc.saveSettings.mockReset();
  svc.saveSettings.mockResolvedValue(undefined);
  allowAdmin();
});

afterAll(() => {
  delete process.env.NOTIFY_AES_KEY;
});

describe('GET /api/admin/settings/notify-webhook', () => {
  it('requires admin (401 when unauthenticated)', async () => {
    denyAdmin();
    const res = await GET(makeReq('GET'));
    expect(res.status).toBe(401);
    expect(svc.getSettings).not.toHaveBeenCalled();
  });

  it('returns the masked config WITHOUT the ciphertext', async () => {
    svc.getSettings.mockResolvedValue({
      enabled: true,
      webhookMask: 'https://sctapi.ftqq.com/****.send',
      format: 'markdown',
      lastTest: null,
    });
    const res = await GET(makeReq('GET'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.enabled).toBe(true);
    expect(json.webhookMask).toBe('https://sctapi.ftqq.com/****.send');
    expect(json.format).toBe('markdown');
    // The encrypted payload must never leave the server.
    expect(json.webhookEnc).toBeUndefined();
    expect(JSON.stringify(json)).not.toContain('aes-256-gcm');
    expect(svc.getSettings).toHaveBeenCalledTimes(1);
  });
});

describe('PUT /api/admin/settings/notify-webhook', () => {
  it('validates that `enabled` is a boolean', async () => {
    const res = await PUT(makeReq('PUT', { enabled: 'yes' }));
    expect(res.status).toBe(400);
    expect(svc.saveSettings).not.toHaveBeenCalled();
  });

  it('validates the `format` enum', async () => {
    const res = await PUT(makeReq('PUT', { enabled: true, format: 'html' }));
    expect(res.status).toBe(400);
    expect(svc.saveSettings).not.toHaveBeenCalled();
  });

  it('encrypts + saves when NOTIFY_AES_KEY is configured', async () => {
    const body = {
      enabled: true,
      webhookUrl: 'https://sctapi.ftqq.com/SENDKEY-PUT.send',
      format: 'markdown',
    };
    const res = await PUT(makeReq('PUT', body));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(svc.saveSettings).toHaveBeenCalledTimes(1);
    expect(svc.saveSettings).toHaveBeenCalledWith({
      enabled: true,
      webhookUrl: 'https://sctapi.ftqq.com/SENDKEY-PUT.send',
      format: 'markdown',
    });
  });

  it('returns 500 (and does NOT save) when NOTIFY_AES_KEY is missing', async () => {
    delete process.env.NOTIFY_AES_KEY;
    const body = {
      enabled: true,
      webhookUrl: 'https://sctapi.ftqq.com/SENDKEY-PUT.send',
      format: 'markdown',
    };
    const res = await PUT(makeReq('PUT', body));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toMatch(/NOTIFY_AES_KEY/i);
    expect(svc.saveSettings).not.toHaveBeenCalled();
  });
});
