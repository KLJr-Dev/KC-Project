/**
 * M6 / v2.0.0 — AuthProvider (session state).
 *
 * Security measures:
 * - CWE-922: Access JWT kept in React state + access-token memory module only.
 *   No token/refresh written to localStorage (legacy `kc_auth` cleared on boot).
 * - CWE-922: Refresh stays in httpOnly cookie; silent refresh on mount restores
 *   the access JWT after hard reload.
 * - CWE-613: logout() hits API (revoke + clear cookie) then clears memory.
 *
 * Role flags remain UX-only; HasRoleGuard re-checks DB on the backend (M1).
 */
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthResponse } from './types';
import { authLogout, authMe, authRefresh } from './api';
import { clearAccessToken, setAccessToken } from './access-token';

interface AuthState {
  token: string | null;
  userId: string | null;
  role?: 'user' | 'moderator' | 'admin';
  /** False until mount refresh attempt finishes (avoids UI flash). */
  ready: boolean;
}

interface AuthContextValue extends Omit<AuthState, 'ready'> {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  ready: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
}

const LEGACY_STORAGE_KEY = 'kc_auth';

function parseRoleFromToken(
  token: string | null,
): 'user' | 'moderator' | 'admin' | undefined {
  if (!token) return undefined;
  const parts = token.split('.');
  if (parts.length !== 3) return undefined;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const role = payload?.role;
    if (role === 'admin' || role === 'moderator' || role === 'user') return role;
    return undefined;
  } catch {
    return undefined;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    userId: null,
    role: undefined,
    ready: false,
  });

  useEffect(() => {
    // Drop any pre-M6 localStorage session material.
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* ignore */
    }

    let cancelled = false;
    (async () => {
      try {
        const session = await authRefresh();
        if (cancelled) return;
        setAccessToken(session.token);
        let userId = session.userId;
        let role = parseRoleFromToken(session.token);
        try {
          const me = await authMe();
          userId = me.id;
          role = (me.role as AuthState['role']) ?? role;
        } catch {
          /* me optional if token already has claims */
        }
        setState({ token: session.token, userId, role, ready: true });
      } catch {
        if (cancelled) return;
        clearAccessToken();
        setState({ token: null, userId: null, role: undefined, ready: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((response: AuthResponse) => {
    setAccessToken(response.token);
    setState({
      token: response.token,
      userId: response.userId,
      role: parseRoleFromToken(response.token) ?? 'user',
      ready: true,
    });
  }, []);

  const logout = useCallback(() => {
    authLogout().catch(() => {});
    clearAccessToken();
    setState({ token: null, userId: null, role: undefined, ready: true });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: state.token,
      userId: state.userId,
      role: state.role,
      ready: state.ready,
      isAuthenticated: !!state.token,
      isAdmin: state.role === 'admin',
      isModerator: state.role === 'moderator',
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
