import { describe, it, expect } from 'vitest';
import { getProvider, isSupportedMethod } from './index';

describe('payments factory (V8 T3)', () => {
  it('returns the correct provider instance per method', () => {
    expect(getProvider('stripe').method).toBe('stripe');
    expect(getProvider('paypal').method).toBe('paypal');
    expect(getProvider('wechat').method).toBe('wechat');
    expect(getProvider('alipay').method).toBe('alipay');
  });

  it('throws on an unsupported method', () => {
    expect(() => getProvider('bitcoin')).toThrow(/Unsupported payment method: bitcoin/);
  });

  it('isSupportedMethod guards the valid set', () => {
    expect(isSupportedMethod('stripe')).toBe(true);
    expect(isSupportedMethod('alipay')).toBe(true);
    expect(isSupportedMethod('bitcoin')).toBe(false);
  });

  it('returned providers expose isMock + createPayment', () => {
    const p = getProvider('stripe');
    expect(typeof p.isMock).toBe('function');
    expect(typeof p.createPayment).toBe('function');
  });
});
