# ADR-001: NestJS as Backend Framework

**Status:** Accepted

**Date:** v0.0.3 (Backend Bootstrapping)

---

## Context

KC-Project needs a backend framework that:

- Supports modular, enterprise-style architecture
- Has first-class TypeScript support
- Provides dependency injection, decorators, and clear separation of concerns
- Is realistic enough to represent how production backends are structured
- Has a mature ecosystem for later additions (auth guards, validation pipes, Swagger)

Alternatives considered:

- **Express (raw)** — Too low-level. No opinions on structure, DI, or module boundaries. Would require assembling everything from scratch.
- **FastAPI (Python)** — Excellent API design (auto-generated docs, type hints, async). Rejected because the project targets a TypeScript full-stack — using Python would split the language across frontend and backend, losing the shared-type benefits and adding cognitive overhead.

## Decision

Use **NestJS** (built on Express) as the backend framework.

NestJS provides opinionated architecture (modules, controllers, services, DTOs), built-in DI, decorator-based routing, and first-class integration with Swagger, class-validator, TypeORM/Prisma, and Passport. This mirrors how real enterprise Node.js backends are structured.

## Consequences

- **Positive:** Realistic module boundaries, DI, and decorator patterns transfer directly to production skills.
- **Positive:** `@nestjs/swagger` CLI plugin auto-generates OpenAPI specs from DTO classes without manual annotations.
- **Positive:** Guards, pipes, interceptors provide natural extension points for auth and validation in later versions.
- **Negative:** Heavier than needed for a stub API. Boilerplate is noticeable at v0.0.x scale.
- **Negative:** NestJS abstractions (decorators, DI) have a learning curve.
