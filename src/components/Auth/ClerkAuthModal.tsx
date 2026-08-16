import React, { useState } from 'react';
import { SignIn, SignUp, useSafeAuth } from './ClerkAuthProvider';
import { dark } from '@clerk/themes';
import { X, Key, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
}

export const ClerkAuthModal: React.FC<Props> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const { isClerkAvailable, publishableKey, setPublishableKey, errorMessage } = useSafeAuth();
  const [inputKey, setInputKey] = useState(publishableKey || '');
  const [savingKey, setSavingKey] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim().startsWith('pk_')) {
      alert('Clerk Publishable Key must start with pk_test_ or pk_live_');
      return;
    }
    setSavingKey(true);
    setPublishableKey(inputKey.trim());
    setTimeout(() => {
      setSavingKey(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 my-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 transition-colors z-20 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {isClerkAvailable ? (
          <div className="flex flex-col items-center justify-center">
            {/* Mode switch tabs */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl mb-6">
              <button
                onClick={() => setMode('signin')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Pure Clerk Authenticator Component */}
            <div className="w-full flex justify-center clerk-auth-container">
              {mode === 'signin' ? (
                <SignIn
                  routing="hash"
                  appearance={{
                    baseTheme: dark,
                    variables: {
                      colorPrimary: '#6366f1',
                      colorBackground: '#090d16',
                      colorInputBackground: '#0f172a',
                      colorInputText: '#ffffff',
                      colorText: '#f8fafc',
                      borderRadius: '0.75rem',
                    },
                    elements: {
                      rootBox: 'w-full',
                      card: 'shadow-none bg-transparent border-0 p-0',
                      headerTitle: 'text-xl font-bold text-white',
                      headerSubtitle: 'text-sm text-slate-400',
                      socialButtonsBlockButton: 'border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200',
                      formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold',
                      footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                    },
                  }}
                />
              ) : (
                <SignUp
                  routing="hash"
                  appearance={{
                    baseTheme: dark,
                    variables: {
                      colorPrimary: '#6366f1',
                      colorBackground: '#090d16',
                      colorInputBackground: '#0f172a',
                      colorInputText: '#ffffff',
                      colorText: '#f8fafc',
                      borderRadius: '0.75rem',
                    },
                    elements: {
                      rootBox: 'w-full',
                      card: 'shadow-none bg-transparent border-0 p-0',
                      headerTitle: 'text-xl font-bold text-white',
                      headerSubtitle: 'text-sm text-slate-400',
                      socialButtonsBlockButton: 'border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200',
                      formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold',
                      footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                    },
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Clerk Authentication Setup</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your Clerk Publishable Key to connect Clerk&apos;s official login and sign-up authenticator.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Clerk Publishable Key
                </label>
                <input
                  type="text"
                  placeholder="pk_test_... or pk_live_..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={savingKey || !inputKey.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{savingKey ? 'Connecting...' : 'Connect Clerk Authenticator'}</span>
              </button>
            </form>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
              <p className="font-semibold text-slate-300">How to get your key:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Log in to your <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline inline-flex items-center gap-0.5">Clerk Dashboard <ExternalLink className="w-2.5 h-2.5" /></a></li>
                <li>Go to <strong>API Keys</strong> in the sidebar</li>
                <li>Copy the <strong>Publishable Key</strong> (starts with <code className="text-slate-300">pk_test_</code>) and paste it here</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
