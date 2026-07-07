/**
 * V8 Payment configuration.
 *
 * Reads environment variables and exposes a single source of truth for:
 *  - whether each payment provider runs in `mock` (no real keys) or `real` mode
 *  - the default currency for a given locale / region
 *
 * IMPORTANT: When a real provider is explicitly enabled (e.g. WECHAT_ENABLED=true)
 * but its required keys are missing, we throw at runtime (never silently succeed)
 * so the misconfiguration is caught immediately instead of producing a broken checkout.
 */

export type PaymentMethod = 'stripe' | 'paypal' | 'wechat' | 'alipay';

export interface ProviderConfig {
  /** True when no real credentials are present and we should use the mock flow. */
  mock: boolean;
  /** True when the operator explicitly flipped the enable flag. */
  enabled: boolean;
}

function envBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1' || value === 'yes';
}

export function getStripeConfig(): ProviderConfig {
  const secret = process.env.STRIPE_SECRET_KEY;
  const enabled = !!secret;
  return { mock: !enabled, enabled };
}

export function getPaypalConfig(): ProviderConfig {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  const enabled = !!clientId && !!secret;
  return { mock: !enabled, enabled };
}

export function getWechatConfig(): ProviderConfig {
  const enabled = envBool(process.env.WECHAT_ENABLED);
  const hasKeys = !!process.env.WECHAT_APP_ID && !!process.env.WECHAT_MCH_ID && !!process.env.WECHAT_API_KEY;
  // When explicitly enabled, keys are required; otherwise fall back to mock.
  return { mock: !enabled || !hasKeys, enabled };
}

export function getAlipayConfig(): ProviderConfig {
  const enabled = envBool(process.env.ALIPAY_ENABLED);
  const hasKeys = !!process.env.ALIPAY_APP_ID && !!process.env.ALIPAY_PRIVATE_KEY && !!process.env.ALIPAY_PUBLIC_KEY;
  return { mock: !enabled || !hasKeys, enabled };
}

export function getProviderConfig(method: PaymentMethod): ProviderConfig {
  switch (method) {
    case 'stripe':
      return getStripeConfig();
    case 'paypal':
      return getPaypalConfig();
    case 'wechat':
      return getWechatConfig();
    case 'alipay':
      return getAlipayConfig();
    default:
      return { mock: true, enabled: false };
  }
}

/**
 * Resolve the currency for an order based on method / locale.
 * Stripe & PayPal default to USD; domestic channels use CNY.
 */
export function getCurrencyForMethod(method: PaymentMethod): string {
  if (method === 'wechat' || method === 'alipay') return 'CNY';
  return 'USD';
}

/**
 * Validate that a provider is correctly configured for a REAL charge.
 * Throws if the operator enabled a provider but forgot its credentials.
 */
export function assertRealProvider(method: PaymentMethod): void {
  const config = getProviderConfig(method);
  if (config.enabled && config.mock) {
    throw new Error(
      `Payment provider "${method}" is enabled but its credentials are missing. ` +
        `Provide the required environment variables or set it to mock mode.`
    );
  }
}
