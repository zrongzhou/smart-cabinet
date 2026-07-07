'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  ExternalLink,
  AlertCircle,
  KeyRound,
  Info,
} from 'lucide-react';
import { getAdminLocale, adminT, type AdminLocale } from '@/lib/admin-i18n';

export const dynamic = 'force-dynamic';

interface PaymentMethod {
  key: string;
  titleKey: string;
  descKey: string;
  /** i18n keys for the numbered "how to get keys" steps. */
  steps: string[];
  docsUrl: string;
  docsLabelKey: string;
  /** Tailwind accent tokens for the icon/header. */
  accent: { bg: string; text: string; ring: string; tag: string };
}

/**
 * Bug 1: Payment gateway configuration screen (Stripe / PayPal / WeChat / Alipay).
 * Shows where to obtain each provider's API keys, the current (mock) config
 * status, a sandbox/mock note for WeChat & Alipay, and links to the official
 * docs. All copy is resolved through the admin i18n dictionaries (en/zh/ar).
 */
export default function PaymentSettingsPage() {
  const [locale, setLocale] = useState<AdminLocale>('en');

  useEffect(() => {
    try {
      setLocale(getAdminLocale());
    } catch {
      setLocale('en');
    }
  }, []);

  const t = (key: string) => adminT(key, locale);

  // In this build no provider is wired to live keys, so every method shows as
  // "Not configured" (red). The shape is ready for a real status field later.
  const methods: PaymentMethod[] = [
    {
      key: 'stripe',
      titleKey: 'payment.stripeTitle',
      descKey: 'payment.stripeDesc',
      steps: ['payment.stripeStep1', 'payment.stripeStep2', 'payment.stripeStep3'],
      docsUrl: 'https://dashboard.stripe.com/apikeys',
      docsLabelKey: 'payment.stripeDashboard',
      accent: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'group-hover:border-indigo-300', tag: 'bg-indigo-50 text-indigo-600' },
    },
    {
      key: 'paypal',
      titleKey: 'payment.paypalTitle',
      descKey: 'payment.paypalDesc',
      steps: ['payment.paypalStep1', 'payment.paypalStep2', 'payment.paypalStep3'],
      docsUrl: 'https://developer.paypal.com/dashboard/applications',
      docsLabelKey: 'payment.paypalDashboard',
      accent: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'group-hover:border-blue-300', tag: 'bg-blue-50 text-blue-600' },
    },
    {
      key: 'wechat',
      titleKey: 'payment.wechatTitle',
      descKey: 'payment.wechatNote',
      steps: [],
      docsUrl: 'https://pay.weixin.qq.com',
      docsLabelKey: 'payment.docsLabel',
      accent: { bg: 'bg-green-50', text: 'text-green-600', ring: 'group-hover:border-green-300', tag: 'bg-green-50 text-green-600' },
    },
    {
      key: 'alipay',
      titleKey: 'payment.alipayTitle',
      descKey: 'payment.alipayNote',
      steps: [],
      docsUrl: 'https://open.alipay.com',
      docsLabelKey: 'payment.docsLabel',
      accent: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'group-hover:border-purple-300', tag: 'bg-purple-50 text-purple-600' },
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <Link href="/xiaozhouBackend/settings" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {locale === 'zh' ? '返回站点设置' : locale === 'ar' ? 'العودة لإعدادات الموقع' : 'Back to Site Settings'}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{t('payment.title')}</h1>
        <p className="text-gray-600 mt-1">{t('payment.subtitle')}</p>
      </div>

      {/* Demo notice */}
      <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800 leading-relaxed">{t('payment.note')}</p>
      </div>

      {/* Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {methods.map((m) => {
          const Icon = m.key === 'stripe' ? CreditCard : m.key === 'paypal' ? CreditCard : KeyRound;
          return (
            <div
              key={m.key}
              className={`group flex flex-col bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-300 ${m.accent.ring}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.accent.bg}`}>
                  <Icon className={`w-6 h-6 ${m.accent.text}`} />
                </div>
                {/* Config status tag — red because no live keys are wired up yet. */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${m.accent.tag}`}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  {t('payment.statusNotConfigured')}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1.5">{t(m.titleKey)}</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{t(m.descKey)}</p>

              {/* Numbered key-acquisition steps (only for Stripe / PayPal). */}
              {m.steps.length > 0 && (
                <ol className="mt-4 space-y-2">
                  {m.steps.map((stepKey, idx) => (
                    <li key={stepKey} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${m.accent.bg} ${m.accent.text}`}>
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{t(stepKey)}</span>
                    </li>
                  ))}
                </ol>
              )}

              {/* Official docs link */}
              <a
                href={m.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t(m.docsLabelKey)}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
