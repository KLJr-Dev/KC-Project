# ADR-032: Post-v2.1.0 Versioning & Branching

**Status:** Accepted (amends [ADR-013](./ADR-013-expansion-cycle-versioning.md) for post-Cycle-2)

**Date:** 2026-08-24 (v2.1.0)

---

## Context

Cycles 1–2 followed ADR-013’s insecure/secure version pairs (`v1.0.0`→`v2.0.0`, CTF `v1.1.0`→`v2.1.0`). The live product on `main` is now **v2.1.0**.

Further CTFs are intended to **misconfigure the current secure app** (no new product routes). Bumping `vX.Y.Z` for every Red/Blue cycle would invent fake product versions and blur SoftDev surface growth.

SoftDev still needs long-lived lanes (`backend`, `frontend`, `dev`) for real feature work. Finished Blue branches should remain as **frozen portfolio archives**, not deleted after merge.

## Decision

### Version bumps (from v2.1.0 forward)

| Change type | Bump `vX.Y.Z`? | Where |
|-------------|----------------|-------|
| SoftDev: new routes, product features, infra surface | **Yes** on merge to `main` | `backend` / `frontend` → `dev` → `main` |
| CTF / Red: misconfigure or plant flags on **current** secure app | **No** | `ctf/<scenario>` forked from current `main` / tag |
| Blue: close CTF PoCs on the same product surface | **No** | `remediation/<cycle>` → PR → `main`; **freeze** branch |
| Docs / comment hotfixes | **No** | `hotfix/*` → merge → delete hotfix branch |

Historical tags `v1.0.0` … `v2.1.0` stay immutable for Cycles 1–2 storytelling.

### Branch layout

```
main                    Stable secure product (v2.1.0 until SoftDev bumps)
 ├── backend             SoftDev — Nest/API
 ├── frontend            SoftDev — Next UI
 ├── dev                 SoftDev — integration
 ├── ctf/v1.1.0          Frozen Cycle-2 CTF + Red evidence
 ├── remediation/v2.0.0  Frozen Cycle-1 Blue history
 └── remediation/v2.1.0  Frozen Cycle-2 Blue history
```

- **CTF branches** are named by scenario (`ctf/…`), not by inventing a new product `v1.N.0`.
- **Remediation branches** stay frozen after merge for Red/Blue storytelling. Canonical Remediation docs also live on `main`.
- Cycle-N writeups continue under `docs/security/Cycle-N/` (ADR-031). Red trees may live only on the CTF branch (Cycle-2 pattern).

### Cycle docs without product version inflation

Security cycles after Cycle-2 still get `docs/security/Cycle-N/` workspaces. They do **not** require a new product tag unless SoftDev expanded the surface in the same window.

## Consequences

- **Positive:** `vX.Y.Z` tracks real product surface; CTFs stay honest misconfig labs on the current app.
- **Positive:** GitHub branch list keeps SoftDev + frozen CTF/Blue archives for portfolio narrative.
- **Negative / trade-off:** Employers must read ADR-032 / README to understand why Cycle-3 is not `v1.2.0`/`v2.2.0`.
- **Amends ADR-013:** perpetual Red→Blue cycles continue; the *version-pair-per-cycle* rule applies only through Cycle-2.

## References

- [ADR-013](./ADR-013-expansion-cycle-versioning.md) — historical expansion-cycle versioning
- [ADR-015](./ADR-015-branching-strategy.md) — original branching
- [ADR-031](./ADR-031-security-cycle-docs.md) — Cycle-N doc structure
- [future-ctf-candidates.md](../security/Cycle-2/Remediation/future-ctf-candidates.md)
