/**
 * POST /api/admin/services — service-management command endpoint (V8 / T5, Q2).
 *
 * Executes one of the white-listed service actions. Every request is guarded
 * by `requireAdmin` (signed JWT + role=admin) and every action/param is
 * validated against the command whitelist. System commands are run via
 * `execFile` ONLY (no shell string is ever built from user input).
 *
 * Certificate actions:
 *  - GET  (or POST action=list-certificates) → parsed certbot domain list.
 *  - POST action=renew-cert   → certbot renew --cert-name <domain>
 *  - POST action=apply-cert   → certbot certonly --nginx -d <domain> -m <email>
 *  - POST action=upload-cert  → multipart/form-data with cert (.crt/.pem) + key
 *                               (.key); validated, staged safely, nginx reloaded.
 *
 * Request body (JSON):  { action: ServiceAction, params?: ServiceParams }
 * Request body (upload): multipart/form-data { domain, cert, key }
 * Response:      { success: boolean, output?: string, certs?: CertInfo[] } | 400 | 401 | 500
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  requireAdmin,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/auth';
import { ALLOWED_ACTIONS, validateAction, DOMAIN_RE, type ServiceAction, type ServiceParams } from '@/lib/services/commandWhitelist';
import { runCommand } from '@/lib/services/runCommand';
import {
  generateNginxConfig,
  writeNginxConfig,
  reloadNginx,
  restoreDefaultConfig,
  NGINX_CONF_PATH,
} from '@/lib/services/nginxConfig';
import {
  listCertificates,
  renewCertificate,
  applyCertificate,
  uploadCertificate,
  certbotAvailable,
} from '@/lib/services/certificates';

/** Build a human-readable log from a command / reload result. */
function formatResult(r: { stdout: string; stderr: string; code: number }): string {
  const out: string[] = [];
  if (r.stdout && r.stdout.trim()) out.push(r.stdout.trim());
  if (r.stderr && r.stderr.trim()) out.push(r.stderr.trim());
  out.push(`exit code: ${r.code}`);
  return out.join('\n');
}

/** Allowed upload extensions + a tiny PEM sanity check. */
const CERT_EXT = /\.(crt|pem)$/i;
const KEY_EXT = /\.key$/i;
function looksLikePem(content: string, kind: 'cert' | 'key'): boolean {
  if (!content || content.trim().length === 0) return false;
  return kind === 'cert'
    ? /-----BEGIN (CERTIFICATE|TRUSTED CERTIFICATE)-----/.test(content)
    : /-----BEGIN (PRIVATE KEY|RSA PRIVATE KEY|EC PRIVATE KEY|OPENSSH PRIVATE KEY)-----/.test(content);
}

/** Handle a multipart upload-cert request. */
async function handleUpload(request: NextRequest): Promise<NextResponse> {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequestResponse('Invalid multipart form data.');
  }

  const domain = typeof form.get('domain') === 'string' ? String(form.get('domain')).trim() : '';
  if (!DOMAIN_RE.test(domain)) {
    return badRequestResponse('Invalid domain for certificate upload.');
  }

  const certField = form.get('cert');
  const keyField = form.get('key');
  if (!(certField instanceof File) || !(keyField instanceof File)) {
    return badRequestResponse('Both a certificate file and a private key file are required.');
  }

  // Validate file names (defence against weird extensions) and contents.
  const certName = certField.name || '';
  const keyName = keyField.name || '';
  if (!CERT_EXT.test(certName) || !KEY_EXT.test(keyName)) {
    return badRequestResponse('Certificate must be .crt/.pem and key must be .key.');
  }

  const certContent = Buffer.from(await certField.arrayBuffer()).toString('utf8');
  const keyContent = Buffer.from(await keyField.arrayBuffer()).toString('utf8');
  if (!looksLikePem(certContent, 'cert') || !looksLikePem(keyContent, 'key')) {
    return badRequestResponse('Uploaded files do not look like valid PEM certificate / key.');
  }

  const result = await uploadCertificate(domain, certContent, keyContent);
  return NextResponse.json({ success: result.ok, output: result.message });
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return unauthorizedResponse();

  try {
    const { certs, raw, code } = await listCertificates();
    const certbot = await certbotAvailable();
    return NextResponse.json({ success: code === 0, certs, raw, certbotAvailable: certbot });
  } catch (err) {
    return serverErrorResponse(err instanceof Error ? err.message : 'Failed to list certificates.');
  }
}

