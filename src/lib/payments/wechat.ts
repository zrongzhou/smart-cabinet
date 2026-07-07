/**
 * V8 WeChat Pay provider (mock framework).
 *
 * Production integration path (documented, not enabled by default):
 *   1. npm i wechatpay-node-v3
 *   2. Build a native/JS-API payment request with WECHAT_APP_ID / WECHAT_MCH_ID /
 *      WECHAT_API_KEY, return the code_url or prepay_id to the client.
 *   3. Verify the async notification (signature + certificate) in a callback route.
 *
 * Until production keys are configured (WECHAT_ENABLED=true + credentials),
 * the provider runs in mock mode and returns an internal mock-pay URL so the
 * full purchase flow is testable end-to-end.
 */

import { PaymentProvider, CreatePaymentInput, CreatePaymentResult, PaymentMethod } from './types';
import { getWechatConfig } from './config';

export class WechatProvider implements PaymentProvider {
  method: PaymentMethod = 'wechat';

  isMock(): boolean {
    return getWechatConfig().mock;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (this.isMock()) {
      return {
        payUrl: `/checkout/mock-pay?orderId=${encodeURIComponent(input.orderId)}&method=wechat`,
      };
    }

    // === REAL INTEGRATION (wechatpay-node-v3) — scaffold, not executed until enabled ===
    // const wxpay = new WxPay({ appid: WECHAT_APP_ID, mchid: WECHAT_MCH_ID, key: WECHAT_API_KEY, ... });
    // const { code_url } = await wxpay.nativePay({ description: `Order ${input.orderId}`, out_trade_no: input.orderId, amount: { total: Math.round(input.amount * 100) }, ... });
    // return { payUrl: `/checkout/wechat/qr?code=${encodeURIComponent(code_url)}`, transactionId: input.orderId };
    throw new Error('WeChat Pay real integration not configured.');
  }
}
