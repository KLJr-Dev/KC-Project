# CWE Inventory (v1.0.0 — pentest-ready baseline)

Consolidated intentional weaknesses through v1.0.0. Each row is an exploitable or documentable instance; duplicate CWE IDs reflect distinct surfaces.

**Cycle:** All entries below are `cycle: 1` (v1.0.0 insecure baseline → v2.0.0 remediation). Workspace: [Cycle-1/README.md](Cycle-1/README.md). Ground truth: [Cycle-1/Dev/v1.0.0-ground-truth.md](Cycle-1/Dev/v1.0.0-ground-truth.md).

## Cycle 1 summary

| Metric | Count |
|--------|-------|
| Instances (`cycle: 1`) | **59** |
| Unique CWE IDs | **38** |
| Attack surfaces | 6 |
| Remediation target | v2.0.0 ([Remediation/v2.0.0-remediation.md](Cycle-1/Remediation/v2.0.0-remediation.md)) |

## Identity & Auth (`cycle: 1`, v0.1.x) — 8 instances

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-256 | Plaintext passwords in DB | v0.1.1 |
| CWE-347 | Weak JWT secret (`kc-secret`) | v0.1.3 |
| CWE-613 | No token expiry | v0.1.4 |
| CWE-613 | Logout endpoint noop (token replayable) | v0.1.4 |
| CWE-204 | User enumeration via login errors | v0.1.2 |
| CWE-307 | No rate limiting on auth | v0.1.5 |
| CWE-521 | Weak password policy | v0.5.0 |
| CWE-345 | Client `isAuthenticated` checks token presence only | v1.0.0 |

## Persistence & Data (`cycle: 1`, v0.2.x) — 9 instances

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-330 | Sequential user/file IDs | v0.2.0 |
| CWE-639 | IDOR on users (no ownership) | v0.2.2 |
| CWE-200 | Full user table dumps via GET /users | v0.2.3 |
| CWE-203 | Existence oracle on user lookup | v0.2.3 |
| CWE-209 | Error message leakage | v0.2.4 |
| CWE-532 | SQL/query logging to stdout | v0.2.3 |
| CWE-1188 | `migrationsRun: true` auto-executes migrations | v0.2.5 |
| CWE-1393 | Default postgres credentials (dev compose) | v0.2.0 |
| CWE-205 | Pagination offset oracle on list endpoints | v0.5.2 |

## Files & Sharing (`cycle: 1`, v0.3.x) — 12 instances

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-22 | Path traversal via client filename | v0.3.0 |
| CWE-22 | download uses storagePath without validation | v0.3.2 |
| CWE-434 | MIME from client Content-Type | v0.3.0 |
| CWE-400 | No Multer fileSize limit | v0.3.0 |
| CWE-639 | IDOR on file GET/download/delete | v0.3.1 |
| CWE-200 | storagePath exposed in API responses | v0.3.1 |
| CWE-330 | Predictable share tokens | v0.3.4 |
| CWE-285 | Public share endpoint unauthenticated | v0.3.4 |
| CWE-613 | Share expiry not enforced | v0.3.4 |
| CWE-400 | Unbounded file description length | v0.5.0 |
| CWE-862 | File approve trusts JWT role only | v0.4.3 |
| CWE-841 | Moderator/admin hierarchy ambiguity on approve | v0.4.3 |

## Authorization & Admin (`cycle: 1`, v0.4.x–v0.6.x) — 14 instances

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-639 | JWT role claim trusted (HasRole) | v0.4.0 |
| CWE-639 | Client stores/parses role from JWT | v1.0.0 |
| CWE-862 | DELETE /admin/users/:id missing HasRole | v0.4.5 |
| CWE-862 | Role change without re-validation | v0.4.1 |
| CWE-269 | Moderator self-escalation chain | v0.4.4 |
| CWE-841 | Ternary role precedence undefined | v0.4.3 |
| CWE-641 | No conflict detection on concurrent role changes | v0.4.3 |
| CWE-532 | Role changes not in persistent audit (pre-v0.6) | v0.4.x |
| CWE-284 | Weak guard on audit log endpoint | v0.6.0 |
| CWE-682 | Weak stats date filter | v0.6.2 |
| CWE-200 | Admin user list exposes all emails | v0.6.1 |
| CWE-400 | Admin user list unbounded (no pagination) | v0.6.1 |
| CWE-532 | Audit log details in plaintext | v0.6.0 |
| CWE-200 | Health endpoint exposes version/env hints | v0.6.3 |

## Validation & Errors (`cycle: 1`, v0.5.x) — 5 instances

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-20 | Weak ValidationPipe patterns | v0.5.0 |
| CWE-1025 | Type mismatch exposure (no coercion) | v0.5.0 |
| CWE-269 | Admin role assignable via validation gaps | v0.5.0 |
| CWE-400 | Pagination defaults permissive (high take) | v0.5.2 |
| CWE-209 | Structured 400 errors leak field names | v0.5.3 |

## Client-Side / Frontend (`cycle: 1`, v1.0.0) — 5 instances

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-615 | Vulnerability annotations shipped in bundled JS | v0.1.5 |
| CWE-922 | JWT stored in localStorage | v0.1.4 |
| CWE-319 | All API traffic over HTTP (no TLS) | v0.0.5 |
| CWE-345 | UI trusts client-side role for admin link visibility | v0.4.0 |
| CWE-613 | Client logout clears storage only; server token valid | v0.1.4 |

## Infrastructure & Deployment (`cycle: 1`, v0.7.x) — 6 instances

| CWE | Description | Version |
|-----|-------------|---------|
| CWE-798 | Hardcoded compose credentials | v0.7.0 |
| CWE-942 | Permissive CORS (`origin: true`) | v0.0.5 |
| CWE-770 | No Docker CPU/memory limits | v0.7.0 |
| CWE-200 | Swagger/OpenAPI publicly accessible | v0.0.6 |
| CWE-200 | X-Powered-By header not stripped | v0.0.3 |
| CWE-798 | Hardcoded DB defaults in app.module fallback | v0.2.0 |

## Accidental infra (not intentional CWE)

**nginx 413:** default `client_max_body_size` (1m) rejects uploads >1 MB before Multer. Backend CWE-400 (no Multer limit) applies for payloads under 1 MB. See [`infra/nginx.conf`](../../infra/nginx.conf).

---

## Summary

| Metric | Count |
|--------|-------|
| Cycle | **1** (v1.0.0 → v2.0.0) |
| Unique CWE IDs | **38** |
| Documented instances | **59** |
| Attack surfaces | 6 (auth, persistence, files/sharing, RBAC/admin, client, infra) |
| Target range (STRATEGY) | 60–80 |

Remaining headroom (~1–21 instances) is reserved for v1.0.x pentest discoveries in [Cycle-1/PenTest/](Cycle-1/PenTest/) and documentation of variant exploit paths on existing surfaces.
