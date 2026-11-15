'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { DEMO_USERS } from '../lib/demo-users';
import { isLabUiEnabled } from '../lib/lab-flags';

export default function HomePage() {
  const { isAuthenticated, isAdmin, isModerator, role } = useAuth();
  const labUi = isLabUiEnabled();

  return (
    <div className="space-y-14">
      <div
        // CYCLE10-PLANT — Stage-0 discovery (must appear in view-source)
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: '<!-- document staff access requests: /staff-access/ -->',
        }}
      />
      <section className="relative overflow-hidden rounded-lg border border-border bg-surface px-6 py-14 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 23px, color-mix(in srgb, var(--border) 55%, transparent) 24px)',
          }}
          aria-hidden
        />
        <div className="relative max-w-xl space-y-5">
          <span className="nw-stamp">Document Ops</span>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Northwind
          </h1>
          <p className="text-lg text-muted">
            Employee documents, partner packets, and Document Ops — one portal for
            the trading floor and warehouse desk.
          </p>
          {!isAuthenticated ? (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/auth?mode=login"
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Sign in to portal
              </Link>
              <Link
                href="/auth"
                className="rounded-md border border-border bg-background/60 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent-soft/40"
              >
                Self-service register
              </Link>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <p className="text-sm text-muted">
                Signed in as{' '}
                <span className="font-medium text-foreground capitalize">{role}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/files"
                  className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                >
                  My Files
                </Link>
                {(isModerator || isAdmin) && (
                  <Link
                    href="/packets"
                    className="rounded-md border border-border bg-background/70 px-3 py-1.5 text-sm"
                  >
                    Document packets
                  </Link>
                )}
                <Link
                  href="/intake"
                  className="rounded-md border border-border bg-background/70 px-3 py-1.5 text-sm"
                >
                  Intake
                </Link>
                <Link
                  href="/ops"
                  className="rounded-md border border-border bg-background/70 px-3 py-1.5 text-sm"
                >
                  Ops handbook
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-md border border-border bg-background/70 px-3 py-1.5 text-sm"
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Files & sharing</h2>
          <p className="text-sm text-muted">
            Store working documents and share links with teammates across Northwind sites.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Document Ops</h2>
          <p className="text-sm text-muted">
            Staff intake for vendor and partner packets routed through the processing desk.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Ops & intake</h2>
          <p className="text-sm text-muted">
            Handbook library and HR onboarding requests for warehouse and office hires.
          </p>
        </div>
      </section>

      {labUi && (
        <section className="rounded-md border border-border bg-surface p-5 space-y-3">
          <h2 className="text-sm font-medium text-muted">Demo accounts (lab flag)</h2>
          <ul className="text-sm space-y-1 text-muted">
            {DEMO_USERS.map((d) => (
              <li key={d.email}>
                <span className="font-medium text-foreground">{d.label}:</span> {d.email}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
