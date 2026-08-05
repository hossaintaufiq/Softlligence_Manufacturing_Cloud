'use client';

import React, { useState, useEffect } from 'react';

export type FilterCondition = {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: string;
};

export type SavedPreset = {
  id: string;
  name: string;
  groupLogic: 'AND' | 'OR';
  conditions: FilterCondition[];
};

type AdvancedFilterBuilderProps = {
  availableFields: { key: string; label: string }[];
  onApplyFilters: (logic: 'AND' | 'OR', conditions: FilterCondition[]) => void;
  onClearFilters: () => void;
  presetCategory?: string;
};

export function AdvancedFilterBuilder({
  availableFields,
  onApplyFilters,
  onClearFilters,
  presetCategory = 'default',
}: AdvancedFilterBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [groupLogic, setGroupLogic] = useState<'AND' | 'OR'>('AND');
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [presets, setPresets] = useState<SavedPreset[]>([]);
  const [presetNameInput, setPresetNameInput] = useState('');

  useEffect(() => {
    const key = `smc_filter_presets_${presetCategory}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setPresets(JSON.parse(stored));
      } catch {}
    }
  }, [presetCategory]);

  const addCondition = () => {
    if (availableFields.length === 0) return;
    setConditions((prev) => [
      ...prev,
      {
        id: 'cond_' + Math.random().toString(36).substr(2, 9),
        field: availableFields[0].key,
        operator: 'contains',
        value: '',
      },
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, key: keyof FilterCondition, val: any) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: val } : c))
    );
  };

  const handleApply = () => {
    onApplyFilters(groupLogic, conditions);
  };

  const handleClear = () => {
    setConditions([]);
    onClearFilters();
  };

  const handleSavePreset = () => {
    if (!presetNameInput.trim() || conditions.length === 0) return;
    const newPreset: SavedPreset = {
      id: 'preset_' + Date.now(),
      name: presetNameInput.trim(),
      groupLogic,
      conditions,
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    localStorage.setItem(`smc_filter_presets_${presetCategory}`, JSON.stringify(updated));
    setPresetNameInput('');
  };

  const handleLoadPreset = (preset: SavedPreset) => {
    setGroupLogic(preset.groupLogic);
    setConditions(preset.conditions);
    onApplyFilters(preset.groupLogic, preset.conditions);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span>⚡ Multilevel Filter Builder</span>
          {conditions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono text-[10px]">
              {conditions.length} active rule{conditions.length > 1 ? 's' : ''} ({groupLogic})
            </span>
          )}
        </div>
        <span className="text-slate-400">{isOpen ? '▲ Collapse' : '▼ Expand'}</span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 border-t border-slate-200 dark:border-slate-800">
          {/* Presets Header */}
          {presets.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved Presets:</span>
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleLoadPreset(p)}
                  className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-[11px] font-medium transition-colors"
                >
                  ★ {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Logic Toggle */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Match rules using:</span>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5">
              <button
                onClick={() => setGroupLogic('AND')}
                className={`px-3 py-1 text-xs font-bold rounded ${
                  groupLogic === 'AND' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                AND (All Rules)
              </button>
              <button
                onClick={() => setGroupLogic('OR')}
                className={`px-3 py-1 text-xs font-bold rounded ${
                  groupLogic === 'OR' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                OR (Any Rule)
              </button>
            </div>
          </div>

          {/* Condition Rules List */}
          <div className="space-y-2">
            {conditions.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No filter rules added yet. Click "+ Add Rule" to start.</p>
            ) : (
              conditions.map((cond, idx) => (
                <div key={cond.id} className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <span className="text-[10px] font-mono text-slate-400 w-6">#{idx + 1}</span>

                  <select
                    value={cond.field}
                    onChange={(e) => updateCondition(cond.id, 'field', e.target.value)}
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {availableFields.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={cond.operator}
                    onChange={(e) => updateCondition(cond.id, 'operator', e.target.value as any)}
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="contains">contains</option>
                    <option value="equals">equals</option>
                    <option value="greater_than">greater than (&gt;)</option>
                    <option value="less_than">less than (&lt;)</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Enter value..."
                    value={cond.value}
                    onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-slate-800 dark:text-slate-200 flex-1 focus:outline-none"
                  />

                  <button
                    onClick={() => removeCondition(cond.id)}
                    className="text-rose-500 hover:text-rose-700 text-xs px-2 py-1"
                    title="Remove rule"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={addCondition}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              + Add Rule
            </button>

            <div className="flex items-center space-x-2">
              {conditions.length > 0 && (
                <div className="flex items-center space-x-1">
                  <input
                    type="text"
                    placeholder="Preset Name..."
                    value={presetNameInput}
                    onChange={(e) => setPresetNameInput(e.target.value)}
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200"
                  />
                  <button
                    onClick={handleSavePreset}
                    disabled={!presetNameInput.trim()}
                    className="px-2.5 py-1 text-xs font-medium bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-40"
                  >
                    Save View
                  </button>
                </div>
              )}

              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Reset
              </button>

              <button
                onClick={handleApply}
                className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
