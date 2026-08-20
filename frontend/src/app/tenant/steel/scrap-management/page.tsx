'use client';
import React from 'react';
export default function ScrapPage() {
  const scrapPiles = [
    { pileNo: 'PILE-HM-01', type: 'Heavy Melting Steel (HMS 1/2)', weight: 850.4, location: 'Yard Section A', purity: '94.2%' },
    { pileNo: 'PILE-PI-02', type: 'Pig Iron Scrap Blocks', weight: 340.2, location: 'Furnace Bin 2', purity: '98.5%' },
    { pileNo: 'PILE-SH-03', type: 'Shredded Steel Turnings', weight: 50.0, location: 'Storage Dome 4', purity: '91.0%' }
  ];
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Scrap Iron Sorting & Pile Registry</h2>
        <p className="text-[11px] text-slate-500">Track raw melting scrap grades, sorted warehouse locations, and purity audits.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <th className="p-3">Pile ID</th>
              <th className="p-3">Scrap Grade Type</th>
              <th className="p-3">Location</th>
              <th className="p-3 text-right">Sorted Weight</th>
              <th className="p-3 text-center">Lab Purity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {scrapPiles.map((pile, idx) => (
              <tr key={idx}>
                <td className="p-3 text-orange-600 font-mono">{pile.pileNo}</td>
                <td className="p-3">{pile.type}</td>
                <td className="p-3">{pile.location}</td>
                <td className="p-3 text-right">{pile.weight} MT</td>
                <td className="p-3 text-center">{pile.purity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
