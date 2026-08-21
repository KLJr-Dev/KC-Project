'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { DEMO_USERS } from '../lib/demo-users';
import { isLabUiEnabled } from '../lib/lab-flags';

const FEATURES = [
  {
    title: 'Identity & Auth',
    description: 'Registration, login, and JWT sessions with hardened authorization.',
  },
  {
    title: 'File Management',
    description: 'Upload, download, and share files with ownership and token controls.',
  },
  {
    title: 'Admin Surface',
    description: 'Role-based admin and moderator workflows backed by database roles.',
  },
];

export default function HomePage() {
  const { isAuthenticated, isAdmin, isModerator, role } = useAuth();
  const labUi = isLabUiEnabled();

  return (
    <div className="space-y-16">
      <section className="space-y-6 pt-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          KC-Project
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted">
          A full-stack web application built to be broken, then hardened through structured
          remediation cycles.
        </p>
        {!isAuthenticated ? (
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/auth"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
            <Link
              href="/auth?mode=login"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
            >
              Sign In
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
                <Link href="/admin" className="rounded-md border border-border px-3 py-1.5 text-sm">
                  Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-border p-6 space-y-3">
          <h2 className="text-sm font-medium text-muted">Current Version</h2>
          <p className="text-lg font-semibold text-foreground">v2.0.0 — Secure parallel</p>
          <p className="text-sm text-muted">
            Hardened authz, shares, and disclosure controls on the remediation branch.
          </p>
        </div>
        {labUi ? (
          <div className="rounded-md border border-border p-6 space-y-3">
            <h2 className="text-sm font-medium text-muted">Demo accounts</h2>
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
              Register a new account or sign in with credentials issued by your operator.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Security Surfaces</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-md border border-border p-5 space-y-2">
              <h3 className="text-sm font-medium text-foreground">{f.title}</h3>
              <p className="text-sm text-muted">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
