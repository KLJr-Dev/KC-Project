# KC-Project Roadmap

This document defines the official development roadmap for KC-Project.

KC-Project is a long-term software engineering and web security project focused on
designing, implementing, exploiting, and securing a modern web application.

The roadmap prioritises:

- incremental delivery
- architectural realism
- security surface growth
- traceability across versions
- learning through controlled failure

This roadmap is intentionally fine-grained.
Having many small versions is preferred over skipping complexity.

## Versioning Philosophy

KC-Project follows semantic-style incremental versioning, where minor versions represent the introduction of new architectural or security surfaces, and patch versions represent iteration, refinement, and mistake-making within that surface.

## Version Semantics

- v0.0.x — Project foundation, shape, and contracts
- v0.1.x — Identity & authentication surface
- v0.2.x — Persistence & database surface
- v0.3.x — File handling surface
- v0.4.x — Authorization & administrative surface
- v0.5.x — Deployment & containerisation surface
- v1.0.0 — Fully deployed intentionally vulnerable baseline

## Stability Rule

Every version must:

- run locally or in its defined environment
- represent a coherent system state
- be testable and explorable

No version is considered "partial".

## v0.0.x — Foundation & System Shape

Goal: Establish ownership, intent, and system structure without committing to behaviour.

### v0.0.1 — Repository Skeleton

- Organisation-owned repository
- Root README
- /docs directory
- No application code

### v0.0.2 — Roadmap & Scope Definition

- ROADMAP.md
- In-scope vs out-of-scope definition
- v1.0.0 success criteria
- Security philosophy documented

### v0.0.3 — Backend Bootstrapping

- NestJS scaffold
- Module structure
- Application boots locally
- Default placeholder controller only
- No domain endpoints

### v0.0.4 — Frontend Bootstrapping

- Next.js scaffold (App Router)
- Base layout and routing
- Static placeholder pages
- No backend dependency

### v0.0.5 — Backend Reachability Test

Purpose: verify that the frontend can reach the backend process

- Single trivial backend endpoint (e.g. /ping)
- Endpoint returns static response
- Frontend performs a simple fetch request
- No domain logic
- No shared DTOs
- No authentication assumptions

This version validates process connectivity only, not application behaviour.

### v0.0.6 — Backend API Shape Definition

Purpose: define backend contracts without frontend pressure

- Controllers stubbed for:
  - users
  - auth
  - files
- Route paths defined
- DTOs defined (request/response shapes)
- Services return mock or placeholder data
- No persistence
- No frontend ↔ backend dependency

This version freezes API shape, not behaviour.

### v0.0.7 — Frontend ↔ Backend Contract Integration

Purpose: align frontend with backend contracts

- Frontend updated to call real backend routes
- DTOs mirrored client-side
- Hardcoded or mocked responses still allowed
- No authentication enforcement
- Errors and edge cases visible

This is the first meaningful full-stack interaction.

### v0.0.8 — Development Tooling Baseline

- ESLint and Prettier configured
- TypeScript strictness agreed
- Consistent formatting enforced
- OpenAPI/Swagger spec generated from backend (via @nestjs/swagger)
- Frontend types auto-generated from OpenAPI spec (replaces manual DTO mirroring from v0.0.7)
- No CI/CD pipelines yet

This version stabilises collaboration before complexity increases.

## v0.1.x — Identity & Authentication Surface

Goal: Introduce identity with minimal security guarantees.

### v0.1.0 — User Model Introduced

- User entity defined
- IDs exposed
- No persistence yet

### v0.1.1 — Registration Endpoint

- User creation
- Minimal validation
- Duplicate handling weak

### v0.1.2 — Login Endpoint

- Login logic added
- Plaintext or weakly handled passwords

### v0.1.3 — Session Concept

- Sessions or JWT introduced
- Tokens stored client-side
- No expiration enforcement

### v0.1.4 — Logout & Token Misuse

- Logout endpoint exists
- Tokens remain reusable
- Session invalidation incomplete

