/**
 * httpsRedirect.ts — "Force HTTPS" redirect toggle service (Round G, feature B).
 *
 * Manages the HTTP→HTTPS `return 301` directive in the live nginx config. The
 * authoritative state is ALWAYS the real nginx config on disk (we never store a
 * separate "desired" flag that could drift).
 *
 * `setRedirect(enabled)` performs the safe, audited sequence:
 *   read → backup(.bak) → apply toggle → write → nginx -t → nginx -s reload
 * On `nginx -t` failure (or reload failure) the ORIGINAL config is written back
 * and we do NOT reload, so the live site keeps its previous behaviour. Every
 * change is appended to the `audit.httpsRedirect` SiteSettings array.
 *
 * SECURITY: reuses nginxConfig's white-listed writer + reloadNginx; every
 * external command goes through `runCommand` (execFile, no shell).
 */

import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import {
  NGINX_CONF_PATH,
  writeNginxConfig,
  writeNginxBackup,
  reloadNginx,
} from '@/lib/services/nginxConfig';
import { HTTPS_REDIRECT_AUDIT_KEY } from '@/lib/notify-types';

/** The toggle marker line; present => HTTPS is enforced. */
const REDIRECT_DIRECTIVE = 'return 301 https://$host$request_uri;';

/** Matches the HTTP→HTTPS redirect line (whitespace tolerant). */
const REDIRECT_RE = /[ \t]*return\s+301\s+https:\/\/\$host\$request_uri;[ \t]*\n?/;

export interface SetRedirectResult {
  ok: boolean;
  enabled: boolean;
  reloaded: boolean;
  rolledBack: boolean;
  backupPath?: string;
  nginxError?: string;
  message: string;
}

/**
 * HttpsRedirectService — reads/writes the live nginx "Force HTTPS" switch.
 */
export class HttpsRedirectService {
  /** Read the REAL redirect state from the live nginx config. */
  async getState(): Promise<boolean> {
    let cfg: string;
    try {
      cfg = readFileSync(NGINX_CONF_PATH, 'utf8');
    } catch (err) {
      console.error('[httpsRedirect] cannot read nginx config, defaulting state to ON:', err);
      // Conservative: assume HTTPS is enforced so the UI does not invite a
      // misconfiguration that would expose the site over plain HTTP.
      return true;
    }
    const http = this.parseHttpBlock(cfg);
    if (!http) return true;
    return REDIRECT_RE.test(http.block);
  }

  /**
   * Enable/disable the HTTP→HTTPS redirect.
   * @param enabled  desired state
   * @param actor    admin username (for the audit log)
   */
  async setRedirect(enabled: boolean, actor?: string | null): Promise<SetRedirectResult> {
    let current: string;
    try {
      current = readFileSync(NGINX_CONF_PATH, 'utf8');
    } catch (err) {
      return {
        ok: false,
        enabled,
        reloaded: false,
        rolledBack: false,
        message:
          err instanceof Error ? `无法读取 nginx 配置：${err.message}` : '无法读取 nginx 配置。',
      };
    }

    const port = this.detectAppPort(current);
    let next: string;
    try {
      next = this.applyToggle(current, enabled, port);
    } catch (err) {
      return {
        ok: false,
        enabled,
        reloaded: false,
        rolledBack: false,
        message: err instanceof Error ? err.message : '无法应用配置变更。',
      };
    }

    // Backup the ORIGINAL config before touching the live file.
    let backupPath: string;
    try {
      backupPath = writeNginxBackup(NGINX_CONF_PATH, current);
    } catch (err) {
      return {
        ok: false,
        enabled,
        reloaded: false,
        rolledBack: false,
        message: err instanceof Error ? err.message : '无法写入备份文件。',
      };
    }

    // Write the new config.
    try {
      writeNginxConfig(NGINX_CONF_PATH, next);
    } catch (err) {
      await this.audit(actor, enabled, 'fail', `write failed: ${errMsg(err)}`);
      return {
        ok: false,
        enabled,
        reloaded: false,
        rolledBack: false,
        backupPath,
        message: err instanceof Error ? err.message : '无法写入 nginx 配置。',
      };
    }

    // Test (nginx -t) then reload.
    const reload = await reloadNginx();
    if (!reload.ok) {
      // Roll back to the original content. NOTE: do NOT reload after rollback —
      // the site keeps its previous (working) behaviour.
      try {
        writeNginxConfig(NGINX_CONF_PATH, current);
      } catch (rollbackErr) {
        console.error('[httpsRedirect] rollback write failed:', rollbackErr);
      }
      const nginxError = (reload.stderr || reload.stdout || '').slice(0, 2000);
      await this.audit(actor, enabled, 'fail', `nginx -t failed: ${nginxError}`);
      return {
        ok: false,
        enabled,
        reloaded: false,
        rolledBack: true,
        backupPath,
        nginxError,
        message: 'nginx -t 校验未通过，已回滚，未影响线上。请检查配置后重试。',
      };
    }

    await this.audit(actor, enabled, 'ok', reload.stdout.slice(0, 500));
    return {
      ok: true,
      enabled,
      reloaded: true,
      rolledBack: false,
      backupPath,
      message: '配置已生效（已 reload nginx）。',
    };
  }

