'use client';

/**
 * ServiceManager.tsx — Service management console (V8 / T5, Q2).
 *
 * Client component rendered by both `/admin/services` and
 * `/xiaozhouBackend/services`. It shows the five white-listed actions as cards,
 * lets the operator fill the nginx site-config form (domain / port / email),
 * and surfaces the execution log (stdout/stderr/exit code) returned by
 * `POST /api/admin/services`. All actions require an admin JWT (enforced
 * server-side by `requireAdmin`).
 */

import { useState } from 'react';
import {
  RefreshCw,
  Server,
  ShieldCheck,
  FileCog,
  RotateCcw,
  Loader2,
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { adminT } from '@/lib/admin-i18n';

/** Front-end mirror of the server-side validation rules. */
const DOMAIN_RE = /^([a-z0-9-]+\.)+[a-z]{2,}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ActionDef {
  action: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: 'blue' | 'cyan' | 'green' | 'purple' | 'orange';
  needsForm?: boolean;
}

const ACCENT: Record<
  ActionDef['accent'],
  { iconBg: string; iconColor: string; btn: string; ring: string }
> = {
  blue: { iconBg: 'bg-blue-50', iconColor: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700', ring: 'hover:border-blue-300' },
  cyan: { iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600', btn: 'bg-cyan-600 hover:bg-cyan-700', ring: 'hover:border-cyan-300' },
  green: { iconBg: 'bg-green-50', iconColor: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700', ring: 'hover:border-green-300' },
  purple: { iconBg: 'bg-purple-50', iconColor: 'text-purple-600', btn: 'bg-purple-600 hover:bg-purple-700', ring: 'hover:border-purple-300' },
  orange: { iconBg: 'bg-orange-50', iconColor: 'text-orange-600', btn: 'bg-orange-600 hover:bg-orange-700', ring: 'hover:border-orange-300' },
};

interface ApiResponse {
  success?: boolean;
  output?: string;
  error?: string;
}

export default function ServiceManager() {
  const [domain, setDomain] = useState('');
  const [port, setPort] = useState('3000');
  const [sslEmail, setSslEmail] = useState('');
  const [running, setRunning] = useState<string | null>(null);
  const [log, setLog] = useState('');
  const [lastSuccess, setLastSuccess] = useState<boolean | null>(null);
  const [formError, setFormError] = useState('');

  const actions: ActionDef[] = [
    { action: 'restart-app', title: adminT('services.restartApp'), desc: adminT('services.restartAppDesc'), icon: RefreshCw, accent: 'blue' },
    { action: 'reload-nginx', title: adminT('services.reloadNginx'), desc: adminT('services.reloadNginxDesc'), icon: Server, accent: 'cyan' },
    { action: 'renew-ssl', title: adminT('services.renewSsl'), desc: adminT('services.renewSslDesc'), icon: ShieldCheck, accent: 'green' },
    { action: 'update-nginx-config', title: adminT('services.updateNginxConfig'), desc: adminT('services.updateNginxConfigDesc'), icon: FileCog, accent: 'purple', needsForm: true },
    { action: 'restore-default-config', title: adminT('services.restoreDefaultConfig'), desc: adminT('services.restoreDefaultConfigDesc'), icon: RotateCcw, accent: 'orange' },
  ];

  const validateForm = (): string | null => {
    if (!DOMAIN_RE.test(domain.trim())) return adminT('services.invalidDomain');
    const p = parseInt(port, 10);
    if (!Number.isInteger(p) || p < 80 || p > 65535) return adminT('services.invalidPort');
    if (!EMAIL_RE.test(sslEmail.trim())) return adminT('services.invalidEmail');
    return null;
  };

  const runAction = async (def: ActionDef) => {
    if (def.needsForm) {
      const err = validateForm();
      if (err) {
        setFormError(err);
        return;
      }
      setFormError('');
    }

    setRunning(def.action);
    setLog('');
    setLastSuccess(null);

    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: def.action,
          params: def.needsForm
            ? { domain: domain.trim(), port: parseInt(port, 10), sslEmail: sslEmail.trim() }
            : {},
        }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setLastSuccess(false);
        setLog(data?.error || `HTTP ${res.status}`);
      } else {
        setLastSuccess(!!data.success);
        setLog(data.output || (data.success ? adminT('services.success') : adminT('services.failed')));
      }
    } catch (e) {
      setLastSuccess(false);
      setLog(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setRunning(null);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{adminT('services.title')}</h1>
        <p className="text-gray-600 mt-1">{adminT('services.subtitle')}</p>
      </div>

      {/* Permission note */}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0" />
        <span>{adminT('services.permissionNote')}</span>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {actions.map((def) => {
          const Icon = def.icon;
          const a = ACCENT[def.accent];
          const isRunning = running === def.action;
          return (
            <div
              key={def.action}
              className={`flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${a.ring}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${a.iconBg}`}>
                  <Icon className={`h-6 w-6 ${a.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{def.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{def.desc}</p>
                </div>
              </div>

              {/* Inline config form for update-nginx-config */}
              {def.needsForm && (
                <div className="mt-5 space-y-4 border-t border-gray-100 pt-5">
                  <h4 className="text-sm font-semibold text-gray-700">{adminT('services.configSection')}</h4>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">{adminT('services.domain')}</label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="www.example.com"
                      className="admin-input"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">{adminT('services.port')}</label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      min={80}
                      max={65535}
                      className="admin-input"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">{adminT('services.sslEmail')}</label>
                    <input
                      type="email"
                      value={sslEmail}
                      onChange={(e) => setSslEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="admin-input"
                      dir="ltr"
                    />
                  </div>
                  {formError && (
                    <p className="text-xs font-medium text-red-600">{formError}</p>
                  )}
                </div>
              )}

              {/* Run button */}
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => runAction(def)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${a.btn}`}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {adminT('services.running')}
                    </>
                  ) : (
                    <>
                      <Icon className="h-4 w-4" />
                      {adminT('services.run')}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution output */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-800">
            <Terminal className="h-5 w-5 text-gray-500" />
            <h3 className="text-base font-bold">{adminT('services.output')}</h3>
          </div>
          {lastSuccess !== null && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                lastSuccess
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {lastSuccess ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {lastSuccess ? adminT('services.success') : adminT('services.failed')}
            </span>
          )}
        </div>
        {log ? (
          <pre
            dir="ltr"
            className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100"
          >
            {log}
          </pre>
        ) : (
          <p className="text-sm text-gray-400">{adminT('services.emptyOutput') || '—'}</p>
        )}
      </div>
    </div>
  );
}
