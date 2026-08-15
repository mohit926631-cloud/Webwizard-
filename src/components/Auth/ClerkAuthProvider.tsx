import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthContextType {
  isClerkAvailable: boolean;
  clerkKeyConfigured: boolean;
  publishableKey?: string;
  errorMessage?: string;
}

interface SafeUserContextType {
  user: any | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

const SafeAuthContext = createContext<AuthContextType>({
  isClerkAvailable: false,
  clerkKeyConfigured: false,
});

const SafeUserContext = createContext<SafeUserContextType>({
  user: null,
  isLoaded: true,
  isSignedIn: false,
});

export function useSafeAuth() {
  return useContext(SafeAuthContext);
}

export function useSafeClerkUser() {
  return useContext(SafeUserContext);
}

// Inner bridge to safely extract user data when Clerk is active
const ClerkUserBridge: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  return (
    <SafeUserContext.Provider value={{ user, isLoaded, isSignedIn: Boolean(isSignedIn) }}>
      {children}
    </SafeUserContext.Provider>
  );
};

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export const ClerkAuthProvider: React.FC<ClerkAuthProviderProps> = ({ children }) => {
  const envKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
  const [initError, setInitError] = useState<string | null>(null);

  // Check if a valid publishable key format is supplied
  const hasValidKeyFormat = Boolean(
    envKey &&
    (envKey.startsWith('pk_test_') || envKey.startsWith('pk_live_')) &&
    !envKey.includes('YWRhcHRlZC1zZWFndWxsLTkz') // Filter out inactive demo placeholder
  );

  const fallbackValue: AuthContextType = {
    isClerkAvailable: false,
    clerkKeyConfigured: Boolean(envKey),
    publishableKey: envKey,
    errorMessage: initError || (!hasValidKeyFormat ? 'Clerk Publishable Key is not configured or invalid' : undefined),
  };

  if (!hasValidKeyFormat || initError) {
    return (
      <SafeAuthContext.Provider value={fallbackValue}>
        <SafeUserContext.Provider value={{ user: null, isLoaded: true, isSignedIn: false }}>
          {children}
        </SafeUserContext.Provider>
      </SafeAuthContext.Provider>
    );
  }

  return (
    <ErrorBoundary
      onError={(err) => setInitError(err.message)}
      fallback={
        <SafeAuthContext.Provider
          value={{
            isClerkAvailable: false,
            clerkKeyConfigured: true,
            publishableKey: envKey,
            errorMessage: initError || 'Unable to connect to Clerk instance. Please check your Publishable Key.',
          }}
        >
          <SafeUserContext.Provider value={{ user: null, isLoaded: true, isSignedIn: false }}>
            {children}
          </SafeUserContext.Provider>
        </SafeAuthContext.Provider>
      }
    >
      <ClerkProvider
        publishableKey={envKey!}
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#4f46e5',
            colorBackground: '#090d16',
            colorInputBackground: '#0f172a',
            colorInputText: '#ffffff',
            colorText: '#f8fafc',
            borderRadius: '0.75rem',
          },
        }}
      >
        <ClerkUserBridge>
          <SafeAuthContext.Provider
            value={{
              isClerkAvailable: true,
              clerkKeyConfigured: true,
              publishableKey: envKey,
            }}
          >
            {children}
          </SafeAuthContext.Provider>
        </ClerkUserBridge>
      </ClerkProvider>
    </ErrorBoundary>
  );
};

// Safe wrapper components that work seamlessly with or without Clerk loaded
export const SafeSignedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isClerkAvailable } = useSafeAuth();
  if (!isClerkAvailable) {
    return <>{children}</>;
  }
  return <SignedIn>{children}</SignedIn>;
};

export const SafeSignedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isClerkAvailable } = useSafeAuth();
  if (!isClerkAvailable) {
    return null;
  }
  return <SignedOut>{children}</SignedOut>;
};

export const SafeSignInButton: React.FC<{ children?: React.ReactNode; mode?: 'modal' | 'redirect' }> = ({ children, mode = 'modal' }) => {
  const { isClerkAvailable } = useSafeAuth();
  if (!isClerkAvailable) {
    return (
      <button
        onClick={() => {
          // Safe action
        }}
        className="px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900/60 rounded-xl"
      >
        <LogIn className="w-4 h-4 text-slate-400" />
        <span>Sign In</span>
      </button>
    );
  }
  return <SignInButton mode={mode}>{children}</SignInButton>;
};

export const SafeSignUpButton: React.FC<{ children?: React.ReactNode; mode?: 'modal' | 'redirect' }> = ({ children, mode = 'modal' }) => {
  const { isClerkAvailable } = useSafeAuth();
  if (!isClerkAvailable) {
    return (
      <button
        onClick={() => {
          // Safe action
        }}
        className="px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1.5 rounded-xl shadow-md shadow-indigo-600/20"
      >
        <UserPlus className="w-4 h-4" />
        <span>Sign Up</span>
      </button>
    );
  }
  return <SignUpButton mode={mode}>{children}</SignUpButton>;
};

export const SafeUserButton: React.FC = () => {
  const { isClerkAvailable } = useSafeAuth();
  if (!isClerkAvailable) {
    return (
      <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
        C
      </div>
    );
  }
  return (
    <UserButton
      appearance={{
        elements: {
          userButtonAvatarBox: 'w-8 h-8 rounded-full border border-indigo-500/40',
        },
      }}
    />
  );
};
