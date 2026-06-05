# Infrastructure

Deployment and infrastructure definitions for **KC-Project**.

Canonical deployment timeline: [STRATEGY.md](../docs/roadmap/STRATEGY.md) Part 3 (v0.7.x).

---

## Current Status (v0.4.6 app / v0.7.x Docker planned)

**PostgreSQL only in compose.** The database runs in Docker; backend and frontend run natively (`npm run start:dev`) until v0.7.x ships full stack containerisation. Uploaded files live in `backend/uploads/`. See [ADR-020](../docs/decisions/ADR-020-docker-db-only.md) and [ADR-024](../docs/decisions/ADR-024-file-storage-strategy.md).

### Quick Start (dev DB)

```bash
# Start PostgreSQL
docker compose -f infra/compose.yml up -d

# Stop (keep data)
docker compose -f infra/compose.yml down

# Stop + delete all data
docker compose -f infra/compose.yml down -v
```

### What's Running (dev)

| Service | Image | Port | Credentials |
|---------|-------|------|-------------|
| `kc-postgres` | `postgres:16` | `5432` | `postgres` / `postgres` |

Database: `kc_dev`. Data persisted via named volume `pgdata`.

---

## Migrations (v0.2.5+)

TypeORM migrations have replaced `synchronize: true`. The app auto-runs pending migrations on start (`migrationsRun: true`).

```bash
# Generate a migration after changing entities:
cd backend && npm run migration:generate -- src/migrations/YourMigrationName

# Run migrations manually (also happens on app start):
cd backend && npm run migration:run

# Revert the last migration:
cd backend && npm run migration:revert
```

See [ADR-022](../docs/decisions/ADR-022-typeorm-migrations.md).

## Contents

| File | Purpose |
|------|---------|
| `compose.yml` | Dev PostgreSQL only (v0.2.0+) |
| `docker-compose.prod.yml` | Full stack — planned v0.7.1 |
| `vm-setup.sh` | Ubuntu VM provisioning — planned v0.7.2 |
| `.env.example` | Production env template — planned v0.7.2 |

## Planned (v0.7.x)

Primary run path after v0.7.x:

```bash
docker compose -f infra/docker-compose.prod.yml up -d
```

Services: `postgres`, `backend`, `frontend`, `nginx` with persistent volumes (`pgdata`, `uploads`).
