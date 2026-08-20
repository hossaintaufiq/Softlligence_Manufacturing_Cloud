'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
    } else if (user.role === 'super-admin') {
      router.replace('/admin');
    } else {
      router.replace('/tenant');
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-slate-950 text-slate-100 font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wide text-slate-400 font-mono">
          Loading Manufacturing Workspace...
        </p>
      </div>
    </div>
  );
}
