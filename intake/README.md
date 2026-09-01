# Northwind Intake — FastAPI microservice (Cycle-8/9)

**Role:** Python Intake sidecar for Onboarding squad. Not a Nest replacement ([ADR-036](../docs/decisions/ADR-036-cycle-8-intake-tool-chain-pair.md) · [ADR-038](../docs/decisions/ADR-038-cycle-9-onboarding-defence-pair.md)).

**Edge (Cycle-9 SoftDev):** Browser → nginx → **Nest BFF** `/api/intake/*` → FastAPI (`INTAKE_URL`). FastAPI is **not** published on nginx.

**Secure tip `v2.5.0`:** parameterized search.  
**Insecure SoftDev / `v1.6.0`:** Nest BFF hop headers + onboarding plants (IDOR, race, export PT, SIEM, honeypot).  
**Insecure replay C8:** checkout `ctf/v1.5.0` + `docker-compose.cycle8.yml` for SQLi plant.

## Local / compose

```text
GET /api/intake/search?q=   (requires Nest JWT via BFF)
# No Nest or Intake HTTP /health — use GET /api/ping for reachability
```

DB: Postgres database `kc_intake` (same postgres service, separate DB).

**Cycle-9 seed:** `onboarding_requests` ids **9301+**, `security_events`, export packages under `/app/exports/{id}/`, F3 out-of-tree at `/app/private/onboarding-export.flag`. See `exports/README.md`.

## Verify

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
# obtain Bearer via login, then:
curl -sS -H "Authorization: Bearer $TOKEN" 'http://localhost:8080/api/intake/search?q=lisa'
```

Insecure Cycle-9 examiner: `./infra/cycle9-examiner.sh` (prod alone).  
Insecure Cycle-8 replay: `git checkout ctf/v1.5.0` → `./infra/cycle8-examiner.sh`.
