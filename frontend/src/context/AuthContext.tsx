'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'super-admin' | 'tenant-admin';

export type UserPreferences = {
  density: 'cozy' | 'compact';
  defaultTab?: string;
};

export type AuthUser = {
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
  preferences?: UserPreferences;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: { name: string; password?: string; tenantName?: string; preferences?: UserPreferences }) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, { hash: string; name: string; role: UserRole; tenantId?: string; tenantName?: string; preferences?: UserPreferences }> = {
  'admin@softlligence.com': {
    hash: 'admin123',
    name: 'System Administrator',
    role: 'super-admin',
    preferences: { density: 'cozy', defaultTab: 'subscriptions' }
  },
  'manager@acme.com': {
    hash: 'manager123',
    name: 'Sarah Jenkins',
    role: 'tenant-admin',
    tenantId: 'acme',
    tenantName: 'Acme Garments ERP',
    preferences: { density: 'cozy', defaultTab: 'overview' }
  },
  'manager@steel.com': {
    hash: 'steel123',
    name: 'James Sterling',
    role: 'tenant-admin',
    tenantId: 'steelmill',
    tenantName: 'Acme Steel Mill',
    preferences: { density: 'cozy', defaultTab: 'overview' }
  },
  'manager@local.com': {
    hash: 'local123',
    name: 'Claire Adams',
    role: 'tenant-admin',
    tenantId: 'localbiz',
    tenantName: 'Apex Local Business',
    preferences: { density: 'cozy', defaultTab: 'overview' }
  },
};

// Seed Local Data if not present
const seedLocalDatabase = () => {
  if (typeof window === 'undefined') return;

  // Check if steel admin is seeded, if not, reset database seeds to include new multi-tenant roles
  const usersData = localStorage.getItem('smc_users');
  if (!usersData || !JSON.parse(usersData)['manager@steel.com']) {
    localStorage.setItem('smc_users', JSON.stringify(DEMO_USERS));
    localStorage.setItem(
      'smc_tenants',
      JSON.stringify([
        { id: 'acme', name: 'Acme Garments ERP', slug: 'acme', status: 'active', planCode: 'Enterprise', createdAt: '2026-08-01', businessType: 'garments' },
        { id: 'steelmill', name: 'Acme Steel Mill', slug: 'steelmill', status: 'active', planCode: 'Enterprise', createdAt: '2026-08-20', businessType: 'steel' },
        { id: 'localbiz', name: 'Apex Local Business', slug: 'localbiz', status: 'active', planCode: 'Standard', createdAt: '2026-08-20', businessType: 'local' },
        { id: 'manchester', name: 'Manchester Foundries', slug: 'manchester', status: 'active', planCode: 'Growth', createdAt: '2026-08-10', businessType: 'steel' },
        { id: 'globalalloys', name: 'Global Alloys LLC', slug: 'globalalloys', status: 'suspended', planCode: 'Standard', createdAt: '2026-08-12', businessType: 'steel' },
      ])
    );
  }

  if (!localStorage.getItem('smc_users')) {
    localStorage.setItem('smc_users', JSON.stringify(DEMO_USERS));
  }

  if (!localStorage.getItem('smc_tenants')) {
    localStorage.setItem(
      'smc_tenants',
      JSON.stringify([
        { id: 'acme', name: 'Acme Garments ERP', slug: 'acme', status: 'active', planCode: 'Enterprise', createdAt: '2026-08-01', businessType: 'garments' },
        { id: 'steelmill', name: 'Acme Steel Mill', slug: 'steelmill', status: 'active', planCode: 'Enterprise', createdAt: '2026-08-20', businessType: 'steel' },
        { id: 'localbiz', name: 'Apex Local Business', slug: 'localbiz', status: 'active', planCode: 'Standard', createdAt: '2026-08-20', businessType: 'local' },
        { id: 'manchester', name: 'Manchester Foundries', slug: 'manchester', status: 'active', planCode: 'Growth', createdAt: '2026-08-10', businessType: 'steel' },
        { id: 'globalalloys', name: 'Global Alloys LLC', slug: 'globalalloys', status: 'suspended', planCode: 'Standard', createdAt: '2026-08-12', businessType: 'steel' },
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

    const storedUsers = localStorage.getItem('smc_users');
    let usersDb = DEMO_USERS;
    if (storedUsers) {
      try {
        usersDb = JSON.parse(storedUsers);
      } catch (e) {
        console.error('Error parsing stored users database, using memory seeding');
      }
    }

    const found = usersDb[email.toLowerCase().trim()];
    if (found && found.hash === password) {
      const defaultPrefs: UserPreferences = {
        density: 'cozy',
        defaultTab: found.role === 'super-admin' ? 'subscriptions' : 'overview',
      };

      const authUser: AuthUser = {
        email: email.toLowerCase().trim(),
        name: found.name,
        role: found.role,
        tenantId: found.tenantId,
        tenantName: found.tenantName,
        preferences: found.preferences || defaultPrefs,
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

  const updateProfile = async (updatedData: {
    name: string;
    password?: string;
    tenantName?: string;
    preferences?: UserPreferences;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No active session' };

    const storedUsers = localStorage.getItem('smc_users');
    if (!storedUsers) return { success: false, error: 'User database not found' };

    let usersMap;
    try {
      usersMap = JSON.parse(storedUsers);
    } catch (e) {
      return { success: false, error: 'Failed to parse user database' };
    }

    const userEmailKey = user.email.toLowerCase().trim();
    const existingUserData = usersMap[userEmailKey];

    if (!existingUserData) return { success: false, error: 'User profile not found' };

    // Update in database map
    existingUserData.name = updatedData.name;
    if (updatedData.password) {
      existingUserData.hash = updatedData.password;
    }
    if (updatedData.preferences) {
      existingUserData.preferences = updatedData.preferences;
    }

    if (user.role === 'tenant-admin' && updatedData.tenantName) {
      existingUserData.tenantName = updatedData.tenantName;

      // Update tenant list (smc_tenants)
      const storedTenants = localStorage.getItem('smc_tenants');
      if (storedTenants && user.tenantId) {
        try {
          const tenants = JSON.parse(storedTenants);
          const updatedTenants = tenants.map((t: any) => {
            if (t.id === user.tenantId) {
              return { ...t, name: updatedData.tenantName };
            }
            return t;
          });
          localStorage.setItem('smc_tenants', JSON.stringify(updatedTenants));
        } catch (e) {
          console.error('Failed to update tenant list', e);
        }
      }
    }

    usersMap[userEmailKey] = existingUserData;
    localStorage.setItem('smc_users', JSON.stringify(usersMap));

    // Update current active user object
    const updatedUser: AuthUser = {
      ...user,
      name: updatedData.name,
      tenantName: user.role === 'tenant-admin' ? updatedData.tenantName : user.tenantName,
      preferences: updatedData.preferences || user.preferences,
    };

    setUser(updatedUser);
    localStorage.setItem('smc_active_user', JSON.stringify(updatedUser));

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
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
