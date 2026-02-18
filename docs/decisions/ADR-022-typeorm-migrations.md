# ADR-022: TypeORM Migrations

## Status

Accepted

## Context

Since v0.2.0, the backend used `synchronize: true` in the TypeORM configuration. This auto-creates and alters database tables from entity metadata on every application start. While convenient for development, this is a known production anti-pattern:

- **Data loss risk**: TypeORM may drop columns or tables when entity definitions change.
- **No rollback path**: There is no `down` migration to revert a schema change.
- **Unpredictable DDL**: The exact SQL executed depends on the diff between entity metadata and the live schema, which varies by environment.
- **CWE-1188**: Insecure Default Initialization of Resource.

## Decision

Replace `synchronize: true` with explicit TypeORM migrations as of v0.2.5.

- `synchronize: false` in `app.module.ts`
- `migrationsRun: true` to auto-execute pending migrations on application start
- Standalone `data-source.ts` for the TypeORM CLI
- Migration scripts in `package.json`: `migration:generate`, `migration:run`, `migration:revert`
- Migrations stored in `backend/src/migrations/`

## Initial Migrations

1. **InitialSchema** — Creates the 4 existing tables (`user`, `file_entity`, `sharing_entity`, `admin_item`) with `IF NOT EXISTS` guards for idempotency.
2. **AddFileDescription** — Adds a `description` column to `file_entity`, demonstrating the migration workflow.

## Security Implications

This is a **partial remediation** of CWE-1188:

- **Better**: Schema changes are explicit, reviewable, and version-controlled.
- **Still weak**: `migrationsRun: true` means any migration file in the `src/migrations/` directory executes automatically on app start. An attacker who can inject a file into the repository (via compromised CI, supply chain, or repo access) can execute arbitrary SQL.
- **v2.0.0 remediation**: Manual migration execution behind a review gate. `migrationsRun: false`, explicit `npm run migration:run` in deployment scripts.

## E2e Test Impact

E2e tests call `dataSource.synchronize(true)` explicitly for test isolation (drop + recreate all tables between test blocks). This continues to work regardless of the `synchronize: false` app config because the test invokes it directly on the DataSource instance.

## Consequences

- Schema changes now require a migration file (generated or hand-written)
- The migration history is tracked in a `migrations` table in PostgreSQL
- Developers must run `npm run migration:generate` after modifying entities
- CWE-1188 severity is reduced but not eliminated
