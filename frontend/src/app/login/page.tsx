'use client';

import React from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center space-x-1"
          >
            <span>← Back to Product Details</span>
          </Link>

          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-semibold">
            SECURE REST API AUTH
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <header className="space-y-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 font-bold text-white flex items-center justify-center text-base mx-auto shadow-indigo-600/30 shadow-md">
              S
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign In to Workspace</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your corporate email and password. Session security & rate limiting strictly enforced on API.
            </p>
          </header>

          <LoginForm />
        </div>

        <div className="text-center text-xs text-slate-500 space-y-2">
          <p>
            Don't have a corporate workspace?{' '}
            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-500 underline">
              Create a Workspace
            </Link>
          </p>
          <p>Softlligence Manufacturing Cloud • Multi-Tenant Enterprise Platform</p>
        </div>
      </div>
    </main>
  );
}
