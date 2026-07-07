/**
 * POST /api/admin/services — service-management command endpoint (V8 / T5, Q2).
 *
 * Executes one of the five white-listed service actions. Every request is
 * guarded by `requireAdmin` (signed JWT + role=admin) and every action/param
 * is validated against the command whitelist. System commands are run via
 * `execFile` ONLY (no shell string is ever built from user input).
 *
 * Request body:  { action: ServiceAction, params?: ServiceParams }
 * Response:      { success: boolean, output: string }  | 400 | 401 | 500
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  requireAdmin,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/auth';
import { ALLOWED_ACTIONS, validateAction, type ServiceAction, type ServiceParams } from '@/lib/services/commandWhitelist';
import { runCommand } from '@/lib/services/runCommand';
import {
  generateNginxConfig,
  writeNginxConfig,
  reloadNginx,
  restoreDefaultConfig,
  NGINX_CONF_PATH,
} from '@/lib/services/nginxConfig';

/** Build a human-readable log from a command / reload result. */
function formatResult(r: { stdout: string; stderr: string; code: number }): string {
  const out: string[] = [];
  if (r.stdout && r.stdout.trim()) out.push(r.stdout.trim());
  if (r.stderr && r.stderr.trim()) out.push(r.stderr.trim());
  out.push(`exit code: ${r.code}`);
  return out.join('\n');
}

export async function POST(request: NextRequest) {
  // 1) Admin authorization gate — applies to ALL actions.
  const admin = await requireAdmin(request);
  if (!admin) {
    return unauthorizedResponse();
  }

  // 2) Parse + basic shape check of the request body.
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

  // 3) White-list + parameter validation (domain / port / email regex).
  const validation = validateAction(action, paramMap);
  if (!validation.ok) {
    return badRequestResponse(validation.error || 'Invalid parameters.');
  }

  const safeParams = paramMap as ServiceParams;

  // 4) Execute the white-listed action.
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

      default:
        // Unreachable: guarded by ALLOWED_ACTIONS above, but keeps TS happy.
        return badRequestResponse(`Unknown or disallowed action: ${action}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return serverErrorResponse(message);
  }
}
