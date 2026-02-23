# Security Control Baseline

Target security controls for v2.0.0 -- the "done" checklist for a hardening cycle. Every v1.N.x pentest works toward satisfying these controls. When all controls are implemented and verified, the version qualifies as v2.N.0.

This document defines **what "secure" looks like** for KC-Project. Each control references the CWE it remediates and the v1.0.0 weakness it replaces.

---

## Current State (v0.4.x): Authorization Vulnerabilities

As of v0.4.5, the authorization surface contains the following **intentional** vulnerabilities for testing and learning:

| Vulnerability | CWE | Introduced | Details | Remediation (v2.0.0) |
|---------------|-----|-----------|---------|----------------------|
| JWT role trusted without DB re-validation | CWE-639 | v0.4.0 | `HasRoleGuard` extracts role from JWT, never checks database `users.role` | Load user from DB on every protected request; compare DB role, not JWT claim |
| Client-controlled authorization via forged JWT | CWE-639 | v0.4.2 | Weak hardcoded secret `'kc-secret'` allows attacker to forge admin JWT | Upgrade to RS256 (asymmetric); disable HS256 |
| Role hierarchy undefined (ternary ambiguity) | CWE-841 | v0.4.3 | Three roles (user/moderator/admin) with no explicit ranking or constants | Define `const ROLE_RANK = { user: 1, moderator: 2, admin: 3 }` and enforce rank checks |
| Privilege escalation via role delegation | CWE-269 | v0.4.4 | Moderators can promote users to moderator indefinitely; cascading chains possible | Restrict escalation to admins only; implement depth limit on promotion chains |
| Missing authorization on DELETE endpoint | CWE-862 | v0.4.5 | `DELETE /admin/users/:id` only has `JwtAuthGuard`, missing `@HasRole('admin')` | Add `@HasRole('admin')` to all admin endpoints; add test coverage for guard presence |
| No audit trail for authorization changes | CWE-532 | v0.4.4 | Role changes logged to stdout only; lost on restart | Implement `AuditLog` entity with timestamp, actor, action, target, and result; emit events on role changes |
| Inconsistent authorization checks | CWE-862 | v0.4.5 | Some endpoints guarded, others not; developer oversight | Enforce guard consistency via linting rules; audit all endpoints for guard presence |

---

## Authentication Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| Strong password hashing | bcrypt with cost factor 12+ | CWE-256 (plaintext/weak storage) |
| Asymmetric token signing | RS256 (private key signs, public key verifies) | CWE-347 (weak symmetric secret), CWE-639 (forged JWTs) |
| Short-lived access tokens | 15-minute TTL on access JWTs | CWE-613 (no expiration) |
| Refresh token rotation | New refresh token on each use, old one invalidated | CWE-613 (token replay) |
| Server-side token tracking | `refresh_tokens` table in database, deleted on logout | CWE-613 (no revocation) |
| Generic error messages | All auth failures return "Authentication failed" | CWE-204 (user enumeration) |
| Password strength validation | Minimum length, complexity requirements | CWE-521 (weak passwords) |

## Session Management Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| httpOnly refresh cookie | `Set-Cookie: httpOnly; secure; sameSite=strict` | CWE-922 (localStorage XSS exposure) |
| Access token in memory only | Short-lived token held in JavaScript variable, not persisted | CWE-922 (persistent storage) |
| Session revocation on logout | Delete all refresh tokens for user from database | CWE-613 (cosmetic logout) |
| Idle timeout | Refresh token expires after 7 days of inactivity | CWE-613 (infinite sessions) |

## Authorisation Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| Server-side RBAC | Role read from database `users.role` column, never from JWT claim | CWE-639 (Client-Controlled Authorization) |
| Guards on every protected route | `@UseGuards(JwtAuthGuard, HasRoleGuard)` on all non-public endpoints + `@HasRole()` on restricted routes | CWE-862 (Missing Authorization) |
| Ownership validation on resources | `WHERE id = $1 AND owner_id = $2` on every data access query | CWE-639 (IDOR, Improper Access Control) |
| Explicit role hierarchy | Constants defining rank: `ADMIN=3 > MODERATOR=2 > USER=1`; enforce in guards | CWE-841 (Role Hierarchy Ambiguity) |
| Least privilege enforcement | Guards check `role >= required` before proceeding | CWE-269 (Privilege Escalation) |
| Admin endpoint protection | All `/admin` routes require `admin` role explicitly (not moderator), return 403 for non-admin | CWE-639 (cross-role access), CWE-269 (escalation) |
| Role escalation controls | Only admins can change roles; rate limit role changes; require confirmation for escalation | CWE-269 (Privilege Escalation) |
| Audit trail for authorization | `AuditLog` table tracks all role changes, approvals, deletions with actor/timestamp | CWE-532 (Insufficient Logging) |

