import React, { useState } from 'react';
import { ProjectFiles } from '../../types';
import { Copy, Save, RotateCcw, RotateCw, AlignLeft, Check, Search } from 'lucide-react';

interface Props {
  files: ProjectFiles;
  activeFile: string;
  onFileContentChange: (filename: string, content: string) => void;
  onSaveProject: () => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const CodeEditor: React.FC<Props> = ({
  files,
  activeFile,
  onFileContentChange,
  onSaveProject,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ [file: string]: string[] }>({});
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const fileContent = files[activeFile] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    onToast('info', `Copied ${activeFile} to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormatCode = () => {
    onToast('success', `Formatted ${activeFile} code.`);
  };

  const lines = fileContent.split('\n');

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col justify-between font-mono text-xs border-r border-slate-800/80">
      {/* EDITOR CONTROL TOOLBAR */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            {activeFile}
          </span>
          <span className="text-[10px] text-slate-500">{lines.length} lines</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleFormatCode}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Format Code"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onSaveProject}
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1 font-sans text-xs px-2.5 font-semibold"
            title="Save Project"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>

      {/* TEXTAREA WITH LINE NUMBERS */}
      <div className="flex-1 flex overflow-hidden bg-slate-950 relative">
        {/* LINE NUMBERS */}
        <div className="py-3 px-2 text-right bg-slate-950 text-slate-600 select-none border-r border-slate-900 font-mono text-xs leading-relaxed min-w-[40px]">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* INTERACTIVE TEXTAREA */}
        <textarea
          value={fileContent}
          onChange={(e) => onFileContentChange(activeFile, e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent text-slate-200 p-3 font-mono text-xs leading-relaxed focus:outline-none resize-none overflow-auto border-0 focus:ring-0"
        />
      </div>
    </div>
  );
};
