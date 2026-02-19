/**
 * v0.1.5 — Authentication Edge Cases
 *
 * CWE-615 WARNING: This entire module is client-side rendered ('use client').
 * All comments, the localStorage key name ('kc_auth'), token handling logic,
 * and auth state shape are shipped to the browser and visible in DevTools
 * (Sources tab, Application > Local Storage, React DevTools component tree).
 * CWE-615 (Inclusion of Sensitive Information in Source Code Comments) | A05:2021
 *
 * --- Purpose ---
 * React context provider that manages authentication state for the entire app.
 * Provides token, userId, isAuthenticated flag, login(), and logout() to any
 * component via the useAuth() hook.
 *
 * --- Where it sits in the component tree ---
 * layout.tsx → providers.tsx → AuthProvider → (all pages and components)
 * Every component inside AuthProvider can call useAuth() to read auth state
 * or trigger login/logout.
 *
 * --- State persistence ---
 * Auth state (token + userId) is persisted to localStorage under key 'kc_auth'.
 * On mount, loadFromStorage() hydrates React state from localStorage. This means
 * the auth session survives page refreshes and tab closures — the user stays
 * "logged in" until they explicitly log out or clear storage.
 *
 * --- Intentional vulnerabilities ---
 *
 * VULN: Token stored in localStorage — accessible to any JavaScript running
 *       in the same origin. A single XSS vulnerability anywhere in the app
 *       allows an attacker to steal the JWT via localStorage.getItem('kc_auth').
 *       CWE-922 (Insecure Storage of Sensitive Information) | A07:2021
 *       Remediation (v2.0.0): httpOnly secure cookie for refresh token
 *       (inaccessible to JS), short-lived access token in memory only.
 *
 * VULN: isAuthenticated is derived as !!state.token — it only checks whether
 *       a token string EXISTS, not whether it's valid, properly signed, or
 *       unexpired. A tampered, expired, or completely fabricated token string
 *       in localStorage will cause the app to show the "authenticated" UI.
 *       The backend will reject the token on the next API call, but the
 *       client-side state will be out of sync until that happens.
 *       CWE-345 (Insufficient Verification of Data Authenticity) | A07:2021
 *
 * VULN (v0.1.4): logout() calls POST /auth/logout fire-and-forget, then clears
 *       client-side state. The backend endpoint intentionally does nothing —
 *       no deny-list, no session deletion, no token revocation. The JWT
 *       remains cryptographically valid after logout. An attacker who copied
 *       the token before (or during) logout retains indefinite access.
 *       CWE-613 (Insufficient Session Expiration) | A07:2021
 *       Remediation (v2.0.0): POST /auth/logout deletes refresh token from DB.
 *       Short-lived access tokens (15-min TTL) expire naturally. httpOnly
 *       cookie cleared via Set-Cookie maxAge=0 from the backend response.
 */
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthResponse } from './types';
import { authLogout } from './api';

/** Shape of auth state stored in React state and localStorage. */
interface AuthState {
  token: string | null;
  userId: string | null;
  role?: 'user' | 'admin'; // v0.4.0: user privilege level
}

/** Full context value exposed to consumers via useAuth(). */
interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean; // v0.4.0: convenience check for role === 'admin'
  login: (response: AuthResponse) => void;
  logout: () => void;
}

/** localStorage key for persisted auth state. */
const STORAGE_KEY = 'kc_auth';

/**
 * Hydrate auth state from localStorage on initial mount.
 * Returns { token: null, userId: null } if:
 *   - Running on the server (typeof window === 'undefined')
 *   - No stored value exists
 *   - Stored value is corrupted / unparseable JSON
 *
 * Silently swallows parse errors — a corrupted entry just means the
 * user appears logged out. No error is surfaced to the UI.
 */
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

/**
 * AuthProvider — wraps the app and provides auth state + actions.
 *
 * On mount (useEffect), hydrates state from localStorage. After that,
 * state is managed in-memory via useState. login() and logout() both
 * update React state AND localStorage to keep them in sync.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, userId: null, role: undefined });

  useEffect(() => {
    setState(loadFromStorage());
  }, []);

  /**
   * Store the auth response (token + userId + role) from a successful register or
   * login call. Updates both React state and localStorage.
   * VULN: Writes token + role to localStorage in plaintext (CWE-922)
   * VULN (v0.4.0): Role stored in client state and localStorage, trusted without
   *       server-side validation (CWE-639). An attacker can modify localStorage
   *       role from 'user' to 'admin' to show admin UI (but backend won't allow
   *       admin actions without proper JWT role claim, which requires knowing
   *       the JWT secret).
   */
  const login = useCallback((response: AuthResponse) => {
    const next: AuthState = { 
      token: response.token, 
      userId: response.userId,
      role: (response as any).role ?? 'user', // v0.4.0: include role from response
    };
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); // VULN: CWE-922
  }, []);

  /**
   * Logout — fire-and-forget POST /auth/logout, then clear client state.
   *
   * The backend call is intentionally fire-and-forget: we don't await it
   * because (a) the backend does nothing with it in v0.1.4, and (b) even
   * in a secure version, the client should clear local state regardless of
   * whether the server request succeeds.
   *
   * VULN: The backend does not revoke the JWT. After this function runs,
   *       the token is gone from THIS browser's localStorage, but any copy
   *       of the token (e.g. from DevTools, XSS exfiltration, network
   *       interception) remains fully valid.
   *       CWE-613 (Insufficient Session Expiration) | A07:2021
   */
  const logout = useCallback(() => {
    // Fire-and-forget: tell the backend we're "logging out" (it does nothing)
    authLogout().catch(() => {}); // VULN: no-op on backend (CWE-613)
    setState({ token: null, userId: null, role: undefined });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      // VULN: only checks token presence, not validity (CWE-345)
      isAuthenticated: !!state.token,
      isAdmin: state.role === 'admin', // v0.4.0: convenience flag (NOTE: trusts client-side role, not validated server-side yet)
      login,
      logout,
    }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state and actions from any component.
 * Must be called from a component inside <AuthProvider>.
 * Throws if used outside the provider (developer error, not user-facing).
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
