import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAdmin, unauthorizedResponse, badRequestResponse, notFoundResponse, serverErrorResponse } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/users/[id]/reset-password
 *
 * Admin-only password reset for a regular user. Flow:
 *   1. requireAdmin — signed admin JWT (role=admin) is mandatory.
 *   2. Validate `newPassword` length (>= 8) server-side.
 *   3. bcrypt-hash and overwrite the user's `passwordHash`.
 *   4. Respond with `{ success: true }` — the password is never returned.
 *
 * Note: the User model column is `passwordHash` (not `password`); we update
 * that field only.
 */

const MIN_PASSWORD_LENGTH = 8;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // NEXT15: params is a Promise
) {
  // 1) Admin authorization gate.
  const admin = await requireAdmin(request);
  if (!admin) {
    return unauthorizedResponse();
  }

  const userId = (await params).id; // NEXT15

  // 2) Parse + validate the JSON body.
  let body: { newPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse('Invalid JSON body.');
  }

  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return badRequestResponse(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  try {
    // Make sure the target user exists before hashing.
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return notFoundResponse('User');
    }

    // 3) Hash with bcrypt and update.
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // 4) Success — never echo the password back.
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverErrorResponse(err instanceof Error ? err.message : 'Failed to reset password.');
  }
}
