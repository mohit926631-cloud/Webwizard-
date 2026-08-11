import React, { useState } from 'react';
import { Laptop, Tablet, Smartphone, Sparkles, FolderTree, Code2, Eye, Download, Play, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface Props {
  onStartBuilding: (prompt?: string) => void;
}

export const HeroProductDemo: React.FC<Props> = ({ onStartBuilding }) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [selectedFile, setSelectedFile] = useState('index.html');
  const [promptText, setPromptText] = useState('Build a modern portfolio website for a creative developer.');

  const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Alex Rivera — Creative Engineer</title>
  <style>
    body { background: #0b0f19; color: white; font-family: system-ui; padding: 2rem; margin: 0; }
    .badge { background: rgba(59,130,246,0.2); color: #60a5fa; padding: 4px 12px; border-radius: 99px; font-size: 12px; }
    h1 { font-size: 28px; font-weight: 800; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 1rem; }
    .card { background: rgba(30,41,59,0.6); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <span class="badge">✨ VERVOX AI GENERATED</span>
  <h1>Alex Rivera — Full-Stack Engineer</h1>
  <p style="color: #94a3b8; font-size: 14px;">Building modern web applications with React, TypeScript & AI.</p>
  <div class="grid">
    <div class="card">
      <div style="font-size: 11px; color: #3b82f6; font-weight: 700;">AI PLATFORM</div>
      <h3 style="font-size: 15px; margin: 4px 0;">SynthWave Engine</h3>
      <p style="font-size: 12px; color: #94a3b8;">Real-time speech & WebAudio canvas.</p>
    </div>
    <div class="card">
      <div style="font-size: 11px; color: #3b82f6; font-weight: 700;">FINTECH</div>
      <h3 style="font-size: 15px; margin: 4px 0;">Orbit Dashboard</h3>
      <p style="font-size: 12px; color: #94a3b8;">Institutional trading interface.</p>
    </div>
  </div>
</body>
</html>`;

  return (
    <div className="w-full max-w-6xl mx-auto my-12 rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl shadow-indigo-500/10 overflow-hidden backdrop-blur-xl">
      {/* TOP WINDOW CONTROL BAR */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="ml-3 font-mono text-[11px] text-slate-400 hidden sm:inline-block">
            vervox-builder / portfolio-project
          </span>
        </div>

        {/* DEVICE PREVIEW TOGGLES */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-lg transition-colors ${device === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Desktop view"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded-lg transition-colors ${device === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Tablet view"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-lg transition-colors ${device === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Mobile view"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* VIEW MODE TABS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
              activeTab === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
              activeTab === 'code' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
          <button
            onClick={() => onStartBuilding(promptText)}
            className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 font-semibold text-xs flex items-center gap-1 shadow-md shadow-indigo-600/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Try Interactive
          </button>
        </div>
      </div>

      {/* MOCKUP CONTENT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px] bg-slate-950">
        {/* LEFT SIDEBAR — PROJECT FILES */}
        <div className="lg:col-span-2 border-r border-slate-800/80 p-3 bg-slate-900/40 text-xs hidden sm:block">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
            FILES
          </div>
          <div className="space-y-1 font-mono text-slate-300">
            <button
              onClick={() => setSelectedFile('index.html')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
                selectedFile === 'index.html' ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'hover:bg-slate-800/50'
              }`}
            >
              <span className="text-amber-400 text-[10px]">HTML</span>
              index.html
            </button>
            <button
              onClick={() => setSelectedFile('style.css')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
                selectedFile === 'style.css' ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'hover:bg-slate-800/50'
              }`}
            >
              <span className="text-blue-400 text-[10px]">CSS</span>
              style.css
            </button>
            <button
              onClick={() => setSelectedFile('script.js')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 ${
                selectedFile === 'script.js' ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'hover:bg-slate-800/50'
              }`}
            >
              <span className="text-yellow-400 text-[10px]">JS</span>
              script.js
            </button>
          </div>
        </div>

        {/* CENTER — LIVE PREVIEW / CODE VIEW */}
        <div className="lg:col-span-7 border-r border-slate-800/80 p-4 flex flex-col justify-between bg-slate-950">
          {activeTab === 'preview' ? (
            <div className="w-full h-full flex items-center justify-center p-2">
              <div
                className={`transition-all duration-300 h-[380px] w-full rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-inner ${
                  device === 'mobile' ? 'max-w-[320px]' : device === 'tablet' ? 'max-w-[540px]' : 'w-full'
                }`}
              >
                <iframe
                  title="Demo Preview"
                  srcDoc={sampleHtml}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          ) : (
            <div className="h-[380px] w-full rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-300 overflow-auto border border-slate-800">
              <pre className="text-indigo-200">{sampleHtml}</pre>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — AI ASSISTANT CHAT */}
        <div className="lg:col-span-3 p-4 bg-slate-900/30 flex flex-col justify-between text-xs">
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-200 border-b border-slate-800 pb-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              VERVOX AI Assistant
            </div>

            <div className="space-y-3">
              <div className="bg-indigo-950/40 border border-indigo-500/20 p-2.5 rounded-xl text-indigo-200 leading-relaxed">
                <span className="font-bold text-indigo-300 block mb-1">Sample Prompt:</span>
                “{promptText}”
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-200">Website Generated</p>
                  <p className="text-[11px] text-slate-400">Created index.html, style.css & script.js with dark developer aesthetic.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="relative">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Ask AI to edit..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-3 pr-8 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => onStartBuilding(promptText)}
                className="absolute right-1.5 top-1.5 p-1 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500"
                title="Send Prompt"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
