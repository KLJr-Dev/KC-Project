# Documentation

This directory contains engineering and technical documentation for KC-Project.

---

## Contents

### [architecture/](architecture/)

System architecture overview — how the frontend, backend, and API layer connect, module structure, technology stack, type flow, and trust boundaries.

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — Full architecture document
- [auth-flow.md](architecture/auth-flow.md) — v0.1.x authentication flows, sequence diagrams, and security surface

### [decisions/](decisions/)

Architecture Decision Records (ADRs). Each ADR documents a specific technical decision with context, rationale, and consequences.

- [ADR-001](decisions/ADR-001-nestjs-backend.md) — NestJS as backend framework
- [ADR-002](decisions/ADR-002-nextjs-frontend.md) — Next.js App Router as frontend framework
- [ADR-003](decisions/ADR-003-rest-over-trpc.md) — REST over tRPC for API communication
- [ADR-004](decisions/ADR-004-dto-mirroring-to-codegen.md) — Manual DTO mirroring then OpenAPI codegen
- [ADR-005](decisions/ADR-005-typescript-strict-mode.md) — TypeScript strict mode on both projects
- [ADR-006](decisions/ADR-006-insecure-by-design.md) — Intentionally insecure design philosophy
- [ADR-007](decisions/ADR-007-five-domain-split.md) — Five-domain module split

### [roadmap/](roadmap/)

Version-by-version development plan.

- [ROADMAP.md](roadmap/ROADMAP.md) — Full project roadmap (v0.0.x through v1.0.0)
- [v0.0.x-summary.md](roadmap/v0.0.x-summary.md) — Foundation phase retrospective

---

## Documentation Philosophy

Documentation is treated as a **living artefact**. It evolves alongside the codebase and is versioned with it. New ADRs are added as decisions are made; the architecture document is updated as the system grows.
