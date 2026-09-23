'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'super-admin') {
        router.replace('/admin');
      } else {
        router.replace('/tenant');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="h-screen w-screen flex bg-white font-sans text-slate-800 overflow-hidden select-none">
      
      {/* LEFT SIDE: Professional Manufacturing Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-7/12 h-full bg-gradient-to-br from-slate-50 via-slate-100 to-[#FAF6EE] relative items-center justify-center p-8 border-r border-slate-200/60 overflow-hidden">
        
        {/* Subtle Luxury Pattern Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.04),transparent_45%)]" />
        
        <div className="relative max-w-lg w-full space-y-6 z-10 flex flex-col items-center text-center">
          
          {/* Top Logo Stub */}
          <div className="flex items-center space-x-3 bg-white/85 border border-slate-200/80 shadow-sm px-4 py-2 rounded-full">
            <span className="text-[#C5A059] text-sm">✨</span>
            <span className="text-xs font-black tracking-tight text-slate-800 uppercase font-mono">
              Softlligence Manufacturing Cloud
            </span>
          </div>

          {/* Premium Manufacturing SVG */}
          <div className="w-full max-w-[280px] drop-shadow-md hover:scale-[1.01] transition-transform duration-500">
            <svg viewBox="0 0 400 320" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer Glow / Platform */}
              <path d="M50,260 L350,260" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
              <path d="M70,260 L330,260" stroke="#C5A059" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
              
              {/* Modern Factory Profile */}
              <path d="M80,260 L80,180 L130,210 L130,170 L180,200 L180,160 L230,190 L230,260 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2.5" strokeLinejoin="round" />
              
              {/* Smokes/Pipes details */}
              <rect x="92" y="140" width="8" height="40" rx="1" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2.5" />
              <line x1="96" y1="140" x2="96" y2="120" stroke="#C5A059" strokeWidth="2" strokeDasharray="4 4" />
              
              {/* Interlocking Gears */}
              <circle cx="280" cy="150" r="35" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="6 3" />
              <circle cx="280" cy="150" r="25" fill="#FFFFFF" stroke="#C5A059" strokeWidth="2.5" />
              <circle cx="280" cy="150" r="8" fill="#C5A059" />

              {/* Gear 2 */}
              <circle cx="225" cy="115" r="20" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="5 3" />
              <circle cx="225" cy="115" r="14" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
              <circle cx="225" cy="115" r="4" fill="#94A3B8" />

              {/* Interactive Robotic Arm */}
              <path d="M180,260 L195,210 L235,200 L260,225" stroke="#C5A059" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="195" cy="210" r="5" fill="#FFFFFF" stroke="#C5A059" strokeWidth="3" />
              <circle cx="235" cy="200" r="5" fill="#FFFFFF" stroke="#C5A059" strokeWidth="3" />
              
              {/* Floating Digital Data / Hexagons */}
              <polygon points="120,90 135,80 135,65 120,55 105,65 105,80" fill="#FAF6EE" stroke="#C5A059" strokeWidth="1.5" />
              <path d="M120,60 L120,75" stroke="#C5A059" strokeWidth="1.5" />
              <circle cx="135" cy="100" r="3" fill="#C5A059" />
              <circle cx="200" cy="70" r="4" fill="#94A3B8" />
              <circle cx="310" cy="80" r="3.5" fill="#C5A059" />
            </svg>
          </div>

          {/* Copywriting */}
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Operating System for <span className="text-[#C5A059]">Modern Industry</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Softlligence Manufacturing Cloud unifies supply chains, melt logs, rolling yield telemetry, and isolated multi-tenant workspaces under a secure luxury control system.
            </p>
          </div>

          {/* Bottom Branding / Footprint */}
          <div className="text-[9px] text-slate-400 font-medium font-mono uppercase tracking-widest pt-4">
            Est. 2026 • Softlligence Enterprise Solutions
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Professional Gold-Accent Login Form */}
      <div className="w-full lg:w-5/12 h-full flex items-center justify-center p-6 sm:p-10 md:p-12 bg-white relative overflow-hidden">
        
        {/* Soft Background Grid Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.03),transparent_50%)]" />

        <div className="w-full max-w-sm space-y-6 relative z-10">
          {/* Workspace access header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              Workspace Access
            </h1>
            <p className="text-[10px] font-semibold text-[#B48F48] uppercase tracking-wider font-mono">
              Sign In to Your Secure Tenant Node
            </p>
          </div>
          {/* Error Alert Box */}
          {error && (
            <div className="p-3 bg-rose-500/5 border border-rose-500/20 text-rose-700 text-[11px] font-bold rounded-xl flex items-center space-x-2 animate-shake">
              <svg className="w-4 h-4 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                Corporate Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all text-xs font-semibold"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all text-xs font-semibold"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center space-x-2 mt-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Secure Node</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-3 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
              Corporate Presets
            </span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Demo Presets Horizontal Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Super Admin */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@softlligence.com', 'admin123')}
              className="group p-2.5 bg-slate-50/50 hover:bg-[#FAF6EE] border border-slate-100 hover:border-[#C5A059]/40 rounded-xl flex flex-col items-center text-center transition-all hover:scale-[1.01]"
            >
              <svg className="w-4 h-4 text-slate-400 group-hover:text-[#B48F48] mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              <h4 className="text-[9px] font-extrabold text-slate-700 group-hover:text-[#B48F48] transition-colors leading-tight">
                Super Admin
              </h4>
            </button>

            {/* Garments ERP */}
            <button
              type="button"
              onClick={() => handleQuickLogin('manager@acme.com', 'manager123')}
              className="group p-2.5 bg-slate-50/50 hover:bg-[#FAF6EE] border border-slate-100 hover:border-[#C5A059]/40 rounded-xl flex flex-col items-center text-center transition-all hover:scale-[1.01]"
            >
              <svg className="w-4 h-4 text-slate-400 group-hover:text-[#B48F48] mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v16M8 7l4-4 4 4M4 10l8 4 8-4" />
              </svg>
              <h4 className="text-[9px] font-extrabold text-slate-700 group-hover:text-[#B48F48] transition-colors leading-tight font-mono">
                Garments ERP
              </h4>
            </button>

            {/* Steel Mill */}
            <button
              type="button"
              onClick={() => handleQuickLogin('manager@steel.com', 'steel123')}
              className="group p-2.5 bg-slate-50/50 hover:bg-[#FAF6EE] border border-slate-100 hover:border-[#C5A059]/40 rounded-xl flex flex-col items-center text-center transition-all hover:scale-[1.01]"
            >
              <svg className="w-4 h-4 text-slate-400 group-hover:text-[#B48F48] mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V9l-7-4-7 4v12M22 21h-2M4 21H2m10-7h.01M16 11h.01M16 16h.01M8 11h.01M8 16h.01" />
              </svg>
              <h4 className="text-[9px] font-extrabold text-slate-700 group-hover:text-[#B48F48] transition-colors leading-tight font-mono">
                Steel Mill ERP
              </h4>
            </button>

            {/* Local Business */}
            <button
              type="button"
              onClick={() => handleQuickLogin('manager@local.com', 'local123')}
              className="group p-2.5 bg-slate-50/50 hover:bg-[#FAF6EE] border border-slate-100 hover:border-[#C5A059]/40 rounded-xl flex flex-col items-center text-center transition-all hover:scale-[1.01]"
            >
              <svg className="w-4 h-4 text-slate-400 group-hover:text-[#B48F48] mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h4 className="text-[9px] font-extrabold text-slate-700 group-hover:text-[#B48F48] transition-colors leading-tight font-mono">
                Local Business
              </h4>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
