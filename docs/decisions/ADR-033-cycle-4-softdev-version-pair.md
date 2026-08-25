# ADR-033: Cycle-4 SoftDev Version Pair (v1.2.0 → v2.2.0)

**Status:** Accepted (amends [ADR-032](./ADR-032-post-v2.1.0-versioning.md) for SoftDev security cycles)

**Date:** 2026-08-25

---

## Context

ADR-032 kept product tags stable for **CTF-only** misconfig of the current app (Cycle-3). SoftDev still needs a way to ship **new product surface** with a full Red → Blue chapter.

Cycle-4 adds:

1. A **new web entry point** (Notes — API + UX).
2. A **lab depth** service (SSH container) on the insecure release only.

Employers must see why Cycle-3 had no `v1.x`/`v2.x` pair while Cycle-4 does.

## Decision

### When SoftDev earns a version pair

| Work | Tags | Branch pattern |
|------|------|----------------|
| SoftDev: new routes / UX / domains | **`v1.2.0`** (insecure) → **`v2.2.0`** (secure) | SoftDev rails → tag insecure → Red → `remediation/v2.2.0` → tag secure |
| CTF-only misconfig of current tip (no new product surface) | **No** product bump | `ctf/<scenario>` (Cycle-3 pattern; ADR-032) |

Cycle-4 is a **SoftDev security cycle** (ADR-013 pair restored for this expansion). ADR-032 still applies to CTF-only boxes after `v2.2.0`.

### Cycle-4 scope (locked)

| Layer | Insecure `v1.2.0` | Secure `v2.2.0` |
|-------|-------------------|-----------------|
| **Entrance** | Notes feature (CRUD API + product UI); intentional stored XSS on note body | Notes kept; XSS closed |
| **Depth** | SSH sidecar; creds **earned via Notes chain**; login + **filesystem loot** + `user.txt` | **No** SSH on default prod compose |
| **Flags** | User flag in SSH home; **no** intentional root/PrivEsc | Absent |

**Pedagogy:** Cycle-4 = *get there logically and look around*. **Shells + PrivEsc** are [Cycle-5](../security/Cycle-5/README.md) (soon after `v2.2.0`).

### Out of scope for Cycle-4

- Privilege escalation / `root.txt` / reverse-shell tradecraft (→ Cycle-5)
- FTP (defer FC-14 sibling)
- SSRF / URL-fetch SoftDev (later SoftDev)
- Re-breaking Cycle-1/2/3 Criticals on secure `main`

## Consequences

- **Positive:** Clear SoftDev chapter; OSCP foothold skills; Cycle-5 can deepen the same SSH lineage without bloating Notes.
- **Positive:** ADR-032 remains honest for CTF-only work (Cycle-5 default).
- **Trade-off:** Two versioning stories (CTF-only vs SoftDev pair) — README / Cycle-4 index must point here.

## References

- [ADR-013](./ADR-013-expansion-cycle-versioning.md) · [ADR-032](./ADR-032-post-v2.1.0-versioning.md)
- [Cycle-4 box plan](../security/Cycle-4/Dev/v1.2.0-box-plan.md) · [Cycle-5 sketch](../security/Cycle-5/Dev/shells-privesc-sketch.md)
- [future-ctf-candidates.md](../security/Cycle-2/Remediation/future-ctf-candidates.md) — FC-01, FC-14
