# Security Cycle 7 — Northwind Ops (multi-service / LFI + overlays)

**Status:** **P0 design** on `docs/cycle-7-p0` · baseline tip **`v2.3.0`** · pair **`v1.4.0` → `v2.4.0`** · [ADR-035](../../decisions/ADR-035-cycle-7-multi-service-pair.md)  
**Ceiling:** Multi-day OSCP-shaped box — LFI, FTP, SSH, sudo GTFO, dual-home pivot, Cowrie decoy. **Not** a same-day micro CTF.

| Track | Role | Status |
|-------|------|--------|
| Docs / design | P0 decisions, box, execution, GT, brief | **In progress** (`docs/cycle-7-p0`) |
| Feature lanes → `dev` | Intentional insecure tip | Pending P1+ |
| Tag **`v1.4.0`** (+ `ctf/v1.4.0`) | Pentest-ready insecure tip | Pending |
| PenTest | Multi-day Socratic Red | Pending |
| **`remediation/v2.4.0`** → tag **`v2.4.0`** | Close LFI; unpublish overlays | Pending |

---

## One-line story

KC **Ops Documents** LFI → forgotten **FTP** → real **SSH** (Cowrie decoy) → **sudo find** → tunnel to **internal jump** intranet proof.

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Dev / build** | [Dev/v1.4.0-execution-plan.md](Dev/v1.4.0-execution-plan.md) · [decisions](Dev/cycle-7-decisions.md) | Yes |
| **Player** | [Dev/v1.4.0-player-brief.md](Dev/v1.4.0-player-brief.md) | No |
| **Red** | PenTest/ (after tip ships) | Yes |
| **Blue** | Remediation/ (after Red) | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, execution, GT, brief |
| [PenTest/](PenTest/) | Writeup, screenshots |
| [Remediation/](Remediation/) | Finding → fix after Red |

## References

- [ADR-035](../../decisions/ADR-035-cycle-7-multi-service-pair.md)  
- Bucket B: [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)  
- Cowrie (decoy): https://github.com/cowrie/cowrie  
