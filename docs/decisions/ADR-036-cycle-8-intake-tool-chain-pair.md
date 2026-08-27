# ADR-036: Cycle-8 Intake Tool-Chain Product Expansion Pair (v1.5.0 → v2.5.0)

**Status:** Accepted (amends [ADR-032](./ADR-032-post-v2.1.0-versioning.md) for product-expansion security cycles; parallel to [ADR-035](./ADR-035-cycle-7-multi-service-pair.md))

**Date:** 2026-08-27

---

## Context

Cycle-7 shipped multi-service LFI + FTP/SSH/Cowrie/jump (`v1.4.0` → `v2.4.0`). Red cleared 5/5 but **engagement order diverged** from design (FTP→SSH→pivot first; Ops LFI **F1 last**), loot **spoon-fed** the real SSH port, and some written credentials were never required. Portfolio OSCP practice still needs **tool-forced** tradecraft (sqlmap, John, Hydra, revshell listeners) with **credential noise**, without a Windows VM (Kali + Docker only).

Cycle-8 adds a **FastAPI Intake microservice** (proxied through the Nest edge — not a second public product stack) plus overlays (Cowrie-as-only-SSH, **weak FTP** for Hydra, dual-home Samba+SMTP), with a **hard dependency DAG** and **credential ledger** so graded gates cannot be skipped and **John/Hydra are not redundant**.

## Decision

### When a version pair is earned

| Work | Tags | Branch pattern |
|------|------|----------------|
| Product expansion + lab overlays | **`v1.5.0`** (intentional insecure) → **`v2.5.0`** (hardened) | Feature lanes → `dev` → `main`; archive `ctf/v1.5.0`; Blue `remediation/v2.5.0` |
| CTF-only tip misconfig | **No** product bump | `ctf/<scenario>` ([ADR-032](./ADR-032-post-v2.1.0-versioning.md)) |

### Cycle-8 scope (locked)

| Layer | Insecure `v1.5.0` | Hardened `v2.5.0` |
|-------|-------------------|-------------------|
| **Web** | FastAPI Intake **SQLi** (proxied under Nest `/api/intake`) + FTP→webroot foothold | Parameterize Intake; unpublish FTP/shell plants |
| **Overlays** | Cowrie `:22`, **LIVE weak FTP** `:21`, internal Samba+SMTP, sudo nano | Unpublished on default prod |
| **Cred tools** | John → SMTP hashes; Hydra → FTP (**different** secrets) | No weak hash/FTP plants on tip |
| **Flags** | Five `OS{32hex}` on dependency DAG | Absent from tip |
| **Ceiling** | Revshell → nano GTFO → pivot | No shell plants on tip |
| **Out** | AD · Windows VM · Word/macros · graded OpenSSH · docker escape · Cycle-7 LFI re-break · parallel public FastAPI product port | — |

### Design constraints (anti–Cycle-7 drift)

- Every graded flag consumes prior gate output (no independent “bolt-on” F1).  
- Credential ledger: LIVE / DECOY / NOISE / DEMO — **orphan LIVE secrets forbidden**.  
- No cleartext foothold gift; no player-brief spoilers that kill Cowrie.  
- Baseline tip before build: **`v2.4.0`**.

### Docs / implementation branching

- **P0 design:** `docs/cycle-8-p0` → **PR into `main`**.  
- **Product + infra code:** `backend` / `frontend` → `dev` → `main` only after P0 merges ([ADR-015](./ADR-015-branching-strategy.md)).

### Preferred terminology

Same as [ADR-035](./ADR-035-cycle-7-multi-service-pair.md): product expansion cycle · feature lanes · intentional insecure release · Security SDL.

## Consequences

- **Positive:** Forces sqlmap/John/Hydra/revshell DoD; multi-tech Intake surface justifies version pair; Docker-only keeps lab reproducible on Mac + Kali.  
- **Positive:** Explicit ledger prevents unused-cred design bugs.  
- **Trade-off:** Heavier infra than single-service AppSec cycles; examiner must assert DAG (no SSH backdoor, empty FTP).  
- **Deferred:** Full AD, Windows client-side (Word/Library-ms) to Portfolio VM track, FC-13 escape.

## References

- [Cycle-8 decisions](../security/Cycle-8/Dev/cycle-8-decisions.md) · [ADR-037](./ADR-037-immersion-northwind-product-face.md) (immersion skin) · [future-ctf-candidates.md](../security/Cycle-2/Remediation/future-ctf-candidates.md)  
- [ADR-015](./ADR-015-branching-strategy.md) · [ADR-031](./ADR-031-security-cycle-docs.md) · [ADR-035](./ADR-035-cycle-7-multi-service-pair.md)
