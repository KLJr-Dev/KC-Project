# Infrastructure

Deployment and infrastructure definitions for **KC-Project**.

---

## Current Status (v0.2.0)

**PostgreSQL only.** The database runs in a Docker container; the backend and frontend still run natively (`npm run start:dev`). Full app containerisation is deferred to v0.5.x per the [roadmap](../docs/roadmap/ROADMAP.md). See [ADR-020](../docs/decisions/ADR-020-docker-db-only.md).

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

## Contents

- `compose.yml` — Docker Compose for PostgreSQL (v0.2.0+)

## Planned (v0.5.x+)

- `Dockerfile` for frontend
- `Dockerfile` for backend
- App services added to `compose.yml`
- Environment variable templates (`.env.example`)
- VM deployment notes (v0.6.x)
