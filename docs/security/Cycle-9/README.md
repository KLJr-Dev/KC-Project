# Security Cycle 9 — Northwind Onboarding + Weak Defence

**Status:** **Red open** · pair **`v1.6.0`** → **`v2.6.0`** · [ADR-038](../../decisions/ADR-038-cycle-9-onboarding-defence-pair.md) · skin [ADR-037](../../decisions/ADR-037-immersion-northwind-product-face.md)  
**Baseline tip:** tag **`v1.6.0`** on `main` · archive **`ctf/v1.6.0`**

| Track | Role | Status |
|-------|------|--------|
| Docs / design | P0 decisions, box, STRIDE, OpenAPI | **Merged (#37)** |
| Feature lanes → `dev` → `main` | Intentional insecure tip | **Shipped** ([#38](https://github.com/KLJr-Dev/KC-Project/pull/38)) |
| Tag **`v1.6.0`** (+ `ctf/v1.6.0`) | Pentest-ready insecure tip | **Shipped** ([pentest-ready](../../release/v1.6.0-pentest-ready.md)) |
| PenTest | Red writeup | **Open** on **`ctf/v1.6.0`** |
| **`remediation/v2.6.0`** → tag **`v2.6.0`** | Hardened lab ceiling (~80% v2.5.0 gaps) | Pending |

---

## One-line story

**Platform** (Nest/Next) fronts **Onboarding squad** (FastAPI) via a thin BFF. Onboarding/HR **`/onboarding-requests`** trusts hop headers; IDOR → race approve → **export path traversal** → SIEM leak. Honeypot says **services alerted**. Medium AppSec; **no** infra tool-chain. Blue: Intake verifies RS256 + ~80% Wave B; production + deep log analysis wait for **`v*.10.0` / Cycle-11+**.

## Portfolio paths

| Audience | Start here | Spoilers? |
|----------|------------|-----------|
| **Secure tip (today)** | tag **`v2.5.0`** / `main` | No |
| **Player / Red** | tag/`ctf/v1.6.0` → [player brief](Dev/v1.6.0-player-brief.md) | Brief no · writeup yes |
| **Red writeup** | [PenTest/](PenTest/) | Yes |
| **Blue** | [Remediation/](Remediation/) | Yes |

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Decisions, box, execution, GT, brief, STRIDE |
| [PenTest/](PenTest/) | Index; full evidence on `ctf/v1.6.0` when frozen |
| [Remediation/](Remediation/) | Blue plan / map / residuals (after Red) |

## Grill locks (summary)

Full Grill-1 + Grill-2: [Dev/cycle-9-decisions.md](Dev/cycle-9-decisions.md) §J.

**Highlights:** Nest **BFF** → FastAPI (no nginx→Intake direct) · Platform vs Onboarding squad · `/onboarding-requests` · export **`file=` path traversal** · SIEM on FastAPI · honeypot `/v1/internal/debug` · [OpenAPI stub](Dev/intake-openapi-stub.yaml).

## References

- [ADR-038](../../decisions/ADR-038-cycle-9-onboarding-defence-pair.md)  
- [cycle-9-decisions.md](Dev/cycle-9-decisions.md) · [intake-openapi-stub.yaml](Dev/intake-openapi-stub.yaml)  
- Bucket B: FC-05, FC-12 (+ logging / export PT) — [future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md)
