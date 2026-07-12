'use client';

/**
 * ServiceManager.tsx — Service management console (V8 / T5, Q2).
 *
 * Client component rendered by both `/admin/services` and
 * `/xiaozhouBackend/services`. It shows the five white-listed actions as cards,
 * lets the operator fill the nginx site-config form (domain / port / email),
 * surfaces the execution log (stdout/stderr/exit code) returned by
 * `POST /api/admin/services`, and (new) manages certbot TLS certificates:
 * listing, renewing, applying/overwriting, and manually uploading certs.
 *
 * All actions require an admin JWT (enforced server-side by `requireAdmin`).
 */

import { useState, useEffect } from 'react';
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
  Upload,
  FileText,
  KeyRound,
  Plus,
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
  certs?: CertInfo[];
  certbotAvailable?: boolean;
}

interface CertInfo {
  name: string;
  domains: string[];
  expiry: string;
  status: 'VALID' | 'EXPIRED' | 'INVALID' | 'UNKNOWN';
  certPath?: string;
  keyPath?: string;
}

const STATUS_STYLE: Record<CertInfo['status'], string> = {
  VALID: 'bg-green-50 text-green-600',
  EXPIRED: 'bg-red-50 text-red-600',
  INVALID: 'bg-orange-50 text-orange-600',
  UNKNOWN: 'bg-slate-100 text-slate-500',
};

const STATUS_LABEL: Record<CertInfo['status'], string> = {
  VALID: adminT('services.certStatusValid'),
  EXPIRED: adminT('services.certStatusExpired'),
  INVALID: adminT('services.certStatusInvalid'),
  UNKNOWN: 'UNKNOWN',
};

