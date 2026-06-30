/**
 * WeChat Notification Module
 * Supports Enterprise WeChat (企业微信) group bot webhook notifications
 */

// WeChat Webhook message types
export interface WeChatMarkdownMessage {
  msgtype: 'markdown';
  markdown: {
    content: string;
  };
}

export interface WeChatTextMessage {
  msgtype: 'text';
  text: {
    content: string;
    mentioned_list?: string[];
  };
}

// Notification types
export type NotificationType = 'contact' | 'order';

// Contact form notification data
export interface ContactNotificationData {
  type: 'contact';
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  locale: string;
  createdAt: Date;
}

// Order notification data
export interface OrderNotificationData {
  type: 'order';
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  itemCount: number;
  createdAt: Date;
}

export type NotificationData = ContactNotificationData | OrderNotificationData;

/**
 * Fetch WeChat notification settings from database
 */
async function getWeChatSettings(): Promise<{
  webhookUrl: string;
  enabled: boolean;
} | null> {
  try {
    // Dynamic import to avoid circular dependencies
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const webhookSetting = await prisma.siteSettings.findUnique({
      where: { key: 'wechatWebhookUrl' },
    });

    const enabledSetting = await prisma.siteSettings.findUnique({
      where: { key: 'wechatNotificationEnabled' },
    });

    await prisma.$disconnect();

    const webhookUrl = webhookSetting?.value as unknown as string;
    const enabled = (enabledSetting?.value as unknown as boolean) || false;

    if (!webhookUrl || !enabled) {
      return null;
    }

    return { webhookUrl, enabled };
  } catch (error) {
    console.error('Error fetching WeChat settings:', error);
    return null;
  }
}

/**
 * Build Markdown message for contact form submission
 */
function buildContactMessage(data: ContactNotificationData): string {
  const subjectMap: Record<string, string> = {
    general: 'General Inquiry',
    sales: 'Sales & Pricing',
    support: 'Technical Support',
    customization: 'Customization Request',
    partnership: 'Partnership Opportunity',
  };

  const subjectText = subjectMap[data.subject] || data.subject;

  return `### 📬 New Contact Message

**From:** ${data.name}
**Email:** ${data.email}
${data.phone ? `**Phone:** ${data.phone}\n` : ''}**Subject:** ${subjectText}
**Message:**
${data.message}

**Time:** ${new Date(data.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
**Message ID:** ${data.id}

[View in Admin](mailto:${data.email})`;
}

/**
 * Build Markdown message for new order
 */
function buildOrderMessage(data: OrderNotificationData): string {
  return `### 🛒 New Order Received

**Order ID:** ${data.id}
**Customer:** ${data.customerName}
**Email:** ${data.customerEmail}
**Total:** $${data.total.toFixed(2)}
**Items:** ${data.itemCount}
**Status:** ${data.status}

**Time:** ${new Date(data.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
}

/**
 * Send WeChat notification via webhook
 */
async function sendWeChatNotification(
  webhookUrl: string,
  markdownContent: string
): Promise<boolean> {
  try {
    const message: WeChatMarkdownMessage = {
      msgtype: 'markdown',
      markdown: {
        content: markdownContent,
      },
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WeChat webhook error:', response.status, errorText);
      return false;
    }

    const result = await response.json();

    // Enterprise WeChat webhook returns { errcode: 0, errmsg: "ok" } on success
    if (result.errcode !== 0) {
      console.error('WeChat webhook returned error:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending WeChat notification:', error);
    return false;
  }
}

/**
 * Send notification (main entry point)
 * This function is non-blocking and will not throw errors
 */
export async function sendNotification(data: NotificationData): Promise<void> {
  try {
    // Fetch settings from database
    const settings = await getWeChatSettings();

    if (!settings || !settings.enabled) {
      // Notifications disabled or not configured
      return;
    }

    // Build message based on type
    let markdownContent: string;
    if (data.type === 'contact') {
      markdownContent = buildContactMessage(data);
    } else {
      markdownContent = buildOrderMessage(data);
    }

    // Send notification
    const success = await sendWeChatNotification(
      settings.webhookUrl,
      markdownContent
    );

    if (success) {
      console.log(`WeChat notification sent successfully for ${data.type}`);
    } else {
      console.warn(`Failed to send WeChat notification for ${data.type}`);
    }
  } catch (error) {
    // Never block the main flow
    console.error('Error in sendNotification:', error);
  }
}

/**
 * Send test notification (for admin settings page)
 */
export async function sendTestNotification(webhookUrl: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const testMessage = `### ✅ WeChat Notification Test

This is a test message from **Smart Cabinet** system.

If you receive this message, the webhook configuration is successful!

**Time:** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;

    const success = await sendWeChatNotification(webhookUrl, testMessage);

    if (success) {
      return {
        success: true,
        message: 'Test notification sent successfully! Check your WeChat group.',
      };
    } else {
      return {
        success: false,
        message: 'Failed to send test notification. Please check the webhook URL.',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
}

/**
 * Validate WeChat webhook URL format
 */
export function validateWebhookUrl(url: string): boolean {
  if (!url) return false;

  // Enterprise WeChat webhook URL format
  const wechatRegex =
    /^https:\/\/qyapi\.weixin\.qq\.com\/cgi-bin\/webhook\/send\?key=/;
  return wechatRegex.test(url);
}
