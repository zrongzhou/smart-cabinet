/**
 * POST /api/admin/change-password — secure admin password change (V8.x).
 *
 * Requires a valid admin JWT (enforced by `requireAdmin`). Accepts
 * { currentPassword, newPassword }, verifies the current password against the
 * bcrypt hash stored on the `User` row (role=admin), then stores the new hash.
 *
 * SECURITY:
 *  - The password is never echoed back, logged, or included in any response.
 *  - New password must be at least 8 characters.
 *  - Lookup is by the authenticated JWT's `username` (email or name), not by a
 *    caller-supplied identifier, so one admin cannot reset another's password.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  requireAdmin,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return unauthorizedResponse();
  }

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse('Invalid JSON body.');
  }

  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

  if (!currentPassword || !newPassword) {
    return badRequestResponse('当前密码与新密码均为必填。 / Current and new password are required.');
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return badRequestResponse(
      `新密码长度至少为 ${MIN_PASSWORD_LENGTH} 位。 / New password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  }

  const username = admin.username;

  try {
    const user = await prisma.user.findFirst({
      where: {
        role: 'admin',
        OR: [{ email: username }, { name: username }],
      },
    });

    if (!user || !user.passwordHash) {
      return badRequestResponse('未找到管理员账户。 / Admin account not found.');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return badRequestResponse('当前密码不正确。 / Current password is incorrect.');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true, message: '密码修改成功。 / Password changed successfully.' });
  } catch (err) {
    return serverErrorResponse(err instanceof Error ? err.message : '修改密码失败。 / Failed to change password.');
  }
}
