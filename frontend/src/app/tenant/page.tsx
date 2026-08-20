'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type TabType =
  | 'overview'
  | 'merchandising'
  | 'production-planning'
  | 'procurement-management'
  | 'inventory-management'
  | 'garments-production'
  | 'commercial'
  | 'financial-accounting'
  | 'hrms'
  | 'textile-manufacturing'
  | 'industrial-engineering'
  | 'quality-management'
  | 'printing-embroidery'
  | 'system-configuration'
  | 'profile';

// Mock Data Types
type MerchStyle = { styleNo: string; buyer: string; item: string; qty: number; shipmentDate: string; status: string };
type ProductionPlan = { line: string; styleNo: string; plannedQty: number; startDate: string; endDate: string; efficiency: string };
type PurchaseOrder = { poNo: string; supplier: string; rawMaterial: string; qty: number; uom: string; cost: number; status: string };
type FabricStock = { itemId: string; name: string; type: string; qty: number; uom: string; loc: string };
type ProductionOutput = { line: string; styleNo: string; target: number; actual: number; defects: number; supervisor: string };
type CommercialContract = { lcNo: string; buyer: string; contractVal: number; lcStatus: string; customsClearance: string; shipmentPort: string };
type Employee = { empId: string; name: string; dept: string; role: string; attendance: string };
type TextileMachine = { machineId: string; type: string; status: 'knitting' | 'dyeing' | 'idle' | 'maintenance'; output: number; tempPressure: string };
type IEOperation = { operationName: string; section: string; smv: number; machineUsed: string; targetPerHour: number };
type QAInspection = { styleNo: string; stage: string; inspectedQty: number; minorDefects: number; majorDefects: number; decision: string };
type PrintJob = { jobNo: string; styleNo: string; type: string; panelsQty: number; subcontractor: string; status: string };
type PermissionSet = { roleName: string; merchandising: string; production: string; finance: string; quality: string };

