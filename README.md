# KC-Project

Long-running full-stack **AppSec / DevSecOps** lab: design a realistic Nest/Next product, ship an intentional insecure tip, pentest it, harden a secure parallel, document the SDLC.

```text
build → insecure tip → Red → Blue → hardened tip → expand
```

**Tip now:** Secure showcase **`v2.10.1`** / `main` (Cycle-10 Blue + nginx2root pin). Red archive: **`v1.10.0`** / **`ctf/v1.10.0`**.  
**Prior secure freeze:** tag **`v2.10.0`** · Cycle-9: **`v2.6.0`**.  
**Pairing model:** product cycles use `v1.x` (insecure) → `v2.x` (secure); some boxes are CTF-only (`ctf/*`).

## Stack

NestJS · Next.js · PostgreSQL · Docker Compose · nginx · Cycle-10 five-zone lab overlay

## What this demonstrates

- Structured security cycles with ADRs, release gates, and frozen archives
- Offensive writeups on `ctf/*` and Blue remediation maps on `remediation/*`
- Verifiable tip: Cycle-10 examiner · prior-cycle Blue asserts · smoke / journey

Cycles **1–10 closed**; secure tip **`v2.10.1`** (nginx2root hotfix on Blue `v2.10.0`). Catalog: [docs/security/README.md](docs/security/README.md) · strategy: [docs/roadmap/STRATEGY.md](docs/roadmap/STRATEGY.md) · portfolio framing: [docs/roadmap/PORTFOLIO-VISION.md](docs/roadmap/PORTFOLIO-VISION.md)

## Run the insecure tip (Cycle-10)

Northwind Document Portal + five-zone enterprise lab. **Sole host publish: HTTPS `:443`.**

```bash
git checkout v1.10.0   # or main / ctf/v1.10.0
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml \
  -f infra/docker-compose.cycle10-lab.yml up -d --build
./infra/cycle10-examiner.sh
```

App: **`https://localhost/`** (port **443** only)  
Stage 0: view-source → `/staff-access/` · Packets: `/packets` (Document Ops)  
Gate: [v1.10.0-pentest-ready](docs/release/v1.10.0-pentest-ready.md) · [infra/cycle10/README.md](infra/cycle10/README.md)

## Run the secure tip (Cycle-10 Blue / prior replay)

```bash
# Cycle-10 Blue tip (current: v2.10.1; archive v2.10.0):
git checkout v2.10.1   # or main / remediation/v2.10.0
cp infra/.env.example infra/.env
./infra/scripts/gen-jwt-keys.sh
docker compose -f infra/docker-compose.prod.yml \
  -f infra/docker-compose.cycle10-lab.yml up -d --build
./infra/cycle10-blue-assert.sh
./infra/cycle10-blue-reachability.sh

# Prior cycle (Cycle-9):
git checkout v2.6.0
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/cycle9-blue-assert.sh
```

App (Blue tip): **`https://localhost/`** (`:443` + `:80`→301) · Demo users: [docs/deploy/demo-users.md](docs/deploy/demo-users.md) (CI/dev only)  
Policy: [SECURITY.md](SECURITY.md)

## Explore & play

Want to **pentest a box** or try a **guided Blue** harden against a Red handoff?

→ **[USAGE.md](USAGE.md)** — Red games, Blue handoff, spoiler rules, git map.

Featured Red: tag / **`ctf/v1.10.0`** (Cycle-10 — Document Portal → `docproc` → integrate → bastion). Prior: `ctf/v1.6.0` (Cycle-9). Secure replay: [v2.6.0](https://github.com/KLJr-Dev/KC-Project/releases/tag/v2.6.0).

## License

[MIT](LICENSE)
