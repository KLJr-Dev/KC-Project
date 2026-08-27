# Security Cycle 7 — Northwind Ops (multi-service / LFI + overlays)

**Status:** **Red frozen** · tip tag **`v1.4.0`** · archive **`ctf/v1.4.0`** · Blue on **`remediation/v2.4.0`** → **`v2.4.0`** · [ADR-035](../../decisions/ADR-035-cycle-7-multi-service-pair.md)  
**Ceiling:** Multi-day OSCP-shaped box — LFI, FTP, SSH, sudo GTFO, dual-home pivot, Cowrie decoy. **Not** a same-day micro CTF.

| Track | Role | Status |
|-------|------|--------|
| Docs / design | P0 decisions, box, execution, GT, brief | **Done** (#31) |
| Feature lanes → `dev` → `main` | Intentional insecure tip | **Done** (#32) · [integration](Dev/v1.4.0-integration-status.md) |
| Tag **`v1.4.0`** (+ `ctf/v1.4.0`) | Pentest-ready insecure tip | **Shipped** · [pentest-ready](../../release/v1.4.0-pentest-ready.md) |
| PenTest | Multi-day Socratic Red | **Frozen** — [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.4.0/docs/security/Cycle-7/PenTest/v1.4.0-writeup.md) (5/5) |
| **`remediation/v2.4.0`** → tag **`v2.4.0`** | Close LFI; unpublish overlays | **In progress** · [Remediation/](Remediation/) · [secure-ready](../../release/v2.4.0-secure-ready.md) |

---

## One-line story

KC **Ops Documents** LFI → forgotten **FTP** → real **SSH** (Cowrie decoy) → **sudo find** → tunnel to **internal jump** intranet proof.

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Secure tip (after Blue)** | tag `v2.4.0` / `main` | No |
| **Player / Red replay** | tag/`ctf/v1.4.0` → [player brief](Dev/v1.4.0-player-brief.md) | Brief no · writeup yes |
| **Red writeup** | [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.4.0/docs/security/Cycle-7/PenTest/v1.4.0-writeup.md) | Yes |
| **Blue** | [Remediation/](Remediation/) · [v2.4.0-secure-ready](../../release/v2.4.0-secure-ready.md) | Yes |

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
