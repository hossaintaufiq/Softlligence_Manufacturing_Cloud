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
        { href: '/tenant/steel/overview', activeKey: 'overview', text: 'Executive Overview', icon: 'M4 6h16M4 12h16M4 18h16' },
        { href: '/tenant/steel/reports', activeKey: 'reports', text: 'Reports & Analytics', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { href: '/tenant/steel/weighbridge-gate', activeKey: 'weighbridge-gate', text: 'Weighbridge Gate', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' }
      ]
    },
    {
      title: 'Production Line',
      links: [
        { href: '/tenant/steel/scrap-sourcing', activeKey: 'scrap-sourcing', text: 'Scrap Sourcing', icon: 'M20 7l-8-4-8 4m16 0l-8 4' },
        { href: '/tenant/steel/furnace-log', activeKey: 'furnace-log', text: 'Furnace Smelting', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { href: '/tenant/steel/billet-ccm', activeKey: 'billet-ccm', text: 'Billet CCM Casting', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2' },
        { href: '/tenant/steel/rolling-mill', activeKey: 'rolling-mill', text: 'Hot Rolling Mill', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { href: '/tenant/steel/downtime-tracker', activeKey: 'downtime-tracker', text: 'Downtime & Outages', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
      ]
    },
    {
      title: 'Quality & Logistics',
      links: [
        { href: '/tenant/steel/quality-spectro', activeKey: 'quality-spectro', text: 'OES Spectro Lab', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
        { href: '/tenant/steel/sales-dispatch', activeKey: 'sales-dispatch', text: 'Sales & Delivery Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { href: '/tenant/steel/yard-inventory', activeKey: 'yard-inventory', text: 'Finished Yard Stock', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' }
      ]
    },
    {
      title: 'Utilities & Commercial',
      links: [
        { href: '/tenant/steel/power-utilities', activeKey: 'power-utilities', text: 'Power Grid & Utilities', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { href: '/tenant/steel/ledger-expenses', activeKey: 'ledger-expenses', text: 'Cost Ledger & CAPEX', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { href: '/tenant/steel/hrms-shifts', activeKey: 'hrms-shifts', text: 'Crew Roster & Shifts', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
      ]
    }
  ];

  const sidebarElement = (
    <div className="relative flex flex-col h-full overflow-hidden select-none bg-[url('/images/steel-mill-sidebar.jpg')] bg-cover bg-center">
      {/* Dark Gradient Overlay for Glassmorphism & High Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/88 to-slate-950/96 backdrop-blur-[3px] pointer-events-none" />

      {/* Sidebar Content (layered above overlay) */}
      <div className="relative z-10 flex flex-col h-full overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/30 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059] to-[#9E7A37] text-slate-950 flex items-center justify-center shadow-lg shadow-amber-900/30 font-black">
              <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
              </svg>
            </div>
            <div className="leading-tight overflow-hidden max-w-[160px]">
              <h2 className="text-sm font-bold text-white tracking-tight truncate">Hi-Tech Steel MIS</h2>
              <p className="text-[11px] text-[#C5A059] font-mono font-semibold tracking-wide uppercase mt-0.5">Manufacturing Cloud</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="block lg:hidden text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Grouped Sidebar Sections - Clean, No Scrollbar */}
        <nav className="p-4 space-y-5 flex-1 overflow-y-auto min-h-0 no-scrollbar">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <h4 className="px-3 text-[10.5px] uppercase tracking-wider font-bold text-amber-300/90 font-mono">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.links.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-all duration-150 relative ${
                      activeTab === link.activeKey 
                        ? 'bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-amber-500/5 text-amber-200 font-semibold border border-amber-400/40 shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {activeTab === link.activeKey && (
                      <div className="absolute left-0 top-2 w-1 h-5 bg-[#C5A059] rounded-r shadow-xs shadow-amber-400" />
                    )}
                    <svg className={`w-4 h-4 flex-shrink-0 ${activeTab === link.activeKey ? 'text-[#C5A059]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                    </svg>
                    <span className="truncate">{link.text}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* System Version Footer Strip (No Admin) */}
        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between text-[11px] text-slate-400 font-mono flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Steel Core v4.2</span>
          </div>
          <span className="text-amber-400/90 font-semibold">SCADA 100%</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex bg-[#FAF9F6] text-slate-900 font-sans overflow-auto relative min-w-[1280px]">
      
      {/* Sidebar - Always visible in desktop layout */}
      <aside className="flex w-68 h-full border-r border-slate-900/40 flex-col justify-between flex-shrink-0 z-10 shadow-xl">
        {sidebarElement}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        
        {/* Header with Top-Right Admin & User Profile Controls */}
        <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5 text-xs font-medium text-slate-500 font-mono">
              <span className="text-slate-400">Softlligence Enterprise</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600 font-semibold">{user.tenantName || 'Hi-Tech Steel Mills Ltd'}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold capitalize bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-sans">
                {(activeTab || '').replace('-', ' ')}
              </span>
            </div>
          </div>
          
          {/* Header Controls: Telemetry Status, Profile Pill, Admin Badge & Sign Out */}
          <div className="flex items-center space-x-3">
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1.5 text-xs font-semibold text-emerald-700 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live MES Online
            </div>

            {/* Admin Profile Pill */}
            <Link 
              href="/tenant/steel/profile" 
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
              title="Admin User Profile & Preferences"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center font-bold text-xs text-[#B48F48] border border-amber-200 shadow-xs">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block">{user.name}</span>
                <span className="text-[10px] font-mono text-amber-700 font-semibold">Plant Admin</span>
              </div>
            </Link>

            {/* Sign Out Button in Top Right */}
            <button 
              onClick={logout} 
              className="p-2 md:px-3 md:py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              title="Sign Out Session"
            >
              <svg className="w-4 h-4 text-slate-400 group-hover:text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Page Container */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#FAF9F6]">
          {children}
        </main>
      </div>
    </div>
  );
}
