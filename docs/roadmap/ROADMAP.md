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

## v0.5.x — File Handling & Storage Surface

Goal: Introduce real file I/O with intentional weaknesses. Complete the file upload/download feature set.

### v0.5.0 — Real Multipart File Upload

- Multer integration for multipart/form-data
- Client-supplied filename used as disk filename (CWE-22 Path Traversal)
- Files written to `backend/uploads/` directory
- No filename sanitisation
- File metadata (mimetype, storagePath) stored in database
- POST /files reworked from JSON body to multipart

### v0.5.1 — File Download & Streaming

- GET /files/:id/download streams file from disk
- res.sendFile() with storagePath from database
- No ownership check on download (CWE-639 IDOR extended)
- No path validation before fs.read (CWE-22)
- Content-Type set from stored mimetype (client-controlled, CWE-434)

### v0.5.2 — MIME Type & Size Handling

- Client Content-Type header stored as mimetype (no magic-byte validation, CWE-434)
- File size tracked from Multer stats
- No upload size limit enforced (CWE-400 Uncontrolled Resource Consumption)
- FileResponse includes mimetype and size fields

### v0.5.3 — File Deletion & Cleanup

- DELETE /files/:id removes database record AND file from disk
- fs.unlink() on storagePath with no validation (CWE-22)
- No ownership check (CWE-639)
- Orphaned files if service throws after Multer write

### v0.5.4 — File Metadata & Descriptions

- Add description column to FileEntity via migration
- Metadata completeness: filename, mimetype, size, storagePath, description, uploadedAt
- Storage path (absolute filesystem path) exposed in API responses (CWE-200)

### v0.5.5 — File Handling Edge Cases

- Tests: multipart parsing, upload without auth (401), MIME confusion, path traversal attempts, oversized uploads, file streaming, IDOR on download, filesystem deletion, orphaned file edge cases
- Swagger bumped to v0.5.5
- File handling surface closed with 6 new CWEs (CWE-22, CWE-200, CWE-400, CWE-434)
- E2e tests: +12 new tests specifically for file operations

#### v0.5.x File Handling Surface Summary

The v0.5.x series introduces real file I/O via Multer, local filesystem storage, streaming downloads, filesystem deletion, and metadata persistence. Five new CWEs introduced across file operations (CWE-22 path traversal, CWE-200 path disclosure, CWE-400 no size limit, CWE-434 MIME confusion). All file operations lack ownership checks, carrying forward CWE-639. The surface is now closed with integrated file functionality.

## v0.6.x — Public Sharing & Expiry Surface

Goal: Introduce public, unauthenticated access and share lifecycle management.

### v0.6.0 — Public Share Token Generation

- publicToken field added to SharingEntity via migration
- When SharingEntity.public = true, generate token (sequential: "share-1", "share-2", etc.)
- Tokens trivially guessable (CWE-330 Predictable Identifiers)
- Token not validated to be unique before insertion

### v0.6.1 — Unauthenticated Public Access

- GET /sharing/public/:token endpoint (no JwtAuthGuard)
- Returns file download if token matches a SharingEntity.publicToken
- File retrieved via FilesService.download() using SharingEntity.fileId
- No ownership verification; any token grants access to associated file

### v0.6.2 — Share Expiry Enforcement

- expiresAt field on SharingEntity (ISO timestamp string, nullable)
- Check expiresAt on both GET /sharing/:id and GET /sharing/public/:token
- If expiresAt is in the past, enforce: deny access or 410 Gone (intentionally inconsistent)
- Expired shares may still return data before frontend checks expiry logic

### v0.6.3 — Share Revocation & Lifecycle

- PUT /sharing/:id allows toggling public flag and updating expiresAt
- DELETE /sharing/:id removes the share record (file remains in storage)
- Revoked shares are not trackable (no audit of removal timestamps)
- No notification to prior accessors that share was revoked

### v0.6.4 — Share Access Logging Basics

- Log (to stdout) when GET /sharing/public/:token is accessed
- Log includes token, fileId, timestamp
- Logged to console, not persisted (lost on restart)
- No rate limiting on token guessing

