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

## Current Status (v0.0.7)

Frontend and backend are **contract-integrated**.

- **Backend** (NestJS) — all API routes defined with DTOs and mock data (users, auth, files, admin, sharing)
- **Frontend** (Next.js) — typed API client mirrors every backend DTO; pages exercise full CRUD for all domains
- Both processes run independently; frontend calls backend on `localhost:4000`
- No persistence, no authentication enforcement, no real file I/O — contracts only

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

KC-PROJECT/
├── backend/ # Backend service (NestJS) – API shape defined, mock data
├── frontend/ # Frontend application (Next.js) – contract integration UI
├── infra/ # Deployment and infrastructure definitions
├── docs/ # Engineering and project documentation
│ ├── architecture/
│ ├── decisions/
│ ├── roadmap/
│ └── README.md
└── README.md # Project overview


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

## Collaboration

This project is developed collaboratively using Git for version control.

Branching strategy, contribution guidelines, and CI/CD workflows will be introduced
once the implementation phase begins.

---

More details will be added as the project evolves.