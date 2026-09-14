'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface PlantConfig {
  plantName: string;
  plantLocation: string;
  chiefMetallurgist: string;
  metallurgistLicense: string;
  plantDirector: string;
  annualCapacityMt: number;
  inductionFurnaces: string;
  ccmSpecs: string;
  rollingMillSpecs: string;
  targetSecKwhMt: number;
  targetYieldPct: number;
  // SCADA Gateways
  furnacePlcIp: string;
  spectroOesIp: string;
  weighbridgeIp: string;
  substationRtuIp: string;
  // Metallurgical Chemistry Targets (Grade 500W / 500D)
  targetC: number;
  targetMn: number;
  targetSi: number;
  maxS: number;
  maxP: number;
  targetCe: number;
  minYieldStrength: number;
  minTensileRatio: number;
}

const DEFAULT_CONFIG: PlantConfig = {
  plantName: 'Hi-Tech Steel Mills Ltd — Plant 01',
  plantLocation: 'Sitakunda Industrial Zone, Chittagong, Bangladesh',
  chiefMetallurgist: 'Engr. M. A. Rahman, FIEB',
  metallurgistLicense: 'BMRE-MET-9482',
  plantDirector: 'Taufiq Hossain, P.Eng',
  annualCapacityMt: 500000,
  inductionFurnaces: '2x 30-Ton Medium Frequency Induction Furnaces (15MW Solid State)',
  ccmSpecs: '2-Strand Continuous Casting Machine (6/11m Radius, 100x100 to 130x130mm)',
  rollingMillSpecs: '18-Stand Continuous High-Speed TMT Bar Mill (650 TPD, Thermex Quenching)',
  targetSecKwhMt: 530,
  targetYieldPct: 98.2,
  // SCADA
  furnacePlcIp: '192.168.10.45:502',
  spectroOesIp: '192.168.10.88:9100',
  weighbridgeIp: '192.168.10.112:8080',
  substationRtuIp: '192.168.10.201:502',
  // Metallurgy
  targetC: 0.22,
  targetMn: 0.75,
  targetSi: 0.25,
  maxS: 0.040,
  maxP: 0.040,
  targetCe: 0.39,
  minYieldStrength: 520,
  minTensileRatio: 1.18,
};