### v0.6.5 — Share Edge Cases

- Tests: create share with public:true, verify token generated, access via public token, test expiry checks, test revocation, test expired share access, test invalid token 404, test token reuse, test token collision
- Swagger bumped to v0.6.5
- Public sharing surface closed with 3 new CWEs (CWE-330 predictable tokens, CWE-613 no expiry enforcement, CWE-285 missing access control)
- SharingModule exports SharingService to allow FilesModule to call getFileForPublicShare() without circular dependency
- E2e tests: +8 new tests for public sharing

#### v0.6.x Public Sharing Surface Summary

The v0.6.x series introduces public, unauthenticated file access via predictable share tokens, token guessing attack surface, incomplete expiry enforcement, and share lifecycle management. Three new CWEs introduced (CWE-330 predictable tokens, CWE-613 no expiry enforcement, CWE-285 missing checks). The surface is now closed with full public sharing capability.


## v0.7.x — Advanced Admin Features

Goal: Build out administrative API surface with multi-level user management and system visibility.

### v0.7.0 — User Listing & Filtering (Admin)

- GET /admin/users (new endpoint, admin-only guard; not yet implemented in v0.4, placeholder)
- Returns all users with id, email, username, role, createdAt, updatedAt
- No pagination; unbounded list (table dump) — intentional CWE-400 extension
- No filtering or search; raw sequential scan
- Reveals all user emails and roles to any admin

### v0.7.1 — User Role Modification (Admin)

- PUT /admin/users/:id endpoint to update user.role
- Admin can change any user from 'user' to 'admin' and vice versa
- No audit trail; history of role changes not tracked
- No rate limiting on role change attempts
- Role change takes effect immediately; no confirmation or delay

### v0.7.2 — User Profile Updates (Admin)

- PUT /admin/users/:id also allows updating email, username, password
- Admin can reset any user's password without user consent
- No notification sent to user of changes
- Changes are effective immediately

### v0.7.3 — System Statistics & Dashboards

- GET /admin/stats returns: user count, file count, share count, storage usage estimate
- No auth guard checks (relies on JwtAuthGuard only; role not re-validated)
- Stats computed fresh on each request (no caching)
- Reveals infrastructure details: table sizes, storage paths

### v0.7.4 — Audit Trail Basics

- SQL logging (from v0.2.3) provides implicit audit of queries
- Add "admin action" logging: log role changes, user updates to stdout
- Logged data includes: admin user ID, action type, target user ID, old/new values
- Not persisted; lost on restart (CWE-532 log information leakage remains)

### v0.7.5 — Admin Surface Completeness

- Tests: admin user listing, role modification via admin endpoint, unauthorized role changes by non-admin (should fail), admin stats endpoint, audit log output verification
- Swagger bumped to v0.7.5
- Admin surface expanded with 2 new endpoints (/admin/users, /admin/stats)
- E2e tests: +6 new tests for admin operations
- CWE-862 (Missing Authorization) on admin endpoints is intentional in v0.7.x (guards added in v0.4.x but role not re-checked at endpoint level)

#### v0.7.x Admin Surface Summary

The v0.7.x series expands the admin surface with user listing, role modification, password reset, and system statistics endpoints. Administrative functionality is guarded by authentication but not re-validated against DB role state (CWE-639 extended). No audit persistence means admin abuse is not permanently tracked. The admin surface is now operationally complete.

## v0.8.x — App Polish & Refinement

Goal: Improve foundation, add input validation and pagination, standardize error handling before v1.0.0 freeze.

### v0.8.0 — Input Validation Pipeline

- Global ValidationPipe registered in main.ts
- Request DTO validation for all POST/PUT endpoints
- Whitelist enforcement: forbidNonWhitelisted = true
- Class validator decorators on all DTOs (@IsEmail, @IsString, @MinLength, etc.)
- Malformed requests now return 400 Bad Request with validation errors instead of 500

### v0.8.1 — Pagination & Limits

