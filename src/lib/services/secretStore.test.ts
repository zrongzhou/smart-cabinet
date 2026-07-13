/**
 * secretStore.test.ts — Round G (feature A) crypto tests.
 *
 * Verifies AES-256-GCM encrypt/decrypt round-trip, that both the 64-hex and
 * base64(32B) key encodings work, that the ciphertext is randomised per call
 * (fresh IV) and that `isEncryptionConfigured()` reflects the environment.
 *
 * We explicitly set NOTIFY_AES_KEY in the test process — we do NOT rely on the
 * repo `.env` containing (or missing) the key.
 */

import crypto from 'crypto';
import { encrypt, decrypt, isEncryptionConfigured } from '@/lib/services/secretStore';

/** A deterministic 64-char hex key used for the main (hex) test cases. */
const HEX_KEY = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
/** A base64 encoding of 32 random bytes (44 chars, decodes to exactly 32B). */
const BASE64_KEY = crypto.randomBytes(32).toString('base64');

beforeAll(() => {
  process.env.NOTIFY_AES_KEY = HEX_KEY;
});

afterEach(() => {
  // Restore the explicit hex key between tests so cases that delete it don't
  // leak a "missing key" state into the next case.
  process.env.NOTIFY_AES_KEY = HEX_KEY;
});

afterAll(() => {
  delete process.env.NOTIFY_AES_KEY;
});

describe('secretStore — AES-256-GCM round-trip (64-hex key)', () => {
  it('decrypts back to the exact original plaintext (byte equality)', () => {
    const plain = 'https://sctapi.ftqq.com/SENDKEY-SHOULD-NEVER-LEAK.send';
    const payload = encrypt(plain);
    const back = decrypt(payload);
    expect(back).toBe(plain);
    // Byte-level equality guard (multi-byte / unicode safety).
    expect(Buffer.from(back, 'utf8')).toEqual(Buffer.from(plain, 'utf8'));
  });

  it('handles unicode / multi-byte plaintext correctly', () => {
    const plain = '🔔 测试 中文 推送 https://pushplus.plus/send?token=中文字符';
    const payload = encrypt(plain);
    expect(decrypt(payload)).toBe(plain);
  });

  it('emits the correct envelope shape (v:1, alg aes-256-gcm, base64 iv/tag/data)', () => {
    const payload = encrypt('hello-world');
    expect(payload.v).toBe(1);
    expect(payload.alg).toBe('aes-256-gcm');
    expect(typeof payload.iv).toBe('string');
    expect(typeof payload.tag).toBe('string');
    expect(typeof payload.data).toBe('string');
    // 12-byte IV -> base64 length 16.
    expect(Buffer.from(payload.iv, 'base64').length).toBe(12);
    expect(Buffer.from(payload.tag, 'base64').length).toBeGreaterThan(0);
  });
});

describe('secretStore — key format support', () => {
  it('works with a 64-char hex key', () => {
    process.env.NOTIFY_AES_KEY = HEX_KEY;
    const plain = 'hex-key-plaintext-12345';
    const payload = encrypt(plain);
    expect(decrypt(payload)).toBe(plain);
  });

  it('works with a base64-encoded 32-byte key', () => {
    process.env.NOTIFY_AES_KEY = BASE64_KEY;
    const plain = 'base64-key-plaintext-67890';
    const payload = encrypt(plain);
    expect(decrypt(payload)).toBe(plain);
    // And a hex-encrypted value cannot be read under the base64 key.
    process.env.NOTIFY_AES_KEY = HEX_KEY;
    const hexPayload = encrypt('shared-secret');
    process.env.NOTIFY_AES_KEY = BASE64_KEY;
    expect(() => decrypt(hexPayload)).toThrow();
  });
});

describe('secretStore — ciphertext randomness (random IV)', () => {
  it('produces a different IV (and ciphertext) on every call', () => {
    const plain = 'same-input-different-iv';
    const a = encrypt(plain);
    const b = encrypt(plain);
    expect(a.iv).not.toBe(b.iv);
    expect(a.data).not.toBe(b.data);
    // Both still decrypt to the same plaintext.
    expect(decrypt(a)).toBe(plain);
    expect(decrypt(b)).toBe(plain);
  });
});

describe('secretStore — tamper / auth-tag protection', () => {
  it('throws when the auth tag is corrupted', () => {
    const payload = encrypt('tamper-me');
    const tampered = { ...payload, tag: Buffer.from('00'.repeat(16), 'hex').toString('base64') };
    expect(() => decrypt(tampered)).toThrow();
  });

  it('throws when the ciphertext is corrupted', () => {
    const payload = encrypt('corrupt-me');
    const tampered = { ...payload, data: Buffer.from('ff'.repeat(16), 'hex').toString('base64') };
    expect(() => decrypt(tampered)).toThrow();
  });
});

describe('secretStore — isEncryptionConfigured()', () => {
  it('returns true when NOTIFY_AES_KEY is set', () => {
    process.env.NOTIFY_AES_KEY = HEX_KEY;
    expect(isEncryptionConfigured()).toBe(true);
  });

  it('returns false when NOTIFY_AES_KEY is unset', () => {
    delete process.env.NOTIFY_AES_KEY;
    expect(isEncryptionConfigured()).toBe(false);
  });

  it('returns false when NOTIFY_AES_KEY is empty/whitespace', () => {
    process.env.NOTIFY_AES_KEY = '   ';
    expect(isEncryptionConfigured()).toBe(false);
  });
});
