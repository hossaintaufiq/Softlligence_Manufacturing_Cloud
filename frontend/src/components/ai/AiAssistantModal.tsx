'use client';

import React, { useState, useEffect, useRef } from 'react';

export function AiAssistantModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your Softlligence Generative ERP Assistant. Ask me anything about heat yields, stock balances, OEE scores, or purchase orders.' },
  ]);
  const [loading, setLoading] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Click outside to close modal
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on ESC keypress
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

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
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, the AI Assistant query failed. Please verify network status.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error processing your query.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] transform transition-all duration-300 scale-100"
      >
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🤖</span>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider leading-tight">Generative ERP Assistant</h3>
              <p className="text-[10px] text-indigo-200 font-mono mt-0.5">SECTION 23 AI ENGINE ACTIVE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-3 rounded-xl shadow-2xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white font-semibold rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl rounded-tl-none animate-pulse font-mono text-[11px] flex items-center space-x-1.5 shadow-2xs">
                <span>🤖</span>
                <span>Thinking & querying database...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 shadow-inner">
          <input
            type="text"
            placeholder="Ask AI: e.g. What was yesterday's melt yield?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
