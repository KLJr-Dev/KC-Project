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

Canonical numbering from [STRATEGY.md](STRATEGY.md) (ADR-027). See also [ADR-027](../decisions/ADR-027-strategy-canonical-roadmap.md).

- v0.0.x — Project foundation, shape, and contracts (complete)
- v0.1.x — Identity & authentication surface (complete)
- v0.2.x — Persistence & database surface (complete)
- v0.3.x — File handling & public sharing surface (complete)
- v0.4.x — Authorization & administrative surface (complete)
- v0.5.x — Foundation refinement: validation, pagination, errors, logging
- v0.6.x — Admin polish: audit DB, search, stats
- v0.7.x — Docker + compose + nginx deployment
- v0.8.x — API/docs lock, test hardening
- v0.9.x — MVP freeze, release candidate, smoke tests

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

### v0.2.4 — Error & Metadata Leakage ✅

- Added `GET /admin/crash-test` endpoint — deliberate unhandled Error, demonstrates NestJS default exception handling
- VULN annotations for missing ValidationPipe (malformed input passes through unchecked)
- Expanded CWE-209 beyond DB errors to cover all runtime exceptions, TypeErrors, and NestJS 404 shape
- First use of A10:2025 (Mishandling of Exceptional Conditions)
- ADR-023: Error Handling Philosophy (insecure by design)
- 4 new e2e tests in `leakage.e2e-spec.ts` (crash-test 500, malformed body, NestJS 404 signature, SQL logging)
- CWE-209 expanded (runtime errors, malformed input), A10:2025 first use
- CWEs carried forward: all v0.2.3 CWEs
- Total e2e tests: 33, Total CWE entries: ~29

### v0.2.5 — Persistence Refactoring ✅

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

Goal: Introduce privilege boundaries and intentionally break them (v0.4.0–v0.4.2 binary, v0.4.3–v0.4.5 ternary with role confusion).

### v0.4.0 — Roles Introduced (Binary: User / Admin)

- `role` enum column added to `User` entity (`'user'` | `'admin'`, default `'user'`)
- All existing users default to `'user'` role
- `@Column({ type: 'enum', enum: ['user', 'admin'], default: 'user' })` with TypeORM migration `AddRoleToUser`
- Role persisted to PostgreSQL, immutable at creation (can only be changed by admin in v0.4.1+)
- `role` added to `JwtPayload` interface — included in JWT at login/register
- `role` exposed in API responses: `UserResponseDto`, `GET /auth/me`, `POST /auth/login` (CWE-639)
- **Frontend:** Role displayed in header next to username; Admin link conditionally shown (client-side check only, bypassable)
- **Frontend:** `/admin` page with client-side `isAdmin` guard (redirects to `/` if not admin, but guard is bypassable via localStorage modification)
- **Backend:** No server-side authorization guards yet — all endpoints still reachable by any authenticated user
- JwtAuthGuard remains the only guard; role claim trusted without re-validation (CWE-639 Client-Controlled Authorization)
- 3 new e2e tests: verify role in JWT payload, verify role in `/auth/me` response, verify role in login response
- Swagger bumped to v0.4.0
- CWEs introduced: CWE-639 (Client-Controlled Authorization), CWE-862 (Missing Authorization)
- CWEs carried forward: all v0.3.5 CWEs (CWE-256, CWE-330, CWE-204, CWE-209, CWE-307, CWE-347, CWE-521, CWE-613, CWE-639, CWE-798, CWE-862, CWE-942, CWE-1188, CWE-1393, CWE-532, CWE-22, CWE-200, CWE-285, CWE-400, CWE-434)
- ADR-025 created: RBAC Strategy (progressive multi-role system)
- **Total e2e tests:** 47 (44 existing + 3 new role tests)

### v0.4.1 — Admin Endpoints & Weak Guards ✅ COMPLETE

