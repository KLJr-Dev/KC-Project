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

## Current Status (v2.0.0 — secure parallel)

**Tag:** `v2.0.0` on `main` · **Canonical roadmap:** [STRATEGY.md](docs/roadmap/STRATEGY.md) (ADR-027) · **Portfolio:** [PORTFOLIO-VISION.md](docs/roadmap/PORTFOLIO-VISION.md)

Cycle-1 is **closed**: insecure MVP (`v1.0.0`) → pentest → secure parallel (`v2.0.0`).

| Track | Artifact |
|-------|----------|
| Secure gate | [v2.0.0-secure-ready.md](docs/release/v2.0.0-secure-ready.md) |
| Remediation | [v2.0.0-remediation.md](docs/security/Cycle-1/Remediation/v2.0.0-remediation.md) · [blue-team-plan.md](docs/security/Cycle-1/Remediation/blue-team-plan.md) |
| Pentest (frozen) | [v1.0.0-writeup.md](docs/security/Cycle-1/PenTest/v1.0.0-writeup.md) on `pentest/cycle-1` |
| Before-state | [v1.0.0-ground-truth.md](docs/security/Cycle-1/Dev/v1.0.0-ground-truth.md) · tag `v1.0.0` |

- **Docker (primary):** `docker compose -f infra/docker-compose.prod.yml up -d --build` → `http://localhost:8080`
- **TLS lab profile:** `prod` + `docker-compose.tls.yml` → `https://localhost:8443` ([infra/README.md](infra/README.md))
- **Demo users:** `user@kc.test` / `mod@kc.test` / `admin@kc.test` — [demo-users.md](docs/deploy/demo-users.md) (hashed at rest; lab UI gated in prod)
- **Product UI:** My Files, Sharing, Review (mod), Admin — `/dev` gated unless lab flag
- **Tests:** smoke · journey · e2e-docker (150) · tls-smoke
- **Next:** **v1.1.0** CTF — fork tag `v2.0.0`, misconfigure + plant flags (no new routes); see ADR-013

### Run locally (Docker — secure stack)

```bash
cp infra/.env.example infra/.env
# set DB_PASSWORD etc.; source infra/.env before compose if needed
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
├── backend/              # NestJS REST API
├── frontend/             # Next.js product UI (+ gated /dev explorers)
├── infra/                # Docker compose, nginx, TLS overlay, verify scripts
├── docs/                 # Engineering and project documentation
│   ├── architecture/     # System architecture, auth flow, data model, STRIDE
│   ├── decisions/        # ADRs 001–031
│   ├── diagrams/         # Architecture, auth, infra, threats, timeline
│   ├── roadmap/          # STRATEGY, ROADMAP, version summaries
│   ├── security/         # Cycle-1 workspace, CWE inventory
│   ├── release/          # v1.0.0 / v2.0.0 readiness gates
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

All engineering documentation lives in `/docs`. Security cycle artifacts: [docs/security/Cycle-1/](docs/security/Cycle-1/README.md).

## Versioning

| Tag | Meaning |
|-----|---------|
| `v0.x` | Build phase |
| `v1.0.0` | Insecure MVP (pentest-ready) — **tagged** |
| `v2.0.0` | Secure parallel (Cycle-1 remediated) — **tagged** |
| `v1.1.0` / `v2.1.0` | Next expansion cycle (CTF fork from secure, then harden) |

See [ADR-013](docs/decisions/ADR-013-expansion-cycle-versioning.md).

## Branching Strategy

```
main                    Stable releases (v2.0.0 secure parallel)
 ├── remediation/v2.0.0  Merged — Cycle-1 Blue Team
 ├── pentest/cycle-1     Frozen Red evidence (do not “fix” history)
 └── ctf/v1.1.0          (planned) fork from tag v2.0.0
```

## Collaboration

Git version control. CI/CD deferred per ADR-017.
