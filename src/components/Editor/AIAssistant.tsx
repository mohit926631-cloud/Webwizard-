import React, { useState } from 'react';
import { AIChatMessage, ProjectFiles } from '../../types';
import { Sparkles, Send, Wand2, RefreshCw, Undo2, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  messages: AIChatMessage[];
  loading: boolean;
  onSendPrompt: (prompt: string) => void;
  onRegenerate: () => void;
  onUndo: () => void;
}

export const AIAssistant: React.FC<Props> = ({
  messages,
  loading,
  onSendPrompt,
  onRegenerate,
  onUndo,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');

  const samplePresets = [
    'Make the hero section more modern',
    'Change color theme to purple gradient',
    'Add a testimonials section',
    'Add a contact form',
    'Make it mobile friendly',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || loading) return;
    onSendPrompt(inputPrompt.trim());
    setInputPrompt('');
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col justify-between border-l border-slate-800/80 text-xs">
      {/* HEADER */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          VERVOX AI Assistant
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRegenerate}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Regenerate last response"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onUndo}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Undo last AI changes"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CHAT MESSAGES CONTAINER */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
              {msg.role === 'user' ? 'You' : 'VERVOX AI'} • {msg.timestamp}
            </div>
            <div
              className={`p-3 rounded-2xl max-w-[90%] text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
              }`}
            >
              {msg.content}

              {msg.role === 'assistant' && msg.fileChangesSummary && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {msg.fileChangesSummary}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-indigo-300">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>VERVOX AI is modifying project files...</span>
          </div>
        )}
      </div>

      {/* QUICK PRESET SUGGESTIONS */}
      <div className="px-3 pt-2 pb-1 border-t border-slate-900 bg-slate-950">
        <div className="text-[10px] font-semibold text-slate-500 mb-1.5">Quick Edit Prompts:</div>
        <div className="flex flex-wrap gap-1">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSendPrompt(preset);
              }}
              disabled={loading}
              className="text-[10px] px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>

      {/* INPUT FORM */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={loading}
            placeholder="Tell VERVOX what to edit or add..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