  // ── internals ──

  /** Locate the HTTP (listen 80) server block with exact substring bounds. */
  private parseHttpBlock(cfg: string): { block: string; start: number; end: number } | null {
    const blocks = this.extractServerBlocks(cfg);
    for (const b of blocks) {
      if (/\blisten\s+80\s*;/.test(b.block)) return b;
    }
    return null;
  }

  /** Extract every top-level `server { ... }` block with its bounds. */
  private extractServerBlocks(
    cfg: string
  ): { block: string; start: number; end: number }[] {
    const out: { block: string; start: number; end: number }[] = [];
    let inServer = false;
    let start = -1;
    let depth = 0;
    for (let i = 0; i < cfg.length; i++) {
      const ch = cfg[i];
      if (ch === '{') {
        if (!inServer) {
          const prev = cfg.slice(Math.max(0, i - 24), i).trim();
          if (/server\s*$/.test(prev)) {
            inServer = true;
            start = cfg.lastIndexOf('server', i);
            depth = 0;
          }
        }
        depth++;
      } else if (ch === '}') {
        if (depth > 0) depth--;
        if (inServer && depth === 0) {
          out.push({ block: cfg.slice(start, i + 1), start, end: i + 1 });
          inServer = false;
        }
      }
    }
    return out;
  }

  /** Apply (or remove) the `return 301` toggle inside the http server block. */
  private applyToggle(cfg: string, enabled: boolean, port: number): string {
    const http = this.parseHttpBlock(cfg);
    if (!http) {
      throw new Error('Could not locate the HTTP (listen 80) server block in the nginx config.');
    }
    let block = http.block;
    if (enabled) {
      // Ensure the redirect marker is present (insert after the server_name line).
      if (!REDIRECT_RE.test(block)) {
        block = block.replace(
          /(server_name\s+[^;]*;)/,
          (m) => `${m}\n    ${REDIRECT_DIRECTIVE}`
        );
      }
      // Remove any dormant proxy `location /` (redirect short-circuits anyway).
      block = this.setHttpProxyLocation(block, null);
    } else {
      // Remove the redirect marker, keep/ensure a proxy `location /` so HTTP
      // serves the app directly instead of 404-ing.
      block = block.replace(REDIRECT_RE, '');
      block = block.replace(/\n{3,}/g, '\n\n');
      block = this.setHttpProxyLocation(block, port);
    }
    return cfg.slice(0, http.start) + block + cfg.slice(http.end);
  }

