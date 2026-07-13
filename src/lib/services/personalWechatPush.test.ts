/**
 * personalWechatPush.test.ts — Round G (feature A) push service tests.
 *
 * - getSettings never returns the ciphertext (no webhookEnc leak).
 * - saveSettings encrypts the URL via secretStore and stores an EncryptedPayload
 *   (NOT the plaintext), plus a masked display string.
 * - Provider auto-detection (serverchan / pushplus / generic) via the request
 *   body built by sendTest.
 * - pushContact is fire-and-forget and retries exactly once on failure.
 * - maskWebhookUrl hides the token/key.
 *
 * Prisma is mocked with an in-memory KV store; `fetch` is mocked per case.
 */

const prismaStore = vi.hoisted(() => ({
  data: {} as Record<string, unknown>,
  upsertCalls: [] as { key: string; value: unknown }[],
  reset() {
    for (const k of Object.keys(this.data)) delete this.data[k];
    this.upsertCalls.length = 0;
  },
}));

vi.mock('@prisma/client', () => {
  class PrismaClient {
    siteSettings = {
      findUnique: async ({ where }: { where: { key: string } }) => {
        const key = where.key;
        return key in prismaStore.data ? { value: prismaStore.data[key] } : null;
      },
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { key: string };
        create: { value: unknown };
        update: { value: unknown };
      }) => {
        const value = update?.value ?? create?.value;
        prismaStore.data[where.key] = value;
        prismaStore.upsertCalls.push({ key: where.key, value });
        return { key: where.key, value };
      },
    };
    $disconnect = async () => {};
  }
  return { PrismaClient };
});

import { encrypt, decrypt, isEncryptionConfigured } from '@/lib/services/secretStore';
import { PersonalWechatPushService, maskWebhookUrl } from '@/lib/services/personalWechatPush';
import type { ContactNotificationData } from '@/lib/notifications';
import type { EncryptedPayload } from '@/lib/notify-types';
import { NOTIFY_WECHAT_KEYS } from '@/lib/notify-types';

const HEX_KEY = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';

const sampleContact: ContactNotificationData = {
  type: 'contact',
  id: 42,
  name: 'Alice Tester',
  email: 'alice@example.com',
  phone: '+8613800000000',
  subject: 'general',
  message: 'Hello, I am interested in your cabinets.',
  locale: 'zh',
  createdAt: new Date('2026-07-12T08:00:00Z'),
};

function seedNotifySettings(overrides: Record<string, unknown> = {}) {
  prismaStore.data[NOTIFY_WECHAT_KEYS.enabled] = true;
  prismaStore.data[NOTIFY_WECHAT_KEYS.format] = 'markdown';
  prismaStore.data[NOTIFY_WECHAT_KEYS.webhookMask] = 'https://sctapi.ftqq.com/****.send';
  prismaStore.data[NOTIFY_WECHAT_KEYS.lastTest] = {
    status: 'success',
    at: new Date('2026-07-12T08:05:00Z').toISOString(),
  };
  for (const [k, v] of Object.entries(overrides)) prismaStore.data[k] = v;
}

function okResponse(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status });
}

beforeAll(() => {
  process.env.NOTIFY_AES_KEY = HEX_KEY;
});

beforeEach(() => {
  prismaStore.reset();
  process.env.NOTIFY_AES_KEY = HEX_KEY;
  vi.mocked(globalThis.fetch).mockReset();
});

afterAll(() => {
  delete process.env.NOTIFY_AES_KEY;
});

describe('PersonalWechatPushService.getSettings', () => {
  it('returns the masked config WITHOUT the ciphertext (no webhookEnc leak)', async () => {
    seedNotifySettings();
    const svc = new PersonalWechatPushService();
    const settings = await svc.getSettings();
    expect(settings.enabled).toBe(true);
    expect(settings.format).toBe('markdown');
    expect(settings.webhookMask).toBe('https://sctapi.ftqq.com/****.send');
    expect(settings.lastTest?.status).toBe('success');
    // The masked shape must NEVER expose the encrypted payload.
    expect((settings as Record<string, unknown>).webhookEnc).toBeUndefined();
    expect(JSON.stringify(settings)).not.toContain('aes-256-gcm');
  });

  it('returns sane defaults when nothing is stored', async () => {
    const svc = new PersonalWechatPushService();
    const settings = await svc.getSettings();
    expect(settings.enabled).toBe(false);
    expect(settings.format).toBe('markdown');
    expect(settings.webhookMask).toBe('');
    expect(settings.lastTest).toBeNull();
  });
});

