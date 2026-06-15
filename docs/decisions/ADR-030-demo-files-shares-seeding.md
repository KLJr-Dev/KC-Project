# ADR-030: Demo Files and Shares Seeding via Migration

**Status:** Accepted

**Date:** v1.0.x pre-pentest

---

## Context

ADR-029 seeds demo users only. Pentest journeys and product UX need reproducible files, approval states, IDOR targets, and a working public share link (`share-1`) on every fresh Docker deploy.

## Decision

Add TypeORM migrations:

1. `SeedDemoFilesAndShares1771440000000` — four demo files, public share `share-1`, private share id 2, user `other@kc.test` (9004)
2. `RepairDemoSeedLinks1771440000001` — fix stale `share-1` rows pointing at deleted files on existing databases
3. `RepairDemoStoragePaths1771440000002` — fix `storagePath` when DB seeded from different cwd (host e2e vs Docker `/app`)

Files written to `uploads/seed-*.txt` on disk; metadata in `file_entity`. Idempotent on file/share ids.

## Consequences

- `http://localhost:8080/share/share-1` and `/api/sharing/public/share-1` work after deploy
- User UI shows 2 own files; mod queue has 1 pending; admin sees all files
- API `GET /files` still returns all files (IDOR intact for pentest)
- Documented in [demo-users.md](../deploy/demo-users.md) and [v1.0.0-ground-truth.md](../security/Cycle-1/Dev/v1.0.0-ground-truth.md)
