'use client';

import { Facebook, Twitter, Linkedin, Youtube, Instagram } from 'lucide-react';
import { useSettings } from '@/lib/admin-settings-common';
import SettingsPageFrame from '@/components/admin/SettingsPageFrame';

export const dynamic = 'force-dynamic';

export default function SocialSettingsPage() {
  const hook = useSettings();
  const { settings, setSettings } = hook;

  const fields = [
    { key: 'socialFacebook', label: 'Facebook', icon: <Facebook className="w-4 h-4 inline mr-1 text-blue-600" />, placeholder: 'https://facebook.com/...' },
    { key: 'socialTwitter', label: 'Twitter / X', icon: <Twitter className="w-4 h-4 inline mr-1 text-blue-400" />, placeholder: 'https://twitter.com/...' },
    { key: 'socialLinkedin', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4 inline mr-1 text-blue-700" />, placeholder: 'https://linkedin.com/company/...' },
    { key: 'socialYoutube', label: 'YouTube', icon: <Youtube className="w-4 h-4 inline mr-1 text-red-600" />, placeholder: 'https://youtube.com/...' },
    { key: 'socialInstagram', label: 'Instagram', icon: <Instagram className="w-4 h-4 inline mr-1 text-pink-600" />, placeholder: 'https://instagram.com/...' },
    { key: 'socialWechat', label: '微信号', icon: <span className="w-4 h-4 inline-block mr-1" />, placeholder: 'SmartCabinet_Qiuyuan' },
    { key: 'socialWeibo', label: '微博链接', icon: <span className="w-4 h-4 inline-block mr-1" />, placeholder: 'https://weibo.com/...' },
  ] as const;

  return (
    <SettingsPageFrame
      hook={hook}
      title="社交媒体"
      description="配置各社交平台的链接"
      backHref="/admin/settings"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">社交媒体</h2>
      <div className="max-w-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.icon}{f.label}</label>
              <input
                type="text"
                value={(settings as any)[f.key] ?? ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className="admin-form-input w-full"
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
      </div>
    </SettingsPageFrame>
  );
}
