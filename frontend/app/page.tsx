'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { DEMO_USERS } from '../lib/demo-users';
import { isLabUiEnabled } from '../lib/lab-flags';

export default function HomePage() {
  const { isAuthenticated, isAdmin, isModerator, role } = useAuth();
  const labUi = isLabUiEnabled();

  return (
    <div className="space-y-16">
      <section className="space-y-6 pt-8 text-center">
        <p className="text-sm font-medium tracking-wide text-muted uppercase">Northwind Ops</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Northwind
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted">
          Employee portal for files, notes, onboarding, and ops intake across Northwind.
        </p>
        {!isAuthenticated ? (
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/auth?mode=login"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Sign in to portal
            </Link>
            <Link
              href="/auth"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
            >
              Request access
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-lg border border-border p-6 text-left">
            <p className="text-sm text-muted">
              Signed in as <span className="font-medium text-foreground capitalize">{role}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/files"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
              >
                My Files
              </Link>
              <Link href="/intake" className="rounded-md border border-border px-3 py-1.5 text-sm">
                Intake
              </Link>
              {(isModerator || isAdmin) && (
                <Link
                  href="/intake/queue"
                  className="rounded-md border border-border px-3 py-1.5 text-sm"
                >
                  Onboarding queue
                </Link>
              )}
              <Link href="/notes" className="rounded-md border border-border px-3 py-1.5 text-sm">
                Notes
              </Link>
              <Link href="/preview" className="rounded-md border border-border px-3 py-1.5 text-sm">
                Preview
              </Link>
              <Link href="/ops" className="rounded-md border border-border px-3 py-1.5 text-sm">
                Ops
              </Link>
              <Link href="/sharing" className="rounded-md border border-border px-3 py-1.5 text-sm">
                Sharing
              </Link>
              {(isModerator || isAdmin) && (
                <Link
                  href="/moderator"
                  className="rounded-md border border-border px-3 py-1.5 text-sm"
                >
                  Review Queue
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link href="/admin" className="rounded-md border border-border px-3 py-1.5 text-sm">
                    Admin
                  </Link>
                  <Link
                    href="/admin/security"
                    className="rounded-md border border-border px-3 py-1.5 text-sm"
                  >
                    Security Ops
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-border p-6 space-y-3">
          <h2 className="text-sm font-medium text-muted">Portal build</h2>
          <p className="text-lg font-semibold text-foreground">v1.6.0</p>
          <p className="text-sm text-muted">
            Northwind employee portal with Ops Intake onboarding and Security Ops.
          </p>
        </div>
        {labUi ? (
          <div className="rounded-md border border-border p-6 space-y-3">
            <h2 className="text-sm font-medium text-muted">Demo accounts (lab)</h2>
            <ul className="text-sm space-y-1 text-muted">
              {DEMO_USERS.map((d) => (
                <li key={d.email}>
                  <span className="font-medium text-foreground">{d.label}:</span> {d.email}
                </li>
              ))}
            </ul>
            <Link href="/dev" className="text-sm text-foreground underline">
              API Explorer →
            </Link>
          </div>
        ) : (
          <div className="rounded-md border border-border p-6 space-y-3">
            <h2 className="text-sm font-medium text-muted">Accounts</h2>
            <p className="text-sm text-muted">
              Sign in with credentials issued by Northwind IT, or register if self-service is
              enabled for your site.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
