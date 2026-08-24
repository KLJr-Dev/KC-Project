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

Cycles 1–3 are **closed**:

| Cycle | Insecure / CTF | Secure / Blue |
|-------|----------------|---------------|
| 1 | tag `v1.0.0` | tag `v2.0.0` · frozen `remediation/v2.0.0` |
| 2 | `ctf/v1.1.0` / tag `v1.1.0` | tag `v2.1.0` · frozen `remediation/v2.1.0` |
| 3 | `ctf/leak-crack-db` (no product tag) | docs + regression on `main` · frozen `remediation/cycle-3-leak-crack-db` |

| Track | Artifact |
|-------|----------|
| Secure product (current) | tag **`v2.1.0`** / `main` — [v2.1.0-secure-ready.md](docs/release/v2.1.0-secure-ready.md) |
| Cycle-3 Blue gate | [cycle-3-leak-crack-db-secure-ready.md](docs/release/cycle-3-leak-crack-db-secure-ready.md) |
| Cycle-3 CTF (frozen) | `ctf/leak-crack-db` — [Cycle-3 README](docs/security/Cycle-3/README.md) |
| Cycle-2 CTF (frozen) | `ctf/v1.1.0` — [Cycle-2 README](docs/security/Cycle-2/README.md) |
| Cycle-1 (history) | [v1.0.0-writeup.md](docs/security/Cycle-1/PenTest/v1.0.0-writeup.md) · tag `v1.0.0` |

- **Docker (primary):** `docker compose -f infra/docker-compose.prod.yml up -d --build` → `http://localhost:8080`
- **TLS lab profile:** `prod` + `docker-compose.tls.yml` → `https://localhost:8443` ([infra/README.md](infra/README.md))
- **Demo users:** `user@kc.test` / `mod@kc.test` / `admin@kc.test` — [demo-users.md](docs/deploy/demo-users.md)
- **Product UI:** My Files, Sharing, Review (mod), Admin — `/dev` gated unless lab flag
- **Tests:** smoke · journey · e2e-docker · tls-smoke · Cycle-2/3 regression
- **Next:** SoftDev surface expansion (version bump) **or** another `ctf/<scenario>` on **v2.1.0** without a bump ([ADR-032](docs/decisions/ADR-032-post-v2.1.0-versioning.md); [future-ctf-candidates.md](docs/security/Cycle-2/Remediation/future-ctf-candidates.md))

### Run locally (Docker — secure stack)

```bash
cp infra/.env.example infra/.env
# set DB_PASSWORD etc.; source infra/.env before compose if needed
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
./infra/journey-test.sh
```

Do **not** attach CTF compose overlays on this path. CTF boxes live only on `ctf/*` branches.

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
│   ├── security/         # Cycle-1 … Cycle-3 workspaces, CWE inventory
│   ├── release/          # readiness gates (incl. Cycle-3)
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

All engineering documentation lives in `/docs`. Security cycles: [Cycle-1](docs/security/Cycle-1/README.md) · [Cycle-2](docs/security/Cycle-2/README.md) · [Cycle-3](docs/security/Cycle-3/README.md).

## Versioning

| Tag | Meaning |
|-----|---------|
| `v0.x` | Build phase |
| `v1.0.0` | Insecure MVP (Cycle-1) — **tagged** |
| `v2.0.0` | Cycle-1 secure parallel — **tagged** |
| `v1.1.0` | Cycle-2 CTF box — **tagged** (`ctf/v1.1.0`) |
| `v2.1.0` | Cycle-2 secure product (current `main`) — **tagged** |
| `v2.2.0+` | Only when SoftDev expands surface ([ADR-032](docs/decisions/ADR-032-post-v2.1.0-versioning.md)) |

Cycles 1–2 used [ADR-013](docs/decisions/ADR-013-expansion-cycle-versioning.md) version pairs. **From v2.1.0 forward:** [ADR-032](docs/decisions/ADR-032-post-v2.1.0-versioning.md) — CTFs misconfigure the current app **without** a product version bump (Cycle-3 = `ctf/leak-crack-db`).

## Branching Strategy

Nine long-lived remotes (archives + SoftDev rails):

```
main                              Stable secure product (v2.1.0)
 ├── backend                       SoftDev — Nest/API (reset from main before use)
 ├── frontend                      SoftDev — Next UI (reset from main before use)
 ├── dev                           SoftDev — integration (reset from main before use)
 ├── ctf/v1.1.0                    Frozen Cycle-2 CTF + Red evidence
 ├── ctf/leak-crack-db             Frozen Cycle-3 CTF + Red evidence
 ├── remediation/v2.0.0            Frozen Cycle-1 Blue history
 ├── remediation/v2.1.0            Frozen Cycle-2 Blue history
 └── remediation/cycle-3-leak-crack-db  Frozen Cycle-3 Blue history

Ephemeral:
  ctf/<scenario>          Create from main → box → freeze (never merge CTF into main)
  remediation/<name>      Create → PR docs/fixes to main → freeze
  hotfix/*                Short-lived → delete after merge
```

Remediation **docs and secure-path locks live on `main`**; frozen `remediation/*` / `ctf/*` branches are portfolio archives. SoftDev rails (`backend` / `frontend` / `dev`) may lag `main` until the next SoftDev push — **recreate or reset from `main` before starting feature work**.

## Collaboration

Git version control. CI/CD deferred per ADR-017.
