# Security Cycle 7 — Northwind Ops (multi-service / LFI + overlays)

**Status:** **Tip shipped** · tag **`v1.4.0`** · archive **`ctf/v1.4.0`** · Red pending · pair → **`v2.4.0`** · [ADR-035](../../decisions/ADR-035-cycle-7-multi-service-pair.md)  
**Ceiling:** Multi-day OSCP-shaped box — LFI, FTP, SSH, sudo GTFO, dual-home pivot, Cowrie decoy. **Not** a same-day micro CTF.

| Track | Role | Status |
|-------|------|--------|
| Docs / design | P0 decisions, box, execution, GT, brief | **Done** (#31) |
| Feature lanes → `dev` → `main` | Intentional insecure tip | **Done** (#32) · [integration](Dev/v1.4.0-integration-status.md) |
| Tag **`v1.4.0`** (+ `ctf/v1.4.0`) | Pentest-ready insecure tip | **Shipped** · [pentest-ready](../../release/v1.4.0-pentest-ready.md) |
| PenTest | Multi-day Socratic Red | **Ready to start** |
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
