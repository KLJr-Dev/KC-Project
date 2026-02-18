# Infrastructure

Deployment and infrastructure definitions for **KC-Project**.

---

## Current Status (v0.3.5)

**PostgreSQL only.** The database runs in a Docker container; the backend and frontend still run natively (`npm run start:dev`). Uploaded files are stored on the local filesystem in `backend/uploads/`. Full app containerisation is deferred to v0.5.x per the [roadmap](../docs/roadmap/ROADMAP.md). See [ADR-020](../docs/decisions/ADR-020-docker-db-only.md) and [ADR-024](../docs/decisions/ADR-024-file-storage-strategy.md).

### Quick Start

```bash
# Start PostgreSQL
docker compose -f infra/compose.yml up -d

# Stop (keep data)
docker compose -f infra/compose.yml down

# Stop + delete all data
docker compose -f infra/compose.yml down -v
```

### What's Running

| Service | Image | Port | Credentials |
|---------|-------|------|-------------|
| `kc-postgres` | `postgres:16` | `5432` | `postgres` / `postgres` |

Database: `kc_dev`. Data persisted via a named Docker volume (`pgdata`).

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

See [ADR-022](../docs/decisions/ADR-022-typeorm-migrations.md) for the decision rationale.

## Contents

- `compose.yml` — Docker Compose for PostgreSQL (v0.2.0+)

## Planned (v0.5.x+)

- `Dockerfile` for frontend
- `Dockerfile` for backend
- App services added to `compose.yml`
- Environment variable templates (`.env.example`)
- VM deployment notes (v0.6.x)
