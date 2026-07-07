import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth';
import { sendTestNotification } from '@/lib/notifications';

// POST /api/admin/settings/test-wechat - Test WeChat webhook
export async function POST(request: NextRequest) {
  // Server-side guard: this endpoint triggers an outbound request to a
  // caller-supplied URL, so it must be restricted to authenticated admins.
  const admin = await requireAdmin(request);
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { webhookUrl } = body;

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, message: 'Webhook URL is required' },
        { status: 400 }
      );
    }

    // Send test notification
    const result = await sendTestNotification(webhookUrl);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error testing WeChat webhook:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to test webhook' },
      { status: 500 }
    );
  }
}
