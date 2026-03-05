# KC-Project Development Strategy

**Date**: March 5, 2026  
**Target MVP**: v1.0.0 (Full-featured, 60–80 CWEs, Docker/VM mandatory)  
**Post-MVP**: Rapid expansion cycle (v1.N.0 monthly, 10–15 CWEs per cycle)

---

## Part 1: v1.0.0 Vision & Scope

### What v1.0.0 Will Be

**Production-grade, intentionally vulnerable web application.**

#### Core Functionalities
1. **User Authentication** (v0.1.x complete)
   - Registration, login, logout
   - JWT tokens (hardcoded secret, no expiration)
   - Password plaintext storage
   - Rate limiting absent
   
2. **File Management** (v0.3.x complete)
   - Multipart upload (Multer)
   - Download & streaming
   - Deletion (disk + DB)
   - Metadata exposure
   
3. **File Sharing** (v0.3.x complete)
   - Public shares with predictable tokens
   - No expiry enforcement
   - Unauthenticated public access
   
4. **Role-Based Authorization** (v0.4.x complete)
   - User/Moderator/Admin roles
   - Role trust vulnerabilities (JWT claim, not DB-validated)
   - Inconsistent guard enforcement
   - Privilege escalation paths
   
5. **Admin Dashboard** (v0.6.x new or integrated from v0.4)
   - User listing & filtering
   - Role modification
   - System statistics
   - Persistent audit logs (new data source for CWEs)
   
6. **Input Validation & Pagination** (v0.5.x)
   - ValidationPipe (enforced type checking)
   - Pagination on all lists
   - Error standardization (no stack traces leaked)
   
7. **Logging Infrastructure** (v0.5.x)
   - Request/response logging
   - Auth event logging
   - Admin action logging
   - Sensitive data redaction (half-hearted, some info leaks)
   
8. **Containerized Deployment** (v0.7.x, **MANDATORY**)
   - Docker: backend, frontend, postgres, nginx
   - docker-compose orchestration
   - VM provisioning script
   - No native-only pathway; docker-compose is the primary deployment

### Why "Full-Featured"?

v1.0.0 is **not** a minimal toy system. It's a **realistic company web app** that happens to be deliberately vulnerable. This makes it:
- Deployable to production (Docker, VM, persistent data)
- Testable at scale (audit logs, file uploads, public shares)
- Suitable for structured pentesting (multiple attack surfaces, interdependencies)
- Ready for expansion cycles (new features can be bolted onto the architecture)

---

## Part 2: CWE Roadmap (v0.5 → v1.0.0)

### Current Inventory (v0.1–v0.4)
**~40 CWEs across 4 surfaces:**
- v0.1.x Auth: 9 CWEs (plaintext passwords, weak validation, brute force, enumeration, token replay)
- v0.2.x Persistence: 9 CWEs (hardcoded creds, synchronize: true, IDOR, enumeration, error leakage)
- v0.3.x Files: 7 CWEs (path traversal, MIME confusion, no size limits, IDOR on downloads, predictable tokens)
- v0.4.x RBAC: 8 CWEs (JWT claim trust, missing guards, privilege escalation, role confusion)
- Some overlap (CWE-639, CWE-862 appear multiple times at different scales)

### Strategy: Reach 60–80 CWEs by v1.0.0

**Principle**: Don't add wildly new attack surfaces. Compound & expand existing ones.

| Version | CWEs Added | Philosophy | Examples |
|---------|-----------|-----------|----------|
| **v0.5** (Validation, Pagination) | +8–10 | **Selective introduction** | CWE-20 (weak input validation patterns), CWE-22 (path traversal in error messages), CWE-532 (sensitive data in logs) |
| **v0.6** (Admin Features) | +5–8 | **Compound** | CWE-532 expanded (audit logs contain sensitive data), CWE-200 (stats leak infrastructure counts), CWE-862 (admin endpoints inconsistent) |
| **v0.7** (Docker/Deployment) | +3–5 | **Operational exposure** | CWE-798 (hardcoded DB creds in docker-compose), CWE-200 (health check endpoints expose version), CWE-434 (container images embed secrets) |
| **v0.8** (Lock & Release) | +0–2 | **Closure** | Final CWEs from documentation (CWE-200 in release notes, swagger exposes internals) |
| **Total** | ~50–65 | | **Target: 60–80 by v1.0.0** |

