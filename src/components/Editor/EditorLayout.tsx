import React, { useState } from 'react';
import { Project, AIChatMessage, ViewMode } from '../../types';
import { FileExplorer } from './FileExplorer';
import { CodeEditor } from './CodeEditor';
import { LivePreview } from './LivePreview';
import { AIAssistant } from './AIAssistant';
import { Sparkles, ArrowLeft, Download, Save, Eye, Code2, Bot, Layout, RefreshCw } from 'lucide-react';

interface Props {
  project: Project;
  messages: AIChatMessage[];
  loading: boolean;
  onNavigate: (view: ViewMode) => void;
  onUpdateFiles: (files: Project['files']) => void;
  onSaveProject: () => void;
  onDownloadZip: () => void;
  onSendAIPrompt: (prompt: string) => void;
  onRegenerateAI: () => void;
  onUndoAI: () => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const EditorLayout: React.FC<Props> = ({
  project,
  messages,
  loading,
  onNavigate,
  onUpdateFiles,
  onSaveProject,
  onDownloadZip,
  onSendAIPrompt,
  onRegenerateAI,
  onUndoAI,
  onToast,
}) => {
  const [activeFile, setActiveFile] = useState('index.html');
  const [mobileTab, setMobileTab] = useState<'preview' | 'code' | 'ai'>('preview');

  const handleFileContentChange = (filename: string, newContent: string) => {
    const updated = { ...project.files, [filename]: newContent };
    onUpdateFiles(updated);
  };

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col justify-between overflow-hidden text-slate-100 font-sans">
      {/* TOP APPLICATION BAR */}
      <header className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        {/* LEFT: BACK TO DASHBOARD & PROJECT TITLE */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white max-w-[160px] sm:max-w-[240px] truncate">
              {project.name}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden md:inline-block">
              {project.category || 'Website'}
            </span>
          </div>
        </div>

        {/* RIGHT: SAVE & DOWNLOAD ZIP ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveProject}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={onDownloadZip}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP</span>
          </button>
        </div>
      </header>

      {/* THREE PANEL MAIN WORKSPACE (DESKTOP) */}
      <div className="flex-1 hidden md:grid md:grid-cols-12 overflow-hidden">
        {/* LEFT PANEL: FILE EXPLORER + CODE EDITOR (COL SPAN 4) */}
        <div className="col-span-4 grid grid-cols-12 border-r border-slate-800/80">
          <div className="col-span-4 border-r border-slate-800/80 bg-slate-950">
            <FileExplorer
              files={project.files}
              selectedFile={activeFile}
              onSelectFile={(f) => setActiveFile(f)}
            />
          </div>
          <div className="col-span-8 bg-slate-950">
            <CodeEditor
              files={project.files}
              activeFile={activeFile}
              onFileContentChange={handleFileContentChange}
              onSaveProject={onSaveProject}
              onToast={onToast}
            />
          </div>
        </div>

        {/* CENTER PANEL: LIVE PREVIEW (COL SPAN 5) */}
        <div className="col-span-5 bg-slate-950">
          <LivePreview files={project.files} />
        </div>

        {/* RIGHT PANEL: AI ASSISTANT (COL SPAN 3) */}
        <div className="col-span-3 bg-slate-950">
          <AIAssistant
            messages={messages}
            loading={loading}
            onSendPrompt={onSendAIPrompt}
            onRegenerate={onRegenerateAI}
            onUndo={onUndoAI}
          />
        </div>
      </div>

      {/* MOBILE RESPONSIVE TABBED VIEW */}
      <div className="flex-1 md:hidden overflow-hidden relative">
        {mobileTab === 'preview' && <LivePreview files={project.files} />}
        {mobileTab === 'code' && (
          <div className="h-full flex flex-col">
            <div className="h-32 border-b border-slate-800">
              <FileExplorer
                files={project.files}
                selectedFile={activeFile}
                onSelectFile={(f) => setActiveFile(f)}
              />
            </div>
            <div className="flex-1">
              <CodeEditor
                files={project.files}
                activeFile={activeFile}
                onFileContentChange={handleFileContentChange}
                onSaveProject={onSaveProject}
                onToast={onToast}
              />
            </div>
          </div>
        )}
        {mobileTab === 'ai' && (
          <AIAssistant
            messages={messages}
            loading={loading}
            onSendPrompt={onSendAIPrompt}
            onRegenerate={onRegenerateAI}
            onUndo={onUndoAI}
          />
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION TAB BAR */}
      <div className="md:hidden h-14 bg-slate-900 border-t border-slate-800 flex items-center justify-around text-slate-400">
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            mobileTab === 'preview' ? 'text-indigo-400' : ''
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={() => setMobileTab('code')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            mobileTab === 'code' ? 'text-indigo-400' : ''
          }`}
        >
          <Code2 className="w-4 h-4" />
          Code
        </button>
        <button
          onClick={() => setMobileTab('ai')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            mobileTab === 'ai' ? 'text-indigo-400' : ''
          }`}
        >
          <Bot className="w-4 h-4" />
          AI Assistant
        </button>
      </div>
    </div>
  );
};
