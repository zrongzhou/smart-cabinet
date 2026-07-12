'use client';

import BackButton from '@/components/admin/BackButton';
import ServiceManager from '@/components/admin/ServiceManager';

export const dynamic = 'force-dynamic';

export default function XiaozhouBackendServicesPage() {
  return (
    <div>
      <BackButton href="/xiaozhouBackend/settings" className="mb-4" />
      <ServiceManager />
    </div>
  );
}
