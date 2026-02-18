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

### v0.1.0 — User Model Introduced

- `User` entity with sequential string IDs (CWE-330)
- `UsersService` with in-memory array store
- CRUD endpoints on `/users` (unprotected)

### v0.1.1 — Registration Endpoint

- `POST /auth/register` — create user + issue stub token
- Plaintext password storage (CWE-256)
- Leaky duplicate error includes email (CWE-209)
- Frontend auth page with Register tab, `AuthContext` + localStorage persistence

### v0.1.2 — Login Endpoint

- `POST /auth/login` — plaintext password comparison (CWE-256)
- Distinct error messages enable user enumeration (CWE-204)
- Frontend Sign In tab wired to auth context

### v0.1.3 — Session Concept

- Real JWTs (HS256, hardcoded `'kc-secret'`, no expiration) replace stub tokens
- `JwtAuthGuard` + `@CurrentUser()` decorator introduced
- `GET /auth/me` — first protected endpoint
- Frontend `getHeaders()` sends Bearer token automatically from localStorage
- Header displays authenticated username via `authMe()`
- CWE-615 tracked: frontend VULN comments visible in CSR bundle
- e2e tests for JWT format + `/auth/me` coverage
- Swagger bumped to 0.1.3

### v0.1.4 — Logout & Token Misuse

- `POST /auth/logout` behind `JwtAuthGuard` — intentionally does nothing server-side
- `AuthService.logout()` returns cosmetic success message, no deny-list / session table / revocation
- Frontend `authLogout()` called fire-and-forget from `AuthContext.logout()` before clearing localStorage
- Token replay proven: same JWT works on `GET /auth/me` after logout (CWE-613 e2e test)
- Comprehensive inline docs with CWE-613 | A07:2025 annotations on all touched files
- CWE-615 tracked: frontend VULN comments visible in browser bundle (CSR)
- 3 new e2e tests (401 no token, 201 with token, token replay after logout)
- Swagger bumped to 0.1.4
- Auth flow docs + diagrams updated with logout sequence and token replay sequence

### v0.1.5 — Authentication Edge Cases

- No rate limiting on auth endpoints (CWE-307) — unlimited login/register attempts, brute-force viable
- No account lockout after failed logins (CWE-307) — correct password works after any number of failures
- Weak password requirements (CWE-521) — no minimum length or complexity, `"a"` is a valid password
- No `class-validator` decorators or `ValidationPipe` on DTOs (CWE-20)
- User enumeration explicitly tested (CWE-204) — distinct errors reveal email registration status
- 4 new e2e tests (brute-force, no lockout, weak password, enumeration)
- All files bumped to v0.1.5, Swagger bumped to 0.1.5
- Auth flow docs + diagrams updated with enumeration and brute-force sequences
- **v0.1.x identity surface complete** — 18 CWE entries across v0.1.0–v0.1.5

## v0.2.x — Persistence & Database Surface

Goal: Make data persistent and mistakes permanent.

### v0.2.0 — Database Introduction (Local)

- PostgreSQL 16 via Docker Compose (`infra/compose.yml`, DB container only — app runs natively)
- TypeORM integration (`@nestjs/typeorm`) with `synchronize: true`, hardcoded credentials, SQL logging
- All 5 domain entities decorated and mapped to PostgreSQL tables (user, file_entity, sharing_entity, admin_item)
- All 5 services migrated from in-memory arrays to `Repository<Entity>` (fully async)
- All controllers and AuthService updated to async/await
- Stub seed data removed — database starts empty, populated via the app
- E2e tests updated for PG (truncate between tests, proper teardown)
- Unit tests updated for async mocks (mockResolvedValue)
- ADR-019 (TypeORM as ORM), ADR-020 (Docker for DB only, not app)
- CWEs introduced: CWE-798 (hardcoded DB credentials), CWE-1188 (synchronize: true), CWE-1393 (default PG password), CWE-532 (SQL logging)
- CWEs carried forward: CWE-256, CWE-330, CWE-204, CWE-209, CWE-307, CWE-347, CWE-521, CWE-613 — now persisted permanently
- Swagger bumped to 0.2.0

### v0.2.1 — Persisted Authentication 

- Credentials stored in DB — carried from v0.2.0 (plaintext in PostgreSQL, CWE-256)
- No hashing — carried from v0.2.0 (plaintext `===` comparison, no bcrypt/argon2/scrypt)
- Verbose DB errors: raw TypeORM `QueryFailedError` (PG table names, constraint names, SQL fragments) returned in 500 response body
- E2e test proving duplicate PK collision (`count + 1` after deletion) leaks raw PG error details
- CWE introduced: CWE-209 (verbose DB error messages exposing database internals to client)
- CWEs carried forward: all v0.2.0 CWEs (CWE-256, CWE-330, CWE-204, CWE-209, CWE-307, CWE-347, CWE-521, CWE-613, CWE-798, CWE-1188, CWE-1393, CWE-532)
- Swagger bumped to 0.2.1

