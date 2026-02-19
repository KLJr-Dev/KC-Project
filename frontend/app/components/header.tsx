/**
 * v0.1.5 — Authentication Edge Cases
 *
 * CWE-615 WARNING: This component is client-side rendered ('use client').
 * All comments, the authMe() call, the username display logic, and the
 * auth state check are shipped to the browser. Visible in DevTools Sources
 * tab and React DevTools component inspector.
 * CWE-615 (Inclusion of Sensitive Information in Source Code Comments) | A02:2025
 *
 * --- Purpose ---
 * Global navigation header rendered on every page. Displays:
 *   - "KC" logo link (home)
 *   - "Home" nav link
 *   - Auth state: "Sign In" link (unauthenticated) or "username [role] | Logout" (authenticated)
 *   - Theme toggle (light/dark)
 *   - Admin link (v0.4.0, hidden for non-admins)
 *
 * --- Auth integration (v0.1.4) ---
 * When isAuthenticated is true, the component calls authMe() on mount via
 * useEffect to fetch the current user's profile from GET /auth/me. This
 * proves the JWT session works end-to-end: the token from localStorage is
 * sent as a Bearer header, the backend verifies it, and returns the profile.
 *
 * The username from the response is displayed next to the Logout button.
 * If the authMe() call fails (e.g. token expired/invalid, server down),
 * the component gracefully falls back to showing just "Logout" without a
 * username — no error is surfaced to the user.
 *
 * --- v0.4.0: Role display ---
 * The user's role is now displayed in the header if they are authenticated.
 * The role is read from AuthContext (stored in localStorage and JWT payload).
 * An Admin link is shown conditionally: only visible if isAdmin is true.
 * VULN (v0.4.0): Role shown in the UI is from client-side state only (CWE-639).
 *       An attacker could modify localStorage to show "admin" UI, but
 *       the backend won't grant admin access without a properly signed JWT
 *       with role=admin claim (which requires knowing the JWT secret).
 *
 * --- Logout behaviour (v0.1.4) ---
 * Clicking "Logout" triggers AuthContext.logout(), which:
 *   1. Fires POST /auth/logout (fire-and-forget — backend does nothing)
 *   2. Clears React state + localStorage
 * The JWT is NOT revoked. Any copy of the token remains valid indefinitely.
 * VULN: CWE-613 (Insufficient Session Expiration) | A07:2025
 *
 * Note: The authenticated username, user ID, full API response, and role are
 * visible in the browser's Network tab. The username is also rendered in
 * the DOM (inspectable) and visible in React DevTools' component state.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { authMe } from '../../lib/api';

export default function Header() {
  const { isAuthenticated, logout, isAdmin, role } = useAuth();
  const { resolved, toggleTheme } = useTheme();
  const [username, setUsername] = useState<string | null>(null);

  /**
   * Fetch the authenticated user's profile on mount (and when auth state
   * changes). Displays the username in the header to prove the JWT flow
   * works. Falls back silently on error — the header just shows "Logout"
   * without a username if the call fails.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      setUsername(null);
      return;
    }

    authMe()
      .then((user) => setUsername(user.username ?? null))
      .catch(() => setUsername(null));
  }, [isAuthenticated]);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          KC
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/files" className="text-sm text-muted transition-colors hover:text-foreground">
            Files
          </Link>
          {isAuthenticated && isAdmin && (
            <Link href="/admin" className="text-sm text-muted transition-colors hover:text-foreground">
              Admin
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {username && (
                <span className="text-sm text-foreground">
                  {username} {role && <span className="text-xs text-muted">({role})</span>}
                </span>
              )}
              <button
                type="button"
                onClick={logout}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="text-muted transition-colors hover:text-foreground"
          >
            {resolved === 'dark' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.06 1.06l1.06 1.06Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
