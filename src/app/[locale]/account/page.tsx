'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLocale } from '@/lib/i18n';
import Link from 'next/link';

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const { locale } = useLocale();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, router, locale]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-400 mt-1">{locale === 'zh' ? '普通用户' : 'Regular User'}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link href={`/${locale}/contact`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-1">{locale === 'zh' ? '联系我们' : 'Contact Us'}</h3>
            <p className="text-sm text-gray-500">{locale === 'zh' ? '提交咨询或报价请求' : 'Submit inquiry or quote request'}</p>
          </Link>
          <button onClick={() => { logout(); router.push(`/${locale}`); }} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left">
            <h3 className="font-semibold text-red-600 mb-1">{locale === 'zh' ? '退出登录' : 'Sign Out'}</h3>
            <p className="text-sm text-gray-500">{locale === 'zh' ? '安全退出当前账户' : 'Securely sign out of your account'}</p>
          </button>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{locale === 'zh' ? '账户信息' : 'Account Information'}</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">{locale === 'zh' ? '邮箱' : 'Email'}</span>
              <span className="text-gray-900 font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">{locale === 'zh' ? '姓名' : 'Name'}</span>
              <span className="text-gray-900 font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-500">{locale === 'zh' ? '注册时间' : 'Registered'}</span>
              <span className="text-gray-900 font-medium">{new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
