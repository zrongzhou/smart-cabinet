import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * V8 Admin authentication.
 *
 * The legacy `verifyAuth` only checked whether a token *existed* (cookie value
 * was the literal string "authenticated"), which is trivially forgeable. We now
 * issue a **signed JWT** (role=admin) on login and verify its signature +
 * role here. `requireAdmin` is the single gate used by every admin API route.
 */

const ADMIN_JWT_SECRET_RAW = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;
if (!ADMIN_JWT_SECRET_RAW) {
  throw new Error('[auth] ADMIN_JWT_SECRET / JWT_SECRET is not configured');
}
const ADMIN_JWT_SECRET: string = ADMIN_JWT_SECRET_RAW;

const ADMIN_TOKEN_TTL = '8h';

export interface AdminJwtPayload {
  sub: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/** Issue a signed admin JWT. */
export function generateAdminToken(payload: { sub: string; username: string; role?: string }): string {
  return jwt.sign(
    { sub: payload.sub, username: payload.username, role: 'admin' },
    ADMIN_JWT_SECRET,
    { expiresIn: ADMIN_TOKEN_TTL }
  );
}

/** Verify a signed admin JWT and confirm the admin role. Returns null if invalid. */
export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as AdminJwtPayload;
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch {
    return null;
  }
}

/** Extract the admin token from Bearer header or the `admin_auth` cookie. */
function extractAdminToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }
  const cookie = request.headers.get('cookie');
  if (cookie) {
    const match = cookie.match(/admin_auth=([^;]+)/);
    if (match && match[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
  }
  return null;
}

/**
 * Server-side admin guard. Reads the signed JWT from the Authorization header
 * or the `admin_auth` cookie, verifies signature + role, and returns the
 * payload (or null). Use this in every /api/admin/* route.
 */
export async function requireAdmin(request: NextRequest): Promise<AdminJwtPayload | null> {
  const token = extractAdminToken(request);
  if (!token) return null;
  return verifyAdminToken(token);
}

/**
 * Backwards-compatible boolean guard. Now *actually verifies* signature + role
 * (previously it only checked token presence). Existing admin routes that call
 * `verifyAuth` are upgraded automatically.
 */
export async function verifyAuth(request: NextRequest): Promise<boolean> {
  return (await requireAdmin(request)) !== null;
}

/** 401 Unauthorized. */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized. Please login first.' },
    { status: 401 }
  );
}

/** 404 Not Found. */
export function notFoundResponse(resource: string = 'Resource') {
  return NextResponse.json(
    { error: `${resource} not found.` },
    { status: 404 }
  );
}

/** 400 Bad Request. */
export function badRequestResponse(message: string = 'Bad request.') {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  );
}

/** 500 Server Error. */
export function serverErrorResponse(message: string = 'Internal server error.') {
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}
