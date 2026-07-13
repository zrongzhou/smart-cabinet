/**
 * personalWechatPush.ts — Personal WeChat push service (Round G, feature A).
 *
 * Delivers contact-form inquiries to the operator's personal WeChat via a
 * third-party webhook (Server酱 / PushPlus / generic). The webhook URL is
 * stored encrypted (AES-256-GCM) in the `siteSettings` KV table; this service
 * is the single reader/decrypter.
 *
 * Design notes:
 *  - Provider is auto-detected from the webhook URL host.
 *  - `pushContact` is fire-and-forget friendly: it never throws to the caller
 *    (failures are logged) and is invoked from `sendNotification`.
 *  - `sendTest` performs a real send (used by the admin test button).
 *  - A single retry is attempted on a failed send (A-P1-2).
 */

import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '@/lib/services/secretStore';
import {
  type EncryptedPayload,
  type LastTestInfo,
  type PersonalWechatPushSettings,
  type PushFormat,
  type PushProvider,
  type PushResult,
  NOTIFY_WECHAT_KEYS,
} from '@/lib/notify-types';
import type { ContactNotificationData } from '@/lib/notifications';

/** Number of additional attempts after the first failure. */
const MAX_RETRIES = 1;

interface RawNotifySettings {
  enabled: boolean;
  webhookEnc: EncryptedPayload | null;
  webhookMask: string;
  format: PushFormat;
  lastTest: LastTestInfo | null;
}

/** Read the raw notify.wechat.* rows from the KV table. */
async function readNotifySettings(): Promise<RawNotifySettings> {
  const prisma = new PrismaClient();
  try {
    const keys = [
      NOTIFY_WECHAT_KEYS.enabled,
      NOTIFY_WECHAT_KEYS.webhookEnc,
      NOTIFY_WECHAT_KEYS.webhookMask,
      NOTIFY_WECHAT_KEYS.format,
      NOTIFY_WECHAT_KEYS.lastTest,
    ];
    const rows = await Promise.all(
      keys.map((k) => prisma.siteSettings.findUnique({ where: { key: k } }))
    );
    const raw = rows.map((r) => r?.value);

    const enabled = raw[0] === true || raw[0] === 'true';
    let webhookEnc: EncryptedPayload | null = null;
    try {
      webhookEnc = raw[1] ? (raw[1] as unknown as EncryptedPayload) : null;
    } catch {
      webhookEnc = null;
    }
    const webhookMask = raw[2] != null ? String(raw[2]) : '';
    const format: PushFormat = raw[3] === 'text' ? 'text' : 'markdown';
    let lastTest: LastTestInfo | null = null;
    try {
      lastTest = raw[4] ? (raw[4] as unknown as LastTestInfo) : null;
    } catch {
      lastTest = null;
    }
    return { enabled, webhookEnc, webhookMask, format, lastTest };
  } finally {
    await prisma.$disconnect();
  }
}

export class PersonalWechatPushService {
  /** Load the (masked) configuration for the admin UI. */
  async getSettings(): Promise<PersonalWechatPushSettings> {
    const s = await readNotifySettings();
    return {
      enabled: s.enabled,
      webhookMask: s.webhookMask,
      format: s.format,
      lastTest: s.lastTest,
    };
  }

