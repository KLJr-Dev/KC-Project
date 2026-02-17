# ADR-008: In-Memory Storage Before Persistence

**Status:** Accepted

**Date:** v0.0.6 (Backend API Shape Definition)

---

## Context

From v0.0.6 onward, every backend service needs a data store. The roadmap defers database introduction to v0.2.x, but controllers and services need to return real-looking data for contract integration (v0.0.7) and functional auth (v0.1.x).

Options considered:

- **In-memory arrays** — Plain TypeScript arrays inside each service. No dependencies, no setup, no schema. Resets on restart.
- **SQLite (file-based)** — Lightweight relational DB. Persists across restarts. Requires a driver and schema.
- **JSON file** — Read/write a `.json` file as a flat store. Persists but fragile, no query language.
- **Skip storage entirely** — Services return hardcoded stubs. No state at all.

## Decision

Use **in-memory arrays** as the data store for all services during v0.0.x through v0.1.x.

Each service owns a private `items: T[]` array. CRUD operations are standard array methods (`push`, `find`, `findIndex`, `splice`). IDs are sequential strings (`"1"`, `"2"`, ...) generated from `array.length + 1`.

Rationale:

1. **Zero friction** — No dependencies, no schema files, no connection strings. The backend boots instantly.
2. **Intentionally ephemeral** — Data resets on restart. This is a feature, not a bug: it prevents state accumulation during development and makes tests deterministic.
3. **Clear migration path** — When v0.2.x introduces PostgreSQL, the service methods (`create`, `findById`, `findAll`, `update`, `delete`) stay the same. Only the implementation behind them changes from array operations to SQL/ORM queries.
4. **Security surface** — Sequential IDs (CWE-330) and lack of persistence are both intentional weaknesses that will become exploitable attack surfaces later.

SQLite was rejected because it introduces a real database dependency before the roadmap calls for it. The point of v0.0.x-v0.1.x is to freeze API shape and auth behaviour, not to solve storage. Adding SQLite would blur the boundary between "shape" and "persistence" phases.

## Consequences

- **Positive:** Services are trivially simple. No ORM, no migrations, no connection pool to manage.
- **Positive:** Tests run fast — no DB setup/teardown needed for e2e tests.
- **Positive:** The data reset on restart prevents "works on my machine" state drift.
- **Positive:** Sequential string IDs are intentionally predictable (enumeration surface for v0.2.3).
- **Negative:** No persistence. Registered users disappear on restart. Acceptable for this phase.
- **Negative:** No relational integrity. A file record can reference a non-existent user. Acceptable — real constraints come with the DB.
- **Negative:** `array.length + 1` for ID generation can produce duplicates after deletions. Acceptable — this is a known weakness, not a bug.
