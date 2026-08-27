# ADR-035: Cycle-7 Multi-Service Product Expansion Pair (v1.4.0 → v2.4.0)

**Status:** Accepted (amends [ADR-032](./ADR-032-post-v2.1.0-versioning.md) for product-expansion security cycles; parallel to [ADR-034](./ADR-034-cycle-6-product-expansion-pair.md))

**Date:** 2026-08-26

---

## Context

Cycle-6 shipped Link Preview SSRF + bookmark CSRF (`v1.3.0` → `v2.3.0`). Portfolio OSCP practice needs a **longer multi-service** engagement (FTP/SSH/Hydra/Nikto, LFI finish, PrivEsc, dual-home pivot) — not another same-day AppSec micro-pair.

Cycle-7 adds an **LFI product surface** plus **compose overlays** (FTP, real SSH, Cowrie decoy, internal jump host) as an intentional insecure tip, then Blue hardens the web plant and unpublishes overlays.

## Decision

### When a version pair is earned

| Work | Tags | Branch pattern |
|------|------|----------------|
| Product expansion + lab overlays | **`v1.4.0`** (intentional insecure) → **`v2.4.0`** (hardened) | Feature lanes → `dev` → `main`; archive `ctf/v1.4.0`; Blue `remediation/v2.4.0` |
| CTF-only tip misconfig | **No** product bump | `ctf/<scenario>` ([ADR-032](./ADR-032-post-v2.1.0-versioning.md)) |

### Cycle-7 scope (locked)

| Layer | Insecure `v1.4.0` | Hardened `v2.4.0` |
|-------|-------------------|-------------------|
| **Web** | Ops **document viewer LFI** (FC-18) | Path-safe read; no traversal |
| **Overlays** | FTP `:21`, SSH `:2222`, Cowrie `:2223`, internal jump | Unpublished on default prod |
| **Flags** | Five `OS{32hex}` | Absent from tip |
| **Ceiling** | User → sudo GTFO → pivot to jump | No shell plants on tip |
| **Out** | Full AD · real Windows VM · docker escape · Preview SSRF re-break · Notes XSS | — |

### Docs / implementation branching

- **P0 design:** `docs/cycle-7-p0` → **PR into `main`**.  
- **Product + infra code:** `backend` / `frontend` → `dev` → `main` only after P0 merges ([ADR-015](./ADR-015-branching-strategy.md)).

### Preferred terminology

Same as [ADR-034](./ADR-034-cycle-6-product-expansion-pair.md): product expansion cycle · feature lanes · intentional insecure release · Security SDL.

## Consequences

- **Positive:** Portfolio-aligned multi-day box while keeping a honest secure tip (`v2.4.0`).  
- **Positive:** Consumes FC-14 (FTP) + FC-18 (LFI) with clear Blue exit.  
- **Trade-off:** Heavier infra than Cycles 4–6; examiner and asserts must prove overlays off on secure tip.  
- **Deferred:** Full AD, Windows VM, FC-13 escape, FC-16 WordPress.

## References

- [Cycle-7 decisions](../security/Cycle-7/Dev/cycle-7-decisions.md) · [future-ctf-candidates.md](../security/Cycle-2/Remediation/future-ctf-candidates.md)  
- [ADR-015](./ADR-015-branching-strategy.md) · [ADR-031](./ADR-031-security-cycle-docs.md) · [ADR-034](./ADR-034-cycle-6-product-expansion-pair.md)
