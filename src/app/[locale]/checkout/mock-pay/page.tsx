'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { useLocale } from '@/lib/i18n';
import { useAuth } from '@/components/AuthProvider';

const METHOD_META: Record<string, { name: string; color: string; note: string }> = {
  stripe: { name: 'Stripe', color: '#635bff', note: 'Credit / Debit Card (sandbox)' },
  paypal: { name: 'PayPal', color: '#003087', note: 'PayPal (sandbox)' },
  wechat: { name: 'WeChat Pay', color: '#07c160', note: '微信支付（模拟）' },
  alipay: { name: 'Alipay', color: '#1677ff', note: '支付宝（模拟）' },
};

export default function MockPayPage() {
  const { locale } = useLocale();
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [method, setMethod] = useState('stripe');
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrderId(params.get('orderId') || '');
    setMethod(params.get('method') || 'stripe');
  }, []);

  const t = (en: string, zh: string, ar: string) =>
    locale === 'zh' ? zh : locale === 'ar' ? ar : en;

  const meta = METHOD_META[method] || METHOD_META.stripe;

  const confirm = async () => {
    if (!token) {
      router.push(`/${locale}/login?redirect=/${locale}/checkout/mock-pay?orderId=${orderId}&method=${method}`);
      return;
    }
    setStatus('processing');
    setMessage('');
    try {
      const endpoint =
        method === 'wechat'
          ? '/api/payments/wechat/callback'
          : method === 'alipay'
          ? '/api/payments/alipay/callback'
          : '/api/payments/mock/confirm';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, method }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment confirmation failed');
      }
      setStatus('done');
      setTimeout(() => router.push(`/${locale}/account/orders`), 1200);
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || t('Payment failed.', '支付失败。', 'فشل الدفع.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-white text-lg font-bold"
          style={{ backgroundColor: meta.color }}
        >
          {meta.name.slice(0, 2).toUpperCase()}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{meta.name}</h1>
        <p className="text-sm text-gray-500 mb-6">{meta.note}</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm text-gray-600">
          <div className="flex justify-between">
            <span>{t('Order', '订单', 'الطلب')}</span>
            <span className="font-mono text-gray-900">{orderId || '—'}</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>{t('Status', '状态', 'الحالة')}</span>
            <span className="text-amber-600">
              {t('Awaiting confirmation', '待确认', 'بانتظار التأكيد')}
            </span>
          </div>
        </div>

        {status === 'done' ? (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <CheckCircle2 className="w-10 h-10" />
            <p className="font-medium">{t('Payment successful!', '支付成功！', 'تم الدفع بنجاح!')}</p>
          </div>
        ) : (
          <button
            onClick={confirm}
            disabled={status === 'processing'}
            className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: meta.color }}
          >
            {status === 'processing' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
            {t('Confirm Payment', '确认支付', 'تأكيد الدفع')}
          </button>
        )}

        {status === 'error' && (
          <p className="mt-4 text-sm text-red-600 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            {message}
          </p>
        )}

        <p className="mt-5 text-xs text-gray-400">
          {t(
            'This is a sandbox payment page. No real charge is made.',
            '这是沙箱支付页，不会产生真实扣款。',
            'هذه صفحة دفع تجريبية ولا يتم خصم任何 مبلغ حقيقي.'
          )}
        </p>
      </div>
    </div>
  );
}
