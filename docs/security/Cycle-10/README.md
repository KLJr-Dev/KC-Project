# Security Cycle 10 — Northwind enterprise lab + production showcase

**Status:** **Red frozen** — tip **`v1.10.0`** / **`ctf/v1.10.0`** · **3/3** proofs · next **Blue `v2.10.0`** · [ADR-039](../../decisions/ADR-039-cycle-10-enterprise-pair.md) · skin [ADR-037](../../decisions/ADR-037-immersion-northwind-product-face.md) · [pentest-ready](../../release/v1.10.0-pentest-ready.md)

| Track | Tip / branch | Role |
|-------|--------------|------|
| **SoftDev** | tag **`v1.10.0`** / **`ctf/v1.10.0`** | Five-zone lab + document-packet plant chain — **done** |
| **Red** | `ctf/v1.10.0` | Full compromise writeup — **frozen** ([PenTest/v1.10.0-writeup.md](PenTest/v1.10.0-writeup.md)) |
| **Blue** | `remediation/v2.10.0` → tag **`v2.10.0`** | Zero accepted security residuals — **next** |

**Topology:** [c10-v1.10.0-topology.md](../../diagrams/c10-v1.10.0-topology.md)

## Folders

| Path | Role |
|------|------|
| [Dev/](Dev/) | Decisions, box plan, SoftDev/execution, STRIDE, auth, data, ledger, matrix |
| [PenTest/](PenTest/) | Red evidence (after freeze) |
| [Remediation/](Remediation/) | Blue plan / map / residuals (after Red) |

## Graded spine (short)

Anonymous → `/staff-access/` → `moderator` → packet upload → `docproc` shell → local/proof → `db-archive` → **mail required** → files → `integrate` → `bastion` crown (only from integrate + secret after `docproc` root). Host face: **HTTPS `:443` only**.

## Red start

```bash
git checkout ctf/v1.10.0
# full RoE + lab start:
# docs/security/Cycle-10/Dev/v1.10.0-player-brief.md
```

| Audience | Doc |
|----------|-----|
| Player / RoE | [Dev/v1.10.0-player-brief.md](Dev/v1.10.0-player-brief.md) |
| Examiner **`[SPOILER]`** | [Dev/v1.10.0-ground-truth.md](Dev/v1.10.0-ground-truth.md) |
| Writeup | [PenTest/](PenTest/) on `ctf/v1.10.0` |

## Related

- [STRATEGY](../../roadmap/STRATEGY.md) · [future-ctf-candidates](../Cycle-2/Remediation/future-ctf-candidates.md)  
- Releases: [v1.10.0-pentest-ready](../../release/v1.10.0-pentest-ready.md) (**signed**) · [v2.10.0-secure-ready](../../release/v2.10.0-secure-ready.md) (scaffold)
