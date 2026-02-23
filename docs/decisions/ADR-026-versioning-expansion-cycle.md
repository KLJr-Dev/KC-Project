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

- v0.5.x–v0.9.x: Complete all web app features before any infrastructure
- v1.0.0: Insecure MVP baseline (15–18 documented CWEs)
- v1.0.x: Penetration testing & incremental patching
- v2.0.0: Hardened parallel (all CWEs remediated)
- v2.1.x: Infrastructure post-hardening (containers, VMs, deployment)

**Benefits of Option B:**
- Aligns with SENG specification: FR-3 (file handling), FR-4 (sharing), FR-5 (admin)
- Reaches meaningful MVP (v1.0.0) with full functionality
- Infrastructure becomes a post-MVP concern, not a blocker
- Clean conceptual separation: v1.x = application vulnerabilities, v2.x = hardening, v2.1+ = infrastructure

## Decision

Adopt **Option B: App-Complete-First** with explicit expansion cycle architecture.

### Version Structure

```
v0.x — Feature Development (insecure prototype)
  v0.4.0–v0.4.5: Authorization & Administrative Surface
  v0.5.0–v0.5.5: File Handling & Storage
  v0.6.0–v0.6.5: Public Sharing & Expiry
  v0.7.0–v0.7.5: Advanced Admin Features
  v0.8.0–v0.8.5: App Polish & Refinement
  v0.9.0–v0.9.5: MVP Freeze & Release Preparation

v1.0.0 — Insecure MVP Baseline
  15–18 documented CWEs across 5 attack surfaces
  Full functionality, production-like (locally deployed, reproducible)

v1.0.x — Penetration Testing & Incremental Patching
  Structured testing discovers and documents vulnerabilities
  Minimal patches applied to critical bugs

v2.0.0 — Hardened Parallel Release
  All v1.0.0 CWEs remediated
  Feature parity with v1.0.0 (same API, same business logic)
  Demonstrates remediation patterns

v2.1.x — Infrastructure Surface (Post-v2.0.0)
  Dockerisation, VM deployment, production hardening
  Not part of MVP scope; added after security baseline established

Post-v2.0.0 — Perpetual Expansion Cycle
  v1.1.0: Fork v2.0.0, add ~10 new CWEs (XSS, CSRF, SSRF, deserialization)
  v1.1.x: Pentest + patch
  v2.1.0: Secure parallel (infrastructure containerisation)
  v2.2.0: Secure parallel (all v1.1 CWEs remediated)
  → ...repeat with v1.2.0, v1.2.x, v2.2.x, etc.
```

### Rationale for 6-Version Progression (v0.4–v0.9)

Each v0.X.x series introduces a complete, self-contained feature domain:

- **v0.4.x (Authorization):** Role-based access control, weak guards, client-controlled claims
- **v0.5.x (File Handling):** Multipart upload, storage, retrieval, deletion (no filename sanitization, no MIME validation, unbounded size)
- **v0.6.x (Public Sharing):** Token generation, public access, expiry enforcement, revocation (predictable tokens, missing expiry checks, IDOR)
- **v0.7.x (Admin Features):** User listing, role modification, system stats, audit logging (information leakage, no authorization re-check)
- **v0.8.x (App Polish):** Input validation, pagination, error standardization, request logging (foundation hardening, no new vulnerabilities)
- **v0.9.x (MVP Freeze):** Feature lock, documentation finalization, test review, schema lock (release readiness, no new features)

Each version is **complete in isolation** but intentionally introduces or preserves vulnerabilities for teaching and testing purposes.

### Why Not Infrastructure in v0.5–v0.6?

1. **Conceptual clarity:** Vulnerabilities belong in application code, not infrastructure
2. **Teaching goal:** SENG specification focuses on functional security requirements, not deployment models
3. **MVP definition:** A complete, deployable web app is more meaningful than a containerized empty shell
4. **Future flexibility:** Infrastructure tools (Docker, Kubernetes, cloud) can be swapped post-v2.0.0 without rearchitecting the app
5. **Timeline:** Reaching v1.0.0 (15–18 CWEs) is the top priority; infrastructure is a nice-to-have after hardening

### Expansion Cycle Philosophy

After v1.0.0, KC-Project enters a **perpetual insecure/secure loop**:

- **v1.N.0 (Insecure):** New vulnerability surface introduced
- **v1.N.x (Pentest):** Vulnerabilities tested, documented, lightly patched
- **v2.N.0 (Secure):** All vulnerabilities remediated
- **v2.N.x (Hardening):** Infrastructure, deployment, operational security
- **Repeat:** v1.N+1.0 forks v2.N.x, adds new CWEs, cycle continues

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

- ✅ v1.0.0 MVP is reached faster with full functionality
- ✅ Clear separation of concerns: app vulnerabilities (v1.x) vs hardening (v2.x) vs infrastructure (v2.1+)
- ✅ Aligns with SENG specification teaching goals
- ✅ Expansion cycle allows indefinite growth of vulnerability surfaces
- ✅ Each v0.x version is independently meaningful and testable
- ✅ Infrastructure added post-MVP when it matters (not when it's empty)

### Negative

- ⚠️ Infrastructure conversation deferred (~4 months)
- ⚠️ Early versions may feel "locally-only" rather than "production-ready"
- ⚠️ Requires discipline to avoid infrastructure creep in v0.5–v0.9 features

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

- ROADMAP.md updated to reflect v0.5.x–v0.9.x app-focused phases (v0.4.0)
- v0.5.0 implementation begins after v0.4.0 merge to main
- Infrastructure decisions (containerisation, VM, reverse proxy) deferred to ADR-027 (post-v2.0.0)
- All v0.5–v0.9 versions designed to be compatible with future infrastructure layers