- `HasRole()` guard decorator created (checks JWT role claim, not database state)
- `@UseGuards(JwtAuthGuard, HasRole('admin'))` applied to new admin endpoints
- `GET /admin/users` — list all users with id, email, username, role, createdAt, updatedAt (no pagination, unbounded table dump, CWE-400)
- `PUT /admin/users/:id/role` — change any user's role from 'user' to 'admin' (no audit, no confirmation, CWE-862)
- Both endpoints guarded by `HasRole('admin')` but trust JWT role claim without re-checking database (CWE-639)
- No rate limiting on role modification
- Any user with `role: 'admin'` in their JWT (generated at login from database, but could be forged if JWT secret is compromised) can call these endpoints
- AdminUserList and RoleModifier components built on frontend; admin dashboard fully functional
- Frontend auth-context now correctly parses `role` claim from JWT payload for accurate authorization context
- 8 new e2e tests: admin user list, role modification, unauthorized attempts by non-admin (should fail), verify changes reflected in `GET /auth/me`, plus additional coverage for role parsing and admin UI
- Swagger bumped to v0.4.1
- CWE-862 expanded (incomplete authorization on admin endpoints)
- **Status:** All endpoints implemented, tested, and merged into dev. Admin dashboard verified working with manual role changes. Ready for v0.4.2.
- **Total e2e tests:** 55 (47 from v0.4.0 + 8 new admin/RBAC tests)

### v0.4.2 — Mixed Trust Boundaries & IDOR ✅ COMPLETE

**Scope:**
- Demonstrate JWT role claim forgery vulnerability (CWE-639) with proof-of-concept
- Introduce IDOR-like patterns in admin endpoints
- Frontend continues hiding `/admin` link via `isAdmin` context flag (client-side only, bypassable)
- Backend still trusts JWT role claim directly

**Backend implementation:**
- Created `backend/test/rbac.e2e-spec.ts` with 6 comprehensive JWT forgery tests
- Tests demonstrate that forged JWT with `role: 'admin'` claim (using hardcoded 'kc-secret') successfully calls admin endpoints
- Proof that HasRole guard trusts JWT without server-side DB re-validation (CWE-639 attack vector)
- No new endpoints required; vulnerability demonstrated through existing admin infrastructure
- HasRole guard and admin endpoints include CWE-639/CWE-862 documentation comments

**Frontend implementation:**
- Enhanced documentation in `auth-context.tsx` explaining JWT role claim forgery attack
- Enhanced documentation in `admin/page.tsx` explaining how client-side protection is bypassable
- No new code features; client-side role check remains unchanged (intentionally vulnerable)
- Documentation clearly shows that localStorage modification + JWT secret knowledge = unauthorized admin access

**E2e test coverage:**
- Test suite `rbac.e2e-spec.ts` with 6 tests (1 more than planned):
  1. ✅ Forge JWT with `role: 'admin'` claim and verify admin endpoint access succeeds (CWE-639 PoC)
  2. ✅ Verify invalid/malformed JWT rejected at JwtAuthGuard level
  3. ✅ Admin role change persists across login sessions
  4. ✅ PUT /admin/users/:id/role trusts forged JWT (CWE-639 + CWE-862)
  5. ✅ Invalid role value rejected by HasRole guard
  6. ✅ Admin can modify ANY user role (IDOR-like pattern demonstration)

**Status:** All endpoints working as designed. CWE-639 and CWE-862 fully exploitable and documented. Backend and frontend merged. Ready for production v0.4.2 release.

**Metrics:**
- Swagger version: v0.4.2
- Total e2e tests: 61 (55 from v0.4.1 + 6 new RBAC/JWT forgery tests)
- CWEs demonstrated: CWE-639 (Client-Controlled Authorization), CWE-862 (Missing Authorization)
- All 8 test suites passing (100%)

### v0.4.3 — Ternary Role System (User / Moderator / Admin) ✅ COMPLETE

- `role` enum expanded: `'user'` | `'moderator'` | `'admin'`
- Add `moderator` as a new role with ambiguous permissions:
  - Moderators can approve/reject user uploads (new concept introduced)
  - Admins can do everything moderators can do (vertical escalation path)
  - Ambiguity: Is `moderator` "above" or "below" `admin`? For which operations?
