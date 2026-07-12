/**
 * certificates.ts — nginx SSL certificate management helpers (V8.x, Q2).
 *
 * Reads & writes TLS certificates the way the real server actually stores
 * them: manually uploaded PEM/CRT + KEY files under the nginx ssl directory
 * (default `/etc/nginx/ssl/`, e.g. `<domain>_bundle.pem` + `<domain>.key`).
 *
 * IMPORTANT: certbot is NOT assumed to be installed. The "list" view parses
 * `nginx -T` to discover the real `server { server_name; ssl_certificate;
 * ssl_certificate_key; }` blocks and resolves each certificate's expiry via
 * `openssl x509 -enddate`. If nginx is unavailable it falls back to listing
 * the ssl directory. `renew-cert` / `apply-cert` (certbot-only) probe
 * `which certbot` first and fail gracefully when certbot is missing.
 *
 * SECURITY:
 *  - Every external command runs through `runCommand` (execFile, no shell), so
 *    user-supplied values can never be injected into a shell.
 *  - The `domain` is validated against `DOMAIN_RE` before it reaches any
 *    command argument or file path.
 *  - Uploaded certificates are written ONLY under the confined nginx ssl dir;
 *    the resolved paths are checked to stay inside that directory (no
 *    traversal, no arbitrary write). Private keys are written with mode 0600.
 */

import { writeFileSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
import { runCommand, type CommandResult } from './runCommand';
import { reloadNginx } from './nginxConfig';
import { DOMAIN_RE } from './commandWhitelist';

/** One managed certificate (as discovered from the live nginx config). */
export interface CertInfo {
  /** Primary domain (first `server_name` token). */
  name: string;
  /** All `server_name` tokens for the server block. */
  domains: string[];
  /** On-disk certificate path (from `ssl_certificate`). */
  certPath: string;
  /** On-disk private-key path (from `ssl_certificate_key`). */
  keyPath: string;
  /** Expiry string as reported by `openssl x509 -enddate`. */
  expiry: string;
  /** VALID / EXPIRED / INVALID / UNKNOWN. */
  status: 'VALID' | 'EXPIRED' | 'INVALID' | 'UNKNOWN';
}

/** The directory nginx actually reads certificates from. */
export const NGINX_SSL_DIR: string = process.env.NGINX_SSL_DIR || '/etc/nginx/ssl';

/** Whether a resolved path stays inside the confined nginx ssl directory. */
function isInsideSslDir(p: string): boolean {
  const resolved = path.resolve(p);
  if (resolved !== path.normalize(resolved)) return false;
  const root = path.resolve(NGINX_SSL_DIR);
  return resolved === root || resolved.startsWith(root + path.sep);
}

/**
 * Extract top-level `server { ... }` blocks from an `nginx -T` dump using
 * proper brace matching (so nested `location { ... }` blocks don't break it).
 */
function extractServerBlocks(config: string): string[] {
  const blocks: string[] = [];
  let depth = 0;
  let start = -1;
  let inServer = false;

  for (let i = 0; i < config.length; i++) {
    const ch = config[i];
    if (ch === '{') {
      if (!inServer) {
        const prev = config.slice(Math.max(0, i - 24), i).trim();
        if (/server\s*$/.test(prev)) {
          inServer = true;
          start = i;
        }
      }
      depth++;
    } else if (ch === '}') {
      if (depth > 0) depth--;
      if (inServer && depth === 0) {
        blocks.push(config.slice(start, i + 1));
        inServer = false;
      }
    }
  }
  return blocks;
}

/** Parse a single `server { }` block into a CertInfo (or null if no TLS). */
function parseServerBlock(block: string): CertInfo | null {
  const nameMatch = block.match(/server_name\s+([^;]*);/);
  const certMatch = block.match(/ssl_certificate\s+(\S+);/);
  const keyMatch = block.match(/ssl_certificate_key\s+(\S+);/);
  if (!certMatch || !keyMatch) return null;

  const serverNames = nameMatch
    ? nameMatch[1]
        .split(/\s+/)
        .map((s) => s.replace(/[";]/g, ''))
        .filter(Boolean)
    : [];

  return {
    name: serverNames[0] || '',
    domains: serverNames,
    certPath: certMatch[1],
    keyPath: keyMatch[1],
    expiry: '',
    status: 'UNKNOWN',
  };
}

/** Resolve a certificate's expiry + VALID/EXPIRED status via openssl. */
async function getCertExpiry(
  certPath: string
): Promise<{ expiry: string; status: CertInfo['status'] }> {
  const r = await runCommand('openssl', ['x509', '-enddate', '-noout', '-in', certPath]);
  if (r.code !== 0) return { expiry: '', status: 'UNKNOWN' };
  const m = r.stdout.match(/notAfter=(.+)/);
  const expiry = m ? m[1].trim() : '';
  if (!expiry) return { expiry: '', status: 'UNKNOWN' };
  let parsed: Date | null = null;
  try {
    parsed = new Date(expiry);
  } catch {
    parsed = null;
  }
  if (!parsed || Number.isNaN(parsed.getTime())) return { expiry, status: 'UNKNOWN' };
  return { expiry, status: parsed.getTime() < Date.now() ? 'EXPIRED' : 'VALID' };
}

/** Derive the domain from a cert filename like `<domain>_bundle.pem`. */
function domainFromCertFilename(name: string): string | null {
  const m = name.match(/^(.+?)(?:_bundle)?\.(pem|crt|cer)$/i);
  return m ? m[1] : null;
}

/** Fallback: list certificate files directly from the nginx ssl directory. */
async function fallbackListFromDir(): Promise<{ certs: CertInfo[]; raw: string; code: number }> {
  let files: string[] = [];
  try {
    files = readdirSync(NGINX_SSL_DIR);
  } catch {
    return { certs: [], raw: '', code: 1 };
  }

  const certFiles = files.filter((f) => /\.(pem|crt|cer)$/i.test(f) && !f.toLowerCase().endsWith('.key'));
  const certs: CertInfo[] = [];
  for (const cf of certFiles) {
    const domain = domainFromCertFilename(cf) || cf;
    const certPath = path.join(NGINX_SSL_DIR, cf);
    const keyCandidate = `${domain}.key`;
    const keyPath = files.includes(keyCandidate) ? path.join(NGINX_SSL_DIR, keyCandidate) : '';
    const { expiry, status } = await getCertExpiry(certPath);
    certs.push({
      name: domain,
      domains: [domain],
      certPath,
      keyPath,
      expiry,
      status,
    });
  }
  return { certs, raw: `Listed ${NGINX_SSL_DIR}`, code: 0 };
}

/** List the live certificates from the real nginx configuration. */
export async function listCertificates(): Promise<{
  certs: CertInfo[];
  raw: string;
  code: number;
}> {
  const nginx = await runCommand('nginx', ['-T']);
  if (nginx.code === 0 && nginx.stdout) {
    const blocks = extractServerBlocks(nginx.stdout);
    const parsed = blocks.map(parseServerBlock).filter((b): b is CertInfo => b !== null);

    // De-duplicate by certificate path (one server block per file).
    const seen = new Set<string>();
    const certs: CertInfo[] = [];
    for (const c of parsed) {
      if (seen.has(c.certPath)) continue;
      seen.add(c.certPath);
      const { expiry, status } = await getCertExpiry(c.certPath);
      certs.push({ ...c, expiry, status });
    }
    return { certs, raw: nginx.stdout, code: 0 };
  }

  // nginx not available (e.g. local dev) → fall back to directory listing.
  return fallbackListFromDir();
}

/**
 * Whether certbot is installed on the host. Exported so the service API can
 * surface this to the front-end (e.g. to disable certbot-only actions when it
 * is missing and force manual certificate uploads).
 */
export async function certbotAvailable(): Promise<boolean> {
  const r = await runCommand('which', ['certbot']);
  return r.code === 0 && r.stdout.trim().length > 0;
}

/** Renew a single certificate by name (certbot only). */
export async function renewCertificate(domain: string): Promise<CommandResult> {
  if (!(await certbotAvailable())) {
    return { stdout: '', stderr: 'certbot 未安装，请使用手动上传证书', code: 1 };
  }
  return runCommand('certbot', ['renew', '--cert-name', domain]);
}

/** Obtain (or overwrite) a certificate for a domain via the nginx plugin. */
export async function applyCertificate(domain: string, email: string): Promise<CommandResult> {
  if (!(await certbotAvailable())) {
    return { stdout: '', stderr: 'certbot 未安装，请使用手动上传证书', code: 1 };
  }
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
 * Resolve the exact on-disk paths to write for a domain:
 *  - if the domain's server block already references a real `ssl_certificate`
 *    / `ssl_certificate_key` under the confined ssl dir, reuse those paths
 *    (preserves the existing filename, e.g. `<domain>_bundle.crt`);
 *  - otherwise default to `<domain>_bundle.pem` + `<domain>.key`.
 */
async function resolveUploadPaths(domain: string): Promise<{ certPath: string; keyPath: string }> {
  const nginx = await runCommand('nginx', ['-T']);
  if (nginx.code === 0 && nginx.stdout) {
    const blocks = extractServerBlocks(nginx.stdout);
    for (const b of blocks) {
      const info = parseServerBlock(b);
      if (
        info &&
        info.domains.includes(domain) &&
        info.certPath &&
        info.keyPath &&
        isInsideSslDir(info.certPath) &&
        isInsideSslDir(info.keyPath)
      ) {
        return { certPath: info.certPath, keyPath: info.keyPath };
      }
    }
  }
  return {
    certPath: path.join(NGINX_SSL_DIR, `${domain}_bundle.pem`),
    keyPath: path.join(NGINX_SSL_DIR, `${domain}.key`),
  };
}

/**
 * Write an uploaded certificate + private key into the REAL nginx ssl
 * directory (reusing the configured filename when known) and reload nginx.
 * The `domain` must already be validated by the caller; we still re-check it
 * and confine the write under `NGINX_SSL_DIR` (no traversal, no arbitrary
 * write). Private keys are written with mode 0600.
 */
export async function uploadCertificate(
  domain: string,
  certContent: string,
  keyContent: string
): Promise<UploadResult> {
  if (!DOMAIN_RE.test(domain)) {
    return { ok: false, message: 'Invalid domain.' };
  }

  try {
    mkdirSync(NGINX_SSL_DIR, { recursive: true, mode: 0o755 });
  } catch {
    // Directory may already exist; ignore.
  }

  const { certPath, keyPath } = await resolveUploadPaths(domain);
  if (!isInsideSslDir(certPath) || !isInsideSslDir(keyPath)) {
    return { ok: false, message: 'Refused: target path is outside the nginx ssl directory.' };
  }

  try {
    // Public certificate is world-readable; the private key is owner-only.
    writeFileSync(certPath, certContent, { mode: 0o644 });
    writeFileSync(keyPath, keyContent, { mode: 0o600 });

    const reload = await reloadNginx();
    return {
      ok: reload.ok,
      message: reload.ok
        ? '证书已写入真实 Nginx SSL 目录并重新加载。'
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
