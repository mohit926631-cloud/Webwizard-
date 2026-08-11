import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is VERVOX and how does it create websites?',
      a: 'VERVOX is an AI-powered website builder. You describe your idea in natural language, and VERVOX generates a complete multi-file web project (HTML, CSS, JavaScript) that you can preview live, customize with AI, and download as a ZIP file.',
    },
    {
      q: 'Can I download my website code as a ZIP file?',
      a: 'Yes! Every project created on VERVOX can be downloaded instantly with a single click as a ZIP file. The ZIP contains all index.html, style.css, script.js, asset files, and a README explaining how to run the site locally or deploy it to any hosting provider.',
    },
    {
      q: 'What if no paid AI API key is configured?',
      a: 'VERVOX features an automatic Demo Mode system. If no Gemini API key is configured, VERVOX Demo Engine kicks in and generates functional website prototypes based on smart keyword templates, allowing full prompt-to-download testing without paid API keys.',
    },
    {
      q: 'Can I connect my own Gemini API Key (BYOK)?',
      a: 'Yes! VERVOX supports Developer Mode / Bring Your Own Key (BYOK). You can input your Gemini API Key in Settings to unlock unlimited custom AI model generations while keeping your credentials private.',
    },
    {
      q: 'Are generated websites responsive and mobile friendly?',
      a: 'Absoloutely. Every website template and AI generation output is engineered with responsive modern CSS and mobile-first media queries to look sleek across Desktop, Tablet, and Mobile screens.',
    },
    {
      q: 'Do I need coding experience to use VERVOX?',
      a: 'Not at all! VERVOX allows full website customization through natural language AI chat. If you do know code, VERVOX includes a full code editor with syntax highlighting so you can edit the HTML/CSS/JS directly.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            Questions & Answers
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4">
            Everything you need to know about VERVOX AI Website Builder.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-bold text-white text-base sm:text-lg flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-slate-300 text-sm leading-relaxed border-t border-slate-800/50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