describe('PersonalWechatPushService.saveSettings', () => {
  it('encrypts the webhook URL and stores an EncryptedPayload (not plaintext)', async () => {
    const svc = new PersonalWechatPushService();
    const url = 'https://sctapi.ftqq.com/SENDKEY-MUST-NOT-BE-PLAINTEXT.send';
    await svc.saveSettings({ enabled: true, webhookUrl: url, format: 'markdown' });

    const encCall = prismaStore.upsertCalls.find((c) => c.key === NOTIFY_WECHAT_KEYS.webhookEnc);
    expect(encCall).toBeDefined();
    const enc = encCall!.value as EncryptedPayload;
    expect(enc.v).toBe(1);
    expect(enc.alg).toBe('aes-256-gcm');
    expect(typeof enc.iv).toBe('string');
    expect(typeof enc.data).toBe('string');
    // Crucially: the stored value is NOT the plaintext URL.
    expect(enc).not.toBe(url);
    expect(JSON.stringify(enc)).not.toContain('SENDKEY-MUST-NOT-BE-PLAINTEXT');
    // And it round-trips back to the original via the real decrypt.
    expect(decrypt(enc)).toBe(url);

    // The mask must NOT contain the secret key segment.
    const maskCall = prismaStore.upsertCalls.find((c) => c.key === NOTIFY_WECHAT_KEYS.webhookMask);
    const mask = maskCall!.value as string;
    expect(mask).not.toContain('SENDKEY-MUST-NOT-BE-PLAINTEXT');
    expect(mask).toContain('****');
  });

  it('persists enabled + format', async () => {
    const svc = new PersonalWechatPushService();
    await svc.saveSettings({ enabled: false, format: 'text' });
    const enabledCall = prismaStore.upsertCalls.find((c) => c.key === NOTIFY_WECHAT_KEYS.enabled);
    const formatCall = prismaStore.upsertCalls.find((c) => c.key === NOTIFY_WECHAT_KEYS.format);
    expect(enabledCall!.value).toBe(false);
    expect(formatCall!.value).toBe('text');
  });

  it('does not overwrite the stored webhook when no URL is supplied', async () => {
    // Pre-seed an encrypted webhook.
    const existing = encrypt('https://sctapi.ftqq.com/PREEXISTING.send');
    seedNotifySettings({ [NOTIFY_WECHAT_KEYS.webhookEnc]: existing });
    const encBefore = prismaStore.data[NOTIFY_WECHAT_KEYS.webhookEnc];
    const svc = new PersonalWechatPushService();
    await svc.saveSettings({ enabled: true, format: 'markdown' }); // no webhookUrl
    expect(prismaStore.data[NOTIFY_WECHAT_KEYS.webhookEnc]).toBe(encBefore);
  });
});

