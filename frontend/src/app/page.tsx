'use client';

import React from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/context/WorkspaceContext';
import { StatusPanel } from '@/components/foundation/StatusPanel';

export default function HomePage() {
  const { user } = useWorkspace();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200 px-6 py-4 shadow-2xs">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 font-bold text-white flex items-center justify-center text-sm shadow-md shadow-indigo-600/20">
              S
            </span>
            <span className="font-bold text-base tracking-tight text-slate-900">
              Softlligence <span className="text-indigo-600 font-normal">Manufacturing Cloud</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
            <a href="#overview" className="hover:text-indigo-600 transition-colors">Overview</a>
            <a href="#modules" className="hover:text-indigo-600 transition-colors">Core Modules</a>
            <a href="#steel" className="hover:text-indigo-600 transition-colors">Steel Vertical</a>
            <a href="#security" className="hover:text-indigo-600 transition-colors">Security & Audit</a>
            <a href="#status" className="hover:text-indigo-600 transition-colors">System Status</a>
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                href="/steel"
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md shadow-indigo-600/20"
              >
                Go to Workspace ({user.email}) →
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-1.5"
              >
                <span>Sign In to Workspace</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative pt-16 pb-20 px-6 bg-gradient-to-b from-white to-slate-100/60 border-b border-slate-200">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ENTERPRISE LIGHT SYSTEM • SECTION 1 TO 14 READY</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
            Industrial SaaS Engine for High-Throughput Manufacturing
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-600 leading-relaxed font-normal">
            Multi-tenant cloud platform powering isolated company workspaces.
            Featuring live steel production templates, Work Order Kanban scheduling, multi-level BOM explosion, and append-only audit security.
          </p>

          {/* Action CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5"
            >
              Sign In to Workspace →
            </Link>
            <Link
              href="/steel"
              className="px-6 py-3.5 text-sm font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl transition-all shadow-2xs"
            >
              Open Steel Vertical Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section id="modules" className="py-16 px-6 bg-slate-50">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center space-y-2">
            <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest">Platform Capabilities</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Core Manufacturing & Operational Modules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-lg">
                🔥
              </div>
              <h3 className="text-lg font-bold text-slate-900">Steel Industry Vertical</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Induction furnace heat logging (FRM-STL-02), rolling mill rebar rod batching (FRM-STL-04), scrap yard receiving, and Excel batch data import wizard.
              </p>
              <div className="pt-2 text-xs font-mono text-indigo-600 font-semibold">/steel • Section 10 Ready</div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-lg">
                ⚙️
              </div>
              <h3 className="text-lg font-bold text-slate-900">Manufacturing Core</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Work Order Kanban scheduling board with machine downtime overlays, multi-level BOM explosion calculator, material issues, and yield KPIs.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-600 font-semibold">/manufacturing • Section 8 Ready</div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-lg">
                📦
              </div>
              <h3 className="text-lg font-bold text-slate-900">Inventory Core</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Materialized stock ledger, warehouse bin tracking, virtualized data tables, multilevel filter builder, stock transfers, and adjustment entries.
              </p>
              <div className="pt-2 text-xs font-mono text-amber-600 font-semibold">/inventory • Section 7 Ready</div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-lg">
                💼
              </div>
              <h3 className="text-lg font-bold text-slate-900">Commercial Ops</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unified Customer & Supplier Party directory, Purchase Orders, Goods Receipt Notes (GRN), Sales Orders, and Delivery Challan Dispatches.
              </p>
              <div className="pt-2 text-xs font-mono text-rose-600 font-semibold">/commercial • Section 9 Ready</div>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 font-bold flex items-center justify-center text-lg">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-slate-900">Enterprise Security</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                TOTP 2FA authentication, session IP/User-Agent fingerprinting, remote session revocation, tenant IP CIDR whitelisting, and rate limiting.
              </p>
              <div className="pt-2 text-xs font-mono text-sky-600 font-semibold">Section 13 Enforced</div>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-lg">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-slate-900">Platform Services</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Decoupled Event Bus (`eventBus.ts`), Omnichannel notifications, background job queues, and cross-entity full-text search.
              </p>
              <div className="pt-2 text-xs font-mono text-purple-600 font-semibold">Section 14 Active</div>
            </div>
          </div>
        </div>
      </section>

      {/* System Status Section */}
      <section id="status" className="py-16 px-6 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest">Environment Status</p>
            <h2 className="text-2xl font-extrabold text-slate-900">Local Services & API Connectivity</h2>
          </div>
          <StatusPanel />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-500 bg-slate-50">
        <p>Softlligence Manufacturing Cloud v1.0 • Built with NestJS REST API, Next.js, and Prisma ORM</p>
      </footer>
    </div>
  );
}
