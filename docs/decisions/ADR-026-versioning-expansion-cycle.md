# ADR-026: Versioning & Expansion Cycle Strategy

**Status:** Accepted

**Date:** v0.4.0 (Strategic Pivot)

---

## Context

After completing v0.4.0 (Authorization & Administrative Surface), KC-Project faced a critical decision point: **How should v0.5 and v0.6 be structured?**

### Original Plan (Option A: Infrastructure-First)

- v0.5.x: Containerisation & VM deployment (Docker, Ubuntu, orchestration)
- v0.6.x: Infrastructure hardening (security, networking, secrets)
- v0.7.x–v1.0.0: Complete web app features (file handling, sharing, admin)

**Problems with Option A:**
- Delays real application functionality by 2 versions (~2+ months)
- Infrastructure concerns (containers, VMs, deployment) distract from SENG specification functional requirements
- MVP launch pushed to v1.0.0 with 2 preliminary "infra" versions creating confusion
- Does not align with SENG teaching goal: security vulnerabilities in application code, not infrastructure

### Proposed Plan (Option B: App-Complete-First)

- v0.5.x–v0.9.x: Complete all web app features **and** integrate infrastructure (Docker, Docker Compose, VM setup)
- v1.0.0: Insecure MVP baseline (15–18 documented CWEs) **running on Docker containers in a VM** (fully deployable product)
- v1.0.x: Penetration testing & incremental patching
- v1.1.0: Fork v2.0.0, add ~10 new CWEs (client-side vulnerabilities, race conditions, etc.)
- v1.1.x: Pentest + patch v1.1.0
- v2.0.0: Hardened parallel (all v1.0.0 CWEs remediated)
- v2.1.0: Infrastructure + ops hardening (production-grade hardening, TLS, secrets, monitoring)
- v2.2.0: Hardened parallel (all v1.1.0 CWEs remediated, infrastructure maintained)
- **Repeat cycle:** v1.2.0, v1.2.x, v2.2.x, v2.3.0, etc.

**Benefits of Option B:**
- Aligns with SENG specification: FR-3 (file handling), FR-4 (sharing), FR-5 (admin) + infrastructure in context
- Reaches meaningful MVP (v1.0.0) as a **complete, deployable product** (not locally-only)
- Infrastructure is **integrated into v0.x**, not deferred
- Clear conceptual separation: v1.x = insecure app + infrastructure, v2.x = hardened app + ops, then fork and repeat

## Decision

Adopt **Option B: App-Complete-First** with explicit expansion cycle architecture.

### Version Structure

```
v0.x — Feature Development + Infrastructure Integration (insecure product)
  v0.4.0–v0.4.5: Authorization & Administrative Surface (frontend/backend)
  v0.5.0–v0.5.5: File Handling & Storage (upload, download, delete)
  v0.6.0–v0.6.5: Public Sharing & Expiry (public tokens, share UI)
  v0.7.0–v0.7.5: Advanced Admin Features (user mgmt, stats)
  v0.8.0–v0.8.5: App Polish & Refinement (validation, pagination, logging)
  v0.9.0–v0.9.5: Infrastructure Integration (Docker image build, docker-compose, VM setup) + MVP Freeze

v1.0.0 — Insecure MVP Baseline (deployed on Docker + VM)
  15–18 documented CWEs across 5 attack surfaces
  Full functionality, fully containerized, deployable to VM
  Production-like (reproducible, persistent, networked)

v1.0.x — Penetration Testing & Incremental Patching
  Structured testing discovers and documents vulnerabilities
  Minimal patches applied to critical bugs
  Infrastructure remains unchanged from v1.0.0

v1.1.0 — New Insecure Surface (forked from v2.0.0)
  Add ~10 new CWEs in new vulnerability class (XSS, CSRF, SSRF, deserialization, etc.)
  Deployed on same Docker + VM infrastructure

v1.1.x — Pentest + Patch v1.1.0

v2.0.0 — Hardened Parallel Release
  All v1.0.0 CWEs remediated (password hashing, token expiry, IDOR checks, etc.)
  Feature parity with v1.0.0 (same API, same business logic)
  Infrastructure unchanged (no new ops hardening yet)

v2.1.0 — Infrastructure + Ops Hardening
  TLS termination, secrets management, non-root containers, read-only filesystems
  Health checks, graceful shutdown, logging aggregation
  Security headers, reverse proxy hardening
  Demonstrated on v2.0.0 codebase

v2.2.0 — Hardened Parallel Release (v1.1.0 CWEs)
  All v1.1.0 CWEs remediated

v2.2.x — Ops Hardening Maintained
  Infrastructure patterns from v2.1.0 carried forward

→ ...repeat with v1.2.0, v1.2.x, v2.2.x, v2.3.0, etc.
```

### Rationale for 6-Version Progression (v0.4–v0.9)

Each v0.X.x series introduces a complete, self-contained feature domain:

- **v0.4.x (Authorization):** Role-based access control, weak guards, client-controlled claims
- **v0.5.x (File Handling):** Multipart upload, storage, retrieval, deletion (no filename sanitization, no MIME validation, unbounded size)
- **v0.6.x (Public Sharing):** Token generation, public access, expiry enforcement, revocation (predictable tokens, missing expiry checks, IDOR)
- **v0.7.x (Admin Features):** User listing, role modification, system stats, audit logging (information leakage, no authorization re-check)
- **v0.8.x (App Polish):** Input validation, pagination, error standardization, request logging (foundation hardening, no new vulnerabilities)
- **v0.9.x (Infrastructure Integration):** Docker image build, docker-compose orchestration, VM provisioning, MVP freeze & release prep

