# Northwind Intake — FastAPI microservice (Cycle-8)

**Role:** Python intake/search sidecar behind nginx `/api/intake/`. Not a Nest replacement ([ADR-036](../docs/decisions/ADR-036-cycle-8-intake-tool-chain-pair.md)).

**Tip `v1.5.0`:** intentional SQLi on search (`CYCLE8-PLANT`) + weak mail hashes for John.  
**Blue `v2.5.0`:** parameterize queries; remove weak hash / F1 plants.

## Local / compose

Started by `docker-compose.cycle8.yml` as `cycle8-intake` (internal). Edge:

```text
GET /api/intake/health
GET /api/intake/search?q=
```

DB: Postgres database `kc_intake` (same postgres service, separate DB).

## Verify

```bash
curl -sS 'http://localhost:8080/api/intake/health'
curl -sS 'http://localhost:8080/api/intake/search?q=lisa'
```

Examiner dry-run: `./infra/cycle8-examiner.sh` (after overlays land).