- Add skip/take query params to all list endpoints (/users, /files, /sharing, /admin/:resource)
- Default limit: 20 records, max limit: 100
- Offset-based pagination (not cursor-based)
- Unbounded list queries no longer possible (CWE-400 partially mitigated intentionally in v0.8, will be hardened in v2.0.0)
- E2e tests verify pagination works and defaults are applied

### v0.8.2 — Error Response Standardization

- All error responses follow format: `{ statusCode: number, message: string, errors?: object }`
- 404 Not Found responses include reason ("User not found" vs generic)
- 400 Bad Request includes validation error details
- 401 Unauthorized when token missing/invalid
- 403 Forbidden when role/ownership check fails (v0.4.x guards)
- No stack traces in HTTP responses; logged to stdout only

### v0.8.3 — Request/Response Logging

- Log all HTTP requests: method, path, status code, response time
- Log auth events: register, login, logout, token verify fail
- Log admin actions: role change, user delete, stats access
- Logging format: timestamp, level, event type, actor (userId), details
- Sensitive data redacted: passwords, tokens truncated

### v0.8.4 — Performance Baseline Testing

- Measure endpoint response times under load (100 concurrent requests)
- Identify slow queries (N+1 problems, missing indices)
- Baseline acceptable response times: auth <50ms, list <200ms, file download <500ms
- No optimization applied in v0.8; baseline captured for future hardening

### v0.8.5 — Frontend-Backend Alignment

- Regenerate OpenAPI spec and frontend types (types.gen.ts)
- Verify all endpoints reflected in frontend API wrappers (lib/api.ts)
- UI error handling updated to parse new error response format
- Form validation on frontend matches backend validators
- Swagger UI updated to v0.8.5

#### v0.8.x Refinement Surface Summary

The v0.8.x series adds input validation, pagination, error standardization, request logging, and performance instrumentation. No new vulnerabilities intentionally introduced; existing weaknesses (predictable IDs, IDOR, weak auth) remain. Foundation is now polished for v1.0.0 freeze.

## v0.9.x — Infrastructure Integration & MVP Freeze

Goal: Integrate Docker/compose deployment, lock down feature set, finalize documentation, prepare fully deployable v1.0.0 product.

### v0.9.0 — Feature Completeness & Docker Image Build

- Checklist: all FR requirements from SENG spec implemented
  - User registration/login/profile/logout: ✓
  - File upload/download/delete: ✓
  - File metadata (MIME, size, description): ✓
  - Share creation/deletion/expiry: ✓
  - Public share tokens: ✓
  - Role-based user levels (User/Admin/Moderator): ✓
  - Admin user management: ✓
- No more features added; feature surface frozen
- Create `backend/Dockerfile`: Node 20-alpine, COPY app, RUN npm ci, ENV NODE_ENV=production, EXPOSE 3000, CMD = node main.js (actual v0.9.0 version)
- Create `frontend/Dockerfile`: Node 20-alpine, COPY app, RUN npm ci, RUN npm run build, EXPOSE 3000, CMD = npm start
- Build images locally, test run: `docker run -e DATABASE_URL=... <image>`

### v0.9.1 — Docker Compose Orchestration

- Create `docker-compose.prod.yml` (differs from existing `infra/compose.yml`):
  - `postgres`: `postgres:16-alpine`, volumes for data persistence, `POSTGRES_DBNAME=kc_prod`
  - `backend`: built from `backend/Dockerfile`, depends_on: postgres, env: DATABASE_HOST=postgres, DATABASE_PORT=5432, DATABASE_NAME=kc_prod
  - `frontend`: built from `frontend/Dockerfile`, depends_on: backend, NEXT_PUBLIC_API_URL=http://backend:3000
  - `nginx` (reverse proxy): port 80 → frontend:3000, `/api` → backend:3000
- Add `.dockerignore` to both frontend and backend (node_modules, dist, build, .git)
- Test compose stack locally: `docker-compose -f docker-compose.prod.yml up`, verify frontend accessible at localhost

### v0.9.2 — VM Provisioning & Networking Setup

