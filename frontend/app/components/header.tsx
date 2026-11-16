/**
 * Global navigation — Northwind Document Portal (Cycle-10 / ADR-037).
 *
 * Auth: access JWT in memory; role from AuthContext (UX only — API enforces).
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { authMe } from '../../lib/api';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-muted transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const { isAuthenticated, logout, isAdmin, isModerator, role } = useAuth();
  const { resolved, toggleTheme } = useTheme();
  const [username, setUsername] = useState<string | null>(null);

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
    <header className="border-b border-border bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <span className="nw-mark" aria-hidden>
            NW
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold tracking-tight text-foreground">
              Northwind
            </span>
            <span className="block text-[11px] leading-tight text-muted">
              Document Portal
            </span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
          <NavLink href="/">Home</NavLink>

          {isAuthenticated && (
            <>
              <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
              <NavLink href="/files">Files</NavLink>
              <NavLink href="/notes">Notes</NavLink>
              <NavLink href="/sharing">Sharing</NavLink>
              <NavLink href="/preview">Preview</NavLink>
              <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
              <NavLink href="/ops">Ops</NavLink>
              <NavLink href="/intake">Intake</NavLink>
              {(isModerator || isAdmin) && (
                <>
                  <NavLink href="/packets">Packets</NavLink>
                  <NavLink href="/intake/queue">Onboarding</NavLink>
                  <NavLink href="/moderator">Review</NavLink>
                </>
              )}
              {isAdmin && (
                <>
                  <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
                  <NavLink href="/admin">Admin</NavLink>
                  <NavLink href="/admin/security">Defense</NavLink>
                </>
              )}
            </>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {username && (
                <span className="text-sm text-foreground">
                  {username}
                  {role ? <span className="ml-1 text-xs text-muted">({role})</span> : null}
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
              href="/auth?mode=login"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
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
