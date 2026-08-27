# Cycle-7 — Dev workspace

| Doc | Role |
|-----|------|
| [cycle-7-decisions.md](cycle-7-decisions.md) | Locked product / packaging / pedagogy |
| [v1.4.0-box-plan.md](v1.4.0-box-plan.md) | Player path + ceiling |
| [v1.4.0-execution-plan.md](v1.4.0-execution-plan.md) | Feature-lane runbook P0–P7 |
| [v1.4.0-ground-truth.md](v1.4.0-ground-truth.md) | Examiner only |
| [v1.4.0-player-brief.md](v1.4.0-player-brief.md) | Progressive hints |
| [v1.4.0-stride-lite.md](v1.4.0-stride-lite.md) | Threat notes |

**P2 Slice 1 (backend):** `GET /api/ops/documents?path=` — library root `backend/ops-docs/library/`; F1 via `path=../plants/cycle7-f1.txt`.  
**P2 Slice 2 (infra):** `infra/docker-compose.cycle7.yml` — FTP/bastion/Cowrie/jump; plants under `infra/cycle7/`; `./infra/cycle7-examiner.sh`.  
**P2 Slice 3 (frontend):** `/ops` path viewer + tip strings `v1.4.0`.  
**P4:** [v1.4.0-integration-status.md](v1.4.0-integration-status.md) — smoke/journey/examiner green on `dev`.

**Branching for P0:** `docs/cycle-7-p0` → PR → `main`. Product code on feature lanes after P0 merges.
