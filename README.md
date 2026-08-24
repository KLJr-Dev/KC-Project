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

## Current Status

**Secure product (`main`):** tag **`v2.0.0`** — Cycle-1 remediation.  
**CTF lab (replayable):** branch / tag **`v1.1.0`** on `ctf/v1.1.0` — Cycle-2 OSCP-style box.

**Canonical roadmap:** [STRATEGY.md](docs/roadmap/STRATEGY.md) (ADR-027). **Portfolio framing:** [PORTFOLIO-VISION.md](docs/roadmap/PORTFOLIO-VISION.md).

| Track | Entry |
|-------|--------|
| Secure demo | `docker compose -f infra/docker-compose.prod.yml up -d --build` → `http://localhost:8080` |
| **CTF box (Cycle-2)** | [Player brief](docs/security/Cycle-2/Dev/v1.1.0-player-brief.md) · [Cycle-2 index](docs/security/Cycle-2/README.md) · gate [v1.1.0-ctf-ready](docs/release/v1.1.0-ctf-ready.md) |
| Cycle-2 writeup | [v1.1.0-writeup.md](docs/security/Cycle-2/PenTest/v1.1.0-writeup.md) (spoilers) |
| Cycle-1 archive | [Cycle-1](docs/security/Cycle-1/README.md) |

### Run CTF box (v1.1.0)

```bash
git checkout ctf/v1.1.0   # or v1.1.0 after tag
cp infra/.env.example infra/.env
# Set DB_PASSWORD per Cycle-2 ground truth / .env.example CTF comments
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf.yml up -d --build
```

### Run secure stack (v2.0.0)

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
│   ├── security/         # Cycle-1 + Cycle-2 workspaces, CWE inventory
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

All engineering documentation lives in `/docs`. Security: [Cycle-1](docs/security/Cycle-1/README.md) · [Cycle-2](docs/security/Cycle-2/README.md).

## Versioning

- `v1.0.0` — Insecure MVP (Cycle-1)
- `v2.0.0` — Secure parallel (Cycle-1)
- `v1.1.0` — CTF box (Cycle-2, branch `ctf/v1.1.0`)
- `v2.1.0` — Secure parallel after Cycle-2 (planned)
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
