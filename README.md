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

## Current Status (tag **`v2.2.0`** — secure product)

**Product tip:** Cycle-4 + Cycle-5 Blue closed — Notes hardened; default prod has **no** SSH / no `kc-agent`; optional lab-host SSH overlay only.  
**Insecure SoftDev replay:** tag / branch **`v1.2.0`** / **`ctf/v1.2.0`** + `docker-compose.ssh.yml`.  
**Cycle-5 CTF replay:** frozen **`ctf/shells-privesc`**.  
**Canonical roadmap:** [STRATEGY.md](docs/roadmap/STRATEGY.md) · **SoftDev pair:** [ADR-033](docs/decisions/ADR-033-cycle-4-softdev-version-pair.md)

> **Note:** Hardened demos use tag **`v2.2.0`**. Do not use `v1.2.0` or CTF branches for recruiter “secure” walks.

Cycles **1–5 are closed**. Playable boxes live on frozen `ctf/*` branches (see [security README](docs/security/README.md)).

| Cycle | Insecure / CTF | Secure / Blue |
|-------|----------------|---------------|
| 1 | tag `v1.0.0` | tag `v2.0.0` · frozen `remediation/v2.0.0` |
| 2 | `ctf/v1.1.0` / tag `v1.1.0` | tag `v2.1.0` · frozen `remediation/v2.1.0` |
| 3 | `ctf/leak-crack-db` (no product tag) | docs + regression on `main` · frozen `remediation/cycle-3-leak-crack-db` |
| 4 | tag **`v1.2.0`** / `ctf/v1.2.0` | tag **`v2.2.0`** · frozen `remediation/v2.2.0` |
| 5 | `ctf/shells-privesc` (no product tag) | tip hardened · frozen `remediation/shells-privesc` · [secure-ready](docs/release/shells-privesc-secure-ready.md) |

| Track | Artifact |
|-------|----------|
| SoftDev insecure (frozen) | **`v1.2.0`** — [v1.2.0-pentest-ready.md](docs/release/v1.2.0-pentest-ready.md) · [Cycle-4](docs/security/Cycle-4/README.md) |
| Blue / secure tip | **`v2.2.0`** — [v2.2.0-secure-ready.md](docs/release/v2.2.0-secure-ready.md) · Cycle-5 [secure-ready](docs/release/shells-privesc-secure-ready.md) |
| Cycle-5 CTF (frozen) | `ctf/shells-privesc` — [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/shells-privesc/docs/security/Cycle-5/PenTest/shells-privesc-writeup.md) · [Cycle-5](docs/security/Cycle-5/README.md) |
| Cycle-3 CTF (frozen) | `ctf/leak-crack-db` — [Cycle-3 README](docs/security/Cycle-3/README.md) |
| Player brief (C4 insecure) | [v1.2.0-player-brief.md](docs/security/Cycle-4/Dev/v1.2.0-player-brief.md) |
| Cycle-2 CTF (frozen) | `ctf/v1.1.0` — [Cycle-2 README](docs/security/Cycle-2/README.md) |
| Cycle-1 (history) | [v1.0.0-writeup.md](docs/security/Cycle-1/PenTest/v1.0.0-writeup.md) · tag `v1.0.0` |

- **Docker (web only):** `docker compose -f infra/docker-compose.prod.yml up -d --build` → `http://localhost:8080`
- **v1.2.0 full chain (replay):** `prod` + `docker-compose.ssh.yml` on tag/`ctf/v1.2.0` — not default for secure tip
- **TLS lab profile:** `prod` + `docker-compose.tls.yml` → `https://localhost:8443`
- **Demo users:** `user@kc.test` / `mod@kc.test` / `admin@kc.test` — [demo-users.md](docs/deploy/demo-users.md)
- **Product UI:** My Files, **Notes** (plain text), Sharing, Review (mod), Admin — `/dev` gated unless lab flag
- **Tests:** smoke · journey · e2e-docker · tls-smoke · Cycle-2/3/4 regression · Notes e2e
- **Next:** Cycle-5 (shells / PrivEsc) — fork from **`v2.2.0`**

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
| `v1.2.0` | Cycle-4 SoftDev insecure tip — **tagged** · archive `ctf/v1.2.0` |
| `v2.2.0` | Cycle-4 Blue — Notes hardened; no default SSH (**this branch**) |
| `v1.3.0` / `v2.3.0` | Cycle-5 SoftDev pair (shells + PrivEsc) — sketch |

Cycles 1–2 used [ADR-013](docs/decisions/ADR-013-expansion-cycle-versioning.md) version pairs. **CTF-only** after v2.1.0: [ADR-032](docs/decisions/ADR-032-post-v2.1.0-versioning.md) (Cycle-3). **SoftDev security cycles** restore a pair: [ADR-033](docs/decisions/ADR-033-cycle-4-softdev-version-pair.md).

## Branching Strategy

**ADR-015** defines the four SoftDev rails. **ADR-032** adds frozen `ctf/*` / `remediation/*` archives.

| Kind | Remotes | Policy |
|------|---------|--------|
| Product tip | `main` | Secure Notes tip (`v2.2.0`); pin tags for demos |
| SoftDev rails | `backend`, `frontend`, `dev` | **Keep names**; reset from `main` at each SoftDev cycle start |
| Frozen archives | `ctf/v1.1.0`, `ctf/v1.2.0`, `ctf/leak-crack-db`, `remediation/v2.0.0`, `remediation/v2.1.0`, `remediation/v2.2.0`, `remediation/cycle-3-leak-crack-db` | **Keep forever** (portfolio evidence) |

```
main                              Product tip (v2.2.0 secure Notes; pin v1.2.0 for insecure replay)
 ├── backend                       SoftDev rail — Nest/API (reset from main each SoftDev cycle)
 ├── frontend                      SoftDev rail — Next UI
 ├── dev                           SoftDev rail — integration → PR main
 ├── ctf/v1.1.0                    Frozen Cycle-2 CTF + Red evidence
 ├── ctf/leak-crack-db             Frozen Cycle-3 CTF + Red evidence
 ├── ctf/v1.2.0                    Frozen Cycle-4 SoftDev tip + Red evidence
 ├── remediation/v2.0.0            Frozen Cycle-1 Blue history
 ├── remediation/v2.1.0            Frozen Cycle-2 Blue history
 ├── remediation/v2.2.0            Frozen Cycle-4 Blue history
 └── remediation/cycle-3-leak-crack-db  Frozen Cycle-3 Blue history

Ephemeral:
  ctf/<scenario>          Create from tip → box → freeze (never merge CTF into main)
  remediation/<name>      Create → PR docs/fixes to main → freeze
  hotfix/*                Short-lived → delete after merge
```

Do **not** delete SoftDev rails between cycles. Do **not** delete frozen archives. SoftDev tip history is not the archive story — tags + `ctf/*` / `remediation/*` are.

## Collaboration

Git version control. CI/CD deferred per ADR-017.
