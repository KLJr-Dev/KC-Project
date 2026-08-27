# KC-Project

Long-running full-stack **AppSec / DevSecOps** lab: design a realistic Nest/Next product, ship an intentional insecure tip, pentest it, harden a secure parallel, document the SDLC.

```text
build → insecure tip → Red → Blue → hardened tip → expand
```

**Tip now:** intentional insecure **`v1.5.0`** on `main` (Cycle-8 Northwind Intake — Red open). Hardened peer after Blue: **`v2.5.0`**.  
**Pairing model:** product cycles use `v1.x` (insecure) → `v2.x` (secure); some boxes are CTF-only (`ctf/*`).

## Stack

NestJS · Next.js · PostgreSQL · Docker Compose · nginx (optional TLS / lab overlays)

## What this demonstrates

- Structured security cycles with ADRs, release gates, and frozen archives
- Offensive writeups on `ctf/*` and Blue remediation maps on `remediation/*`
- Verifiable tip: smoke / journey / Blue asserts / tls-smoke

Cycles **1–7 are closed**. Cycle-8 insecure tip tagged — Red open. Catalog: [docs/security/README.md](docs/security/README.md) · strategy: [docs/roadmap/STRATEGY.md](docs/roadmap/STRATEGY.md) · portfolio framing: [docs/roadmap/PORTFOLIO-VISION.md](docs/roadmap/PORTFOLIO-VISION.md)

## Run the tip (Cycle-8 insecure — demo / Red)

```bash
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle8.yml up -d --build
./infra/smoke-test.sh
```

Prod alone (no plant ports): omit `docker-compose.cycle8.yml`.

App: `http://localhost:8080` · TLS / LAN demos: [infra/README.md](infra/README.md)  
Demo users: [docs/deploy/demo-users.md](docs/deploy/demo-users.md)  
Policy for real vs lab findings: [SECURITY.md](SECURITY.md)

## Explore & play

Want to **pentest a box** or try a **guided Blue** harden against a Red handoff?

→ **[USAGE.md](USAGE.md)** — Red games, Blue handoff, spoiler rules, git map.

Featured Red: tag / `ctf/v1.5.0` (Cycle-8). Prior: [v1.4.0](https://github.com/KLJr-Dev/KC-Project/releases/tag/v1.4.0). Last secure tip: [v2.4.0](https://github.com/KLJr-Dev/KC-Project/releases/tag/v2.4.0).

## License

[MIT](LICENSE)
