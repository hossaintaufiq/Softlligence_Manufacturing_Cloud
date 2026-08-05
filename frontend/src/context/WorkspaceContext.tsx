'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchMe, refreshSession, type AuthUser, type AuthTenant } from '@/lib/api/auth';
import { listFactories, type Factory } from '@/lib/api/org';

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
  isAiOpen: boolean;
  setIsAiOpen: (open: boolean) => void;
  permissions: string[];
  scopes: { factories: string[] | null } | null;
  entitlements: { modules: string[] } | null;
  refreshUser: () => Promise<void>;
  factories: Factory[];
  activeFactory: Factory | null;
  setActiveFactory: (factory: Factory | null) => void;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  // Load cached values from localStorage for instant, zero-latency initial render
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smc_cached_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [tenant, setTenant] = useState<AuthTenant | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smc_cached_tenant');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('smc_cached_is_admin') === 'true';
    }
    return false;
  });
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smc_cached_user');
      return !stored; // Instant render if cached user exists
    }
    return true;
  });

  const [permissions, setPermissions] = useState<string[]>([]);
  const [scopes, setScopes] = useState<{ factories: string[] | null } | null>(null);
  const [entitlements, setEntitlements] = useState<{ modules: string[] } | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smc_cached_entitlements');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  // Factory State
  const [factories, setFactories] = useState<Factory[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smc_cached_factories');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [activeFactory, setActiveFactoryState] = useState<Factory | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('smc_cached_active_factory');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const [isOperatorMode, setIsOperatorMode] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['/steel', '/manufacturing', '/inventory']);
  const [recents, setRecents] = useState<string[]>([]);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

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

        // Cache for next instant reload
        localStorage.setItem('smc_cached_user', JSON.stringify(meData.user));
        if (meData.tenant) {
          localStorage.setItem('smc_cached_tenant', JSON.stringify(meData.tenant));
        } else {
          localStorage.removeItem('smc_cached_tenant');
        }
        localStorage.setItem('smc_cached_is_admin', String(Boolean(meData.user.isPlatformAdmin)));
        if (meData.entitlements) {
          localStorage.setItem('smc_cached_entitlements', JSON.stringify(meData.entitlements));
        } else {
          localStorage.removeItem('smc_cached_entitlements');
        }

        // Fetch factories list if tenant exists
        if (meData.user.tenantId) {
          try {
            const list = await listFactories();
            setFactories(list);
            localStorage.setItem('smc_cached_factories', JSON.stringify(list));
            const savedFactoryId = localStorage.getItem('smc_active_factory_id');
            const found = list.find((f) => f.id === savedFactoryId);
            const activeFac = found || list[0] || null;
            setActiveFactoryState(activeFac);
            if (activeFac) {
              localStorage.setItem('smc_cached_active_factory', JSON.stringify(activeFac));
            } else {
              localStorage.removeItem('smc_cached_active_factory');
            }
          } catch {
            setFactories([]);
            setActiveFactoryState(null);
            localStorage.removeItem('smc_cached_factories');
            localStorage.removeItem('smc_cached_active_factory');
          }
        } else {
          setFactories([]);
          setActiveFactoryState(null);
          localStorage.removeItem('smc_cached_factories');
          localStorage.removeItem('smc_cached_active_factory');
        }
      } else {
        setUser(null);
        setTenant(null);
        setIsPlatformAdmin(false);
        setPermissions([]);
        setScopes(null);
        setEntitlements(null);
        setFactories([]);
        setActiveFactoryState(null);

        localStorage.removeItem('smc_cached_user');
        localStorage.removeItem('smc_cached_tenant');
        localStorage.removeItem('smc_cached_is_admin');
        localStorage.removeItem('smc_cached_entitlements');
        localStorage.removeItem('smc_cached_factories');
        localStorage.removeItem('smc_cached_active_factory');
      }
    } catch {
      setUser(null);
      setTenant(null);
      setIsPlatformAdmin(false);
      setPermissions([]);
      setScopes(null);
      setEntitlements(null);
      setFactories([]);
      setActiveFactoryState(null);

      localStorage.removeItem('smc_cached_user');
      localStorage.removeItem('smc_cached_tenant');
      localStorage.removeItem('smc_cached_is_admin');
      localStorage.removeItem('smc_cached_entitlements');
      localStorage.removeItem('smc_cached_factories');
      localStorage.removeItem('smc_cached_active_factory');
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    resolveUserSession();
  }, []);

  const setActiveFactory = (factory: Factory | null) => {
    setActiveFactoryState(factory);
    if (factory) {
      localStorage.setItem('smc_active_factory_id', factory.id);
    } else {
      localStorage.removeItem('smc_active_factory_id');
    }
  };

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
        isAiOpen,
        setIsAiOpen,
        permissions,
        scopes,
        entitlements,
        refreshUser: resolveUserSession,
        factories,
        activeFactory,
        setActiveFactory,
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
