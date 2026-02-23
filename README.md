# KC-Project

KC-Project is a long-term software engineering and web security project focused on
designing, deploying, exploiting, and securing a modern web application.

The project intentionally follows an **insecure-by-design → penetration testing →
security hardening** lifecycle in order to explore the full Software Development
Lifecycle (SDLC) and modern DevSecOps practices.

## Project Goals

- Design and implement a realistic full-stack web application
- Intentionally introduce and document security weaknesses
- Perform structured penetration testing against each insecure version
- Apply remediation and hardening to produce secure counterpart releases
- Document architectural, engineering, and security decisions throughout

## Current Status (v0.4.3–v0.4.6)

Authorization surface introduced with ternary roles and intentional authorization gaps.

- **Backend** (NestJS) -- Registration, login, protected profile, cosmetic logout. Real HS256 JWTs (hardcoded secret, no expiration). **Ternary role enum ('user'|'moderator'|'admin')** in User entity, role stored in JWT payload (CWE-639: JWT role trusted, never re-validated from DB). JwtAuthGuard on most resource endpoints. HasRoleGuard on some admin endpoints (inconsistent, CWE-862: DELETE endpoint missing guard). **File approval endpoint** (PUT `/files/:id/approve`) with moderator oversight (v0.4.3). **Privilege escalation endpoint** (PUT `/admin/users/:id/role/escalate`) allows moderators to promote users indefinitely—no depth limits (CWE-269, v0.4.4). **Audit logs placeholder** (GET `/admin/audit-logs`) returns empty, no persistent audit trail (CWE-532, v0.4.4). **Role hierarchy ambiguity** -- moderator permissions undefined vs admin, cascading attacks possible (CWE-841, v0.4.3–v0.4.5). `ownerId` tracked but never enforced (IDOR, v0.3.x). Multipart file uploads via Multer (CWE-22, CWE-434, CWE-400 still present). Predictable share tokens (CWE-330). All list endpoints unbounded. Swagger + X-Powered-By publicly accessible. No ValidationPipe. Passwords plaintext. Swagger at `/api/docs`.
- **Database** (PostgreSQL 16) -- Docker Compose in `infra/compose.yml`. Hardcoded credentials, TypeORM migrations with `migrationsRun: true`. User entity with ternary role enum, migrations for v0.4.3 (file approval status) and v0.4.4 (escalation support).
- **File Storage** -- Local filesystem in `backend/uploads/` via Multer. Approval status tracked but no ownership checks. v0.5.x will introduce file handling vulnerabilities.
- **Frontend** (Next.js) -- Tabbed auth (Register/Sign In), role selector for moderator/admin (v0.4.3), localStorage persistence of role (and JWT, CWE-639). Role displayed in header with ternary selection. Admin page with client-side role checks (bypassable via localStorage, CWE-639). Theme toggle, app shell. Types auto-generated from OpenAPI spec.
- **Tooling** -- Shared Prettier/ESLint, TypeScript `strict: true`, e2e tests via supertest (22 RBAC-specific tests + 50+ baseline tests = 72+ total tests, real PG with `--runInBand`). Migration scripts (`migration:generate`, `migration:run`, `migration:revert`).
- **Documentation** -- ADRs 001-025 (025: RBAC Design with three-phase implementation rationale), formal spec, architecture diagrams, STRIDE threat model, auth flow docs (expanded for v0.4.x authorization surfaces), glossary, security baseline with v0.4.x vulnerability inventory. All OWASP references use Top 10:2025.
- ~40 CWE entries across v0.1.0–v0.4.x (39 intentional, 1 accidental). Authorization surface closed; v0.5.x focuses on file handling.

### Run locally

From the repo root:

```bash
# Terminal 1 — PostgreSQL (requires Docker)
docker compose -f infra/compose.yml up -d

# Terminal 2 — backend (NestJS)
cd backend && npm run start:dev

# Terminal 3 — frontend (Next.js)
cd frontend && npm run dev
```

Backend: `http://localhost:4000`. Frontend: `http://localhost:3000`. PostgreSQL: `localhost:5432` (`postgres`/`postgres`, database `kc_dev`). See `backend/README.md`, `frontend/README.md`, and `infra/README.md` for details.

## Repository Structure

```
KC-PROJECT/
├── backend/              # Backend service (NestJS) - REST API, auth, user management
├── frontend/             # Frontend application (Next.js) - auth UI, app shell
├── infra/                # Infrastructure (Docker Compose for PostgreSQL)
├── docs/                 # Engineering and project documentation
│   ├── architecture/     # System architecture, auth flow, data model, STRIDE
│   ├── decisions/        # Architecture Decision Records (ADR-001 to ADR-020)
│   ├── diagrams/         # Standalone diagrams (architecture, auth, infra, threats, timeline)
│   ├── roadmap/          # Version-by-version development plan
│   ├── security/         # Pentesting methodology (future)
│   ├── spec/             # Formal spec (scope, requirements, personas, security baseline)
│   ├── glossary.md       # Security, architecture, and project terminology
│   └── README.md
└── README.md             # Project overview
```


Each directory contains a README describing its intended responsibility.

## Documentation

All engineering and technical documentation is maintained in the `/docs` directory.

Documentation is treated as a **living artefact** and will evolve alongside the
project as it progresses from research and design into implementation, testing,
deployment, and security hardening.

## Versioning

The project uses incremental versioning to reflect architectural and security milestones.

- `v0.x` — Build phase: scaffolding, identity, persistence, files, auth, deployment, observability
- `v1.0.0` — Insecure MVP (~15 CWEs across 6 attack surfaces)
- `v1.0.x` — Structured pentesting and incremental patches
- `v2.0.0` — Secure parallel (all v1.0.0 CWEs remediated)
- `v1.N.0` / `v2.N.0` — Perpetual expansion cycle (new insecure features → pentest → harden → repeat)

See [ROADMAP.md](docs/roadmap/ROADMAP.md) and [ADR-013](docs/decisions/ADR-013-expansion-cycle-versioning.md) for the full versioning model.

## Branching Strategy

```
main          Stable releases only (squash-merged from dev)
 └── dev      Integration branch - features merge here, tested before PR to main
      ├── frontend    Frontend feature work
      └── backend     Backend feature work
```

- `main` only receives commits from `dev` (or `hotfix` branches)
- Feature work happens on `frontend` / `backend` branches off `dev`
- Both branches merge into `dev` for integration testing, then `dev` is PR'd to `main`

## Collaboration

This project is developed collaboratively using Git for version control.
Contributions follow the branching strategy above. CI/CD workflows will be introduced
in later versions.