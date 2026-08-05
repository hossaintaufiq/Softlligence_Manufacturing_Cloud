'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function HomePage() {
  const { user, isPlatformAdmin, isLoadingUser } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (isLoadingUser) return;
    if (!user) {
      router.replace('/login');
    } else {
      if (isPlatformAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, isPlatformAdmin, isLoadingUser, router]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-xs text-slate-500 font-semibold font-mono animate-pulse">
        Resolving corporate workspace context...
      </p>
    </main>
  );
}
