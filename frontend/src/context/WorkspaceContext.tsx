'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<AuthTenant | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [isOperatorMode, setIsOperatorMode] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['/steel', '/manufacturing', '/inventory']);
  const [recents, setRecents] = useState<string[]>([]);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let meData;
        try {
          meData = await fetchMe();
        } catch {
          await refreshSession();
          meData = await fetchMe();
        }
        if (!cancelled && meData?.user) {
          setUser(meData.user);
          setTenant(meData.tenant);
          setIsPlatformAdmin(Boolean(meData.user.isPlatformAdmin));
        }
      } catch {
        // Fallback for dev mode preview if auth server is unreachable
      } finally {
        if (!cancelled) setIsLoadingUser(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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

