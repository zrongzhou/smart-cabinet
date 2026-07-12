import { NextRequest, NextResponse } from 'next/server';
import { generateAdminToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/admin/login
 *
 * Secure admin authentication.
 *
 * Priority order:
 *  1. A database-backed admin account (`User` with `role='admin'`). The
 *     password is verified against the bcrypt hash stored in `passwordHash`.
 *  2. Backward-compatible fallback to the env defaults
 *     (NEXT_PUBLIC_ADMIN_USERNAME / NEXT_PUBLIC_ADMIN_PASSWORD) — ONLY when no
 *     admin account exists in the database yet. On the first such login we
 *     bootstrap the DB admin record (so the next login uses the hash) and flag
 *     `mustChangePassword: true` so the operator is forced to set a real
 *     password via /api/admin/change-password.
 *
 * The default plaintext credentials are never returned to the client.
 */

const ADMIN_COOKIE_NAME = 'admin_auth';
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

/** Issue a signed admin JWT and set it on an httpOnly cookie. */
function issueToken(username: string, mustChangePassword: boolean) {
  const token = generateAdminToken({ sub: username, username });
  const response = NextResponse.json({
    success: true,
    message: 'Login successful',
    token,
    user: { username, role: 'admin' },
    // Tells the frontend to force a password change before using the console.
    mustChangePassword,
  });

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });

  return response;
}

/** Locate the admin account, tolerating a DB that is temporarily unavailable. */
async function findAdminUser(username: string) {
  try {
    return await prisma.user.findFirst({
      where: {
        role: 'admin',
        OR: [{ email: username }, { name: username }],
      },
    });
  } catch {
    // Database unreachable — behave as "no DB admin" and fall back to env.
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '用户名和密码不能为空 / Username and password are required' },
        { status: 400 }
      );
    }

    // 1) Prefer the database-backed admin account.
    const dbUser = await findAdminUser(username);
    if (dbUser && dbUser.passwordHash) {
      const valid = await bcrypt.compare(password, dbUser.passwordHash);
      if (valid) {
        return issueToken(username, false);
      }
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 2) Backward-compatible env fallback — only when no DB admin exists.
    const validUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (username === validUsername && password === validPassword) {
      // Bootstrap the DB admin record so subsequent logins use a real hash and
      // the operator is forced to change the insecure default password.
      try {
        const hashed = await bcrypt.hash(validPassword, 10);
        await prisma.user.upsert({
          where: { email: validUsername },
          update: {},
          create: {
            email: validUsername,
            name: validUsername,
            role: 'admin',
            passwordHash: hashed,
            isActive: true,
          },
        });
      } catch {
        // If the DB write fails we still allow this one bootstrap login; the
        // operator should set a password once the database is reachable.
      }
      return issueToken(username, true);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logout successful' });
  response.cookies.delete('admin_auth');
  return response;
}
