'use client';

import React, { useState, useEffect } from 'react';

/**
 * Shared settings logic for the admin settings section.
 *
 * All settings pages (/admin/settings/*) load the FULL settings object via
 * `useSettings()` and only edit/display their own subset of fields. On save the
 * full object is submitted to the single unified PUT endpoint
 * (/api/admin/settings). This keeps the 6 pages thin and guarantees the saved
 * payload is always complete.
 */

export interface SiteSettings {
  // 基本信息
  companyName: string;
  companyNameZh: string;
  companyNameAr: string;
  logo: string;
  favicon: string;

  // 联系信息（支持多值）
  contactEmail: string; // 旧格式，保持兼容
  contactPhone: string; // 旧格式，保持兼容
  contactWhatsApp: string; // 旧格式，保持兼容
  contactEmails: string[]; // 新格式：多邮箱
  contactPhones: string[]; // 新格式：多电话
  contactWhatsAppNumbers: string[]; // 新格式：多WhatsApp
  address: string;
  addressZh: string;
  addressAr: string;

  // SEO 设置
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoOgImage: string;

  // 社交媒体
  socialFacebook: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialYoutube: string;
  socialInstagram: string;
  socialWechat: string;
  socialWeibo: string;

  // 页脚设置
  footerCopyright: string;
  footerLinks: string;

  // 微信通知设置
  wechatWebhookUrl: string;
  wechatNotificationEnabled: boolean;
  wechatPersonalEnabled: boolean;
  wechatPersonalSendKey: string;
  wecomAppEnabled: boolean;
  wecomCorpId: string;
  wecomAgentId: string;
  wecomSecret: string;
  wecomToUser: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  companyName: '',
  companyNameZh: '',
  companyNameAr: '',
  logo: '',
  favicon: '',
  contactEmail: '',
  contactPhone: '',
  contactWhatsApp: '',
  contactEmails: [''],
  contactPhones: [''],
  contactWhatsAppNumbers: [''],
  address: '',
  addressZh: '',
  addressAr: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  seoOgImage: '',
  socialFacebook: '',
  socialTwitter: '',
  socialLinkedin: '',
  socialYoutube: '',
  socialInstagram: '',
  socialWechat: '',
  socialWeibo: '',
  footerCopyright: '',
  footerLinks: '',
  wechatWebhookUrl: '',
  wechatNotificationEnabled: false,
  wechatPersonalEnabled: false,
  wechatPersonalSendKey: '',
  wecomAppEnabled: false,
  wecomCorpId: '',
  wecomAgentId: '',
  wecomSecret: '',
  wecomToUser: '',
};

/** Simple Error Boundary for MediaPicker (so a broken media lib cannot crash a settings page). */
export class SettingsErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/** Normalise raw API/local data into a complete SiteSettings object (array backward-compat). */
export function normaliseSettings(raw: Partial<SiteSettings>): SiteSettings {
  const data: any = { ...raw };

  if (Array.isArray(data.contactEmails) && data.contactEmails.length > 0 && data.contactEmails.some((e: string) => (e || '').trim())) {
    // keep
  } else if (data.contactEmail) {
    data.contactEmails = [data.contactEmail];
  } else {
    data.contactEmails = [''];
  }

  if (Array.isArray(data.contactPhones) && data.contactPhones.length > 0 && data.contactPhones.some((p: string) => (p || '').trim())) {
    // keep
  } else if (data.contactPhone) {
    data.contactPhones = [data.contactPhone];
  } else {
    data.contactPhones = [''];
  }

  if (Array.isArray(data.contactWhatsAppNumbers) && data.contactWhatsAppNumbers.length > 0 && data.contactWhatsAppNumbers.some((w: string) => (w || '').trim())) {
    // keep
  } else if (data.contactWhatsApp) {
    data.contactWhatsAppNumbers = [data.contactWhatsApp];
  } else {
    data.contactWhatsAppNumbers = [''];
  }

  return { ...DEFAULT_SETTINGS, ...data };
}

function getAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  return {
    Authorization: `Bearer ${token || ''}`,
    ...extra,
  };
}

function firstNonEmpty(arr: string[] = []): string {
  const found = (arr || []).find((v) => (v || '').trim());
  return found || '';
}

export type MediaTarget = 'logo' | 'favicon' | 'ogImage';

export interface UseSettingsReturn {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  saved: boolean;
  loadSettings: () => Promise<void>;
  handleSave: () => Promise<void>;
  // Media picker / image upload
  uploading: MediaTarget | null;
  showMediaPicker: boolean;
  setShowMediaPicker: React.Dispatch<React.SetStateAction<boolean>>;
  mediaPickerTarget: MediaTarget | null;
  setMediaPickerTarget: React.Dispatch<React.SetStateAction<MediaTarget | null>>;
  handleImageUpload: (type: MediaTarget) => void;
  handleMediaSelect: (url: string) => void;
  // WeChat webhook test
  testingWebhook: boolean;
  testResult: { success: boolean; message: string } | null;
  handleTestWebhook: () => Promise<void>;
}

/**
 * Shared hook used by every settings page. Auto-loads on mount, exposes a single
 * save action that submits the complete settings object, and provides helpers for
 * image upload, the media picker and the WeChat webhook test.
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [uploading, setUploading] = useState<MediaTarget | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<MediaTarget | null>(null);

  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${window.location.origin}/api/admin/settings`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setSettings(normaliseSettings(data));
    } catch (err: any) {
      setError(err.message || '加载设置失败');
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('admin_settings');
        if (savedSettings) {
          try {
            const data = JSON.parse(savedSettings);
            setSettings(normaliseSettings(data));
          } catch {
            setSettings(DEFAULT_SETTINGS);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);

      const settingsToSave = { ...settings };
      // Persist both the new array format and a backward-compatible single value.
      settingsToSave.contactEmail = firstNonEmpty(settings.contactEmails);
      settingsToSave.contactPhone = firstNonEmpty(settings.contactPhones);
      settingsToSave.contactWhatsApp = firstNonEmpty(settings.contactWhatsAppNumbers);

      const res = await fetch(`${window.location.origin}/api/admin/settings`, {
        method: 'PUT',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(settingsToSave),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${res.status}`);
      }

      // Re-fetch so the UI reflects the persisted values.
      await loadSettings();

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || '保存设置失败');
    } finally {
      setSaving(false);
    }
  }

  function handleImageUpload(type: MediaTarget) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(type);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setSettings((prev) => ({ ...prev, [fieldForTarget(type)]: dataUrl }));
        setUploading(null);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function handleMediaSelect(url: string) {
    if (!mediaPickerTarget) return;
    setSettings((prev) => ({ ...prev, [fieldForTarget(mediaPickerTarget)]: url }));
    setShowMediaPicker(false);
    setMediaPickerTarget(null);
  }

  async function handleTestWebhook() {
    if (!settings.wechatWebhookUrl) {
      setTestResult({ success: false, message: 'Please enter the webhook URL first' });
      return;
    }
    setTestingWebhook(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/settings/test-wechat', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ webhookUrl: settings.wechatWebhookUrl }),
      });
      const data = await res.json();
      setTestResult({ success: data.success, message: data.message });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Failed to test webhook' });
    } finally {
      setTestingWebhook(false);
    }
  }

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    settings,
    setSettings,
    loading,
    saving,
    error,
    setError,
    saved,
    loadSettings,
    handleSave,
    uploading,
    showMediaPicker,
    setShowMediaPicker,
    mediaPickerTarget,
    setMediaPickerTarget,
    handleImageUpload,
    handleMediaSelect,
    testingWebhook,
    testResult,
    handleTestWebhook,
  };
}

/** Map a media target to the settings field it controls. */
export function fieldForTarget(type: MediaTarget): keyof SiteSettings {
  if (type === 'logo') return 'logo';
  if (type === 'favicon') return 'favicon';
  return 'seoOgImage';
}
