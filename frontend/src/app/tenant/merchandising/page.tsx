'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function MerchandisingPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  const tableCellPadding = isCompact ? 'px-4 py-2.5 text-[11px]' : 'px-6 py-3.5 text-xs';
  const tableHeaderPadding = isCompact ? 'px-4 py-2.5 text-[8px]' : 'px-6 py-4 text-[9px]';

  const isSteel = user?.tenantName?.toLowerCase().includes('steel mill') || user?.tenantId === 'steelmill';
  const isLocal = user?.tenantName?.toLowerCase().includes('local business') || user?.tenantId === 'localbiz';

  // 1. GARMENTS VIEW
  const renderGarmentsView = () => {
    const merchStyles = [
      { styleNo: 'STYLE-2026-A92', buyer: 'Zara Group', item: 'Pique Cotton Polo', qty: 25000, shipmentDate: '2026-09-12', status: 'In Sewing' },
      { styleNo: 'STYLE-2026-B12', buyer: 'Nordstrom', item: 'Crewneck Summer Tee', qty: 42000, shipmentDate: '2026-09-25', status: 'Fabric Sourced' },
      { styleNo: 'STYLE-2026-C04', buyer: 'H&M', item: 'Fleece Pullover Hoodie', qty: 18000, shipmentDate: '2026-10-05', status: 'Design Approved' },
      { styleNo: 'STYLE-2026-D88', buyer: 'Target Corp', item: 'Linen Shorts Set', qty: 35000, shipmentDate: '2026-10-18', status: 'Fabric Sourcing' }
    ];

    return (
      <div className="space-y-5 animate-fade-in text-slate-800">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Merchandising Orders Board</h2>
          <p className="text-[11px] text-slate-500">Oversee active apparel styles, client catalogs, and design parameters.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
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
    );
  };

  // 2. STEEL MILL VIEW
  const renderSteelView = () => {
    const scrapPiles = [
      { pileNo: 'PILE-HM-01', type: 'Heavy Melting Steel (HMS 1/2)', weight: 850.4, location: 'Yard Section A', receivedDate: '2026-08-15', purity: '94.2%' },
      { pileNo: 'PILE-PI-02', type: 'Pig Iron Scrap Blocks', weight: 340.2, location: 'Furnace Bin 2', receivedDate: '2026-08-17', purity: '98.5%' },
      { pileNo: 'PILE-SH-03', type: 'Shredded Steel Turnings', weight: 50.0, location: 'Storage Dome 4', receivedDate: '2026-08-19', purity: '91.0%' },
      { pileNo: 'PILE-AL-04', type: 'Light Shredded Alloy Scrap', weight: 210.3, location: 'Yard Section B', receivedDate: '2026-08-20', purity: '89.5%' }
    ];

    return (
      <div className="space-y-5 animate-fade-in text-slate-800">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Scrap Iron Sorting & Pile Registry</h2>
          <p className="text-[11px] text-slate-500">Track raw melting scrap grades, sorted warehouse locations, and purity audits.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>Pile ID</th>
                <th className={tableHeaderPadding}>Scrap Grade Type</th>
                <th className={tableHeaderPadding}>Storage Location</th>
                <th className={`${tableHeaderPadding} text-right`}>Sorted Weight</th>
                <th className={tableHeaderPadding}>Receiving Date</th>
                <th className={`${tableHeaderPadding} text-center`}>Lab Purity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {scrapPiles.map((pile, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-orange-600 font-mono font-bold`}>{pile.pileNo}</td>
                  <td className={`${tableCellPadding} text-slate-900 font-bold`}>{pile.type}</td>
                  <td className={tableCellPadding}>{pile.location}</td>
                  <td className={`${tableCellPadding} text-right font-mono`}>{pile.weight.toLocaleString()} MT</td>
                  <td className={`${tableCellPadding} text-slate-500 font-mono`}>{pile.receivedDate}</td>
                  <td className={`${tableCellPadding} text-center`}>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono tracking-wider bg-orange-50 text-orange-600 border border-orange-200/30">
                      {pile.purity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 3. LOCAL BUSINESS VIEW
  const renderLocalView = () => {
    const products = [
      { sku: 'SKU-APP-1001', category: 'Ready Apparel', name: 'Cotton Classic Polo', cost: 12.00, price: 24.99, stock: 450 },
      { sku: 'SKU-FOT-2004', category: 'Footwear & Boots', name: 'Premium Leather Loafers', cost: 45.00, price: 89.99, stock: 120 },
      { sku: 'SKU-TEX-5002', category: 'Home Textile Decors', name: 'Satin Cotton Bed Sheets', cost: 18.00, price: 34.99, stock: 280 },
      { sku: 'SKU-ACC-9008', category: 'Fashion Accessories', name: 'Alloy Buckle Belt', cost: 6.50, price: 14.99, stock: 520 }
    ];

    return (
      <div className="space-y-5 animate-fade-in text-slate-800">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Products Catalog & SKUs Board</h2>
          <p className="text-[11px] text-slate-500">Manage shop sales catalog items, unit procurement costs, retail prices, and stock counts.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/85 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                <th className={tableHeaderPadding}>SKU ID</th>
                <th className={tableHeaderPadding}>Category</th>
                <th className={tableHeaderPadding}>Product Title</th>
                <th className={`${tableHeaderPadding} text-right`}>Unit Cost</th>
                <th className={`${tableHeaderPadding} text-right`}>Retail Price</th>
                <th className={`${tableHeaderPadding} text-center`}>Stockroom Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {products.map((prod, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className={`${tableCellPadding} text-indigo-650 font-mono font-bold`}>{prod.sku}</td>
                  <td className={tableCellPadding}>{prod.category}</td>
                  <td className={`${tableCellPadding} text-slate-900 font-bold`}>{prod.name}</td>
                  <td className={`${tableCellPadding} text-right font-mono`}>${prod.cost.toFixed(2)}</td>
                  <td className={`${tableCellPadding} text-right font-mono text-emerald-600`}>${prod.price.toFixed(2)}</td>
                  <td className={`${tableCellPadding} text-center font-mono`}>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      prod.stock > 150 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {prod.stock} Pcs
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (isSteel) return renderSteelView();
  if (isLocal) return renderLocalView();
  return renderGarmentsView();
}