describe('PersonalWechatPushService provider detection (via sendTest)', () => {
  function lastFetchBody(): Record<string, unknown> {
    const call = vi.mocked(globalThis.fetch).mock.calls[0];
    const opts = call[1] as { body?: string } | undefined;
    return JSON.parse(opts?.body ?? '{}');
  }

  it('detects Server酱 and sends {title (<=30), desp}', async () => {
    const svc = new PersonalWechatPushService();
    vi.mocked(globalThis.fetch).mockResolvedValue(okResponse({ code: 0 }));
    const result = await svc.sendTest('https://sctapi.ftqq.com/SENDKEY.send', 'markdown');
    expect(result.provider).toBe('serverchan');
    expect(result.ok).toBe(true);
    const body = lastFetchBody();
    expect(body).toHaveProperty('desp');
    expect((body.title as string).length).toBeLessThanOrEqual(30);
    // The URL the webhook was POSTed to is the Server酱 host.
    expect(String(vi.mocked(globalThis.fetch).mock.calls[0][0])).toContain('sctapi.ftqq.com');
  });

  it('detects PushPlus and extracts the token from ?token=', async () => {
    const svc = new PersonalWechatPushService();
    vi.mocked(globalThis.fetch).mockResolvedValue(okResponse({ code: 200 }));
    const result = await svc.sendTest('https://pushplus.plus/send?token=ABC123XYZ', 'markdown');
    expect(result.provider).toBe('pushplus');
    expect(result.ok).toBe(true);
    const body = lastFetchBody();
    expect(body.token).toBe('ABC123XYZ');
    expect(body).toHaveProperty('content');
  });

  it('falls back to generic {title, content} for unknown hosts', async () => {
    const svc = new PersonalWechatPushService();
    vi.mocked(globalThis.fetch).mockResolvedValue(okResponse({ ok: true }));
    const result = await svc.sendTest('https://example.com/webhook', 'markdown');
    expect(result.provider).toBe('generic');
    const body = lastFetchBody();
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('content');
    expect(body).not.toHaveProperty('token');
    expect(body).not.toHaveProperty('desp');
  });

  it('returns a structured failure when the URL is empty', async () => {
    const svc = new PersonalWechatPushService();
    const result = await svc.sendTest('', 'markdown');
    expect(result.ok).toBe(false);
    expect(result.provider).toBe('generic');
    expect(result.message).toMatch(/required/i);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('PersonalWechatPushService.pushContact (fire-and-forget + retry)', () => {
  it('skips silently when disabled', async () => {
    seedNotifySettings({ [NOTIFY_WECHAT_KEYS.enabled]: false });
    const svc = new PersonalWechatPushService();
    await svc.pushContact(sampleContact);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('skips silently when no webhook is configured', async () => {
    seedNotifySettings({ [NOTIFY_WECHAT_KEYS.webhookEnc]: null });
    const svc = new PersonalWechatPushService();
    await svc.pushContact(sampleContact);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('sends once on success and does not throw', async () => {
    seedNotifySettings({
      [NOTIFY_WECHAT_KEYS.webhookEnc]: encrypt('https://example.com/hook'),
    });
    vi.mocked(globalThis.fetch).mockResolvedValue(okResponse({ ok: true }));
    const svc = new PersonalWechatPushService();
    await expect(svc.pushContact(sampleContact)).resolves.toBeUndefined();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('retries exactly once on failure (fire-and-forget, never throws)', async () => {
    seedNotifySettings({
      [NOTIFY_WECHAT_KEYS.webhookEnc]: encrypt('https://example.com/hook'),
    });
    // Always fail -> should attempt twice (1 + 1 retry) and still resolve.
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response('err', { status: 500 }));
    const svc = new PersonalWechatPushService();
    await expect(svc.pushContact(sampleContact)).resolves.toBeUndefined();
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });
});

describe('maskWebhookUrl', () => {
  it('masks a Server酱 URL but never reveals the full key', () => {
    const masked = maskWebhookUrl('https://sctapi.ftqq.com/ABCDEF123456.send');
    expect(masked).toContain('****');
    expect(masked).not.toContain('ABCDEF123456');
  });

  it('masks a PushPlus token in the query string', () => {
    const masked = maskWebhookUrl('https://pushplus.plus/send?token=ABCDEF123456');
    expect(masked).toContain('****');
    expect(masked).not.toContain('ABCDEF123456');
  });

  it('masks a generic short path', () => {
    const masked = maskWebhookUrl('https://example.com/x');
    expect(masked).toContain('****');
    expect(masked).not.toContain('/x');
  });
});

describe('integration: encryption configuration dependency', () => {
  it('isEncryptionConfigured reflects NOTIFY_AES_KEY (sanity for save path)', () => {
    expect(isEncryptionConfigured()).toBe(true);
    delete process.env.NOTIFY_AES_KEY;
    expect(isEncryptionConfigured()).toBe(false);
    process.env.NOTIFY_AES_KEY = HEX_KEY;
  });
});
