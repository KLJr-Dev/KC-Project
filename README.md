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

## Current Status (v1.2.0 SoftDev — intentional insecure tip on `main`)

**Product tip:** Tag **`v1.2.0`** on `main` — intentional insecure Notes + SSH foothold ([pentest-ready](docs/release/v1.2.0-pentest-ready.md) signed). Red next (F1–F3); Blue later as `v2.2.0`.  
**Last secure product tag:** **`v2.1.0`** — pin this (or wait for **`v2.2.0`**) for recruiter / hardened demos.  
**Canonical roadmap:** [STRATEGY.md](docs/roadmap/STRATEGY.md) (ADR-027) · **Portfolio:** [PORTFOLIO-VISION.md](docs/roadmap/PORTFOLIO-VISION.md) · **SoftDev pair:** [ADR-033](docs/decisions/ADR-033-cycle-4-softdev-version-pair.md)

> **Warning:** Current `main` tip is **intentionally vulnerable** (Notes XSS + optional SSH foothold). Do not treat it as the secure baseline.

Cycles 1–3 are **closed**. Cycle-4 SoftDev is **on `main`** — Red after tag; Blue = `v2.2.0`.

| Cycle | Insecure / CTF | Secure / Blue |
|-------|----------------|---------------|
| 1 | tag `v1.0.0` | tag `v2.0.0` · frozen `remediation/v2.0.0` |
| 2 | `ctf/v1.1.0` / tag `v1.1.0` | tag `v2.1.0` · frozen `remediation/v2.1.0` |
| 3 | `ctf/leak-crack-db` (no product tag) | docs + regression on `main` · frozen `remediation/cycle-3-leak-crack-db` |
| 4 | tip on `main` · tag **`v1.2.0`** | tag **`v2.2.0`** (after Red) |

| Track | Artifact |
|-------|----------|
| SoftDev / Red tip (ship) | **`v1.2.0`** — [v1.2.0-pentest-ready.md](docs/release/v1.2.0-pentest-ready.md) · [Cycle-4](docs/security/Cycle-4/README.md) |
| Player brief | [v1.2.0-player-brief.md](docs/security/Cycle-4/Dev/v1.2.0-player-brief.md) |
| Last secure product | tag **`v2.1.0`** — [v2.1.0-secure-ready.md](docs/release/v2.1.0-secure-ready.md) |
| Cycle-3 Blue gate | [cycle-3-leak-crack-db-secure-ready.md](docs/release/cycle-3-leak-crack-db-secure-ready.md) |
| Cycle-3 CTF (frozen) | `ctf/leak-crack-db` — [Cycle-3 README](docs/security/Cycle-3/README.md) |
| Cycle-2 CTF (frozen) | `ctf/v1.1.0` — [Cycle-2 README](docs/security/Cycle-2/README.md) |
| Cycle-1 (history) | [v1.0.0-writeup.md](docs/security/Cycle-1/PenTest/v1.0.0-writeup.md) · tag `v1.0.0` |

- **Docker (web only):** `docker compose -f infra/docker-compose.prod.yml up -d --build` → `http://localhost:8080`
- **Full chain (Notes → SSH):** `prod` + `docker-compose.ssh.yml` → web `:8080` + SSH `lab@…:2222` ([infra/README.md](infra/README.md))
- **TLS lab profile:** `prod` + `docker-compose.tls.yml` → `https://localhost:8443`
- **Demo users:** `user@kc.test` / `mod@kc.test` / `admin@kc.test` — [demo-users.md](docs/deploy/demo-users.md)
- **Product UI:** My Files, **Notes**, Sharing, Review (mod), Admin — `/dev` gated unless lab flag
- **Tests:** smoke · journey · e2e-docker · tls-smoke · Cycle-2/3 regression · Notes e2e · `cycle4-ssh-examiner.sh`
- **Next after tag:** Red writeup (F1–F3) → `remediation/v2.2.0` → Cycle-5 shells/PrivEsc ([Cycle-5](docs/security/Cycle-5/README.md))

### Run locally (Docker — web stack)

```bash
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/assert-pg-unpublished.sh
./infra/smoke-test.sh
./infra/journey-test.sh
```

### Run locally (Docker — Cycle-4 full chain)

```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ssh.yml up -d --build
./infra/assert-ssh-unpublished.sh
./infra/cycle4-ssh-examiner.sh
```

