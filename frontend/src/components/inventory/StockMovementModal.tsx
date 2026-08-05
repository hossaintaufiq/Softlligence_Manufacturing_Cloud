'use client';

import { useEffect, useState } from 'react';
import {
  fetchItems,
  fetchWarehouses,
  postStockAdjustmentApi,
  postStockTransferApi,
  type Item,
  type Warehouse,
} from '@/lib/api/inventory';

interface StockMovementModalProps {
  mode: 'transfer' | 'adjustment';
  onClose: () => void;
  onSuccess: () => void;
}

export function StockMovementModal({ mode, onClose, onSuccess }: StockMovementModalProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transfer state
  const [fromWhId, setFromWhId] = useState('');
  const [toWhId, setToWhId] = useState('');

  // Adjustment state
  const [whId, setWhId] = useState('');
  const [reasonCode, setReasonCode] = useState('AUDIT_DISCREPANCY');

  // Shared line state
  const [selectedItemId, setSelectedItemId] = useState('');
  const [qty, setQty] = useState<number>(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [whList, itemList] = await Promise.all([fetchWarehouses(), fetchItems()]);
        setWarehouses(whList);
        setItems(itemList);
        if (whList.length > 0) {
          setFromWhId(whList[0].id);
          setToWhId(whList.length > 1 ? whList[1].id : whList[0].id);
          setWhId(whList[0].id);
        }
        if (itemList.length > 0) {
          setSelectedItemId(itemList[0].id);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load form options');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    if (qty === 0) {
      setError('Quantity cannot be 0');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === 'transfer') {
        await postStockTransferApi({
          fromWarehouseId: fromWhId,
          toWarehouseId: toWhId,
          notes,
          lines: [{ itemId: selectedItem.id, uomId: selectedItem.uomId, qty }],
        });
      } else {
        await postStockAdjustmentApi({
          warehouseId: whId,
          reasonCode,
          notes,
          lines: [{ itemId: selectedItem.id, uomId: selectedItem.uomId, qty }],
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to execute stock movement');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            {mode === 'transfer' ? 'Transfer Stock Between Warehouses' : 'Stock Adjustment & Count Correction'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
            ✕
          </button>
        </div>

        {error && <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">{error}</div>}

        {loading ? (
          <div className="py-6 text-center text-slate-500 text-xs">Loading movement options...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'transfer' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">From Warehouse (Source)</label>
                  <select
                    value={fromWhId}
                    onChange={(e) => setFromWhId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-slate-900 focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">To Warehouse (Destination)</label>
                  <select
                    value={toWhId}
                    onChange={(e) => setToWhId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-slate-900 focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Warehouse</label>
                  <select
                    value={whId}
                    onChange={(e) => setWhId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-slate-900 focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Reason Code</label>
                  <select
                    value={reasonCode}
                    onChange={(e) => setReasonCode(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-slate-900 focus:outline-none"
                  >
                    <option value="AUDIT_DISCREPANCY">Audit / Physical Count</option>
                    <option value="INITIAL_LOAD">Initial Stock Loading</option>
                    <option value="DAMAGE_SCRAP">Damage / Scrap Write-Off</option>
                    <option value="CORRECTIVE_POSTING">Correction</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700">Select Item</label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-slate-900 focus:outline-none font-medium"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.code} — {i.name} ({i.uom?.code || i.uomId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700">
                Quantity {mode === 'adjustment' && '(Positive to add stock, negative to subtract)'}
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder={mode === 'transfer' ? 'e.g. 50.0' : 'e.g. +100 or -15'}
                value={qty || ''}
                onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Reference Notes</label>
              <input
                type="text"
                placeholder="e.g. Batch transfer for billet heating"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 px-4 py-1.5 text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-indigo-600 px-4 py-1.5 text-white hover:bg-indigo-700 font-medium disabled:opacity-50"
              >
                {submitting ? 'Posting...' : mode === 'transfer' ? 'Execute Transfer' : 'Post Adjustment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
