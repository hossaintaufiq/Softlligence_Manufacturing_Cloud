'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function SteelLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return null;

  // Determine active tab based on route pathname
  let activeTab = 'overview';
  if (pathname.includes('/scrap-management')) activeTab = 'scrap-management';
  else if (pathname.includes('/furnace-smelting')) activeTab = 'furnace-smelting';
  else if (pathname.includes('/casting-rolling')) activeTab = 'casting-rolling';
  else if (pathname.includes('/sintering-plant')) activeTab = 'sintering-plant';
  else if (pathname.includes('/sourcing-fuel')) activeTab = 'sourcing-fuel';
  else if (pathname.includes('/material-inventory')) activeTab = 'material-inventory';
  else if (pathname.includes('/laboratory-composition')) activeTab = 'laboratory-composition';
  else if (pathname.includes('/weighbridge-gates')) activeTab = 'weighbridge-gates';
  else if (pathname.includes('/invoices-expenses')) activeTab = 'invoices-expenses';
  else if (pathname.includes('/hrms-shift-log')) activeTab = 'hrms-shift-log';
  else if (pathname.includes('/equipment-maintenance')) activeTab = 'equipment-maintenance';
  else if (pathname.includes('/laboratory-qa-audits')) activeTab = 'laboratory-qa-audits';
  else if (pathname.includes('/config-parameters')) activeTab = 'config-parameters';
  else if (pathname.includes('/profile')) activeTab = 'profile';

  const navLinks = [
    { href: '/tenant/steel', activeKey: 'overview', text: 'Overview', icon: 'M4 6h16M4 12h16M4 18h16' },
    { href: '/tenant/steel/scrap-management', activeKey: 'scrap-management', text: 'Scrap Management', icon: 'M20 7l-8-4-8 4m16 0l-8 4' },
    { href: '/tenant/steel/furnace-smelting', activeKey: 'furnace-smelting', text: 'Furnace Smelting', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { href: '/tenant/steel/casting-rolling', activeKey: 'casting-rolling', text: 'Casting & Rolling', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2' },
    { href: '/tenant/steel/sintering-plant', activeKey: 'sintering-plant', text: 'Sintering Plant', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2' },
    { href: '/tenant/steel/sourcing-fuel', activeKey: 'sourcing-fuel', text: 'Sourcing & Fuel', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { href: '/tenant/steel/material-inventory', activeKey: 'material-inventory', text: 'Material Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4' },
    { href: '/tenant/steel/laboratory-composition', activeKey: 'laboratory-composition', text: 'Laboratory Composition', icon: 'M9 7h6m0 10v-3m-3 3h.01' },
    { href: '/tenant/steel/weighbridge-gates', activeKey: 'weighbridge-gates', text: 'Weighbridge Gates', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9' },
    { href: '/tenant/steel/invoices-expenses', activeKey: 'invoices-expenses', text: 'Invoices & Expenses', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2' },
    { href: '/tenant/steel/hrms-shift-log', activeKey: 'hrms-shift-log', text: 'HRMS & Shift Log', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7' },
    { href: '/tenant/steel/equipment-maintenance', activeKey: 'equipment-maintenance', text: 'Equipment Maintenance', icon: 'M12 6V4m0 2a2 2 0 100 4' },
    { href: '/tenant/steel/laboratory-qa-audits', activeKey: 'laboratory-qa-audits', text: 'Laboratory QA Audits', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944' },
    { href: '/tenant/steel/config-parameters', activeKey: 'config-parameters', text: 'Config Parameters', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4' }
  ];

  const sidebarElement = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/40 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-500/20 flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
            </svg>
          </div>
          <div className="leading-none overflow-hidden max-w-[140px]">
            <h2 className="text-xs font-black text-slate-900 truncate">{user.tenantName || 'Workspace'}</h2>
            <p className="text-[8px] text-orange-550 font-mono tracking-wider uppercase font-extrabold mt-1">Steel Mill ERP</p>
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
              activeTab === link.activeKey ? 'bg-orange-50/60 text-orange-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === link.activeKey && <div className="absolute left-0 top-2.5 w-1.5 h-5 bg-orange-500 rounded-r" />}
            <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
            </svg>
            <span>{link.text}</span>
          </Link>
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <Link href="/tenant/steel/profile" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-between mb-3.5 cursor-pointer hover:bg-slate-100/50 p-1 rounded-xl transition-all">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-500/30 flex items-center justify-center font-bold text-[10px] text-orange-600">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-black text-slate-900 truncate w-28">{user.name}</p>
              <span className="inline-flex px-1.5 py-0.2 bg-slate-100 text-orange-600 rounded text-[8px] font-bold uppercase tracking-wider font-mono">Steel Admin</span>
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
              <span className="text-slate-850 capitalize font-bold">{(activeTab || '').replace('-', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/tenant/steel/profile" className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-orange-600 border border-slate-200">
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