- Frontend: Role selector in admin page allows changing user role to user/moderator/admin
- Backend: `HasRole()` guard expanded to accept array `HasRole(['admin', 'moderator'])`
- New endpoint `PUT /files/:id/approve` — approve or reject uploaded files (accessible to moderator/admin)
- Weak implementation: `HasRole(['admin', 'moderator'])` trusts JWT role, not database state (CWE-639 extended)
- Endpoint accidentally allows users to call it if they forge JWT with `role: 'moderator'`
- Role hierarchy ambiguity: no explicit constants defining role rankings (CWE-841 Improper Restriction of Rendered UI Layers or Frames)
- 7 new e2e tests in `files-approval.e2e-spec.ts`: moderator creation, file approval endpoint, role escalation attempts, role hierarchy confusion
- Swagger bumped to v0.4.3
- CWE-841 (Role Hierarchy Ambiguity) introduced
- **Status:** Ternary role system implemented, file approval endpoint working, frontend role selector updated. Ready for v0.4.4.
- **Total e2e tests:** 68 (61 from v0.4.2 + 7 new file approval/ternary role tests)

### v0.4.4 — Privilege Escalation & Cross-User Escalation ✅ COMPLETE

- Introduce endpoint `PUT /admin/users/:id/role/escalate` — allows moderator to escalate other users to moderator (not admin)
- Moderator cannot promote to admin (guard rejects), but can create more moderators (horizontal escalation)
- No audit trail of who made role changes or when
- New endpoint `GET /admin/audit-logs` — returns list of role changes (placeholder, returns empty, no actual logging in v0.4.4)
- E2e test: moderator escalates user A to moderator, user A uses new moderator role to escalate user B, chain reaction (CWE-269 Improper Access Control)
- No rate limiting on escalation attempts (brute-force cascade attacks possible)
- 7 new e2e tests in `escalation.e2e-spec.ts`: cross-user escalation, escalation chains, unauthorized escalation, audit log endpoint
- Swagger bumped to v0.4.4
- CWE-269 (Improper Access Control) introduced
- **Status:** Escalation chains demonstrated and tested. Audit logs placeholder returns empty array. Ready for v0.4.5.
- **Total e2e tests:** 75 (68 from v0.4.3 + 7 new escalation tests)

### v0.4.5 — RBAC Complexity & Inconsistent Enforcement ✅ COMPLETE

- Some endpoints use `HasRole('admin')` (single role check)
- Some use `HasRole(['admin', 'moderator'])` (multiple role check)
- Some endpoints have role checks; others have only `JwtAuthGuard` (inconsistent enforcement)
- New endpoint `DELETE /admin/users/:id` — only guarded by `JwtAuthGuard`, not by `HasRole('admin')` (authorization missing, CWE-862)
- User can delete any other user if they can authenticate (no role required)
- Admin endpoints scattered across controllers (no centralized admin module yet, causing missed guards)
- Documentation inconsistent: some endpoints document role requirements, others don't
- 9 new e2e tests in `inconsistency.e2e-spec.ts`: missing guard on delete endpoint, implicit admin-only endpoints, UI/API inconsistency, enforcement gaps
- Swagger bumped to v0.4.5
- CWE-862 expanded (multiple endpoints with missing authorization checks)
- **Status:** Authorization inconsistency demonstrated. DELETE endpoint intentionally missing HasRole guard. Ready for v0.4.6.
- **Total e2e tests:** 84 (75 from v0.4.4 + 9 new inconsistency tests)

### v0.4.6 — Documentation Update ✅ COMPLETE

- `v0.4.x-summary.md` retrospective written
- ROADMAP v0.4.0–v0.4.6 marked complete with metrics
- Swagger bumped to v0.4.6 in `main.ts`
- `data-model.md` updated for ternary roles and `approvalStatus`
- `types.gen.ts` regenerated; JwtPayload and auth-context role unions fixed
- `docs/roadmap/README.md` and `docs/README.md` index updated
- Root README current status updated
- **v0.4.x authorization surface complete**

