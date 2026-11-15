# KC-Project

Long-running full-stack **AppSec / DevSecOps** lab: design a realistic Nest/Next product, ship an intentional insecure tip, pentest it, harden a secure parallel, document the SDLC.

```text
build → insecure tip → Red → Blue → hardened tip → expand
```

**Tip now:** Insecure **`v1.10.0`** on `main` / **`ctf/v1.10.0`** (Cycle-10 SoftDev frozen · **Red next**).  
**Prior secure replay:** tag **`v2.6.0`** (Cycle-9 closed).  
**Pairing model:** product cycles use `v1.x` (insecure) → `v2.x` (secure); some boxes are CTF-only (`ctf/*`).

## Stack

NestJS · Next.js · PostgreSQL · Docker Compose · nginx · Cycle-10 five-zone lab overlay

## What this demonstrates

- Structured security cycles with ADRs, release gates, and frozen archives
- Offensive writeups on `ctf/*` and Blue remediation maps on `remediation/*`
- Verifiable tip: Cycle-10 examiner · prior-cycle Blue asserts · smoke / journey

Cycles **1–9 are closed**; **Cycle-10** tip frozen — Red on **`ctf/v1.10.0`**. Catalog: [docs/security/README.md](docs/security/README.md) · strategy: [docs/roadmap/STRATEGY.md](docs/roadmap/STRATEGY.md) · portfolio framing: [docs/roadmap/PORTFOLIO-VISION.md](docs/roadmap/PORTFOLIO-VISION.md)

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

## Run the secure tip (prior cycle replay)

```bash
git checkout v2.6.0
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
./infra/cycle9-blue-assert.sh
```

App (secure replay): `http://localhost:8080` · TLS / LAN demos: [infra/README.md](infra/README.md)  
Demo users: [docs/deploy/demo-users.md](docs/deploy/demo-users.md)  
Policy for real vs lab findings: [SECURITY.md](SECURITY.md)

## Explore & play

Want to **pentest a box** or try a **guided Blue** harden against a Red handoff?

→ **[USAGE.md](USAGE.md)** — Red games, Blue handoff, spoiler rules, git map.

Featured Red: tag / **`ctf/v1.10.0`** (Cycle-10 — Document Portal → `docproc` → integrate → bastion). Prior: `ctf/v1.6.0` (Cycle-9). Secure replay: [v2.6.0](https://github.com/KLJr-Dev/KC-Project/releases/tag/v2.6.0).

## License

[MIT](LICENSE)
