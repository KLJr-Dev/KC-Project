# ADR-029: Demo User Seeding via Migration

**Status:** Accepted

**Date:** v0.9.0

---

## Context

v1.0.0 pentest and UX testing need predictable User / Moderator / Admin accounts without manual setup on every Docker deploy.

## Decision

Seed three demo users in TypeORM migration `SeedDemoUsers1771430000000`:

- `user@kc.test`, `mod@kc.test`, `admin@kc.test`
- Idempotent insert (`WHERE NOT EXISTS` on email)
- Plaintext passwords (consistent with CWE-256)
- Documented in `docs/deploy/demo-users.md`

## Consequences

- Docker stack always has test personas after first migration run.
- E2e tests using unique emails are unaffected.
- Credentials are public by design (insecure MVP).
