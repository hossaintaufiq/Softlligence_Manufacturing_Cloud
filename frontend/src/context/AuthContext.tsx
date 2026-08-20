'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'super-admin' | 'tenant-admin';

export type AuthUser = {
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pre-seeded demo credentials
const DEMO_USERS: Record<string, { hash: string; name: string; role: UserRole; tenantId?: string; tenantName?: string }> = {
  'admin@softlligence.com': {
    hash: 'admin123',
    name: 'System Administrator',
    role: 'super-admin',
  },
  'manager@acme.com': {
    hash: 'manager123',
    name: 'Sarah Jenkins',
    role: 'tenant-admin',
    tenantId: 'acme',
    tenantName: 'Acme Steel Corp',
  },
};

// Seed Local Data if not present
const seedLocalDatabase = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('smc_tenants')) {
    localStorage.setItem(
      'smc_tenants',
      JSON.stringify([
        { id: 'acme', name: 'Acme Steel Corp', slug: 'acme', status: 'active', planCode: 'Enterprise', createdAt: '2026-08-01' },
        { id: 'manchester', name: 'Manchester Foundries', slug: 'manchester', status: 'active', planCode: 'Growth', createdAt: '2026-08-10' },
        { id: 'globalalloys', name: 'Global Alloys LLC', slug: 'globalalloys', status: 'suspended', planCode: 'Standard', createdAt: '2026-08-12' },
      ])
    );
  }

  if (!localStorage.getItem('smc_work_orders')) {
    localStorage.setItem(
      'smc_work_orders',
      JSON.stringify([
        { id: 'WO-001', docNo: 'WO-2026-001', tenantId: 'acme', status: 'completed', item: '12mm Rebar (Grade 60)', qtyPlanned: 50, qtyCompleted: 50.5, occurredAt: '2026-08-18T10:00:00Z' },
        { id: 'WO-002', docNo: 'WO-2026-002', tenantId: 'acme', status: 'in_progress', item: '8mm Steel Wire Rod', qtyPlanned: 30, qtyCompleted: 12.3, occurredAt: '2026-08-19T08:30:00Z' },
        { id: 'WO-003', docNo: 'WO-2026-003', tenantId: 'acme', status: 'draft', item: '150x150 Steel Billet', qtyPlanned: 100, qtyCompleted: 0, occurredAt: '2026-08-20T06:15:00Z' },
        { id: 'WO-004', docNo: 'WO-2026-004', tenantId: 'manchester', status: 'completed', item: 'Cast Iron Pipe 6in', qtyPlanned: 200, qtyCompleted: 204, occurredAt: '2026-08-15T09:00:00Z' },
        { id: 'WO-005', docNo: 'WO-2026-005', tenantId: 'manchester', status: 'in_progress', item: 'Industrial Grates', qtyPlanned: 500, qtyCompleted: 150, occurredAt: '2026-08-19T14:20:00Z' },
      ])
    );
  }

  if (!localStorage.getItem('smc_inventory')) {
    localStorage.setItem(
      'smc_inventory',
      JSON.stringify([
        { id: 'i1', name: 'Heavy Melting Scrap', type: 'Raw Material', qty: 1250.4, uom: 'MT', tenantId: 'acme' },
        { id: 'i2', name: '150x150 Steel Billet', type: 'WIP', qty: 340.0, uom: 'MT', tenantId: 'acme' },
        { id: 'i3', name: '12mm Rebar (Grade 60)', type: 'Finished Good', qty: 120.5, uom: 'MT', tenantId: 'acme' },
        { id: 'i4', name: 'Pig Iron Scrap', type: 'Raw Material', qty: 540.2, uom: 'MT', tenantId: 'manchester' },
        { id: 'i5', name: 'Cast Iron Castings', type: 'Finished Good', qty: 85.3, uom: 'PCS', tenantId: 'manchester' },
      ])
    );
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    seedLocalDatabase();

    const storedUser = localStorage.getItem('smc_active_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('smc_active_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Artificial delay to simulate network call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const found = DEMO_USERS[email.toLowerCase().trim()];
    if (found && found.hash === password) {
      const authUser: AuthUser = {
        email: email.toLowerCase().trim(),
        name: found.name,
        role: found.role,
        tenantId: found.tenantId,
        tenantName: found.tenantName,
      };

      setUser(authUser);
      localStorage.setItem('smc_active_user', JSON.stringify(authUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smc_active_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
