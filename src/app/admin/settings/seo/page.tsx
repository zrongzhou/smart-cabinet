'use client';

import { useSettings } from '@/lib/admin-settings-common';
import SettingsPageFrame from '@/components/admin/SettingsPageFrame';

export const dynamic = 'force-dynamic';

export default function SeoSettingsPage() {
  const hook = useSettings();
  const { settings, setSettings, uploading, setShowMediaPicker, setMediaPickerTarget, handleImageUpload } = hook;

  const openMedia = (target: 'ogImage' | 'favicon') => {
    setMediaPickerTarget(target);
    setShowMediaPicker(true);
  };

  return (
    <SettingsPageFrame
      hook={hook}
      title="SEO & 其他"
      description="配置 SEO、OG 分享图、Favicon 与页脚信息"
      backHref="/admin/settings"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">SEO & 其他</h2>
      <div className="max-w-2xl space-y-6">
        {/* SEO Settings */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">SEO 设置</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">网站标题（Title）</label>
              <input
                type="text"
                value={settings.seoTitle}
                onChange={(e) => setSettings((prev) => ({ ...prev, seoTitle: e.target.value }))}
                className="admin-form-input w-full"
                placeholder="Smart Cabinet - Intelligent Tool Management Solutions"
              />
              <p className="mt-1 text-xs text-gray-500">建议长度：50-60个字符</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">网站描述（Description）</label>
              <textarea
                rows={3}
                value={settings.seoDescription}
                onChange={(e) => setSettings((prev) => ({ ...prev, seoDescription: e.target.value }))}
                className="admin-form-input w-full resize-none"
                placeholder="Professional smart tool cabinet and vending machine manufacturer"
              />
              <p className="mt-1 text-xs text-gray-500">建议长度：150-160个字符</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">关键词（Keywords）</label>
              <input
                type="text"
                value={settings.seoKeywords}
                onChange={(e) => setSettings((prev) => ({ ...prev, seoKeywords: e.target.value }))}
                className="admin-form-input w-full"
                placeholder="smart cabinet, tool cabinet, vending machine, RFID"
              />
              <p className="mt-1 text-xs text-gray-500">用逗号分隔多个关键词</p>
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OG 图片（社交媒体分享图）</label>
              <div className="flex flex-wrap items-center gap-3">
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
                <button type="button" onClick={() => openMedia('ogImage')} className="btn-secondary text-sm">
                  📁 媒体库
                </button>
                {settings.seoOgImage && (
                  <button
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, seoOgImage: '' }))}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Favicon（网站图标）</label>
            <div className="flex flex-wrap items-center gap-3">
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
              <button type="button" onClick={() => openMedia('favicon')} className="btn-secondary text-sm">
                📁 媒体库
              </button>
              {settings.favicon && (
                <button
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, favicon: '' }))}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">版权信息</label>
              <input
                type="text"
                value={settings.footerCopyright}
                onChange={(e) => setSettings((prev) => ({ ...prev, footerCopyright: e.target.value }))}
                className="admin-form-input w-full"
                placeholder="© 2024 Guangzhou Qiuyuan Technology Co., Ltd. All rights reserved."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">页脚链接（JSON格式）</label>
              <textarea
                rows={5}
                value={settings.footerLinks}
                onChange={(e) => setSettings((prev) => ({ ...prev, footerLinks: e.target.value }))}
                className="admin-form-input w-full resize-none font-mono text-sm"
                placeholder='[{"label":"Privacy Policy","url":"/privacy"},{"label":"Terms of Service","url":"/terms"}]'
              />
              <p className="mt-1 text-xs text-gray-500">JSON数组格式，每个对象包含label和url字段</p>
            </div>
          </div>
        </div>
      </div>
    </SettingsPageFrame>
  );
}
