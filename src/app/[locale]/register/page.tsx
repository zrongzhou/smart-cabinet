'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n';
import Link from 'next/link';

export default function RegisterPage() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.name) {
      setError(locale === 'zh' ? '请填写必填字段' : locale === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill in required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(locale === 'zh' ? '两次输入的密码不一致' : locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError(locale === 'zh' ? '密码至少6位' : locale === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(locale === 'zh' ? '邮箱格式不正确' : locale === 'ar' ? 'تنسيق البريد الإلكتروني غير صحيح' : 'Invalid email format');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      setSuccess(
        locale === 'zh'
          ? '注册成功！正在跳转到登录页...'
          : locale === 'ar'
          ? 'تم إنشاء الحساب بنجاح! جاري التوجيه إلى صفحة تسجيل الدخول...'
          : 'Registration successful! Redirecting to login...'
      );

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 2000);
    } catch (error) {
      console.error('Register error:', error);
      setError(locale === 'zh' ? '注册失败，请重试' : locale === 'ar' ? 'فشل إنشاء الحساب، يرجى المحاولة مرة أخرى' : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {locale === 'zh' ? '注册' : locale === 'ar' ? 'إنشاء حساب' : 'Create Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {locale === 'zh' ? (
              <>
                已有账号？{' '}
                <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-500">
                  登录
                </Link>
              </>
            ) : locale === 'ar' ? (
              <>
                <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-500">
                  تسجيل الدخول
                </Link>{' '}
                لديك حساب بالفعل؟
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link href={`/${locale}/login`} className="text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.email') || 'Email'} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={locale === 'zh' ? '输入邮箱' : 'Enter your email'}
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('auth.name') || 'Name'} *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={locale === 'zh' ? '输入姓名' : 'Enter your name'}
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                {t('auth.company') || 'Company'} ({locale === 'zh' ? '可选' : locale === 'ar' ? 'اختياري' : 'optional'})
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={locale === 'zh' ? '输入公司名称' : 'Enter your company'}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('auth.phone') || 'Phone'} ({locale === 'zh' ? '可选' : locale === 'ar' ? 'اختياري' : 'optional'})
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={locale === 'zh' ? '输入电话' : 'Enter your phone'}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password') || 'Password'} *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={locale === 'zh' ? '至少6位密码' : 'At least 6 characters'}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.confirmPassword') || 'Confirm Password'} *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={locale === 'zh' ? '再次输入密码' : 'Confirm your password'}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {locale === 'zh' ? '注册中...' : locale === 'ar' ? 'جاري إنشاء الحساب...' : 'Registering...'}
                </span>
              ) : (
                (locale === 'zh' ? '注册' : locale === 'ar' ? 'إنشاء حساب' : 'Register')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