### Detailed CWE Map for v0.5–v0.8

#### v0.5.x (Foundation Refinement): +8–10 CWEs

**v0.5.0 — Input Validation Pipeline**
- CWE-20: Improper Input Validation (declare it, but maintain some weak patterns intentionally)
- CWE-1025: Comparison Using Wrong Factors (comparing inputs to hardcoded values instead of DB state)

**v0.5.1 — Pagination**
- CWE-400: Uncontrolled Resource Consumption (pagination default 20, but no rate limiting on requests; 100 requests × 20 items = bulk data exfil)
- CWE-205: Observable Discrepancy (pagination offset reveals user count: `?skip=1000000` returns 404, leaking max users)

**v0.5.2 — Error Handling**
- CWE-209: Information Exposure Through an Error Message (error responses now contain field names, which can leak schema)
- CWE-215: Information Exposure Through Debug Information (Swagger URI publicly accessible: `/api/docs` reveals all endpoints)

**v0.5.3 — Logging**
- CWE-532: Insertion of Sensitive Information into Log Files (logs contain user IDs, action types, but not passwords; still some pii)
- CWE-200: Exposure of Sensitive Information (logs contain admin action details that could be read by non-admins if logs leak)

**v0.5.4 — Performance Baseline**
- (No new CWEs; measurement only)

**v0.5.5 — Frontend Alignment**
- CWE-200: Sensitive API contract exposed via Swagger + frontend types (regenerated OpenAPI reveals all request/response fields)

**v0.5.x Total: 8–10 CWEs** ✓

---

#### v0.6.x (Advanced Admin): +5–8 CWEs

**v0.6.0 — Persistent Audit Logging**
- CWE-532 expanded: Audit logs stored in DB; contain role changes, user deletions; if accessed improperly, leak sensitive operations
- CWE-284: Improper Access Control (audit logs not well-protected; any authenticated user could query them if discovery exposed endpoint)

**v0.6.1 — User Filtering & Search**
- CWE-200: Search exposes user counts (searching with `%` wildcard reveals number of email matches; enumeration vector)
- CWE-203: Observable Discrepancy (different response times for found vs not-found; timing oracle for enumeration)

