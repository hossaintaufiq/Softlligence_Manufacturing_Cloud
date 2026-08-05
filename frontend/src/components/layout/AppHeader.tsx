'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';

export function AppHeader() {
  const {
    setIsCmdPaletteOpen,
    isOperatorMode,
    toggleOperatorMode,
    user,
    tenant,
    isPlatformAdmin,
    factories,
    activeFactory,
    setActiveFactory,
    isAiOpen,
    setIsAiOpen,
  } = useWorkspace();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const tenantDisplayName = tenant ? `${tenant.name} (${tenant.slug})` : 'Active Workspace';

  // Format breadcrumbs dynamically
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbText = pathParts.length > 0
    ? pathParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' > ')
    : 'Overview';

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    window.location.href = '/login';
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left section: Switcher & Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            {tenantDisplayName}
          </span>
        </div>

        {/* Factory Switcher */}
        {!isPlatformAdmin && factories.length > 0 && (
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-400 font-bold">Plant:</span>
            <select
              value={activeFactory?.id || ''}
              onChange={(e) => {
                const found = factories.find((f) => f.id === e.target.value);
                setActiveFactory(found || null);
              }}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              {factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>
        )}

        <span className="text-slate-300 text-xs hidden sm:inline">/</span>
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline font-mono">
          {breadcrumbText}
        </span>
      </div>

      {/* Right section: System controls & profile dropdown */}
      <div className="flex items-center space-x-3">
        {/* Ask ERP AI Button */}
        <button
          onClick={() => setIsAiOpen(true)}
          className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-bold transition-colors shadow-2xs"
        >
          <span>🤖</span>
          <span>Ask ERP AI</span>
        </button>

        {/* Global Search CMD/⌘K */}
        <button
          onClick={() => setIsCmdPaletteOpen(true)}
          className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium transition-colors"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden md:inline">Search...</span>
          <kbd className="font-mono text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">⌘K</kbd>
        </button>

        {/* Operator Touch HMI Toggle */}
        <button
          onClick={toggleOperatorMode}
          title="Toggle touch HMI layout"
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
            isOperatorMode
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          HMI Mode
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 relative transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 space-y-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Alert Center</h4>
                <span className="text-[9px] text-indigo-600 font-mono">Real-time feeds</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-100">
                  <p className="font-bold text-indigo-950">Melt Yield Peak Hit</p>
                  <p className="text-[11px] text-indigo-700 mt-0.5">Furnace 1 hit 94.2% yield log</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-100">
                  <p className="font-bold text-emerald-950">New Dispatch Issued</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">50 MT Rebar dispatched to Site A</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown Menu */}
        {user && (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden z-50">
                <div className="p-3.5 text-xs">
                  <p className="font-bold text-slate-900">{user.name || 'Operator'}</p>
                  <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">{user.email}</p>
                  <div className="mt-2 flex items-center space-x-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {isPlatformAdmin ? 'Platform Admin' : 'Company Admin'}
                    </span>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5 text-xs">
                  <Link
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                  >
                    👤 My Profile
                  </Link>
                  <Link
                    href="/org"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                  >
                    🏢 Company Profile
                  </Link>
                  <Link
                    href="/iam"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
                  >
                    🔑 Roles & Access
                  </Link>
                </div>

                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-bold transition-colors text-xs"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
