import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, unauthorizedResponse, badRequestResponse } from '@/lib/auth';
import { PersonalWechatPushService } from '@/lib/services/personalWechatPush';
import { isEncryptionConfigured } from '@/lib/services/secretStore';

export const dynamic = 'force-dynamic';

const svc = new PersonalWechatPushService();

/**
 * GET /api/admin/settings/notify-webhook
 * Return the (masked) personal WeChat push configuration.
 * IMPORTANT: the encrypted webhook URL (`notify.wechat.webhookEnc`) is NEVER
 * returned — only the display mask is exposed.
 */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorizedResponse();

  try {
    const settings = await svc.getSettings();
    return NextResponse.json({
      enabled: settings.enabled,
      webhookMask: settings.webhookMask,
      format: settings.format,
      lastTest: settings.lastTest,
    });
  } catch (err) {
    console.error('Error loading personal WeChat push settings:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load settings.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings/notify-webhook
 * Persist the configuration. The webhook URL (if provided) is encrypted at rest
 * via AES-256-GCM; the plaintext only travels in this HTTPS request body.
 */
export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorizedResponse();

  let body: { enabled?: unknown; webhookUrl?: unknown; format?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse('Invalid JSON body.');
  }

  if (body.enabled === undefined) {
    return badRequestResponse('"enabled" is required.');
  }
  if (typeof body.enabled !== 'boolean') {
    return badRequestResponse('"enabled" must be a boolean.');
  }
  if (body.format !== undefined && body.format !== 'markdown' && body.format !== 'text') {
    return badRequestResponse('"format" must be "markdown" or "text".');
  }
  if (body.webhookUrl !== undefined && typeof body.webhookUrl !== 'string') {
    return badRequestResponse('"webhookUrl" must be a string.');
  }

  // Only encrypt when a non-empty URL is supplied.
  if (typeof body.webhookUrl === 'string' && body.webhookUrl.trim()) {
    if (!isEncryptionConfigured()) {
      return NextResponse.json(
        { success: false, error: 'NOTIFY_AES_KEY is not configured; cannot encrypt the webhook URL.' },
        { status: 500 }
      );
    }
  }

  try {
    await svc.saveSettings({
      enabled: body.enabled,
      webhookUrl: typeof body.webhookUrl === 'string' ? body.webhookUrl : undefined,
      format: body.format === 'text' ? 'text' : 'markdown',
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving personal WeChat push settings:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to save settings.' },
      { status: 500 }
    );
  }
}
