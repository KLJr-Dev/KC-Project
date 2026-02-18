import Link from 'next/link';

const FEATURES = [
  {
    title: 'Identity & Auth',
    description:
      'Registration, login, sessions, and token handling, built with intentional gaps.',
  },
  {
    title: 'File Management',
    description: 'Upload, download, and share files with deliberately weak access controls.',
  },
  {
    title: 'Admin Surface',
    description: 'Role-based boundaries designed to be bypassed and escalated.',
  },
];

const DEVS = [
  {
    name: 'Konstanty Litwinow Jr',
    email: 'x23437073@student.ncirl.ie',
    github: 'https://github.com/Kostek02',
    description: 'Interested in Web App Development and Security',
  },
  {
    name: 'Christian Diaz de Sandi',
    email: 'x243163181@student.ncirl.ie',
    github: 'https://github.com/ChristianDS1',
    description: 'Interested in Web App Development and Security',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="space-y-6 pt-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          KC-Project
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted">
          A full-stack web application built to be broken. Designed insecure, tested through
          structured penetration testing, then hardened.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/auth"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Create an Account
          </Link>
          <Link
            href="/auth?mode=login"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* About + Current Version: 2-column */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3 rounded-md border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">About the Project</h2>
          <div className="space-y-3 text-sm leading-relaxed text-muted">
            <p>
              KC-Project is a long-term software engineering and web security project. It follows an
              intentional <strong className="text-foreground">insecure-by-design</strong> approach:
              vulnerabilities are introduced knowingly so they can be documented, exploited, and then
              remediated.
            </p>
            <p>
              The goal is to understand how real-world security failures emerge from architectural
              decisions, missing checks, and trust assumptions. Every version is a coherent, testable
              system state.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-md border border-border p-6">
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted">Current Version</h2>
            <p className="text-lg font-semibold text-foreground">v0.2.3 - Enumeration Surface</p>
            <p className="text-sm text-muted">
              All list endpoints dump full tables. Sequential IDs enable existence probing.
              Swagger spec and framework headers publicly accessible. OWASP Top 10:2025 migration.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              Unbounded queries
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              ID probing
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              Public Swagger
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              OWASP 2025
            </span>
          </div>
        </div>
      </section>

      {/* Security Surfaces */}
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

      {/* Tech Stack */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Tech Stack</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border p-5 space-y-2">
            <h3 className="text-sm font-medium text-foreground">Frontend</h3>
            <p className="text-sm text-muted">
              Next.js (App Router), React, TypeScript, Tailwind CSS. Types auto-generated from
              OpenAPI spec.
            </p>
          </div>
          <div className="rounded-md border border-border p-5 space-y-2">
            <h3 className="text-sm font-medium text-foreground">Backend</h3>
            <p className="text-sm text-muted">
              NestJS, TypeScript, Swagger/OpenAPI. PostgreSQL planned for persistence phase.
            </p>
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">The Team</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {DEVS.map((dev) => (
            <div key={dev.name} className="rounded-md border border-border p-5 space-y-1">
              <h3 className="text-sm font-medium text-foreground">{dev.name}</h3>
              <p className="text-xs font-medium text-muted">{dev.email}</p>
              <a href={dev.github} className="text-xs font-medium text-muted hover:text-primary">GitHub Profile</a>
              <p className="pt-1 text-sm text-muted">{dev.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
