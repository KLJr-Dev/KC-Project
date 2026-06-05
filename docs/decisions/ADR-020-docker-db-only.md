# ADR-020: Docker for Database Only (Not Application)

**Status:** Accepted

**Date:** v0.2.0 (Database Introduction)

---

## Context

v0.2.0 introduces PostgreSQL. The database needs to run somewhere during local development. The roadmap has two separate milestones:

- **v0.2.x** — Persistence & database surface (introduce PG)
- **v0.7.x** — Containerisation & deployment surface (Dockerise the app; per [STRATEGY.md](../roadmap/STRATEGY.md))

The question is whether introducing Docker for the database in v0.2.0 conflates with v0.7.x's scope.

## Decision

Use Docker Compose to run **PostgreSQL only**. The backend (NestJS) and frontend (Next.js) continue to run natively via `npm run start:dev`.

The compose file lives at `infra/compose.yml` and defines a single `db` service. No `backend` or `frontend` services exist yet.

Rationale:

1. **Running PG natively (Homebrew/Postgres.app) pollutes the host.** Docker isolates the database process, makes teardown trivial (`docker compose down -v`), and ensures every developer gets the same PG version.

2. **Docker for PG is not "app containerisation."** The app still runs as bare Node.js processes. v0.7.x will add `backend` and `frontend` services via `docker-compose.prod.yml`, Dockerfiles, and container networking. That is a distinct milestone.

3. **Clean upgrade path.** When v0.7.x arrives, `infra/docker-compose.prod.yml` orchestrates the full stack; `compose.yml` remains dev DB-only.

4. **`infra/` directory** keeps infrastructure config separate from application source. VM scripts and nginx configs land in v0.7.x.

## Consequences

- **Positive:** Developers only need Docker Desktop (or equivalent) to run PG. No Homebrew install, no host-level PG config.
- **Positive:** `docker compose -f infra/compose.yml down -v` gives a clean-slate database in seconds.
- **Positive:** v0.7.x scope remains distinct — it's about containerising the application, not the database.
- **Negative:** Developers need Docker Desktop installed. Acceptable — Docker is a standard development tool.
- **Negative:** `docker compose -f infra/compose.yml up -d` is slightly more typing than `brew services start postgresql`. Acceptable trade-off for isolation and reproducibility.