**v0.6.2 — System Statistics**
- CWE-200 expanded: Stats endpoint leaks infrastructure counts (fileCount * avgFileSize = storage estimate; reveals capacity planning)
- CWE-682: Incorrect Calculation (stats endpoint doesn't validate user-provided date ranges; could cause integer overflow or negative values)

**v0.6.3–v0.6.5 — Audit & Completeness**
- (Refinement; no new major CWEs)

**v0.6.x Total: 5–8 CWEs** ✓

---

#### v0.7.x (Deployment & Infrastructure): +3–5 CWEs

**v0.7.0–v0.7.2 — Dockerfiles & Compose**
- CWE-798: Use of Hard-Coded Credentials (DATABASE_PASSWORD in docker-compose.prod.yml template; `.env.production` file checked into git by mistake example)
- CWE-200: Dockerfile exposes Node.js version via `node --version` in health check response headers

**v0.7.3–v0.7.5 — VM Setup & Documentation**
- CWE-434: Unrestricted Upload (VM setup script doesn't validate SSH key format; arbitrary SSH key injection possible)
- CWE-276: Incorrect Default File Permissions (`.env.production` not created with restricted permissions; world-readable by default in setup script example; documented vulnerability)

**v0.7.x Total: 3–5 CWEs** ✓

---

#### v0.8.x (Documentation & Lock): +0–2 CWEs

**v0.8.0–v0.8.5 — API Lock & Release**
- CWE-200 final: Release notes + documentation expose API internals (endpoint list, authentication flow, example payloads)
- (Mostly closure; no intentional new vulnerabilities)

**v0.8.x Total: 0–2 CWEs** ✓

---

### CWE Distribution Summary

```
v0.1.x Auth:                  9 CWEs (plaintext passwords, token replay, weak validation)
v0.2.x Persistence:           9 CWEs (hardcoded creds, IDOR, error leakage, enumeration)
v0.3.x Files:                 7 CWEs (path traversal, MIME, no limits, predictable tokens)
v0.4.x RBAC:                  8 CWEs (JWT trust, missing guards, escalation, role confusion)
v0.5.x Refinement:           +8–10 CWEs (validation patterns, pageination, error handling, logging)
v0.6.x Admin:                +5–8 CWEs (audit data exposure, user enumeration, stats leaks)
v0.7.x Deployment:           +3–5 CWEs (hardcoded creds, permissions, validation)
v0.8.x Lock:                 +0–2 CWEs (documentation exposure)
─────────────────────────────────
Total v1.0.0:                 50–65 CWEs (target 60–80)
```

**If we lean on compound expansion & detailed documentation of CWEs, we can easily reach 70–80 unique CWEs by v1.0.0.**

---

## Part 3: Docker & VM as Mandatory Deployment

### Design Decision: Why Mandatory?

v1.0.0 is **ONLY deployable via docker-compose + VM**. No "native dev mode" alternative.

#### Rationale

1. **Realistic Deployment** — Most modern apps deploy via containers. v1.0.0 simulates real infrastructure.
2. **Vulnerability Testing** — Deployment misconfigurations ARE vulnerabilities (hardcoded creds, exposed env vars, permission issues). Hiding them behind optional native mode doesn't test them.
3. **Database Isolation** — PostgreSQL in Docker ensures test data doesn't persist across runs. Easier reproducibility.
4. **Expansion Readiness** — v1.1.0+ will add cloud security misconfigurations; Docker foundation enables this.

#### Architecture

```
v1.0.0 Deployment:

┌─────────────────────────────────────────────────────────────┐
│ Development:  Local Docker Compose (infra/compose.yml)     │
│               ├─ postgres:5432 (development DB)             │
│               ├─ backend:4000 (NestJS, hot-reload)         │
│               └─ frontend:3000 (Next.js, hot-reload)       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Staging:  Docker Compose (docker-compose.prod.yml)         │
│           ├─ postgres:5432 (persistent volume)        │
│           ├─ backend:4000 (built image)               │
│           ├─ frontend:3000 (built image)              │
│           └─ nginx:80 (reverse proxy)                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Production:  Ubuntu VM                                      │
│             ├─ vm-setup.sh (installs Docker, Docker Compose)
│             ├─ docker-compose.prod.yml (same as staging)   │
│             └─ .env.production (secrets; NOT in git)       │
└─────────────────────────────────────────────────────────────┘

No alternatives: v1.0.0 is ONLY docker-compose deployment.
```

#### CWEs Exposed by Docker/VM Mandatory

1. **CWE-798** (Hardcoded Creds): `.env.production` mistakenly checked into git in examples; docker-compose shows DATABASE_PASSWORD
2. **CWE-276** (Permissions): Setup script creates `.env.production` world-readable; permissions documentation shows this is intentional
3. **CWE-434** (Unrestricted Upload): VM setup installs all packages without verification; curl script injection possible
4. **CWE-863** (Incorrect Authorization): Docker volumes mounted with broad read access; container can access host files

---

## Part 4: Expansion Cycle Strategy (v1.1.0, v1.2.0, v1.3.0, ...)

### Post-v1.0.0: Monthly Rapid Expansion

Your preference: **Rapid iterations** (monthly, ~10 CWEs per cycle).

### Expansion Model

```
v1.0.0  ──────  Insecure MVP (full-featured, 60–80 CWEs, Docker, VM, deployable)
         │
         ├──→  v1.0.x (pentesting)  ──→  Discover vulnerabilities, document CWE details
         │                                (e.g., "CWE-639 JWT forgery PoC", specific attack chains)
         │
         └──→  v1.1.0  ──────  Fork v1.0.0 codebase, introduce 10–15 NEW attack surfaces
                │               (not remediations; new vulnerability categories)
                │
                ├──→  v1.1.x (pentesting)  ──→  Discover new vulns
                │
                └──→  v1.2.0  ──────  Fork v1.1.0, introduce 10–15 MORE new attack surfaces
                        │
                        └──→  ... repeat indefinitely
```

### Expansion Surfaces (v1.N.0 roadmap)

Each v1.N.0 introduces a **new attack category** across the entire system:

#### v1.1.0 — Client-Side Security & Secrets Management
**Goal**: Add 10–15 client-side rendering vulns + secrets exposure.

**New Surfaces**:
- XSS via template injection (Next.js server-side rendering vulnerability)
- CSRF (no token validation on state-changing endpoints)
- Secrets in frontend bundles (API keys, JWT secret leaked in CSR bundle during build)
- Insecure direct object references in API, now with timing attacks
- Supply chain risk (npm package with backdoor included intentionally)

**CWEs**: CWE-79 (XSS), CWE-352 (CSRF), CWE-798 (hardcoded API keys in frontend), CWE-327 (weak JWT algorithm), CWE-502 (insecure deserialization from frontend state)

**Implementation**: 2–3 weeks of feature work, then pentest cycle (v1.1.x patches).

#### v1.2.0 — Race Conditions & Cache Poisoning
**Goal**: Add concurrency vulns + caching vulnerabilities.

**New Surfaces**:
- Race condition on file deletion (two concurrent DELETE requests; file deleted twice, orphaned DB record)
- Race condition on role escalation (two admins demoting same user simultaneously; inconsistent state)
- Cache poisoning on public file shares (nginx caches `GET /sharing/public/:token` response; token revoked but cache stale)
- Insecure randomness in file operation IDs

**CWEs**: CWE-362 (concurrent access), CWE-327 (weak randomness), CWE-444 (cache poisoning), CWE-362 (time-of-check-time-of-use)

**Implementation**: 2–3 weeks.

#### v1.3.0 — Cloud Misconfigurations & DevOps Vulns
**Goal**: Add infrastructure-layer vulnerabilities.

**New Surfaces**:
- Exposed MongoDB credentials in docker-compose (migrated feature)
- S3 bucket ACL misconfiguration (assume file storage migrated to S3)
- GitOps secret leakage in CI/CD logs
- Kubernetes RBAC too permissive (assume K8s deployment in this version)
- IAM policy allows `s3:*` on entire bucket

**CWEs**: CWE-798, CWE-276, CWE-434 (at cloud layer), CWE-276 (IAM permissions)

**Implementation**: 2–3 weeks.

#### v1.4.0 — Cryptographic Failures (Future)
**Goal**: Weak crypto, key rotation, side-channel attacks.

**New Surfaces**:
- JWT with `none` algorithm accepted
- Weak PBKDF2 iteration count for password hashing
- Plaintext secrets in memory (observable via process inspection)
- Side-channel timing attack on password comparison

**CWEs**: CWE-327, CWE-916, CWE-656

#### v1.5.0+ — Business Logic & Advanced Exploitation (Future)
**Goal**: Complex multi-step attack chains, business logic bypasses.

**New Surfaces**:
- Double-spending: upload same file twice, get allocated storage twice
- Privilege escalation chains: user → moderator → admin via role confusion
- Billing bypasses: free tier gets unlimited storage if pagination param tampered

**CWEs**: CWE-863, CWE-269, custom business logic vulns

---

## Part 5: Implementation Roadmap

### Phase 1: v0.5–v0.8 (Build to v1.0.0)

| Version | Duration | CWEs | Key Deliverables |
|---------|----------|------|------------------|
| v0.5.x | 2–3 weeks | +8–10 | Input validation, pagination, logging, error handling |
| v0.6.x | 2–3 weeks | +5–8 | Audit logs, user filtering, stats, admin polish |
| v0.7.x | 2–3 weeks | +3–5 | Docker, docker-compose, VM provisioning, deployment CWEs |
| v0.8.x | 1–2 weeks | +0–2 | API lock, docs, test coverage, release candidate |
| **v1.0.0** | 1 week | **60–80 total** | **Production-ready vulnerable MVP** |

**Timeline**: ~8–12 weeks to v1.0.0.

### Phase 2: v1.0.x (Pentesting)

| Version | Duration | Focus |
|---------|----------|-------|
| v1.0.1 | 1–2 weeks | Critical bug patches (RCE, major auth bypasses) |
| v1.0.2 | 1–2 weeks | Moderate issue patches |
| v1.0.x | 2–4 weeks total | Structured pentesting, documentation of findings |

**Outcome**: All 60–80 CWEs mapped, documented, exploitable. Release notes detail attack chains.

### Phase 3: v1.1.0+ (Expansion Cycle)

| Version | Duration | Approach | CWEs |
|---------|----------|----------|------|
| v1.1.0 | 2–3 weeks | Fork v1.0.0, add client-side + secrets vulns | +10–15 |
| v1.1.x | 1–2 weeks | Pentest findings | (discovery) |
| v1.2.0 | 2–3 weeks | Fork v1.1.0, add race conditions + caching | +10–15 |
| v1.2.x | 1–2 weeks | Pentest findings | (discovery) |
| v1.3.0 | 2–3 weeks | Fork v1.2.0, add cloud misconfigs | +10–15 |
| ... | | (repeat indefinitely) | |

**Cadence**: New v1.N.0 feature version every month, followed by 1–2 week pentest iteration.

---

## Part 6: Summary Table

### What v1.0.0 Contains

| Aspect | Details |
|--------|---------|
| **Deployments** | Docker only (mandatory) + VM provisioning |
| **Database** | PostgreSQL 16, TypeORM, migrations |
| **Features** | Auth, files, sharing, RBAC (User/Mod/Admin), audit logs, stats |
| **Test Coverage** | 80+ e2e tests, 85%+ code coverage |
| **Vulnerabilities** | 60–80 documented CWEs across 8 surfaces |
| **Documentation** | Architecture diagrams, ADRs, STRIDE threat model, API contract |
| **Lifecycle** | Fully containerized, reproducibly deployable to Ubuntu VM |
| **First Use Case** | Structured pentesting + learning platform |

### CWE Growth Post-v1.0.0

| Milestone | CWEs | Note |
|-----------|------|------|
| v1.0.0 | 60–80 | MVP baseline |
| v1.0.x | 60–80 | (same, documentation only) |
| v1.1.0 | ~75–95 | (+10–15 new client-side, secrets) |
| v1.1.x | ~75–95 | (same, documentation) |
| v1.2.0 | ~90–110 | (+10–15 new race conditions, caching) |
| v1.2.x | ~90–110 | (same) |
| v1.3.0 | ~105–130 | (+10–15 new cloud misconfigs) |
| v1.3.x | ~105–130 | (same) |
| **Target by v1.3.x** | **~130 CWEs** | (3+ expansion cycles) |

---

## Part 7: Risk Mitigation

### What Could Go Wrong?

1. **v0.5–v0.8 overrun** — Too many new features, extending timeline past 1 month
   - **Mitigation**: Lock feature scope now. v0.5–v0.8 is pure refinement + deployment.

2. **Docker/VM complications** — complex setup, test matrix explodes
   - **Mitigation**: Test docker-compose.prod.yml thoroughly in v0.7.x. VM script must be idempotent.

3. **CWE inflation** — Reach 100+ too early, diminish expansion novelty
   - **Mitigation**: Be selective in v0.5–v0.8 (max 30 new CWEs). Save bulk for v1.1–v1.3.

4. **v1.0.x pentesting reveals design flaws** — Major architectural issues discovered after freeze
   - **Mitigation**: Security review during v0.8.x release candidate phase. Lock API surface early.

5. **Expansion cycle abandonment** — After v1.0.0, hard to maintain rhythm
   - **Mitigation**: Plan v1.1.0 scope NOW (client-side vulns). Commit to schedule.

---

## Conclusion

**v1.0.0 is a watershed moment:**
- Not a toy; full-featured app
- Mandatory Docker/VM (realistic infrastructure)
- 60–80 CWEs (comprehensive vulnerability baseline)
- Production-deployable
- Ready for structured pentesting and expansion cycles

**Post-v1.0.0:**
- Rapid iterations (1 new version per month)
- Each cycle adds 10–15 CWEs (new attack surfaces)
- Build a 100+ CWE taxonomy by v1.3.x
- Repository becomes reference for security education + DevSecOps learning

