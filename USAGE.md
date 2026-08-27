# USAGE — Play & explore KC-Project

Portfolio lab you can also **play**: Red boxes (primary), guided Blue (Red handoff), and a hardened tip for demos.

Root [`README.md`](README.md) is the recruiter story. This file is the map.

---

## Git map

| Artifact | Role |
|----------|------|
| **`main`** / tag **`v2.x`** | Hardened tip — demo / recruiter walk |
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
git checkout v2.4.0   # or: git checkout main
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
```

App: `http://localhost:8080`  
TLS / recruiter LAN: see [`infra/README.md`](infra/README.md) (`docker-compose.tls.yml` → `:8443`).

Demo users: [`docs/deploy/demo-users.md`](docs/deploy/demo-users.md).

---

## Track: Red (primary game)

### Featured — Cycle-7 Northwind Ops

Multi-day path: Ops LFI → FTP → SSH → sudo find → jump pivot.

```bash
git checkout v1.4.0
# or: git checkout ctf/v1.4.0
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle7.yml up -d --build
```

Start: [player brief](docs/security/Cycle-7/Dev/v1.4.0-player-brief.md) (hints only).  
Release: [v1.4.0](https://github.com/KLJr-Dev/KC-Project/releases/tag/v1.4.0).

**`[SPOILER]`** writeup: [`ctf/v1.4.0` PenTest](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.4.0/docs/security/Cycle-7/PenTest/v1.4.0-writeup.md)

### More Red boxes (tags / `ctf/*` — no featured Release required)

| Box | Checkout | Skills | Brief / hub |
|-----|----------|--------|-------------|
| Cycle-6 | `v1.3.0` / `ctf/v1.3.0` | Preview SSRF + bookmark CSRF | [Cycle-6](docs/security/Cycle-6/README.md) |
| Cycle-5 | `ctf/shells-privesc` | cmdi → shell → PrivEsc | [Cycle-5](docs/security/Cycle-5/README.md) |
| Cycle-4 | `v1.2.0` / `ctf/v1.2.0` | Notes XSS → SSH | [Cycle-4](docs/security/Cycle-4/README.md) (+ `docker-compose.ssh.yml`) |
| Cycle-3 | `ctf/leak-crack-db` | leak → crack → SQLi | [Cycle-3](docs/security/Cycle-3/README.md) |
| Cycle-2 | `v1.1.0` / `ctf/v1.1.0` | IDOR / JWT / PG | [Cycle-2](docs/security/Cycle-2/README.md) |
| Cycle-1 | `v1.0.0` | MVP AppSec | [Cycle-1](docs/security/Cycle-1/README.md) |

Catalog: [`docs/security/README.md`](docs/security/README.md).

---

## Track: Blue (guided — Red handoff)

Not a blind CTF. You get a realistic Red → Blue ticket, then harden the **same tip Red finished**.

### Cycle-7 example

```bash
git fetch --tags
git checkout -b blue/cycle-7 v1.4.0
# work on your branch only — do not push to ctf/* or move the tag
```

1. Read the **Blue handoff** (findings + CWE + where to look): [`docs/security/Cycle-7/Remediation/blue-handoff.md`](docs/security/Cycle-7/Remediation/blue-handoff.md)
2. Patch until success criteria in that doc hold on prod-alone compose.
3. Optional self-check after you think you’re done: compare to tip / asserts.

**`[SPOILER]`** answer key:

- Tag [`v2.4.0`](https://github.com/KLJr-Dev/KC-Project/releases/tag/v2.4.0) (hardened tip)
- Full finding → fix map: [`v2.4.0-remediation.md`](docs/security/Cycle-7/Remediation/v2.4.0-remediation.md)
- Frozen Blue branch: `remediation/v2.4.0`
- Asserts on tip: `./infra/cycle7-blue-assert.sh` · `./infra/assert-cycle7-unpublished.sh` (via smoke)

Other cycles: use that cycle’s Remediation folder + insecure tag the same way; Cycle-7 is the worked example.

---

## Quick infra pointer

Compose overlays, TLS, smoke/journey: [`infra/README.md`](infra/README.md).  
Prod alone must not publish Postgres `:5433` or Cycle-7 overlay ports (`:21` / `:2222` / `:2223`).
