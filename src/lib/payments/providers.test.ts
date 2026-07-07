import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StripeProvider } from './stripe';
import { PayPalProvider } from './paypal';
import { WechatProvider } from './wechat';
import { AlipayProvider } from './alipay';
import { getProvider } from './index';
import type { CreatePaymentInput } from './types';

afterEach(() => vi.unstubAllEnvs());

// Force mock mode regardless of any ambient environment variables.
beforeEach(() => {
  vi.stubEnv('STRIPE_SECRET_KEY', '');
  vi.stubEnv('PAYPAL_CLIENT_ID', '');
  vi.stubEnv('PAYPAL_CLIENT_SECRET', '');
  vi.stubEnv('WECHAT_ENABLED', '');
  vi.stubEnv('ALIPAY_ENABLED', '');
});

function baseInput(method: any): CreatePaymentInput {
  return { orderId: 'ORD 1/2', amount: 19.99, currency: 'USD', method };
}

describe('payment providers — mock mode (V8 T3)', () => {
  it('stripe returns a mock-pay URL encoding the order id', async () => {
    const p = new StripeProvider();
    expect(p.isMock()).toBe(true);
    const r = await p.createPayment(baseInput('stripe'));
    expect(r.payUrl).toContain('/checkout/mock-pay');
    expect(r.payUrl).toContain('orderId=' + encodeURIComponent('ORD 1/2'));
    expect(r.payUrl).toContain('method=stripe');
  });

  it('paypal returns a mock-pay URL', async () => {
    const p = new PayPalProvider();
    const r = await p.createPayment(baseInput('paypal'));
    expect(r.payUrl).toContain('method=paypal');
    expect(r.payUrl).toContain(encodeURIComponent('ORD 1/2'));
  });

  it('wechat returns a mock-pay URL', async () => {
    const p = new WechatProvider();
    const r = await p.createPayment(baseInput('wechat'));
    expect(r.payUrl).toContain('method=wechat');
  });

  it('alipay returns a mock-pay URL', async () => {
    const p = new AlipayProvider();
    const r = await p.createPayment(baseInput('alipay'));
    expect(r.payUrl).toContain('method=alipay');
  });

  it('factory createPayment works end-to-end in mock mode', async () => {
    const r = await getProvider('stripe').createPayment(baseInput('stripe'));
    expect(r.payUrl).toContain('/checkout/mock-pay');
  });
});