export default function SteelProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'hardware' | 'scada' | 'metallurgy' | 'logbook'>('hardware');
  const [config, setConfig] = useState<PlantConfig>(DEFAULT_CONFIG);
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const savedConfig = localStorage.getItem(`smc_plant_config_${user.tenantId}`);
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (e) {
          console.error(e);
        }
      }

      const data = localStorage.getItem(`smc_workspace_notes_${user.tenantId}`);
      if (data) setNotes(data);

      const savedTime = localStorage.getItem(`smc_plant_config_time_${user.tenantId}`);
      if (savedTime) setLastSavedTime(savedTime);
    }
  }, [user]);

  const handleSave = () => {
    if (user) {
      localStorage.setItem(`smc_plant_config_${user.tenantId}`, JSON.stringify(config));
      localStorage.setItem(`smc_workspace_notes_${user.tenantId}`, notes);
      const timestamp = new Date().toLocaleString();
      localStorage.setItem(`smc_plant_config_time_${user.tenantId}`, timestamp);
      setLastSavedTime(timestamp);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  const handleReset = () => {
    if (confirm('Reset plant configuration parameters to factory engineering defaults?')) {
      setConfig(DEFAULT_CONFIG);
    }
  };

  const appendNoteTemplate = (template: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newEntry = `\n\n[${timestamp}] ${template}`;
    setNotes(prev => (prev ? prev + newEntry : `[${timestamp}] ${template}`));
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 pb-12">
      
      {/* Enterprise Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B48F48] uppercase tracking-wider font-mono mb-1.5">
            <span>Softlligence Enterprise</span>
            <span>•</span>
            <span>Plant Admin & Operations Configuration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Steel Mill Profile & SCADA Master</h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Configure induction smelting capacities, BDS/ASTM chemistry baselines, IoT Modbus gateways, and plant diagnostic logbooks.
          </p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {saveSuccess && (
            <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 animate-fade-in font-mono">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Config Synced!</span>
            </div>
          )}
          <button 
            onClick={handleReset}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Reset Defaults
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#B48F48] hover:bg-[#9E7A37] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>Save System Parameters</span>
          </button>
        </div>
      </div>

      {/* Hardware Spec Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Installed Capacity</span>
            <span className="p-2 bg-amber-50 rounded-xl text-[#B48F48]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{(config.annualCapacityMt / 1000).toLocaleString()}k <span className="text-xs text-slate-400 font-sans">MT/Year</span></div>
          <div className="text-xs text-slate-500 mt-1 font-sans">2x 30T Induction • 650 TPD Bar Mill</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">SEC Energy Target</span>
            <span className="p-2 bg-amber-50 rounded-xl text-[#B48F48]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{config.targetSecKwhMt} <span className="text-xs text-slate-400 font-sans">kWh/MT</span></div>
          <div className="text-xs text-emerald-600 font-medium mt-1 font-mono">Benchmark: ≤ 540 kWh/MT</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Casting Yield Target</span>
            <span className="p-2 bg-amber-50 rounded-xl text-[#B48F48]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{config.targetYieldPct}% <span className="text-xs text-slate-400 font-sans">Liquid to Billet</span></div>
          <div className="text-xs text-slate-500 mt-1 font-sans">Scull Loss Ceiling: ≤ 1.8%</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Target Rebar Grade</span>
            <span className="p-2 bg-amber-50 rounded-xl text-[#B48F48]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">500W / 500D <span className="text-xs text-slate-400 font-sans">TMT</span></div>
          <div className="text-xs text-slate-500 mt-1 font-sans">BDS ISO 6935-2 • ASTM A615</div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 font-sans">
        <button
          onClick={() => setActiveTab('hardware')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'hardware' 
              ? 'bg-[#B48F48] text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Plant Master & Machinery
        </button>
        <button
          onClick={() => setActiveTab('scada')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'scada' 
              ? 'bg-[#B48F48] text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          SCADA & Modbus Gateways
        </button>
        <button
          onClick={() => setActiveTab('metallurgy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'metallurgy' 
              ? 'bg-[#B48F48] text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Metallurgical Standards (%CE)
        </button>
        <button
          onClick={() => setActiveTab('logbook')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'logbook' 
              ? 'bg-[#B48F48] text-white shadow-xs' 
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Operations Logbook & Notes
        </button>
      </div>

      {/* TAB 1: Plant Master & Hardware Specs */}
      {activeTab === 'hardware' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 font-sans">Plant Identity & Production Capabilities</h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Define facility credentials, metallurgical staff hierarchy, and melt shop engineering specifications.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Plant Facility Name</label>
              <input 
                type="text" 
                value={config.plantName}
                onChange={e => setConfig({...config, plantName: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Geographical Location & Industrial Estate</label>
              <input 
                type="text" 
                value={config.plantLocation}
                onChange={e => setConfig({...config, plantLocation: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Chief Metallurgist / QA Head</label>
              <input 
                type="text" 
                value={config.chiefMetallurgist}
                onChange={e => setConfig({...config, chiefMetallurgist: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">IEB Metallurgical License Registration</label>
              <input 
                type="text" 
                value={config.metallurgistLicense}
                onChange={e => setConfig({...config, metallurgistLicense: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Induction Smelting Units</label>
              <input 
                type="text" 
                value={config.inductionFurnaces}
                onChange={e => setConfig({...config, inductionFurnaces: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Continuous Casting Machine (CCM) Layout</label>
              <input 
                type="text" 
                value={config.ccmSpecs}
                onChange={e => setConfig({...config, ccmSpecs: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Rebar Rolling Mill & Quenching Configuration</label>
              <input 
                type="text" 
                value={config.rollingMillSpecs}
                onChange={e => setConfig({...config, rollingMillSpecs: e.target.value})}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCADA & Modbus Gateways */}
      {activeTab === 'scada' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 font-sans">Industrial IoT & SCADA Telemetry Gateways</h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Configure Modbus TCP/IP, OPC-UA endpoints, and serial data brokers for automated plant node synchronisation.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#B48F48] flex items-center justify-center font-bold font-mono text-xs">
                  PLC
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Induction Furnace Smelting Controller</h4>
                  <p className="text-xs text-slate-500 font-sans">Siemens S7-1500 / Modbus TCP • Polls kWh, Tapping Temp & Melt Cycle</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <input 
                  type="text" 
                  value={config.furnacePlcIp} 
                  onChange={e => setConfig({...config, furnacePlcIp: e.target.value})}
                  className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-900 w-44"
                />
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-md font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> ONLINE
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold font-mono text-xs">
                  OES
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Optical Emission Spectrometer (Lab QA)</h4>
                  <p className="text-xs text-slate-500 font-sans">SpectroLab / Thermo ARL • Auto-pulls C, Si, Mn, S, P % chemistry sparks</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <input 
                  type="text" 
                  value={config.spectroOesIp} 
                  onChange={e => setConfig({...config, spectroOesIp: e.target.value})}
                  className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-900 w-44"
                />
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-md font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> ONLINE
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold font-mono text-xs">
                  GATE
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">100-Ton Digital Weighbridge Load Cell</h4>
                  <p className="text-xs text-slate-500 font-sans">Mettler Toledo IND570 Terminal • Inbound Scrap & Outbound Rebar Gross/Tare</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <input 
                  type="text" 
                  value={config.weighbridgeIp} 
                  onChange={e => setConfig({...config, weighbridgeIp: e.target.value})}
                  className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-900 w-44"
                />
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-md font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> ONLINE
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold font-mono text-xs">
                  RTU
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">33kV Substation Digital Energy Monitor</h4>
                  <p className="text-xs text-slate-500 font-sans">Schneider PowerLogic ION9000 • Substation kWh, kVARh, Power Factor (0.98)</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <input 
                  type="text" 
                  value={config.substationRtuIp} 
                  onChange={e => setConfig({...config, substationRtuIp: e.target.value})}
                  className="bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-900 w-44"
                />
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-md font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> ONLINE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Metallurgical Standards */}
      {activeTab === 'metallurgy' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 font-sans">Standard Metallurgical Chemistry & Mechanical Benchmarks</h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">Tolerances calibrated in accordance with BDS ISO 6935-2:2016 and ASTM A615 Grade 500W.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-sans">
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-600 font-mono">Carbon (C %)</label>
              <input 
                type="number" 
                step="0.01" 
                value={config.targetC}
                onChange={e => setConfig({...config, targetC: parseFloat(e.target.value) || 0})}
                className="w-full mt-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Tolerable: 0.18 - 0.25%</span>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-600 font-mono">Manganese (Mn %)</label>
              <input 
                type="number" 
                step="0.01" 
                value={config.targetMn}
                onChange={e => setConfig({...config, targetMn: parseFloat(e.target.value) || 0})}
                className="w-full mt-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Tolerable: 0.60 - 0.95%</span>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-600 font-mono">Silicon (Si %)</label>
              <input 
                type="number" 
                step="0.01" 
                value={config.targetSi}
                onChange={e => setConfig({...config, targetSi: parseFloat(e.target.value) || 0})}
                className="w-full mt-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Tolerable: 0.15 - 0.35%</span>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-600 font-mono">Max Sulphur (S %)</label>
              <input 
                type="number" 
                step="0.001" 
                value={config.maxS}
                onChange={e => setConfig({...config, maxS: parseFloat(e.target.value) || 0})}
                className="w-full mt-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold"
              />
              <span className="text-[11px] text-rose-500 font-medium mt-1 block">Max Ceiling: 0.045%</span>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-600 font-mono">Max Phosphorus (P %)</label>
              <input 
                type="number" 
                step="0.001" 
                value={config.maxP}
                onChange={e => setConfig({...config, maxP: parseFloat(e.target.value) || 0})}
                className="w-full mt-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold"
              />
              <span className="text-[11px] text-rose-500 font-medium mt-1 block">Max Ceiling: 0.045%</span>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-600 font-mono">Carbon Equiv. (% CE)</label>
              <input 
                type="number" 
                step="0.01" 
                value={config.targetCe}
                onChange={e => setConfig({...config, targetCe: parseFloat(e.target.value) || 0})}
                className="w-full mt-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold text-amber-700"
              />
              <span className="text-[11px] text-amber-600 font-medium mt-1 block">C + Mn/6 + (Cr+Mo+V)/5 + (Ni+Cu)/15</span>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-600 font-mono">Min Yield ($R_e$ N/mm²)</label>
              <input 
                type="number" 
                value={config.minYieldStrength}
                onChange={e => setConfig({...config, minYieldStrength: parseInt(e.target.value) || 0})}
                className="w-full mt-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold text-emerald-700"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">BDS standard: ≥ 500 N/mm²</span>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-600 font-mono">Tensile Ratio ($R_m / R_e$)</label>
              <input 
                type="number" 
                step="0.01" 
                value={config.minTensileRatio}
                onChange={e => setConfig({...config, minTensileRatio: parseFloat(e.target.value) || 0})}
                className="w-full mt-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Seismic requirement: ≥ 1.15</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Operations Diagnostic Logbook */}
      {activeTab === 'logbook' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">Chief Metallurgist & Plant GM Operational Logbook</h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">Maintain shift handover directives, refractory relining schedules, and equipment recalibrations.</p>
            </div>
            {lastSavedTime && (
              <span className="text-[11px] font-mono text-slate-400">
                Last synchronized: {lastSavedTime}
              </span>
            )}
          </div>

          {/* Quick Pre-Set Template Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 font-mono uppercase">Quick Directive:</span>
            <button 
              onClick={() => appendNoteTemplate('FURNACE A RELINING: Completed 30T induction coil coating & magnesite patch. Ready for slow pre-heat cycle.')}
              className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              + Furnace Relining Log
            </button>
            <button 
              onClick={() => appendNoteTemplate('CCM STRAND #2 MAINTENANCE: Replaced copper mold tube (100x100mm). Water jacket flow rate tested at 1200 LPM.')}
              className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              + CCM Mold Replacement
            </button>
            <button 
              onClick={() => appendNoteTemplate('TMT THERMEX QUENCH: Calibrated nozzle water pressure to 14.2 Bar for 16mm deformed bar rolling campaign.')}
              className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              + TMT Quench Calibration
            </button>
          </div>

          <textarea
            rows={10}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#C5A059]/30 focus:border-[#C5A059] bg-slate-50/50"
            placeholder="Document shift handover memos, refractory maintenance logs, billet quality observations, and SCADA anomalies..."
          />
        </div>
      )}

    </div>
  );
}