## Input Validation Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| Parameterised queries | TypeORM/Knex with query parameters, zero string concatenation | CWE-89 (SQL injection) |
| Input length limits | Maximum lengths on all text fields (email, username, password, filenames) | CWE-20 (improper input validation) |
| Email format validation | Server-side regex + uniqueness check | CWE-20 (improper input validation) |
| Generic error responses | Global exception filter strips stack traces and SQL details | CWE-209 (error information leakage) |

## File Handling Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| MIME type validation | Validate via file magic bytes (file header), not client Content-Type | CWE-434 (MIME confusion) |
| Path canonicalisation | `path.resolve()` + verify result starts with base upload directory | CWE-22 (path traversal) |
| Upload size limits | Multer `limits: { fileSize: 10 * 1024 * 1024 }` (10 MB) | CWE-400 (resource exhaustion) |
| File ownership checks | `files.owner_id = currentUser.id` on read, download, and delete | CWE-639 (IDOR on files) |
| Filename sanitisation | Strip path separators, special characters, and null bytes from uploaded filenames | CWE-22 (path injection via filename) |

## Transport Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| TLS termination | nginx terminates TLS 1.3 on port 443 | CWE-319 (plaintext transport) |
| HSTS header | `Strict-Transport-Security: max-age=31536000; includeSubDomains` | CWE-319 (protocol downgrade) |
| Secure cookies | `secure` flag on all cookies (only sent over HTTPS) | CWE-614 (sensitive cookie without secure flag) |
| No plaintext ports | Only port 443 exposed externally. No HTTP (80), no direct backend/DB ports | CWE-319 (plaintext transport) |

## Infrastructure Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| Non-root containers | `USER 1001:1001` in Dockerfiles, `user:` in docker-compose | CWE-250 (running as root) |
| Read-only filesystems | `read_only: true` in docker-compose (except explicit volume mounts) | CWE-732 (incorrect permissions) |
| Docker secrets | `POSTGRES_PASSWORD_FILE=/run/secrets/db_password` instead of env vars | CWE-798 (hardcoded credentials) |
| Internal Docker network | `networks: internal` with `internal: true` (no external gateway) for DB | CWE-668 (exposed services) |
| Resource limits | `deploy.resources.limits` for CPU and memory per container | CWE-770 (resource exhaustion) |
| Health checks | Liveness probes on all services | Operational resilience |
| Minimal base images | Alpine-based images, no unnecessary packages | CWE-1104 (unmaintained components) |

## Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | `default-src 'self'` | Prevent XSS via inline scripts and external resources |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unnecessary browser APIs |

All headers set by nginx (not the application) to ensure consistent enforcement.

## Logging and Monitoring Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| Structured logging | Pino or Winston with JSON output | CWE-778 (insufficient logging) |
| Sensitive field redaction | Password, token, and credential fields stripped from logs | CWE-532 (sensitive data in logs) |
| Auth event audit trail | Log all login attempts (success/failure), registrations, logouts, role changes | CWE-778 (insufficient logging), CWE-532 (missing audit) |
| Request ID correlation | Unique ID per request, propagated through all log entries | Debugging and incident response |



| Control | Implementation | Remediates |
|---------|---------------|------------|
| Strong password hashing | bcrypt with cost factor 12+ | CWE-256 (plaintext/weak storage) |
| Asymmetric token signing | RS256 (private key signs, public key verifies) | CWE-347 (weak symmetric secret) |
| Short-lived access tokens | 15-minute TTL on access JWTs | CWE-613 (no expiration) |
| Refresh token rotation | New refresh token on each use, old one invalidated | CWE-613 (token replay) |
| Server-side token tracking | `refresh_tokens` table in database, deleted on logout | CWE-613 (no revocation) |
| Generic error messages | All auth failures return "Authentication failed" | CWE-204 (user enumeration) |
| Password strength validation | Minimum length, complexity requirements | CWE-521 (weak passwords) |

## Session Management Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| httpOnly refresh cookie | `Set-Cookie: httpOnly; secure; sameSite=strict` | CWE-922 (localStorage XSS exposure) |
| Access token in memory only | Short-lived token held in JavaScript variable, not persisted | CWE-922 (persistent storage) |
| Session revocation on logout | Delete all refresh tokens for user from database | CWE-613 (cosmetic logout) |
| Idle timeout | Refresh token expires after 7 days of inactivity | CWE-613 (infinite sessions) |

