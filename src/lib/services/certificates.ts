/**
 * certificates.ts — certbot certificate management helpers (V8.x, Q2).
 *
 * Parses `certbot certificates` output and wraps the certbot lifecycle
 * actions (renew / apply / manual upload) used by the admin "Services"
 * console. Every external command runs through `runCommand` (execFile, no
 * shell), so user-supplied values can never be injected into a shell.
 *
 * SECURITY:
 *  - The `domain` is validated against `DOMAIN_RE` before it reaches any
 *    command argument or file path.
 *  - Uploaded certificates are written ONLY under a fixed staging root
 *    (`CERT_STAGING_ROOT`). The path can never be influenced by user input
 *    beyond the validated domain name (no traversal, no arbitrary write).
 *  - Private keys are written with mode 0600; public certs with 0644.
 */

import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { runCommand, type CommandResult } from './runCommand';
import { reloadNginx } from './nginxConfig';
import { DOMAIN_RE } from './commandWhitelist';

/** One managed certificate. */
export interface CertInfo {
  /** certbot "Certificate Name" (usually the primary domain). */
  name: string;
  /** All SAN domains covered by the certificate. */
  domains: string[];
  /** Raw expiry string as reported by certbot. */
  expiry: string;
  /** VALID / EXPIRED / INVALID / UNKNOWN. */
  status: 'VALID' | 'EXPIRED' | 'INVALID' | 'UNKNOWN';
  /** On-disk certificate path (if reported). */
  certPath?: string;
  /** On-disk private-key path (if reported). */
  keyPath?: string;
}

/** Location certbot stores live certs (override via LETSENCRYPT_LIVE_PATH). */
export const LETSENCRYPT_LIVE_PATH: string =
  process.env.LETSENCRYPT_LIVE_PATH || '/etc/letsencrypt/live';

/** Safe staging root for manually uploaded certificates. */
export const CERT_STAGING_ROOT: string =
  process.env.CERT_STAGING_ROOT || '/var/www/smart-cabinet/.certs';

/** Normalise a parsed, partial cert block into a full CertInfo. */
function finalize(c: Partial<CertInfo>): CertInfo {
  return {
    name: c.name || '',
    domains: c.domains || [],
    expiry: c.expiry || '',
    status: c.status || 'UNKNOWN',
    certPath: c.certPath,
    keyPath: c.keyPath,
  };
}

/**
 * Parse the human-readable output of `certbot certificates`.
 *
 * Example block:
 *   Certificate Name: example.com
 *     Serial Number: 3f...
 *     Key Type: RSA
 *     Domains: example.com www.example.com
 *     Expiry Date: 2024-09-01 12:00:00+00:00 (VALID: 60)
 *     Certificate Path: /etc/letsencrypt/live/example.com/fullchain.pem
 *     Private Key Path: /etc/letsencrypt/live/example.com/privkey.pem
 */
export function parseCertbotCertificates(output: string): CertInfo[] {
  const certs: CertInfo[] = [];
  let current: Partial<CertInfo> | null = null;

  for (const raw of output.split('\n')) {
    const line = raw.trim();

    const nameMatch = line.match(/^Certificate Name:\s*(.+)$/);
    if (nameMatch) {
      if (current && current.name) certs.push(finalize(current));
      current = { name: nameMatch[1].trim(), domains: [], status: 'UNKNOWN' };
      continue;
    }
    if (!current) continue;

    const domainsMatch = line.match(/^Domains:\s*(.+)$/);
    if (domainsMatch) {
      current.domains = domainsMatch[1].split(/\s+/).filter(Boolean);
      continue;
    }

    const expiryMatch = line.match(/^Expiry Date:\s*(.+?)\s*(?:\((.+)\))?$/);
    if (expiryMatch) {
      current.expiry = expiryMatch[1].trim();
      const paren = expiryMatch[2];
      if (paren) {
        if (/expir/i.test(paren)) current.status = 'EXPIRED';
        else if (/invalid/i.test(paren)) current.status = 'INVALID';
        else if (/valid/i.test(paren)) current.status = 'VALID';
      }
      continue;
    }

    const certPathMatch = line.match(/^Certificate Path:\s*(.+)$/);
    if (certPathMatch) {
      current.certPath = certPathMatch[1].trim();
      continue;
    }

    const keyPathMatch = line.match(/^Private Key Path:\s*(.+)$/);
    if (keyPathMatch) {
      current.keyPath = keyPathMatch[1].trim();
      continue;
    }
  }

  if (current && current.name) certs.push(finalize(current));
  return certs;
}

/** Run `certbot certificates` and parse the result. */
export async function listCertificates(): Promise<{
  certs: CertInfo[];
  raw: string;
  code: number;
}> {
  const r: CommandResult = await runCommand('certbot', [
    'certificates',
    '--cert-path',
    LETSENCRYPT_LIVE_PATH,
  ]);
  const certs = parseCertbotCertificates(r.stdout || '');
  return { certs, raw: r.stdout || '', code: r.code };
}

/** Renew a single certificate by name. */
export async function renewCertificate(domain: string): Promise<CommandResult> {
  return runCommand('certbot', ['renew', '--cert-name', domain]);
}

/** Obtain (or overwrite) a certificate for a domain via the nginx plugin. */
export async function applyCertificate(domain: string, email: string): Promise<CommandResult> {
  return runCommand('certbot', [
    'certonly',
    '--nginx',
    '--non-interactive',
    '--agree-tos',
    '-d',
    domain,
    '-m',
    email,
  ]);
}

export interface UploadResult {
  ok: boolean;
  message: string;
  certPath?: string;
  keyPath?: string;
  reload?: { ok: boolean; code: number };
}

/**
 * Write an uploaded certificate + private key into the safe staging root and
 * reload nginx. The `domain` must already be validated by the caller; we still
 * re-check it and confine the write under `CERT_STAGING_ROOT` (no traversal).
 */
export async function uploadCertificate(
  domain: string,
  certContent: string,
  keyContent: string
): Promise<UploadResult> {
  if (!DOMAIN_RE.test(domain)) {
    return { ok: false, message: 'Invalid domain.' };
  }

  const dir = path.join(CERT_STAGING_ROOT, domain);
  // Defence in depth: ensure the resolved directory stays inside the root.
  if (dir !== path.normalize(dir) || !dir.startsWith(CERT_STAGING_ROOT)) {
    return { ok: false, message: 'Invalid certificate path.' };
  }

  try {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    const certPath = path.join(dir, 'fullchain.pem');
    const keyPath = path.join(dir, 'privkey.pem');

    // Public certificate is world-readable; the private key is owner-only.
    writeFileSync(certPath, certContent, { mode: 0o644 });
    writeFileSync(keyPath, keyContent, { mode: 0o600 });

    const reload = await reloadNginx();
    return {
      ok: reload.ok,
      message: reload.ok
        ? '证书已写入安全目录并重新加载 Nginx。'
        : '证书已写入，但 Nginx 重载失败，请手动检查配置。',
      certPath,
      keyPath,
      reload: { ok: reload.ok, code: reload.code },
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Failed to write certificate.',
    };
  }
}
