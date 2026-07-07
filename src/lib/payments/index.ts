/**
 * V8 Payment provider factory.
 *
 * Single entry point used by /api/orders: `getProvider(method)` returns a
 * uniform `PaymentProvider` implementation for any of the four channels.
 */

import { PaymentMethod, PaymentProvider } from './types';
import { StripeProvider } from './stripe';
import { PayPalProvider } from './paypal';
import { WechatProvider } from './wechat';
import { AlipayProvider } from './alipay';

const providers: Record<PaymentMethod, PaymentProvider> = {
  stripe: new StripeProvider(),
  paypal: new PayPalProvider(),
  wechat: new WechatProvider(),
  alipay: new AlipayProvider(),
};

export function getProvider(method: string): PaymentProvider {
  const provider = providers[method as PaymentMethod];
  if (!provider) {
    throw new Error(`Unsupported payment method: ${method}`);
  }
  return provider;
}

export function isSupportedMethod(method: string): method is PaymentMethod {
  return method === 'stripe' || method === 'paypal' || method === 'wechat' || method === 'alipay';
}

export * from './types';
