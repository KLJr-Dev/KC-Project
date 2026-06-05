# ADR-027: STRATEGY.md as Canonical Roadmap Authority

**Status:** Accepted

**Date:** March 2026 (v0.4.6 documentation reconciliation)

---

## Context

KC-Project accumulated three competing version numbering schemes:

1. **ROADMAP Version Semantics** (v0.5 = deployment, v0.6 = observability)
2. **ROADMAP body** (v0.5 = file handling, v0.6 = sharing, v0.7 = admin — duplicated v0.3/v0.4 work)
3. **ADR-026 Option B** (similar duplication, infrastructure at v0.9)

[`STRATEGY.md`](../roadmap/STRATEGY.md) (March 2026) consolidates the path to v1.0.0 with:

- v0.5.x — foundation refinement (validation, pagination, errors, logging)
- v0.6.x — admin polish (audit DB, search, stats)
- v0.7.x — Docker + compose + nginx
- v0.8.x — API/docs lock
- v0.9.x — MVP freeze and release candidate
- v1.0.0 — pentest-ready insecure MVP tag (60–80 CWEs, mandatory Docker)

## Decision

Adopt **STRATEGY.md as the single strategic authority** for v0.5 onward. All other documents derive execution detail from it:

| Document | Role |
|----------|------|
| [`STRATEGY.md`](../roadmap/STRATEGY.md) | Vision, CWE targets, deployment model, expansion cycle |
| [`ROADMAP.md`](../roadmap/ROADMAP.md) | Version-by-version tasks, checklists, metrics (derived from STRATEGY) |
| `v0.N.x-summary.md` | Phase retrospectives after each surface closes |

Superseded ROADMAP sections (v0.5 file handling, v0.6 sharing, v0.7 admin duplicates) remain in place with banners pointing to v0.3.x/v0.4.x and STRATEGY.

ADR-026 remains accepted for expansion-cycle philosophy (v1.x / v2.x) but its v0.5–v0.8 patch numbering is amended — see Amendment in ADR-026.

## Consequences

- **Positive:** One source of truth for "what version means what"; no duplicate feature work.
- **Positive:** v1.0.0 criteria align with 60–80 CWE target and mandatory Docker.
- **Negative:** Historical ROADMAP sections look stale until readers follow superseded banners.
- **Action:** Update Version Semantics, version-timeline, requirements NFR tags, infra README when STRATEGY changes.

## References

- [STRATEGY.md](../roadmap/STRATEGY.md)
- [ADR-026 Amendment](ADR-026-versioning-expansion-cycle.md)
- [ADR-013](ADR-013-expansion-cycle-versioning.md) — perpetual v1/v2 cycle unchanged