export async function POST(request: NextRequest) {
  // 1) Admin authorization gate — applies to ALL actions.
  const admin = await requireAdmin(request);
  if (!admin) {
    return unauthorizedResponse();
  }

  // 2) Multipart form → certificate upload path.
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    return handleUpload(request);
  }

  // 3) Parse + basic shape check of the JSON body.
  let body: { action?: unknown; params?: unknown };
  try {
    body = await request.json();
  } catch {
    return badRequestResponse('Invalid JSON body.');
  }

  const { action, params } = body;
  if (typeof action !== 'string' || !ALLOWED_ACTIONS.has(action as ServiceAction)) {
    return badRequestResponse(
      `Invalid or disallowed "action". Allowed: ${[...ALLOWED_ACTIONS].join(', ')}`
    );
  }

  const paramMap: Record<string, unknown> =
    params && typeof params === 'object' ? (params as Record<string, unknown>) : {};

  // 4) White-list + parameter validation (domain / port / email regex).
  const validation = validateAction(action, paramMap);
  if (!validation.ok) {
    return badRequestResponse(validation.error || 'Invalid parameters.');
  }

  const safeParams = paramMap as ServiceParams;

  // 5) Execute the white-listed action.
  try {
    switch (action as ServiceAction) {
      case 'restart-app': {
        const r = await runCommand('pm2', ['restart', 'smart-cabinet']);
        return NextResponse.json({ success: r.code === 0, output: formatResult(r) });
      }

      case 'reload-nginx': {
        const r = await reloadNginx();
        return NextResponse.json({ success: r.ok, output: formatResult(r) });
      }

      case 'renew-ssl': {
        const r = await runCommand('certbot', ['renew']);
        return NextResponse.json({ success: r.code === 0, output: formatResult(r) });
      }

      case 'update-nginx-config': {
        const domain = String(safeParams.domain);
        const port = Number(safeParams.port);
        const sslEmail = safeParams.sslEmail ? String(safeParams.sslEmail) : undefined;

        const content = generateNginxConfig({ domain, port, sslEmail });
        try {
          writeNginxConfig(NGINX_CONF_PATH, content);
        } catch (err) {
          return serverErrorResponse(
            err instanceof Error ? err.message : 'Failed to write nginx config.'
          );
        }
        const r = await reloadNginx();
        return NextResponse.json({ success: r.ok, output: formatResult(r) });
      }

      case 'restore-default-config': {
        const r = await restoreDefaultConfig();
        return NextResponse.json({ success: r.ok, output: formatResult(r) });
      }

      // ── Certificate management ──
      case 'list-certificates': {
        const { certs, raw, code } = await listCertificates();
        return NextResponse.json({ success: code === 0, certs, output: raw });
      }

      case 'renew-cert': {
        const r = await renewCertificate(String(safeParams.domain));
        return NextResponse.json({ success: r.code === 0, output: formatResult(r) });
      }

      case 'apply-cert': {
        const email = safeParams.email ? String(safeParams.email) : String(safeParams.sslEmail || '');
        const r = await applyCertificate(String(safeParams.domain), email);
        return NextResponse.json({ success: r.code === 0, output: formatResult(r) });
      }

      // upload-cert is handled earlier (multipart branch); this is a fallback
      // for a JSON-shaped request which is not supported for uploads.
      case 'upload-cert': {
        return badRequestResponse('upload-cert requires multipart/form-data.');
      }

      default:
        // Unreachable: guarded by ALLOWED_ACTIONS above, but keeps TS happy.
        return badRequestResponse(`Unknown or disallowed action: ${action}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverErrorResponse(message);
  }
}
