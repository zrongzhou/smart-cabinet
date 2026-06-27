'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n';
import Link from 'next/link';

export default function LoginPage() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Save tokens to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to home or previous page
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect') || `/${locale}`;
      router.push(redirect);
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {locale === 'zh' ? '登录' : locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {locale === 'zh' ? (
              <>
                还没有账号？{' '}
                <Link href={`/${locale}/register`} className="text-blue-600 hover:text-blue-500">
                  注册
                </Link>
              </>
            ) : locale === 'ar' ? (
              <>
                <Link href={`/${locale}/register`} className="text-blue-600 hover:text-blue-500">
                  إنشاء حساب
                </Link>{' '}
                ليس لديك حساب؟
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <Link href={`/${locale}/register`} className="text-blue-600 hover:text-blue-500">
                  Sign up
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

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.email') || 'Email'}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={locale === 'zh' ? '输入邮箱' : 'Enter your email'}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.password') || 'Password'}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={locale === 'zh' ? '输入密码' : 'Enter your password'}
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
                  {locale === 'zh' ? '登录中...' : locale === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...'}
                </span>
              ) : (
                (locale === 'zh' ? '登录' : locale === 'ar' ? 'تسجيل الدخول' : 'Sign In')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