export default function TenantDashboard() {
  const { user, loading, logout, updateProfile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasSetInitialTab, setHasSetInitialTab] = useState(false);

  // Profile Settings Form State
  const [profileName, setProfileName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [densityPref, setDensityPref] = useState<'cozy' | 'compact'>('cozy');
  const [landingTabPref, setLandingTabPref] = useState('overview');
  const [tenantNamePref, setTenantNamePref] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Mock State Data sets
  const [merchStyles, setMerchStyles] = useState<MerchStyle[]>([
    { styleNo: 'STYLE-2026-A92', buyer: 'Zara Group', item: 'Pique Cotton Polo', qty: 25000, shipmentDate: '2026-09-12', status: 'In Sewing' },
    { styleNo: 'STYLE-2026-B12', buyer: 'Nordstrom', item: 'Crewneck Summer Tee', qty: 42000, shipmentDate: '2026-09-25', status: 'Fabric Sourced' },
    { styleNo: 'STYLE-2026-C04', buyer: 'H&M', item: 'Fleece Pullover Hoodie', qty: 18000, shipmentDate: '2026-10-05', status: 'Design Approved' },
    { styleNo: 'STYLE-2026-D88', buyer: 'Target Corp', item: 'Linen Shorts Set', qty: 35000, shipmentDate: '2026-10-18', status: 'Fabric Sourcing' }
  ]);

  const [prodPlans, setProdPlans] = useState<ProductionPlan[]>([
    { line: 'Sewing Line 1', styleNo: 'STYLE-2026-A92', plannedQty: 10000, startDate: '2026-08-20', endDate: '2026-08-27', efficiency: '92.5%' },
    { line: 'Sewing Line 2', styleNo: 'STYLE-2026-A92', plannedQty: 15000, startDate: '2026-08-21', endDate: '2026-08-29', efficiency: '88.3%' },
    { line: 'Sewing Line 3', styleNo: 'STYLE-2026-B12', plannedQty: 20000, startDate: '2026-08-25', endDate: '2026-09-02', efficiency: '95.0%' }
  ]);

  const [procurementPOs, setProcurementPOs] = useState<PurchaseOrder[]>([
    { poNo: 'PO-YRN-001', supplier: 'Siam Spinner Co.', rawMaterial: 'Cotton Yarn (30s Combed)', qty: 15, uom: 'Tons', cost: 42000, status: 'In Transit' },
    { poNo: 'PO-FAB-012', supplier: 'Guangdong Knit Dye', rawMaterial: 'Elastane Blend Jersey Fabric', qty: 8500, uom: 'Kgs', cost: 38250, status: 'Received' },
    { poNo: 'PO-TRM-033', supplier: 'YKK Fasteners', rawMaterial: 'Concealed Metal Zippers 7in', qty: 20000, uom: 'Pcs', cost: 6400, status: 'Ordered' }
  ]);

  const [fabricStocks, setFabricStocks] = useState<FabricStock[]>([
    { itemId: 'FAB-001', name: 'Cotton Pique Knit (Navy)', type: 'Body Fabric', qty: 4500, uom: 'Kgs', loc: 'Warehouse A' },
    { itemId: 'FAB-002', name: 'Combed Cotton Jersey (White)', type: 'Body Fabric', qty: 8200, uom: 'Kgs', loc: 'Warehouse B' },
    { itemId: 'TRM-012', name: 'Polyester Sewing Thread (Grey)', type: 'Trims', qty: 1200, uom: 'Cones', loc: 'Trim Store' },
    { itemId: 'TRM-088', name: 'Acme Designer Buttons 12mm', type: 'Accessories', qty: 48000, uom: 'Pcs', loc: 'Trim Store' }
  ]);

  const [sewingOutputs, setSewingOutputs] = useState<ProductionOutput[]>([
    { line: 'Sewing Line 1', styleNo: 'STYLE-2026-A92', target: 800, actual: 785, defects: 8, supervisor: 'Marcus Vance' },
    { line: 'Sewing Line 2', styleNo: 'STYLE-2026-A92', target: 600, actual: 612, defects: 12, supervisor: 'Rita Diaz' },
    { line: 'Sewing Line 3', styleNo: 'STYLE-2026-B12', target: 900, actual: 854, defects: 15, supervisor: 'Arthur Pendelton' }
  ]);

  const [commercials, setCommercials] = useState<CommercialContract[]>([
    { lcNo: 'LC-2026-9921', buyer: 'Zara Group', contractVal: 185000, lcStatus: 'Fully Advised', customsClearance: 'Pending Gate II', shipmentPort: 'Port of Chittagong' },
    { lcNo: 'LC-2026-8802', buyer: 'Nordstrom', contractVal: 320000, lcStatus: 'Approved & Active', customsClearance: 'Passed Gate I', shipmentPort: 'Shanghai Port' }
  ]);

  const [employees, setEmployees] = useState<Employee[]>([
    { empId: 'EMP-082', name: 'Alistair Sterling', dept: 'Industrial Engineering', role: 'Chief IE Officer', attendance: 'Present' },
    { empId: 'EMP-119', name: 'Marcus Vance', dept: 'Sewing Floor', role: 'Line 1 Supervisor', attendance: 'Present' },
    { empId: 'EMP-124', name: 'Rita Diaz', dept: 'Sewing Floor', role: 'Line 2 Supervisor', attendance: 'Present' },
    { empId: 'EMP-203', name: 'Elena Rostova', dept: 'Quality Assurance', role: 'Senior QA Inspector', attendance: 'Present' }
  ]);

  const [textileMachines, setTextileMachines] = useState<TextileMachine[]>([
    { machineId: 'KNIT-M01', type: 'Circular Knitting Machine', status: 'knitting', output: 340, tempPressure: 'N/A' },
    { machineId: 'DYEVAT-01', type: 'Dyeing Jet Vat (500kg)', status: 'dyeing', output: 500, tempPressure: 'Temp: 98C / 3.2 Bar' },
    { machineId: 'DYEVAT-02', type: 'Dyeing Jet Vat (250kg)', status: 'idle', output: 0, tempPressure: 'Ambient / 0 Bar' }
  ]);

  const [ieOperations, setIeOperations] = useState<IEOperation[]>([
    { operationName: 'Neck rib attachments', section: 'Sewing Assembly', smv: 0.45, machineUsed: 'Overlock 4-Thread', targetPerHour: 133 },
    { operationName: 'Bottom hem stitch', section: 'Sewing Assembly', smv: 0.32, machineUsed: 'Flatlock Coverstitch', targetPerHour: 187 },
    { operationName: 'Main label joining', section: 'Sewing Prep', smv: 0.18, machineUsed: 'Single Needle Lockstitch', targetPerHour: 333 }
  ]);

  const [qaInspections, setQaInspections] = useState<QAInspection[]>([
    { styleNo: 'STYLE-2026-A92', stage: 'Inline Inspection', inspectedQty: 250, minorDefects: 14, majorDefects: 2, decision: 'Passed (AQL 2.5)' },
    { styleNo: 'STYLE-2026-B12', stage: 'Pre-Final Audit', inspectedQty: 500, minorDefects: 28, majorDefects: 9, decision: 'Rejected (AQL Violation)' }
  ]);

  const [printJobs, setPrintJobs] = useState<PrintJob[]>([
    { jobNo: 'JOB-PRT-02', styleNo: 'STYLE-2026-C04', type: 'Fleece Screen Print', panelsQty: 18000, subcontractor: 'Nova Print Labs', status: 'Design Approved' },
    { jobNo: 'JOB-EMB-11', styleNo: 'STYLE-2026-A92', type: 'Front Chest Logo Embroidery', panelsQty: 25000, subcontractor: 'Acme In-house', status: 'Running' }
  ]);

  const [permissions, setPermissions] = useState<PermissionSet[]>([
    { roleName: 'Tenant Executive / Administrator', merchandising: 'Full Edit', production: 'Full Edit', finance: 'Full Edit', quality: 'Full Edit' },
    { roleName: 'Production Supervisor / Engineer', merchandising: 'Read-only', production: 'Full Edit', finance: 'Read-only', quality: 'View & Input' },
    { roleName: 'QA / Inspector', merchandising: 'No Access', production: 'Read-only', finance: 'No Access', quality: 'Full Edit' }
  ]);

  // Security guard redirect if not authorized
  useEffect(() => {
    if (!loading && (!user || user.role !== 'tenant-admin')) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Load preferences
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setDensityPref(user.preferences?.density || 'cozy');
      setLandingTabPref(user.preferences?.defaultTab || 'overview');
      setTenantNamePref(user.tenantName || '');
      if (!hasSetInitialTab && user.preferences?.defaultTab) {
        setActiveTab(user.preferences.defaultTab as TabType);
        setHasSetInitialTab(true);
      }
    }
  }, [user, hasSetInitialTab]);

  // Layout density modifiers
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-3.5 py-1.5 text-[11px]' : 'px-4 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-3.5 py-2 text-[8px]' : 'px-4 py-3.5 text-[9px]';
  const gridGap = isCompact ? 'gap-3.5' : 'gap-4 sm:gap-6';
  const cardPadding = isCompact ? 'p-4' : 'p-5';

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

    if (!tenantNamePref.trim()) {
      setProfileError('Company Name cannot be empty.');
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
      tenantName: tenantNamePref.trim(),
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

  if (loading || !user || !user.tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-slate-400 font-mono text-xs">
        Loading Corporate Workspace...
      </div>
    );
  }

  // Sidebar navigation panel grouping JSX
  const sidebarElement = (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Sidebar Header Brand */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/40 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6EE] border border-[#C5A059]/20 flex items-center justify-center text-sm shadow-xs">
              🏢
            </div>
            <div className="leading-none overflow-hidden max-w-[140px]">
              <h2 className="text-xs font-black text-slate-900 truncate">
                {user.tenantName || 'Workspace'}
              </h2>
              <p className="text-[8px] text-[#B48F48] font-mono tracking-wider uppercase font-extrabold mt-1">
                Workspace Node
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="block lg:hidden text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links Scroll Box */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto min-h-0 scrollbar-thin">
          <button
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'overview'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'overview' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>Overview</span>
          </button>

          <button
            onClick={() => { setActiveTab('merchandising'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'merchandising'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'merchandising' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>Merchandising</span>
          </button>

          <button
            onClick={() => { setActiveTab('production-planning'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'production-planning'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'production-planning' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>Production Planning</span>
          </button>

          <button
            onClick={() => { setActiveTab('garments-production'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'garments-production'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'garments-production' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>Garments Production</span>
          </button>

          <button
            onClick={() => { setActiveTab('textile-manufacturing'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'textile-manufacturing'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'textile-manufacturing' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>Textile Mfg.</span>
          </button>

          <button
            onClick={() => { setActiveTab('procurement-management'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'procurement-management'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'procurement-management' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>Procurement</span>
          </button>

          <button
            onClick={() => { setActiveTab('inventory-management'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'inventory-management'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'inventory-management' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>Inventory Management</span>
          </button>

          <button
            onClick={() => { setActiveTab('printing-embroidery'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'printing-embroidery'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'printing-embroidery' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>Printing & Embroidery</span>
          </button>

          <button
            onClick={() => { setActiveTab('commercial'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'commercial'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'commercial' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>Commercial Gate</span>
          </button>

          <button
            onClick={() => { setActiveTab('financial-accounting'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'financial-accounting'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'financial-accounting' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>Financial Ledger</span>
          </button>

          <button
            onClick={() => { setActiveTab('hrms'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'hrms'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'hrms' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>HRMS Payroll</span>
          </button>

          <button
            onClick={() => { setActiveTab('industrial-engineering'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'industrial-engineering'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'industrial-engineering' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>IE Operations</span>
          </button>

          <button
            onClick={() => { setActiveTab('quality-management'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'quality-management'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'quality-management' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>Quality Audits</span>
          </button>

          <button
            onClick={() => { setActiveTab('system-configuration'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'system-configuration'
                ? 'bg-[#FAF6EE]/60 text-[#B48F48]'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
            }`}
          >
            {activeTab === 'system-configuration' && (
              <div className="absolute left-0 top-2.5 w-1 h-5 bg-[#C5A059] rounded-r" />
            )}
            <span>System Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer User Details */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div 
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
            className="flex items-center justify-between mb-3.5 cursor-pointer hover:bg-slate-100/50 p-1 rounded-xl transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FAF6EE] border border-[#C5A059]/30 flex items-center justify-center font-bold text-[10px] text-[#B48F48]">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-black text-slate-900 truncate w-28">{user.name}</p>
                <span className="inline-flex px-1.5 py-0.2 bg-slate-100 text-[#B48F48] rounded text-[8px] font-bold uppercase tracking-wider font-mono">
                  {user.role.split('-')[1]}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-[10px] font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </div>
  );

  return (
    <div className="h-screen w-screen flex bg-[#FAF9F6] text-slate-800 font-sans overflow-hidden relative">
      
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex w-64 h-full bg-white border-r border-slate-200/80 flex-col justify-between flex-shrink-0 z-10">
        {sidebarElement}
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* MOBILE SIDEBAR SLIDE PANEL */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between transition-transform duration-300 transform lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarElement}
      </aside>

      {/* MAIN CONTENT AREA: Right Side */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        
        {/* Top Header Breadcrumbs */}
        <header className="h-14 border-b border-slate-200/60 bg-white/50 backdrop-blur-xs flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="block lg:hidden p-1 text-slate-500 hover:bg-slate-100 rounded-lg focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 font-mono">
              <span>SMC</span>
              <span>/</span>
              <span className="truncate max-w-[80px]">{(user.tenantName || 'Workspace').toUpperCase()}</span>
              <span>/</span>
              <span className="text-slate-800 capitalize font-bold">{activeTab.replace('-', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase hidden sm:block">
              ROLE: {user.role.replace('-', ' ')}
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border transition-all ${
                activeTab === 'profile'
                  ? 'bg-[#FAF6EE] border-[#C5A059] text-[#B48F48]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-[#B48F48] border border-slate-200">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-bold hidden md:inline">{user.name}</span>
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 bg-slate-50/50 min-h-0 font-sans">
          
          {/* TABS OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className={`grid grid-cols-2 lg:grid-cols-4 ${gridGap}`}>
                
                <div className={`bg-white border border-slate-200/80 ${cardPadding} rounded-2xl shadow-sm`}>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Active Styles</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5 font-mono">{merchStyles.length}</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">PRODUCT CATALOG</p>
                </div>

                <div className={`bg-white border border-slate-200/80 ${cardPadding} rounded-2xl shadow-sm`}>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Sewing Lines</p>
                  <h3 className="text-2xl font-extrabold text-indigo-600 mt-1.5 font-mono">{sewingOutputs.length}</h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">SHOP FLOOR</p>
                </div>

                <div className={`bg-white border border-slate-200/80 ${cardPadding} rounded-2xl shadow-sm`}>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Total POs Cost</p>
                  <h3 className="text-2xl font-extrabold text-emerald-600 mt-1.5 font-mono">
                    ${procurementPOs.reduce((s, p) => s + p.cost, 0).toLocaleString()}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">SOURCING BILLS</p>
                </div>

                <div className={`bg-white border border-slate-200/80 ${cardPadding} rounded-2xl shadow-sm`}>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">LC Contracts</p>
                  <h3 className="text-2xl font-extrabold text-amber-600 mt-1.5 font-mono">
                    ${commercials.reduce((s, c) => s + c.contractVal, 0).toLocaleString()}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold mt-1 font-mono">EXPORT LEDGER</p>
                </div>
              </div>

              {/* Graphical Layout */}
              <div className={`grid grid-cols-1 md:grid-cols-2 ${gridGap}`}>
                <div className={`bg-white border border-slate-200 ${cardPadding} rounded-2xl space-y-4 shadow-sm`}>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Shop floor melt yield</h3>
                  <div className="h-32 flex items-end space-x-2.5 pb-2">
                    <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[85%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">94.2%</span></div>
                    <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[90%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">94.8%</span></div>
                    <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[88%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">94.5%</span></div>
                    <div className="w-full bg-[#FAF6EE] border border-[#C5A059]/25 h-[95%] rounded flex flex-col justify-end text-center pb-1"><span className="text-[9px] font-mono text-[#B48F48] font-bold">95.2%</span></div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold text-center uppercase font-mono">LAST 4 MELTING RUNS</p>
                </div>

                <div className={`bg-white border border-slate-200 ${cardPadding} rounded-2xl space-y-4 shadow-sm flex flex-col justify-between`}>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Active Workspaces Telemetry</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2 gap-3">
                      <span className="text-slate-500 font-medium">BOM explosion status</span>
                      <span className="font-bold text-emerald-600 font-mono">OK (100% matched)</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-medium">Stock ledger sync status</span>
                      <span className="font-bold text-[#B48F48] font-mono">SYNCED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1. MERCHANDISING */}
          {activeTab === 'merchandising' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Merchandising Orders Board</h2>
                <p className="text-[11px] text-slate-500">Oversee active apparel styles, client catalogs, and design parameters.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className={tableHeaderPadding}>Style No</th>
                        <th className={tableHeaderPadding}>Buyer / Client</th>
                        <th className={tableHeaderPadding}>Garment Item</th>
                        <th className={`${tableHeaderPadding} text-right`}>Ordered Qty</th>
                        <th className={tableHeaderPadding}>Shipment Date</th>
                        <th className={`${tableHeaderPadding} text-center`}>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {merchStyles.map((style, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{style.styleNo}</td>
                          <td className={`${tableCellPadding} text-slate-900 font-bold`}>{style.buyer}</td>
                          <td className={tableCellPadding}>{style.item}</td>
                          <td className={`${tableCellPadding} text-right font-mono`}>{style.qty.toLocaleString()} Pcs</td>
                          <td className={`${tableCellPadding} text-slate-500 font-mono`}>{style.shipmentDate}</td>
                          <td className={`${tableCellPadding} text-center`}>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200/30">
                              {style.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTION PLANNING */}
          {activeTab === 'production-planning' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Line Scheduling & Planning</h2>
                <p className="text-[11px] text-slate-500">Allocate sewing lines, schedule starts, and assign target layouts.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className={tableHeaderPadding}>Assigned Line</th>
                        <th className={tableHeaderPadding}>Style No</th>
                        <th className={`${tableHeaderPadding} text-right`}>Planned Qty</th>
                        <th className={tableHeaderPadding}>Planned Start</th>
                        <th className={tableHeaderPadding}>Planned End</th>
                        <th className={`${tableHeaderPadding} text-center`}>Target Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {prodPlans.map((plan, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className={`${tableCellPadding} text-slate-900 font-bold`}>{plan.line}</td>
                          <td className={`${tableCellPadding} text-indigo-600 font-mono`}>{plan.styleNo}</td>
                          <td className={`${tableCellPadding} text-right font-mono`}>{plan.plannedQty.toLocaleString()} Pcs</td>
                          <td className={`${tableCellPadding} font-mono text-slate-500`}>{plan.startDate}</td>
                          <td className={`${tableCellPadding} font-mono text-slate-500`}>{plan.endDate}</td>
                          <td className={`${tableCellPadding} text-center font-bold font-mono text-emerald-600`}>{plan.efficiency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. PROCUREMENT MANAGEMENT */}
          {activeTab === 'procurement-management' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Procurement & Sourcing (POs)</h2>
                <p className="text-[11px] text-slate-500">Source raw materials, yarn lots, and accessories from global manufacturers.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className={tableHeaderPadding}>PO No</th>
                        <th className={tableHeaderPadding}>Supplier Vendor</th>
                        <th className={tableHeaderPadding}>Material Details</th>
                        <th className={`${tableHeaderPadding} text-right`}>Quantity</th>
                        <th className={`${tableHeaderPadding} text-right`}>Contract Cost</th>
                        <th className={`${tableHeaderPadding} text-center`}>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {procurementPOs.map((po, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{po.poNo}</td>
                          <td className={`${tableCellPadding} text-slate-950 font-bold`}>{po.supplier}</td>
                          <td className={tableCellPadding}>{po.rawMaterial}</td>
                          <td className={`${tableCellPadding} text-right font-mono`}>{po.qty.toLocaleString()} {po.uom}</td>
                          <td className={`${tableCellPadding} text-right font-mono text-slate-950`}>${po.cost.toLocaleString()}</td>
                          <td className={`${tableCellPadding} text-center`}>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                              po.status === 'Received' ? 'bg-emerald-50 text-emerald-600 border-emerald-250/20' : 'bg-amber-50 text-amber-600 border border-amber-250/20'
                            }`}>
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. INVENTORY MANAGEMENT */}
          {activeTab === 'inventory-management' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Raw Fabric & Trims Ledger</h2>
                <p className="text-[11px] text-slate-500">Review warehouse balances, location parameters, and stock records.</p>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gridGap}`}>
                {fabricStocks.map((stock, idx) => (
                  <div key={idx} className={`${cardPadding} bg-white border border-slate-200/80 rounded-2xl flex flex-col justify-between shadow-xs space-y-4`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-950">{stock.name}</h4>
                        <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-extrabold mt-0.5">{stock.type} • {stock.loc}</p>
                      </div>
                      <span className="text-lg">📦</span>
                    </div>
                    <div className="text-right border-t border-slate-50 pt-2.5">
                      <span className="text-base font-extrabold text-slate-900 font-mono">{stock.qty.toLocaleString()}</span>
                      <span className="text-[9px] font-extrabold text-slate-400 font-mono ml-1">{stock.uom}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. GARMENTS PRODUCTION */}
          {activeTab === 'garments-production' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Garment Output Tracking (Sewing Floor)</h2>
                <p className="text-[11px] text-slate-500">Real-time status of active lines, output numbers, and supervisors.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className={tableHeaderPadding}>Sewing Line</th>
                        <th className={tableHeaderPadding}>Running Style</th>
                        <th className={`${tableHeaderPadding} text-right`}>Daily Target</th>
                        <th className={`${tableHeaderPadding} text-right`}>Actual Output</th>
                        <th className={`${tableHeaderPadding} text-right`}>Defects Count</th>
                        <th className={tableHeaderPadding}>Floor Supervisor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {sewingOutputs.map((out, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className={`${tableCellPadding} text-slate-950 font-bold`}>{out.line}</td>
                          <td className={`${tableCellPadding} text-indigo-600 font-mono`}>{out.styleNo}</td>
                          <td className={`${tableCellPadding} text-right font-mono`}>{out.target} Pcs</td>
                          <td className={`${tableCellPadding} text-right font-mono text-emerald-600 font-bold`}>{out.actual} Pcs</td>
                          <td className={`${tableCellPadding} text-right font-mono text-rose-600`}>{out.defects}</td>
                          <td className={tableCellPadding}>{out.supervisor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. COMMERCIAL */}
          {activeTab === 'commercial' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Commercial & Letter of Credit (LC)</h2>
                <p className="text-[11px] text-slate-500">Track banking LCs, custom declarations, and shipment ports status.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className={tableHeaderPadding}>LC Reference</th>
                        <th className={tableHeaderPadding}>Buyer Group</th>
                        <th className={`${tableHeaderPadding} text-right`}>Contract Value</th>
                        <th className={tableHeaderPadding}>LC Status</th>
                        <th className={tableHeaderPadding}>Customs Clearance</th>
                        <th className={tableHeaderPadding}>Shipment Port</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {commercials.map((comm, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className={`${tableCellPadding} text-slate-900 font-bold font-mono`}>{comm.lcNo}</td>
                          <td className={tableCellPadding}>{comm.buyer}</td>
                          <td className={`${tableCellPadding} text-right font-mono font-bold text-emerald-600`}>${comm.contractVal.toLocaleString()}</td>
                          <td className={tableCellPadding}>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-200/30">
                              {comm.lcStatus}
                            </span>
                          </td>
                          <td className={`${tableCellPadding} text-slate-500 font-medium`}>{comm.customsClearance}</td>
                          <td className={`${tableCellPadding} font-mono text-slate-400`}>{comm.shipmentPort}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7. FINANCIAL ACCOUNTING */}
          {activeTab === 'financial-accounting' && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Financial Ledger Statements</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Audit balance sheets, salaries payable, and raw materials expenses.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Income & Liability Balances</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2 gap-3">
                      <span className="text-slate-500 font-medium">Month-to-Date Revenue</span>
                      <span className="font-bold text-emerald-600 font-mono">$505,000</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2 gap-3">
                      <span className="text-slate-500 font-medium">Accounts Payable</span>
                      <span className="font-bold text-rose-600 font-mono">$86,650</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-medium">LC Pending Advise Value</span>
                      <span className="font-bold text-[#B48F48] font-mono">$185,000</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm flex flex-col justify-center text-center">
                  <span className="text-2xl text-[#C5A059]">💵</span>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono mt-1">Audit Log Sync Status</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Double-entry accounting synchronizing correctly with Platform Core ledger nodes.</p>
                </div>
              </div>
            </div>
          )}

          {/* 8. HRMS */}
          {activeTab === 'hrms' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">HRMS Personnel Attendance</h2>
                <p className="text-[11px] text-slate-500">Track executive personnel, line supervisors, and shift status.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className={tableHeaderPadding}>Employee ID</th>
                        <th className={tableHeaderPadding}>Name</th>
                        <th className={tableHeaderPadding}>Department</th>
                        <th className={tableHeaderPadding}>Designation Role</th>
                        <th className={`${tableHeaderPadding} text-center`}>Shift Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {employees.map((emp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className={`${tableCellPadding} text-slate-950 font-mono font-bold`}>{emp.empId}</td>
                          <td className={`${tableCellPadding} text-slate-900 font-bold`}>{emp.name}</td>
                          <td className={tableCellPadding}>{emp.dept}</td>
                          <td className={tableCellPadding}>{emp.role}</td>
                          <td className={`${tableCellPadding} text-center`}>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-500/20 uppercase tracking-wider font-mono">
                              {emp.attendance}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 9. TEXTILE MANUFACTURING */}
          {activeTab === 'textile-manufacturing' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Textile Sourcing (Circular Knitting & Dyeing)</h2>
                <p className="text-[11px] text-slate-500">Track industrial knitting machines outputs and jet dye vat parameters.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className={tableHeaderPadding}>Machine ID</th>
                        <th className={tableHeaderPadding}>Machine Specifications</th>
                        <th className={tableHeaderPadding}>Running Status</th>
                        <th className={`${tableHeaderPadding} text-right`}>Today's Output</th>
                        <th className={`${tableHeaderPadding} text-right`}>Temperature / Pressure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {textileMachines.map((mach, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className={`${tableCellPadding} text-slate-950 font-mono font-bold`}>{mach.machineId}</td>
                          <td className={tableCellPadding}>{mach.type}</td>
                          <td className={tableCellPadding}>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                              mach.status === 'knitting' || mach.status === 'dyeing' ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20' : 'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}>
                              {mach.status}
                            </span>
                          </td>
                          <td className={`${tableCellPadding} text-right font-mono`}>{mach.output > 0 ? `${mach.output} Kgs` : '-'}</td>
                          <td className={`${tableCellPadding} text-right font-mono text-slate-500`}>{mach.tempPressure}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 10. INDUSTRIAL ENGINEERING */}
          {activeTab === 'industrial-engineering' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Industrial Engineering (IE Operation Database)</h2>
                <p className="text-[11px] text-slate-500">Define operational SMVs, style layouts, and machine targets.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className={tableHeaderPadding}>Operation Description</th>
                        <th className={tableHeaderPadding}>Section Assembly</th>
                        <th className={`${tableHeaderPadding} text-right`}>Standard Minute Value (SMV)</th>
                        <th className={tableHeaderPadding}>Machine Preset</th>
                        <th className={`${tableHeaderPadding} text-right`}>Target / Hr</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {ieOperations.map((op, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className={`${tableCellPadding} text-slate-950 font-bold`}>{op.operationName}</td>
                          <td className={tableCellPadding}>{op.section}</td>
                          <td className={`${tableCellPadding} text-right font-mono text-[#B48F48]`}>{op.smv.toFixed(2)} Min</td>
                          <td className={tableCellPadding}>{op.machineUsed}</td>
                          <td className={`${tableCellPadding} text-right font-mono text-slate-950`}>{op.targetPerHour} Pcs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 11. QUALITY MANAGEMENT */}
          {activeTab === 'quality-management' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Quality Audits & Inspections</h2>
                <p className="text-[11px] text-slate-500">Record AQL audits, inline defect logs, and pre-final inspections.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className={tableHeaderPadding}>Style No</th>
                        <th className={tableHeaderPadding}>Inspection Stage</th>
                        <th className={`${tableHeaderPadding} text-right`}>Inspected Size</th>
                        <th className={`${tableHeaderPadding} text-right`}>Minor Defects</th>
                        <th className={`${tableHeaderPadding} text-right`}>Major Defects</th>
                        <th className={`${tableHeaderPadding} text-center`}>Decision Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {qaInspections.map((ins, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className={`${tableCellPadding} text-indigo-600 font-mono`}>{ins.styleNo}</td>
                          <td className={tableCellPadding}>{ins.stage}</td>
                          <td className={`${tableCellPadding} text-right font-mono`}>{ins.inspectedQty} Pcs</td>
                          <td className={`${tableCellPadding} text-right font-mono text-slate-500`}>{ins.minorDefects}</td>
                          <td className={`${tableCellPadding} text-right font-mono text-rose-600`}>{ins.majorDefects}</td>
                          <td className={`${tableCellPadding} text-center`}>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider ${
                              ins.decision.startsWith('Passed') ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20' : 'bg-rose-50 text-rose-600 border border-rose-500/20'
                            }`}>
                              {ins.decision}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 12. PRINTING & EMBROIDERY */}
          {activeTab === 'printing-embroidery' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Printing & Embroidery Panel Subcontracts</h2>
                <p className="text-[11px] text-slate-500">Track print job designs approvals and panel counts sent to subcontractors.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className={tableHeaderPadding}>Job Ref</th>
                        <th className={tableHeaderPadding}>Style No</th>
                        <th className={tableHeaderPadding}>Artwork Type</th>
                        <th className={`${tableHeaderPadding} text-right`}>Panels Qty</th>
                        <th className={tableHeaderPadding}>Subcontractor Fabricator</th>
                        <th className={`${tableHeaderPadding} text-center`}>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {printJobs.map((job, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className={`${tableCellPadding} text-slate-950 font-mono font-bold`}>{job.jobNo}</td>
                          <td className={`${tableCellPadding} text-indigo-600 font-mono`}>{job.styleNo}</td>
                          <td className={tableCellPadding}>{job.type}</td>
                          <td className={`${tableCellPadding} text-right font-mono`}>{job.panelsQty.toLocaleString()} Pcs</td>
                          <td className={tableCellPadding}>{job.subcontractor}</td>
                          <td className={`${tableCellPadding} text-center`}>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-200/20 uppercase tracking-wider font-mono">
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 13. SYSTEM CONFIGURATION */}
          {activeTab === 'system-configuration' && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">ERP Permission Configuration</h2>
                <p className="text-[11px] text-slate-500">Manage organizational permissions and role parameters.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        <th className={tableHeaderPadding}>System Role Name</th>
                        <th className={tableHeaderPadding}>Merchandising Tab</th>
                        <th className={tableHeaderPadding}>Production Logs</th>
                        <th className={tableHeaderPadding}>Commercial & Finance</th>
                        <th className={tableHeaderPadding}>Quality Inspections</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {permissions.map((perm, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className={`${tableCellPadding} text-slate-950 font-bold`}>{perm.roleName}</td>
                          <td className={tableCellPadding}>{perm.merchandising}</td>
                          <td className={tableCellPadding}>{perm.production}</td>
                          <td className={tableCellPadding}>{perm.finance}</td>
                          <td className={tableCellPadding}>{perm.quality}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">Profile & Platform Preferences</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Manage your credential parameters, layout aesthetics, and dashboard defaults.</p>
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

              <form onSubmit={handleUpdateProfile} className="space-y-6 sm:space-y-8 text-slate-800">
                
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
                        value={user.email}
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
                        placeholder="Sarah Jenkins"
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
                        <option value="overview">Workspace Overview</option>
                        <option value="merchandising">Merchandising</option>
                        <option value="production-planning">Production Planning</option>
                        <option value="procurement-management">Procurement</option>
                        <option value="inventory-management">Inventory Management</option>
                        <option value="garments-production">Garments Production</option>
                        <option value="commercial">Commercial Gate</option>
                        <option value="financial-accounting">Financial Ledger</option>
                        <option value="hrms">HRMS Payroll</option>
                        <option value="textile-manufacturing">Textile Mfg.</option>
                        <option value="industrial-engineering">IE Operations</option>
                        <option value="quality-management">Quality Audits</option>
                        <option value="printing-embroidery">Printing & Embroidery</option>
                        <option value="system-configuration">System Settings</option>
                      </select>
                      <p className="text-[9px] text-slate-400">Controls which view opens instantly when logging into SMC.</p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Organization Details */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center space-x-3 border-b border-slate-100 pb-3.5">
                    <span className="text-base">🏢</span>
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Organization Parameters</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Company Name</label>
                      <input
                        type="text"
                        value={tenantNamePref}
                        onChange={(e) => setTenantNamePref(e.target.value)}
                        placeholder="e.g. Acme Steel Corp"
                        className="w-full px-3.5 py-2.5 bg-slate-50/50 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all text-xs font-semibold"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Tenant Workspace Slug</label>
                      <input
                        type="text"
                        disabled
                        value={`/${user.tenantId}`}
                        className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl text-xs font-semibold cursor-not-allowed font-mono"
                      />
                      <p className="text-[9px] text-slate-400">Security: Tenant slugs are routing keys and cannot be dynamically changed.</p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Password Credentials */}
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

                <div className="flex justify-end flex-shrink-0">
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
          )}

        </main>
      </div>
    </div>
  );
}
