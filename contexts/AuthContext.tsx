import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/utils/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!session && !!user;

  useEffect(() => {
    // Safety timeout: if getSession hangs (network/storage issues),
    // guarantee isLoading becomes false so the login button stays usable.
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.warn('[AuthContext] Safety timeout — forcing isLoading=false');
        setIsLoading(false);
      }
    }, 5000);

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session: s }, error }) => {
        clearTimeout(safetyTimer);
        if (error) {
          console.warn('[AuthContext] getSession error:', error.message);
          // Invalid/expired session stored — clear it so user can re-login
          supabase.auth.signOut().catch(() => {});
        }
        setSession(s);
        setUser(s?.user ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        clearTimeout(safetyTimer);
        console.warn('[AuthContext] getSession failed:', err);
        // Clear any corrupt session data
        supabase.auth.signOut().catch(() => {});
        setSession(null);
        setUser(null);
        setIsLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        if (event === 'TOKEN_REFRESHED' && !s) {
          // Token refresh failed — session is dead
          console.warn('[AuthContext] Token refresh returned null session');
          setSession(null);
          setUser(null);
        } else {
          setSession(s);
          setUser(s?.user ?? null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, captchaToken?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken,
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);

    // Always clear local state — even if the API call fails
    setSession(null);
    setUser(null);

    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore — local state is already cleared
    }

    setIsLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
