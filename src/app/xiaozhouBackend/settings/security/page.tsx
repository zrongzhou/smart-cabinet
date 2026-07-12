'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';

export const dynamic = 'force-dynamic';

export default function XiaoZhouSecuritySettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <Link href="/xiaozhouBackend/settings" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回设置
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">安全设置</h1>
        <p className="text-gray-600 mt-1">管理管理员账号密码等敏感凭据。</p>
      </div>
      <ChangePasswordForm prefix="xiaozhouBackend" />
    </div>
  );
}
