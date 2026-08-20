'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Global security verification check
  useEffect(() => {
    if (!loading && user) {
      if (user.role !== 'tenant-admin') {
        router.replace('/login');
      } else {
        const tenantsData = localStorage.getItem('smc_tenants');
        if (tenantsData) {
          const tenants = JSON.parse(tenantsData);
          const currentTenant = tenants.find((t: any) => t.id === user.tenantId);
          if (currentTenant && currentTenant.status === 'suspended') {
            logout();
            alert('Your corporate workspace node has been suspended by the platform administrator.');
            router.replace('/login');
          }
        }
      }
    } else if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router, logout]);

  if (loading || !user || !user.tenantId || user.role !== 'tenant-admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-slate-400 font-mono text-xs">
        Verifying Corporate Credentials...
      </div>
    );
  }

  return <>{children}</>;
}
