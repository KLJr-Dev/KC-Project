# Architecture Decision Records (ADRs)

This directory contains ADRs documenting key technical decisions made during KC-Project development.

Each ADR follows a standard format: **Status**, **Context**, **Decision**, **Consequences**.

## Index

| ADR | Title | Status | Version |
|-----|-------|--------|---------|
| [001](ADR-001-nestjs-backend.md) | NestJS as backend framework | Accepted | v0.0.3 |
| [002](ADR-002-nextjs-frontend.md) | Next.js App Router as frontend | Accepted | v0.0.4 |
| [003](ADR-003-rest-over-trpc.md) | REST over tRPC | Accepted | v0.0.5 |
| [004](ADR-004-dto-mirroring-to-codegen.md) | DTO mirroring then codegen | Accepted | v0.0.7→v0.0.8 |
| [005](ADR-005-typescript-strict-mode.md) | TypeScript strict mode | Accepted | v0.0.8 |
| [006](ADR-006-insecure-by-design.md) | Insecure-by-design philosophy | Accepted | v0.0.2 |
| [007](ADR-007-five-domain-split.md) | Five-domain module split | Accepted | v0.0.6 |
| [008](ADR-008-in-memory-before-persistence.md) | In-memory storage before persistence | Accepted | v0.0.6 |
| [009](ADR-009-localstorage-auth-state.md) | localStorage for client-side auth state | Accepted | v0.1.1 |
| [010](ADR-010-tailwind-css.md) | Tailwind CSS as design system | Accepted | v0.0.4 |
| [011](ADR-011-client-side-rendering.md) | Client-side rendering only (intentionally insecure) | Accepted | v0.0.4 |
| [012](ADR-012-jwt-over-sessions.md) | JWT over server-side sessions | Accepted | v0.1.3 |
| [013](ADR-013-expansion-cycle-versioning.md) | Perpetual expansion cycle versioning | Accepted | v0.1.x |
| [014](ADR-014-github-vcs.md) | GitHub as VCS platform | Accepted | v0.0.1 |
| [015](ADR-015-branching-strategy.md) | Branching strategy | Accepted | v0.0.1 |
| [016](ADR-016-monorepo.md) | Monorepo structure | Accepted | v0.0.1 |
| [017](ADR-017-no-cicd-yet.md) | No CI/CD yet (deferred) | Accepted | v0.0.8 |
| [018](ADR-018-swagger-cli-plugin.md) | Swagger CLI plugin over manual decorators | Accepted | v0.0.8 |

## Adding a New ADR

Create a file named `ADR-NNN-short-title.md` with the next available number. Use the standard sections: Status, Context, Decision, Consequences.
