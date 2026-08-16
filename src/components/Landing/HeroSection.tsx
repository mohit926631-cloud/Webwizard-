import React from 'react';
import { HeroProductDemo } from './HeroProductDemo';
import { ViewMode } from '../../types';
import { Wand2, Sparkles, ArrowRight, Layers, LogIn } from 'lucide-react';
import { SignedOut, SafeSignInButton, useSafeAuth } from '../Auth/ClerkAuthProvider';

interface Props {
  onStartBuilding: (prompt?: string) => void;
  onNavigate: (view: ViewMode) => void;
  onOpenClerkAuth?: (mode?: 'signin' | 'signup') => void;
}

export const HeroSection: React.FC<Props> = ({ onStartBuilding, onNavigate, onOpenClerkAuth }) => {
  const { isClerkAvailable, openClerkSignIn } = useSafeAuth();

  const handleSignInClick = () => {
    if (isClerkAvailable) {
      openClerkSignIn();
    } else if (onOpenClerkAuth) {
      onOpenClerkAuth('signin');
    }
  };

  return (
    <section className="relative pt-16 pb-20 overflow-hidden bg-slate-950">
      {/* BACKGROUND GLOW ACCENTS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* TOP ANNOUNCEMENT PILL */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md animate-fade-in shadow-lg shadow-indigo-500/10">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>VERVOX AI 2.0 Engine Released — Multi-File Dynamic Export</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        </div>

        {/* HERO HEADLINE */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
          Turn Your Ideas Into Websites With{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            AI.
          </span>
        </h1>

        {/* HERO SUBTITLE */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Describe your idea. VERVOX builds it. Customize everything with natural language, preview instantly, and download your website as a clean ZIP file when you&apos;re ready.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <button
            onClick={() => onStartBuilding()}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.03] flex items-center justify-center gap-3 group cursor-pointer"
          >
            <Wand2 className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
            Start Building Free
            <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('templates')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Layers className="w-5 h-5 text-indigo-400" />
            Explore Templates
          </button>
        </div>

        {/* CLERK SIGN IN QUICK LINK */}
        <SignedOut>
          <div className="mb-14">
            <SafeSignInButton mode="modal" fallbackClick={handleSignInClick}>
              <button
                onClick={handleSignInClick}
                className="text-xs text-slate-400 hover:text-indigo-400 inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-3 rounded-full hover:bg-slate-900/60 border border-transparent hover:border-slate-800"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>Already have an account? <strong className="text-indigo-300 font-medium underline underline-offset-2">Sign In with Clerk</strong></span>
              </button>
            </SafeSignInButton>
          </div>
        </SignedOut>

        {/* HERO DEMO MOCKUP */}
        <HeroProductDemo onStartBuilding={onStartBuilding} />
      </div>
    </section>
  );
};
