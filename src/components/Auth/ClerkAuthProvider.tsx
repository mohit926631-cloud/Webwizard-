import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  ClerkProvider,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  SignInButton as ClerkSignInButton,
  SignUpButton as ClerkSignUpButton,
  UserButton as ClerkUserButton,
  SignIn as ClerkSignIn,
  SignUp as ClerkSignUp,
  useUser,
  useClerk,
} from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { Shield } from 'lucide-react';

interface AuthContextType {
  isClerkAvailable: boolean;
  clerkKeyConfigured: boolean;
  publishableKey?: string;
  errorMessage?: string;
  setPublishableKey: (key: string) => void;
  openClerkSignIn: () => void;
  openClerkSignUp: () => void;
}

interface SafeUserContextType {
  user: any | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

const SafeAuthContext = createContext<AuthContextType>({
  isClerkAvailable: false,
  clerkKeyConfigured: false,
  setPublishableKey: () => {},
  openClerkSignIn: () => {},
  openClerkSignUp: () => {},
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

// User bridge to safely extract user data when Clerk is active
const ClerkUserBridge: React.FC<{
  children: ReactNode;
  onUserChange?: (user: any) => void;
}> = ({ children, onUserChange }) => {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user && onUserChange) {
      onUserChange(user);
    }
  }, [user, isLoaded, isSignedIn, onUserChange]);

  return (
    <SafeUserContext.Provider value={{ user, isLoaded, isSignedIn: Boolean(isSignedIn) }}>
      {children}
    </SafeUserContext.Provider>
  );
};

// Actions bridge to expose Clerk functions
const ClerkActionsBridge: React.FC<{
  children: ReactNode;
  publishableKey: string;
  setPublishableKey: (key: string) => void;
}> = ({ children, publishableKey, setPublishableKey }) => {
  const clerk = useClerk();

  const openClerkSignIn = () => {
    if (clerk && clerk.openSignIn) {
      clerk.openSignIn({
        appearance: {
          baseTheme: dark,
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#0b0f19',
            colorInputBackground: '#111827',
            colorInputText: '#ffffff',
            colorText: '#f3f4f6',
            borderRadius: '0.75rem',
          },
        },
      });
    }
  };

  const openClerkSignUp = () => {
    if (clerk && clerk.openSignUp) {
      clerk.openSignUp({
        appearance: {
          baseTheme: dark,
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#0b0f19',
            colorInputBackground: '#111827',
            colorInputText: '#ffffff',
            colorText: '#f3f4f6',
            borderRadius: '0.75rem',
          },
        },
      });
    }
  };

  return (
    <SafeAuthContext.Provider
      value={{
        isClerkAvailable: true,
        clerkKeyConfigured: true,
        publishableKey,
        setPublishableKey,
        openClerkSignIn,
        openClerkSignUp,
      }}
    >
      {children}
    </SafeAuthContext.Provider>
  );
};

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export const ClerkAuthProvider: React.FC<ClerkAuthProviderProps> = ({ children }) => {
  const [storedKey, setStoredKey] = useState<string>(() => {
    const fromEnv = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim();
    if (fromEnv && (fromEnv.startsWith('pk_test_') || fromEnv.startsWith('pk_live_'))) {
      return fromEnv;
    }
    const fromStorage = localStorage.getItem('clerk_publishable_key') || '';
    return fromStorage.trim();
  });

  const [initError, setInitError] = useState<string | null>(null);

  const handleSetKey = (newKey: string) => {
    const trimmed = newKey.trim();
    setStoredKey(trimmed);
    localStorage.setItem('clerk_publishable_key', trimmed);
    setInitError(null);
  };

  // Check if valid publishable key format (e.g. pk_test_... or pk_live_...)
  const hasValidKeyFormat = Boolean(
    storedKey &&
    (storedKey.startsWith('pk_test_') || storedKey.startsWith('pk_live_'))
  );

  const fallbackValue: AuthContextType = {
    isClerkAvailable: false,
    clerkKeyConfigured: Boolean(storedKey),
    publishableKey: storedKey,
    errorMessage: initError || (!hasValidKeyFormat ? 'Clerk Publishable Key is required' : undefined),
    setPublishableKey: handleSetKey,
    openClerkSignIn: () => {},
    openClerkSignUp: () => {},
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
      fallbackRender={({ error }) => (
        <SafeAuthContext.Provider
          value={{
            ...fallbackValue,
            errorMessage: error?.message || 'Error connecting to Clerk instance',
          }}
        >
          <SafeUserContext.Provider value={{ user: null, isLoaded: true, isSignedIn: false }}>
            {children}
          </SafeUserContext.Provider>
        </SafeAuthContext.Provider>
      )}
    >
      <ClerkProvider
        publishableKey={storedKey}
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#0b0f19',
            colorInputBackground: '#111827',
            colorInputText: '#ffffff',
            colorText: '#f3f4f6',
            borderRadius: '0.75rem',
          },
        }}
      >
        <ClerkUserBridge>
          <ClerkActionsBridge publishableKey={storedKey} setPublishableKey={handleSetKey}>
            {children}
          </ClerkActionsBridge>
        </ClerkUserBridge>
      </ClerkProvider>
    </ErrorBoundary>
  );
};

