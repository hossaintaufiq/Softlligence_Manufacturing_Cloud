'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Security guard redirect if not authorized
  useEffect(() => {
    if (!loading && (!user || user.role !== 'tenant-admin')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || !user.tenantId || user.role !== 'tenant-admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-slate-400 font-mono text-xs">
        Loading Corporate Workspace...
      </div>
    );
  }

  // Determine active tab based on route pathname
  let activeTab = 'overview';
  if (pathname.includes('/merchandising')) activeTab = 'merchandising';
  else if (pathname.includes('/production-planning')) activeTab = 'production-planning';
  else if (pathname.includes('/procurement-management')) activeTab = 'procurement-management';
  else if (pathname.includes('/inventory-management')) activeTab = 'inventory-management';
  else if (pathname.includes('/garments-production')) activeTab = 'garments-production';
  else if (pathname.includes('/commercial')) activeTab = 'commercial';
  else if (pathname.includes('/financial-accounting')) activeTab = 'financial-accounting';
  else if (pathname.includes('/hrms')) activeTab = 'hrms';
  else if (pathname.includes('/textile-manufacturing')) activeTab = 'textile-manufacturing';
  else if (pathname.includes('/industrial-engineering')) activeTab = 'industrial-engineering';
  else if (pathname.includes('/quality-management')) activeTab = 'quality-management';
  else if (pathname.includes('/printing-embroidery')) activeTab = 'printing-embroidery';
  else if (pathname.includes('/system-configuration')) activeTab = 'system-configuration';
  else if (pathname.includes('/profile')) activeTab = 'profile';

  // Sidebar navigation panel grouping JSX
  const sidebarElement = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sidebar Header Brand */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/40 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-[#C5A059]/20 flex items-center justify-center text-sm shadow-xs">
            🏢
          </div>
          <div className="leading-none overflow-hidden max-w-[140px]">
            <h2 className="text-xs font-black text-slate-900 truncate">
              {user.tenantName || 'Workspace'}
            </h2>
            <p className="text-[8px] text-[#B48F48] font-mono tracking-wider uppercase font-extrabold mt-1">
              Workspace Node
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="block lg:hidden text-slate-400 hover:text-slate-700"
        >
          ✕
        </button>
      </div>

      {/* Navigation Links Scroll Box */}
      <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto min-h-0 scrollbar-thin">
        <Link
          href="/tenant"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'overview'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          Overview
        </Link>

        <Link
          href="/tenant/merchandising"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'merchandising'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          Merchandising
        </Link>

        <Link
          href="/tenant/production-planning"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'production-planning'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          Production Planning
        </Link>

        <Link
          href="/tenant/garments-production"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'garments-production'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          Garments Production
        </Link>

        <Link
          href="/tenant/textile-manufacturing"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'textile-manufacturing'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          Textile Mfg.
        </Link>

        <Link
          href="/tenant/procurement-management"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'procurement-management'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          Procurement
        </Link>

        <Link
          href="/tenant/inventory-management"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'inventory-management'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          Inventory Management
        </Link>

        <Link
          href="/tenant/printing-embroidery"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'printing-embroidery'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          Printing & Embroidery
        </Link>

        <Link
          href="/tenant/commercial"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'commercial'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          Commercial Gate
        </Link>

        <Link
          href="/tenant/financial-accounting"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'financial-accounting'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          Financial Ledger
        </Link>

        <Link
          href="/tenant/hrms"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'hrms'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          HRMS Payroll
        </Link>

        <Link
          href="/tenant/industrial-engineering"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'industrial-engineering'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          IE Operations
        </Link>

        <Link
          href="/tenant/quality-management"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'quality-management'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          Quality Audits
        </Link>

        <Link
          href="/tenant/system-configuration"
          onClick={() => setIsSidebarOpen(false)}
          className={`w-full flex items-center justify-start px-5 py-2.5 rounded-full text-sm font-extrabold transition-all border ${
            activeTab === 'system-configuration'
              ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
              : 'bg-transparent border-transparent text-slate-700 hover:text-slate-950 hover:bg-slate-50/60'
          }`}
        >
          System Settings
        </Link>
      </nav>

      {/* Sidebar Footer User Details */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <Link 
          href="/tenant/profile"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center justify-between mb-3.5 cursor-pointer hover:bg-slate-100/50 p-1 rounded-xl transition-all"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#C5A059]/30 flex items-center justify-center font-bold text-[10px] text-[#B48F48]">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-black text-slate-900 truncate w-28">{user.name}</p>
              <span className="inline-flex px-1.5 py-0.2 bg-slate-100 text-[#B48F48] rounded text-[8px] font-bold uppercase tracking-wider font-mono">
                {user.role.split('-')[1]}
              </span>
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
        {sidebarElement}
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
        {sidebarElement}
      </aside>

      {/* MAIN CONTENT AREA: Right Side */}
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
              <span className="truncate max-w-[80px]">{(user.tenantName || 'Workspace').toUpperCase()}</span>
              <span>/</span>
              <span className="text-slate-800 capitalize font-bold">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase hidden sm:block">
              ROLE: {user.role.replace('-', ' ')}
            </div>
            <Link
              href="/tenant/profile"
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-[#B48F48] border border-slate-200">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold hidden md:inline">{user.name}</span>
            </Link>
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
