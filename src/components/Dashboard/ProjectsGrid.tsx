import React, { useState, useRef } from 'react';
import { Project, User, ProjectVersion, GenerationLog } from '../../types';
import { FolderGit2, Plus, ExternalLink, Download, Copy, Trash2, Edit2, Sparkles, FolderPlus, Clock, Zap, CreditCard, FileUp, History, CheckCircle2, ShieldCheck } from 'lucide-react';
import { apiService } from '../../services/api';
import JSZip from 'jszip';

interface Props {
  user: User;
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onRenameProject: (project: Project, newName: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDownloadZip: (project: Project) => void;
  onCreateNewProject: () => void;
  onUpgrade: () => void;
  onImportProject?: (name: string, files: Record<string, string>) => void;
  onToast?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ProjectsGrid: React.FC<Props> = ({
  user,
  projects,
  onOpenProject,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  onDownloadZip,
  onCreateNewProject,
  onUpgrade,
  onImportProject,
  onToast,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [historyModalProject, setHistoryModalProject] = useState<Project | null>(null);
  const [projectVersions, setProjectVersions] = useState<ProjectVersion[]>([]);
  const [projectLogs, setProjectLogs] = useState<GenerationLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const zipInputRef = useRef<HTMLInputElement>(null);
  const monthlyCredits = user?.usage?.monthlyCredits ?? (user as any)?.monthlyCredits ?? 0;
  const purchasedCredits = user?.usage?.purchasedCredits ?? (user as any)?.purchasedCredits ?? 0;
  const maxMonthlyCredits = user?.usage?.maxMonthlyCredits ?? 200;
  const maxProjects = user?.usage?.maxProjects ?? 10;
  const totalCredits = monthlyCredits + purchasedCredits;

  const handleStartRename = (project: Project) => {
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const handleSaveRename = (project: Project) => {
    if (editingName.trim()) {
      onRenameProject(project, editingName.trim());
    }
    setEditingId(null);
  };

  const handleZipImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const zip = new JSZip();
      const unzipped = await zip.loadAsync(file);
      const importedFiles: Record<string, string> = {};

      for (const relativePath of Object.keys(unzipped.files)) {
        const entry = unzipped.files[relativePath];
        if (!entry.dir) {
          const content = await entry.async('string');
          const cleanName = relativePath.split('/').pop() || relativePath;
          importedFiles[cleanName] = content;
        }
      }

      if (Object.keys(importedFiles).length === 0) {
        throw new Error('No files found inside ZIP file.');
      }

      const projName = file.name.replace(/\.zip$/i, '') || 'Imported Project';
      if (onImportProject) {
        onImportProject(projName, importedFiles);
      }
      if (onToast) onToast('success', `Imported ${Object.keys(importedFiles).length} files from ${file.name}`);
    } catch (err: any) {
      if (onToast) onToast('error', `Failed to import ZIP: ${err.message || 'Corrupted file'}`);
    }
    if (zipInputRef.current) zipInputRef.current.value = '';
  };

  const handleOpenHistoryModal = async (project: Project) => {
    setHistoryModalProject(project);
    setLoadingHistory(true);
    try {
      const [vers, logs] = await Promise.all([
        apiService.getProjectVersions(project.id),
        apiService.getProjectLogs(project.id),
      ]);
      setProjectVersions(vers);
      setProjectLogs(logs);
    } catch {
      // fallback
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!historyModalProject) return;
    try {
      const restored = await apiService.restoreProjectVersion(historyModalProject.id, versionId);
      if (onToast) onToast('success', `Restored ${restored.name} to version successfully!`);
      setHistoryModalProject(null);
      onOpenProject(restored);
    } catch (err: any) {
      if (onToast) onToast('error', `Restore failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER WELCOME & ACTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user.name} 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {user.plan} Plan
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Manage your AI generated web projects, customize designs, inspect project history, and download ZIP archives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-auto">
          <button
            onClick={() => zipInputRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-2"
            title="Import ZIP Project"
          >
            <FileUp className="w-4 h-4 text-emerald-400" />
            Import ZIP
          </button>
          <input
            type="file"
            ref={zipInputRef}
            onChange={handleZipImport}
            accept=".zip"
            className="hidden"
          />

          <button
            onClick={onUpgrade}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 font-semibold text-xs transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-indigo-400" />
            Buy Credits
          </button>
          <button
            onClick={onCreateNewProject}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Project
          </button>
        </div>
      </div>

      {/* USAGE METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* MONTHLY CREDITS BALANCE */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Monthly Credits
            </span>
            <span className="font-bold text-amber-400">
              {monthlyCredits} / {maxMonthlyCredits}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (monthlyCredits / maxMonthlyCredits) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 pt-0.5">
            Auto-replenishes every 30 days
          </p>
        </div>

        {/* PURCHASED EXTRA CREDITS */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Purchased Extra Credits
            </span>
            <span className="font-bold text-indigo-400">
              {purchasedCredits} Credits
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.max(10, (purchasedCredits / 1000) * 100))}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 pt-0.5">
            Total Available: <strong className="text-slate-300">{totalCredits} Credits</strong>
          </p>
        </div>

        {/* PROJECTS COUNT */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-medium flex items-center gap-1.5 text-slate-300">
              <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
              Created Projects
            </span>
            <span className="font-bold text-purple-400">
              {projects.length} / {maxProjects}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (projects.length / maxProjects) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 pt-0.5">
            Stored securely in your account
          </p>
        </div>
      </div>

      {/* PROJECTS SECTION HEADING */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-indigo-400" />
          My Projects ({projects.length})
        </h2>
      </div>

      {/* EMPTY STATE */}
      {projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/30 max-w-lg mx-auto my-12 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <FolderPlus className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No projects yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your first website starts here. Describe your website idea to let AI build it.
            </p>
          </div>
          <button
            onClick={onCreateNewProject}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Create Your First Website
          </button>
        </div>
      ) : (
        /* PROJECTS CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-indigo-500/40 transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                {/* CARD GRADIENT HEADER */}
                <div
                  onClick={() => onOpenProject(proj)}
                  className={`h-36 w-full bg-gradient-to-tr ${
                    proj.thumbnailGradient || 'from-indigo-600 to-purple-700'
                  } p-4 flex flex-col justify-between cursor-pointer relative group-hover:opacity-95 transition-opacity`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-white/90">
                    <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-white/10 flex items-center gap-1">
                      <span className="text-indigo-400">v{proj.versionNumber || 1}</span> • {proj.category || 'Website'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-xs font-semibold border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Project Editor
                    </span>
                  </div>
                </div>

                {/* CARD INFO */}
                <div className="p-5">
                  {editingId === proj.id ? (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-xs text-white focus:outline-none flex-1"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(proj)}
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <h3
                      onClick={() => onOpenProject(proj)}
                      className="text-lg font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer truncate mb-1"
                    >
                      {proj.name}
                    </h3>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* CARD FOOTER ACTIONS */}
              <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <button
                  onClick={() => onOpenProject(proj)}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  Open Editor
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenHistoryModal(proj)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-indigo-400 transition-colors"
                    title="Version History & Logs"
                  >
                    <History className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStartRename(proj)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                    title="Rename Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDuplicateProject(proj.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                    title="Duplicate Project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDownloadZip(proj)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                    title="Download ZIP"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROJECT HISTORY & VERSION RESTORE MODAL */}
      {historyModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Project History & Versions
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {historyModalProject.name} (Current Version: v{historyModalProject.versionNumber || 1})
                </p>
              </div>
              <button
                onClick={() => setHistoryModalProject(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* VERSIONS LIST */}
              <div>
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-3">
                  Snapshots & Versions
                </h4>
                {projectVersions.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 text-slate-500 text-xs text-center">
                    No version snapshots stored yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectVersions.map((v) => (
                      <div
                        key={v.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px] border border-indigo-500/30">
                              Version {v.versionNumber}
                            </span>
                            <span className="text-xs font-bold text-white">{v.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Created by {v.author || 'User'} • {new Date(v.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRestoreVersion(v.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GENERATION LOGS */}
              <div>
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-3">
                  Operation Logs
                </h4>
                {projectLogs.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 text-slate-500 text-xs text-center">
                    No operation logs found for this project.
                  </div>
                ) : (
                  <div className="space-y-2 font-mono text-xs">
                    {projectLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-indigo-300">{log.operationType}</span>
                          <span className="text-slate-500 ml-2">({log.durationSeconds}s, {log.creditsUsed} credits)</span>
                          <div className="text-[10px] text-slate-500">{new Date(log.completionTime).toLocaleString()}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
