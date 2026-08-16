import React, { useState } from 'react';
import { User } from '../../types';
import { Settings, Key, User as UserIcon, Shield, CheckCircle2, AlertCircle, RefreshCw, Lock, ExternalLink, ShieldCheck } from 'lucide-react';
import { useSafeAuth, useSafeClerkUser } from '../Auth/ClerkAuthProvider';

interface Props {
  user: User;
  onUpdateUser: (user: User) => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const SettingsView: React.FC<Props> = ({ user, onUpdateUser, onToast }) => {
  const { isClerkAvailable, publishableKey, setPublishableKey } = useSafeAuth();
  const { user: clerkUser } = useSafeClerkUser();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [clerkKeyInput, setClerkKeyInput] = useState(publishableKey || '');
  const [savingClerkKey, setSavingClerkKey] = useState(false);

  const [apiKey, setApiKey] = useState('');
  const [testingKey, setTestingKey] = useState(false);
  const [keyValid, setKeyValid] = useState<boolean | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ ...user, name, email });
    onToast('success', 'User profile updated successfully.');
  };

  const handleSaveClerkKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkKeyInput.trim().startsWith('pk_')) {
      onToast('error', 'Clerk Publishable Key must start with pk_test_ or pk_live_');
      return;
    }
    setSavingClerkKey(true);
    setPublishableKey(clerkKeyInput.trim());
    setTimeout(() => {
      setSavingClerkKey(false);
      onToast('success', 'Clerk Publishable Key saved! Clerk Authenticator active.');
    }, 600);
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      onToast('error', 'Please enter a Gemini API Key to validate.');
      return;
    }
    setTestingKey(true);
    setKeyValid(null);

    try {
      const res = await fetch('/api/byok-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      setTestingKey(false);

      if (data.valid) {
        setKeyValid(true);
        onToast('success', 'Gemini API Key validated successfully! BYOK activated.');
      } else {
        setKeyValid(false);
        onToast('error', data.message || 'Invalid API Key.');
      }
    } catch {
      setTestingKey(false);
      setKeyValid(false);
      onToast('error', 'Could not reach validation server. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-100 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Settings className="w-7 h-7 text-indigo-400" />
          Account & AI Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your personal profile, configure Clerk Authentication, and manage API settings.
        </p>
      </div>

      {/* CLERK AUTHENTICATION SECTION */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            Clerk Authentication
          </h2>
          <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded ${
            isClerkAvailable
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
          }`}>
            {isClerkAvailable ? 'ACTIVE' : 'READY TO CONNECT'}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          VERVOX uses Clerk&apos;s official authenticators for sign in, sign up, multi-factor authentication, and user profile management.
          {clerkUser && (
            <span className="block mt-1 text-emerald-400 font-semibold">
              Currently signed in via Clerk as {clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress}.
            </span>
          )}
        </p>

        <form onSubmit={handleSaveClerkKey} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Clerk Publishable Key (<code className="text-indigo-300">pk_test_...</code> or <code className="text-indigo-300">pk_live_...</code>)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={clerkKeyInput}
                onChange={(e) => setClerkKeyInput(e.target.value)}
                placeholder="pk_test_..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="submit"
                disabled={savingClerkKey || !clerkKeyInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                {savingClerkKey ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>Save Key</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://dashboard.clerk.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Clerk Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://clerk.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Documentation</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>
      </div>

      {/* USER PROFILE SECTION */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
          <UserIcon className="w-5 h-5 text-indigo-400" />
          Personal Profile
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Save Profile Changes
          </button>
        </form>
      </div>

      {/* BYOK / GEMINI API KEY SECTION */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            Bring Your Own Key (BYOK)
          </h2>
          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            OPTIONAL
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          VERVOX uses Google Gemini AI models on the server. If you have your own Gemini API key, you can enter it here.
        </p>

        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Gemini API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setKeyValid(null);
                }}
                placeholder="AIzaSy..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={testingKey}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                {testingKey ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                ) : (
                  'Validate Key'
                )}
              </button>
            </div>
          </div>

          {keyValid === true && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>API Key validated! Custom Gemini model generation active.</span>
            </div>
          )}

          {keyValid === false && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Key verification failed.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
