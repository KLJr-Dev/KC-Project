# Security Cycle 9 — Northwind Onboarding + Weak Defence

**Status:** **Closed** · pair **`v1.6.0`** → **`v2.6.0`** · [ADR-038](../../decisions/ADR-038-cycle-9-onboarding-defence-pair.md) · skin [ADR-037](../../decisions/ADR-037-immersion-northwind-product-face.md)  
**Insecure tip:** tag **`v1.6.0`** · archive **`ctf/v1.6.0`**  
**Secure tip:** tag **`v2.6.0`** · branch **`remediation/v2.6.0`** (frozen after merge)

| Track | Role | Status |
|-------|------|--------|
| Docs / design | P0 decisions, box, STRIDE, OpenAPI | **Merged (#37)** |
| Feature lanes → `dev` → `main` | Intentional insecure tip | **Shipped** ([#38](https://github.com/KLJr-Dev/KC-Project/pull/38)) |
| Tag **`v1.6.0`** (+ `ctf/v1.6.0`) | Pentest-ready insecure tip | **Shipped** ([pentest-ready](../../release/v1.6.0-pentest-ready.md)) |
| PenTest | Red writeup | **Frozen** on **`ctf/v1.6.0`** |
| **`remediation/v2.6.0`** → tag **`v2.6.0`** | Hardened lab ceiling (~80% gaps) | **Closed** ([secure-ready](../../release/v2.6.0-secure-ready.md)) |

---

## One-line story

**Platform** (Nest/Next) fronts **Onboarding squad** (FastAPI) via a thin BFF. On insecure tip, onboarding/HR **`/onboarding-requests`** trusted hop headers; IDOR → approve → **export path traversal** → SIEM leak. Blue (`v2.6.0`): Intake verifies RS256, object authz, export confinement, SIEM authz+redact, Wave B hardening.

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Secure tip (today)** | tag **`v2.6.0`** / `main` | No |
| **Player / Red** | tag/`ctf/v1.6.0` → [player brief](Dev/v1.6.0-player-brief.md) | Brief no · writeup yes |
| **Red writeup** | [PenTest/](PenTest/) on `ctf/v1.6.0` | Yes |
| **Blue** | [Remediation/](Remediation/) | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, execution, GT, brief, STRIDE |
| [PenTest/](PenTest/) | Red evidence on `ctf/v1.6.0` |
| [Remediation/](Remediation/) | Blue plan / map / residuals / handoff |

## References

- [ADR-038](../../decisions/ADR-038-cycle-9-onboarding-defence-pair.md)  
- [cycle-9-decisions.md](Dev/cycle-9-decisions.md) · [v2.6.0-secure-ready.md](../../release/v2.6.0-secure-ready.md)  
- Bucket B: FC-05, FC-12 **Consumed** — [future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)
