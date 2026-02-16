'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthResponse } from './types';

interface AuthState {
  token: string | null;
  userId: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
}

const STORAGE_KEY = 'kc_auth';

function loadFromStorage(): AuthState {
  if (typeof window === 'undefined') return { token: null, userId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, userId: null };
    const parsed = JSON.parse(raw) as AuthState;
    return { token: parsed.token ?? null, userId: parsed.userId ?? null };
  } catch {
    return { token: null, userId: null };
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, userId: null });

  useEffect(() => {
    setState(loadFromStorage());
  }, []);

  const login = useCallback((response: AuthResponse) => {
    const next: AuthState = { token: response.token, userId: response.userId };
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const logout = useCallback(() => {
    setState({ token: null, userId: null });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: !!state.token,
      login,
      logout,
    }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
