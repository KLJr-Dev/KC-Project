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

## Current Status (v0.1.3)

Identity and authentication surface — JWT session concept implemented.

- **Backend** (NestJS) — Registration (`POST /auth/register`), login (`POST /auth/login`), and first protected endpoint (`GET /auth/me`). Real HS256 JWTs via `@nestjs/jwt` (hardcoded secret `'kc-secret'`, no expiration — intentionally insecure). `JwtAuthGuard` verifies Bearer tokens. `AuthModule` imports `UsersModule` and `JwtModule`. Passwords stored/compared as plaintext (intentionally insecure). Swagger at `/api/docs` (v0.1.3).
- **Frontend** (Next.js) — Tabbed auth page (Register / Sign In), reusable UI components, auth context with localStorage persistence, automatic Bearer header on all API calls via `getHeaders()`, header displays authenticated username via `authMe()`. Theme toggle (light/dark), app shell (Header, Footer, PageContainer). Types auto-generated from OpenAPI spec.
- **Tooling** — shared Prettier config, ESLint with Prettier on both projects, TypeScript `strict: true` on both, e2e tests via supertest (10 auth tests)
- **Documentation** — ADRs 001-018, formal spec (scope, requirements, personas, security baseline), architecture diagrams, STRIDE threat model, data model, auth flow docs, glossary
- Both processes run independently; frontend calls backend on `localhost:4000`
- No persistence (in-memory, resets on restart), no token expiration, no server-side logout, all intentional (CWE-documented)

### Run locally

From the repo root:

```bash
# Terminal 1 — backend (NestJS)
cd backend && npm run start:dev

# Terminal 2 — frontend (Next.js)
cd frontend && npm run dev
```

Backend: `http://localhost:4000` (default). Frontend: `http://localhost:3000` (Next.js dev). See `backend/README.md` and `frontend/README.md` for details.

## Repository Structure

```
KC-PROJECT/
├── backend/              # Backend service (NestJS) - REST API, auth, user management
├── frontend/             # Frontend application (Next.js) - auth UI, app shell
├── infra/                # Deployment and infrastructure definitions (future)
├── docs/                 # Engineering and project documentation
│   ├── architecture/     # System architecture, auth flow, data model, STRIDE
│   ├── decisions/        # Architecture Decision Records (ADR-001 to ADR-018)
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