// Safe SignedIn component that never crashes outside ClerkProvider
export const SignedIn: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isClerkAvailable } = useSafeAuth();
  const { isSignedIn } = useSafeClerkUser();

  if (!isClerkAvailable) {
    return null;
  }

  if (!isSignedIn) {
    return null;
  }

  return <ClerkSignedIn>{children}</ClerkSignedIn>;
};

// Safe SignedOut component that never crashes outside ClerkProvider
export const SignedOut: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isClerkAvailable } = useSafeAuth();
  const { isSignedIn } = useSafeClerkUser();

  if (!isClerkAvailable) {
    return <>{children}</>;
  }

  if (isSignedIn) {
    return null;
  }

  return <ClerkSignedOut>{children}</ClerkSignedOut>;
};

// Safe SignIn component
export const SignIn: React.FC<any> = (props) => {
  const { isClerkAvailable } = useSafeAuth();
  if (!isClerkAvailable) {
    return null;
  }
  return <ClerkSignIn {...props} />;
};

// Safe SignUp component
export const SignUp: React.FC<any> = (props) => {
  const { isClerkAvailable } = useSafeAuth();
  if (!isClerkAvailable) {
    return null;
  }
  return <ClerkSignUp {...props} />;
};

// Safe SignInButton
export const SignInButton: React.FC<{
  children?: React.ReactNode;
  mode?: 'modal' | 'redirect';
  fallbackClick?: () => void;
  [key: string]: any;
}> = ({ children, mode = 'modal', fallbackClick, ...rest }) => {
  const { isClerkAvailable, openClerkSignIn } = useSafeAuth();

  if (isClerkAvailable) {
    return (
      <ClerkSignInButton mode={mode} {...rest}>
        {children}
      </ClerkSignInButton>
    );
  }

  return (
    <span
      onClick={() => {
        if (fallbackClick) fallbackClick();
        else openClerkSignIn();
      }}
      className="inline-flex cursor-pointer"
    >
      {children || (
        <button className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
          <span>Sign In</span>
        </button>
      )}
    </span>
  );
};

// Safe SignUpButton
export const SignUpButton: React.FC<{
  children?: React.ReactNode;
  mode?: 'modal' | 'redirect';
  fallbackClick?: () => void;
  [key: string]: any;
}> = ({ children, mode = 'modal', fallbackClick, ...rest }) => {
  const { isClerkAvailable, openClerkSignUp } = useSafeAuth();

  if (isClerkAvailable) {
    return (
      <ClerkSignUpButton mode={mode} {...rest}>
        {children}
      </ClerkSignUpButton>
    );
  }

  return (
    <span
      onClick={() => {
        if (fallbackClick) fallbackClick();
        else openClerkSignUp();
      }}
      className="inline-flex cursor-pointer"
    >
      {children || (
        <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer">
          <span>Sign Up</span>
        </button>
      )}
    </span>
  );
};

// Safe UserButton
export const UserButton: React.FC<any> = (props) => {
  const { isClerkAvailable } = useSafeAuth();

  if (isClerkAvailable) {
    return (
      <ClerkUserButton
        appearance={{
          baseTheme: dark,
          elements: {
            userButtonAvatarBox: 'w-8 h-8 rounded-full border border-indigo-500/40',
          },
        }}
        {...props}
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
      <Shield className="w-4 h-4 text-indigo-400" />
    </div>
  );
};

export const SafeSignInButton = SignInButton;
export const SafeSignUpButton = SignUpButton;
export const SafeUserButton = UserButton;
export const SafeSignedIn = SignedIn;
export const SafeSignedOut = SignedOut;
