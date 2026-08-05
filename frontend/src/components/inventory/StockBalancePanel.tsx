'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchStockBalances, fetchWarehouses, type StockBalance, type Warehouse } from '@/lib/api/inventory';
import { VirtualDataTable, type ColumnDef } from '@/components/enterprise/VirtualDataTable';
import { AdvancedFilterBuilder, type FilterCondition } from '@/components/enterprise/AdvancedFilterBuilder';

export function StockBalancePanel() {
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWh, setSelectedWh] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilters, setActiveFilters] = useState<{ logic: 'AND' | 'OR'; conditions: FilterCondition[] }>({
    logic: 'AND',
    conditions: [],
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [balList, whList] = await Promise.all([
        fetchStockBalances(selectedWh === 'all' ? undefined : selectedWh),
        fetchWarehouses(),
      ]);
      setBalances(balList);
      setWarehouses(whList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load stock balances');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [selectedWh]);

  // Apply Multilevel Advanced Filter Logic
  const filteredBalances = useMemo(() => {
    if (activeFilters.conditions.length === 0) return balances;

    return balances.filter((b) => {
      const evaluateCondition = (cond: FilterCondition) => {
        let fieldVal = '';
        if (cond.field === 'warehouse') fieldVal = b.warehouse?.name || b.warehouseId || '';
        else if (cond.field === 'itemCode') fieldVal = b.item?.code || b.itemId || '';
        else if (cond.field === 'itemName') fieldVal = b.item?.name || '';
        else if (cond.field === 'qtyOnHand') fieldVal = String(b.qtyOnHand);
        else if (cond.field === 'uom') fieldVal = b.item?.uom?.code || '';

        const targetVal = cond.value.toLowerCase();
        const strVal = String(fieldVal).toLowerCase();

        if (cond.operator === 'contains') return strVal.includes(targetVal);
        if (cond.operator === 'equals') return strVal === targetVal;
        if (cond.operator === 'greater_than') return Number(fieldVal) > Number(cond.value);
        if (cond.operator === 'less_than') return Number(fieldVal) < Number(cond.value);
        return true;
      };

      if (activeFilters.logic === 'AND') {
        return activeFilters.conditions.every(evaluateCondition);
      } else {
        return activeFilters.conditions.some(evaluateCondition);
      }
    });
  }, [balances, activeFilters]);

  const totalItemsWithStock = balances.filter((b) => b.qtyOnHand > 0).length;

  const tableColumns: ColumnDef<StockBalance>[] = [
    {
      key: 'warehouse',
      header: 'Warehouse',
      accessor: (b) => <span className="font-semibold">{b.warehouse?.name || b.warehouseId}</span>,
      sortable: true,
    },
    {
      key: 'itemCode',
      header: 'Item Code',
      accessor: (b) => <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{b.item?.code || b.itemId}</span>,
      sortable: true,
      mono: true,
    },
    {
      key: 'itemName',
      header: 'Item Name',
      accessor: (b) => <span>{b.item?.name || '—'}</span>,
      sortable: true,
    },
    {
      key: 'qtyOnHand',
      header: 'Qty On-Hand',
      accessor: (b) => (
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
          {b.qtyOnHand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
      sortable: true,
      align: 'right',
      mono: true,
    },
    {
      key: 'uom',
      header: 'UOM',
      accessor: (b) => <span className="font-mono text-slate-500">{b.item?.uom?.code || '—'}</span>,
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (b) =>
        b.qtyOnHand > 0 ? (
          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            In Stock
          </span>
        ) : (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            Zero Stock
          </span>
        ),
      sortable: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Live On-Hand Stock Balances</h2>
          <p className="text-xs text-slate-500">Section 12 high-density virtualized inventory levels across locations.</p>
        </div>

        {/* Warehouse Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-700">Warehouse Scope:</label>
          <select
            value={selectedWh}
            onChange={(e) => setSelectedWh(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none shadow-xs font-medium"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
          <button
            onClick={load}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">{error}</div>}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 border-l-4 border-l-indigo-600 bg-white p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Warehouses</span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{warehouses.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-600 bg-white p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SKUs with Positive Stock</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{totalItemsWithStock}</p>
        </div>

        <div className="rounded-xl border border-slate-200 border-l-4 border-l-amber-600 bg-white p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tracked Balances</span>
          <p className="text-2xl font-bold text-amber-600 mt-1 font-mono">{balances.length}</p>
        </div>
      </div>

      {/* Advanced Filter Builder Component */}
      <AdvancedFilterBuilder
        presetCategory="stock_balances"
        availableFields={[
          { key: 'itemCode', label: 'Item Code' },
          { key: 'itemName', label: 'Item Name' },
          { key: 'warehouse', label: 'Warehouse Name' },
          { key: 'qtyOnHand', label: 'Qty On-Hand' },
          { key: 'uom', label: 'Unit of Measure' },
        ]}
        onApplyFilters={(logic, conditions) => setActiveFilters({ logic, conditions })}
        onClearFilters={() => setActiveFilters({ logic: 'AND', conditions: [] })}
      />

      {/* Virtualized Data Table Component */}
      <VirtualDataTable
        title="Physical Inventory Ledger Balances"
        subtitle={`Showing ${filteredBalances.length} records (${activeFilters.conditions.length} active filter rules)`}
        data={filteredBalances}
        columns={tableColumns}
        exportFileName="stock_balances"
      />
    </div>
  );
}