Each version is **complete in isolation** but intentionally introduces or preserves vulnerabilities for teaching and testing purposes.

### Why Integrate Infrastructure into v0.9.x (Not Defer to v2.x)?

1. **v1.0.0 must be fully deployable:** An "insecure MVP" running only locally is incomplete. v1.0.0 should run on Docker containers in a VM (reproducible, networked, realistic).
2. **Infrastructure is orthogonal to vulnerabilities:** Dockerisation doesn't fix CWEs; it just packages the insecure app professionally. v0.9.x integrates Docker while v1.0.0–v2.1.0 harden different aspects (app vulnerabilities vs ops hardening).
3. **Teaching goal:** SENG specification includes deployment and operational context. v1.0.0 as a "product" (not just code) is more realistic for learning.
4. **Fork point at v1.0.0:** After v1.0.0, the cycle forks into v1.1.0 (new insecure surface) and v2.0.0 (hardened). Infrastructure remains consistent across this fork (same Docker setup).
5. **v2.1.0 for ops hardening:** Infrastructure INTEGRATION (Docker, VM, compose) happens in v0.9.x. Infrastructure HARDENING (TLS, secrets, security headers) happens in v2.1.x post-fork.

### Expansion Cycle Philosophy

After v1.0.0, KC-Project enters a **perpetual insecure/secure loop**:

- **v1.N.0 (Insecure):** New vulnerability surface introduced (forks from v2.N-1.0 or prior)
- **v1.N.x (Pentest):** Vulnerabilities tested, documented, lightly patched
- **v2.N.0 (Secure):** All v1.N.0 vulnerabilities remediated, same deployment model
- **v2.N.1 (Ops Hardening):** Infrastructure, deployment, operational security hardened (TLS, secrets, monitoring, etc.)
- **v2.N.x:** Ops patterns maintained
- **Fork:** v1.N+1.0 branches from v2.N.0 (or v2.N.1), adds new CWEs, cycle continues

This loop allows KC-Project to scale from 15 CWEs (v1.0.0) to 50+ CWEs (v1.5.0) over time, covering all OWASP Top 10:2025 categories and more.

### Post-v2.0.0 Expansion Roadmap (Speculative)

- **v1.1.0:** Client-side rendering vulnerabilities (XSS, CSRF, SSRF, insecure deserialization)
- **v1.2.0:** Race conditions, cache poisoning, algorithm confusion
- **v1.3.0:** Supply chain attacks, CI/CD exploitation, API gateway misconfigurations
- **v1.4.0:** Cryptographic failures, unsafe compression, side-channel attacks
- **v1.5.0:** Advanced privilege escalation, object injection, business logic flaws

Each v1.N.0 is designed as a **valid, deployable system** that happens to contain a specific vulnerability class.

## Consequences

### Positive

- ✅ v1.0.0 MVP is a **complete product** (fully containerized, deployable to VM)
- ✅ Clear separation of concerns: app vulnerabilities (v1.x) vs app hardening (v2.0.0) vs ops hardening (v2.1.0) vs new vulnerabilities (v1.1.0+)
- ✅ Aligns with SENG specification teaching goals (realistic deployment context)
- ✅ Expansion cycle allows indefinite growth of vulnerability surfaces
- ✅ Each v0.x version is independently meaningful and testable
- ✅ Infrastructure integrated into v0.9.x (not deferred, not blocking)
- ✅ Fork at v1.0.0 enables parallel v1.1.0 and v2.0.0 development

### Negative

- ⚠️ v0.9.x becomes broader (infrastructure integration + release prep)
- ⚠️ Docker/compose knowledge required earlier (v0.9.0, not post-v2.0.0)
- ⚠️ Ops hardening (v2.1.0) is separate from app hardening (v2.0.0); requires two iterations

## Alternatives Considered

### Option A (Infrastructure-First)
- Deferred because it delays MVP and adds non-functional complexity early

### Option C (Infrastructure-Parallel)
- Both v0.5–v0.9 (app) and v0.5–v0.6 (infra) happen simultaneously
- Deferred because it dilutes focus and creates timeline uncertainty

## Related Decisions

- **[ADR-013](./ADR-013-expansion-cycle-versioning.md):** Expansion cycle structure (v1.x insecure, v2.x hardened, repeat)
- **[ADR-020](./ADR-020-docker-db-only.md):** Docker used only for database in dev, not for app infrastructure (yet)
- **[ADR-014](./ADR-014-github-vcs.md):** Git branching allows feature-parallel development (frontend/backend on separate branches before v1.0.0 merge)

## Implementation Notes

- ROADMAP.md updated to reflect v0.5.x–v0.9.x with infrastructure integration (v0.4.0)
- v0.5.0 implementation begins after v0.4.0 merge to main (file handling)
- v0.9.0 integrates Docker image build, docker-compose, VM provisioning
- v1.0.0 release includes reproducible docker-compose setup for local or VM deployment
- v2.1.0 (Infrastructure Hardening ADR) addresses TLS, secrets, ops monitoring post-fork
- All v1.x and v2.x versions use same Docker/compose foundation established in v0.9.x
