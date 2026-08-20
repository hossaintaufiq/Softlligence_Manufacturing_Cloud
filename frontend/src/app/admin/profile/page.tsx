'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminProfilePage() {
  const { user, updateProfile } = useAuth();

  const [profileName, setProfileName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [densityPref, setDensityPref] = useState<'cozy' | 'compact'>('cozy');
  const [landingTabPref, setLandingTabPref] = useState('subscriptions');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setDensityPref(user.preferences?.density || 'cozy');
      setLandingTabPref(user.preferences?.defaultTab || 'subscriptions');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileError(null);
    setProfileSuccess(null);
    setIsUpdatingProfile(true);

    if (!profileName.trim()) {
      setProfileError('Display Name cannot be empty.');
      setIsUpdatingProfile(false);
      return;
    }

    let newPass: string | undefined = undefined;
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        setProfileError('Please enter your current password to verify identity.');
        setIsUpdatingProfile(false);
        return;
      }
      
      const storedUsers = localStorage.getItem('smc_users');
      if (storedUsers) {
        const usersMap = JSON.parse(storedUsers);
        const userData = usersMap[user.email.toLowerCase().trim()];
        if (!userData || userData.hash !== currentPassword) {
          setProfileError('Current password entered is incorrect.');
          setIsUpdatingProfile(false);
          return;
        }
      }

      if (newPassword.length < 6) {
        setProfileError('New password must be at least 6 characters long.');
        setIsUpdatingProfile(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setProfileError('New passwords do not match.');
        setIsUpdatingProfile(false);
        return;
      }
      newPass = newPassword;
    }

    const updatedPrefs = {
      density: densityPref,
      defaultTab: landingTabPref,
    };

    const res = await updateProfile({
      name: profileName.trim(),
      password: newPass,
      preferences: updatedPrefs,
    });

    setIsUpdatingProfile(false);

    if (res.success) {
      setProfileSuccess('Profile settings successfully saved.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setProfileError(res.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Profile & Platform Preferences</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage your credential parameters, layout aesthetics, and dashboard defaults.</p>
      </div>

      {profileError && (
        <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 text-rose-700 text-xs font-bold rounded-xl flex items-center space-x-2 animate-shake">
          <span>⚠️</span>
          <span>{profileError}</span>
        </div>
      )}

      {profileSuccess && (
        <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 text-xs font-bold rounded-xl flex items-center space-x-2">
          <span>✨</span>
          <span>{profileSuccess}</span>
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-6 sm:space-y-8">
        
        {/* Section 1: Account Parameters */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3.5">
            <span className="text-base">👤</span>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Account Profile Parameters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Corporate Email</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl text-xs font-semibold cursor-not-allowed"
              />
              <p className="text-[9px] text-slate-400">Security: Account identification emails cannot be modified.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Display Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Super Admin"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all text-xs font-semibold"
              />
              <p className="text-[9px] text-slate-400">Used for auditing security trails and system action signatures.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Platform Aesthetics & Preferences */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3.5">
            <span className="text-base">⚙️</span>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Layout Aesthetics & Navigation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono block">Data Density Preference</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDensityPref('cozy')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    densityPref === 'cozy'
                      ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50/50 text-slate-600'
                  }`}
                >
                  <span>☕</span>
                  <span>Cozy Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDensityPref('compact')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    densityPref === 'compact'
                      ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48] shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50/50 text-slate-600'
                  }`}
                >
                  <span>⚡</span>
                  <span>Compact Mode</span>
                </button>
              </div>
              <p className="text-[9px] text-slate-400">Compact density compresses table spacing for heavy datagrid review.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Default Dashboard View</label>
              <select
                value={landingTabPref}
                onChange={(e) => setLandingTabPref(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] text-xs font-semibold"
              >
                <option value="subscriptions">Tenant Subscriptions</option>
                <option value="infrastructure">API Nodes Monitor</option>
                <option value="database">Database Telemetry</option>
                <option value="audit">Security Audit Logs</option>
              </select>
              <p className="text-[9px] text-slate-400">Controls which view opens instantly when logging into SMC.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Password Credentials */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3.5">
            <span className="text-base">🔐</span>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Password Verification & Update</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 max-w-md">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Current Password</label>
              <input
                type="password"
                placeholder="Required for any credential change"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all text-xs font-semibold"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">New Secret Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 alphanumeric chars"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all text-xs font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="px-6 py-3 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold rounded-xl transition-all text-xs shadow-md shadow-amber-500/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2 font-mono uppercase tracking-wider"
          >
            {isUpdatingProfile ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <span>Save Platform Settings</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
