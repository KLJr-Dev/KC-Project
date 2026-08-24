# Security & Penetration Testing

## Cycle workspace

**[Cycle-1/](Cycle-1/README.md)** — **Closed** (v1.0.0 → v2.0.0).

**[Cycle-2/](Cycle-2/README.md)** — **Closed** (v1.1.0 CTF → v2.1.0). Live product = tag **`v2.1.0`** on `main`.

| Cycle | Offensive | Defensive (on `main`) |
|-------|-----------|------------------------|
| 1 | [PenTest/v1.0.0-writeup.md](Cycle-1/PenTest/v1.0.0-writeup.md) · tag `v1.0.0` | [v2.0.0-remediation.md](Cycle-1/Remediation/v2.0.0-remediation.md) · frozen `remediation/v2.0.0` |
| 2 | branch/tag `ctf/v1.1.0` (PenTest/Dev on that branch) | [v2.1.0-remediation.md](Cycle-2/Remediation/v2.1.0-remediation.md) · frozen `remediation/v2.1.0` |

Legacy redirect: [pentest-cheat-sheet.md](pentest-cheat-sheet.md) → ground truth

## Cross-cycle references

- [cwe-inventory.md](cwe-inventory.md) — 59 instances / 38 CWE IDs (v1.0.0 baseline)
- [pentest-journeys.md](../deploy/pentest-journeys.md) — narrative exploit paths (v1.0.0)
- [demo-users.md](../deploy/demo-users.md) — credentials and seeded artifact IDs
- [v1.0.0-pentest-ready.md](../release/v1.0.0-pentest-ready.md) — Cycle-1 Red gate (**passed**)
- [v2.0.0-secure-ready.md](../release/v2.0.0-secure-ready.md) — Cycle-1 Blue gate (**signed**)
- [v1.1.0-ctf-ready.md](../release/v1.1.0-ctf-ready.md) — Cycle-2 CTF gate
- [v2.1.0-secure-ready.md](../release/v2.1.0-secure-ready.md) — Cycle-2 Blue gate (**signed**)
- [security-baseline.md](../spec/security-baseline.md) — secure-product control checklist
- [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md) — post-v2.1.0 CTFs without product version bumps

## Scope

Cycles 1–2 complete. Live product = **v2.1.0** secure stack. Next security work = CTF fork of current app (**no** `vX.Y.Z` bump) and/or SoftDev surface expansion ([ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md)).

## Tools

- Burp Suite / OWASP ZAP (HTTP proxy)
- curl / httpx (API probing)
- jwt_tool (against intentional CTF/insecure tags — not expected to forge roles on hardened `main`)
- Docker compose stack (`infra/docker-compose.prod.yml`; CTF overlay only on `ctf/*`)

## Entry points (secure `main` / v2.1.0)

| Surface | URL / path | Auth |
|---------|------------|------|
| App UI | `http://localhost:8080` | Browser; access JWT in memory + httpOnly refresh cookie |
| API (proxied) | `http://localhost:8080/api/*` | Bearer access JWT |
| API (direct dev) | `http://localhost:4000/*` | Bearer access JWT |
| OpenAPI | Dev / lab only (disabled in production unless flagged) | — |
| Public share | `GET /api/sharing/public/:token` | Token |
| API explorers | `/dev/*` | Lab flag gated in prod |

## Methodology (against historical / CTF targets)

Run these against **tag `v1.0.0`** (Cycle-1) or **`ctf/v1.1.0`** (Cycle-2) — not as expectations against current `main`:

1. Verify deploy: `./infra/smoke-test.sh`, `./infra/journey-test.sh`, `./infra/e2e-docker.sh`
2. Map attack surface from ground truth / OpenAPI on that tag or CTF branch
3. Authenticate as user, moderator, admin; test IDOR on sequential IDs
4. Test authz / JWT trust assumptions documented for that cycle
5. Test file upload and share-token paths per cycle writeup
6. Document findings in the cycle PenTest writeup

## References

- [STRATEGY.md](../roadmap/STRATEGY.md)
- [ADR-031](../decisions/ADR-031-security-cycle-docs.md)
- [ADR-013](../decisions/ADR-013-expansion-cycle-versioning.md) · [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md)
