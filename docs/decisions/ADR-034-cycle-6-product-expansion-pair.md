# ADR-034: Cycle-6 Product Expansion Version Pair (v1.3.0 → v2.3.0)

**Status:** Accepted (amends [ADR-032](./ADR-032-post-v2.1.0-versioning.md) for product-expansion security cycles; parallel to [ADR-033](./ADR-033-cycle-4-softdev-version-pair.md))

**Date:** 2026-08-26

---

## Context

Cycle-5 was **CTF-only** (shells/PrivEsc on `ctf/shells-privesc`) with **no** product tag bump ([ADR-032](./ADR-032-post-v2.1.0-versioning.md)). The deferred SoftDev pair `v1.3.0`/`v2.3.0` from early Cycle-5 sketches waits on a **new product surface**.

Cycle-6 adds that surface: **Link Preview** (server-side URL fetch → SSRF teaching) plus a **CSRF** plant on one cookie-auth mutation (FC-02, FC-03).

Portfolio language: prefer **product expansion cycle** and **feature lanes** over informal “SoftDev” (still present in older ADRs/Cycle-4 docs).

## Decision

### When a version pair is earned

| Work | Tags | Branch pattern |
|------|------|----------------|
| Product expansion: new routes / UX | **`v1.3.0`** (intentional insecure) → **`v2.3.0`** (hardened) | Feature lanes `backend`/`frontend` → `dev` → `main`; archive `ctf/v1.3.0`; Blue `remediation/v2.3.0` |
| CTF-only misconfig of current tip | **No** product bump | `ctf/<scenario>` (Cycle-3 / Cycle-5) |

### Cycle-6 scope (locked)

| Layer | Insecure `v1.3.0` | Hardened `v2.3.0` |
|-------|-------------------|-------------------|
| **Entrance** | Link Preview API + UI; open server fetch | Preview may remain; fetch restricted |
| **CSRF** | One cookie mutation without CSRF | CSRF (or equivalent) restored |
| **Flags** | Two `OS{32hex}` graded plants | Absent from tip |
| **Out** | PrivEsc, FTP, AD, Notes XSS reprise, Cycle-5 agent | — |

### Docs / implementation branching

- **P0 design:** `docs/cycle-6-*` (or equivalent) → **PR into `main`** — do not develop cycle docs by pushing straight to `main`.  
- **Product code:** feature lanes only until integrate/PR.

### Preferred terminology (new docs)

| Prefer | Legacy informal |
|--------|-----------------|
| Product expansion cycle | SoftDev cycle |
| Feature lanes | SoftDev rails |
| Intentional insecure release | SoftDev tip |
| Security SDL (Dev → PenTest → Remediation) | SoftDev process |

## Consequences

- **Positive:** Honest version bump for new AppSec surface after CTF-only Cycle-5.  
- **Positive:** Aligns with ADR-031 waterfall-shaped security SDL folders.  
- **Trade-off:** Two versioning stories remain (CTF-only vs expansion pair) — README / Cycle-6 index point here.  
- **Deferred:** OSCP-inspired useless `.env`, FTP, LFI — Bucket B (FC-17+), not Cycle-6 DoD.

## References

- [ADR-015](./ADR-015-branching-strategy.md) · [ADR-032](./ADR-032-post-v2.1.0-versioning.md) · [ADR-033](./ADR-033-cycle-4-softdev-version-pair.md)  
- [Cycle-6 decisions](../security/Cycle-6/Dev/cycle-6-decisions.md) · [future-ctf-candidates.md](../security/Cycle-2/Remediation/future-ctf-candidates.md)
