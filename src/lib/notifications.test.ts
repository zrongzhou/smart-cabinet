/**
 * notifications.test.ts — Round G (feature A) routing tests.
 *
 * Verifies that `sendNotification` routes contact-form inquiries to the new
 * personal WeChat push service (and is fire-and-forget / never throws), while
 * order notifications do NOT trigger the personal push.
 *
 * The `PersonalWechatPushService` is mocked so we can spy on `pushContact`.
 * Prisma is mocked so the legacy enterprise-WeChat channel is skipped (no DB).
 */

const hoisted = vi.hoisted(() => ({ pushContactSpy: vi.fn() }));

vi.mock('@/lib/services/personalWechatPush', () => ({
  PersonalWechatPushService: class {
    pushContact = hoisted.pushContactSpy;
  },
}));

vi.mock('@prisma/client', () => {
  class PrismaClient {
    siteSettings = {
      findUnique: async () => null,
      upsert: async () => ({ key: 'k', value: null }),
    };
    $disconnect = async () => {};
  }
  return { PrismaClient };
});

import { sendNotification } from '@/lib/notifications';
import type { ContactNotificationData, OrderNotificationData } from '@/lib/notifications';

const contactData: ContactNotificationData = {
  type: 'contact',
  id: 7,
  name: 'Bob Contact',
  email: 'bob@example.com',
  phone: null,
  subject: 'sales',
  message: 'I would like a quote for 10 cabinets.',
  locale: 'en',
  createdAt: new Date('2026-07-12T09:00:00Z'),
};

const orderData: OrderNotificationData = {
  type: 'order',
  id: 'ORD-1001',
  customerName: 'Carol Order',
  customerEmail: 'carol@example.com',
  total: 199.99,
  status: 'paid',
  itemCount: 3,
  createdAt: new Date('2026-07-12T09:30:00Z'),
};

beforeEach(() => {
  hoisted.pushContactSpy.mockReset();
  hoisted.pushContactSpy.mockResolvedValue(undefined);
});

describe('sendNotification → personal WeChat push routing', () => {
  it('routes a contact notification to PersonalWechatPushService.pushContact', async () => {
    await sendNotification(contactData);
    expect(hoisted.pushContactSpy).toHaveBeenCalledTimes(1);
    expect(hoisted.pushContactSpy).toHaveBeenCalledWith(contactData);
  });

  it('does NOT call pushContact for an order notification', async () => {
    await sendNotification(orderData);
    expect(hoisted.pushContactSpy).not.toHaveBeenCalled();
  });

  it('never throws to the caller, even if pushContact rejects', async () => {
    hoisted.pushContactSpy.mockRejectedValue(new Error('push exploded'));
    await expect(sendNotification(contactData)).resolves.toBeUndefined();
    expect(hoisted.pushContactSpy).toHaveBeenCalledTimes(1);
  });
});
