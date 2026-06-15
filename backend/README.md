# Backend

NestJS REST API for **KC-Project** v1.0.0 (pentest-ready insecure MVP).

Intentional security weaknesses are documented in [v1.0.0 ground truth](../docs/security/Cycle-1/Dev/v1.0.0-ground-truth.md).

---

## Current status (v1.0.0)

- NestJS 11, five domain modules (users, auth, files, sharing, admin) + audit
- **30 API routes** — frozen for Cycle 1
- PostgreSQL 16 via TypeORM migrations (`migrationsRun: true`)
- Ternary RBAC: `user` | `moderator` | `admin`
- Demo seed: users 9001–9004, files 9101–9104, public `share-1`
- **150 e2e tests** — `./infra/e2e-docker.sh`
- Swagger `1.0.0` at `/api/docs` (proxied via nginx in prod)

---

## Run

### Docker prod (primary — pentest)

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

## Verify

```bash
./infra/smoke-test.sh
./infra/journey-test.sh
./infra/e2e-docker.sh
```

---

## Structure

```
src/
├── auth/       # JWT register/login/me/logout
├── users/      # User CRUD
├── files/      # Multipart upload, download, approve
├── sharing/    # Share links + public token download
├── admin/      # Users, stats, audit, role management
├── audit/      # AuditLog module
├── common/     # Filters, pagination, logging
└── migrations/ # Schema + demo seeds
```

---

## Security note

Do **not** fix intentional vulns on the v1.0.x line. Remediation belongs in v2.0.0 — see [Remediation writeup](../docs/security/Cycle-1/Remediation/v2.0.0-remediation.md).

---

## References

- [ARCHITECTURE.md](../docs/architecture/ARCHITECTURE.md)
- [cwe-inventory.md](../docs/security/cwe-inventory.md)
- [demo-users.md](../docs/deploy/demo-users.md)
