# Infrastructure

Deployment and infrastructure definitions for **KC-Project**.

Canonical deployment timeline: [STRATEGY.md](../docs/roadmap/STRATEGY.md) Part 3 (v0.7.x).

---

## Current Status (v1.0.0 — Docker mandatory)

**Primary path:** full stack via `docker-compose.prod.yml` (postgres, backend, frontend, nginx on `localhost:8080`).

**Dev path:** PostgreSQL-only compose for native `npm run start:dev` (backend `:4000`, frontend `:3000`).

See [ADR-020](../docs/decisions/ADR-020-docker-db-only.md) and [ADR-024](../docs/decisions/ADR-024-file-storage-strategy.md).

### Quick Start (production stack)

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
```

App URL: `http://localhost:8080` — API proxied at `/api/*`.

### Quick Start (dev DB only)

```bash
docker compose -f infra/compose.yml up -d
cd backend && npm run start:dev
cd frontend && npm run dev
```

### What's Running (prod)

| Service | Image | Host port | Notes |
|---------|-------|-----------|-------|
| `nginx` | `nginx:alpine` | `8080` | Reverse proxy |
| `frontend` | built | internal | `NEXT_PUBLIC_API_URL=/api` |
| `backend` | built | internal | NestJS on `:4000` |
| `postgres` | `postgres:16-alpine` | `5433` | DB `kc_prod`; `5433` for host e2e tooling |

Credentials (intentional CWE-798): `postgres` / `postgres`.

Volumes: `pgdata_prod` (database), `uploads` (file storage).

**Note:** Prod uses `pgdata_prod` (DB `kc_prod`), separate from dev `compose.yml` (`pgdata` / `kc_dev`). Reusing the dev volume causes `database "kc_prod" does not exist` and backend crash.

---

## Verification scripts

| Script | Purpose |
|--------|---------|
| `smoke-test.sh` | Health → register → upload → list files via nginx |
| `e2e-docker.sh` | Full backend e2e (148 tests) against Docker `kc_prod` on `:5433` |
| `vm-setup.sh` | Ubuntu VM provisioning (Docker install) |

```bash
chmod +x infra/smoke-test.sh infra/e2e-docker.sh
./infra/e2e-docker.sh
```

---

## Migrations (v0.2.5+)

TypeORM migrations have replaced `synchronize: true`. The app auto-runs pending migrations on start (`migrationsRun: true`).

```bash
cd backend && npm run migration:run
```

See [ADR-022](../docs/decisions/ADR-022-typeorm-migrations.md).

## Contents

| File | Purpose |
|------|---------|
| `compose.yml` | Dev PostgreSQL only (v0.2.0+) |
| `docker-compose.prod.yml` | Full production stack (v0.7.x) |
| `nginx.conf` | Reverse proxy `/api` → backend, `/` → frontend |
| `smoke-test.sh` | Compose smoke journey |
| `e2e-docker.sh` | E2E against Docker postgres |
| `vm-setup.sh` | Ubuntu VM provisioning |
| `.env.example` | Production env template |
