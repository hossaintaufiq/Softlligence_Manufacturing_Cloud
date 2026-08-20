'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function TenantPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const tenantsData = localStorage.getItem('smc_tenants');
      if (tenantsData) {
        const tenants = JSON.parse(tenantsData);
        const currentTenant = tenants.find((t: any) => t.id === user.tenantId);
        if (currentTenant) {
          if (currentTenant.businessType === 'steel') {
            router.replace('/tenant/steel');
            return;
          } else if (currentTenant.businessType === 'local') {
            router.replace('/tenant/local');
            return;
          }
        }
      }
      // Default fallback
      router.replace('/tenant/garments');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-slate-400 font-mono text-xs">
      Redirecting to industry console...
    </div>
  );
}
