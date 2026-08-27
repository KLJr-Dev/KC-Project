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

## Current Status (tip **`v1.4.0`** — intentional insecure · Cycle-7)

**Product tip:** Northwind Ops — Ops Documents LFI + FTP/SSH/Cowrie/jump overlays (ADR-035). Last hardened tag remains **`v2.3.0`** until Blue `v2.4.0`.  
**Replay prior Preview plants:** **`v1.3.0`** / **`ctf/v1.3.0`**.  
**Earlier SoftDev replay:** **`v1.2.0`** / **`ctf/v1.2.0`** + `docker-compose.ssh.yml`.  
**Cycle-5 CTF replay:** frozen **`ctf/shells-privesc`**.  
**Canonical roadmap:** [STRATEGY.md](docs/roadmap/STRATEGY.md) · **Cycle-7 pair:** [ADR-035](docs/decisions/ADR-035-cycle-7-multi-service-pair.md)

> **Note:** Hardened demos use tag **`v2.3.0`**. Do not use `v1.4.0` / CTF branches for recruiter “secure” walks.

Cycles **1–6 are closed**. Cycle-7 tip **shipped** — multi-day Red next ([Cycle-7](docs/security/Cycle-7/README.md)). Playable boxes on frozen `ctf/*` (see [security README](docs/security/README.md)).

| Cycle | Insecure / CTF | Secure / Blue |
|-------|----------------|---------------|
| 1 | tag `v1.0.0` | tag `v2.0.0` · frozen `remediation/v2.0.0` |
| 2 | `ctf/v1.1.0` / tag `v1.1.0` | tag `v2.1.0` · frozen `remediation/v2.1.0` |
| 3 | `ctf/leak-crack-db` (no product tag) | docs + regression on `main` · frozen `remediation/cycle-3-leak-crack-db` |
| 4 | tag **`v1.2.0`** / `ctf/v1.2.0` | tag **`v2.2.0`** · frozen `remediation/v2.2.0` |
| 5 | `ctf/shells-privesc` (no product tag) | tip hardened · frozen `remediation/shells-privesc` |
| 6 | tag **`v1.3.0`** / `ctf/v1.3.0` | tag **`v2.3.0`** · frozen `remediation/v2.3.0` |
| 7 | tag **`v1.4.0`** / `ctf/v1.4.0` | planned **`v2.4.0`** |

| Track | Artifact |
|-------|----------|
| Product insecure (frozen) | **`v1.3.0`** — [v1.3.0-pentest-ready.md](docs/release/v1.3.0-pentest-ready.md) · [Cycle-6](docs/security/Cycle-6/README.md) |
| Blue / secure tip | **`v2.3.0`** — [v2.3.0-secure-ready.md](docs/release/v2.3.0-secure-ready.md) |
| Cycle-6 Red (frozen) | `ctf/v1.3.0` — [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.3.0/docs/security/Cycle-6/PenTest/v1.3.0-writeup.md) |
| Cycle-5 CTF (frozen) | `ctf/shells-privesc` — [Cycle-5](docs/security/Cycle-5/README.md) |
| Cycle-4 SoftDev (frozen) | **`v1.2.0`** / `ctf/v1.2.0` — [Cycle-4](docs/security/Cycle-4/README.md) |
| Cycle-3 CTF (frozen) | `ctf/leak-crack-db` — [Cycle-3](docs/security/Cycle-3/README.md) |
| Cycle-2 CTF (frozen) | `ctf/v1.1.0` — [Cycle-2](docs/security/Cycle-2/README.md) |
| Cycle-1 (history) | [v1.0.0-writeup.md](docs/security/Cycle-1/PenTest/v1.0.0-writeup.md) · tag `v1.0.0` |

