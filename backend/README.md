# Backend

NestJS REST API for **KC-Project** — secure tip tag **`v2.5.0`** on `main`; Cycle-9 insecure **`v1.6.0`** integrated on **`dev`**.

SoftDev API work lands on the **`backend`** branch → `dev` → `main` ([ADR-015](../docs/decisions/ADR-015-branching-strategy.md) · [ADR-038](../docs/decisions/ADR-038-cycle-9-onboarding-defence-pair.md)).

**Last secure product tag:** `v2.5.0`. Insecure Cycle-8 replay: tag/`ctf/v1.5.0`.

---

## Current status (secure tip / Cycle-9 dev)

- NestJS 11 — domains: users, auth, files, sharing, admin, notes, preview, ops, **intake-bff**, audit
- **Intake BFF (Cycle-9):** thin JWT proxy to FastAPI; insecure tip forwards client `X-User-*`
- PostgreSQL 16 via TypeORM migrations; least-priv app role in prod
- Ternary RBAC with DB-authoritative `HasRoleGuard`
- Demo seeds: users 9001–9004, files 9101–9104, notes 9201–9206; Intake onboarding 9301+ on `dev`
- E2E: full suite; `./infra/e2e-docker.sh` · `./infra/cycle9-examiner.sh` on insecure tip
- Swagger: disabled in production unless explicitly enabled

---

## Run

### Docker prod (primary)

```bash
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
# API: http://localhost:8080/api
```

### Native dev

```bash
docker compose -f infra/compose.yml up -d   # kc_dev on :5432
npm run start:dev                              # :4000
```

---

## Tests

```bash
npm test
npm run test:e2e
# or full Docker suite from repo root:
./infra/e2e-docker.sh
```
