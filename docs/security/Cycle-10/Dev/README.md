# Cycle-10 — Dev workspace

**Status:** SoftDev **frozen** (`v1.10.0` / `ctf/v1.10.0`) · pair → **`v2.10.0`** ([ADR-039](../../../decisions/ADR-039-cycle-10-enterprise-pair.md)) · [pentest-ready](../../../release/v1.10.0-pentest-ready.md)

| Doc | Role |
|-----|------|
| [cycle-10-decisions.md](cycle-10-decisions.md) | Locked packaging / path / RBAC / gates / naming |
| [v1.10.0-summary.md](v1.10.0-summary.md) | One-page human summary |
| [v1.10.0-box-plan.md](v1.10.0-box-plan.md) | Player path + ceiling |
| [v1.10.0-softdev-plan.md](v1.10.0-softdev-plan.md) | Inside-out B1–B10 + lanes |
| [v1.10.0-execution-plan.md](v1.10.0-execution-plan.md) | P0–P7 runbook |
| [v1.10.0-stride-lite.md](v1.10.0-stride-lite.md) | Threat notes |
| [v1.10.0-auth-flow.md](v1.10.0-auth-flow.md) | Access request → moderator → packets |
| [v1.10.0-data-model.md](v1.10.0-data-model.md) | New packet entities + existing DBs |
| [v1.10.0-credential-ledger.md](v1.10.0-credential-ledger.md) | LIVE / NOISE / DECOY |
| [v1.10.0-reachability-matrix.md](v1.10.0-reachability-matrix.md) | fw allow/deny |
| [v1.10.0-ground-truth.md](v1.10.0-ground-truth.md) | Examiner (flags + gates) |
| [v1.10.0-player-brief.md](v1.10.0-player-brief.md) | Player brief · full RoE · progressive hints |
| [packets-openapi-stub.yaml](packets-openapi-stub.yaml) | Nest packet API stub (SoT is Nest) |

**Diagrams:** [topology](../../../diagrams/c10-v1.10.0-topology.md) · [auth](../../../diagrams/c10-v1.10.0-auth-flow.md) · [attack](../../../diagrams/c10-v1.10.0-attack-graph.md) · [dependency](../../../diagrams/c10-v1.10.0-dependency-graph.md)

**Skin:** [ADR-037](../../../decisions/ADR-037-immersion-northwind-product-face.md)  
**Lab packaging:** [`infra/docker-compose.cycle10-lab.yml`](../../../../infra/docker-compose.cycle10-lab.yml) + [`infra/cycle10-examiner.sh`](../../../../infra/cycle10-examiner.sh) (infra plants + Nest packets RBAC).