export default function ServiceManager() {
  const [domain, setDomain] = useState('');
  const [port, setPort] = useState('3000');
  const [sslEmail, setSslEmail] = useState('');
  const [running, setRunning] = useState<string | null>(null);
  const [log, setLog] = useState('');
  const [lastSuccess, setLastSuccess] = useState<boolean | null>(null);
  const [formError, setFormError] = useState('');

  // Certificate management state
  const [certs, setCerts] = useState<CertInfo[]>([]);
  const [certLoading, setCertLoading] = useState(true);
  const [certError, setCertError] = useState('');
  const [certRefreshing, setCertRefreshing] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [uploadDomain, setUploadDomain] = useState<string | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; text: string } | null>(null);

  /**
   * Whether the host has certbot installed. Drives the "manual upload only"
   * mode: when false we hide/disable the certbot-only actions (renew /
   * re-apply) and surface a notice telling the operator to upload certs by
   * hand. Defaults to `true` so the buttons stay usable until we actually
   * know certbot is missing (the API omits the flag on older back-ends).
   */
  const [certbotAvailable, setCertbotAvailable] = useState<boolean>(true);

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

  /**
   * Generic service-action runner (JSON body). Used by both the action cards
   * and the certificate buttons; appends output to the shared execution log.
   */
  const runServiceAction = async (action: string, params: Record<string, unknown> = {}) => {
    setRunning(action);
    setLog('');
    setLastSuccess(null);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setLastSuccess(false);
        setLog(data?.error || `HTTP ${res.status}`);
      } else {
        setLastSuccess(!!data.success);
        setLog(data.output || (data.success ? adminT('services.success') : adminT('services.failed')));
        // Any cert-affecting action should refresh the list.
        if (action === 'renew-cert' || action === 'apply-cert' || action === 'upload-cert') {
          void fetchCerts(true);
        }
      }
    } catch (e) {
      setLastSuccess(false);
      setLog(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setRunning(null);
    }
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
    await runServiceAction(
      def.action,
      def.needsForm
        ? { domain: domain.trim(), port: parseInt(port, 10), sslEmail: sslEmail.trim() }
        : {}
    );
  };

  // ── Certificate management ──
  const fetchCerts = async (silent = false) => {
    if (silent) setCertRefreshing(true);
    else setCertLoading(true);
    setCertError('');
    try {
      const res = await fetch('/api/admin/services', { method: 'GET' });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setCertError(data?.error || `HTTP ${res.status}`);
      } else {
        setCerts(Array.isArray(data.certs) ? (data.certs as CertInfo[]) : []);
        setCertbotAvailable(data.certbotAvailable === undefined ? true : !!data.certbotAvailable);
      }
    } catch (e) {
      setCertError(e instanceof Error ? e.message : 'Failed to fetch certificates');
    } finally {
      setCertLoading(false);
      setCertRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchCerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyNew = async () => {
    if (!DOMAIN_RE.test(newDomain.trim())) {
      setCertError(adminT('services.invalidDomain'));
      return;
    }
    if (!EMAIL_RE.test(newEmail.trim())) {
      setCertError(adminT('services.invalidEmail'));
      return;
    }
    setCertError('');
    await runServiceAction('apply-cert', { domain: newDomain.trim(), email: newEmail.trim() });
    setNewDomain('');
  };

  const handleUpload = async (certDomain: string) => {
    if (!certFile || !keyFile) {
      setUploadMsg({ ok: false, text: adminT('services.certUploadRequired') });
      return;
    }
    if (!/\.(crt|pem)$/i.test(certFile.name) || !/\.key$/i.test(keyFile.name)) {
      setUploadMsg({ ok: false, text: adminT('services.certUploadExt') });
      return;
    }
    setRunning(`upload-cert:${certDomain}`);
    setUploadMsg(null);
    try {
      const fd = new FormData();
      fd.append('domain', certDomain);
      fd.append('cert', certFile);
      fd.append('key', keyFile);
      const res = await fetch('/api/admin/services', { method: 'POST', body: fd });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setUploadMsg({ ok: false, text: data?.error || `HTTP ${res.status}` });
      } else {
        setUploadMsg({ ok: !!data.success, text: data.output || (data.success ? adminT('services.success') : adminT('services.failed')) });
        setCertFile(null);
        setKeyFile(null);
        setUploadDomain(null);
        void fetchCerts(true);
      }
    } catch (e) {
      setUploadMsg({ ok: false, text: e instanceof Error ? e.message : 'Upload failed' });
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

      {/* ═══ Certificate management ═══ */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{adminT('services.certTitle')}</h2>
            <p className="text-gray-600 mt-1 text-sm">{adminT('services.certSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchCerts(true)}
            disabled={certRefreshing}
            className="admin-btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${certRefreshing ? 'animate-spin' : ''}`} />
            {adminT('services.certRefresh')}
          </button>
        </div>

        {/* certbot-missing notice — manual-upload-only mode */}
        {certbotAvailable === false && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 w-5 h-5 shrink-0" />
            <span>{adminT('services.certbotUnavailable')}</span>
          </div>
        )}

        {/* Apply for a new certificate */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-600" />
            {adminT('services.certApplyNew')}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">{adminT('services.domain')}</label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="www.example.com"
                className="admin-input"
                dir="ltr"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">{adminT('services.certEmail')}</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@example.com"
                className="admin-input"
                dir="ltr"
              />
            </div>
            <div className="flex items-end">
              {certbotAvailable && (
                <button
                  type="button"
                  disabled={running === 'apply-cert'}
                  onClick={handleApplyNew}
                  className="admin-btn-primary w-full inline-flex items-center justify-center gap-2"
                >
                  {running === 'apply-cert' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {adminT('services.certApply')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Certificate list */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {certLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              {adminT('services.certLoading')}
            </div>
          ) : certError ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <XCircle className="h-4 w-4 shrink-0" />
              {certError}
            </div>
          ) : certs.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">{adminT('services.certEmpty')}</p>
          ) : (
            <div className="space-y-4">
              {certs.map((cert) => {
                const isUploading = running === `upload-cert:${cert.name}`;
                const isRenewing = running === 'renew-cert' && uploadDomain === null;
                return (
                  <div
                    key={cert.name}
                    className="rounded-xl border border-gray-100 bg-slate-50/60 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{cert.name}</span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[cert.status]}`}>
                            {STATUS_LABEL[cert.status]}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {adminT('services.certExpiry')}: {cert.expiry || '—'}
                        </p>
                        {cert.domains.length > 1 && (
                          <p className="mt-0.5 text-xs text-gray-400 truncate" dir="ltr">
                            SAN: {cert.domains.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {certbotAvailable && (
                          <button
                            type="button"
                            disabled={running !== null}
                            onClick={() => runServiceAction('renew-cert', { domain: cert.name })}
                            className="admin-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${isRenewing ? 'animate-spin' : ''}`} />
                            {adminT('services.certRenew')}
                          </button>
                        )}
                        {certbotAvailable && (
                          <button
                            type="button"
                            disabled={running !== null || !EMAIL_RE.test(newEmail.trim())}
                            onClick={() => runServiceAction('apply-cert', { domain: cert.name, email: newEmail.trim() })}
                            title={EMAIL_RE.test(newEmail.trim()) ? '' : adminT('services.certApplyEmailHint')}
                            className="admin-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            {adminT('services.certApply')}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={running !== null}
                          onClick={() => setUploadDomain((d) => (d === cert.name ? null : cert.name))}
                          className="admin-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          {adminT('services.certUpload')}
                        </button>
                      </div>
                    </div>

                    {/* Manual upload form */}
                    {uploadDomain === cert.name && (
                      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-600">
                              <FileText className="h-3.5 w-3.5" />
                              {adminT('services.certUploadCert')}
                            </label>
                            <input
                              type="file"
                              accept=".crt,.pem"
                              onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
                              className="block w-full text-sm text-gray-600"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-600">
                              <KeyRound className="h-3.5 w-3.5" />
                              {adminT('services.certUploadKey')}
                            </label>
                            <input
                              type="file"
                              accept=".key"
                              onChange={(e) => setKeyFile(e.target.files?.[0] ?? null)}
                              className="block w-full text-sm text-gray-600"
                              dir="ltr"
                            />
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-400">{adminT('services.certUploadHint')}</p>
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => handleUpload(cert.name)}
                            className="admin-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
                          >
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {adminT('services.certUploadSubmit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setUploadDomain(null); setCertFile(null); setKeyFile(null); setUploadMsg(null); }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            {adminT('services.cancel')}
                          </button>
                        </div>
                        {uploadMsg && (
                          <div className={`mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${uploadMsg.ok ? 'border border-green-200 bg-green-50 text-green-700' : 'border border-red-200 bg-red-50 text-red-700'}`}>
                            {uploadMsg.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                            <span className="whitespace-pre-wrap break-words">{uploadMsg.text}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
