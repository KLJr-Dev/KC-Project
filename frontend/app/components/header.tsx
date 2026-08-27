/**
 * Global navigation header — Northwind Ops face (Cycle-8 / ADR-037).
 *
 * Auth: access JWT in memory; role from AuthContext (UX only — API enforces).
 * Logout calls POST /auth/logout (revokes refresh) and clears in-memory access token.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { authMe } from '../../lib/api';

export default function Header() {
  const { isAuthenticated, logout, isAdmin, isModerator, role } = useAuth();
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
          Northwind
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/files"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                My Files
              </Link>
              <Link
                href="/intake"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Intake
              </Link>
              <Link
                href="/notes"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Notes
              </Link>
              <Link
                href="/preview"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Preview
              </Link>
              <Link
                href="/ops"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Ops
              </Link>
              <Link
                href="/sharing"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Sharing
              </Link>
            </>
          )}
          {isAuthenticated && (isModerator || isAdmin) && (
            <Link
              href="/moderator"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Review
            </Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link
              href="/admin"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
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
