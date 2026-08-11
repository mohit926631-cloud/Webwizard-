import React, { useState, useRef } from 'react';
import { ProjectFiles } from '../../types';
import { FolderTree, FileCode, FileText, File, Plus, Trash2, Upload, FolderPlus, FileUp, Loader2 } from 'lucide-react';

interface Props {
  files: ProjectFiles;
  selectedFile: string;
  onSelectFile: (filename: string) => void;
  onAddFile?: (filename: string, content?: string) => void;
  onDeleteFile?: (filename: string) => void;
  onUploadFile?: (file: File) => void;
}

export const FileExplorer: React.FC<Props> = ({
  files,
  selectedFile,
  onSelectFile,
  onAddFile,
  onDeleteFile,
  onUploadFile,
}) => {
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileNames = Object.keys(files);

  const getFileBadge = (name: string) => {
    if (name.endsWith('.html')) return <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">HTML</span>;
    if (name.endsWith('.css')) return <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">CSS</span>;
    if (name.endsWith('.js')) return <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">JS</span>;
    if (name.endsWith('.md')) return <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">MD</span>;
    return <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">FILE</span>;
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const cleanName = newFileName.trim();
    if (onAddFile) {
      onAddFile(cleanName, `/* ${cleanName} created in VERVOX */\n`);
    }
    setNewFileName('');
    setShowNewFileModal(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setUploading(true);
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const text = await file.text();
      if (onAddFile) {
        onAddFile(file.name, text);
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const file = e.dataTransfer.files[i];
      const text = await file.text();
      if (onAddFile) {
        onAddFile(file.name, text);
      }
    }
    setUploading(false);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`w-full h-full bg-slate-950 p-3 font-mono text-xs flex flex-col justify-between text-slate-300 relative transition-all ${
        dragOver ? 'border-2 border-dashed border-indigo-500 bg-indigo-950/20' : ''
      }`}
    >
      <div>
        {/* HEADER TOOLBAR */}
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3 flex items-center justify-between px-2">
          <span className="flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
            PROJECT FILES
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              title="Upload File"
            >
              <FileUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowNewFileModal(true)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              title="New File"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
            />
          </div>
        </div>

        {uploading && (
          <div className="mb-2 p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            Uploading file(s)...
          </div>
        )}

        {/* FILES LIST */}
        <div className="space-y-1">
          {fileNames.map((fileName) => {
            const isSelected = selectedFile === fileName;
            const isProtected = ['index.html', 'style.css', 'script.js'].includes(fileName);

            return (
              <div
                key={fileName}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                    : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <button
                  onClick={() => onSelectFile(fileName)}
                  className="flex items-center gap-2 truncate flex-1 text-left"
                >
                  {fileName.endsWith('.md') ? (
                    <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  ) : (
                    <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  )}
                  <span className="truncate">{fileName}</span>
                </button>

                <div className="flex items-center gap-1">
                  {getFileBadge(fileName)}
                  {!isProtected && onDeleteFile && (
                    <button
                      onClick={() => onDeleteFile(fileName)}
                      className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete File"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NEW FILE MODAL */}
      {showNewFileModal && (
        <div className="absolute inset-x-2 top-12 z-20 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
          <form onSubmit={handleCreateFile} className="space-y-2">
            <div className="text-[11px] font-bold text-slate-300">Create New File</div>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. about.html, utils.js, custom.css"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewFileModal(false)}
                className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[11px]"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DRAG AND DROP FOOTER INSTRUCTION */}
      <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-500 text-center">
        💡 Drag & drop files here to upload
      </div>
    </div>
  );
};
