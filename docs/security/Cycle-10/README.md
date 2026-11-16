# Security Cycle 10 — Northwind enterprise lab + production showcase

**Status:** **Red frozen** · Blue active on **`remediation/v2.10.0`** → tag **`v2.10.0`** · tip **`v1.10.0`** / **`ctf/v1.10.0`** · [ADR-039](../../decisions/ADR-039-cycle-10-enterprise-pair.md) · skin [ADR-037](../../decisions/ADR-037-immersion-northwind-product-face.md) · [pentest-ready](../../release/v1.10.0-pentest-ready.md)

| Track | Tip / branch | Role |
|-------|--------------|------|
| **SoftDev** | tag **`v1.10.0`** / **`ctf/v1.10.0`** | Five-zone lab + document-packet plant chain — **done** |
| **Red** | `ctf/v1.10.0` | HTB/OSCP-style full compromise writeup — **next** |
| **Blue** | `remediation/v2.10.0` → tag **`v2.10.0`** | Zero accepted security residuals |

**Topology:** [c10-v1.10.0-topology.md](../../diagrams/c10-v1.10.0-topology.md)

## Folders

| Path | Role |
|------|------|
| [Dev/](Dev/) | Decisions, box plan, SoftDev/execution, STRIDE, auth, data, ledger, matrix |
| [PenTest/](PenTest/) | Red evidence (after freeze) |
| [Remediation/](Remediation/) | Blue handoff / plan / map / residuals |

## Graded spine (short)

Anonymous → hidden access dir → `moderator` → packet upload → `docproc` shell → local/proof → `db-archive` → **mail required** → files → `integrate` → `bastion` crown (only from integrate + secret after `docproc` root).

## Related

- [STRATEGY](../../roadmap/STRATEGY.md) · [future-ctf-candidates](../Cycle-2/Remediation/future-ctf-candidates.md)  
- Releases: [v1.10.0-pentest-ready](../../release/v1.10.0-pentest-ready.md) (**signed**) · [v2.10.0-secure-ready](../../release/v2.10.0-secure-ready.md) (unsigned — Blue)
