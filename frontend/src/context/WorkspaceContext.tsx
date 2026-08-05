'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchMe, refreshSession, type AuthUser, type AuthTenant } from '@/lib/api/auth';

type WorkspaceContextType = {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  isPlatformAdmin: boolean;
  isLoadingUser: boolean;
  isOperatorMode: boolean;
  toggleOperatorMode: () => void;
  favorites: string[];
  toggleFavorite: (path: string) => void;
  recents: string[];
  addRecent: (path: string) => void;
  isCmdPaletteOpen: boolean;
  setIsCmdPaletteOpen: (open: boolean) => void;
  permissions: string[];
  scopes: { factories: string[] | null } | null;
  entitlements: { modules: string[] } | null;
  refreshUser: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<AuthTenant | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [permissions, setPermissions] = useState<string[]>([]);
  const [scopes, setScopes] = useState<{ factories: string[] | null } | null>(null);
  const [entitlements, setEntitlements] = useState<{ modules: string[] } | null>(null);

  const [isOperatorMode, setIsOperatorMode] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['/steel', '/manufacturing', '/inventory']);
  const [recents, setRecents] = useState<string[]>([]);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const resolveUserSession = async () => {
    try {
      let meData;
      try {
        meData = await fetchMe();
      } catch {
        await refreshSession();
        meData = await fetchMe();
      }
      if (meData?.user) {
        setUser(meData.user);
        setTenant(meData.tenant);
        setIsPlatformAdmin(Boolean(meData.user.isPlatformAdmin));
        setPermissions(meData.permissions || []);
        setScopes(meData.scopes || null);
        setEntitlements(meData.entitlements || null);
      } else {
        setUser(null);
        setTenant(null);
        setIsPlatformAdmin(false);
        setPermissions([]);
        setScopes(null);
        setEntitlements(null);
      }
    } catch {
      setUser(null);
      setTenant(null);
      setIsPlatformAdmin(false);
      setPermissions([]);
      setScopes(null);
      setEntitlements(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    resolveUserSession();
  }, []);

  // Global Routing Middleware Protection
  useEffect(() => {
    if (isLoadingUser) return;

    const publicRoutes = ['/login', '/register', '/invite'];
    const isPublic = publicRoutes.includes(pathname);

    if (!user) {
      // Unauthenticated users trying to access protected routes go to /login
      if (!isPublic) {
        router.replace('/login');
      }
    } else {
      // Authenticated users trying to access /login, /register, /invite, or / go to dashboard
      if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/invite') {
        if (isPlatformAdmin) {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      }

      // Prevent standard users from entering the platform super admin console
      if (pathname.startsWith('/admin') && !isPlatformAdmin) {
        router.replace('/dashboard');
      }
    }
  }, [user, isLoadingUser, pathname, isPlatformAdmin, router]);

  useEffect(() => {
    const storedFavs = localStorage.getItem('smc_favorites');
    if (storedFavs) {
      try { setFavorites(JSON.parse(storedFavs)); } catch {}
    }
    const storedRecents = localStorage.getItem('smc_recents');
    if (storedRecents) {
      try { setRecents(JSON.parse(storedRecents)); } catch {}
    }
  }, []);

  const toggleOperatorMode = () => {
    setIsOperatorMode((prev) => !prev);
  };

  const toggleFavorite = (path: string) => {
    setFavorites((prev) => {
      const next = prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path];
      localStorage.setItem('smc_favorites', JSON.stringify(next));
      return next;
    });
  };

  const addRecent = (path: string) => {
    setRecents((prev) => {
      const filtered = prev.filter((p) => p !== path);
      const next = [path, ...filtered].slice(0, 10);
      localStorage.setItem('smc_recents', JSON.stringify(next));
      return next;
    });
  };

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        tenant,
        isPlatformAdmin,
        isLoadingUser,
        isOperatorMode,
        toggleOperatorMode,
        favorites,
        toggleFavorite,
        recents,
        addRecent,
        isCmdPaletteOpen,
        setIsCmdPaletteOpen,
        permissions,
        scopes,
        entitlements,
        refreshUser: resolveUserSession,
      }}
    >
      <div className={`${isOperatorMode ? 'operator-mode' : ''}`}>{children}</div>
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
