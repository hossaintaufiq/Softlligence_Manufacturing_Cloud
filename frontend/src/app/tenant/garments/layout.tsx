'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function GarmentsLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return null;

  // Determine active tab based on route pathname
  let activeTab = 'overview';
  if (pathname.includes('/merchandising')) activeTab = 'merchandising';
  else if (pathname.includes('/production-planning')) activeTab = 'production-planning';
  else if (pathname.includes('/garments-production')) activeTab = 'garments-production';
  else if (pathname.includes('/textile-manufacturing')) activeTab = 'textile-manufacturing';
  else if (pathname.includes('/procurement-management')) activeTab = 'procurement-management';
  else if (pathname.includes('/inventory-management')) activeTab = 'inventory-management';
  else if (pathname.includes('/printing-embroidery')) activeTab = 'printing-embroidery';
  else if (pathname.includes('/commercial')) activeTab = 'commercial';
  else if (pathname.includes('/financial-accounting')) activeTab = 'financial-accounting';
  else if (pathname.includes('/hrms')) activeTab = 'hrms';
  else if (pathname.includes('/industrial-engineering')) activeTab = 'industrial-engineering';
  else if (pathname.includes('/quality-management')) activeTab = 'quality-management';
  else if (pathname.includes('/system-configuration')) activeTab = 'system-configuration';
  else if (pathname.includes('/profile')) activeTab = 'profile';

  const navLinks = [
    { href: '/tenant/garments', activeKey: 'overview', text: 'Overview', icon: 'M4 6h16M4 12h16M4 18h16' },
    { href: '/tenant/garments/merchandising', activeKey: 'merchandising', text: 'Merchandising', icon: 'M12 3v16M8 7l4-4 4 4M4 10l8 4-8-4' },
    { href: '/tenant/garments/production-planning', activeKey: 'production-planning', text: 'Production Planning', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { href: '/tenant/garments/garments-production', activeKey: 'garments-production', text: 'Garments Production', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2' },
    { href: '/tenant/garments/textile-manufacturing', activeKey: 'textile-manufacturing', text: 'Textile Mfg.', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5' },
    { href: '/tenant/garments/procurement-management', activeKey: 'procurement-management', text: 'Procurement', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { href: '/tenant/garments/inventory-management', activeKey: 'inventory-management', text: 'Inventory Management', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { href: '/tenant/garments/printing-embroidery', activeKey: 'printing-embroidery', text: 'Printing & Embroidery', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z' },
    { href: '/tenant/garments/commercial', activeKey: 'commercial', text: 'Commercial Gate', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
    { href: '/tenant/garments/financial-accounting', activeKey: 'financial-accounting', text: 'Financial Ledger', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { href: '/tenant/garments/hrms', activeKey: 'hrms', text: 'HRMS Payroll', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { href: '/tenant/garments/industrial-engineering', activeKey: 'industrial-engineering', text: 'IE Operations', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { href: '/tenant/garments/quality-management', activeKey: 'quality-management', text: 'Quality Audits', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { href: '/tenant/garments/system-configuration', activeKey: 'system-configuration', text: 'System Settings', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' }
  ];

  const sidebarElement = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/40 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-[#C5A059]/20 flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4 text-[#B48F48]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
            </svg>
          </div>
          <div className="leading-none overflow-hidden max-w-[140px]">
            <h2 className="text-xs font-black text-slate-900 truncate">{user.tenantName || 'Workspace'}</h2>
            <p className="text-[8px] text-[#B48F48] font-mono tracking-wider uppercase font-extrabold mt-1">Garments ERP</p>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="block lg:hidden text-slate-400 hover:text-slate-700">✕</button>
      </div>

      {/* Navigation Loop */}
      <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto min-h-0 scrollbar-thin">
        {navLinks.map((link, idx) => (
          <Link
            key={idx}
            href={link.href}
            onClick={() => setIsSidebarOpen(false)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === link.activeKey ? 'bg-[#FAF6EE]/60 text-[#B48F48]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === link.activeKey && <div className="absolute left-0 top-2.5 w-1.5 h-5 bg-[#C5A059] rounded-r" />}
            <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
            </svg>
            <span>{link.text}</span>
          </Link>
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <Link href="/tenant/garments/profile" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-between mb-3.5 cursor-pointer hover:bg-slate-100/50 p-1 rounded-xl transition-all">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#C5A059]/30 flex items-center justify-center font-bold text-[10px] text-[#B48F48]">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-black text-slate-900 truncate w-28">{user.name}</p>
              <span className="inline-flex px-1.5 py-0.2 bg-slate-100 text-[#B48F48] rounded text-[8px] font-bold uppercase tracking-wider font-mono">Garments Admin</span>
            </div>
          </div>
        </Link>
        <button onClick={logout} className="w-full py-2 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-[10px] font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1">
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex bg-[#FAF9F6] text-slate-800 font-sans overflow-hidden relative">
      <aside className="hidden lg:flex w-64 h-full bg-white border-r border-slate-200/80 flex-col justify-between flex-shrink-0 z-10">{sidebarElement}</aside>
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden" />}
      <aside className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between transition-transform duration-300 transform lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>{sidebarElement}</aside>

      <div className="flex-1 h-full flex flex-col overflow-hidden">
        <header className="h-14 border-b border-slate-200/60 bg-white/50 backdrop-blur-xs flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsSidebarOpen(true)} className="block lg:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-lg focus:outline-none">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 font-mono">
              <span>SMC</span>
              <span>/</span>
              <span className="truncate max-w-[85px]">{(user.tenantName || 'Workspace').toUpperCase()}</span>
              <span>/</span>
              <span className="text-slate-850 capitalize font-bold">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/tenant/garments/profile" className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-[#B48F48] border border-slate-200">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold hidden md:inline">{user.name}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50/50 min-h-0">{children}</main>
      </div>
    </div>
  );
}
