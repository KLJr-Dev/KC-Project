# Security Cycle 7 — Northwind Ops (multi-service / LFI + overlays)

**Status:** **Closed** · Red frozen `ctf/v1.4.0` · Blue tagged **`v2.4.0`** · frozen `remediation/v2.4.0` · [ADR-035](../../decisions/ADR-035-cycle-7-multi-service-pair.md)  
**Versions:** `v1.4.0` (intentional insecure) → Red → `v2.4.0` (hardened)  
**Consumes:** FC-14 (FTP) · FC-18 (LFI) — **Consumed**

| Track | Role | Status |
|-------|------|--------|
| Tag **`v1.4.0`** (+ archive `ctf/v1.4.0`) | Pentest-ready insecure tip | **Shipped** |
| PenTest | Multi-day Socratic Red | **Complete** — [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.4.0/docs/security/Cycle-7/PenTest/v1.4.0-writeup.md) (5/5) |
| Tag **`v2.4.0`** | Ops path confinement + overlays unpublished | **Shipped** — [secure-ready](../../release/v2.4.0-secure-ready.md) · [Remediation/](Remediation/) |

---

## One-line story

KC **Ops Documents** LFI → forgotten **FTP** → real **SSH** (Cowrie decoy) → **sudo find** → tunnel to **internal jump** → Blue closes LFI and unpublishes overlays.

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Secure tip** | tag `v2.4.0` / `main` | No |
| **Player / Red replay** | tag/`ctf/v1.4.0` → [player brief](Dev/v1.4.0-player-brief.md) · [USAGE](../../../USAGE.md) | Brief no · writeup yes |
| **Red writeup** | [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.4.0/docs/security/Cycle-7/PenTest/v1.4.0-writeup.md) | Yes |
| **Blue (guided)** | [blue-handoff.md](Remediation/blue-handoff.md) | Handoff no · full map/writeup yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, execution, GT, brief |
| [PenTest/](PenTest/) | Index; full evidence on `ctf/v1.4.0` |
| [Remediation/](Remediation/) | Finding → fix map, residuals, Blue plan |

## References

- [ADR-035](../../decisions/ADR-035-cycle-7-multi-service-pair.md)  
- Bucket B: [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)  
- Cowrie (decoy): https://github.com/cowrie/cowrie  
