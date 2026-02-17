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

### Build Phase (v0.x)

- v0.0.x — Project foundation, shape, and contracts
- v0.1.x — Identity & authentication surface
- v0.2.x — Persistence & database surface
- v0.3.x — File handling surface
- v0.4.x — Authorization & administrative surface
- v0.5.x — Deployment & containerisation surface
- v0.6.x — Runtime, configuration & observability surface

### Expansion Cycle (v1.x / v2.x)

- v1.0.0 — Insecure MVP (~15 CWEs across 6 attack surfaces)
- v1.0.x — Structured pentesting, discovery, incremental patches
- v2.0.0 — Secure parallel to v1.0.0 (all CWEs remediated)
- v1.1.0 — Fork v2.0.0, introduce ~10 new CWEs (next insecure iteration)
- v1.1.x — Pentest cycle for v1.1.0
- v2.1.0 — Secure parallel to v1.1.0
- ...repeat indefinitely

See [ADR-013](../decisions/ADR-013-expansion-cycle-versioning.md) and [version-timeline.md](../diagrams/version-timeline.md) for the full expansion cycle model.

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

### v0.1.0 — User Model Introduced ✅

- `User` entity with sequential string IDs (CWE-330)
- `UsersService` with in-memory array store
- CRUD endpoints on `/users` (unprotected)

### v0.1.1 — Registration Endpoint ✅

- `POST /auth/register` — create user + issue stub token
- Plaintext password storage (CWE-256)
- Leaky duplicate error includes email (CWE-209)
- Frontend auth page with Register tab, `AuthContext` + localStorage persistence

### v0.1.2 — Login Endpoint ✅

- `POST /auth/login` — plaintext password comparison (CWE-256)
- Distinct error messages enable user enumeration (CWE-204)
- Frontend Sign In tab wired to auth context

### v0.1.3 — Session Concept ✅

- Real JWTs (HS256, hardcoded `'kc-secret'`, no expiration) replace stub tokens
- `JwtAuthGuard` + `@CurrentUser()` decorator introduced
- `GET /auth/me` — first protected endpoint
- Frontend `getHeaders()` sends Bearer token automatically from localStorage
- Header displays authenticated username via `authMe()`
- CWE-615 tracked: frontend VULN comments visible in CSR bundle
- e2e tests for JWT format + `/auth/me` coverage
- Swagger bumped to 0.1.3

### v0.1.4 — Logout & Token Misuse ✅

- `POST /auth/logout` behind `JwtAuthGuard` — intentionally does nothing server-side
- `AuthService.logout()` returns cosmetic success message, no deny-list / session table / revocation
- Frontend `authLogout()` called fire-and-forget from `AuthContext.logout()` before clearing localStorage
- Token replay proven: same JWT works on `GET /auth/me` after logout (CWE-613 e2e test)
- Comprehensive inline docs with CWE-613 | A07:2021 annotations on all touched files
- CWE-615 tracked: frontend VULN comments visible in browser bundle (CSR)
- 3 new e2e tests (401 no token, 201 with token, token replay after logout)
- Swagger bumped to 0.1.4
- Auth flow docs + diagrams updated with logout sequence and token replay sequence

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

## v1.0.0 — Insecure MVP

Goal: Freeze a realistic, insecure reference system with ~15 documented CWEs across 6 attack surfaces.

### v1.0.0 Criteria

- Full functionality implemented (all 5 domains operational)
- Deployed on Ubuntu VM
- Containerised frontend, backend, database
- ~15 intentional vulnerabilities documented with CWE + OWASP Top 10 classification
- Ready for structured penetration testing

This version is the first insecure baseline. It enters the expansion cycle: pentest (v1.0.x), harden (v2.0.0), then fork and expand (v1.1.0).

## Post v1.0.0 — Expansion Cycle

After v1.0.0, the project follows a perpetual insecure/secure loop (see [ADR-013](../decisions/ADR-013-expansion-cycle-versioning.md)):

```
v1.0.0 (insecure MVP)
  → v1.0.x (pentest + patch)
  → v2.0.0 (secure parallel — all v1.0.0 CWEs remediated)
  → v1.1.0 (fork v2.0.0, add ~10 new CWEs)
  → v1.1.x (pentest + patch)
  → v2.1.0 (secure parallel)
  → ...repeat
```

### What the expansion cycle introduces

Each new v1.N.0 adds vulnerability surfaces not present in the previous cycle:

- **v1.1.0 (speculative):** XSS (CWE-79), CSRF (CWE-352), SSRF (CWE-918), insecure deserialization (CWE-502)
- **v1.2.0 (speculative):** Race conditions (CWE-362), cache poisoning (CWE-349), JWT algorithm confusion (CWE-327)
- **v1.3.0 (speculative):** Supply chain attacks, CI/CD exploitation, cloud misconfigurations

### Explicitly out of scope for all versions

- External identity providers (OAuth, SAML, OIDC)
- Compliance certifications (SOC 2, ISO 27001, PCI)
- Performance tuning and scalability engineering
- Mobile clients

See [scope.md](../spec/scope.md) for the full in-scope / out-of-scope breakdown.
