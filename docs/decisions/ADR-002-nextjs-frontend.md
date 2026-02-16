# ADR-002: Next.js App Router as Frontend Framework

**Status:** Accepted

**Date:** v0.0.4 (Frontend Bootstrapping)

---

## Context

KC-Project needs a frontend framework that:

- Uses React (widely adopted, transferable skills)
- Supports file-based routing
- Has a modern development experience (fast refresh, TypeScript, Tailwind)
- Can serve as both a static and dynamic application
- Is realistic for a production web app

Alternatives considered:

- **React (plain, via Vite)** — Lightweight, fast dev server, no opinions on routing or SSR. Would need React Router added manually. No file-based routing. Viable but less structured.
- **Vite + React Router** — Fast, flexible, but requires manual routing setup and has no server-side rendering story out of the box.

## Decision

Use **Next.js 16 with the App Router** as the frontend framework.

App Router provides file-based routing, React Server Components (not used yet but available), and a clear layout/page hierarchy. The ecosystem is mature and widely adopted.

## Consequences

- **Positive:** File-based routing maps cleanly to the domain sections (users, auth, files, admin, sharing).
- **Positive:** Industry-standard choice — patterns learned here apply broadly.
- **Positive:** Built-in support for API routes if we ever need BFF (backend-for-frontend) patterns.
- **Negative:** App Router is opinionated about server vs client components. All our pages are `'use client'` which bypasses RSC benefits, but this is fine for a contract verification UI.
- **Negative:** Next.js is heavy for what is currently a simple SPA.
