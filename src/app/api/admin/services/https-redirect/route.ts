/**
 * POST /api/admin/services/https-redirect — toggle the HTTP→HTTPS redirect.
 * GET  /api/admin/services/https-redirect — read the REAL current state.
 *
 * Both endpoints require an admin JWT (enforced by `requireAdmin`), consistent
 * with the other /api/admin/services actions. The actual nginx mutation lives
 * in `HttpsRedirectService` (backup → apply → validate → reload → rollback).
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, unauthorizedResponse, badRequestResponse } from '@/lib/auth';
import { HttpsRedirectService } from '@/lib/services/httpsRedirect';

export const dynamic = 'force-dynamic';

const svc = new HttpsRedirectService();

/** GET — return the real current redirect state (parsed from the nginx config). */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorizedResponse();
  try {
    const enabled = await svc.getState();
    return NextResponse.json({ enabled });
  } catch (err) {
    console.error('Error reading HTTPS redirect state:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to read redirect state.' },
      { status: 500 }
    );
  }
}

/** POST — enable/disable the HTTP→HTTPS redirect. */
export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorizedResponse();

  let body: { enabled?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse('Invalid JSON body.');
  }
  if (typeof body.enabled !== 'boolean') {
    return badRequestResponse('"enabled" must be a boolean.');
  }

  try {
    const result = await svc.setRedirect(body.enabled, admin.username);
    return NextResponse.json({ success: result.ok, ...result });
  } catch (err) {
    console.error('Error applying HTTPS redirect change:', err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Failed to apply redirect change.' },
      { status: 500 }
    );
  }
}
