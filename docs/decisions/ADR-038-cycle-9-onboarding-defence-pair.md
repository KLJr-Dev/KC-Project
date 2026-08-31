# ADR-038: Cycle-9 Onboarding + Weak-Defence Product Expansion Pair (v1.6.0 → v2.6.0)

**Status:** Accepted (P0 FINAL on `docs/cycle-9-p0`) — amends [ADR-032](./ADR-032-post-v2.1.0-versioning.md); parallel to [ADR-036](./ADR-036-cycle-8-intake-tool-chain-pair.md)

**Date:** 2026-08-31

---

## Context

Cycle-8 shipped FastAPI Intake as a **search sidecar** plus an OSCP-shaped tool chain (`v1.5.0` → `v2.5.0`). Secure tip `v2.5.0` closed SQLi and overlays but left Intake **unauthenticated** at the edge (nginx → FastAPI direct), running as **DB admin**, with a large lab-residual inventory.

Portfolio next chapter should:

1. **Deepen Intake** into a real FastAPI domain owned like a **second team** (Python/FastAPI for ease-of-use), while Nest/Next remains the **platform** edge.
2. Feature **weak defence** (SIEM/logging theatre) as a graded finding class.
3. Blue (`v2.6.0`) closes Cycle-9 plants **and** ~80% of v2.5.0 absolute gaps; production-grade leftovers wait for **Cycle-10 / `v*.10.0`**.

## Decision

### When a version pair is earned

| Work | Tags | Branch pattern |
|------|------|----------------|
| Product expansion (onboarding + Security Ops UI) | **`v1.6.0`** → **`v2.6.0`** | Feature lanes → `dev` → `main`; `ctf/v1.6.0`; `remediation/v2.6.0` |
| CTF-only tip misconfig | **No** product bump | `ctf/<scenario>` ([ADR-032](./ADR-032-post-v2.1.0-versioning.md)) |

### Two-team microservice model

| Team | Stack | Responsibility |
|------|-------|----------------|
| **Platform** | NestJS + Next.js + nginx | AuthN (JWT), product UI, **thin BFF** for `/api/intake/*` |
| **Onboarding squad** | FastAPI + `kc_intake` | Onboarding-requests domain, export, bolted-on `/security/events` |

**Edge change vs `v2.5.0`:** nginx must **not** proxy `/api/intake/` directly to FastAPI. Browser → Nest BFF → FastAPI (internal upstream). **Not a parallel product** — one published face (`/api/intake/*` via Nest); Next never calls Intake directly.

**Insecure tip:** BFF forwards client `X-User-Id` / `X-User-Role` if present, else fills from JWT; Intake trusts headers.  
**Blue:** BFF does not forward spoofable identity headers; Intake verifies **RS256** with mounted `jwt-public.pem` (shared IdP).

**Logging:** Nest keeps auth/audit; FastAPI owns bolted-on `/security/events` (graded weak-defence plant); Nest `/admin/security` is posture theatre. Request-ID correlation is Wave B.

### Cycle-9 scope (locked)

| Layer | Insecure `v1.6.0` | Hardened `v2.6.0` |
|-------|-------------------|-------------------|
| **Product** | `/onboarding-requests` + export + FastAPI SIEM events + posture UI | Same features; secure authz / confinement / race-safe |
| **Plants** | Header trust; IDOR; status race; export path traversal; SIEM leak; honeypot decoy | Closed |
| **Overlays** | None (tip-baked plants) | N/A |
| **Wave B** | — | Least-priv Intake DB, intake rate limit, non-root, internal DB net, secret assert, request-ID |
| **Deferred** | — | TLS-only, Docker Secrets, RO fs, strict CSP, demo strip → **`v2.10.0`** |

### Post-Cycle-9 versioning

Next pair after `v2.6.0`: **`v1.10.0` → `v2.10.0`**. Versions 1.7–1.9 / 2.7–2.9 unused. Deep log-analysis Blue Team → Cycle-11+.

### Design constraints

- Baseline: **`v2.5.0`**.
- Do not re-break Preview SSRF, CSRF, Notes XSS, **Ops Documents LFI**, Intake SQLi.
- Export path traversal is a **new** Intake plant (not Ops reprise).
- FastAPI stays **internal** (no parallel public product port).
- Northwind skin ([ADR-037](./ADR-037-immersion-northwind-product-face.md)).
- Flags: **4 graded** + honeypot (“services alerted”).
- Nest BFF is **thin** — FastAPI is source of truth for onboarding-requests.

### Docs / branching

- **P0:** `docs/cycle-9-p0` → PR → `main` (includes [intake-openapi-stub.yaml](../security/Cycle-9/Dev/intake-openapi-stub.yaml)).
- SoftDev: `backend` / `frontend` / `intake` → `dev` → `main` after P0 ([ADR-015](./ADR-015-branching-strategy.md)).

## Consequences

- **Positive:** Realistic multi-team trust-boundary pedagogy; Nest/Next stays platform; FastAPI stays the “other squad’s” service.
- **Positive:** Path traversal practice without undoing Cycle-7 Ops confinement.
- **Trade-off:** SoftDev must rewire nginx + Nest BFF (breaking change vs v2.5.0 Intake edge).
- **Deferred:** Production baseline leftovers → `v2.10.0`; SIEM curriculum → Cycle-11+.

## References

- [cycle-9-decisions.md](../security/Cycle-9/Dev/cycle-9-decisions.md) · [box plan](../security/Cycle-9/Dev/v1.6.0-box-plan.md) · [OpenAPI stub](../security/Cycle-9/Dev/intake-openapi-stub.yaml)
- [future-ctf-candidates.md](../security/Cycle-2/Remediation/future-ctf-candidates.md) — FC-05, FC-12
- [ADR-015](./ADR-015-branching-strategy.md) · [ADR-031](./ADR-031-security-cycle-docs.md) · [ADR-036](./ADR-036-cycle-8-intake-tool-chain-pair.md) · [ADR-037](./ADR-037-immersion-northwind-product-face.md)
