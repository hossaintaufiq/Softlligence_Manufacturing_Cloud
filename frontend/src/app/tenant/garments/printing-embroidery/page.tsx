'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type PrintJob = {
  jobNo: string;
  styleNo: string;
  type: string;
  panelsQty: number;
  subcontractor: string;
  status: string;
};

export default function PrintingEmbroideryPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const printJobs: PrintJob[] = [
    { jobNo: 'JOB-PRT-02', styleNo: 'STYLE-2026-C04', type: 'Fleece Screen Print', panelsQty: 18000, subcontractor: 'Nova Print Labs', status: 'Design Approved' },
    { jobNo: 'JOB-EMB-11', styleNo: 'STYLE-2026-A92', type: 'Front Chest Logo Embroidery', panelsQty: 25000, subcontractor: 'Acme In-house', status: 'Running' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Subcontract Printing & Embroidery Jobs</h2>
        <p className="text-[11px] text-slate-500">Track fabric panel printing prints, embroidery runs, and subcontractors status.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Job Ticket</th>
                <th className={tableHeaderPadding}>Style No</th>
                <th className={tableHeaderPadding}>Job Decoration Type</th>
                <th className={`${tableHeaderPadding} text-right`}>Fabric Panels</th>
                <th className={tableHeaderPadding}>Subcontractor Vendor</th>
                <th className={`${tableHeaderPadding} text-center`}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {printJobs.map((job, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{job.jobNo}</td>
                  <td className={`${tableCellPadding} text-slate-950 font-bold`}>{job.styleNo}</td>
                  <td className={tableCellPadding}>{job.type}</td>
                  <td className={`${tableCellPadding} text-right font-mono`}>{job.panelsQty.toLocaleString()} Panels</td>
                  <td className={`${tableCellPadding} font-mono text-slate-500`}>{job.subcontractor}</td>
                  <td className={`${tableCellPadding} text-center`}>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider bg-slate-100 text-[#B48F48] border border-slate-200/30">
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
  );
}
