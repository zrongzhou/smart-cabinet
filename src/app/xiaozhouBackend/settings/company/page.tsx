'use client';

import { useSettings } from '@/lib/xiaozhouBackend-settings-common';
import SettingsPageFrame from '@/components/xiaozhouBackend/SettingsPageFrame';

export const dynamic = 'force-dynamic';

export default function CompanySettingsPage() {
  const hook = useSettings();
  const { settings, setSettings, uploading, setShowMediaPicker, setMediaPickerTarget, handleImageUpload } = hook;

  const openMedia = (target: 'logo') => {
    setMediaPickerTarget(target);
    setShowMediaPicker(true);
  };

  return (
    <SettingsPageFrame
      hook={hook}
      title="公司信息"
      description="配置公司名称（多语言）与网站 Logo"
      backHref="/xiaozhouBackend/settings"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">公司信息</h2>
      <div className="max-w-2xl space-y-6">
        {/* Company Name (3 languages) */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">公司名称</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">公司名称（中文）</label>
              <input
                type="text"
                value={settings.companyNameZh}
                onChange={(e) => setSettings((prev) => ({ ...prev, companyNameZh: e.target.value }))}
                className="admin-form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name (English)</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings((prev) => ({ ...prev, companyName: e.target.value }))}
                className="admin-form-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الشركة (العربية)</label>
              <input
                type="text"
                value={settings.companyNameAr}
                onChange={(e) => setSettings((prev) => ({ ...prev, companyNameAr: e.target.value }))}
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
          <div className="flex flex-wrap items-center gap-3">
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
            <button type="button" onClick={() => openMedia('logo')} className="btn-secondary text-sm">
              📁 媒体库
            </button>
            {settings.logo && (
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, logo: '' }))}
                className="text-sm text-red-600 hover:text-red-700"
              >
                移除
              </button>
            )}
          </div>
        </div>
      </div>
    </SettingsPageFrame>
  );
}
