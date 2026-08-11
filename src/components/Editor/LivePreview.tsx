import React, { useState, useEffect } from 'react';
import { ProjectFiles } from '../../types';
import { Laptop, Tablet, Smartphone, RefreshCw, Maximize2, ExternalLink } from 'lucide-react';

interface Props {
  files: ProjectFiles;
}

export const LivePreview: React.FC<Props> = ({ files }) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [key, setKey] = useState(0);

  const html = files['index.html'] || '<h1>No index.html file found</h1>';
  const css = files['style.css'] || '';
  const js = files['script.js'] || '';

  // Inject CSS and JS into HTML iframe srcDoc
  const compiledDoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${css}
  </style>
</head>
<body>
${html.replace(/<style>[\s\S]*?<\/style>/gi, '').replace(/<!DOCTYPE html>|<html[\s\S]*?>|<\/html>/gi, '')}
  <script>
    try {
      ${js}
    } catch(err) {
      console.error('JS Execution Error:', err);
    }
  </script>
</body>
</html>
  `;

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([compiledDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col justify-between overflow-hidden">
      {/* PREVIEW TOOLBAR */}
      <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-slate-400 text-xs">
        {/* DEVICE MODE SWITCHER */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-lg transition-colors ${
              device === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop View (100%)"
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded-lg transition-colors ${
              device === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-lg transition-colors ${
              device === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PREVIEW ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
            title="Refresh Preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={handleOpenNewTab}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
            title="Open in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Tab
          </button>
        </div>
      </div>

      {/* IFRAME CONTAINER */}
      <div className="flex-1 w-full bg-slate-900/50 flex items-center justify-center p-3 overflow-hidden">
        <div
          className={`h-full bg-white rounded-xl shadow-2xl border border-slate-800 overflow-hidden transition-all duration-300 ${
            device === 'mobile'
              ? 'w-[375px] max-h-[667px]'
              : device === 'tablet'
              ? 'w-[768px] max-h-[800px]'
              : 'w-full'
          }`}
        >
          <iframe
            key={key}
            title="Live Website Preview"
            srcDoc={compiledDoc}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-modals allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};