  /** Encrypt + persist the webhook URL and related settings. */
  async saveSettings(input: {
    enabled: boolean;
    webhookUrl?: string;
    format: PushFormat;
  }): Promise<void> {
    const prisma = new PrismaClient();
    try {
      const enabled = input.enabled;
      const format: PushFormat = input.format === 'text' ? 'text' : 'markdown';

      await prisma.siteSettings.upsert({
        where: { key: NOTIFY_WECHAT_KEYS.enabled },
        create: { key: NOTIFY_WECHAT_KEYS.enabled, value: enabled as any },
        update: { value: enabled as any },
      });
      await prisma.siteSettings.upsert({
        where: { key: NOTIFY_WECHAT_KEYS.format },
        create: { key: NOTIFY_WECHAT_KEYS.format, value: format as any },
        update: { value: format as any },
      });

      // Only (re)encrypt when a non-empty URL is supplied; an empty/undefined
      // value keeps the previously stored (encrypted) webhook unchanged.
      if (typeof input.webhookUrl === 'string' && input.webhookUrl.trim()) {
        const url = input.webhookUrl.trim();
        const enc = encrypt(url);
        const mask = maskWebhookUrl(url);
        await prisma.siteSettings.upsert({
          where: { key: NOTIFY_WECHAT_KEYS.webhookEnc },
          create: { key: NOTIFY_WECHAT_KEYS.webhookEnc, value: enc as any },
          update: { value: enc as any },
        });
        await prisma.siteSettings.upsert({
          where: { key: NOTIFY_WECHAT_KEYS.webhookMask },
          create: { key: NOTIFY_WECHAT_KEYS.webhookMask, value: mask as any },
          update: { value: mask as any },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  }

  /** Push a contact-form inquiry to the operator's personal WeChat. */
  async pushContact(data: ContactNotificationData): Promise<void> {
    const s = await readNotifySettings();
    if (!s.enabled || !s.webhookEnc) return; // not configured → skip silently
    const url = decrypt(s.webhookEnc);
    if (!url) return;

    const { title, content } = this.buildContactContent(data, s.format);
    let result = await this.dispatch(url, title, content);
    if (!result.ok && MAX_RETRIES > 0) {
      result = await this.dispatch(url, title, content);
    }
    if (!result.ok) {
      console.error('[personalWechatPush] contact push failed:', result.message);
    }
  }

  /** Send a one-off test message to the given webhook URL. */
  async sendTest(url: string, format: PushFormat = 'markdown'): Promise<PushResult> {
    if (!url || !url.trim()) {
      return { ok: false, provider: 'generic', message: 'Webhook URL is required.' };
    }
    const fmt: PushFormat = format === 'text' ? 'text' : 'markdown';
    const title = '🔔 测试消息 (Test Notification)';
    const content =
      fmt === 'text'
        ? 'This is a test message from Smart Cabinet. If you receive this, the webhook is working.'
        : '### ✅ Webhook 测试成功\n\n这是来自 **Smart Cabinet** 的测试消息。\n\nIf you receive this, your personal WeChat webhook is configured correctly.\n\n**Time:** ' +
          new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    return this.dispatch(url.trim(), title, content);
  }

  /** Persist the result of an administrator-initiated test send. */
  async recordTestResult(result: PushResult): Promise<void> {
    const prisma = new PrismaClient();
    try {
      const entry: LastTestInfo = {
        status: result.ok ? 'success' : 'fail',
        at: new Date().toISOString(),
        message: result.message?.slice(0, 500),
      };
      await prisma.siteSettings.upsert({
        where: { key: NOTIFY_WECHAT_KEYS.lastTest },
        create: { key: NOTIFY_WECHAT_KEYS.lastTest, value: entry as any },
        update: { value: entry as any },
      });
    } catch (err) {
      console.error('[personalWechatPush] failed to record test result:', err);
    } finally {
      await prisma.$disconnect();
    }
  }

  // ── internals ──

  /** Detect the webhook provider from the URL host. */
  private detectProvider(url: string): PushProvider {
    try {
      const host = new URL(url).hostname.toLowerCase();
      if (host === 'sctapi.ftqq.com' || host === 'sc.ftqq.com') return 'serverchan';
      if (host === 'pushplus.plus' || host === 'www.pushplus.plus') return 'pushplus';
      return 'generic';
    } catch {
      return 'generic';
    }
  }

  /** Extract the `?token=` value used by PushPlus webhooks. */
  private extractToken(url: string): string {
    try {
      return new URL(url).searchParams.get('token') || '';
    } catch {
      return '';
    }
  }

  /** Build the title + body for a contact inquiry. */
  private buildContactContent(
    data: ContactNotificationData,
    format: PushFormat
  ): { title: string; content: string } {
    const subjectMap: Record<string, string> = {
      general: 'General Inquiry',
      sales: 'Sales & Pricing',
      support: 'Technical Support',
      customization: 'Customization Request',
      partnership: 'Partnership Opportunity',
    };
    const subjectText = subjectMap[data.subject] || data.subject;
    const title = '📬 新的联系表单消息 (New Contact)';
    const time = new Date(data.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

    if (format === 'text') {
      const lines = [
        `From: ${data.name}`,
        `Email: ${data.email}`,
        data.phone ? `Phone: ${data.phone}` : '',
        `Subject: ${subjectText}`,
        `Message: ${data.message}`,
        `Time: ${time}`,
        `Message ID: ${data.id}`,
      ];
      return { title, content: lines.filter(Boolean).join('\n') };
    }

    const content = `### 📬 New Contact Message

**From:** ${data.name}
**Email:** ${data.email}
${data.phone ? `**Phone:** ${data.phone}\n` : ''}**Subject:** ${subjectText}
**Message:**
${data.message}

**Time:** ${time}
**Message ID:** ${data.id}`;
    return { title, content };
  }

  /** Assemble the provider-specific request body and send once. */
  private async dispatch(url: string, title: string, content: string): Promise<PushResult> {
    const provider = this.detectProvider(url);
    const body = this.buildPayload(provider, url, title, content);
    return this.sendOnce(url, provider, body);
  }

  /** Build the provider-specific request body (with length truncation). */
  private buildPayload(
    provider: PushProvider,
    url: string,
    title: string,
    content: string
  ): Record<string, unknown> {
    switch (provider) {
      case 'serverchan':
        return { title: truncate(title, 30), desp: truncate(content, 20000) };
      case 'pushplus':
        return {
          token: this.extractToken(url),
          title: truncate(title, 50),
          content: truncate(content, 8000),
        };
      default:
        return { title, content };
    }
  }

  /** Perform a single outbound POST to the webhook. */
  private async sendOnce(
    url: string,
    provider: PushProvider,
    body: Record<string, unknown>
  ): Promise<PushResult> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const httpStatus = res.status;
      let ok = res.ok;
      let message = `HTTP ${res.status}`;
      try {
        const json = (await res.json()) as {
          code?: number;
          errno?: number;
          msg?: string;
          message?: string;
          errmsg?: string;
        };
        if (provider === 'serverchan' && json.code !== 0) {
          ok = false;
          message = json.errmsg || json.message || message;
        } else if (provider === 'pushplus' && json.code !== 200) {
          ok = false;
          message = json.msg || json.message || message;
        } else if (provider === 'generic' && !res.ok) {
          ok = false;
          message = json.message || json.errmsg || message;
        }
      } catch {
        // Non-JSON response body — keep the HTTP status as the message.
      }
      return { ok, provider, httpStatus, message };
    } catch (err) {
      return {
        ok: false,
        provider,
        message: err instanceof Error ? err.message : 'Network error sending webhook.',
      };
    }
  }
}

/** Mask a webhook URL for display (never reveals the token/key). */
export function maskWebhookUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.host;
    let pathMask = '';
    if (u.pathname && u.pathname !== '/') {
      const segs = u.pathname.split('/').filter(Boolean);
      const last = segs[segs.length - 1] || '';
      pathMask = '/' + (last.length > 6 ? `${last.slice(0, 4)}****${last.slice(-2)}` : '****');
    }
    let queryMask = '';
    if (u.search) {
      const token = u.searchParams.get('token');
      queryMask =
        token && token.length > 4
          ? `?token=${token.slice(0, 3)}****${token.slice(-2)}`
          : '?token=****';
    }
    const masked = `${u.protocol}//${host}${pathMask}${queryMask}`;
    return masked || `${url.slice(0, 16)}****`;
  } catch {
    return `${url.slice(0, 16)}****`;
  }
}

/** Append a truncation marker when a string exceeds the max length. */
function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 6))}…(已截断)`;
}
