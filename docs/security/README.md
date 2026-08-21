# Security & Penetration Testing

## Cycle workspace

**[Cycle-1/](Cycle-1/README.md)** — **Closed** (v1.0.0 → v2.0.0). Tag `v2.0.0` on `main`.

| Team | Folder | Primary doc |
|------|--------|-------------|
| Developer | [Cycle-1/Dev/](Cycle-1/Dev/) | [v1.0.0-ground-truth.md](Cycle-1/Dev/v1.0.0-ground-truth.md) (before-state) |
| Offensive | [Cycle-1/PenTest/](Cycle-1/PenTest/) | [v1.0.0-writeup.md](Cycle-1/PenTest/v1.0.0-writeup.md) (frozen) |
| Defensive | [Cycle-1/Remediation/](Cycle-1/Remediation/) | [v2.0.0-remediation.md](Cycle-1/Remediation/v2.0.0-remediation.md) · [blue-team-plan.md](Cycle-1/Remediation/blue-team-plan.md) |

Legacy redirect: [pentest-cheat-sheet.md](pentest-cheat-sheet.md) → ground truth

## Cross-cycle references

- [cwe-inventory.md](cwe-inventory.md) — 59 instances / 38 CWE IDs (v1.0.0 baseline)
- [pentest-journeys.md](../deploy/pentest-journeys.md) — narrative exploit paths (v1.0.0)
- [demo-users.md](../deploy/demo-users.md) — credentials and seeded artifact IDs
- [v1.0.0-pentest-ready.md](../release/v1.0.0-pentest-ready.md) — Red readiness gate (**passed**)
- [v2.0.0-secure-ready.md](../release/v2.0.0-secure-ready.md) — Blue readiness gate (**signed**)
- [security-baseline.md](../spec/security-baseline.md) — v2.0.0 control checklist

## Scope

KC-Project Cycle 1 complete. Live product = secure parallel. Next: Cycle-2 / **v1.1.0** CTF fork from tag `v2.0.0`.

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