- **Docker (web only):** `docker compose -f infra/docker-compose.prod.yml up -d --build` → `http://localhost:8080`
- **TLS lab / recruiter path:** `prod` + `docker-compose.tls.yml` → `https://localhost:8443`
- **v1.3.0 Preview replay:** pin tag/`ctf/v1.3.0` — not default for secure tip
- **v1.2.0 SSH chain (replay):** `prod` + `docker-compose.ssh.yml` on tag/`ctf/v1.2.0`
- **Demo users:** `user@kc.test` / `mod@kc.test` / `admin@kc.test` — [demo-users.md](docs/deploy/demo-users.md)
- **Product UI:** My Files, Notes, **Link Preview**, Sharing, Review (mod), Admin — `/dev` gated unless lab flag
- **Tests:** smoke (incl. `cycle6-blue-assert`) · journey · e2e-docker · tls-smoke
- **Next:** Cycle-7 multi-service story box (`v1.4.0` → `v2.4.0`) — [Cycle-7 stub](docs/security/Cycle-7/README.md)

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
│   ├── decisions/        # ADRs 001–034
│   ├── diagrams/         # Architecture, auth, infra, threats, timeline
│   ├── roadmap/          # STRATEGY, ROADMAP, version summaries
│   ├── security/         # Cycle-1 … Cycle-7 workspaces, CWE inventory
│   ├── release/          # readiness gates (incl. v1.3.0 / v2.3.0)
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

All engineering documentation lives in `/docs`. Security cycles: [Cycle-1](docs/security/Cycle-1/README.md) · [Cycle-2](docs/security/Cycle-2/README.md) · [Cycle-3](docs/security/Cycle-3/README.md) · [Cycle-4](docs/security/Cycle-4/README.md) · [Cycle-5](docs/security/Cycle-5/README.md) · [Cycle-6](docs/security/Cycle-6/README.md) · [Cycle-7](docs/security/Cycle-7/README.md).

## Versioning

| Tag | Meaning |
|-----|---------|
| `v0.x` | Build phase |
| `v1.0.0` | Insecure MVP (Cycle-1) — **tagged** |
| `v2.0.0` | Cycle-1 secure parallel — **tagged** |
| `v1.1.0` | Cycle-2 CTF box — **tagged** (`ctf/v1.1.0`) |
| `v2.1.0` | Cycle-2 secure product — **tagged** |
| `v1.2.0` | Cycle-4 SoftDev insecure tip — **tagged** · archive `ctf/v1.2.0` |
| `v2.2.0` | Cycle-4 Blue — Notes hardened; no default SSH — **tagged** |
| `v1.3.0` | Cycle-6 product expansion insecure tip — **tagged** · archive `ctf/v1.3.0` |
| `v2.3.0` | Cycle-6 Blue — Preview policy + bookmark CSRF (**this tip**) |
| `v1.4.0` / `v2.4.0` | Cycle-7 multi-service story box — planned |

Cycles 1–2 used [ADR-013](docs/decisions/ADR-013-expansion-cycle-versioning.md) version pairs. **CTF-only** after v2.1.0: [ADR-032](docs/decisions/ADR-032-post-v2.1.0-versioning.md) (Cycle-3, Cycle-5). **Product expansion pairs:** [ADR-033](docs/decisions/ADR-033-cycle-4-softdev-version-pair.md) · [ADR-034](docs/decisions/ADR-034-cycle-6-product-expansion-pair.md).

## Branching Strategy

**ADR-015** defines the feature lanes. **ADR-032** adds frozen `ctf/*` / `remediation/*` archives.

| Kind | Remotes | Policy |
|------|---------|--------|
| Product tip | `main` | Secure tip (`v2.3.0`); pin tags for demos |
| Feature lanes | `backend`, `frontend`, `dev` | **Keep names**; reset from `main` at each expansion cycle start |
| Frozen archives | `ctf/*`, `remediation/*` | **Keep forever** (portfolio evidence) |

```
main                              Product tip (v2.3.0 secure; pin v1.3.0 for Preview replay)
 ├── backend                       Feature lane — Nest/API
 ├── frontend                      Feature lane — Next UI
 ├── dev                           Feature lane — integration → PR main
 ├── ctf/v1.1.0 … ctf/v1.3.0       Frozen Red / CTF archives
 ├── ctf/leak-crack-db             Frozen Cycle-3
 ├── ctf/shells-privesc            Frozen Cycle-5
 └── remediation/v2.0.0 … v2.3.0  Frozen Blue history (+ cycle-3 / shells-privesc)

Ephemeral:
  ctf/<scenario>          Create from tip → box → freeze (never merge CTF into main)
  remediation/<name>      Create → PR docs/fixes to main → freeze
  hotfix/*                Short-lived → delete after merge
```

Do **not** delete feature lanes between cycles. Do **not** delete frozen archives.

## Collaboration

Git version control. CI/CD deferred per ADR-017.
