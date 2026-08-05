'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';

type NavItem = {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  moduleCode?: string;
};

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { favorites, toggleFavorite, isPlatformAdmin, entitlements } = useWorkspace();

  const allNavItems: NavItem[] = [
    { title: 'Overview', href: '/dashboard', icon: '📊' },
    { title: 'Steel Vertical', href: '/steel', icon: '🔥', badge: 'Steel Template', moduleCode: 'steel' },
    { title: 'Manufacturing Core', href: '/manufacturing', icon: '⚙️', moduleCode: 'manufacturing' },
    { title: 'Inventory Master', href: '/inventory', icon: '📦', moduleCode: 'inventory' },
    { title: 'Commercial Ops', href: '/commercial', icon: '💼', moduleCode: 'commercial' },
    { title: 'Executive Analytics', href: '/analytics', icon: '📈' },
    { title: 'Dynamic Modules', href: '/modules', icon: '🧩' },
    { title: 'My Profile', href: '/profile', icon: '👤' },
    { title: 'Organization', href: '/org', icon: '🏢', moduleCode: 'org' },
    { title: 'Users & Roles', href: '/iam', icon: '🔑', moduleCode: 'iam' },
    { title: 'Super Admin', href: '/admin', icon: '🛡️' },
  ];

  // Filter based on entitlements and role scope
  const navItems = isPlatformAdmin
    ? [
        { title: 'Super Admin', href: '/admin', icon: '🛡️' },
        { title: 'My Profile', href: '/profile', icon: '👤' },
      ]
    : allNavItems.filter((item) => {
        if (item.href === '/admin') return false; // Hide Super Admin link for standard users
        if (item.moduleCode && entitlements && !entitlements.modules.includes(item.moduleCode)) {
          return false;
        }
        return true;
      });

  return (
    <aside
      className={`h-screen sticky top-0 bg-white text-slate-800 flex flex-col border-r border-slate-200 transition-all duration-300 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 bg-slate-50/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              S
            </span>
            <span className="font-bold text-xs text-slate-900 tracking-tight">
              Softlligence Cloud
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors text-xs"
        >
          {isCollapsed ? '➡️' : '⬅️'}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <div>
          {!isCollapsed && (
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Workspace Modules
            </p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isFav = favorites.includes(item.href);
              return (
                <div key={item.href} className="flex items-center group">
                  <Link
                    href={item.href}
                    className={`flex-1 flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {!isCollapsed && <span>{item.title}</span>}
                    {!isCollapsed && item.badge && (
                      <span className={`ml-auto text-[8px] px-1.5 py-0.5 rounded font-semibold ${isActive ? 'bg-indigo-200 text-indigo-900' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                  {!isCollapsed && (
                    <button
                      onClick={() => toggleFavorite(item.href)}
                      className={`p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity ${
                        isFav ? 'opacity-100 text-amber-500' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={isFav ? 'Remove Favorite' : 'Add Favorite'}
                    >
                      ★
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Favorites Section */}
        {!isCollapsed && !isPlatformAdmin && favorites.length > 0 && (
          <div>
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pinned Favorites
            </p>
            <div className="space-y-1">
              {favorites.map((favPath) => {
                const nav = allNavItems.find((n) => n.href === favPath);
                if (!nav) return null;
                return (
                  <Link
                    key={favPath}
                    href={favPath}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <span className="text-amber-500 text-xs">★</span>
                    <span className="font-semibold">{nav.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Environment Details */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500">
          <p className="font-semibold text-slate-700">Softlligence Cloud v1.0</p>
          <p className="text-indigo-600">{isPlatformAdmin ? 'Super Admin Mode' : 'Enterprise Tenant Mode'}</p>
        </div>
      )}
    </aside>
  );
}