### v0.2.2 — Identifier Trust Failures 

- JwtAuthGuard added to all 4 resource controllers (users, files, sharing, admin) — authentication enforced everywhere
- AuthModule exports JwtModule; resource modules import AuthModule for guard access
- `ownerId` column added to FileEntity and SharingEntity — populated from JWT on creation, **never checked** on read/update/delete
- ownerId wired into FileResponseDto and SharingResponseDto (exposed in API responses)
- No ownership verification on any endpoint — any authenticated user can access any resource by ID (IDOR)
- No role or privilege checks — regular users can access admin endpoints
- New IDOR e2e test file (`idor.e2e-spec.ts`): 4 tests proving cross-user file read, file delete, profile modification, and unauthenticated 401s
- CWEs introduced: CWE-639 (IDOR — authorization bypass via user-controlled key), CWE-862 (missing authorization)
- CWEs carried forward: all v0.2.1 CWEs (CWE-256, CWE-330, CWE-204, CWE-209, CWE-307, CWE-347, CWE-521, CWE-613, CWE-798, CWE-1188, CWE-1393, CWE-532)
- Swagger bumped to 0.2.2

### v0.2.3 — Enumeration Surface

- Added `GET /files` list-all endpoint (findAll) — full table dump to any authenticated user
- All 4 list endpoints (`GET /users`, `GET /files`, `GET /sharing`, `GET /admin`) are unbounded — no pagination, no limit, no ownership filter
- Swagger UI + JSON spec publicly accessible at `/api/docs` and `/api/docs-json` without authentication
- `X-Powered-By: Express` header reveals backend framework — intentionally not disabled
- 200 vs 404 existence oracle on single-resource endpoints with sequential IDs
- 6 new e2e tests in `enumeration.e2e-spec.ts` (ID probing, list dumps, Swagger spec, X-Powered-By, timing oracle)
- **OWASP Top 10:2025 Migration** (ADR-021): all `A0X:2021` references migrated to `A0X:2025` across ~38 files (~290 occurrences)
- CWEs introduced: CWE-200 (Exposure of Sensitive Information), CWE-203 (Observable Discrepancy), CWE-400 (Uncontrolled Resource Consumption)
- CWEs carried forward: all v0.2.2 CWEs (CWE-256, CWE-330, CWE-204, CWE-209, CWE-307, CWE-347, CWE-521, CWE-613, CWE-639, CWE-798, CWE-862, CWE-942, CWE-1188, CWE-1393, CWE-532)
- Swagger bumped to 0.2.3, `--runInBand` added to e2e runner for DB isolation
- Total e2e tests: 29, Total CWE entries: 28

### v0.2.4 — Error & Metadata Leakage

- Added `GET /admin/crash-test` endpoint — deliberate unhandled Error, demonstrates NestJS default exception handling
- VULN annotations for missing ValidationPipe (malformed input passes through unchecked)
- Expanded CWE-209 beyond DB errors to cover all runtime exceptions, TypeErrors, and NestJS 404 shape
- First use of A10:2025 (Mishandling of Exceptional Conditions)
- ADR-023: Error Handling Philosophy (insecure by design)
- 4 new e2e tests in `leakage.e2e-spec.ts` (crash-test 500, malformed body, NestJS 404 signature, SQL logging)
- CWE-209 expanded (runtime errors, malformed input), A10:2025 first use
- CWEs carried forward: all v0.2.3 CWEs
- Total e2e tests: 33, Total CWE entries: ~29

### v0.2.5 — Persistence Refactoring

- Replaced `synchronize: true` with explicit TypeORM migrations (ADR-022)
- Created `data-source.ts` for TypeORM CLI
- Generated InitialSchema migration (4 tables) and AddFileDescription migration (demo)
- Added `description` column to FileEntity via migration workflow
- `migrationsRun: true` auto-executes pending migrations on app start
- Migration scripts: `migration:generate`, `migration:run`, `migration:revert`
- CWE-1188 partially remediated (synchronize → migrations, but migrationsRun still auto-executes)
- E2e tests unaffected — `dataSource.synchronize(true)` still used for test isolation
- Swagger bumped to 0.2.5, persistence surface complete
- Total e2e tests: 33, Total CWE entries: ~29

