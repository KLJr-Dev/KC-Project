# Project Specification

> **v1.0.0 baseline** — Pentest-ready insecure MVP. Docker prod at `http://localhost:8080`. 59 CWE instances / 38 unique IDs. 150 e2e tests. See [v1.0.0-pentest-ready.md](../release/v1.0.0-pentest-ready.md).

Formal specification documents for KC-Project. These define what the system is, what it must do, who uses it, and what "secure" looks like.

Unlike the [roadmap](../roadmap/) (which defines the build order) and [architecture](../architecture/) (which describes how the system is structured), the spec documents answer **what** and **why** at a project level.

---

## Contents

### [scope.md](scope.md)

System type, core functionality, design characteristics, security context, lifecycle orientation, product UI vs API boundary, and explicit in-scope / out-of-scope boundaries.

### [requirements.md](requirements.md)

Functional, non-functional, and security requirements grouped by domain and tagged with the roadmap version they are introduced.

### [personas.md](personas.md)

Primary stakeholders (developer, pentester, security engineer) and in-app user personas (regular user, moderator, admin, visitor, attacker).

### [security-baseline.md](security-baseline.md)

Target security controls for v2.0.0 (the hardened counterpart). The "done" checklist that v1.N.x pentesting works toward. Each control references the CWE it remediates.

---

## Cycle-1 artifact pairing (ADR-031)

| Insecure version | Dev artifact | PenTest artifact | Secure version | Remediation artifact |
|------------------|--------------|------------------|----------------|----------------------|
| v1.0.0 | [Dev/v1.0.0-ground-truth.md](../security/Cycle-1/Dev/v1.0.0-ground-truth.md) | [PenTest/v1.0.0-writeup.md](../security/Cycle-1/PenTest/v1.0.0-writeup.md) | v2.0.0 | [Remediation/v2.0.0-remediation.md](../security/Cycle-1/Remediation/v2.0.0-remediation.md) |

Shared cross-cycle: [cwe-inventory.md](../security/cwe-inventory.md), [security-baseline.md](security-baseline.md).

---

## Deployment paths

| Path | Compose file | Entry | Use |
|------|--------------|-------|-----|
| **Prod / pentest (mandatory for v1.0.x)** | `infra/docker-compose.prod.yml` | `http://localhost:8080` | Full stack: nginx → frontend + backend → postgres (`kc_prod`) |
| **Dev (native)** | `infra/compose.yml` | DB `:5432` only | PostgreSQL `kc_dev`; backend/frontend via `npm run start:dev` |

Verify: `./infra/smoke-test.sh`, `./infra/journey-test.sh`, `./infra/e2e-docker.sh` (150 tests).

---

## Tooling (NFR-2.5)

Code formatting enforced via root [`.prettierrc`](../../.prettierrc) shared across frontend and backend.