  /** Build the proxy `location /` block used when HTTPS redirect is OFF. */
  private buildProxyLocation(port: number): string {
    return [
      '    location / {',
      '        client_max_body_size 50m;',
      `        proxy_pass http://localhost:${port};`,
      '        proxy_http_version 1.1;',
      "        proxy_set_header Upgrade $http_upgrade;",
      "        proxy_set_header Connection 'upgrade';",
      '        proxy_set_header Host $host;',
      '        proxy_set_header X-Real-IP $remote_addr;',
      '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
      '        proxy_set_header X-Forwarded-Proto $scheme;',
      '        proxy_connect_timeout 60s;',
      '        proxy_send_timeout 60s;',
      '        proxy_read_timeout 60s;',
      '    }',
    ].join('\n');
  }

  /** Find a `location / { ... }` block (with bounds) inside a server block. */
  private extractLocationSlash(block: string): { start: number; end: number } | null {
    const idx = block.indexOf('location /');
    if (idx < 0) return null;
    const open = block.indexOf('{', idx);
    if (open < 0) return null;
    let depth = 0;
    for (let i = open; i < block.length; i++) {
      if (block[i] === '{') depth++;
      else if (block[i] === '}') {
        depth--;
        if (depth === 0) return { start: idx, end: i + 1 };
      }
    }
    return null;
  }

  /**
   * Ensure a proxy `location /` exists (port != null) or remove it (port == null)
   * within a server block string.
   */
  private setHttpProxyLocation(block: string, port: number | null): string {
    const loc = this.extractLocationSlash(block);
    if (port === null) {
      if (!loc) return block;
      let result = block.slice(0, loc.start) + block.slice(loc.end);
      result = result.replace(/\n{3,}/g, '\n\n'); // collapse excessive blank lines
      return result;
    }
    const newLoc = this.buildProxyLocation(port);
    if (loc) {
      return block.slice(0, loc.start) + newLoc + block.slice(loc.end);
    }
    // No existing location / → append before the server block's closing brace.
    const lastBrace = block.lastIndexOf('}');
    return block.slice(0, lastBrace) + '\n' + newLoc + '\n' + block.slice(lastBrace);
  }

  /** Resolve the app listen port from an existing `proxy_pass localhost:<port>`. */
  private detectAppPort(cfg: string): number {
    const m = cfg.match(/proxy_pass\s+http:\/\/localhost:(\d+);/);
    if (m) {
      const p = parseInt(m[1], 10);
      if (Number.isFinite(p) && p > 0) return p;
    }
    const def = parseInt(process.env.DEFAULT_SITE_PORT || '3000', 10);
    return Number.isFinite(def) && def > 0 ? def : 3000;
  }

  /** Append an entry to the `audit.httpsRedirect` SiteSettings array. */
  private async audit(
    actor: string | null | undefined,
    enabled: boolean,
    result: 'ok' | 'fail',
    detail: string
  ): Promise<void> {
    try {
      const prisma = new PrismaClient();
      try {
        const entry = {
          at: new Date().toISOString(),
          actor: actor || 'admin',
          enabled,
          result,
          detail: detail.slice(0, 2000),
        };
        const existing = await prisma.siteSettings.findUnique({
          where: { key: HTTPS_REDIRECT_AUDIT_KEY },
        });
        const arr: unknown[] = existing?.value
          ? (existing.value as unknown as unknown[])
          : [];
        arr.push(entry);
        const trimmed = arr.slice(-50); // keep the latest 50 entries
        await prisma.siteSettings.upsert({
          where: { key: HTTPS_REDIRECT_AUDIT_KEY },
          create: { key: HTTPS_REDIRECT_AUDIT_KEY, value: trimmed as any },
          update: { value: trimmed as any },
        });
      } finally {
        await prisma.$disconnect();
      }
    } catch (err) {
      console.error('[httpsRedirect] audit log failed:', err);
    }
  }
}

/** Small helper to coerce an unknown error to a message string. */
function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
