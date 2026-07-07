'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/components/AuthProvider';
import { useLocale } from '@/lib/i18n';
import { CreditCard, ShoppingBag, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type PaymentMethod = 'stripe' | 'paypal' | 'wechat' | 'alipay';

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  phone?: string;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; en: string; zh: string; ar: string; color: string }[] = [
  { id: 'stripe', label: 'Stripe', en: 'Credit / Debit Card', zh: '信用卡 / 借记卡', ar: 'بطاقة ائتمان / خصم', color: '#635bff' },
  { id: 'paypal', label: 'PayPal', en: 'PayPal', zh: '贝宝', ar: 'باي بال', color: '#003087' },
  { id: 'wechat', label: 'WeChat Pay', en: 'WeChat Pay', zh: '微信支付', ar: 'وي تشات باي', color: '#07c160' },
  { id: 'alipay', label: 'Alipay', en: 'Alipay', zh: '支付宝', ar: 'علي باي', color: '#1677ff' },
];

export default function CheckoutPage() {
  const { items, total, count, clear } = useCart();
  const { user, isAuthenticated, token, isLoading } = useAuth();
  const { locale } = useLocale();
  const router = useRouter();

  const [method, setMethod] = useState<PaymentMethod>('stripe');
  const [form, setForm] = useState<ShippingAddress>({
    name: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
      }));
    }
  }, [user]);

  const t = (en: string, zh: string, ar: string) =>
    locale === 'zh' ? zh : locale === 'ar' ? ar : en;

  const isFormValid = useMemo(
    () => form.name.trim() && form.address.trim() && form.city.trim() && form.country.trim(),
    [form]
  );

  // Redirect guards
  useEffect(() => {
    if (isLoading || !mounted) return;
    if (!isAuthenticated) {
      router.push(`/${locale}/login?redirect=/${locale}/checkout`);
      return;
    }
    if (count === 0) {
      router.push(`/${locale}/products`);
    }
  }, [isLoading, mounted, isAuthenticated, count, locale, router]);

  const handleSubmit = async () => {
    setError('');
    if (!isFormValid) {
      setError(t('Please fill in the required shipping fields.', '请填写必填的收货信息。', 'يرجى تعبئة حقول الشحن المطلوبة.'));
      return;
    }
    if (!token) {
      router.push(`/${locale}/login?redirect=/${locale}/checkout`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            price: it.price,
            name: it.name,
          })),
          total,
          shippingAddress: form,
          paymentMethod: method,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.order) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Clear the cart now that the order exists.
      clear();

      // If the payment layer returned a pay URL, redirect there; otherwise go to orders.
      const payUrl = data.payment?.payUrl;
      if (payUrl) {
        window.location.href = payUrl;
      } else {
        router.push(`/${locale}/account/orders`);
      }
    } catch (err: any) {
      setError(err?.message || t('Something went wrong.', '出错了。', 'حدث خطأ ما.'));
      setSubmitting(false);
    }
  };

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (count === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-blue-600" />
          {t('Checkout', '结算', 'الدفع')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: shipping + payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('Shipping Information', '收货信息', 'معلومات الشحن')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t('Full Name', '收件人姓名', 'الاسم الكامل')} required>
                  <input
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Field>
                <Field label={t('Phone', '电话', 'الهاتف')}>
                  <input
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label={t('Address', '详细地址', 'العنوان')} required>
                    <input
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label={t('City', '城市', 'المدينة')} required>
                  <input
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </Field>
                <Field label={t('Country', '国家', 'البلد')} required>
                  <input
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </Field>
                <Field label={t('ZIP / Postal Code', '邮编', 'الرمز البريدي')}>
                  <input
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.zipCode}
                    onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                  />
                </Field>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('Payment Method', '支付方式', 'طريقة الدفع')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setMethod(pm.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      method === pm.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: pm.color }}
                    >
                      {pm.label.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold text-gray-900">{pm.label}</span>
                      <span className="block text-xs text-gray-500">
                        {locale === 'zh' ? pm.zh : locale === 'ar' ? pm.ar : pm.en}
                      </span>
                    </span>
                    {method === pm.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                {t(
                  'WeChat / Alipay run in sandbox mode until production keys are configured.',
                  '微信 / 支付宝在配置生产密钥前以沙箱模式运行。',
                  'وي تشات / علي باي يعملان في وضع الاختبار حتى يتم تكوين مفاتيح الإنتاج.'
                )}
              </p>
            </div>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('Order Summary', '订单摘要', 'ملخص الطلب')}
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {items.map((it) => (
                  <div key={it.productId} className="flex justify-between gap-2 text-sm">
                    <span className="text-gray-700 truncate flex-1">
                      {typeof it.name === 'string' ? it.name : it.name?.[locale as 'en' | 'zh' | 'ar'] || it.name?.en}
                      <span className="text-gray-400"> × {it.quantity}</span>
                    </span>
                    <span className="text-gray-900 font-medium">
                      ${(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-4">
                <span className="text-gray-500">{t('Total', '合计', 'الإجمالي')}</span>
                <span className="text-2xl font-bold text-gray-900">${total.toLocaleString()}</span>
              </div>

              {error && (
                <div className="mb-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                {t('Place Order', '提交订单', 'تأكيد الطلب')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
