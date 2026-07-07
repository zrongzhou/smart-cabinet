/**
 * V8 Alipay provider (mock framework).
 *
 * Production integration path (documented, not enabled by default):
 *   1. npm i alipay-sdk
 *   2. Build a page/wap payment form with ALIPAY_APP_ID / ALIPAY_PRIVATE_KEY /
 *      ALIPAY_PUBLIC_KEY, return the redirect URL / form to the client.
 *   3. Verify the async notification (signature) in a callback route.
 *
 * Until production keys are configured (ALIPAY_ENABLED=true + credentials),
 * the provider runs in mock mode and returns an internal mock-pay URL.
 */

import { PaymentProvider, CreatePaymentInput, CreatePaymentResult, PaymentMethod } from './types';
import { getAlipayConfig } from './config';

export class AlipayProvider implements PaymentProvider {
  method: PaymentMethod = 'alipay';

  isMock(): boolean {
    return getAlipayConfig().mock;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (this.isMock()) {
      return {
        payUrl: `/checkout/mock-pay?orderId=${encodeURIComponent(input.orderId)}&method=alipay`,
      };
    }

    // === REAL INTEGRATION (alipay-sdk) — scaffold, not executed until enabled ===
    // const alipay = new AlipaySdk({ appId: ALIPAY_APP_ID, privateKey: ALIPAY_PRIVATE_KEY, alipayPublicKey: ALIPAY_PUBLIC_KEY });
    // const url = alipay.pageExecute('alipay.trade.page.pay', { bizContent: { out_trade_no: input.orderId, total_amount: input.amount.toFixed(2), subject: `Order ${input.orderId}`, product_code: 'FAST_INSTANT_TRADE_PAY' } });
    // return { payUrl: url, transactionId: input.orderId };
    throw new Error('Alipay real integration not configured.');
  }
}
