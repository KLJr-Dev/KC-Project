# Security Cycle 8 — Northwind Intake (tool-forced chain / dual-home)

**Status:** **Closed** · pair **`v1.5.0`** → **`v2.5.0`** · [ADR-036](../../decisions/ADR-036-cycle-8-intake-tool-chain-pair.md) · [ADR-037](../../decisions/ADR-037-immersion-northwind-product-face.md)  
**Gate:** [v2.5.0-secure-ready.md](../../release/v2.5.0-secure-ready.md) (**signed** 2026-08-28)

| Track | Role | Status |
|-------|------|--------|
| Docs / design | P0 decisions, box, GT, brief | **Merged** (#34) |
| Feature lanes → `dev` → `main` | Intentional insecure tip | **Merged** (#35) |
| Tag **`v1.5.0`** (+ `ctf/v1.5.0`) | Pentest-ready insecure tip | **Shipped** |
| PenTest | Red frozen — [writeup on `ctf/v1.5.0`](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.5.0/docs/security/Cycle-8/PenTest/v1.5.0-writeup.md) | **Done** |
| **`remediation/v2.5.0`** → tag **`v2.5.0`** | Hardened Northwind Intake tip | **Done** |

---

## One-line story

**Northwind** portal (corporate skin) + Intake SQLi (FastAPI microservice behind `/api/intake`) → **John** (SMTP hashes) → **Hydra** (weak FTP) → webroot revshell → **sudo nano** → Samba + SMTP. **No graded OpenSSH.** Lab honesty in docs ([ADR-037](../../decisions/ADR-037-immersion-northwind-product-face.md)).

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Secure tip** | tag **`v2.5.0`** / `main` | No |
| **Player / Red replay** | tag/`ctf/v1.5.0` → [player brief](Dev/v1.5.0-player-brief.md) | Brief no · writeup yes |
| **Red writeup** | [PenTest/](PenTest/) index → evidence on `ctf/v1.5.0` | Yes |
| **Blue** | [Remediation/](Remediation/) — frozen `remediation/v2.5.0` | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, execution, GT, brief |
| [PenTest/](PenTest/) | Index; full evidence on `ctf/v1.5.0` |
| [Remediation/](Remediation/) | Blue archive — [plan](Remediation/blue-team-plan.md) · [map](Remediation/v2.5.0-remediation.md) |

## References

- [ADR-036](../../decisions/ADR-036-cycle-8-intake-tool-chain-pair.md)  
- [cycle-8-decisions.md](Dev/cycle-8-decisions.md)  
- Bucket B: FC-19 / FC-20 **Consumed** — [future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)
