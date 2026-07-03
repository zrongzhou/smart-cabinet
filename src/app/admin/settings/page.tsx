'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Globe, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube, Instagram, ChevronDown, AlertCircle, Loader2, CheckCircle, X } from 'lucide-react';
import MediaPicker from '@/components/admin/MediaPicker';
import { adminApi } from '@/data/unified-data';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

interface SiteSettings {
  // 基本信息
  companyName: string;
  companyNameZh: string;
  companyNameAr: string;
  logo: string;
  favicon: string;

  // 联系信息（支持多值）
  contactEmail: string;  // 旧格式，保持兼容
  contactPhone: string;  // 旧格式，保持兼容
  contactWhatsApp: string;  // 旧格式，保持兼容
  contactEmails: string[];  // 新格式：多邮箱
  contactPhones: string[];  // 新格式：多电话
  contactWhatsAppNumbers: string[];  // 新格式：多WhatsApp
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

// Simple Error Boundary for MediaPicker
class ErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
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

interface TabConfig {
  key: string;
  label: string;
  icon: any;
  description: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
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
  });

  const [activeTab, setActiveTab] = useState('company');
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'favicon' | 'ogImage' | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'logo' | 'favicon' | 'ogImage' | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab configuration
  const tabs: TabConfig[] = [
    { key: 'company', label: '公司信息', icon: Globe, description: '公司名称、Logo、简介' },
    { key: 'contact', label: '联系方式', icon: Mail, description: '邮箱、电话、地址' },
    { key: 'social', label: '社交媒体', icon: Facebook, description: 'Facebook、Twitter等' },
    { key: 'seo', label: 'SEO & 其他', icon: Linkedin, description: 'SEO设置、Favicon' },
    { key: 'notifications', label: '微信通知', icon: AlertCircle, description: '企业微信群机器人通知设置' },
  ];

  // Load settings from API
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch settings from ADMIN API (not public API, to preserve array types)
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const res = await fetch(`${window.location.origin}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token || ''}` },
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      
      // Handle backward compatibility for contact fields
      const processedData: any = { ...data };
      
      // contactEmails: 优先使用新格式，否则从旧格式转换
      if (processedData.contactEmails && Array.isArray(processedData.contactEmails) && processedData.contactEmails.length > 0) {
        // 新格式，直接使用
      } else if (processedData.contactEmail) {
        // 旧格式，转换为新格式
        processedData.contactEmails = [processedData.contactEmail];
      } else {
        processedData.contactEmails = [''];
      }
      
      // contactPhones: 优先使用新格式，否则从旧格式转换
      if (processedData.contactPhones && Array.isArray(processedData.contactPhones) && processedData.contactPhones.length > 0) {
        // 新格式，直接使用
      } else if (processedData.contactPhone) {
        // 旧格式，转换为新格式
        processedData.contactPhones = [processedData.contactPhone];
      } else {
        processedData.contactPhones = [''];
      }
      
      // contactWhatsAppNumbers: 优先使用新格式，否则从旧格式转换
      if (processedData.contactWhatsAppNumbers && Array.isArray(processedData.contactWhatsAppNumbers) && processedData.contactWhatsAppNumbers.length > 0) {
        // 新格式，直接使用
      } else if (processedData.contactWhatsApp) {
        // 旧格式，转换为新格式
        processedData.contactWhatsAppNumbers = [processedData.contactWhatsApp];
      } else {
        processedData.contactWhatsAppNumbers = [''];
      }
      
      setSettings(processedData as SiteSettings);
    } catch (err: any) {
      setError(err.message || '加载设置失败');
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('admin_settings');
        if (savedSettings) {
          const data: any = JSON.parse(savedSettings);
          // Same backward compatibility handling
          if (!data.contactEmails || !Array.isArray(data.contactEmails) || data.contactEmails.length === 0) {
            data.contactEmails = data.contactEmail ? [data.contactEmail] : [''];
          }
          if (!data.contactPhones || !Array.isArray(data.contactPhones) || data.contactPhones.length === 0) {
            data.contactPhones = data.contactPhone ? [data.contactPhone] : [''];
          }
          if (!data.contactWhatsAppNumbers || !Array.isArray(data.contactWhatsAppNumbers) || data.contactWhatsAppNumbers.length === 0) {
            data.contactWhatsAppNumbers = data.contactWhatsApp ? [data.contactWhatsApp] : [''];
          }
          setSettings(data as SiteSettings);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Prepare settings for save (backward compatible)
      const settingsToSave = { ...settings };

      // Save both old and new formats
      // Old format: single string (first non-empty value)
      settingsToSave.contactEmail = settings.contactEmails.filter(e => e.trim()).length > 0
        ? settings.contactEmails.filter(e => e.trim())[0]
        : '';
      settingsToSave.contactPhone = settings.contactPhones.filter(p => p.trim()).length > 0
        ? settings.contactPhones.filter(p => p.trim())[0]
        : '';
      settingsToSave.contactWhatsApp = settings.contactWhatsAppNumbers.filter(w => w.trim()).length > 0
        ? settings.contactWhatsAppNumbers.filter(w => w.trim())[0]
        : '';

      // Save settings via API (returns { success: true }, NOT the data!)
      await adminApi.updateSettings(settingsToSave);

      // CRITICAL FIX: Re-fetch settings from API to get the saved data
      // The PUT endpoint returns { success: true }, not the settings object,
      // so we must re-fetch to get the actual stored values
      await loadSettings();

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || '保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (type: 'logo' | 'favicon' | 'ogImage') => {
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
        setSettings({ ...settings, [type === 'logo' ? 'logo' : type === 'favicon' ? 'favicon' : 'seoOgImage']: dataUrl });
        setUploading(null);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Test WeChat webhook
  const handleTestWebhook = async () => {
    if (!settings.wechatWebhookUrl) {
      setTestResult({ success: false, message: 'Please enter the webhook URL first' });
      return;
    }

    setTestingWebhook(true);
    setTestResult(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const res = await fetch('/api/admin/settings/test-wechat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ webhookUrl: settings.wechatWebhookUrl }),
      });

      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message,
      });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Failed to test webhook' });
    } finally {
      setTestingWebhook(false);
    }
  };

  // Handle media picker selection
  const handleMediaSelect = (url: string) => {
    if (!mediaPickerTarget) return;
    setSettings({ ...settings, [mediaPickerTarget === 'logo' ? 'logo' : mediaPickerTarget === 'favicon' ? 'favicon' : 'seoOgImage']: url });
    setShowMediaPicker(false);
    setMediaPickerTarget(null);
  };

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回仪表盘
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">站点设置</h1>
          <p className="text-gray-600 mt-1">配置网站的基本信息、SEO和社交媒体</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 disabled:opacity-50"
          >
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? '保存中...' : '保存设置'}</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">加载中...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Horizontal Tab Navigation */}
          <div className="mb-6">
            {/* Desktop Tabs */}
            <div className="hidden md:flex space-x-1 bg-gray-100 p-1 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Dropdown */}
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                {tabs.map((tab) => (
                  <option key={tab.key} value={tab.key}>
                    {tab.label} - {tab.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Tab Description */}
            <p className="mt-3 text-sm text-gray-500">
              {tabs.find(t => t.key === activeTab)?.description}
            </p>
          </div>

          {/* Tab Content with Transition */}
          <div className="transition-all duration-300 ease-in-out">
            {/* Tab 1: Company Info */}
            {activeTab === 'company' && (
              <div className="admin-card p-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-6">公司信息</h2>
                <div className="max-w-2xl space-y-6">
                  {/* Company Name (3 languages) */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-4">公司名称</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          公司名称（中文）
                        </label>
                        <input
                          type="text"
                          value={settings.companyNameZh}
                          onChange={(e) => setSettings({ ...settings, companyNameZh: e.target.value })}
                          className="admin-form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name (English)
                        </label>
                        <input
                          type="text"
                          value={settings.companyName}
                          onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                          className="admin-form-input w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          اسم الشركة (العربية)
                        </label>
                        <input
                          type="text"
                          value={settings.companyNameAr}
                          onChange={(e) => setSettings({ ...settings, companyNameAr: e.target.value })}
                          className="admin-form-input w-full"
                          dir="rtl"
                          style={{ textAlign: 'right', fontFamily: "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">网站 Logo</h3>
                    <div className="flex items-center space-x-4">
                      {settings.logo && (
                        <img src={settings.logo} alt="Logo" className="h-16 w-auto object-contain border border-gray-200 rounded" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleImageUpload('logo')}
                        disabled={uploading === 'logo'}
                        className="btn-secondary"
                      >
                        {uploading === 'logo' ? '上传中...' : settings.logo ? '更换Logo' : '上传Logo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMediaPickerTarget('logo'); setShowMediaPicker(true); }}
                        className="btn-secondary text-sm"
                      >
                        📁 媒体库
                      </button>
                      {settings.logo && (
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, logo: '' })}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          移除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Contact */}
            {activeTab === 'contact' && (
              <div className="admin-card p-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-6">联系方式</h2>
                <div className="max-w-2xl space-y-6">
                  {/* 多邮箱 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      联系邮箱
                      <button 
                        type="button"
                        onClick={() => setSettings({...settings, contactEmails: [...settings.contactEmails, '']})}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-700"
                      >
                        + 新增邮箱
                      </button>
                    </label>
                    {settings.contactEmails.map((email, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            const newEmails = [...settings.contactEmails];
                            newEmails[idx] = e.target.value;
                            setSettings({...settings, contactEmails: newEmails});
                          }}
                          className="admin-form-input flex-1"
                          placeholder="email@example.com"
                        />
                        {settings.contactEmails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newEmails = settings.contactEmails.filter((_, i) => i !== idx);
                              setSettings({...settings, contactEmails: newEmails.length ? newEmails : ['']});
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 多电话 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      联系电话
                      <button 
                        type="button"
                        onClick={() => setSettings({...settings, contactPhones: [...settings.contactPhones, '']})}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-700"
                      >
                        + 新增电话
                      </button>
                    </label>
                    {settings.contactPhones.map((phone, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => {
                            const newPhones = [...settings.contactPhones];
                            newPhones[idx] = e.target.value;
                            setSettings({...settings, contactPhones: newPhones});
                          }}
                          className="admin-form-input flex-1"
                          placeholder="+86 156 2216 0659"
                        />
                        {settings.contactPhones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newPhones = settings.contactPhones.filter((_, i) => i !== idx);
                              setSettings({...settings, contactPhones: newPhones.length ? newPhones : ['']});
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 多WhatsApp */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp
                      <button 
                        type="button"
                        onClick={() => setSettings({...settings, contactWhatsAppNumbers: [...settings.contactWhatsAppNumbers, '']})}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-700"
                      >
                        + 新增WhatsApp
                      </button>
                    </label>
                    {settings.contactWhatsAppNumbers.map((number, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={number}
                          onChange={(e) => {
                            const newNumbers = [...settings.contactWhatsAppNumbers];
                            newNumbers[idx] = e.target.value;
                            setSettings({...settings, contactWhatsAppNumbers: newNumbers});
                          }}
                          className="admin-form-input flex-1"
                          placeholder="+86 156 2216 0659"
                        />
                        {settings.contactWhatsAppNumbers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newNumbers = settings.contactWhatsAppNumbers.filter((_, i) => i !== idx);
                              setSettings({...settings, contactWhatsAppNumbers: newNumbers.length ? newNumbers : ['']});
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        地址（中文）
                      </label>
                      <input
                        type="text"
                        value={settings.addressZh}
                        onChange={(e) => setSettings({ ...settings, addressZh: e.target.value })}
                        className="admin-form-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Address (English)
                      </label>
                      <input
                        type="text"
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="admin-form-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        العنوان (العربية)
                      </label>
                      <input
                        type="text"
                        value={settings.addressAr}
                        onChange={(e) => setSettings({ ...settings, addressAr: e.target.value })}
                        className="admin-form-input w-full"
                        dir="rtl"
                        style={{ textAlign: 'right', fontFamily: "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Social Media */}
            {activeTab === 'social' && (
              <div className="admin-card p-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-6">社交媒体</h2>
                <div className="max-w-2xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Facebook className="w-4 h-4 inline mr-1 text-blue-600" />
                        Facebook
                      </label>
                      <input
                        type="text"
                        value={settings.socialFacebook}
                        onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                        className="admin-form-input w-full"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Twitter className="w-4 h-4 inline mr-1 text-blue-400" />
                        Twitter / X
                      </label>
                      <input
                        type="text"
                        value={settings.socialTwitter}
                        onChange={(e) => setSettings({ ...settings, socialTwitter: e.target.value })}
                        className="admin-form-input w-full"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Linkedin className="w-4 h-4 inline mr-1 text-blue-700" />
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        value={settings.socialLinkedin}
                        onChange={(e) => setSettings({ ...settings, socialLinkedin: e.target.value })}
                        className="admin-form-input w-full"
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Youtube className="w-4 h-4 inline mr-1 text-red-600" />
                        YouTube
                      </label>
                      <input
                        type="text"
                        value={settings.socialYoutube}
                        onChange={(e) => setSettings({ ...settings, socialYoutube: e.target.value })}
                        className="admin-form-input w-full"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Instagram className="w-4 h-4 inline mr-1 text-pink-600" />
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={settings.socialInstagram}
                        onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                        className="admin-form-input w-full"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        微信号
                      </label>
                      <input
                        type="text"
                        value={settings.socialWechat}
                        onChange={(e) => setSettings({ ...settings, socialWechat: e.target.value })}
                        className="admin-form-input w-full"
                        placeholder="SmartCabinet_Qiuyuan"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      微博链接
                    </label>
                    <input
                      type="text"
                      value={settings.socialWeibo}
                      onChange={(e) => setSettings({ ...settings, socialWeibo: e.target.value })}
                      className="admin-form-input w-full"
                      placeholder="https://weibo.com/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: SEO & Misc */}
            {activeTab === 'seo' && (
              <div className="admin-card p-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-6">SEO & 其他</h2>
                <div className="max-w-2xl space-y-6">
                  {/* SEO Settings */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-4">SEO 设置</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          网站标题（Title）
                        </label>
                        <input
                          type="text"
                          value={settings.seoTitle}
                          onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                          className="admin-form-input w-full"
                          placeholder="Smart Cabinet - Intelligent Tool Management Solutions"
                        />
                        <p className="mt-1 text-xs text-gray-500">建议长度：50-60个字符</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          网站描述（Description）
                        </label>
                        <textarea
                          rows={3}
                          value={settings.seoDescription}
                          onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                          className="admin-form-input w-full resize-none"
                          placeholder="Professional smart tool cabinet and vending machine manufacturer"
                        />
                        <p className="mt-1 text-xs text-gray-500">建议长度：150-160个字符</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          关键词（Keywords）
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={settings.seoKeywords}
                            onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
                            className="admin-form-input flex-1"
                            placeholder="smart cabinet, tool cabinet, vending machine, RFID"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">用逗号分隔多个关键词</p>
                      </div>

                      {/* OG Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          OG 图片（社交媒体分享图）
                        </label>
                        <div className="flex items-center space-x-4">
                          {settings.seoOgImage && (
                            <img src={settings.seoOgImage} alt="OG Image" className="h-20 w-auto object-cover border border-gray-200 rounded" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleImageUpload('ogImage')}
                            disabled={uploading === 'ogImage'}
                            className="btn-secondary"
                          >
                            {uploading === 'ogImage' ? '上传中...' : settings.seoOgImage ? '更换图片' : '上传图片'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setMediaPickerTarget('ogImage'); setShowMediaPicker(true); }}
                            className="btn-secondary text-sm"
                          >
                            📁 媒体库
                          </button>
                          {settings.seoOgImage && (
                            <button
                              type="button"
                              onClick={() => setSettings({ ...settings, seoOgImage: '' })}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              移除
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">推荐尺寸：1200x630px</p>
                      </div>
                    </div>
                  </div>

                  {/* Favicon */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Favicon</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Favicon（网站图标）
                      </label>
                      <div className="flex items-center space-x-4">
                        {settings.favicon && (
                          <img src={settings.favicon} alt="Favicon" className="h-8 w-8 object-contain border border-gray-200 rounded" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleImageUpload('favicon')}
                          disabled={uploading === 'favicon'}
                          className="btn-secondary"
                        >
                          {uploading === 'favicon' ? '上传中...' : settings.favicon ? '更换图标' : '上传图标'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setMediaPickerTarget('favicon'); setShowMediaPicker(true); }}
                          className="btn-secondary text-sm"
                        >
                          📁 媒体库
                        </button>
                        {settings.favicon && (
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, favicon: '' })}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            移除
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">推荐尺寸：32x32px 或 64x64px，ICO或PNG格式</p>
                    </div>
                  </div>

                  {/* Footer Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">页脚设置</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          版权信息
                        </label>
                        <input
                          type="text"
                          value={settings.footerCopyright}
                          onChange={(e) => setSettings({ ...settings, footerCopyright: e.target.value })}
                          className="admin-form-input w-full"
                          placeholder="© 2024 Guangzhou Qiuyuan Technology Co., Ltd. All rights reserved."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          页脚链接（JSON格式）
                        </label>
                        <textarea
                          rows={5}
                          value={settings.footerLinks}
                          onChange={(e) => setSettings({ ...settings, footerLinks: e.target.value })}
                          className="admin-form-input w-full resize-none font-mono text-sm"
                          placeholder='[{"label":"Privacy Policy","url":"/privacy"},{"label":"Terms of Service","url":"/terms"}]'
                        />
                        <p className="mt-1 text-xs text-gray-500">JSON数组格式，每个对象包含label和url字段</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: WeChat Notifications */}
            {activeTab === 'notifications' && (
              <div className="admin-card p-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 mb-6">微信通知设置</h2>
                <div className="max-w-2xl space-y-6">
                  {/* Enable/Disable Switch */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">启用微信通知</h3>
                      <p className="text-sm text-gray-500 mt-1">当有新联系消息时，通过企业微信群机器人发送通知</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, wechatNotificationEnabled: !settings.wechatNotificationEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.wechatNotificationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.wechatNotificationEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 个人微信通知（Server酱） */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">个人微信通知（Server酱）</h3>
                    <p className="text-sm text-gray-500 mb-4">通过 Server酱 推送通知到个人微信（需绑定微信关注号）</p>

                    {/* Enable Switch */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">启用个人微信通知</span>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, wechatPersonalEnabled: !settings.wechatPersonalEnabled })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.wechatPersonalEnabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.wechatPersonalEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* SendKey Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Server酱 SendKey</label>
                      <input
                        type="text"
                        value={settings.wechatPersonalSendKey || ''}
                        onChange={(e) => setSettings({ ...settings, wechatPersonalSendKey: e.target.value })}
                        className="admin-form-input w-full font-mono text-sm"
                        placeholder="SCTxxxxxxxxxx（从 ftqq.com 获取）"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        1. 访问 sct.ftqq.com 注册/登录<br />
                        2. 创建一个 SendKey 并复制到这里<br />
                        3. 用微信扫描绑定 Server酱公众号即可接收消息
                      </p>
                    </div>
                  </div>

                  {/* 企业微信应用消息 */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">企业微信应用消息</h3>
                    <p className="text-sm text-gray-500 mb-4">通过企业微信"自建应用"向成员发送私信（需企业管理员权限创建应用）</p>

                    {/* Enable Switch */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">启用应用消息</span>
                      <button type="button"
                        onClick={() => setSettings({...settings, wecomAppEnabled: !settings.wecomAppEnabled})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.wecomAppEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.wecomAppEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {settings.wecomAppEnabled && (
                      <div className="space-y-3 bg-blue-50/50 p-4 rounded-lg">
                        {/* Corp ID */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">企业ID (Corp ID)</label>
                          <input type="text" value={settings.wecomCorpId || ''}
                            onChange={(e) => setSettings({...settings, wecomCorpId: e.target.value})}
                            className="admin-form-input w-full font-mono text-sm"
                            placeholder="wwxxxxxxxxxxxxxxx" />
                        </div>
                        {/* Agent ID */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">应用ID (Agent ID)</label>
                          <input type="text" value={settings.wecomAgentId || ''}
                            onChange={(e) => setSettings({...settings, wecomAgentId: e.target.value})}
                            className="admin-form-input w-full font-mono text-sm"
                            placeholder="1000002" />
                        </div>
                        {/* Secret */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">应用Secret</label>
                          <input type="password" value={settings.wecomSecret || ''} autoComplete="off"
                            onChange={(e) => setSettings({...settings, wecomSecret: e.target.value})}
                            className="admin-form-input w-full font-mono text-sm"
                            placeholder="xxxxxxxxxxxxxxxxxxxxxxxx" />
                        </div>
                        {/* To User */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">接收人 UserID</label>
                          <input type="text" value={settings.wecomToUser || ''}
                            onChange={(e) => setSettings({...settings, wecomToUser: e.target.value})}
                            className="admin-form-input w-full font-mono text-sm"
                            placeholder="@all（或具体 userId，多个用|分隔）" />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                          1. 登录 <strong>企业微信管理后台</strong> → 应用管理 → 创建自建应用<br/>
                          2. 在应用详情页获取 Agent ID 和 Secret<br/>
                          3. 在"我的企业"→"企业信息"中获取 Corp ID<br/>
                          4. 确保应用的"可见范围"包含目标接收人<br/>
                          ⚠️ 只能发给本企业的企业微信成员，无法推送给外部人员
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Webhook URL */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">企业微信群机器人 Webhook</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Webhook URL
                        </label>
                        <input
                          type="text"
                          value={settings.wechatWebhookUrl}
                          onChange={(e) => {
                            setSettings({ ...settings, wechatWebhookUrl: e.target.value });
                            setTestResult(null);
                          }}
                          className="admin-form-input w-full font-mono text-sm"
                          placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          在企业微信群中添加机器人，获取 Webhook 地址
                        </p>
                      </div>

                      {/* Test Button */}
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={handleTestWebhook}
                          disabled={testingWebhook || !settings.wechatWebhookUrl}
                          className="btn-secondary flex items-center gap-2"
                        >
                          {testingWebhook ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              测试中...
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4" />
                              测试发送
                            </>
                          )}
                        </button>

                        {testResult && (
                          <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                            {testResult.success ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                            <span>{testResult.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Help Text */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">使用说明</h3>
                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 space-y-2">
                      <p>1. 在企业微信中创建一个群聊</p>
                      <p>2. 点击群设置 → 群机器人 → 添加机器人</p>
                      <p>3. 设置机器人名称和头像，复制 Webhook 地址</p>
                      <p>4. 将 Webhook 地址粘贴到上方输入框</p>
                      <p>5. 点击"测试发送"验证配置是否正确</p>
                      <p>6. 保存设置后，有新联系消息时会自动发送通知到群</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <ErrorBoundary fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setShowMediaPicker(false); setMediaPickerTarget(null); }}>
          <div className="bg-white rounded-2xl p-8 max-w-md">
            <p className="text-red-600">媒体库加载失败，请刷新页面后重试。</p>
            <button onClick={() => { setShowMediaPicker(false); setMediaPickerTarget(null); }} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">关闭</button>
          </div>
        </div>}>
          <MediaPicker
            isOpen={showMediaPicker}
            onClose={() => { setShowMediaPicker(false); setMediaPickerTarget(null); }}
            onSelect={handleMediaSelect}
            fileType="image"
          />
        </ErrorBoundary>
      )}

      {/* Save Toast */}
      {saved && (
        <div className="fixed bottom-8 right-8 p-4 bg-green-500 text-white rounded-xl shadow-lg z-50 animate-fade-in flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <p className="font-medium">设置已保存！</p>
        </div>
      )}
    </div>
  );
}
