# KC-Project

Long-running full-stack **AppSec / DevSecOps** lab: design a realistic Nest/Next product, ship an intentional insecure tip, pentest it, harden a secure parallel, document the SDLC.

```text
build → insecure tip → Red → Blue → hardened tip → expand
```

**Tip now:** hardened **`v2.4.0`** on `main` (Ops Documents path-confined; Cycle-7 overlays unpublished).  
**Pairing model:** product cycles use `v1.x` (insecure) → `v2.x` (secure); some boxes are CTF-only (`ctf/*`).

## Stack

NestJS · Next.js · PostgreSQL · Docker Compose · nginx (optional TLS / lab overlays)

## What this demonstrates

- Structured security cycles with ADRs, release gates, and frozen archives
- Offensive writeups on `ctf/*` and Blue remediation maps on `remediation/*`
- Verifiable tip: smoke / journey / Blue asserts / tls-smoke

Cycles **1–7 are closed**. Catalog: [docs/security/README.md](docs/security/README.md) · strategy: [docs/roadmap/STRATEGY.md](docs/roadmap/STRATEGY.md) · portfolio framing: [docs/roadmap/PORTFOLIO-VISION.md](docs/roadmap/PORTFOLIO-VISION.md)

## Run the hardened tip (demo)

```bash
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
```

App: `http://localhost:8080` · TLS / LAN demos: [infra/README.md](infra/README.md)  
Demo users: [docs/deploy/demo-users.md](docs/deploy/demo-users.md)  
Policy for real vs lab findings: [SECURITY.md](SECURITY.md)

## Explore & play

Want to **pentest a box** or try a **guided Blue** harden against a Red handoff?

→ **[USAGE.md](USAGE.md)** — Red games, Blue handoff, spoiler rules, git map.

Featured Red release: [v1.4.0](https://github.com/KLJr-Dev/KC-Project/releases/tag/v1.4.0) (Cycle-7). Secure tip release: [v2.4.0](https://github.com/KLJr-Dev/KC-Project/releases/tag/v2.4.0).

## License

[MIT](LICENSE)
