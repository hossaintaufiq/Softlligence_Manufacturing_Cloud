'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DispatchRow {
  id: number;
  date: string;
  customer_name: string;
  challan_no: string;
  rod_size: string;
  dispatch_qty_kg: number;
  rate_per_kg: number;
  total_selling_price: number;
  truck_no: string;
  contact_info: string;
}

export default function DispatchPage() {
  const { user } = useAuth();
  const isCompact = user?.preferences?.density === 'compact';
  
  // Data State
  const [data, setData] = useState<DispatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortField, setSortField] = useState<keyof DispatchRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    customer_name: '',
    challan_no: '',
    rod_size: '12mm',
    dispatch_qty_kg: '',
    rate_per_kg: '',
    truck_no: '',
    contact_info: ''
  });
  const [validationError, setValidationError] = useState('');

  // Challan Print State
  const [activeChallan, setActiveChallan] = useState<DispatchRow | null>(null);

  const cellPadding = isCompact ? 'px-4 py-2 text-[11px]' : 'px-5 py-3 text-xs';

  const rodSizes = ['10mm', '12mm', '16mm', '20mm', '25mm', '32mm'];

  async function loadData() {
    try {
      const res = await fetch('/api/dispatch');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSort = (field: keyof DispatchRow) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Customer Name', 'Challan No', 'Rod Size', 'Qty (kg)', 'Rate/kg', 'Total Price', 'Truck No', 'Contact Info'];
    const rows = filteredData.map(r => [
      r.id, r.date, r.customer_name, r.challan_no, r.rod_size, r.dispatch_qty_kg, r.rate_per_kg, r.total_selling_price, r.truck_no, r.contact_info
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_dispatch_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const qty = parseFloat(form.dispatch_qty_kg);
    const rate = parseFloat(form.rate_per_kg);

    // Inline Validation
    if (!form.customer_name.trim()) return setValidationError('Customer Name is required.');
    if (!form.challan_no.trim()) return setValidationError('Challan Number is required.');
    if (isNaN(qty) || qty <= 0) return setValidationError('Dispatch quantity must be positive.');
    if (isNaN(rate) || rate <= 0) return setValidationError('Selling rate/kg must be positive.');
    if (!form.truck_no.trim()) return setValidationError('Truck license number is required.');

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddOpen(false);
        setForm({
          date: new Date().toISOString().split('T')[0],
          customer_name: '',
          challan_no: '',
          rod_size: '12mm',
          dispatch_qty_kg: '',
          rate_per_kg: '',
          truck_no: '',
          contact_info: ''
        });
        loadData();
      } else {
        setValidationError(json.error || 'Server error occurred.');
      }
    } catch (err) {
      setValidationError('Failed to connect to backend.');
    }
  };

  // Filter & Sort Logic
  const filteredData = data
    .filter(r => {
      const matchSearch = r.customer_name.toLowerCase().includes(search.toLowerCase()) || 
                          r.challan_no.toLowerCase().includes(search.toLowerCase());
      const matchSize = sizeFilter ? r.rod_size === sizeFilter : true;
      return matchSearch && matchSize;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (typeof valA === 'string') {
        return sortDir === 'asc' 
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      } else {
        return sortDir === 'asc' 
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

  const totalDispatchQty = filteredData.reduce((sum, r) => sum + r.dispatch_qty_kg, 0);
  const totalRevenue = filteredData.reduce((sum, r) => sum + r.total_selling_price, 0);

  const printChallan = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800  print:text-black">
      
      {/* Title Bar - Hide on print */}
      <div className="flex justify-between items-center border-b border-slate-200  pb-3.5 print:hidden">
        <div>
          <h2 className="text-base font-extrabold text-slate-900  uppercase tracking-wider font-mono">Sales & Dispatch Management</h2>
          <p className="text-[11px] text-slate-500  mt-0.5">Issue delivery challans, deduct inventory balances, and track billing receivables for outgoing steel products.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-[#C5A059] hover:bg-[#B48F48] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          + Create Dispatch Challan
        </button>
      </div>

      {/* Stats Cards - Hide on print */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 print:hidden">
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Dispatched</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">{(totalDispatchQty / 1000).toFixed(2)} MT</h4>
          <p className="text-[8px] text-emerald-600  font-bold font-mono mt-1">● COMPLETED VEHICLE RELEASES</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Total Selling Value</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">৳{totalRevenue.toLocaleString()}</h4>
          <p className="text-[8px] text-[#B48F48]  font-bold font-mono mt-1">● ADDED TO RECEIVABLES LEDGER</p>
        </div>
        <div className="bg-white  border border-slate-200  p-4 rounded-xl shadow-2xs">
          <p className="text-[9px] text-slate-400  font-bold uppercase font-mono">Average Rate</p>
          <h4 className="text-xl font-black text-slate-900  font-mono mt-1">
            ৳{totalDispatchQty > 0 ? (totalRevenue / totalDispatchQty).toFixed(2) : '0'} / kg
          </h4>
          <p className="text-[8px] text-indigo-600  font-bold font-mono mt-1">● WEIGHTED AVERAGE SELLING PRICE</p>
        </div>
      </div>

      {/* Filter and Control Bar - Hide on print */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white  border border-slate-200  p-4 rounded-2xl shadow-2xs print:hidden">
        <input 
          type="text" 
          placeholder="Search by customer name or challan number..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        />
        <select 
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="bg-slate-50  border border-slate-200  text-xs px-3 py-2 rounded-xl focus:outline-none"
        >
          <option value="">All Rod Diameters</option>
          {rodSizes.map((size, idx) => <option key={idx} value={size}>{size}</option>)}
        </select>
        <button 
          onClick={handleExportCSV}
          className="bg-slate-100  hover:bg-slate-200  border border-slate-200  text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          Download CSV
        </button>
      </div>

      {/* Data Grid Table - Hide on print */}
      <div className="bg-white  border border-slate-200  rounded-2xl shadow-xs overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50  border-b border-slate-150  text-[10px] uppercase font-mono text-slate-450 ">
                <th className={cellPadding}>Date</th>
                <th className={cellPadding}>Challan No</th>
                <th className={cellPadding}>Customer</th>
                <th className={cellPadding}>Rod Size</th>
                <th className={`${cellPadding} text-right`}>Qty (kg)</th>
                <th className={`${cellPadding} text-right`}>Rate (৳/kg)</th>
                <th className={`${cellPadding} text-right`}>Total Price</th>
                <th className={cellPadding}>Truck No</th>
                <th className={`${cellPadding} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-slate-400  font-mono">Fetching dispatch ledger...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-slate-400  font-mono">No dispatches logged.</td>
                </tr>
              ) : filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50  transition-colors">
                  <td className={`${cellPadding} font-mono`}>{row.date}</td>
                  <td className={`${cellPadding} font-bold font-mono`}>{row.challan_no}</td>
                  <td className={`${cellPadding} font-black text-slate-900 `}>{row.customer_name}</td>
                  <td className={cellPadding}>
                    <span className="px-2 py-0.5 text-[9px] font-bold border rounded-full bg-slate-50  border-slate-200 ">
                      {row.rod_size}
                    </span>
                  </td>
                  <td className={`${cellPadding} text-right font-mono font-bold text-emerald-650`}>{row.dispatch_qty_kg.toLocaleString()} kg</td>
                  <td className={`${cellPadding} text-right font-mono`}>৳{row.rate_per_kg}</td>
                  <td className={`${cellPadding} text-right font-mono font-bold text-slate-900 `}>৳{row.total_selling_price.toLocaleString()}</td>
                  <td className={`${cellPadding} font-mono text-slate-550 `}>{row.truck_no}</td>
                  <td className={`${cellPadding} text-center`}>
                    <button 
                      onClick={() => setActiveChallan(row)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-[#C5A059]   hover:text-white text-[10px] font-bold rounded-lg border border-slate-200  transition-all cursor-pointer"
                    >
                      Print Challan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 print:hidden">
          <div className="bg-white/95 border border-slate-200/85 p-7 rounded-3xl w-full max-w-md shadow-2xl space-y-5 relative overflow-hidden border-t-4 border-t-[#C5A059] flex flex-col">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900  uppercase tracking-wider font-mono">Create Dispatch Challan</h3>
              <p className="text-[10px] text-slate-450  mt-1">Generates challans and decreases corresponding Rebar diameter yard inventory.</p>
            </div>
            
            {validationError && (
              <div className="bg-rose-50  text-rose-800  p-3 rounded-xl border border-rose-200/50 text-[10px] font-bold font-mono">
                🚨 Error: {validationError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Dispatch Date</label>
                  <input 
                    type="date" 
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Challan Number</label>
                  <input 
                    type="text" 
                    placeholder="CH-77850"
                    value={form.challan_no}
                    onChange={(e) => setForm({ ...form, challan_no: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Customer Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bengal Construction Ltd"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Rod Size Diameter</label>
                  <select 
                    value={form.rod_size}
                    onChange={(e) => setForm({ ...form, rod_size: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  >
                    {rodSizes.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Price (৳/kg)</label>
                  <input 
                    type="number" 
                    placeholder="65"
                    value={form.rate_per_kg}
                    onChange={(e) => setForm({ ...form, rate_per_kg: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Dispatch Qty (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 8000"
                    value={form.dispatch_qty_kg}
                    onChange={(e) => setForm({ ...form, dispatch_qty_kg: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Delivery Truck License</label>
                  <input 
                    type="text" 
                    placeholder="Dhaka Metro-1234"
                    value={form.truck_no}
                    onChange={(e) => setForm({ ...form, truck_no: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 font-mono">Contact / Shipping Info</label>
                <input 
                  type="text" 
                  placeholder="e.g. Engineer Zahir (+880-1700-112233)"
                  value={form.contact_info}
                  onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#B48F48] font-medium placeholder-slate-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-100  flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200  text-slate-650  text-xs font-bold rounded-xl hover:bg-slate-50 "
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-gradient-to-r from-[#B48F48] to-[#C5A059] hover:from-[#C5A059] hover:to-[#B48F48] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Save Dispatch Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Challan Modal overlay */}
      {activeChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 print:relative print:bg-white print:inset-auto print:z-auto print:flex-none">
          <div className="bg-white text-black p-8 rounded-2xl w-full max-w-2xl shadow-2xl space-y-6 border border-slate-200 print:border-none print:shadow-none print:p-0">
            
            {/* Action Bar (Hidden on print) */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 print:hidden">
              <span className="text-xs font-extrabold text-slate-500 uppercase font-mono">Print Delivery Challan Preview</span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setActiveChallan(null)}
                  className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button 
                  onClick={printChallan}
                  className="px-4 py-1.5 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Print Challan (PDF)
                </button>
              </div>
            </div>

            {/* Challan Invoice Sheet */}
            <div className="space-y-6 font-sans">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-[#B48F48]">ACME STEEL MILLS LTD.</h1>
                  <p className="text-[10px] text-slate-500">Melt Shop & Rolling Block, Tongi Industrial Area, Dhaka</p>
                  <p className="text-[9px] text-slate-400">Phone: +880-2-9912044 | email: logistics@acmesteel.com</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-black text-slate-900">DELIVERY CHALLAN</h2>
                  <p className="text-xs font-mono font-bold mt-1 text-slate-800">No: {activeChallan.challan_no}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Date: {activeChallan.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 p-3 rounded-lg">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Consignee/Customer Info</p>
                  <p className="font-extrabold text-slate-950 mt-1 text-sm">{activeChallan.customer_name}</p>
                  <p className="text-slate-500 mt-1">{activeChallan.contact_info}</p>
                </div>
                <div className="border border-slate-200 p-3 rounded-lg">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Logistics & Shipping Details</p>
                  <div className="mt-1 space-y-1 font-mono text-[11px]">
                    <p><strong>Truck License:</strong> {activeChallan.truck_no}</p>
                    <p><strong>Shipping Status:</strong> Approved / Gate Out</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-mono text-[10px] uppercase font-bold">
                    <th className="p-3 border-r border-slate-300">Item Description</th>
                    <th className="p-3 text-center border-r border-slate-300">Rod Size</th>
                    <th className="p-3 text-right border-r border-slate-300">Rate / kg</th>
                    <th className="p-3 text-right">Net Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 border-r border-slate-300 font-bold">Grade 60 Structural Steel Deformed Rebar</td>
                    <td className="p-3 text-center border-r border-slate-300 font-bold font-mono">{activeChallan.rod_size}</td>
                    <td className="p-3 text-right border-r border-slate-300 font-mono">৳{activeChallan.rate_per_kg}</td>
                    <td className="p-3 text-right font-mono font-bold text-base">{(activeChallan.dispatch_qty_kg).toLocaleString()} kg</td>
                  </tr>
                  <tr className="bg-slate-50 border-t border-slate-300 font-bold">
                    <td colSpan={3} className="p-3 text-right border-r border-slate-300 uppercase font-mono text-[10px]">Equivalent Metric Weight (MT)</td>
                    <td className="p-3 text-right font-mono text-base">{(activeChallan.dispatch_qty_kg / 1000).toFixed(3)} MT</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-12 grid grid-cols-3 gap-6 text-center text-[10px] font-bold">
                <div className="border-t border-slate-900 pt-1.5 text-slate-650">Weighbridge Clerk Sign</div>
                <div className="border-t border-slate-900 pt-1.5 text-slate-650">Security Gate Officer</div>
                <div className="border-t border-slate-900 pt-1.5 text-slate-650">Receiving Client Sign</div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
