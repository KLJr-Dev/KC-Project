# Backend

NestJS REST API for **KC-Project** secure tip on `main` (tag **`v2.2.0`**).

SoftDev API work lands on the **`backend`** branch → `dev` → `main` ([ADR-015](../docs/decisions/ADR-015-branching-strategy.md) · [ADR-033](../docs/decisions/ADR-033-cycle-4-softdev-version-pair.md)).

**Last secure product tag:** `v2.2.0`. Insecure Notes+SSH replay: tag/`ctf/v1.2.0`.

---

## Current status (secure tip)

- NestJS 11 — domains: users, auth, files, sharing, admin, **notes** + audit
- PostgreSQL 16 via TypeORM migrations; least-priv app role in prod
- Ternary RBAC with DB-authoritative `HasRoleGuard`
- **Notes (v2.2.0):** CRUD, parameterized `q`, mod flag, admin delete-any; SVG/HTML attach rejected; download disposition
- Demo seeds: users 9001–9004, files 9101–9104, notes 9201–9206 (no Cycle-4 secret plants)
- E2E: Notes suite + Cycle-2/3/4 regression; `./infra/e2e-docker.sh`
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
