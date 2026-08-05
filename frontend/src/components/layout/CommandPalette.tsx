'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';

type CommandItem = {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Reports' | 'Developer';
  path?: string;
  action?: () => void;
  shortcut?: string;
};

export function CommandPalette() {
  const { isCmdPaletteOpen, setIsCmdPaletteOpen, toggleOperatorMode, isPlatformAdmin } = useWorkspace();
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen(!isCmdPaletteOpen);
      }
      if (e.key === 'Escape' && isCmdPaletteOpen) {
        setIsCmdPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCmdPaletteOpen, setIsCmdPaletteOpen]);

  if (!isCmdPaletteOpen) return null;

  const allCommands: CommandItem[] = [
    { id: '1', title: 'Go to Steel Vertical Portal', category: 'Navigation', path: '/steel', shortcut: 'G S' },
    { id: '2', title: 'Go to Manufacturing Core', category: 'Navigation', path: '/manufacturing', shortcut: 'G M' },
    { id: '3', title: 'Go to Commercial Operations', category: 'Navigation', path: '/commercial', shortcut: 'G C' },
    { id: '4', title: 'Go to Inventory Master', category: 'Navigation', path: '/inventory', shortcut: 'G I' },
    { id: '5', title: 'Go to IAM User & Roles', category: 'Navigation', path: '/iam' },
    ...(isPlatformAdmin ? [{ id: '6', title: 'Go to Super Admin Console', category: 'Navigation' as const, path: '/admin' }] : []),
    { id: '7', title: 'Toggle Factory Operator Touch HMI Mode', category: 'Actions', action: toggleOperatorMode },
    { id: '8', title: '[Dev Mode] API Endpoint: /api/v1/steel/kpis', category: 'Developer', action: () => window.open('/api/v1/steel/kpis', '_blank') },
    { id: '9', title: '[Dev Mode] API Endpoint: /api/v1/commercial/kpis', category: 'Developer', action: () => window.open('/api/v1/commercial/kpis', '_blank') },
    { id: '10', title: '[Dev Mode] API Endpoint: /api/v1/search', category: 'Developer', action: () => window.open('/api/v1/search?q=heat', '_blank') },
  ];

  const filtered = allCommands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: CommandItem) => {
    setIsCmdPaletteOpen(false);
    setQuery('');
    if (item.path) {
      router.push(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden space-y-2">
        <div className="p-3 border-b border-slate-200 flex items-center space-x-3 bg-slate-50/50">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Type a command or search... (e.g. Steel, Operator, /api)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-xs text-slate-400 bg-white border border-slate-200 rounded font-mono shadow-2xs">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <p className="p-4 text-xs text-center text-slate-400">No commands found matching "{query}"</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs px-2 py-0.5 rounded font-mono uppercase bg-slate-100 text-slate-600 border border-slate-200">
                    {item.category}
                  </span>
                  <span className="font-medium text-slate-800 group-hover:text-indigo-600">
                    {item.title}
                  </span>
                </div>
                {item.shortcut && (
                  <kbd className="text-xs font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    {item.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>ProTip: Press <kbd className="font-mono text-slate-700 font-semibold">⌘K</kbd> anywhere to open</span>
          <span className="font-mono text-indigo-600 font-semibold">Section 14 Search Engine Active</span>
        </div>
      </div>
    </div>
  );
}
