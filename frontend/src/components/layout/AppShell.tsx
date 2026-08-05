'use client';

import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { CommandPalette } from './CommandPalette';
import { AiAssistantModal } from '../ai/AiAssistantModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAiOpen, setIsAiOpen } = useWorkspace();

  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/invite';
  const isPublicLanding = pathname === '/' && !user;

  // On auth routes or unauthenticated home landing, render clean viewport without sidebar/header
  if (isAuthRoute || isPublicLanding) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        {children}
      </div>
    );
  }

  // Authenticated user on dashboard routes: Render full Enterprise Dashboard Shell
  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 font-sans antialiased">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </div>
      <CommandPalette />
      <AiAssistantModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
