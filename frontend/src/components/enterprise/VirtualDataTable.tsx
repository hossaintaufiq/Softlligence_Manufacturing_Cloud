'use client';

import React, { useState, useMemo } from 'react';

export type ColumnDef<T> = {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  mono?: boolean; // Uses JetBrains Mono font for numbers / codes
};

type VirtualDataTableProps<T extends Record<string, any>> = {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onRowClick?: (row: T) => void;
  exportFileName?: string;
  keyExtractor?: (row: T, index: number) => string;
};

export function VirtualDataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  subtitle,
  actions,
  onRowClick,
  exportFileName = 'data_export',
  keyExtractor,
}: VirtualDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'cozy'>('comfortable');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map((c) => c.key));
  const [showColMenu, setShowColMenu] = useState(false);

  // Search & Sorting Filter
  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDir === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return result;
  }, [data, searchTerm, sortKey, sortDir]);

  // Virtual Window Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (sortable === false) return;
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const activeCols = columns.filter((c) => visibleColumns.includes(c.key));
    const headerRow = activeCols.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(',');
    const bodyRows = filteredData.map((row) =>
      activeCols
        .map((c) => {
          const val = row[c.key];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headerRow, ...bodyRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const densityClass =
    density === 'compact' ? 'table-compact' : density === 'cozy' ? 'table-cozy' : 'table-comfortable';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40">
        <div>
          {title && <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search table..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-48 sm:w-64 pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Density Selector */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5">
            <button
              onClick={() => setDensity('compact')}
              title="Compact View"
              className={`px-2 py-1 text-[11px] font-semibold rounded ${
                density === 'compact' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Compact
            </button>
            <button
              onClick={() => setDensity('comfortable')}
              title="Comfortable View"
              className={`px-2 py-1 text-[11px] font-semibold rounded ${
                density === 'comfortable' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Comfortable
            </button>
            <button
              onClick={() => setDensity('cozy')}
              title="Cozy View"
              className={`px-2 py-1 text-[11px] font-semibold rounded ${
                density === 'cozy' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Cozy
            </button>
          </div>

          {/* Column Toggle Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColMenu(!showColMenu)}
              className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-1"
            >
              <span>Columns</span>
              <span className="text-[10px]">▼</span>
            </button>
            {showColMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2 z-30 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Toggle Columns</p>
                {columns.map((c) => (
                  <label key={c.key} className="flex items-center space-x-2 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs cursor-pointer text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(c.key)}
                      onChange={(e) => {
                        if (e.target.checked) setVisibleColumns([...visibleColumns, c.key]);
                        else setVisibleColumns(visibleColumns.filter((k) => k !== c.key));
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{c.header}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center space-x-1"
          >
            <span>↓ Export CSV</span>
          </button>

          {actions}
        </div>
      </div>

      {/* Table Window Container */}
      <div className="overflow-x-auto overflow-y-auto max-h-[550px]">
        <table className={`w-full text-left border-collapse ${densityClass}`}>
          <thead className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-xs sticky top-0 z-10 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200 dark:border-slate-700">
            <tr>
              {columns
                .filter((c) => visibleColumns.includes(c.key))
                .map((col) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      onClick={() => handleSort(col.key, col.sortable)}
                      className={`px-4 py-3 cursor-pointer select-none transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{col.header}</span>
                        {col.sortable !== false && (
                          <span className="text-[10px] text-slate-400">
                            {isSorted ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-xs text-slate-400">
                  No records found matching current query.
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => {
                const key = keyExtractor ? keyExtractor(row, idx) : row.id || `row_${idx}`;
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {columns
                      .filter((c) => visibleColumns.includes(c.key))
                      .map((col) => {
                        const rawVal = row[col.key];
                        const content = col.accessor ? col.accessor(row) : String(rawVal ?? '-');
                        return (
                          <td
                            key={col.key}
                            className={`px-4 ${
                              col.mono ? 'font-mono text-slate-900 dark:text-slate-100 font-medium' : ''
                            } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                          >
                            {content}
                          </td>
                        );
                      })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center space-x-2">
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-slate-900 dark:text-slate-100">{Math.min(currentPage * pageSize, filteredData.length)}</strong> of{' '}
            <strong className="text-slate-900 dark:text-slate-100">{filteredData.length}</strong> entries
          </span>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold"
          >
            « First
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold"
          >
            ‹ Prev
          </button>
          <span className="px-3 py-1 font-mono text-xs">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold"
          >
            Next ›
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold"
          >
            Last »
          </button>
        </div>
      </div>
    </div>
  );
}
