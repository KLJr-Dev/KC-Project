# Backend

NestJS REST API for **KC-Project** **v2.1.0** (secure product on `main`).

SoftDev API work lands on the **`backend`** branch → `dev` → `main` ([ADR-032](../docs/decisions/ADR-032-post-v2.1.0-versioning.md)).

Cycle-1 before-state: [v1.0.0 ground truth](../docs/security/Cycle-1/Dev/v1.0.0-ground-truth.md) · tag `v1.0.0`.  
Cycle-1 remediation: [v2.0.0-remediation.md](../docs/security/Cycle-1/Remediation/v2.0.0-remediation.md).  
Cycle-2 remediation: [v2.1.0-remediation.md](../docs/security/Cycle-2/Remediation/v2.1.0-remediation.md).

---

## Current status (v2.1.0)

- NestJS 11, five domain modules (users, auth, files, sharing, admin) + audit
- PostgreSQL 16 via TypeORM migrations (`migrationsRun: true`); least-priv app role in prod
- Ternary RBAC: `user` | `moderator` | `admin` with DB-authoritative `HasRoleGuard`
- Auth: bcrypt, RS256 (prod), httpOnly refresh cookie, in-memory access JWT (frontend)
- Demo seed: users 9001–9004, files 9101–9104; unguessable share tokens
- E2E: `./infra/e2e-docker.sh` (incl. Cycle-2 regression)
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