## Authorisation Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| Server-side RBAC | Role read from database `users.role` column, never from client | CWE-285 (client role claims) |
| Guards on every protected route | `@UseGuards(JwtAuthGuard, RolesGuard)` on all non-public endpoints | CWE-602 (frontend-only guards) |
| Ownership validation on resources | `WHERE id = $1 AND owner_id = $2` on every data access query | CWE-639 (IDOR) |
| Least privilege enforcement | Guards check `role >= required` before proceeding | CWE-269 (privilege escalation) |
| Admin endpoint protection | All `/admin` routes require `admin` role, return 403 for regular users | CWE-639 (cross-role access) |

## Input Validation Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| Parameterised queries | TypeORM/Knex with query parameters, zero string concatenation | CWE-89 (SQL injection) |
| Input length limits | Maximum lengths on all text fields (email, username, password, filenames) | CWE-20 (improper input validation) |
| Email format validation | Server-side regex + uniqueness check | CWE-20 (improper input validation) |
| Generic error responses | Global exception filter strips stack traces and SQL details | CWE-209 (error information leakage) |

## File Handling Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| MIME type validation | Validate via file magic bytes (file header), not client Content-Type | CWE-434 (MIME confusion) |
| Path canonicalisation | `path.resolve()` + verify result starts with base upload directory | CWE-22 (path traversal) |
| Upload size limits | Multer `limits: { fileSize: 10 * 1024 * 1024 }` (10 MB) | CWE-400 (resource exhaustion) |
| File ownership checks | `files.owner_id = currentUser.id` on read, download, and delete | CWE-639 (IDOR on files) |
| Filename sanitisation | Strip path separators, special characters, and null bytes from uploaded filenames | CWE-22 (path injection via filename) |

## Transport Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| TLS termination | nginx terminates TLS 1.3 on port 443 | CWE-319 (plaintext transport) |
| HSTS header | `Strict-Transport-Security: max-age=31536000; includeSubDomains` | CWE-319 (protocol downgrade) |
| Secure cookies | `secure` flag on all cookies (only sent over HTTPS) | CWE-614 (sensitive cookie without secure flag) |
| No plaintext ports | Only port 443 exposed externally. No HTTP (80), no direct backend/DB ports | CWE-319 (plaintext transport) |

## Infrastructure Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| Non-root containers | `USER 1001:1001` in Dockerfiles, `user:` in docker-compose | CWE-250 (running as root) |
| Read-only filesystems | `read_only: true` in docker-compose (except explicit volume mounts) | CWE-732 (incorrect permissions) |
| Docker secrets | `POSTGRES_PASSWORD_FILE=/run/secrets/db_password` instead of env vars | CWE-798 (hardcoded credentials) |
| Internal Docker network | `networks: internal` with `internal: true` (no external gateway) for DB | CWE-668 (exposed services) |
| Resource limits | `deploy.resources.limits` for CPU and memory per container | CWE-770 (resource exhaustion) |
| Health checks | Liveness probes on all services | Operational resilience |
| Minimal base images | Alpine-based images, no unnecessary packages | CWE-1104 (unmaintained components) |

## Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | `default-src 'self'` | Prevent XSS via inline scripts and external resources |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unnecessary browser APIs |

All headers set by nginx (not the application) to ensure consistent enforcement.

## Logging and Monitoring Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| Structured logging | Pino or Winston with JSON output | CWE-778 (insufficient logging) |
| Sensitive field redaction | Password, token, and credential fields stripped from logs | CWE-532 (sensitive data in logs) |
| Auth event audit trail | Log all login attempts (success/failure), registrations, logouts, role changes | CWE-778 (insufficient logging) |
| Request ID correlation | Unique ID per request, propagated through all log entries | Debugging and incident response |

## Rate Limiting Controls

| Control | Implementation | Remediates |
|---------|---------------|------------|
| Auth endpoint rate limiting | nginx `limit_req_zone` on `/auth/*` (5 requests/minute per IP) | CWE-307 (brute force) |
| Application-level throttling | `@nestjs/throttler` as a secondary layer | CWE-307 (brute force) |
| Global request limiting | nginx connection limits to prevent general DoS | CWE-400 (resource exhaustion) |

---

## v0.2.x Remediation Targets

Weaknesses introduced during v0.2.x that the v2.0.0 security baseline must address:

