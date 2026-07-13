/**
 * notify-types.ts — Shared types for the personal WeChat push feature (Round G, A).
 *
 * These types are consumed by:
 *  - `src/lib/services/secretStore.ts` (the encrypted payload envelope)
 *  - `src/lib/services/personalWechatPush.ts` (settings + push result)
 *  - `src/lib/notifications.ts` (test delegate) and the admin API routes.
 */

/** Message body format pushed to the personal WeChat webhook. */
export type PushFormat = 'markdown' | 'text';

/** Third-party webhook provider, detected from the webhook URL host. */
export type PushProvider = 'serverchan' | 'pushplus' | 'generic';

/**
 * AES-256-GCM ciphertext envelope. Stored (as JSON) in the `siteSettings`
 * `value` column under the key `notify.wechat.webhookEnc`. The plaintext
 * webhook URL is NEVER returned to the client.
 */
export interface EncryptedPayload {
  /** Schema version, currently always 1. */
  v: 1;
  /** Cipher algorithm. */
  alg: 'aes-256-gcm';
  /** Base64-encoded random 12-byte initialisation vector. */
  iv: string;
  /** Base64-encoded GCM authentication tag. */
  tag: string;
  /** Base64-encoded ciphertext. */
  data: string;
}

/** Result of a single (or retried) push attempt to a personal WeChat webhook. */
export interface PushResult {
  ok: boolean;
  provider: PushProvider;
  httpStatus?: number;
  message?: string;
}

/** Status + timestamp of the last administrator-initiated test send. */
export interface LastTestInfo {
  status: 'success' | 'fail' | null;
  at: string;
  message?: string;
}

/**
 * The (masked) personal WeChat push configuration exposed to the admin UI.
 * `webhookEnc` is intentionally omitted so the ciphertext never leaves the
 * server.
 */
export interface PersonalWechatPushSettings {
  enabled: boolean;
  webhookMask: string;
  format: PushFormat;
  lastTest: LastTestInfo | null;
}

/** SiteSettings KV keys used by the personal WeChat push feature. */
export const NOTIFY_WECHAT_KEYS = {
  enabled: 'notify.wechat.enabled',
  webhookEnc: 'notify.wechat.webhookEnc',
  webhookMask: 'notify.wechat.webhookMask',
  format: 'notify.wechat.format',
  lastTest: 'notify.wechat.lastTest',
} as const;

/** Audit log key for the HTTPS redirect toggle (Round G, feature B). */
export const HTTPS_REDIRECT_AUDIT_KEY = 'audit.httpsRedirect';
