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
 * Fetch personal WeChat (Server酱) notification settings from database
 */
async function getPersonalWeChatSettings(): Promise<{
  enabled: boolean;
  sendKey: string;
} | null> {
  try {
    // Dynamic import to avoid circular dependencies
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const enabledSetting = await prisma.siteSettings.findUnique({
        where: { key: 'wechatPersonalEnabled' },
      });
      const sendKeySetting = await prisma.siteSettings.findUnique({
        where: { key: 'wechatPersonalSendKey' },
      });

      const enabled = (enabledSetting?.value as unknown as boolean) || false;
      const sendKey = (sendKeySetting?.value as unknown as string) || '';

      if (!enabled || !sendKey) return null;
      return { enabled, sendKey };
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error fetching personal WeChat settings:', error);
    return null;
  }
}

/**
 * Send personal WeChat notification via Server酱 (SCT)
 * Pushes a message to the user's personal WeChat by binding
 * the Server酱 official account (no enterprise WeChat required).
 */
export async function sendPersonalWeChatNotification(
  title: string,
  content: string
): Promise<boolean> {
  const settings = await getPersonalWeChatSettings();
  if (!settings || !settings.enabled || !settings.sendKey) return false;
  try {
    const res = await fetch(`https://sctapi.ftqq.com/${settings.sendKey}.send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.substring(0, 30), // Server酱 title length limit
        desp: content,
      }),
    });
    const data = await res.json();
    return data.code === 0;
  } catch (error) {
    console.error('Error sending personal WeChat notification:', error);
    return false;
  }
}

/**
 * 企业微信应用消息设置
 * 通过企业微信"自建应用"API向成员发私信
 * 需要: corpId(企业ID) + agentId(应用ID) + secret(密钥) + toUser(接收人userId)
 */
interface WeComAppSettings {
  enabled: boolean;
  corpId: string;
  agentId: string;
  secret: string;
  toUser: string; // 接收人的 userId 或 @all
}

async function getWeComAppSettings(): Promise<WeComAppSettings | null> {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    try {
      const keys = ['wecomAppEnabled', 'wecomCorpId', 'wecomAgentId', 'wecomSecret', 'wecomToUser'];
      const entries = await Promise.all(
        keys.map(k => prisma.siteSettings.findUnique({ where: { key: k } }))
      );
      // site_settings.value 为 Json 列，enabled 可能是 boolean 或字符串 'true'，其余为字符串
      const raw = entries.map(e => e?.value);
      const enabled = raw[0] === true || raw[0] === 'true';
      const corpId = raw[1] != null ? String(raw[1]) : '';
      const agentId = raw[2] != null ? String(raw[2]) : '';
      const secret = raw[3] != null ? String(raw[3]) : '';

      if (!enabled || !corpId || !agentId || !secret) return null;
      return {
        enabled,
        corpId,
        agentId,
        secret,
        toUser: raw[4] != null ? String(raw[4]) : '@all',
      };
    } finally { await prisma.$disconnect(); }
  } catch (error) {
    console.error('Error fetching WeCom app settings:', error);
    return null;
  }
}

// 获取 access_token（带简单缓存，5分钟内有效）
let _tokenCache: { token: string; expiresAt: number } | null = null;

async function getWeComAccessToken(corpId: string, secret: string): Promise<string | null> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) return _tokenCache.token;

  try {
    const res = await fetch(
      `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${secret}`
    );
    const data = await res.json();
    if (data.errcode !== 0 || !data.access_token) return null;

    _tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000, // 提前5分钟过期
    };
    return data.token;
  } catch { return null; }
}

export async function sendWeComAppNotification(title: string, content: string): Promise<boolean> {
  const settings = await getWeComAppSettings();
  if (!settings?.enabled || !settings.corpId || !settings.agentId || !settings.secret) return false;

  try {
    const accessToken = await getWeComAccessToken(settings.corpId, settings.secret);
    if (!accessToken) return false;

    // 发送文本卡片消息
    const res = await fetch(
      `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touser: settings.toUser,
          msgtype: 'textcard',
          agentid: parseInt(settings.agentId, 10),
          textcard: {
            title: title.substring(0, 48),
            description: content.substring(0, 800),
            url: '',
            btntext: '查看详情',
          },
        }),
      }
    );
    const data = await res.json();
    return data.errcode === 0;
  } catch (error) {
    console.error('Error sending WeCom app notification:', error);
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

    // Also try personal WeChat notification (Server酱) — non-blocking
    try {
      const personalTitle = data.type === 'contact' ? '📬 New Contact Message' : '🛒 New Order';
      const personalContent = markdownContent; // reuse the already-built content
      await sendPersonalWeChatNotification(personalTitle, personalContent);
    } catch {
      /* don't block the main flow */
    }

    // Also try enterprise WeChat application message — non-blocking
    try {
      const appTitle = data.type === 'contact' ? '📬 新联系消息' : '🛒 新订单';
      const appContent = markdownContent;
      await sendWeComAppNotification(appTitle, appContent);
    } catch {
      /* don't block */
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
