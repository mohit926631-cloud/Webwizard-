import React, { useState } from 'react';
import { ViewMode, User } from '../types';
import { Sparkles, Menu, X, Settings, Layout, CreditCard, ChevronDown, Wand2, LogIn, UserPlus, Key } from 'lucide-react';
import { NotificationBell } from './Notifications/NotificationBell';
import {
  SignedIn,
  SignedOut,
  SafeSignInButton,
  SafeSignUpButton,
  SafeUserButton,
  useSafeAuth,
  useSafeClerkUser,
} from './Auth/ClerkAuthProvider';

interface Props {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  user: User;
  onOpenNewProject?: () => void;
  onOpenProject?: (projectId: string) => void;
  onOpenClerkAuth?: (mode?: 'signin' | 'signup') => void;
}

export const Navbar: React.FC<Props> = ({
  currentView,
  onNavigate,
  user,
  onOpenNewProject,
  onOpenProject,
  onOpenClerkAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { isClerkAvailable, openClerkSignIn, openClerkSignUp } = useSafeAuth();
  const { user: clerkUser } = useSafeClerkUser();

  const displayName = clerkUser?.fullName || clerkUser?.firstName || user.name || 'User';
  const displayEmail = clerkUser?.primaryEmailAddress?.emailAddress || user.email || '';

  const navLinks: { label: string; view: ViewMode }[] = [
    { label: 'Home', view: 'landing' },
    { label: 'Templates', view: 'templates' },
    { label: 'Dashboard', view: 'dashboard' },
    { label: 'AI Models', view: 'models' },
    { label: 'Pricing', view: 'pricing' },
    { label: 'FAQ', view: 'faq' },
  ];

  const handleNavClick = (view: ViewMode) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleSignIn = () => {
    if (isClerkAvailable) {
      openClerkSignIn();
    } else if (onOpenClerkAuth) {
      onOpenClerkAuth('signin');
    }
  };

  const handleSignUp = () => {
    if (isClerkAvailable) {
      openClerkSignUp();
    } else if (onOpenClerkAuth) {
      onOpenClerkAuth('signup');
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LOGO */}
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
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
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
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
          <NotificationBell userId={user.id} onOpenProject={onOpenProject} />

          {/* NEW PROJECT BUTTON */}
          <button
            onClick={() => {
              if (onOpenNewProject) {
                onOpenNewProject();
              } else {
                onNavigate('dashboard');
              }
            }}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>New Project</span>
          </button>

          {/* CLERK SIGNED OUT CONTROLS */}
          <SignedOut>
            <SafeSignInButton mode="modal" fallbackClick={handleSignIn}>
              <button
                onClick={handleSignIn}
                className="px-3.5 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900/80 rounded-xl cursor-pointer hover:bg-slate-800"
              >
                <LogIn className="w-4 h-4 text-indigo-400" />
                <span>Sign In</span>
              </button>
            </SafeSignInButton>

            <SafeSignUpButton mode="modal" fallbackClick={handleSignUp}>
              <button
                onClick={handleSignUp}
                className="px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1.5 rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </SafeSignUpButton>
          </SignedOut>

          {/* CLERK SIGNED IN CONTROLS */}
          <SignedIn>
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <SafeUserButton />
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-full border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all text-xs cursor-pointer"
                >
                  <span className="font-semibold text-slate-200 max-w-[110px] truncate">
                    {displayName}
                  </span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {user.plan}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 text-sm z-50 animate-fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="font-semibold text-white truncate">{displayName}</p>
                      {displayEmail && <p className="text-xs text-slate-400 truncate">{displayEmail}</p>}
                      <p className="text-xs text-indigo-400 font-mono mt-1">
                        {user.usage?.monthlyCredits ?? 5000} AI Credits Active
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-800/60 text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer"
                    >
                      <Layout className="w-4 h-4 text-indigo-400" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('templates');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-800/60 text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Templates
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-800/60 text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-indigo-400" />
                      Settings & BYOK
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('billing');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-800/60 text-slate-300 hover:text-white flex items-center gap-2.5 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      Billing & Credits
                    </button>
                  </div>
                )}
              </div>
            </div>
          </SignedIn>
        </div>

        {/* MOBILE HAMBURGER TOGGLE */}
        <div className="md:hidden flex items-center gap-2">
          <SafeUserButton />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-2 animate-fade-in">
          <SignedIn>
            <div className="p-3 mb-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SafeUserButton />
                <div>
                  <p className="font-semibold text-white text-sm">{displayName}</p>
                  <p className="text-xs text-indigo-400">{user.usage?.monthlyCredits ?? 5000} Credits Available</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {user.plan}
              </span>
            </div>
          </SignedIn>

          <SignedOut>
            <div className="grid grid-cols-2 gap-2 pb-2">
              <SafeSignInButton mode="modal" fallbackClick={handleSignIn}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignIn();
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-indigo-400" />
                  <span>Sign In</span>
                </button>
              </SafeSignInButton>
              <SafeSignUpButton mode="modal" fallbackClick={handleSignUp}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignUp();
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-indigo-600 text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </SafeSignUpButton>
            </div>
          </SignedOut>

          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.view)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium transition-colors cursor-pointer ${
                currentView === link.view ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenNewProject) onOpenNewProject();
                else onNavigate('dashboard');
              }}
              className="w-full py-2.5 text-center text-sm font-semibold rounded-xl bg-indigo-600 text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              Start New Project
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-400 bg-indigo-500/10 flex items-center gap-2.5 cursor-pointer"
            >
              <Layout className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => handleNavClick('settings')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900 flex items-center gap-2.5 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              Settings & BYOK
            </button>
            <button
              onClick={() => handleNavClick('billing')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900 flex items-center gap-2.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-indigo-400" />
              Billing & Credits
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
