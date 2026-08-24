'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface NavLinkItem {
  href: string;
  activeKey: string;
  text: string;
  icon: string;
}

interface NavSection {
  title: string;
  links: NavLinkItem[];
}

export default function SteelLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return null;

  // Determine active tab based on route pathname
  let activeTab = 'overview';
  if (pathname.endsWith('/overview')) activeTab = 'overview';
  else if (pathname.endsWith('/reports')) activeTab = 'reports';
  else if (pathname.endsWith('/weighbridge-gate')) activeTab = 'weighbridge-gate';
  else if (pathname.endsWith('/scrap-sourcing')) activeTab = 'scrap-sourcing';
  else if (pathname.endsWith('/furnace-log')) activeTab = 'furnace-log';
  else if (pathname.endsWith('/billet-ccm')) activeTab = 'billet-ccm';
  else if (pathname.endsWith('/rolling-mill')) activeTab = 'rolling-mill';
  else if (pathname.endsWith('/downtime-tracker')) activeTab = 'downtime-tracker';
  else if (pathname.endsWith('/quality-spectro')) activeTab = 'quality-spectro';
  else if (pathname.endsWith('/sales-dispatch')) activeTab = 'sales-dispatch';
  else if (pathname.endsWith('/yard-inventory')) activeTab = 'yard-inventory';
  else if (pathname.endsWith('/power-utilities')) activeTab = 'power-utilities';
  else if (pathname.endsWith('/ledger-expenses')) activeTab = 'ledger-expenses';
  else if (pathname.endsWith('/hrms-shifts')) activeTab = 'hrms-shifts';

  const menuSections: NavSection[] = [
    {
      title: 'Operations & Overview',
      links: [
        { href: '/tenant/steel/overview', activeKey: 'overview', text: 'Overview Dashboard', icon: 'M4 6h16M4 12h16M4 18h16' },
        { href: '/tenant/steel/reports', activeKey: 'reports', text: 'Reports & Analytics', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { href: '/tenant/steel/weighbridge-gate', activeKey: 'weighbridge-gate', text: 'Weighbridge Gate', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' }
      ]
    },
    {
      title: 'Production Line',
      links: [
        { href: '/tenant/steel/scrap-sourcing', activeKey: 'scrap-sourcing', text: 'Scrap Sourcing', icon: 'M20 7l-8-4-8 4m16 0l-8 4' },
        { href: '/tenant/steel/furnace-log', activeKey: 'furnace-log', text: 'Furnace Log', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { href: '/tenant/steel/billet-ccm', activeKey: 'billet-ccm', text: 'Billet CCM', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2' },
        { href: '/tenant/steel/rolling-mill', activeKey: 'rolling-mill', text: 'Rolling Mill', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { href: '/tenant/steel/downtime-tracker', activeKey: 'downtime-tracker', text: 'Downtime Tracker', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
      ]
    },
    {
      title: 'Quality & Logistics',
      links: [
        { href: '/tenant/steel/quality-spectro', activeKey: 'quality-spectro', text: 'Quality Spectro', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { href: '/tenant/steel/sales-dispatch', activeKey: 'sales-dispatch', text: 'Sales Dispatch', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { href: '/tenant/steel/yard-inventory', activeKey: 'yard-inventory', text: 'Yard Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' }
      ]
    },
    {
      title: 'Utilities & Finance',
      links: [
        { href: '/tenant/steel/power-utilities', activeKey: 'power-utilities', text: 'Power & Utilities', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { href: '/tenant/steel/ledger-expenses', activeKey: 'ledger-expenses', text: 'Ledger Expenses', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { href: '/tenant/steel/hrms-shifts', activeKey: 'hrms-shifts', text: 'HRMS Shifts', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
      ]
    }
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
          <div className="leading-none overflow-hidden max-w-[145px]">
            <h2 className="text-xs font-black text-slate-900 truncate">Hi-Tech Steel</h2>
            <p className="text-[8px] text-[#B48F48] font-mono tracking-wider uppercase font-extrabold mt-1">Production MIS</p>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="block lg:hidden text-slate-400 hover:text-slate-700">✕</button>
      </div>

      {/* Grouped Sidebar Sections */}
      <nav className="p-3.5 space-y-4 flex-1 overflow-y-auto min-h-0 scrollbar-thin">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h4 className="px-3 text-[9px] uppercase tracking-widest font-extrabold text-slate-400 font-mono">
              {section.title}
            </h4>
            <div className="space-y-0.5">
              {section.links.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-bold transition-all relative ${
                    activeTab === link.activeKey 
                      ? 'bg-[#FAF6EE]/60 text-[#B48F48]' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                  }`}
                >
                  {activeTab === link.activeKey && <div className="absolute left-0 top-2 w-1 h-4 bg-[#C5A059] rounded-r" />}
                  <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                  </svg>
                  <span className="truncate">{link.text}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <Link href="/tenant/steel/profile" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-between mb-3.5 cursor-pointer hover:bg-slate-100/50 p-1 rounded-xl transition-all">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#C5A059]/30 flex items-center justify-center font-bold text-[10px] text-[#B48F48]">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-black text-slate-900 truncate w-28">{user.name}</p>
              <span className="inline-flex px-1.5 py-0.2 bg-slate-100 text-[#B48F48] rounded text-[8px] font-bold uppercase tracking-wider font-mono">Steel Admin</span>
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
    <div className="h-screen w-screen flex bg-[#FAF9F6] text-slate-800 font-sans overflow-auto relative min-w-[1280px]">
      
      {/* Sidebar - Always visible in desktop layout */}
      <aside className="flex w-64 h-full bg-white border-r border-slate-200/80 flex-col justify-between flex-shrink-0 z-10">
        {sidebarElement}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="h-14 border-b border-slate-200/60 bg-white/50 backdrop-blur-xs flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 font-mono">
              <span>SMC</span>
              <span>/</span>
              <span className="truncate max-w-[85px]">{user.tenantName || 'Workspace'}</span>
              <span>/</span>
              <span className="text-slate-850 capitalize font-bold">{(activeTab || '').replace('-', ' ')}</span>
            </div>
          </div>
          
          {/* Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Profile Pill */}
            <Link href="/tenant/steel/profile" className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-[#B48F48] border border-slate-200">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold hidden md:inline">{user.name}</span>
            </Link>
          </div>
        </header>

        {/* Content Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
