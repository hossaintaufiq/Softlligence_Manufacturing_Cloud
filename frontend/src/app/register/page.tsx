'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useWorkspace();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [companyName, setCompanyName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [industry, setIndustry] = useState('Steel');
  const [email, setEmail] = useState('');
  const [passwordPlane, setPasswordPlane] = useState('');
  const [planCode, setPlanCode] = useState('trial');
  const [factoryName, setFactoryName] = useState('Primary Plant');
  const [factoryCode, setFactoryCode] = useState('MAIN');
  const [timezone, setTimezone] = useState('Asia/Dhaka');

  const industries = ['Steel', 'Garments', 'Textile', 'Food', 'Plastic', 'Chemical'];
  const plans = [
    { code: 'trial', name: 'Free Trial', desc: '14 days trial access' },
    { code: 'growth', name: 'Growth', desc: 'Ideal for scaling facilities' },
    { code: 'enterprise', name: 'Enterprise', desc: 'High-availability & dedicated support' },
  ];

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!companyName || !companyCode || !email || !passwordPlane) {
        setError('Please fill in all company and administrator fields.');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/platform/tenants/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          companyCode,
          currency,
          industry,
          email,
          passwordPlane,
          planCode,
          factoryName,
          factoryCode,
          timezone,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody?.error?.message || 'Provisioning workspace failed');
      }

      await refreshUser();
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong during onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center space-x-1"
          >
            <span>← Back to Login</span>
          </Link>

          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200 font-semibold">
            ONBOARDING WIZARD
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <header className="space-y-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 font-bold text-white flex items-center justify-center text-base mx-auto shadow-indigo-600/30 shadow-md">
              S
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Provision Your Workspace</h1>
            <p className="text-xs text-slate-500">
              Step {step} of 5 — Configure your manufacturing company tenant
            </p>
          </header>

          {/* Progress Indicator Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company & Admin Credentials</h3>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Company / Tenant Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. National Steel Works"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Company Code</label>
                    <input
                      type="text"
                      required
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value)}
                      placeholder="e.g. NATSTEEL"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Reporting Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="BDT">BDT (৳)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Admin Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.local"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Admin Password</label>
                  <input
                    type="password"
                    required
                    value={passwordPlane}
                    onChange={(e) => setPasswordPlane(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Industry Template</h3>
                <p className="text-xs text-slate-500">Select an industry model. The dashboard configuration, modules, and reports will configure automatically.</p>
                <div className="grid grid-cols-2 gap-3">
                  {industries.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => setIndustry(ind)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        industry === ind
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{ind}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Configure layout & default metrics for {ind} production.</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Initial Factory Settings</h3>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Primary Plant Name</label>
                  <input
                    type="text"
                    required
                    value={factoryName}
                    onChange={(e) => setFactoryName(e.target.value)}
                    placeholder="e.g. Main Plant"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Plant Code</label>
                    <input
                      type="text"
                      required
                      value={factoryCode}
                      onChange={(e) => setFactoryCode(e.target.value)}
                      placeholder="e.g. MAIN"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Local Timezone</label>
                    <input
                      type="text"
                      required
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="e.g. Asia/Dhaka"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription Tier</h3>
                <div className="space-y-2">
                  {plans.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setPlanCode(p.code)}
                      className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                        planCode === p.code
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{p.desc}</p>
                      </div>
                      <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                        {planCode === p.code && <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 text-center py-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ready to Launch Workspace</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click below to initialize your isolated corporate space. We will auto-seed IAM roles, assign your company admin, set up templates, and launch.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white transition-colors disabled:opacity-50"
                >
                  {loading ? 'Initializing Corporate Workspace...' : 'Create My Workspace'}
                </button>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-600 font-semibold" role="alert">
                {error}
              </p>
            )}

            {step < 5 && (
              <div className="pt-4 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
