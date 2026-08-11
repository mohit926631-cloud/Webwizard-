import React from 'react';
import { ViewMode } from '../types';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

interface Props {
  onNavigate: (view: ViewMode) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* BRAND COLUMN */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-wider text-white font-mono">
                VERVOX
              </span>
            </div>
            <p className="text-slate-400 font-medium text-sm">
              Build. Create. Download.
            </p>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              Turn your natural language ideas into production-ready web applications. Preview live, edit with AI, and download as clean ZIP archives.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* PRODUCT LINKS */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('landing')} className="hover:text-slate-200 transition-colors">Features</button></li>
              <li><button onClick={() => onNavigate('templates')} className="hover:text-slate-200 transition-colors">Templates</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-slate-200 transition-colors">Pricing Plans</button></li>
              <li><button onClick={() => onNavigate('models')} className="hover:text-slate-200 transition-colors">AI Models</button></li>
            </ul>
          </div>

          {/* RESOURCES LINKS */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('faq')} className="hover:text-slate-200 transition-colors">FAQ</button></li>
              <li><a href="#documentation" className="hover:text-slate-200 transition-colors">Documentation</a></li>
              <li><a href="#api" className="hover:text-slate-200 transition-colors">Developer API</a></li>
              <li><a href="#showcase" className="hover:text-slate-200 transition-colors">Community Showcase</a></li>
            </ul>
          </div>

          {/* LEGAL & COMPANY */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-slate-200 transition-colors">Terms of Service</a></li>
              <li><a href="#contact" className="hover:text-slate-200 transition-colors">Contact Support</a></li>
              <li><a href="#security" className="hover:text-slate-200 transition-colors">Security Overview</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} VERVOX AI Technologies Inc. All rights reserved.</div>
          <div className="flex gap-6">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