- Create Ubuntu VM setup script (`infra/vm-setup.sh`):
  - Install Docker, Docker Compose
  - Create `kc` user (non-root), add to docker group
  - Clone repo to `/opt/kc-project`
  - Set up environment files (DATABASE credentials, NEXT_PUBLIC_API_URL)
  - Configure firewall: allow 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Create `.env.production` template for secrets (DATABASE_PASSWORD, JWT_SECRET)
- Document: "Deploy to VM: `scp -r . user@vm:/opt/kc-project && ssh user@vm docker-compose -f /opt/kc-project/docker-compose.prod.yml up -d`"

### v0.9.3 — Infrastructure Testing & Reproducibility

- Test scenario: Fresh Ubuntu VM, run `vm-setup.sh`, deploy via docker-compose, register user, upload file, share file, download via public token
- Generate database migration on fresh container to verify TypeORM works in Docker
- Test failover: stop postgres, restart, verify data persists
- Test compose tear-down and re-up: no data loss
- Document: reproducible deployment checklist

### v0.9.4 — Documentation & API Surface Lock

- Update ARCHITECTURE.md to v0.9.0 (add deployment diagram, Docker + VM layers)
- Update data-model.md with final schema
- ADRs finalized (ADR-026-versioning-expansion-cycle complete)
- SENG spec reviewed and final
- Roadmap locked (v1.0.0 ready to proceed)
- API surface frozen (no new routes after v0.9.4)
- Request/response DTOs finalized
- Swagger UI locked at v0.9.4
- Backend versioning: Swagger reports v0.9.4
- All endpoint signatures frozen (no changes in v1.0.x)
- Deployment guide documented (docker-compose steps, VM provisioning, secrets management)

### v0.9.5 — Release Candidate & Smoke Tests

- Tag release candidate: v0.9.5-rc.1
- Smoke tests:
  - **Local dev:** Register → upload → share → download → admin ops
  - **Docker compose:** Spin up stack locally, run same journey
  - **VM deployment:** Deploy to test Ubuntu VM, run same journey
  - **Persistence:** Stop all containers, check `docker volume ls`, restart, verify data present
  - **API health:** `GET /health`, Swagger `/api/docs`, database connection verified
- Git history clean: all branches merged, no uncommitted changes
- Release notes drafted: what's new (6 surfaces: auth, files, sharing, admin, v0.9 infra), known issues (intentional CWEs), v1.0.0 readiness checklist
- Final merge: dev → main after RC approval, tag v1.0.0-dev (pre-release pointing to v0.9.5 commit)

#### v0.9.x Infrastructure Integration & MVP Freeze Summary

The v0.9.x series integrates Docker and docker-compose deployment infrastructure, freezes all features and APIs, locks documentation, and prepares the system as a fully deployable product ready for v1.0.0 release. v1.0.0 will be insecure, but production-ready: containerized, reproducibly deployable to VM, with persistent database, and comprehensive e2e test coverage. This is the first version that feels like a complete product, not just a prototype.

---

## v1.0.0 — Insecure MVP Baseline

Goal: Freeze a realistic, insecure reference system with ~15-18 documented CWEs across 5 attack surfaces.

### v1.0.0 Criteria

- ✅ Full functionality implemented: all 5 domains operational (users, auth, files, sharing, admin)
- ✅ File upload/download/delete fully working
- ✅ Public sharing with predictable tokens and missing expiry enforcement
- ✅ Multi-level RBAC (User/Admin/Moderator) introduced but not enforced server-side
- ✅ Admin UI and endpoints for user management
- ✅ PostgreSQL persistence layer complete
- ✅ ~15-18 intentional vulnerabilities documented with CWE + OWASP Top 10:2025 classification
- ✅ Architecture and threat model complete (SENG spec finalized)
- ✅ E2e test suite comprehensive (200+ tests)
- ✅ **Docker containerization:** Frontend, backend, database images; docker-compose orchestration
- ✅ **VM deployment ready:** Provisioning script, deployment guide, reproducible setup
- ✅ **Production-like deployment:** Runs on containers, persistent database, networked architecture
- ✅ Ready for v1.0.x penetration testing and v2.0.0 hardening

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
