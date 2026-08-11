import React from 'react';
import { ViewMode, User } from '../../types';
import { Sparkles, Layout, PlusCircle, FolderGit2, Layers, Cpu, Settings, CreditCard, LogOut, HelpCircle, User as UserIcon } from 'lucide-react';

interface Props {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  user: User;
  onSignOut: () => void;
  onOpenNewProject: () => void;
}

export const DashboardSidebar: React.FC<Props> = ({
  currentView,
  onNavigate,
  user,
  onSignOut,
  onOpenNewProject,
}) => {
  const menuItems: { label: string; view: ViewMode; icon: React.ReactNode }[] = [
    { label: 'Dashboard', view: 'dashboard', icon: <Layout className="w-4 h-4" /> },
    { label: 'My Projects', view: 'dashboard', icon: <FolderGit2 className="w-4 h-4" /> },
    { label: 'Templates', view: 'templates', icon: <Layers className="w-4 h-4" /> },
    { label: 'AI Models', view: 'models', icon: <Cpu className="w-4 h-4" /> },
    { label: 'Settings', view: 'settings', icon: <Settings className="w-4 h-4" /> },
    { label: 'Billing', view: 'billing', icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col justify-between p-4 shrink-0 min-h-screen text-slate-300">
      <div>
        {/* BRAND LOGO */}
        <div className="flex items-center gap-2.5 px-3 py-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <span className="font-extrabold text-lg tracking-wider text-white font-mono">
            VERVOX
          </span>
        </div>

        {/* NEW PROJECT BUTTON */}
        <button
          onClick={onOpenNewProject}
          className="w-full mb-6 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          New Project
        </button>

        {/* NAV MENU ITEMS */}
        <div className="space-y-1">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentView === item.view
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM USER PROFILE & ACTIONS */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30 shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden text-xs">
            <p className="font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold text-indigo-400">{user.plan} PLAN</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('faq')}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg"
        >
          <HelpCircle className="w-4 h-4" />
          Help & FAQs
        </button>

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
