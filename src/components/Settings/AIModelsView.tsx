import React, { useState } from 'react';
import { Cpu, Sparkles, Zap, ShieldCheck, Check } from 'lucide-react';

export const AIModelsView: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  const models = [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      tag: 'RECOMMENDED',
      speed: 'Ultra Fast (0.8s)',
      description: 'Optimized for real-time web code generation, fast UI iterations, and multi-file code editing.',
      features: ['2M Token Context Window', 'Multi-File Code Synthesis', 'Real-time Edit Processing'],
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      tag: 'STABLE',
      speed: 'Fast (1.2s)',
      description: 'High performance baseline model for standard web layout and template scaffolding.',
      features: ['1M Token Context', 'High Accuracy Code Synthesis', 'Standard Generation Queue'],
    },
    {
      id: 'vervox-demo-engine',
      tag: 'DEMO ENGINE',
      name: 'VERVOX Demo AI Engine',
      speed: 'Instant (0.1s)',
      description: 'Offline fallback generator delivering deterministic website templates without requiring external API keys.',
      features: ['No API Key Required', '100% Offline Capability', '8+ Domain Templates'],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-100 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Cpu className="w-7 h-7 text-indigo-400" />
          AI Models Configuration
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Select and inspect the AI models powering VERVOX website generation and editing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((m) => {
          const isSelected = selectedModel === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedModel(m.id)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    {m.tag}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{m.name}</h3>
                <div className="text-[11px] text-indigo-400 font-mono mb-3">{m.speed}</div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{m.description}</p>

                <div className="space-y-2 pt-4 border-t border-slate-800/80 text-[11px] text-slate-300">
                  {m.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className={`w-full mt-6 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isSelected ? 'Active Model' : 'Select Model'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
