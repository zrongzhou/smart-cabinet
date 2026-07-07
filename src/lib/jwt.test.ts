import { describe, it, expect } from 'vitest';
import {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
} from './jwt';

describe('user JWT + password utils (V8 auth)', () => {
  it('round-trips an access token', () => {
    const token = generateToken('u1', 'a@b.com', 'user');
    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.userId).toBe('u1');
    expect(payload!.email).toBe('a@b.com');
    expect(payload!.role).toBe('user');
  });

  it('verifyToken returns null for garbage', () => {
    expect(verifyToken('not-a-real-token')).toBeNull();
  });

  it('round-trips a refresh token and rejects a non-refresh token', () => {
    const rt = generateRefreshToken('u1');
    expect(verifyRefreshToken(rt)).toBe('u1');
    const at = generateToken('u1', 'a@b.com', 'user');
    expect(verifyRefreshToken(at)).toBeNull();
    expect(verifyRefreshToken('garbage')).toBeNull();
  });

  it('hashes and compares passwords', async () => {
    const hash = await hashPassword('s3cret');
    expect(hash).not.toBe('s3cret');
    expect(await comparePassword('s3cret', hash)).toBe(true);
    expect(await comparePassword('wrong', hash)).toBe(false);
  });
});
