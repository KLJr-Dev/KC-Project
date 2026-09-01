# KC-Project

Long-running full-stack **AppSec / DevSecOps** lab: design a realistic Nest/Next product, ship an intentional insecure tip, pentest it, harden a secure parallel, document the SDLC.

```text
build → insecure tip → Red → Blue → hardened tip → expand
```

**Tip now:** Insecure **`v1.6.0`** on `main` (Cycle-9 Red open). Secure replay: tag **`v2.5.0`**. Archive: **`ctf/v1.6.0`**.  
**Pairing model:** product cycles use `v1.x` (insecure) → `v2.x` (secure); some boxes are CTF-only (`ctf/*`).

## Stack

NestJS · Next.js · PostgreSQL · Docker Compose · nginx (optional TLS / lab overlays)

## What this demonstrates

- Structured security cycles with ADRs, release gates, and frozen archives
- Offensive writeups on `ctf/*` and Blue remediation maps on `remediation/*`
- Verifiable tip: smoke / journey / Blue asserts / tls-smoke

Cycles **1–8 are closed**; **Cycle-9** Red open on **`v1.6.0`** / **`ctf/v1.6.0`**. Catalog: [docs/security/README.md](docs/security/README.md) · strategy: [docs/roadmap/STRATEGY.md](docs/roadmap/STRATEGY.md) · portfolio framing: [docs/roadmap/PORTFOLIO-VISION.md](docs/roadmap/PORTFOLIO-VISION.md)

## Run the insecure tip (Cycle-9)

```bash
git checkout v1.6.0   # or main
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/cycle9-examiner.sh
```

## Run the secure tip (replay)

```bash
git checkout v2.5.0   # or main after merge
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
```

Insecure Cycle-8 replay: `git checkout ctf/v1.5.0` + `docker-compose.cycle8.yml` — see [USAGE.md](USAGE.md).

App: `http://localhost:8080` · TLS / LAN demos: [infra/README.md](infra/README.md)  
Demo users: [docs/deploy/demo-users.md](docs/deploy/demo-users.md)  
Policy for real vs lab findings: [SECURITY.md](SECURITY.md)

## Explore & play

Want to **pentest a box** or try a **guided Blue** harden against a Red handoff?

→ **[USAGE.md](USAGE.md)** — Red games, Blue handoff, spoiler rules, git map.

Featured Red: tag / `ctf/v1.6.0` (Cycle-9 — header trust → IDOR → race → export PT → SIEM). Prior: `ctf/v1.5.0` (Cycle-8). Secure replay: [v2.5.0](https://github.com/KLJr-Dev/KC-Project/releases/tag/v2.5.0).

## License

[MIT](LICENSE)
