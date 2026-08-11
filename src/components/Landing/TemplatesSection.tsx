import React, { useState } from 'react';
import { TEMPLATES } from '../../services/templateData';
import { Template } from '../../types';
import { Layers, ArrowRight, Sparkles, Code2 } from 'lucide-react';

interface Props {
  onUseTemplate: (template: Template) => void;
}

export const TemplatesSection: React.FC<Props> = ({ onUseTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Portfolio', 'Business', 'Gaming', 'Education', 'Restaurant', 'Agency', 'E-commerce', 'Blog'];

  const filteredTemplates =
    selectedCategory === 'All'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id="templates" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            Starter Templates
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Start From Professionally Crafted Templates
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4">
            Select a template to instantly generate a working website project, or describe custom modifications to the AI.
          </p>

          {/* CATEGORY FILTER PILLS */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* TEMPLATE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                {/* PREVIEW HEADER GRADIENT BANNER */}
                <div
                  className={`h-40 w-full bg-gradient-to-tr ${template.previewGradient} p-4 flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-slate-950/80 text-white backdrop-blur-md border border-white/10">
                      {template.category}
                    </span>
                    <Sparkles className="w-4 h-4 text-white/80" />
                  </div>
                  <div className="relative z-10 font-mono text-xs font-bold text-white tracking-wider uppercase opacity-90 drop-shadow">
                    VERVOX PREVIEW
                  </div>
                </div>

                {/* TEMPLATE INFO */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4 min-h-[36px]">
                    {template.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {template.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => onUseTemplate(template)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-indigo-600/20"
                >
                  <Code2 className="w-4 h-4" />
                  Use Template
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
