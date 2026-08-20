'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

type Employee = {
  empId: string;
  name: string;
  dept: string;
  role: string;
  attendance: string;
};

export default function HRMSPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-3.5 text-[9px]';

  const employees: Employee[] = [
    { empId: 'EMP-082', name: 'Alistair Sterling', dept: 'Industrial Engineering', role: 'Chief IE Officer', attendance: 'Present' },
    { empId: 'EMP-119', name: 'Marcus Vance', dept: 'Sewing Floor', role: 'Line 1 Supervisor', attendance: 'Present' },
    { empId: 'EMP-124', name: 'Rita Diaz', dept: 'Sewing Floor', role: 'Line 2 Supervisor', attendance: 'Present' },
    { empId: 'EMP-203', name: 'Elena Rostova', dept: 'Quality Assurance', role: 'Senior QA Inspector', attendance: 'Present' }
  ];

  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">HRMS Personnel Directory</h2>
        <p className="text-[11px] text-slate-500">Oversee active staff profiles, department roles, and shift attendance status.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Employee ID</th>
                <th className={tableHeaderPadding}>Employee Name</th>
                <th className={tableHeaderPadding}>Department</th>
                <th className={tableHeaderPadding}>Assigned Role</th>
                <th className={`${tableHeaderPadding} text-center`}>Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {employees.map((emp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-indigo-600 font-mono font-bold`}>{emp.empId}</td>
                  <td className={`${tableCellPadding} text-slate-900 font-bold`}>{emp.name}</td>
                  <td className={tableCellPadding}>{emp.dept}</td>
                  <td className={tableCellPadding}>{emp.role}</td>
                  <td className={`${tableCellPadding} text-center`}>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-500/20 rounded font-mono text-[9px] font-extrabold">
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
  );
}
