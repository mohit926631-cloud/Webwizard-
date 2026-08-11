import React, { useState } from 'react';
import { Sparkles, Wand2, Layers, X, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  initialPrompt?: string;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  onExploreTemplates: () => void;
}

export const NewProjectModal: React.FC<Props> = ({
  isOpen,
  initialPrompt = '',
  onClose,
  onGenerate,
  onExploreTemplates,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  if (!isOpen) return null;

  const suggestedPrompts = [
    'Portfolio Website',
    'Gaming Website',
    'Business Website',
    'Restaurant Website',
    'School Website',
    'Landing Page',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate(prompt.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          VERVOX Website Generator
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          What do you want to build?
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mb-6">
          Describe your website idea in plain English. VERVOX AI will write the code, style, and structure for you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <textarea
              required
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Create a modern restaurant website with a beautiful hero section, menu cards, reservation section, testimonials and contact form."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
            />
          </div>

          {/* SUGGESTED PROMPTS PILLS */}
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2">Suggested Ideas:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((sPrompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(`Create a modern ${sPrompt.toLowerCase()} with hero, feature cards, and contact section.`)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                >
                  + {sPrompt}
                </button>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onExploreTemplates();
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              Start From Template
            </button>

            <button
              type="submit"
              disabled={!prompt.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              Generate Website
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
