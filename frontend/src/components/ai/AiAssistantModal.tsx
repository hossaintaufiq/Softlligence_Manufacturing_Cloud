'use client';

import React, { useState } from 'react';

export function AiAssistantModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your Softlligence Generative ERP Assistant. Ask me anything about heat yields, stock balances, OEE scores, or purchase orders.' },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userText = prompt;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prompt: userText }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.response }]);
      }
    } catch {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error processing your query.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">🤖</span>
            <div>
              <h3 className="text-sm font-bold leading-tight">Softlligence Generative ERP Assistant</h3>
              <p className="text-[10px] text-indigo-100 font-mono">SECTION 23 AI ENGINE ACTIVE</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/20 text-white font-bold text-xs">✕</button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-3 rounded-xl ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-br-xs'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl animate-pulse font-mono text-[11px]">
                🤖 Thinking & querying ERP database...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask AI: e.g. What was yesterday's melt yield?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