| Weakness | CWE | OWASP | v2.0.0 Remediation |
|----------|-----|-------|-------------------|
| Unbounded list endpoints (full table dumps) | CWE-200 | A01:2025 | Pagination with cursor-based or offset/limit params, ownership filtering |
| Uncontrolled resource consumption | CWE-400 | A06:2025 | Query limits, pagination, rate limiting on list endpoints |
| Existence oracle (200/404 + sequential IDs) | CWE-203 | A01:2025 | Constant-time responses, UUIDs instead of sequential IDs, 403 instead of 404 |
| Runtime exception stack trace leakage | CWE-209 | A10:2025 | Global ExceptionFilter that strips stack traces, logs sanitised messages |
| No input validation (no ValidationPipe) | CWE-209 | A10:2025 | Global ValidationPipe with whitelist + forbidNonWhitelisted |
| SQL logging with plaintext data | CWE-532 | A09:2025 | Disable TypeORM query logging or redact sensitive fields |
| Auto-run migrations (migrationsRun) | CWE-1188 | A02:2025 | Manual migration execution, migration review gate in CI |

---

## v0.3.x Remediation Targets

Weaknesses introduced during v0.3.x (file handling surface) that the v2.0.0 security baseline must address:

| Weakness | CWE | OWASP | v2.0.0 Remediation |
|----------|-----|-------|-------------------|
| Path traversal in file upload/download/delete | CWE-22 | A01:2025 | `path.resolve()` + base dir validation, filename sanitisation |
| MIME type confusion (client Content-Type trusted) | CWE-434 | A06:2025 | Magic-byte validation via `file-type` package |
| No upload size limit | CWE-400 | A06:2025 | Multer `limits: { fileSize: 10MB }` |
| Filesystem path disclosure in API responses | CWE-200 | A01:2025 | Strip `storagePath` from response DTOs |
| No file ownership checks on download/delete | CWE-639 | A01:2025 | `WHERE owner_id = $1` on every file operation |
| Predictable share tokens ("share-N") | CWE-330 | A01:2025 | `crypto.randomBytes(32).toString('hex')` |
| Unauthenticated public endpoint | CWE-285 | A01:2025 | Rate limiting, CAPTCHA, or auth requirement on public shares |
| Share expiry not enforced | CWE-613 | A07:2025 | Check `expiresAt` on every public access, reject if expired |

---

## v0.4.x Remediation Targets

Weaknesses introduced during v0.4.x (authorization & administrative surface) that the v2.0.0 security baseline must address:

| Weakness | CWE | OWASP | v2.0.0 Remediation |
|----------|-----|-------|-------------------|
| Role claims in JWT trusted without re-validation | CWE-639 | A07:2025 | Read role from database on every request, never trust JWT payload |
| Role guard missing on some admin endpoints | CWE-862 | A01:2025 | Audit every protected route, ensure all admin endpoints have @HasRole('admin') |
| No explicit role hierarchy (ternary roles: user/moderator/admin) | CWE-841 | A07:2025 | Define role constants (ADMIN > MODERATOR > USER) with explicit ordering |
| Cross-role escalation possible (moderator creates moderators) | CWE-269 | A07:2025 | Prevent non-admin role changes; admins-only promotion to higher roles |
| No ownership checks on resource operations | CWE-862 | A01:2025 | Verify `owner_id` matches current user on every resource access |
| No audit trail for privilege changes | CWE-532 | A09:2025 | Log all role/permission changes to persistent table with requester ID, timestamp, old/new values |
| No rate limiting on privilege escalation attempts | CWE-307 | A06:2025 | Rate limit admin endpoints (5 role changes per admin per hour) |
| JWT secret hardcoded in repository | CWE-798 | A02:2025 | Load JWT signing key from environment variable, use RS256 with private/public keys |
| JWT has no expiration (infinite validity) | CWE-613 | A07:2025 | Set `expiresIn: '15m'` on access tokens, implement refresh tokens with short expiry |
| GetAuditLogs endpoint is placeholder (returns empty array) | CWE-532 | A09:2025 | Implement persistent AuditLog table, expose endpoint with ADMIN-only filtering |

---

## Baseline Compliance Check

When hardening a v1.N.0 to produce v2.N.0, verify every control in this document. A version qualifies as v2.N.0 when:

1. Every control above is implemented
2. Every CWE from the corresponding v1.N.0 threat model is addressed
3. The pentest findings from v1.N.x are all resolved
4. The remediation is documented with before/after evidence
