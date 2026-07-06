'use client';

import Link from 'next/link';
import { ArrowLeft, Globe, Mail, Facebook, Search, Bell, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useSettings, SiteSettings } from '@/lib/xiaozhouBackend-settings-common';

export const dynamic = 'force-dynamic';

interface CategoryCard {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  accent: string;
  count: (s: SiteSettings) => { filled: number; total: number };
}

export default function SettingsIndexPage() {
  const { settings, loading } = useSettings();

  const str = (v: string | undefined) => (v || '').trim().length > 0;
  const arr = (v: string[] = []) => (v || []).filter((x) => (x || '').trim()).length > 0;

  const categories: CategoryCard[] = [
    {
      key: 'company',
      title: '公司信息',
      description: '公司名称（中/英/阿）、网站 Logo',
      href: '/xiaozhouBackend/settings/company',
      icon: Globe,
      accent: 'blue',
      count: (s) => ({
        filled: [s.companyNameZh, s.companyName, s.companyNameAr, s.logo].filter(str).length,
        total: 4,
      }),
    },
    {
      key: 'contact',
      title: '联系方式',
      description: '邮箱、电话、WhatsApp 与地址',
      href: '/xiaozhouBackend/settings/contact',
      icon: Mail,
      accent: 'green',
      count: (s) => {
        let filled = 0;
        if (arr(s.contactEmails)) filled++;
        if (arr(s.contactPhones)) filled++;
        if (arr(s.contactWhatsAppNumbers)) filled++;
        if (str(s.addressZh)) filled++;
        if (str(s.address)) filled++;
        if (str(s.addressAr)) filled++;
        return { filled, total: 6 };
      },
    },
    {
      key: 'social',
      title: '社交媒体',
      description: 'Facebook、Twitter、LinkedIn 等链接',
      href: '/xiaozhouBackend/settings/social',
      icon: Facebook,
      accent: 'purple',
      count: (s) => {
        const list = [s.socialFacebook, s.socialTwitter, s.socialLinkedin, s.socialYoutube, s.socialInstagram, s.socialWechat, s.socialWeibo];
        return { filled: list.filter(str).length, total: 7 };
      },
    },
    {
      key: 'seo',
      title: 'SEO & 其他',
      description: 'SEO 设置、OG 图、Favicon 与页脚',
      href: '/xiaozhouBackend/settings/seo',
      icon: Search,
      accent: 'orange',
      count: (s) => ({
        filled: [s.seoTitle, s.seoDescription, s.seoKeywords, s.seoOgImage, s.favicon, s.footerCopyright, s.footerLinks].filter(str).length,
        total: 7,
      }),
    },
    {
      key: 'notifications',
      title: '微信通知',
      description: '企业微信 / 个人微信通知配置',
      href: '/xiaozhouBackend/settings/notifications',
      icon: Bell,
      accent: 'red',
      count: (s) => {
        let filled = 0;
        if (s.wechatNotificationEnabled) filled++;
        if (s.wechatPersonalEnabled) filled++;
        if (s.wecomAppEnabled) filled++;
        if (str(s.wechatWebhookUrl)) filled++;
        if (str(s.wechatPersonalSendKey)) filled++;
        if (str(s.wecomCorpId)) filled++;
        if (str(s.wecomAgentId)) filled++;
        if (str(s.wecomSecret)) filled++;
        if (str(s.wecomToUser)) filled++;
        return { filled, total: 9 };
      },
    },
  ];

  const accentStyles: Record<string, { iconBg: string; iconColor: string; ring: string; chip: string }> = {
    blue: { iconBg: 'bg-blue-50', iconColor: 'text-blue-600', ring: 'group-hover:border-blue-300', chip: 'bg-blue-50 text-blue-600' },
    green: { iconBg: 'bg-green-50', iconColor: 'text-green-600', ring: 'group-hover:border-green-300', chip: 'bg-green-50 text-green-600' },
    purple: { iconBg: 'bg-purple-50', iconColor: 'text-purple-600', ring: 'group-hover:border-purple-300', chip: 'bg-purple-50 text-purple-600' },
    orange: { iconBg: 'bg-orange-50', iconColor: 'text-orange-600', ring: 'group-hover:border-orange-300', chip: 'bg-orange-50 text-orange-600' },
    red: { iconBg: 'bg-red-50', iconColor: 'text-red-600', ring: 'group-hover:border-red-300', chip: 'bg-red-50 text-red-600' },
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <Link href="/xiaozhouBackend" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回仪表盘
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">站点设置</h1>
        <p className="text-gray-600 mt-1">配置网站的基本信息、SEO 与社交媒体，选择分类进入对应设置页</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">加载中...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const a = accentStyles[cat.accent];
            const { filled, total } = cat.count(settings);
            const complete = filled === total;
            return (
              <Link
                key={cat.key}
                href={cat.href}
                className={`group flex flex-col bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-300 ${a.ring}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.iconBg}`}>
                    <Icon className={`w-6 h-6 ${a.iconColor}`} />
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${complete ? 'bg-green-50 text-green-600' : a.chip}`}>
                    {complete && <CheckCircle className="w-3.5 h-3.5" />}
                    {filled} / {total}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">{cat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{cat.description}</p>
                <div className="mt-4 flex items-center justify-end text-gray-400 group-hover:text-blue-600 transition-colors">
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
