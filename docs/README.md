# Documentation

This directory contains engineering and technical documentation for KC-Project.

---

## Contents

### [spec/](spec/)

Formal project specification -- what the system is, what it must do, who uses it, and what "secure" looks like.

- [scope.md](spec/scope.md) -- System type, core functionality, in-scope, out-of-scope
- [requirements.md](spec/requirements.md) -- Functional, non-functional, and security requirements
- [personas.md](spec/personas.md) -- Stakeholders and in-app user personas
- [security-baseline.md](spec/security-baseline.md) -- v2.0.0 target security controls

### [architecture/](architecture/)

System architecture, data model, authentication flows, and threat categorisation.

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) -- Full architecture document (current state)
- [auth-flow.md](architecture/auth-flow.md) -- v0.1.x authentication flows, sequence diagrams, and security surface
- [data-model.md](architecture/data-model.md) -- Entity definitions, ERD, and intentional data layer weaknesses
- [stride.md](architecture/stride.md) -- STRIDE threat model mapped to 6 attack surfaces

### [decisions/](decisions/)

Architecture Decision Records (ADRs). Each ADR documents a specific technical decision with context, rationale, and consequences.

- [ADR-001](decisions/ADR-001-nestjs-backend.md) -- NestJS as backend framework
- [ADR-002](decisions/ADR-002-nextjs-frontend.md) -- Next.js App Router as frontend framework
- [ADR-003](decisions/ADR-003-rest-over-trpc.md) -- REST over tRPC for API communication
- [ADR-004](decisions/ADR-004-dto-mirroring-to-codegen.md) -- Manual DTO mirroring then OpenAPI codegen
- [ADR-005](decisions/ADR-005-typescript-strict-mode.md) -- TypeScript strict mode on both projects
- [ADR-006](decisions/ADR-006-insecure-by-design.md) -- Intentionally insecure design philosophy
- [ADR-007](decisions/ADR-007-five-domain-split.md) -- Five-domain module split
- [ADR-008](decisions/ADR-008-in-memory-before-persistence.md) -- In-memory storage before persistence
- [ADR-009](decisions/ADR-009-localstorage-auth-state.md) -- localStorage for client-side auth state
- [ADR-010](decisions/ADR-010-tailwind-css.md) -- Tailwind CSS as design system
- [ADR-011](decisions/ADR-011-client-side-rendering.md) -- Client-side rendering only (intentionally insecure)
- [ADR-012](decisions/ADR-012-jwt-over-sessions.md) -- JWT over server-side sessions
- [ADR-013](decisions/ADR-013-expansion-cycle-versioning.md) -- Perpetual expansion cycle versioning
- [ADR-014](decisions/ADR-014-github-vcs.md) -- GitHub as VCS platform
- [ADR-015](decisions/ADR-015-branching-strategy.md) -- Branching strategy
- [ADR-016](decisions/ADR-016-monorepo.md) -- Monorepo structure
- [ADR-017](decisions/ADR-017-no-cicd-yet.md) -- No CI/CD yet (deferred)
- [ADR-018](decisions/ADR-018-swagger-cli-plugin.md) -- Swagger CLI plugin over manual decorators

### [diagrams/](diagrams/)

Canonical standalone diagrams covering the full project lifecycle -- current state, v1.0.0 insecure MVP, and v2.0.0 hardened parallel. All weaknesses dual-classified with CWE + OWASP Top 10.

- [system-architecture.md](diagrams/system-architecture.md) -- System topology across lifecycle stages
- [auth-flow.md](diagrams/auth-flow.md) -- Authentication flows with security annotations
- [threat-model.md](diagrams/threat-model.md) -- v1.0.0 attack surface map and v2.0.0 remediation map
- [infrastructure.md](diagrams/infrastructure.md) -- Deployment topology (docker-compose, nginx, networking)
- [version-timeline.md](diagrams/version-timeline.md) -- Development progression and expansion cycle

### [roadmap/](roadmap/)

Version-by-version development plan.

- [ROADMAP.md](roadmap/ROADMAP.md) -- Full project roadmap (v0.0.x through v1.0.0)
- [v0.0.x-summary.md](roadmap/v0.0.x-summary.md) -- Foundation phase retrospective

### [security/](security/)

Security testing methodology, tools, and findings. **Deferred** until closer to v1.0.0.

### [glossary.md](glossary.md)

Quick reference for security, architecture, and project terminology used across the documentation.

---

## Documentation Philosophy

Documentation is treated as a **living artefact**. It evolves alongside the codebase and is versioned with it. New ADRs are added as decisions are made; architecture and spec documents are updated as the system grows.
