'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
export default function SteelProfilePage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      const data = localStorage.getItem(`smc_workspace_notes_${user.tenantId}`);
      if (data) setNotes(data);
    }
  }, [user]);

  const handleSave = () => {
    if (user) {
      localStorage.setItem(`smc_workspace_notes_${user.tenantId}`, notes);
      alert('Workspace diagnostic notes saved successfully.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Steel Mill ERP Profile</h2>
        <p className="text-[11px] text-slate-500">Edit workspace notes and diagnostics memos.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Workspace Diagnostic Notes</label>
          <textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-xl text-xs font-mono"
            placeholder="Add structural mill operational notes..."
          />
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold font-mono">SAVE NOTES</button>
      </div>
    </div>
  );
}
