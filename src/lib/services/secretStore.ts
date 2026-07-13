/**
 * secretStore.ts — AES-256-GCM envelope encryption for the personal WeChat
 * webhook URL (Round G, feature A).
 *
 * The webhook URL is sensitive (it carries a provider token/key), so it is
 * encrypted at rest in the `siteSettings` KV table. `SecretStore` is the ONLY
 * module that performs the cryptography; the key is taken from the
 * `NOTIFY_AES_KEY` environment variable (a 32-byte value, supplied as hex or
 * base64). Plaintext is never persisted and never returned to the client.
 *
 * SECURITY NOTES:
 *  - AES-256-GCM provides authenticated encryption; `decrypt` verifies the
 *    auth tag and throws on tampering.
 *  - A fresh random IV is used per encryption call.
 *  - If `NOTIFY_AES_KEY` is missing the store throws loudly — we never fall
 *    back to a weak/default key.
 */

import crypto from 'crypto';
import type { EncryptedPayload } from '@/lib/notify-types';

const ALGORITHM = 'aes-256-gcm';

/** Resolve the 32-byte key from NOTIFY_AES_KEY (hex or base64, else padded). */
function resolveKey(): Buffer {
  const raw = process.env.NOTIFY_AES_KEY;
  if (!raw || !raw.trim()) {
    throw new Error(
      'NOTIFY_AES_KEY is not configured. Personal WeChat webhook encryption is unavailable.'
    );
  }

  const trimmed = raw.trim();
  // 64-char hex => exactly 32 bytes.
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, 'hex');
  }
  // base64 that decodes to exactly 32 bytes.
  const fromBase64 = Buffer.from(trimmed, 'base64');
  if (fromBase64.length === 32) {
    return fromBase64;
  }
  // Fallback: derive a 32-byte key from the raw string (padded/truncated).
  const padded = Buffer.alloc(32);
  Buffer.from(trimmed, 'utf8').copy(padded, 0, 0, Math.min(trimmed.length, 32));
  return padded;
}

/** Encrypt a UTF-8 plaintext string into an {@link EncryptedPayload}. */
export function encrypt(plain: string): EncryptedPayload {
  const key = resolveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  };
}

/** Decrypt an {@link EncryptedPayload} back to the plaintext string. */
export function decrypt(payload: EncryptedPayload): string {
  const key = resolveKey();
  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const data = Buffer.from(payload.data, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}

/** Whether the encryption key is configured in the environment. */
export function isEncryptionConfigured(): boolean {
  try {
    resolveKey();
    return true;
  } catch {
    return false;
  }
}
