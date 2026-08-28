# Northwind Intake — FastAPI microservice (Cycle-8)

**Role:** Python intake/search sidecar behind nginx `/api/intake/`. Not a Nest replacement ([ADR-036](../docs/decisions/ADR-036-cycle-8-intake-tool-chain-pair.md)).

**Secure tip `v2.5.0`:** parameterized search on prod compose (`intake` service).  
**Insecure replay:** checkout `ctf/v1.5.0` + `docker-compose.cycle8.yml` for SQLi plant.

## Local / compose

Prod stack (`docker-compose.prod.yml`) runs `intake` internally. Edge:

```text
GET /api/intake/health
GET /api/intake/search?q=
```

DB: Postgres database `kc_intake` (same postgres service, separate DB).

## Verify

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
curl -sS 'http://localhost:8080/api/intake/health'
curl -sS 'http://localhost:8080/api/intake/search?q=lisa'
```

Insecure box examiner (archive only): `git checkout ctf/v1.5.0` → `./infra/cycle8-examiner.sh`.
