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

## Current Status (v1.0.0 — pentest-ready insecure MVP)

**Canonical roadmap:** [STRATEGY.md](docs/roadmap/STRATEGY.md) (ADR-027).

- **Docker (primary):** `docker compose -f infra/docker-compose.prod.yml up -d --build` → `http://localhost:8080`
- **Demo users:** `user@kc.test`, `mod@kc.test`, `admin@kc.test` — see [demo-users.md](docs/deploy/demo-users.md)
- **Product UI:** My Files, Sharing, Review (mod), Admin. API explorers at `/dev`
- **Security cycle:** [Cycle-1](docs/security/Cycle-1/README.md) — Dev / PenTest / Remediation
- **Ground truth:** [v1.0.0-ground-truth.md](docs/security/Cycle-1/Dev/v1.0.0-ground-truth.md)
- **Tests:** 150 e2e (`./infra/e2e-docker.sh`), smoke, journey — see [infra/README.md](infra/README.md)
- **Security:** 59 documented CWE instances / 38 IDs — [cwe-inventory.md](docs/security/cwe-inventory.md)

### Run locally (Docker — pentest path)

```bash
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
./infra/journey-test.sh
```

### Run locally (native dev)

```bash
docker compose -f infra/compose.yml up -d   # kc_dev on :5432 only
cd backend && npm run start:dev             # :4000
cd frontend && npm run dev                  # :3000
```

## Repository Structure

```
KC-PROJECT/
├── backend/              # NestJS REST API (30 routes)
├── frontend/             # Next.js product UI + /dev explorers
├── infra/                # Docker compose, nginx, verify scripts
├── docs/                 # Engineering and project documentation
│   ├── architecture/     # System architecture, auth flow, data model, STRIDE
│   ├── decisions/        # ADRs 001–031
│   ├── diagrams/         # Architecture, auth, infra, threats, timeline
│   ├── roadmap/          # STRATEGY, ROADMAP, version summaries
│   ├── security/         # Cycle-1 workspace, CWE inventory
│   ├── spec/             # Scope, requirements, personas, security baseline
│   ├── glossary.md
│   └── README.md
└── README.md
```

## Tooling

Shared formatting via root [`.prettierrc`](.prettierrc) (ADR-016, NFR-2.5):

```bash
cd backend && npm run format:check && npm run lint
cd frontend && npm run format:check && npm run lint
```

## Documentation

All engineering documentation lives in `/docs`. Security testing artifacts: [docs/security/Cycle-1/](docs/security/Cycle-1/README.md).

## Versioning

- `v0.x` — Build phase
- `v1.0.0` — Insecure MVP (pentest-ready)
- `v1.0.x` — Pentest cycle patches
- `v2.0.0` — Secure parallel
- `v1.N.0` / `v2.N.0` — Perpetual expansion cycle

See [ADR-013](docs/decisions/ADR-013-expansion-cycle-versioning.md).

## Branching Strategy

```
main          Stable releases only (squash-merged from dev)
 └── dev      Integration branch
      ├── frontend    Frontend feature work
      └── backend     Backend feature work
```

## Collaboration

Git version control. CI/CD deferred per ADR-017.
