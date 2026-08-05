'use client';

import { useEffect, useState } from 'react';
import {
  createCustomFieldApi,
  deleteCustomFieldApi,
  fetchCustomFields,
  type CustomFieldItem,
} from '../../lib/api/customFields.js';

export function CustomFieldManagerPanel() {
  const [fields, setFields] = useState<CustomFieldItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [entityType, setEntityType] = useState('factory');
  const [fieldKey, setFieldKey] = useState('');
  const [label, setLabel] = useState('');
  const [dataType, setDataType] = useState('string');
  const [isRequired, setIsRequired] = useState(false);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomFields();
      setFields(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load custom fields');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createCustomFieldApi({
        entityType,
        fieldKey,
        label,
        dataType,
        isRequired,
      });
      setFieldKey('');
      setLabel('');
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create custom field');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this custom field definition?')) return;
    try {
      await deleteCustomFieldApi(id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete custom field');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Custom Metadata Fields (ADR-0011)</h2>
        <p className="text-sm text-slate-500">Define tenant-scoped custom field attributes for system entities.</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
      )}

      {/* Definition Form */}
      <form onSubmit={handleCreate} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Add New Field Definition</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Target Entity</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="factory">Factory</option>
              <option value="company">Company</option>
              <option value="item">Inventory Item</option>
              <option value="work_order">Work Order</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Field Key</label>
            <input
              type="text"
              required
              placeholder="e.g. shift_capacity"
              value={fieldKey}
              onChange={(e) => setFieldKey(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Label</label>
            <input
              type="text"
              required
              placeholder="e.g. Shift Capacity (MT)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Data Type</label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="string">Text (String)</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean (True/False)</option>
              <option value="select">Dropdown Select</option>
              <option value="date">Date</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? 'Adding...' : 'Add Field'}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="isRequired"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="isRequired" className="text-xs text-slate-700">
            Required field during record creation
          </label>
        </div>
      </form>

      {/* Field Definitions Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
            <tr>
              <th className="px-4 py-2.5">Entity</th>
              <th className="px-4 py-2.5">Field Key</th>
              <th className="px-4 py-2.5">Label</th>
              <th className="px-4 py-2.5">Data Type</th>
              <th className="px-4 py-2.5">Required</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Loading definitions...
                </td>
              </tr>
            ) : fields.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No custom field definitions created for this tenant yet.
                </td>
              </tr>
            ) : (
              fields.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-indigo-700 capitalize">{f.entityType}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">{f.fieldKey}</td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{f.label}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">{f.dataType}</td>
                  <td className="px-4 py-2.5">
                    {f.isRequired ? (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        Yes
                      </span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
