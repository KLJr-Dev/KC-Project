# USAGE — Play & explore KC-Project

Portfolio lab you can also **play**: Red boxes (primary), guided Blue (Red handoff), and a hardened tip for demos.

Root [`README.md`](README.md) is the recruiter story. This file is the map.

---

## Git map

| Artifact | Role |
|----------|------|
| **`main`** / tag **`v2.x`** | Hardened tip — currently **`v2.5.0`** |
| **Tag `v1.x`** | Immutable insecure tip for that cycle |
| **`ctf/*`** | Frozen Red archive (code + writeup/evidence) |
| **`remediation/*`** | Frozen Blue archive (fix history + maps) |
| **GitHub Releases** | Featured storefront only — latest secure tip + featured Red games (not every tag) |
| **`backend` / `frontend` / `dev`** | Maintainer feature lanes — not for players |

Do not push to `ctf/*` or `remediation/*`. Do not treat intentional lab vulns as GitHub security advisories — see [`SECURITY.md`](SECURITY.md).

---

## Spoiler policy

Same idea as player briefs:

- Unmarked links (player brief, this guide, Blue handoff) = safe to open while playing.
- Links labeled **`[SPOILER]`** = writeups, full remediation maps, flags, exploit steps.
- Open spoilers when stuck, done, or grading yourself.

---

## Track: Secure tip (demo — not a challenge)

Hardened product for walkthroughs.

```bash
git checkout v2.5.0
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
```

Prior secure tip: **`v2.4.0`**.

App: `http://localhost:8080`  
TLS / recruiter LAN: see [`infra/README.md`](infra/README.md) (`docker-compose.tls.yml` → `:8443`).

Demo users: [`docs/deploy/demo-users.md`](docs/deploy/demo-users.md).

---

## Track: Red (primary game)

Plant overlays ship **with the checkout** (tag / `ctf/*`). Tip (`main` / Blue branch) holds only the **hardened** product — prior cycle compose/examiners are not on tip after retirement.

### Featured — Cycle-9 Northwind Onboarding

Medium AppSec path: Nest BFF → FastAPI hop header trust → onboarding-request IDOR → race approve → export path traversal → SIEM leak. Prod compose only.

```bash
git checkout v1.6.0
# or: git checkout ctf/v1.6.0
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/cycle9-examiner.sh
```

Start: [player brief](docs/security/Cycle-9/Dev/v1.6.0-player-brief.md) (hints only).  
**`[SPOILER]`** writeup: on `ctf/v1.6.0` — [PenTest index](docs/security/Cycle-9/PenTest/README.md).  
Gate: [v1.6.0-pentest-ready](docs/release/v1.6.0-pentest-ready.md).

### Featured — Cycle-8 Northwind Intake

Multi-day OSCP-shaped path: Intake SQLi → John (SMTP) → Hydra (FTP) → revshell → sudo nano → Samba/SMTP. Cowrie `:22` is decoy only.

```bash
git checkout v1.5.0
# or: git checkout ctf/v1.5.0
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle8.yml up -d --build
```

Start: [player brief](docs/security/Cycle-8/Dev/v1.5.0-player-brief.md) (hints only).  
**`[SPOILER]`** writeup: on `ctf/v1.5.0` — [PenTest index](docs/security/Cycle-8/PenTest/README.md).  
Release: [v1.5.0](https://github.com/KLJr-Dev/KC-Project/releases/tag/v1.5.0).

### More Red boxes (tags / `ctf/*` — no featured Release required)

| Box | Checkout | Skills | Brief / hub |
|-----|----------|--------|-------------|
| Cycle-9 | `v1.6.0` / `ctf/v1.6.0` | header trust → IDOR → race → export PT → SIEM | [Cycle-9](docs/security/Cycle-9/README.md) |
| Cycle-7 | `v1.4.0` / `ctf/v1.4.0` | LFI + FTP/SSH/Cowrie/jump | [Cycle-7](docs/security/Cycle-7/README.md) (+ `docker-compose.cycle7.yml` on that checkout) |
| Cycle-6 | `v1.3.0` / `ctf/v1.3.0` | Preview SSRF + bookmark CSRF | [Cycle-6](docs/security/Cycle-6/README.md) |
| Cycle-5 | `ctf/shells-privesc` | cmdi → shell → PrivEsc | [Cycle-5](docs/security/Cycle-5/README.md) |
| Cycle-4 | `v1.2.0` / `ctf/v1.2.0` | Notes XSS → SSH | [Cycle-4](docs/security/Cycle-4/README.md) (+ `docker-compose.ssh.yml` on that checkout) |
| Cycle-3 | `ctf/leak-crack-db` | leak → crack → SQLi | [Cycle-3](docs/security/Cycle-3/README.md) |
| Cycle-2 | `v1.1.0` / `ctf/v1.1.0` | IDOR / JWT / PG | [Cycle-2](docs/security/Cycle-2/README.md) |
| Cycle-1 | `v1.0.0` | MVP AppSec | [Cycle-1](docs/security/Cycle-1/README.md) |

Catalog: [`docs/security/README.md`](docs/security/README.md).

---

## Track: Blue (guided — Red handoff)

Not a blind CTF. You get a realistic Red → Blue ticket, then harden the **same tip Red finished**.

### Cycle-8 (closed)

Handoff: [`blue-handoff.md`](docs/security/Cycle-8/Remediation/blue-handoff.md)  
**`[SPOILER]`** answer key: tag [`v2.5.0`](https://github.com/KLJr-Dev/KC-Project/releases/tag/v2.5.0) · [`v2.5.0-remediation.md`](docs/security/Cycle-8/Remediation/v2.5.0-remediation.md) · frozen `remediation/v2.5.0`

### Cycle-7 example

```bash
git checkout -b blue/cycle-7 v1.4.0
```

Handoff: [`blue-handoff.md`](docs/security/Cycle-7/Remediation/blue-handoff.md) · tag [`v2.4.0`](https://github.com/KLJr-Dev/KC-Project/releases/tag/v2.4.0)

Other cycles: use that cycle’s Remediation folder + insecure tag the same way.

---

## Quick infra pointer

Compose overlays, TLS, smoke/journey: [`infra/README.md`](infra/README.md).  
Prod alone must not publish Postgres `:5433`, retired Cycle-7 ports (`:21` / `:2222` / `:2223`), or Cycle-8 plant ports (`:21` / `:22`) without the archive overlay checkout.
