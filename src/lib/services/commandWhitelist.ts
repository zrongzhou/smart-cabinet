/**
 * commandWhitelist.ts — Service-management command whitelist (V8 / T5, Q2).
 *
 * Defines the exact set of operations the admin "Services" console is allowed
 * to trigger, and validates the user-supplied parameters (domain / port /
 * email) with strict regex checks before any system command is executed.
 *
 * SECURITY CONTRACT (see ARCHITECTURE-V8 §7.7):
 *  - Only the actions listed in `ALLOWED_ACTIONS` may run — anything else is
 *    rejected with 400 and NEVER reaches `execFile`.
 *  - Every parameter that flows into a system command is validated here.
 *  - No shell string is ever built from user input; `runCommand` uses
 *    `child_process.execFile(cmd, [args])` exclusively.
 */

/** The white-listed service actions (incl. certificate management). */
export type ServiceAction =
  | 'restart-app'
  | 'reload-nginx'
  | 'renew-ssl'
  | 'update-nginx-config'
  | 'restore-default-config'
  // Certificate management (certbot + manual upload)
  | 'list-certificates'
  | 'renew-cert'
  | 'apply-cert'
  | 'upload-cert';

/**
 * White-listed actions. Kept as a frozen Set so callers can do `has()` and the
 * set cannot be mutated at runtime.
 */
export const ALLOWED_ACTIONS: ReadonlySet<ServiceAction> = new Set<ServiceAction>([
  'restart-app', // pm2 restart smart-cabinet
  'reload-nginx', // nginx -t && nginx -s reload
  'renew-ssl', // certbot renew
  'update-nginx-config', // write white-listed file then reload
  'restore-default-config', // copy built-in template then reload
  // Certificate management
  'list-certificates', // return parsed certbot domain list (GET or POST)
  'renew-cert', // certbot renew --cert-name <domain>
  'apply-cert', // certbot certonly --nginx -d <domain> -m <email>
  'upload-cert', // multipart: validate + stage cert/key then reload nginx
]);

/** Parameters accepted (and validated) by the service actions. */
export interface ServiceParams {
  domain?: string;
  port?: number | string;
  sslEmail?: string;
  /** Notification email used by `apply-cert` (same shape as `sslEmail`). */
  email?: string;
}

/** Result of `validateAction`. */
export interface ValidationResult {
  ok: boolean;
  error?: string;
}

/** Domain: one or more labels ending in a 2+ letter TLD. Case-insensitive. */
export const DOMAIN_RE = /^([a-z0-9-]+\.)+[a-z]{2,}$/i;

/** Simple, pragmatic email check (not RFC-perfect, enough to block junk). */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Inclusive port range allowed for the site config. */
export const PORT_MIN = 80;
export const PORT_MAX = 65535;

/** Parameter keys that are permitted at all (others are rejected). */
const KNOWN_PARAM_KEYS = new Set(['domain', 'port', 'sslEmail', 'email']);

function coercePort(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function validateDomain(value: unknown): string | null {
  if (typeof value !== 'string' || !DOMAIN_RE.test(value)) {
    return `Invalid domain: "${String(value)}"`;
  }
  return null;
}

function validatePort(value: unknown): string | null {
  const n = coercePort(value);
  if (n === null || !Number.isInteger(n) || n < PORT_MIN || n > PORT_MAX) {
    return `Invalid port: "${String(value)}" (must be an integer between ${PORT_MIN} and ${PORT_MAX})`;
  }
  return null;
}

function validateEmail(value: unknown): string | null {
  if (typeof value !== 'string' || !EMAIL_RE.test(value)) {
    return `Invalid SSL email: "${String(value)}"`;
  }
  return null;
}

/**
 * Validate an action and its parameters.
 *
 * @param action  The requested action (must be in `ALLOWED_ACTIONS`).
 * @param params  Optional user-supplied parameters (domain / port / sslEmail).
 * @returns       `{ ok: true }` or `{ ok: false, error }`.
 */
export function validateAction(
  action: string,
  params: Record<string, unknown> = {}
): ValidationResult {
  // 1) Action must be in the whitelist.
  if (!ALLOWED_ACTIONS.has(action as ServiceAction)) {
    return {
      ok: false,
      error: `Unknown or disallowed action: "${action}". Allowed: ${[
        ...ALLOWED_ACTIONS,
      ].join(', ')}`,
    };
  }

  const p = params || {};

  // 2) Reject any parameter key we do not recognise (defence in depth).
  for (const key of Object.keys(p)) {
    if (!KNOWN_PARAM_KEYS.has(key)) {
      return { ok: false, error: `Unexpected parameter: "${key}"` };
    }
  }

  // 3) Validate any provided field against its rule.
  if (p.domain !== undefined && p.domain !== null && p.domain !== '') {
    const err = validateDomain(p.domain);
    if (err) return { ok: false, error: err };
  }
  if (p.port !== undefined && p.port !== null && p.port !== '') {
    const err = validatePort(p.port);
    if (err) return { ok: false, error: err };
  }
  if (p.sslEmail !== undefined && p.sslEmail !== null && p.sslEmail !== '') {
    const err = validateEmail(p.sslEmail);
    if (err) return { ok: false, error: err };
  }
  if (p.email !== undefined && p.email !== null && p.email !== '') {
    const err = validateEmail(p.email);
    if (err) return { ok: false, error: err };
  }

  // 4) Action-specific requirements.
  if (action === 'update-nginx-config') {
    const domainErr = validateDomain(p.domain);
    if (domainErr) return { ok: false, error: `update-nginx-config requires a valid "domain".` };
    const portErr = validatePort(p.port);
    if (portErr) return { ok: false, error: `update-nginx-config requires a valid "port" (${PORT_MIN}-${PORT_MAX}).` };
    const emailErr = validateEmail(p.sslEmail);
    if (emailErr) return { ok: false, error: `update-nginx-config requires a valid "sslEmail".` };
  }

  // Certificate actions.
  if (action === 'renew-cert') {
    const domainErr = validateDomain(p.domain);
    if (domainErr) return { ok: false, error: `renew-cert requires a valid "domain".` };
  }
  if (action === 'apply-cert') {
    const domainErr = validateDomain(p.domain);
    if (domainErr) return { ok: false, error: `apply-cert requires a valid "domain".` };
    const emailErr = validateEmail(p.email ?? p.sslEmail);
    if (emailErr) return { ok: false, error: `apply-cert requires a valid "email".` };
  }
  if (action === 'upload-cert') {
    const domainErr = validateDomain(p.domain);
    if (domainErr) return { ok: false, error: `upload-cert requires a valid "domain".` };
  }
  // `list-certificates` accepts no parameters.

  return { ok: true };
}
