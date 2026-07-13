import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, unauthorizedResponse, badRequestResponse } from '@/lib/auth';
import { PersonalWechatPushService } from '@/lib/services/personalWechatPush';
import { decrypt } from '@/lib/services/secretStore';
import { NOTIFY_WECHAT_KEYS } from '@/lib/notify-types';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const svc = new PersonalWechatPushService();

/**
 * POST /api/admin/settings/test-notify-webhook
 * Send a REAL test message to the personal WeChat webhook. Restricted to admins.
 * If no `webhookUrl` is supplied, the currently stored (decrypted) webhook is
 * used so the admin can re-test the configured endpoint.
 */
export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorizedResponse();

  let body: { webhookUrl?: unknown; format?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse('Invalid JSON body.');
  }

  if (body.format !== undefined && body.format !== 'markdown' && body.format !== 'text') {
    return badRequestResponse('"format" must be "markdown" or "text".');
  }
  const format = body.format === 'text' ? 'text' : 'markdown';

  let url: string | undefined;
  if (typeof body.webhookUrl === 'string' && body.webhookUrl.trim()) {
    url = body.webhookUrl.trim();
  } else {
    url = await readStoredWebhook();
  }

  if (!url) {
    return NextResponse.json(
      { success: false, message: 'Webhook URL is required (provide one or configure it first).' },
      { status: 400 }
    );
  }

  try {
    const result = await svc.sendTest(url, format);
    await svc.recordTestResult(result);
    return NextResponse.json({
      success: result.ok,
      provider: result.provider,
      httpStatus: result.httpStatus,
      message:
        result.message ||
        (result.ok ? 'Test message sent successfully.' : 'Test message failed to send.'),
    });
  } catch (err) {
    console.error('Error sending personal WeChat test:', err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Failed to send test.' },
      { status: 500 }
    );
  }
}

/** Read (and decrypt) the currently stored webhook URL, if any. */
async function readStoredWebhook(): Promise<string | undefined> {
  try {
    const prisma = new PrismaClient();
    try {
      const row = await prisma.siteSettings.findUnique({
        where: { key: NOTIFY_WECHAT_KEYS.webhookEnc },
      });
      if (!row?.value) return undefined;
      const enc = row.value as unknown as Parameters<typeof decrypt>[0];
      return decrypt(enc);
    } finally {
      await prisma.$disconnect();
    }
  } catch {
    return undefined;
  }
}