### v0.1.5 — Authentication Edge Cases

- Error-based enumeration
- Distinct error messages
- Missing rate limits

## v0.2.x — Persistence & Database Surface

Goal: Make data persistent and mistakes permanent.

### v0.2.0 — Database Introduction (Local)

- Local PostgreSQL (or equivalent)
- User table created
- Unsafe defaults

### v0.2.1 — Persisted Authentication

- Credentials stored in DB
- Weak hashing or none
- Verbose DB errors

### v0.2.2 — Identifier Trust Failures

- Client-supplied IDs trusted
- Ownership checks missing

### v0.2.3 — Enumeration Surface

- Sequential IDs
- Predictable queries
- User discovery possible

### v0.2.4 — Error & Metadata Leakage

- Stack traces returned
- SQL errors exposed

### v0.2.5 — Persistence Refactoring

- Schema changes
- Migrations introduced
- Backwards compatibility issues

## v0.3.x — File Handling Surface

Goal: Introduce high-risk file functionality.

### v0.3.0 — File Upload

- Upload endpoint
- Local filesystem storage
- Filenames partially trusted

### v0.3.1 — File Metadata

- File records in DB
- Weak ownership links

### v0.3.2 — File Download

- Direct file access
- ID-based retrieval
- No access checks

### v0.3.3 — File Deletion

- Delete endpoint
- IDOR vulnerabilities

### v0.3.4 — Public File Sharing

- Public links
- No expiry
- Predictable identifiers

### v0.3.5 — File Handling Edge Cases

- MIME confusion
- Path traversal potential
- Oversized uploads

## v0.4.x — Authorization & Administrative Surface

Goal: Introduce privilege boundaries and break them.

### v0.4.0 — Roles Introduced

- User/Admin roles
- Role stored in DB
- Minimal enforcement

### v0.4.1 — Admin Endpoints

- User listing
- Role modification
- Weak guards

### v0.4.2 — Mixed Trust Boundaries

- Frontend hides admin UI
- Backend trusts client role claims

### v0.4.3 — Privilege Escalation Paths

- Role confusion
- Missing checks

### v0.4.4 — Cross-User Access

- Admin endpoints callable by users
- IDOR across roles

### v0.4.5 — RBAC Complexity Growth

- Additional permissions
- Inconsistent enforcement

## v0.5.x — Containerisation & Deployment Surface

Goal: Introduce deployment realism without fixing bugs.

### v0.5.0 — Docker Introduction

- Dockerfiles for frontend/backend
- docker-compose
- Same vulnerabilities

### v0.5.1 — Environment Variables

- Secrets in .env
- Weak separation between environments

### v0.5.2 — Service Networking

- Container-to-container networking
- Port exposure

### v0.5.3 — Volume & Persistence

- DB volumes
- File persistence across restarts

### v0.5.4 — Docker Misconfigurations

- Overprivileged containers
- Default users
- Excessive capabilities

## v0.6.x — Runtime, Configuration & Observability Surface

Goal: Make the system feel like a real target.

### v0.6.0 — VM Deployment

- Ubuntu VM
- Dockerised system running

### v0.6.1 — Network Exposure

- Public ports
- Internal assumptions broken

### v0.6.2 — Logging & Debugging

- Verbose logs
- Sensitive data logged

### v0.6.3 — Configuration Drift

- Inconsistent configs
- Manual changes

### v0.6.4 — Operational Fragility

- Restart issues
- Crash loops
- Partial outages

## v1.0.0 — Intentionally Vulnerable Baseline

Goal: Freeze a realistic, insecure reference system.

### v1.0.0 Criteria

- Full functionality implemented
- Deployed on Ubuntu VM
- Containerised frontend, backend, database
- Vulnerabilities documented and reproducible
- Ready for structured penetration testing

This version is the control baseline and is never hardened.

## Post v1.0.0 (Explicitly Out of Scope)

- Security hardening (v2.x)
- External identity providers
- WAF / IDS / SIEM
- Performance tuning
- Scalability engineering
- Compliance certifications
