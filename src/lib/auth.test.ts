import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import {
  generateAdminToken,
  verifyAdminToken,
  requireAdmin,
  verifyAuth,
  unauthorizedResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from './auth';

// Mirror the module-load resolution in auth.ts so the wrong-secret test is robust
// regardless of the ambient environment.
const SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'change-me-admin-secret-v8';

function makeReq(headers: Record<string, string>): NextRequest {
  return new NextRequest('http://localhost/api/admin/users', {
    method: 'GET',
    headers: new Headers(headers),
  });
}

describe('admin auth (V8 T7 — signed JWT, role check)', () => {
  it('issues + verifies a signed admin JWT', () => {
    const token = generateAdminToken({ sub: '1', username: 'admin' });
    const payload = verifyAdminToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.role).toBe('admin');
    expect(payload!.sub).toBe('1');
    expect(payload!.username).toBe('admin');
  });

  it('rejects a token signed with the wrong secret', () => {
    const fake = jwt.sign({ sub: '1', username: 'admin', role: 'admin' }, 'other-secret', {
      expiresIn: '8h',
    });
    expect(verifyAdminToken(fake)).toBeNull();
  });

  it('rejects a token whose role is not admin', () => {
    const userTok = jwt.sign({ sub: '1', username: 'bob', role: 'user' }, SECRET, {
      expiresIn: '8h',
    });
    expect(verifyAdminToken(userTok)).toBeNull();
  });

  it('rejects a tampered/invalid token', () => {
    expect(verifyAdminToken('eyJhbGciOiJIUzI1NiJ9.garbage.invalid')).toBeNull();
  });

  it('requireAdmin returns null with no token', async () => {
    expect(await requireAdmin(makeReq({}))).toBeNull();
  });

  it('requireAdmin accepts a Bearer token', async () => {
    const token = generateAdminToken({ sub: '1', username: 'admin' });
    const payload = await requireAdmin(makeReq({ Authorization: `Bearer ${token}` }));
    expect(payload).not.toBeNull();
    expect(payload!.role).toBe('admin');
  });

  it('requireAdmin accepts the admin_auth cookie', async () => {
    const token = generateAdminToken({ sub: '2', username: 'root' });
    const payload = await requireAdmin(makeReq({ cookie: `admin_auth=${encodeURIComponent(token)}` }));
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('2');
  });

  it('requireAdmin rejects an invalid cookie token', async () => {
    expect(await requireAdmin(makeReq({ cookie: 'admin_auth=garbage' }))).toBeNull();
  });

  it('requireAdmin rejects a non-admin token', async () => {
    const userTok = jwt.sign({ sub: '1', username: 'bob', role: 'user' }, SECRET, {
      expiresIn: '8h',
    });
    expect(await requireAdmin(makeReq({ Authorization: `Bearer ${userTok}` }))).toBeNull();
  });

  it('verifyAuth mirrors requireAdmin', async () => {
    const token = generateAdminToken({ sub: '1', username: 'admin' });
    expect(await verifyAuth(makeReq({ Authorization: `Bearer ${token}` }))).toBe(true);
    expect(await verifyAuth(makeReq({}))).toBe(false);
  });

  it('HTTP helpers return correct status codes', () => {
    expect(unauthorizedResponse().status).toBe(401);
    expect(badRequestResponse('x').status).toBe(400);
    expect(notFoundResponse().status).toBe(404);
    expect(serverErrorResponse().status).toBe(500);
  });
});