#### v0.4.x Authorization & Administrative Surface Summary

See [v0.4.x-summary.md](v0.4.x-summary.md) for the full retrospective: versions, CWEs, test coverage, schema changes, and transition notes.

## v0.5.x — Foundation Refinement

Goal: Input validation, pagination, error standardization, and request logging before admin polish and Docker. See [STRATEGY.md](STRATEGY.md) Part 2.

> **Note:** v0.5.1 frontend form alignment shipped early on `dev` (STRATEGY listed this as v0.5.5). Patch numbers below follow implementation order.

### v0.5.0 — Input Validation Pipeline ✅ (on `dev`)

- Global ValidationPipe + class-validator on all DTOs
- ValidationExceptionFilter for field-level 400 responses
- CWE-20, CWE-1025, CWE-521 intentional weak patterns
- `validation.e2e-spec.ts`

### v0.5.1 — Frontend Form Alignment ✅ (on `dev`)

- `ValidationError` class in `lib/api.ts`
- Auth and users forms mirror backend constraints
- OpenAPI spec regenerated

### v0.5.2 — Pagination ✅

- `PaginationQueryDto` (`skip`, `take`; default 20, max 100)
- Applied to `GET /users`, `/files`, `/sharing`, `/admin/users`
- CWE-400 (no rate limit), CWE-205 (offset oracle)

### v0.5.3 — Error Standardization ✅

- Global exception filter: unified `{ statusCode, message, timestamp }` for 401/403/404
- No stack traces in HTTP responses (CWE-209)

### v0.5.4 — Request Logging ✅

- HTTP interceptor: method, path, status, duration, userId
- Auth and admin events to stdout (CWE-532)

### v0.5.5 — Closure ✅

- Performance baseline documented
- Swagger 0.5.5; see [v0.5.x-summary.md](v0.5.x-summary.md)

#### v0.5.x Summary

See [v0.5.x-summary.md](v0.5.x-summary.md).

---

> **Superseded — File Handling (old v0.5.x):** Shipped in [v0.3.x](v0.3.x-summary.md). Do not re-implement.

---

## v0.6.x — Admin Polish

Goal: Persistent audit logs, user search, system statistics. See STRATEGY Part 2.

> **Superseded — Public Sharing (old v0.6.x):** Shipped in [v0.3.4](v0.3.x-summary.md).

### v0.6.0 — Persistent Audit Logging ✅

- `AuditLog` entity + migration
- Wire role change, escalate, delete, file approve
- `GET /admin/audit-logs` returns DB rows (CWE-532, CWE-284)

### v0.6.1 — User Search & Filter ✅

- `GET /admin/users?search=&role=` with pagination
- CWE-200, CWE-203 enumeration vectors

### v0.6.2 — System Statistics ✅

- `GET /admin/stats` — counts and storage estimate (CWE-200, CWE-682)

### v0.6.3 — Health Endpoint ✅

- `GET /health` public version probe (CWE-200)

### v0.6.4–v0.6.5 — Admin UI & E2E

- Admin dashboard: audit viewer, stats, search
- See [v0.6.x-summary.md](v0.6.x-summary.md)

---

> **Superseded — Advanced Admin (old v0.7.x):** Core admin shipped in [v0.4.x](v0.4.x-summary.md). v0.6.x adds audit/stats/search only.

---

## v0.7.x — Docker Deployment

Goal: Mandatory containerised deployment path per STRATEGY Part 3.

### v0.7.0 — Dockerfiles

- `backend/Dockerfile`, `frontend/Dockerfile`, `.dockerignore`
- CWE-798 hardcoded defaults in compose templates

### v0.7.1 — Docker Compose Production Stack

- `infra/docker-compose.prod.yml`: postgres, backend, frontend, nginx
- Persistent volumes: `pgdata`, `uploads`

### v0.7.2 — VM Provisioning

- `infra/vm-setup.sh`, `infra/.env.example`

