'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  moduleCode?: string;
};

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { favorites, toggleFavorite, isPlatformAdmin, entitlements, isLoadingUser } = useWorkspace();

  const allNavItems: NavItem[] = [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      title: 'Steel Vertical',
      href: '/steel',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      badge: 'v1.0',
      moduleCode: 'steel',
    },
    {
      title: 'Manufacturing Core',
      href: '/manufacturing',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      moduleCode: 'manufacturing',
    },
    {
      title: 'Inventory Master',
      href: '/inventory',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      moduleCode: 'inventory',
    },
    {
      title: 'Commercial Ops',
      href: '/commercial',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" />
        </svg>
      ),
      moduleCode: 'commercial',
    },
    {
      title: 'Financial Ledger',
      href: '/accounting',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      moduleCode: 'accounting',
    },
    {
      title: 'Executive Analytics',
      href: '/analytics',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Dynamic Modules',
      href: '/modules',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a2 2 0 002 2h3a2 2 0 012 2v3a2 2 0 01-2 2h-1a2 2 0 100 4h1a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-1a2 2 0 10-4 0v1a2 2 0 01-2 2H2a2 2 0 01-2-2v-3a2 2 0 012-2h1a2 2 0 100-4H2a2 2 0 01-2-2V9a2 2 0 012-2h3a2 2 0 002-2V4z" />
        </svg>
      ),
    },
    {
      title: 'My Profile',
      href: '/profile',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: 'Organization',
      href: '/org',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      moduleCode: 'org',
    },
    {
      title: 'Users & Roles',
      href: '/iam',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      moduleCode: 'iam',
    },
    {
      title: 'Super Admin',
      href: '/admin',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  // Filter based on entitlements and role scope
  const navItems = isPlatformAdmin
    ? [
        allNavItems[0], // Overview
        allNavItems[11], // Super Admin
        allNavItems[8], // Profile
      ]
    : allNavItems.filter((item) => {
        if (item.href === '/admin') return false; // Hide Super Admin link for standard users
        if (isLoadingUser && item.moduleCode) {
          return false; // Hide all module-based items while loading entitlements
        }
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
            <span className="font-extrabold text-xs text-slate-900 tracking-tight">
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
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <span className={`${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{item.icon}</span>
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
