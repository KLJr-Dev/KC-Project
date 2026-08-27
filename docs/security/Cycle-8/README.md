# Security Cycle 8 — Northwind Intake (tool-forced chain / dual-home)

**Status:** **P0 FINAL** · pair **`v1.5.0`** → **`v2.5.0`** · baseline **`v2.4.0`** · [ADR-036](../../decisions/ADR-036-cycle-8-intake-tool-chain-pair.md) · [ADR-037](../../decisions/ADR-037-immersion-northwind-product-face.md)  
**Ceiling:** Multi-day OSCP-shaped box — sqlmap → John (SMTP) → Hydra (FTP) → revshell → sudo nano → Samba+SMTP. Cowrie-only SSH theater. **Docker + Kali only**.

| Track | Role | Status |
|-------|------|--------|
| Docs / design | P0 decisions, box, GT, brief | **FINAL** — PR `docs/cycle-8-p0` next |
| Feature lanes → `dev` → `main` | Intentional insecure tip | Pending (after P0 PR) |
| Tag **`v1.5.0`** (+ `ctf/v1.5.0`) | Pentest-ready insecure tip | Pending |
| PenTest | Multi-day Socratic Red; **OSCP-style writeup** ([PenTest/](PenTest/)) | Pending |
| **`remediation/v2.5.0`** → tag **`v2.5.0`** | Close intake plants; unpublish overlays | Pending |

---

## One-line story

**Northwind** portal (corporate skin) + Intake SQLi (FastAPI microservice behind `/api/intake`) → **John** (SMTP hashes) → **Hydra** (weak FTP) → webroot revshell → **sudo nano** → Samba + SMTP. **No graded OpenSSH.** Lab honesty in docs ([ADR-037](../../decisions/ADR-037-immersion-northwind-product-face.md)).

## Why not Cycle-7 again

Cycle-7 allowed **F1 last** (LFI independent of FTP→SSH→pivot) and **orphan creds** (loot spoon-fed bastion). Cycle-8 uses a **hard dependency DAG** + **credential ledger** (LIVE / DECOY / NOISE / DEMO) so every planted secret has a consumer or an intentional rabbit-hole class.

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Secure tip (after Blue)** | tag `v2.5.0` / `main` | No |
| **Player / Red replay** | tag/`ctf/v1.5.0` → [player brief](Dev/v1.5.0-player-brief.md) | Brief no · writeup yes |
| **Red writeup** | PenTest/ (after freeze) | Yes |
| **Blue** | Remediation/ (after Red) | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, execution, GT, brief |
| [PenTest/](PenTest/) | Index; full evidence on `ctf/v1.5.0`. **From Cycle-8:** OSCP+ exam-report depth (exam practice) — see PenTest README |
| [Remediation/](Remediation/) | Finding → fix map (after Red) |

## References

- [ADR-036](../../decisions/ADR-036-cycle-8-intake-tool-chain-pair.md)  
- [cycle-8-decisions.md](Dev/cycle-8-decisions.md)  
- Bucket B: [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)  
- Cowrie: https://github.com/cowrie/cowrie  