#### v0.2.x Persistence Surface Summary

The v0.2.x series introduced PostgreSQL persistence, migrated all in-memory data to TypeORM repositories, and systematically expanded the attack surface across 6 versions: database introduction (v0.2.0), persisted authentication (v0.2.1), identifier trust failures / IDOR (v0.2.2), enumeration surface (v0.2.3), error and metadata leakage (v0.2.4), and persistence refactoring / migrations (v0.2.5). The surface is now closed with 29 CWEs, 33 e2e tests, and all OWASP references migrated to Top 10:2025.

## v0.3.x — File Handling Surface

Goal: Introduce high-risk file functionality with real filesystem I/O.

### v0.3.0 — File Upload (Real Multipart)

- `@types/multer` installed, Multer `diskStorage` configured to write to `./uploads/`
- `POST /files` reworked from JSON body to multipart via `FileInterceptor`
- Client-supplied `originalname` used as disk filename with no sanitisation (CWE-22)
- Client-supplied `Content-Type` stored as `mimetype` with no magic-byte validation (CWE-434)
- No `limits.fileSize` on Multer -- unbounded upload size (CWE-400)
- `mimetype` and `storagePath` columns added to `file_entity` via TypeORM migration
- `storagePath` (absolute filesystem path) exposed in API responses (CWE-200)
- ADR-024: File Storage Strategy
- CWEs introduced: CWE-22 (Path Traversal), CWE-434 (Unrestricted Upload), CWE-400 (No Size Limit)

### v0.3.1 — File Metadata

- `storagePath` exposed in `FileResponseDto` -- server directory structure visible to any authenticated user
- `mimetype` exposed in responses -- client-controlled, no validation
- CWE-200 expanded (file system path disclosure)
- CWEs carried forward: all v0.2.5 + v0.3.0 CWEs

### v0.3.2 — File Download

- `GET /files/:id/download` streams file from `storagePath` on disk
- No ownership check -- any authenticated user can download any file (CWE-639)
- No path validation on `storagePath` before `res.sendFile()` (CWE-22)
- `Content-Type` set from stored `mimetype` (client-controlled, CWE-434)
- `Content-Disposition` includes original filename

### v0.3.3 — File Deletion (Filesystem)

- `DELETE /files/:id` now also removes file from disk via `fs.unlink(storagePath)`
- No ownership check before deletion (CWE-639)
- No path validation before `unlink` -- if `storagePath` points outside `uploads/`, that file gets deleted (CWE-22)
- Orphaned files remain on disk if service layer throws after Multer writes

### v0.3.4 — Public File Sharing

- `publicToken` column added to `SharingEntity` via TypeORM migration
- When share created with `public: true`, generates sequential token (`"share-1"`, `"share-2"`) -- trivially guessable (CWE-330)
- `GET /sharing/public/:token` -- unauthenticated endpoint, anyone with a valid token can download shared file (CWE-285)
- `expiresAt` stored but never checked -- expired shares remain accessible (CWE-613)
- `FilesModule` exports `FilesService`; `SharingModule` imports `FilesModule` for file streaming
- `SharingController` moved from class-level `@UseGuards(JwtAuthGuard)` to per-method guards (public endpoint is unauthenticated)
- CWEs introduced: CWE-330 (Predictable Share Tokens), CWE-613 (No Expiry Enforcement), CWE-285 (Missing Access Control)

### v0.3.5 — File Handling Edge Cases

- New `files.e2e-spec.ts` with 12 tests covering: multipart upload, upload without auth, MIME confusion (CWE-434), path traversal (CWE-22), oversized upload (CWE-400), file download, IDOR on download (CWE-639), filesystem deletion, public share token access (CWE-285/CWE-330), expired share access (CWE-613), invalid token 404
- Updated `idor.e2e-spec.ts`, `enumeration.e2e-spec.ts`, `leakage.e2e-spec.ts` to use multipart uploads (JSON body to `POST /files` no longer works)
- Swagger bumped to 0.3.5, file handling surface complete
- Total e2e tests: 44, Total CWE entries: ~35

#### v0.3.x File Handling Surface Summary

The v0.3.x series introduced real file I/O: multipart uploads via Multer, local filesystem storage, streaming downloads, filesystem deletion, and public sharing via predictable tokens. Six new CWEs were introduced across the file handling surface (CWE-22, CWE-200, CWE-285, CWE-330, CWE-400, CWE-434) plus CWE-613 on sharing expiry. All file operations lack ownership checks, carrying forward CWE-639 from v0.2.2. The surface is now closed with ~35 CWEs, 44 e2e tests, and ADR-024 documenting the storage strategy.

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