### v0.7.3 — Smoke Tests in Compose

- Full user journey inside compose only
- See [v0.7.x-summary.md](v0.7.x-summary.md)

---

## v0.8.x — API Lock & Test Hardening

Goal: Freeze API surface, green e2e in Docker, pentest methodology draft.

### v0.8.0 — Route Freeze

- No new endpoints after v0.8.0
- ARCHITECTURE.md updated

### v0.8.1 — Security Methodology

- [docs/security/README.md](../security/README.md) pentest draft
- CWE inventory consolidated

### v0.8.2–v0.8.5 — Test & Doc Lock

- Full e2e green in Docker environment
- See [v0.8.x-summary.md](v0.8.x-summary.md)

---

> **Superseded — App Polish (old v0.8.x validation/pagination):** Moved to v0.5.x per STRATEGY.


## v0.9.x — MVP Freeze & Release Candidate

Goal: Feature checklist vs requirements, Docker verification (v0.7 stack), API lock, RC tag before v1.0.0. Docker build lives in [v0.7.x](#v07x--docker-deployment); v0.9 validates it.

### v0.9.0 — Feature Completeness Checklist

- Verify all FR/NFR from [requirements.md](../spec/requirements.md) against implemented surface
- No new features; surface frozen after v0.8 route lock

### v0.9.1 — Docker Reproducibility Verification

- Fresh VM + `docker compose -f infra/docker-compose.prod.yml up`
- Full journey: register → upload → share → public download → admin role change → audit log
- Persistence across `compose down` / `up`

### v0.9.2 — Documentation Final Pass

- ARCHITECTURE.md, data-model.md, deployment guide aligned to v0.9
- Swagger locked at v0.9.x

### v0.9.3–v0.9.4 — E2E & API Lock Confirmation

- Full e2e green in Docker CI-local run
- Endpoint signatures unchanged from v0.8 freeze

### v0.9.5 — Release Candidate

- Tag `v0.9.5-rc.1` on `main`
- Smoke tests: local dev + Docker compose + VM deployment
- Release notes draft for v1.0.0 (CWE inventory, known weaknesses)
- See [v0.9.x-summary.md](v0.9.x-summary.md)

#### v0.9.x MVP Freeze Summary

v0.9.x confirms the v0.7 Docker stack, locks documentation and API, and produces an RC for v1.0.0 pentest-ready tagging.

---

## v1.0.0 — Insecure MVP Baseline (Pentest-Ready Tag)

Goal: Tag the v0.9.5 RC as the first pentest-ready insecure baseline per [STRATEGY.md](STRATEGY.md). **60–80 documented CWEs** across all surfaces; mandatory Docker deployment.

### v1.0.0 Criteria

- [ ] Full functionality: auth, files, sharing, admin (v0.0–v0.4 complete; v0.5–v0.6 refinement complete)
- [ ] v0.5.x: ValidationPipe, pagination, error shape, request logging
- [ ] v0.6.x: Persistent audit logs, admin search, stats, health endpoint
- [ ] **Docker mandatory:** `infra/docker-compose.prod.yml` stack (v0.7.x)
- [ ] **VM deployment:** `infra/vm-setup.sh`, reproducible smoke journey in compose
- [ ] **60–80 intentional CWEs** inventoried with OWASP Top 10:2025 mapping
- [ ] Architecture, threat model, pentest methodology docs complete
- [ ] Full e2e suite green in Docker environment
- [ ] API/Swagger frozen at v0.9.x; no new routes in v1.0.0
- [ ] Ready for v1.0.x penetration testing and v2.0.0 hardening

### Version characteristics

- **Intentional weaknesses frozen** (no fixes until v2.0.0)
- **All attack surfaces open and documented**
- **Docker + Docker Compose:** Fully containerized (frontend, backend, database)
- **VM-deployable:** Reproducible setup script, deployment guide, persistent storage
- **Web app complete:** Fully featured, realistic, and exploitable
- **Production-ready architecture:** Reverse proxy, environment-based config, persistent volumes

This version is the first insecure baseline **and the first production-like deployment**. It enters the expansion cycle: pentest (v1.0.x), harden (v2.0.0), then fork and expand (v1.1.0).

## v1.0.x — Penetration Testing & Incremental Patching

Goal: Discover and document all v1.0.0 weaknesses through structured testing; apply minimal patches as bugs are identified.

- Execute penetration testing against v1.0.0 baseline
- Document findings with CWE + CVSS + proof-of-concept
- Apply patches for critical bugs (e.g., RCE) but leave exploitable weaknesses intact
- Each v1.0.x minor release includes incremental patches + updated threat model
- Versions: v1.0.1, v1.0.2, v1.0.3, ...

## v2.0.0 — Hardened Parallel Release

Goal: Implement all security controls and remediate all v1.0.0 weaknesses while preserving architecture and functionality.

### v2.0.0 Scope (mapped to v1.0.0 remediations)

**App Security:**
- Password hashing: bcrypt cost 12+ (replace plaintext comparison)
- Token lifecycle: expiry (20min access, 7-day refresh), revocation (replace hardcoded secret + no expiry)
- Authorization enforcement: server-side ownership checks on all resource access (replace IDOR)
- RBAC: role re-validation against database state, not JWT payload (replace client-controlled role)
- Input validation: sanitisation of file paths, filenames, user input (replace CWE-22)
- MIME validation: accept list enforcement, reject client-supplied MIME types (replace CWE-434)
- Upload size limits: enforced per-file and per-user quotas (replace CWE-400)
- Pagination & limits: enforced on all list endpoints (replace unbounded list dumps)
- Error handling: generic error messages, no sensitive data in responses (replace info disclosure)
- Authentication rate limiting: brute-force protection on login/register
- Logging/auditing: persist audit events to database, redact sensitive data

**Infrastructure (inherited from v0.9.x / v1.0.0):**
- Docker Compose remains unchanged (same images, same networking)
- Persistent database with backups (new automated backup job)
- Environment-based configuration maintained

### v2.0.0 Characteristics

- All v1.0.0 CWEs remediated
- Feature parity with v1.0.0 (same API surface, same business logic)
- Same Docker + VM deployment model as v1.0.0
- Intent: "what a secure application version looks like" (ops still minimal)
- Ready for comparison to v1.0.x findings
- Not production-hardened (see v2.1.0 for ops hardening)

## v1.1.0 — New Insecure Surface (Forked from v2.0.0)

Goal: Fork v2.0.0, add ~10 new CWEs in client-side and advanced attack surfaces.

- Based on v2.0.0 codebase (all v1.0.0 CWEs fixed)
- Introduce ~10 new vulnerabilities: XSS (template injection), CSRF (no tokens), SSRF, insecure deserialization, etc.
- Full functionality and Docker + VM infrastructure preserved
- Ready for v1.1.x pentest cycle

## v1.1.x — Pentest + Patch v1.1.0

- Execute penetration testing against v1.1.0, discover new vulnerabilities
- Document findings, apply minimal patches to critical bugs only
- Leave exploitable v1.1.0 weaknesses intact (for v2.2.0 hardening)

## v2.1.0 — Infrastructure + Ops Hardening

Goal: Production-grade infrastructure and operational security hardening (applied to v2.0.0 codebase).

**TLS & Networking:**
- Nginx reverse proxy with TLS termination (self-signed or Let's Encrypt)
- HSTS, CSP, X-Frame-Options security headers
- Deny direct access to backend; route through Nginx only

**Secrets Management:**
- Remove hardcoded credentials from docker-compose
- Use `.env` files with .gitignore protection (local dev)
- Document secrets rotation for production (e.g., AWS Secrets Manager pattern)
- Backend reads JWT_SECRET from environment, not hardcoded

**Container Hardening:**
- Non-root user in all Dockerfiles (RUN useradd -m app, USER app)
- Read-only filesystems where possible (--read-only flag)
- Minimal base images (alpine, not ubuntu)
- Health checks on all containers (HEALTHCHECK instruction)
- Resource limits (memory, CPU) in docker-compose

**Logging Aggregation:**
- Centralized logging: logs to stdout + ELK/Datadog (or local file mount)
- Redact sensitive data from logs (no passwords, tokens, emails)
- Log retention policy (90 days, then archive)

**VM Hardening:**
- System updates and patches (apt update && apt upgrade -y)
- SSH key-only auth (disable password login, disable root login)
- Firewall: UFW with explicit allow rules (22, 80, 443 only)
- Monitoring: basic uptime checks, disk space alerts
- Automated backups of database volumes

**Documentation:**
- Deployment runbook: how to provision and harden a new VM
- Secrets management policy: where secrets live, how they're rotated
- Incident response: what to do if a container crashes or logs suspicious activity
- Update process: how to deploy v2.1.1 patches without downtime

### v2.1.0 Characteristics

- Inherits all v2.0.0 app hardening (all v1.0.0 CWEs fixed)
- Production-grade infrastructure (TLS, secrets, hardened containers, monitoring)
- Intent: "what a secure and production-ready system looks like"
- Deployment cost higher (TLS cert, monitoring, monitoring logs)
- Ready to be the reference deployment

## v2.2.0 — Hardened Parallel Release (v1.1.0 CWEs)

Goal: Remediate all v1.1.0 vulnerabilities (the new 10 CWEs introduced in v1.1.0).

- Based on v2.1.0 codebase (v1.0.0 CWEs fixed + ops hardened)
- Fix all v1.1.0 CWEs (XSS, CSRF, SSRF, etc.)
- Infrastructure from v2.1.0 maintained (TLS, secrets hardening, monitoring, etc.)
- Feature parity with all prior versions

## Post-v2.2.0 — Perpetual Expansion Cycle

After v2.2.0, the project continues the expansion loop (see [ADR-013](../decisions/ADR-013-expansion-cycle-versioning.md)):

```
v1.2.0 (fork v2.2.0, add ~10 new CWEs: race conditions, cache poisoning, algorithm confusion)
  → v1.2.x (pentest + patch v1.2.0)
  → v2.3.0 (secure parallel, fix all v1.2.0 CWEs)
  → v1.3.0 (fork v2.3.0, add ~10 new CWEs: supply chain, CI/CD, cloud misconfigs)
  → v1.3.x (pentest + patch v1.3.0)
  → v2.4.0 (secure parallel, fix all v1.3.0 CWEs)
  → ...repeat indefinitely
```




### What the expansion cycle introduces

Each v1.N.0 introduces a new attack surface with ~10 new CWEs:

- **v1.1.0:** Client-side rendering vulnerabilities (XSS via template injection, CSRF token bypass), unvalidated redirects (CWE-918 SSRF), insecure deserialization (CWE-502)
- **v1.2.0:** Race conditions in file operations (CWE-362 concurrent access), cache poisoning on public shares, JWT algorithm confusion (CWE-327 allow "none")
- **v1.3.0 (speculative):** Supply chain attacks (malicious npm package injection), CI/CD exploitation (exposed secrets in logs), cloud misconfigurations (S3 bucket ACLs)
- **v1.4.0 (speculative):** Cryptographic failures (weak ciphers, improper key rotation), unsafe compression (compression oracle attacks), side-channel attacks
- **v1.5.0+ (speculative):** Advanced privilege escalation, object injection, business logic flaws, protocol implementation bugs, resource exhaustion attacks

Each v1.N.0 is designed as a valid, deployable system that happens to contain this attack surface. After each v1.N.x pentest cycle, v2.N.0 remediates all v1.N.0 CWEs (and inherits hardening from v2.N-1.0 or v2.N-1.1 codebase).

### Explicitly out of scope for all versions

- External identity providers (OAuth, SAML, OIDC)
- Compliance certifications (SOC 2, ISO 27001, PCI)
- Performance tuning and scalability engineering
- Mobile clients

See [scope.md](../spec/scope.md) for the full in-scope / out-of-scope breakdown.
