'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { useSettings } from '@/lib/xiaozhouBackend-settings-common';
import SettingsPageFrame from '@/components/xiaozhouBackend/SettingsPageFrame';

export const dynamic = 'force-dynamic';

export default function ContactSettingsPage() {
  const hook = useSettings();
  const { settings, setSettings } = hook;

  const updateArray = (key: 'contactEmails' | 'contactPhones' | 'contactWhatsAppNumbers', idx: number, value: string) => {
    setSettings((prev) => {
      const next = [...(prev[key] || [''])];
      next[idx] = value;
      return { ...prev, [key]: next };
    });
  };

  const addItem = (key: 'contactEmails' | 'contactPhones' | 'contactWhatsAppNumbers') => {
    setSettings((prev) => ({ ...prev, [key]: [...(prev[key] || ['']), ''] }));
  };

  const removeItem = (key: 'contactEmails' | 'contactPhones' | 'contactWhatsAppNumbers', idx: number) => {
    setSettings((prev) => {
      const next = (prev[key] || ['']).filter((_, i) => i !== idx);
      return { ...prev, [key]: next.length ? next : [''] };
    });
  };

  return (
    <SettingsPageFrame
      hook={hook}
      title="联系方式"
      description="配置联系邮箱、电话、WhatsApp 与地址（支持多值）"
      backHref="/xiaozhouBackend/settings"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">联系方式</h2>
      <div className="max-w-2xl space-y-6">
        {/* 多邮箱 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="w-4 h-4 inline mr-1" />
            联系邮箱
            <button
              type="button"
              onClick={() => addItem('contactEmails')}
              className="ml-2 text-xs text-blue-600 hover:text-blue-700"
            >
              + 新增邮箱
            </button>
          </label>
          {(settings.contactEmails || ['']).map((email, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => updateArray('contactEmails', idx, e.target.value)}
                className="admin-form-input flex-1"
                placeholder="email@example.com"
              />
              {(settings.contactEmails?.length ?? 1) > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem('contactEmails', idx)}
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
              onClick={() => addItem('contactPhones')}
              className="ml-2 text-xs text-blue-600 hover:text-blue-700"
            >
              + 新增电话
            </button>
          </label>
          {(settings.contactPhones || ['']).map((phone, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => updateArray('contactPhones', idx, e.target.value)}
                className="admin-form-input flex-1"
                placeholder="+86 156 2216 0659"
              />
              {(settings.contactPhones?.length ?? 1) > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem('contactPhones', idx)}
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
              onClick={() => addItem('contactWhatsAppNumbers')}
              className="ml-2 text-xs text-blue-600 hover:text-blue-700"
            >
              + 新增WhatsApp
            </button>
          </label>
          {(settings.contactWhatsAppNumbers || ['']).map((number, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={number}
                onChange={(e) => updateArray('contactWhatsAppNumbers', idx, e.target.value)}
                className="admin-form-input flex-1"
                placeholder="+86 156 2216 0659"
              />
              {(settings.contactWhatsAppNumbers?.length ?? 1) > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem('contactWhatsAppNumbers', idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {[
            { key: 'addressZh', label: '地址（中文）' },
            { key: 'address', label: 'Address (English)' },
            { key: 'addressAr', label: 'العنوان (العربية)' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                {f.label}
              </label>
              <input
                type="text"
                value={(settings as any)[f.key] ?? ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className="admin-form-input w-full"
                dir={f.key === 'addressAr' ? 'rtl' : undefined}
                style={f.key === 'addressAr' ? { textAlign: 'right', fontFamily: "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif" } : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </SettingsPageFrame>
  );
}
