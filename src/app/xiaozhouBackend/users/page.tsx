'use client';

import BackButton from '@/components/admin/BackButton';
import UsersManagement from '@/components/admin/UsersManagement';

export default function XiaoZhouUsersPage() {
  return (
    <div>
      <BackButton href="/xiaozhouBackend/settings" className="mb-4" />
      <UsersManagement />
    </div>
  );
}
