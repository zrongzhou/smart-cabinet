'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * usePersonalWechatPush — dedicated hook for the admin "Personal WeChat Push"
 * (Round G, feature A) settings block. It talks to the encrypted, isolated
 * endpoints (`/api/admin/settings/notify-webhook` + `.../test-notify-webhook`)
 * rather than the unified settings KV, so the webhook URL is never mixed into
 * the plaintext settings payload.
 */

export interface PersonalWechatPushSettingsView {
  enabled: boolean;
  webhookMask: string;
  format: 'markdown' | 'text';
  lastTest: { status: 'success' | 'fail' | null; at: string; message?: string } | null;
}

export interface UsePersonalWechatPushReturn {
  /** Loaded (masked) configuration from the server. */
  settings: PersonalWechatPushSettingsView;
  loading: boolean;
  /** Editable form state. */
  enabled: boolean;
  setEnabled: (b: boolean) => void;
  /** Plaintext webhook input — never persisted remotely as plaintext. */
  webhookUrl: string;
  setWebhookUrl: (v: string) => void;
  format: 'markdown' | 'text';
  setFormat: (f: 'markdown' | 'text') => void;
  /** Action state. */
  saving: boolean;
  testing: boolean;
  saveResult: { ok: boolean; message: string } | null;
  testResult: { ok: boolean; message: string } | null;
  handleSave: () => Promise<void>;
  handleTest: () => Promise<void>;
}

function getAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  return { Authorization: `Bearer ${token || ''}`, ...extra };
}

export function usePersonalWechatPush(): UsePersonalWechatPushReturn {
  const [settings, setSettings] = useState<PersonalWechatPushSettingsView>({
    enabled: false,
    webhookMask: '',
    format: 'markdown',
    lastTest: null,
  });
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [format, setFormat] = useState<'markdown' | 'text'>('markdown');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings/notify-webhook', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const fmt: 'markdown' | 'text' = data.format === 'text' ? 'text' : 'markdown';
      setSettings({
        enabled: !!data.enabled,
        webhookMask: typeof data.webhookMask === 'string' ? data.webhookMask : '',
        format: fmt,
        lastTest: data.lastTest ?? null,
      });
      setEnabled(!!data.enabled);
      setFormat(fmt);
    } catch (err) {
      console.error('Failed to load personal WeChat push settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch('/api/admin/settings/notify-webhook', {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ enabled, webhookUrl, format }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setSaveResult({
          ok: false,
          message: data?.error || data?.message || `保存失败（HTTP ${res.status}）`,
        });
        return;
      }
      // Clear the plaintext input so it does not linger in UI state.
      setWebhookUrl('');
      setSaveResult({ ok: true, message: '已保存。' });
      await load(); // refresh mask / lastTest
    } catch (err) {
      setSaveResult({ ok: false, message: err instanceof Error ? err.message : '保存失败。' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/settings/test-notify-webhook', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ webhookUrl, format }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTestResult({
          ok: false,
          message: data?.message || `测试失败（HTTP ${res.status}）`,
        });
        return;
      }
      setTestResult({
        ok: !!data.success,
        message:
          data.message || (data.success ? '测试发送成功。' : '测试发送失败。'),
      });
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : '测试失败。' });
    } finally {
      setTesting(false);
    }
  };

  return {
    settings,
    loading,
    enabled,
    setEnabled,
    webhookUrl,
    setWebhookUrl,
    format,
    setFormat,
    saving,
    testing,
    saveResult,
    testResult,
    handleSave,
    handleTest,
  };
}
