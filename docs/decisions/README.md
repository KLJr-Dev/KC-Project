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

## Adding a New ADR

Create a file named `ADR-NNN-short-title.md` with the next available number. Use the standard sections: Status, Context, Decision, Consequences.