Prod compose **alone** must not publish Postgres `:5433` or SSH `:2222`. SSH is overlay-only.

Do **not** attach older CTF compose overlays on SoftDev/`main` for Cycles 2–3 — those boxes live only on `ctf/*` branches.

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
│   ├── decisions/        # ADRs 001–033
│   ├── diagrams/         # Architecture, auth, infra, threats, timeline
│   ├── roadmap/          # STRATEGY, ROADMAP, version summaries
│   ├── security/         # Cycle-1 … Cycle-5 workspaces, CWE inventory
│   ├── release/          # readiness gates (incl. v1.2.0 SoftDev)
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

All engineering documentation lives in `/docs`. Security cycles: [Cycle-1](docs/security/Cycle-1/README.md) · [Cycle-2](docs/security/Cycle-2/README.md) · [Cycle-3](docs/security/Cycle-3/README.md) · [Cycle-4](docs/security/Cycle-4/README.md) · [Cycle-5](docs/security/Cycle-5/README.md).

## Versioning

| Tag | Meaning |
|-----|---------|
| `v0.x` | Build phase |
| `v1.0.0` | Insecure MVP (Cycle-1) — **tagged** |
| `v2.0.0` | Cycle-1 secure parallel — **tagged** |
| `v1.1.0` | Cycle-2 CTF box — **tagged** (`ctf/v1.1.0`) |
| `v2.1.0` | Cycle-2 secure product — **tagged** (last hardened product before SoftDev) |
| `v1.2.0` | Cycle-4 SoftDev insecure tip (Notes XSS + SSH overlay) — **on `main`** · archive `ctf/v1.2.0` |
| `v2.2.0` | Cycle-4 Blue (planned) — Notes hardened; no default SSH |
| `v1.3.0` / `v2.3.0` | Cycle-5 SoftDev pair (shells + PrivEsc) — sketch |

Cycles 1–2 used [ADR-013](docs/decisions/ADR-013-expansion-cycle-versioning.md) version pairs. **CTF-only** after v2.1.0: [ADR-032](docs/decisions/ADR-032-post-v2.1.0-versioning.md) (Cycle-3). **SoftDev security cycles** restore a pair: [ADR-033](docs/decisions/ADR-033-cycle-4-softdev-version-pair.md).

## Branching Strategy

**ADR-015** defines the four SoftDev rails. **ADR-032** adds frozen `ctf/*` / `remediation/*` archives.

| Kind | Remotes | Policy |
|------|---------|--------|
| Product tip | `main` | SoftDev insecure tip until `v2.2.0`; pin tag `v2.1.0` for hardened demos |
| SoftDev rails | `backend`, `frontend`, `dev` | **Keep names**; reset from `main` at each SoftDev cycle start |
| Frozen archives | `ctf/v1.1.0`, `ctf/v1.2.0`, `ctf/leak-crack-db`, `remediation/v2.0.0`, `remediation/v2.1.0`, `remediation/cycle-3-leak-crack-db` | **Keep forever** (portfolio evidence) |
| Next Blue | later `remediation/v2.2.0` | Create after Red |

```
main                              Product tip (SoftDev insecure Notes+SSH; pin v2.1.0 for secure demos)
 ├── backend                       SoftDev rail — Nest/API (reset from main each SoftDev cycle)
 ├── frontend                      SoftDev rail — Next UI
 ├── dev                           SoftDev rail — integration → PR main
 ├── ctf/v1.1.0                    Frozen Cycle-2 CTF + Red evidence
 ├── ctf/leak-crack-db             Frozen Cycle-3 CTF + Red evidence
 ├── ctf/v1.2.0                    Frozen Cycle-4 SoftDev tip + Red evidence
 ├── remediation/v2.0.0            Frozen Cycle-1 Blue history
 ├── remediation/v2.1.0            Frozen Cycle-2 Blue history
 └── remediation/cycle-3-leak-crack-db  Frozen Cycle-3 Blue history

Ephemeral:
  ctf/<scenario>          Create from tip → box → freeze (never merge CTF into main)
  remediation/<name>      Create → PR docs/fixes to main → freeze
  hotfix/*                Short-lived → delete after merge
```

Do **not** delete SoftDev rails between cycles. Do **not** delete frozen archives. SoftDev tip history is not the archive story — tags + `ctf/*` / `remediation/*` are.

## Collaboration

Git version control. CI/CD deferred per ADR-017.
