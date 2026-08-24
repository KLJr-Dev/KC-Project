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

## Current Status (v2.1.0 — secure product)

**Tag:** `v2.1.0` on `main` · **Canonical roadmap:** [STRATEGY.md](docs/roadmap/STRATEGY.md) (ADR-027) · **Portfolio:** [PORTFOLIO-VISION.md](docs/roadmap/PORTFOLIO-VISION.md) · **Versioning:** [ADR-032](docs/decisions/ADR-032-post-v2.1.0-versioning.md)

Cycles 1–2 are **closed**:

| Cycle | Insecure / CTF | Secure |
|-------|----------------|--------|
| 1 | tag `v1.0.0` | tag `v2.0.0` |
| 2 | `ctf/v1.1.0` / tag `v1.1.0` | tag `v2.1.0` (current `main`) |

| Track | Artifact |
|-------|----------|
| Secure gate (current) | [v2.1.0-secure-ready.md](docs/release/v2.1.0-secure-ready.md) |
| Cycle-2 remediation | [v2.1.0-remediation.md](docs/security/Cycle-2/Remediation/v2.1.0-remediation.md) · [blue-team-plan.md](docs/security/Cycle-2/Remediation/blue-team-plan.md) |
| Cycle-2 CTF (frozen) | branch/tag `v1.1.0` on `ctf/v1.1.0` — [Cycle-2 README](docs/security/Cycle-2/README.md) |
| Cycle-1 (history) | [v1.0.0-writeup.md](docs/security/Cycle-1/PenTest/v1.0.0-writeup.md) · [v2.0.0-remediation.md](docs/security/Cycle-1/Remediation/v2.0.0-remediation.md) · tag `v1.0.0` |

- **Docker (primary):** `docker compose -f infra/docker-compose.prod.yml up -d --build` → `http://localhost:8080`
- **TLS lab profile:** `prod` + `docker-compose.tls.yml` → `https://localhost:8443` ([infra/README.md](infra/README.md))
- **Demo users:** `user@kc.test` / `mod@kc.test` / `admin@kc.test` — [demo-users.md](docs/deploy/demo-users.md) (hashed at rest; lab UI gated in prod)
- **Product UI:** My Files, Sharing, Review (mod), Admin — `/dev` gated unless lab flag
- **Tests:** smoke · journey · e2e-docker · tls-smoke · Cycle-2 regression
- **Next:** SoftDev surface expansion (version bump) and/or CTF fork of **v2.1.0** without a version bump ([ADR-032](docs/decisions/ADR-032-post-v2.1.0-versioning.md); [future-ctf-candidates.md](docs/security/Cycle-2/Remediation/future-ctf-candidates.md))

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
│   ├── decisions/        # ADRs 001–032
│   ├── diagrams/         # Architecture, auth, infra, threats, timeline
│   ├── roadmap/          # STRATEGY, ROADMAP, version summaries
│   ├── security/         # Cycle-1 + Cycle-2 workspaces, CWE inventory
│   ├── release/          # v1.0.0 / v1.1.0 / v2.0.0 / v2.1.0 readiness gates
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

All engineering documentation lives in `/docs`. Security cycles: [Cycle-1](docs/security/Cycle-1/README.md) · [Cycle-2](docs/security/Cycle-2/README.md).

## Versioning

| Tag | Meaning |
|-----|---------|
| `v0.x` | Build phase |
| `v1.0.0` | Insecure MVP (Cycle-1) — **tagged** |
| `v2.0.0` | Cycle-1 secure parallel — **tagged** |
| `v1.1.0` | Cycle-2 CTF box — **tagged** (`ctf/v1.1.0`) |
| `v2.1.0` | Cycle-2 secure product (current `main`) — **tagged** |
| `v2.2.0+` | Only when SoftDev expands surface ([ADR-032](docs/decisions/ADR-032-post-v2.1.0-versioning.md)) |

Cycles 1–2 used [ADR-013](docs/decisions/ADR-013-expansion-cycle-versioning.md) version pairs. **From v2.1.0 forward:** [ADR-032](docs/decisions/ADR-032-post-v2.1.0-versioning.md) — CTFs misconfigure the current app **without** a product version bump.

## Branching Strategy

```
main                    Stable secure product (v2.1.0 today)
 ├── backend             SoftDev — Nest/API
 ├── frontend            SoftDev — Next UI
 ├── dev                 SoftDev — integration
 ├── ctf/v1.1.0          Frozen Cycle-2 CTF + Red evidence
 ├── remediation/v2.0.0  Frozen Cycle-1 Blue implementation history
 └── remediation/v2.1.0  Frozen Cycle-2 Blue implementation history

Ephemeral:
  remediation/<next>    Create → PR to main → freeze (keep for storytelling)
  hotfix/*              Docs/comment fixes → delete after merge
```

Remediation **docs and fixes live on `main`**; frozen `remediation/*` branches are portfolio archives. Cycle-1 Red writeup is on `main` under `docs/security/Cycle-1/PenTest/`; insecure app = tag `v1.0.0`.

## Collaboration

Git version control. CI/CD deferred per ADR-017.
