'use client';
import React from 'react';
export default function CatalogPage() {
  const products = [
    { sku: 'SKU-APP-1001', category: 'Ready Apparel', name: 'Cotton Classic Polo', cost: 12.00, price: 24.99, stock: 450 },
    { sku: 'SKU-FOT-2004', category: 'Footwear & Boots', name: 'Premium Leather Loafers', cost: 45.00, price: 89.99, stock: 120 },
    { sku: 'SKU-TEX-5002', category: 'Home Textile Decors', name: 'Satin Cotton Bed Sheets', cost: 18.00, price: 34.99, stock: 280 }
  ];
  return (
    <div className="space-y-5 animate-fade-in text-slate-800">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Products Catalog & SKUs Board</h2>
        <p className="text-[11px] text-slate-500">Manage store catalog, cost structures, and item pricing sheets.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              <th className="p-3">SKU ID</th>
              <th className="p-3">Category</th>
              <th className="p-3">Product Title</th>
              <th className="p-3 text-right">Cost</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-center">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {products.map((prod, idx) => (
              <tr key={idx}>
                <td className="p-3 text-indigo-650 font-mono">{prod.sku}</td>
                <td className="p-3">{prod.category}</td>
                <td className="p-3">{prod.name}</td>
                <td className="p-3 text-right"></td>
                <td className="p-3 text-right text-emerald-600"></td>
                <td className="p-3 text-center">{prod.stock} Pcs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
