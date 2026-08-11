import React, { useState } from 'react';
import { ViewMode, User } from '../types';
import { Sparkles, Menu, X, User as UserIcon, LogOut, Settings, Layout, CreditCard, ChevronDown, Wand2 } from 'lucide-react';
import { NotificationBell } from './Notifications/NotificationBell';

interface Props {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  user: User | null;
  onSignOut: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenProject?: (projectId: string) => void;
}

export const Navbar: React.FC<Props> = ({
  currentView,
  onNavigate,
  user,
  onSignOut,
  onOpenAuth,
  onOpenProject,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks: { label: string; view: ViewMode }[] = [
    { label: 'Home', view: 'landing' },
    { label: 'Features', view: 'landing' },
    { label: 'Templates', view: 'templates' },
    { label: 'Pricing', view: 'pricing' },
    { label: 'FAQ', view: 'faq' },
  ];

  const handleNavClick = (view: ViewMode) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LOGO */}
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent font-mono">
              VERVOX
            </span>
            <span className="text-[9px] text-indigo-400 tracking-widest font-semibold uppercase -mt-1">
              AI WEBSITE BUILDER
            </span>
          </div>
        </button>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.view)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === link.view
                  ? 'text-white bg-slate-800/60 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* RIGHT SIDE ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell userId={user.id} onOpenProject={onOpenProject} />
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all text-sm"
                >
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                  {user.name.charAt(0)}
                </div>
                <span className="font-medium text-slate-200 max-w-[120px] truncate">
                  {user.name}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {user.plan}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 text-sm z-50 animate-fade-in"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800/60 text-slate-300 hover:text-white flex items-center gap-2.5"
                  >
                    <Layout className="w-4 h-4 text-indigo-400" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800/60 text-slate-300 hover:text-white flex items-center gap-2.5"
                  >
                    <Settings className="w-4 h-4 text-indigo-400" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigate('billing');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-800/60 text-slate-300 hover:text-white flex items-center gap-2.5"
                  >
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    Billing & Plans
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-500/10 text-rose-400 flex items-center gap-2.5 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Start Building
              </button>
            </>
          )}
        </div>

        {/* MOBILE HAMBURGER TOGGLE */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-2 animate-fade-in">
          {user && (
            <div className="p-3 mb-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {user.plan}
              </span>
            </div>
          )}

          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.view)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                currentView === link.view ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-800 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-400 bg-indigo-500/10 flex items-center gap-2.5"
                >
                  <Layout className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavClick('settings')}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900 flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-indigo-400" />
                  Settings
                </button>
                <button
                  onClick={() => handleNavClick('billing')}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900 flex items-center gap-2.5"
                >
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  Billing & Credits
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-indigo-600 text-white"
                >
                  Start Building
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
