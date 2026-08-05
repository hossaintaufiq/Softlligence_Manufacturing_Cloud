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
};

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { favorites, toggleFavorite, isPlatformAdmin } = useWorkspace();

  const allNavItems: NavItem[] = [
    { title: 'Steel Vertical', href: '/steel', icon: '🔥', badge: 'v1.0' },
    { title: 'Manufacturing Core', href: '/manufacturing', icon: '⚙️' },
    { title: 'Commercial Ops', href: '/commercial', icon: '💼' },
    { title: 'Inventory Master', href: '/inventory', icon: '📦' },
    { title: 'Dynamic Modules', href: '/modules', icon: '🧩' },
    { title: 'Organization', href: '/org', icon: '🏢' },
    { title: 'IAM Roles & Access', href: '/iam', icon: '🔑' },
    { title: 'Super Admin', href: '/admin', icon: '🛡️' },
  ];

  const navItems = allNavItems.filter((item) => {
    if (item.href === '/admin' && !isPlatformAdmin) return false;
    return true;
  });

  return (
    <aside
      className={`h-screen sticky top-0 bg-white text-slate-800 flex flex-col border-r border-slate-200 transition-all duration-300 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">S</span>
            <span className="font-bold text-sm text-slate-900 tracking-tight">Softlligence MIS</span>
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
          {!isCollapsed && <p className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Navigation</p>}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isFav = favorites.includes(item.href);
              return (
                <div key={item.href} className="flex items-center group">
                  <a
                    href={item.href}
                    className={`flex-1 flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {!isCollapsed && <span>{item.title}</span>}
                    {!isCollapsed && item.badge && (
                      <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'}`}>
                        {item.badge}
                      </span>
                    )}
                  </a>
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
        {!isCollapsed && favorites.length > 0 && (
          <div>
            <p className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pinned Favorites</p>
            <div className="space-y-1">
              {favorites.map((favPath) => {
                const nav = navItems.find((n) => n.href === favPath);
                if (!nav) return null;
                return (
                  <a
                    key={favPath}
                    href={favPath}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <span className="text-amber-500 text-xs">★</span>
                    <span className="font-medium">{nav.title}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Developer Environment Footnote */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500">
          <p className="font-semibold text-slate-700">Env: Enterprise Light</p>
          <p className="text-indigo-600">Section 14 Platform Services Active</p>
        </div>
      )}
    </aside>
  );
}
