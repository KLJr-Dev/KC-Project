# Security & Penetration Testing

## Cycle workspace

**[Cycle-1/](Cycle-1/README.md)** — Closed path: v1.0.0 → v2.0.0 (tag `v2.0.0`).

**[Cycle-2/](Cycle-2/README.md)** — **Active:** v1.1.0 CTF box on branch `ctf/v1.1.0` (fork of `v2.0.0`).  
Start here: [Cycle-2/Dev/v1.1.0-box-plan.md](Cycle-2/Dev/v1.1.0-box-plan.md).

| Cycle | Dev | PenTest | Remediation |
|-------|-----|---------|-------------|
| 1 | [v1.0.0-ground-truth.md](Cycle-1/Dev/v1.0.0-ground-truth.md) | [v1.0.0-writeup.md](Cycle-1/PenTest/v1.0.0-writeup.md) | [v2.0.0-remediation.md](Cycle-1/Remediation/v2.0.0-remediation.md) |
| 2 | [v1.1.0-box-plan.md](Cycle-2/Dev/v1.1.0-box-plan.md) · [ground-truth](Cycle-2/Dev/v1.1.0-ground-truth.md) | [v1.1.0-writeup.md](Cycle-2/PenTest/v1.1.0-writeup.md) | [v2.1.0-remediation.md](Cycle-2/Remediation/v2.1.0-remediation.md) |

Legacy redirect: [pentest-cheat-sheet.md](pentest-cheat-sheet.md) → Cycle-1 ground truth

## Cross-cycle references

- [cwe-inventory.md](cwe-inventory.md) — 59 instances / 38 CWE IDs
- [pentest-journeys.md](../deploy/pentest-journeys.md) — narrative exploit paths
- [demo-users.md](../deploy/demo-users.md) — credentials and seeded artifact IDs
- [v1.0.0-pentest-ready.md](../release/v1.0.0-pentest-ready.md) — Red readiness gate (**passed**)
- [v2.0.0-secure-ready.md](../release/v2.0.0-secure-ready.md) — Blue readiness gate (**in progress**)
- [security-baseline.md](../spec/security-baseline.md) — v2.0.0 control checklist

## Scope

- **Cycle 1:** complete (insecure MVP → secure parallel `v2.0.0`).
- **Cycle 2:** OSCP-style CTF on `ctf/v1.1.0` — see [Cycle-2 box plan](Cycle-2/Dev/v1.1.0-box-plan.md).

## Tools

- Burp Suite / OWASP ZAP (HTTP proxy)
- curl / httpx (API probing)
- jwt_tool (JWT forgery with known secret `kc-secret`)
- Docker compose stack (`infra/docker-compose.prod.yml`)

## Entry points

| Surface | URL / path | Auth |
|---------|------------|------|
| App UI | `http://localhost:8080` | Browser + localStorage JWT |
| API (proxied) | `http://localhost:8080/api/*` | Bearer JWT |
| API (direct dev) | `http://localhost:4000/*` | Bearer JWT |
| OpenAPI | `http://localhost:8080/api/docs` | None |
| Public share | `GET /api/sharing/public/:token` | None |
| API explorers | `http://localhost:8080/dev/*` | Optional JWT |

## Methodology

1. Verify deploy: `./infra/smoke-test.sh`, `./infra/journey-test.sh`, `./infra/e2e-docker.sh`
2. Map attack surface from [ground truth](Cycle-1/Dev/v1.0.0-ground-truth.md) and OpenAPI
3. Authenticate as user, moderator, admin; test IDOR on sequential IDs
4. Test JWT role forgery (CWE-639) on admin and approve endpoints
5. Test file upload path traversal and MIME confusion (note: nginx blocks >1 MB before Multer)
6. Test public share token enumeration
7. Test guard inconsistencies (DELETE /admin/users/:id, GET /admin/audit-logs without HasRole)
8. Inspect bundled frontend JS for CWE-615 / CWE-922 exposure
9. Document findings in [PenTest/v1.0.0-writeup.md](Cycle-1/PenTest/v1.0.0-writeup.md)

## References

- [STRATEGY.md](../roadmap/STRATEGY.md)
- [ADR-031](../decisions/ADR-031-security-cycle-docs.md)
- [ADR-013](../decisions/ADR-013-expansion-cycle-versioning.md)
