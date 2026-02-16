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

## Current Status (v0.1.2)

Identity and authentication surface - registration and login functional.

- **Backend** (NestJS) — Real registration endpoint (`POST /auth/register`) with field validation, duplicate email detection, and in-memory user store. Login endpoint (`POST /auth/login`) with plaintext password comparison. `AuthModule` imports `UsersModule`. Passwords stored in plaintext (intentionally insecure).
- **Frontend** (Next.js) — Tabbed auth page (Register / Sign In), reusable UI components, auth context with localStorage persistence, theme toggle (light/dark), app shell (Header, Footer, PageContainer). Types auto-generated from OpenAPI spec.
- **Tooling** — shared Prettier config, ESLint with Prettier on both projects, TypeScript `strict: true` on both
- Both processes run independently; frontend calls backend on `localhost:4000`
- No persistence (in-memory, resets on restart), stub tokens, no authorization guards

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
├── infra/                # Deployment and infrastructure definitions
├── docs/                 # Engineering and project documentation
│   ├── architecture/     # System architecture + auth flow diagrams
│   ├── decisions/        # Architecture Decision Records (ADRs)
│   ├── roadmap/          # Version-by-version development plan
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

The project uses incremental versioning to reflect architectural and security
milestones.

- `v0.x` — Research, design, and scaffolding
- `v1.x` — Insecure functional implementations
- `v2.x` — Hardened and secured counterparts

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