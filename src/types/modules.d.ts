// Ambient module declarations for third-party packages that do not ship their
// own TypeScript type definitions. Centralizing them here avoids sprinkling
// `any` casts across the integration code.
//
// `@paypal/checkout-server-sdk` has no bundled types; the PayPal integration
// (src/lib/payments/paypal.ts) only uses it at runtime, so a loose module
// declaration is sufficient for the build to pass.
declare module '@paypal/checkout-server-sdk';
