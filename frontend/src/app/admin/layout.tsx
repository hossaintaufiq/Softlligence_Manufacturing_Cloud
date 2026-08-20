'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Security guard redirect if not authorized
  useEffect(() => {
    if (!loading && (!user || user.role !== 'super-admin')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'super-admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-slate-400 font-mono text-xs">
        Authenticating Core Node...
      </div>
    );
  }

  // Determine active tab based on route pathname
  let activeTab = 'subscriptions';
  if (pathname.includes('/infrastructure')) activeTab = 'infrastructure';
  else if (pathname.includes('/database')) activeTab = 'database';
  else if (pathname.includes('/audit')) activeTab = 'audit';
  else if (pathname.includes('/garments-monitor')) activeTab = 'garments-monitor';
  else if (pathname.includes('/profile')) activeTab = 'profile';

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between overflow-hidden">
      <div className="flex flex-col">
        {/* Sidebar Header Brand */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-[#C5A059]/20 flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 leading-none">
                SMC SuperAdmin
              </h2>
              <p className="text-[8px] text-[#B48F48] font-mono tracking-wider uppercase font-extrabold mt-1">
                Corporate Core
              </p>
            </div>
          </div>
          {/* Close button for Mobile Sidebar */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="block lg:hidden text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-2.5 pb-2 font-mono">
            Control Panel
          </p>

          <Link
            href="/admin"
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'subscriptions'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'subscriptions' && (
              <div className="absolute left-0 top-2.5 w-1.5 h-5 bg-[#C5A059] rounded-r" />
            )}
            <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
            </svg>
            <span>Tenant Subscriptions</span>
          </Link>

          <Link
            href="/admin/infrastructure"
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'infrastructure'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'infrastructure' && (
              <div className="absolute left-0 top-2.5 w-1.5 h-5 bg-[#C5A059] rounded-r" />
            )}
            <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>API Nodes Monitor</span>
          </Link>

          <Link
            href="/admin/database"
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'database'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'database' && (
              <div className="absolute left-0 top-2.5 w-1.5 h-5 bg-[#C5A059] rounded-r" />
            )}
            <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span>Database Telemetry</span>
          </Link>

          <Link
            href="/admin/audit"
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'audit'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'audit' && (
              <div className="absolute left-0 top-2.5 w-1.5 h-5 bg-[#C5A059] rounded-r" />
            )}
            <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Security Audit Logs</span>
          </Link>

          <Link
            href="/admin/garments-monitor"
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'garments-monitor'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'garments-monitor' && (
              <div className="absolute left-0 top-2.5 w-1.5 h-5 bg-[#C5A059] rounded-r" />
            )}
            <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v16M8 7l4-4 4 4M4 10l8 4 8-4" />
            </svg>
            <span>Garments Production Monitor</span>
          </Link>

          <Link
            href="/admin/profile"
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'profile'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'profile' && (
              <div className="absolute left-0 top-2.5 w-1.5 h-5 bg-[#C5A059] rounded-r" />
            )}
            <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profile & Settings</span>
          </Link>
        </nav>
      </div>

      {/* Sidebar Footer User Details */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <Link 
          href="/admin/profile"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center justify-between mb-3.5 cursor-pointer hover:bg-slate-100/50 p-1 rounded-xl transition-all"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#C5A059]/30 flex items-center justify-center font-bold text-[10px] text-[#B48F48]">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-black text-slate-900 truncate w-28">{user.name}</p>
              <p className="text-[8px] text-slate-400 font-mono font-medium truncate w-28">
                {user.email}
              </p>
            </div>
          </div>
        </Link>
        <button
          onClick={logout}
          className="w-full py-2 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-[10px] font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1"
        >
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex bg-[#FAF9F6] text-slate-800 font-sans overflow-hidden relative">
      
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex w-64 h-full bg-white border-r border-slate-200/80 flex-col justify-between flex-shrink-0 z-10">
        {sidebarContent}
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* MOBILE SIDEBAR SLIDE PANEL */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between transition-transform duration-300 transform lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        
        {/* Top Header Breadcrumbs */}
        <header className="h-14 border-b border-slate-200/60 bg-white/50 backdrop-blur-xs flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="block lg:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-lg focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 font-mono">
              <span>SMC</span>
              <span>/</span>
              <span>SUPER ADMIN</span>
              <span>/</span>
              <span className="text-slate-800 capitalize font-bold">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 font-mono hidden sm:block">
            NODE RUNTIME: LOCAL HOST
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50/50 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
