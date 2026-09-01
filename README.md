# KC-Project

Long-running full-stack **AppSec / DevSecOps** lab: design a realistic Nest/Next product, ship an intentional insecure tip, pentest it, harden a secure parallel, document the SDLC.

```text
build → insecure tip → Red → Blue → hardened tip → expand
```

**Tip now:** Secure **`v2.5.0`** on `main` (Cycle-8 **Closed**). **Next:** insecure **`v1.6.0`** integrated on **`dev`** — PR to `main` pending.  
**Pairing model:** product cycles use `v1.x` (insecure) → `v2.x` (secure); some boxes are CTF-only (`ctf/*`).

## Stack

NestJS · Next.js · PostgreSQL · Docker Compose · nginx (optional TLS / lab overlays)

## What this demonstrates

- Structured security cycles with ADRs, release gates, and frozen archives
- Offensive writeups on `ctf/*` and Blue remediation maps on `remediation/*`
- Verifiable tip: smoke / journey / Blue asserts / tls-smoke

Cycles **1–8 are closed**; **Cycle-9** (`v1.6.0` → `v2.6.0`) SoftDev **integrated on `dev`**. Catalog: [docs/security/README.md](docs/security/README.md) · strategy: [docs/roadmap/STRATEGY.md](docs/roadmap/STRATEGY.md) · portfolio framing: [docs/roadmap/PORTFOLIO-VISION.md](docs/roadmap/PORTFOLIO-VISION.md)

## Run the secure tip

```bash
git checkout v2.5.0   # or main after merge
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
```

Insecure Cycle-9 (on `dev`, prod compose only):

```bash
git checkout dev
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/cycle9-examiner.sh
```

Insecure Cycle-8 replay: `git checkout ctf/v1.5.0` + `docker-compose.cycle8.yml` — see [USAGE.md](USAGE.md).

App: `http://localhost:8080` · TLS / LAN demos: [infra/README.md](infra/README.md)  
Demo users: [docs/deploy/demo-users.md](docs/deploy/demo-users.md)  
Policy for real vs lab findings: [SECURITY.md](SECURITY.md)

## Explore & play

Want to **pentest a box** or try a **guided Blue** harden against a Red handoff?

→ **[USAGE.md](USAGE.md)** — Red games, Blue handoff, spoiler rules, git map.

Featured Red: tag / `ctf/v1.5.0` (Cycle-8). **Next Red:** `v1.6.0` (Onboarding/HR — header trust → IDOR → race → export PT → SIEM). Secure tip: [v2.5.0](https://github.com/KLJr-Dev/KC-Project/releases/tag/v2.5.0).

## License

[MIT](LICENSE)
