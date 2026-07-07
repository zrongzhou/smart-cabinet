import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  getStripeConfig,
  getPaypalConfig,
  getWechatConfig,
  getAlipayConfig,
  getProviderConfig,
  getCurrencyForMethod,
  assertRealProvider,
  type PaymentMethod,
} from './config';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('payments/config — mock vs real detection (V8 T3 / Q1)', () => {
  it('stripe is mock when STRIPE_SECRET_KEY is absent', () => {
    expect(getStripeConfig()).toEqual({ mock: true, enabled: false });
  });

  it('stripe is real when STRIPE_SECRET_KEY is present', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
    expect(getStripeConfig()).toEqual({ mock: false, enabled: true });
  });

  it('paypal requires both client id and secret', () => {
    expect(getPaypalConfig()).toEqual({ mock: true, enabled: false });
    vi.stubEnv('PAYPAL_CLIENT_ID', 'cid');
    expect(getPaypalConfig()).toEqual({ mock: true, enabled: false });
    vi.stubEnv('PAYPAL_CLIENT_SECRET', 'csec');
    expect(getPaypalConfig()).toEqual({ mock: false, enabled: true });
  });

  it('wechat stays mock unless explicitly enabled AND has keys', () => {
    expect(getWechatConfig()).toEqual({ mock: true, enabled: false });
    vi.stubEnv('WECHAT_ENABLED', 'true');
    expect(getWechatConfig().enabled).toBe(true);
    expect(getWechatConfig().mock).toBe(true); // keys still missing
    vi.stubEnv('WECHAT_APP_ID', 'appid');
    vi.stubEnv('WECHAT_MCH_ID', 'mch');
    vi.stubEnv('WECHAT_API_KEY', 'key');
    expect(getWechatConfig()).toEqual({ mock: false, enabled: true });
    vi.stubEnv('WECHAT_ENABLED', 'false');
    expect(getWechatConfig().enabled).toBe(false);
  });

  it('alipay mirrors the wechat enable/key logic', () => {
    vi.stubEnv('ALIPAY_ENABLED', 'true');
    vi.stubEnv('ALIPAY_APP_ID', 'aid');
    vi.stubEnv('ALIPAY_PRIVATE_KEY', 'pk');
    vi.stubEnv('ALIPAY_PUBLIC_KEY', 'pub');
    expect(getAlipayConfig()).toEqual({ mock: false, enabled: true });
  });

  it('getProviderConfig delegates per method and defaults for unknown', () => {
    expect(getProviderConfig('stripe').mock).toBe(true);
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk');
    expect(getProviderConfig('stripe').mock).toBe(false);
    expect(getProviderConfig('unknown' as PaymentMethod)).toEqual({ mock: true, enabled: false });
  });

  it('resolves currency by region', () => {
    expect(getCurrencyForMethod('stripe')).toBe('USD');
    expect(getCurrencyForMethod('paypal')).toBe('USD');
    expect(getCurrencyForMethod('wechat')).toBe('CNY');
    expect(getCurrencyForMethod('alipay')).toBe('CNY');
  });

  it('assertRealProvider throws when enabled but credentials missing', () => {
    vi.stubEnv('WECHAT_ENABLED', 'true'); // no keys
    expect(() => assertRealProvider('wechat')).toThrow(/enabled but its credentials are missing/i);
  });

  it('assertRealProvider does not throw when fully configured', () => {
    vi.stubEnv('WECHAT_ENABLED', 'true');
    vi.stubEnv('WECHAT_APP_ID', 'appid');
    vi.stubEnv('WECHAT_MCH_ID', 'mch');
    vi.stubEnv('WECHAT_API_KEY', 'key');
    expect(() => assertRealProvider('wechat')).not.toThrow();
  });
});
