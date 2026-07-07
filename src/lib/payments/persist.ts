/**
 * V8 Payment persistence helpers.
 *
 * Centralizes the logic that marks an order (and its Payment row) as paid.
 * Used by both real webhooks and the mock callback, so the result is identical
 * regardless of provider. Webhook idempotency is enforced by the unique
 * constraint on (method, transactionId) in the Payment model.
 */

import { prisma } from '@/lib/prisma';

export interface FinalizePaymentInput {
  orderId: string;
  method: string;
  transactionId: string;
  amount: number;
  currency?: string;
  rawPayload?: unknown;
}

/**
 * Mark the order paid and upsert the Payment row.
 * Returns { alreadyPaid, ok }.
 */
export async function finalizePayment(input: FinalizePaymentInput): Promise<{ ok: boolean; alreadyPaid: boolean }> {
  const { orderId, method, transactionId, amount, currency = 'USD', rawPayload } = input;

  // Idempotency: if this (method, transactionId) is already recorded as paid, skip.
  const existing = await prisma.payment.findUnique({
    where: { method_transactionId: { method, transactionId } },
  });
  if (existing && (existing.status === 'paid')) {
    return { ok: true, alreadyPaid: true };
  }

  // Upsert Payment row.
  await prisma.payment.upsert({
    where: { method_transactionId: { method, transactionId } },
    create: {
      orderId,
      method,
      status: 'paid',
      amount,
      currency,
      transactionId,
      rawPayload: rawPayload as object | undefined,
    },
    update: {
      status: 'paid',
      amount,
      currency,
      transactionId,
      rawPayload: rawPayload as object | undefined,
    },
  });

  // Update the order.
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'paid',
      paidAt: new Date(),
      transactionId,
    },
  });

  return { ok: true, alreadyPaid: false };
}
