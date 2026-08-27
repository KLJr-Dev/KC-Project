# Infrastructure

Deployment and infrastructure for **KC-Project**.

**Current tip:** Intentional insecure **`v1.4.0`** (Cycle-7 Northwind Ops) — use overlays for the box; last hardened tag **`v2.3.0`**.  
**Cycle-7 tip:** `docker-compose.cycle7.yml` — FTP `:21`, SSH `:2222`, Cowrie `:2223`, internal jump (ADR-035).  
**Insecure SoftDev replay:** tag / branch **`v1.2.0`** / **`ctf/v1.2.0`** + `docker-compose.ssh.yml` only.  
**Cycle-5 CTF replay:** frozen `ctf/shells-privesc` + `docker-compose.ctf-shells.yml` (on that branch).  
**Optional tip noise:** `docker-compose.lab-host.yml` — SSH `:2222` only (no `:8787`).  
Historical insecure baseline: tag `v1.0.0`. Frozen CTF boxes (`ctf/v1.1.0`, `ctf/leak-crack-db`) — do not attach those overlays without intent.
Canonical deployment: [STRATEGY.md](../docs/roadmap/STRATEGY.md) · SoftDev pair: [ADR-033](../docs/decisions/ADR-033-cycle-4-softdev-version-pair.md).

---

## Dual deploy paths

| Path | Compose file | Use case | Entry |
|------|--------------|----------|-------|
| **Secure / lab (primary)** | `docker-compose.prod.yml` | Day-to-day, journeys, smoke (**loopback HTTP OK**) | `http://localhost:8080` |
| **TLS profile** | `prod` + `docker-compose.tls.yml` | **Required for LAN / recruiter secure demos**; HTTPS / HSTS / Secure cookies | `https://localhost:8443` |
| **SSH foothold (v1.2.0 replay only)** | `prod` + `docker-compose.ssh.yml` | Frozen SoftDev / CTF chain — **not** default tip | SSH `:2222` |
| **Cycle-7 Northwind Ops** | `prod` + `docker-compose.cycle7.yml` | Multi-service tip (`v1.4.0`) — FTP/SSH/Cowrie/jump | `:21` / `:2222` / `:2223` |
| **Lab-host noise (optional)** | `prod` + `docker-compose.lab-host.yml` | Hardened SSH-only sidecar — **no** kc-agent | SSH `:2222` |
| **Native dev** | `compose.yml` (DB only) | `npm run start:dev` on host | `:4000` API, `:3000` UI |

**C4-F03 / C5 policy:** Prod compose alone must not publish `:2222` or `:8787` — `./infra/assert-ssh-unpublished.sh`. SoftDev SSH overlay = `v1.2.0` replay; tip lab-host overlay = optional noise only.

**LAN / off-loopback:** Do not advertise cleartext `:8080` on a reachable NIC as “secure.” Use the TLS overlay (or terminate TLS elsewhere). Loopback HTTP remains an accepted residual (R-01).

```mermaid
flowchart TB
    subgraph pentest [Pentest path]
        prodCompose[docker-compose.prod.yml]
        nginx[nginx :8080]
        prodCompose --> nginx
    end
    subgraph dev [Dev path]
        devCompose[compose.yml PG only]
        nativeBE[backend :4000]
        devCompose --> nativeBE
    end
```

**Warning:** Prod uses `pgdata_prod` / `kc_prod`. Dev uses `pgdata` / `kc_dev`. Mixing volumes causes `database "kc_prod" does not exist`.

---

## Quick start (pentest / production stack)

```bash
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
./infra/journey-test.sh
```

App: `http://localhost:8080` — API at `/api/*`.

### TLS profile

```bash
chmod +x infra/scripts/gen-lab-certs.sh infra/tls-smoke.sh
./infra/scripts/gen-lab-certs.sh
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.tls.yml up -d --build
./infra/tls-smoke.sh
```

App: `https://127.0.0.1:8443` (HTTP `:8080` redirects). Certs live in `infra/certs/` (gitignored).

---

## Quick start (native dev)

```bash
docker compose -f infra/compose.yml up -d
cd backend && npm run start:dev   # :4000
cd frontend && npm run dev        # :3000
```

---

## Environment (`.env.example`)

Copy to `infra/.env` before prod compose. Loaded via `env_file` in `docker-compose.prod.yml`.

| Variable | Default | Notes |
|----------|---------|-------|
| `DB_HOST` | `postgres` | Docker service name |
| `DB_PORT` | `5432` | Internal port |
| `DB_ADMIN_USER` / `DB_ADMIN_PASSWORD` | `postgres` / strong | Superuser for init + migrations only |
| `DB_USER` / `DB_PASSWORD` | `kc_app` / strong | Runtime DML role (C2-F07 least-priv) |
| `DB_NAME` | `kc_prod` | Prod database |
| `NEXT_PUBLIC_API_URL` | `/api` | Browser-relative API path |

Upgrading from v2.0.0 single-user DB: set the admin/app split above, then recreate `pgdata_prod` once (`docker compose ... down -v`) **or** let backend `migrate-and-grant` create `kc_app` on an existing volume.

---

## Operator note — access JWT vs refresh cookie (C2-F06)

- **Access JWT** (Bearer): ~15 minutes (`JWT_EXPIRES_IN`). Shell `$TOKEN` goes stale → **401** (not necessarily a failed exploit).
- **Refresh**: httpOnly cookie (`kc_refresh`); SPA silent-refresh via `/api/auth/refresh`. Re-login or refresh when probing after TTL.

---

## Verification scripts

```bash
chmod +x infra/*.sh infra/postgres/init/*.sh
```

| Script | Prereq | Purpose |
|--------|--------|---------|
| `assert-pg-unpublished.sh` | compose file | Prod compose must not publish `:5433` (C2-F03) |
| `assert-ssh-unpublished.sh` | compose file | Prod compose must not publish `:2222` (SSH overlay-only) |
| `assert-cycle7-unpublished.sh` | compose file | Prod compose must not publish `:21` / `:2222` / `:2223` or `cycle7-*` |
| `cycle4-ssh-examiner.sh` | Prod + `docker-compose.ssh.yml` | F3 + loot dry-run for Cycle-4 SoftDev |
| `cycle7-examiner.sh` | Prod + `docker-compose.cycle7.yml` | F2–F5 plant dry-run (bastion→jump) |
| `smoke-test.sh` | Full prod stack on `:8080` | PG + SSH unpublished asserts + health → register → upload → list + demo login |
| `journey-test.sh` | Full prod stack | 3 roles, demo share token API+UI, mod pending, admin files, IDOR deny |
| `tls-smoke.sh` | Prod + `docker-compose.tls.yml` on `:8443` | HTTPS health, HSTS, HTTP→HTTPS redirect, Secure cookie |
| `scripts/gen-lab-certs.sh` | mkcert or openssl | Write `infra/certs/localhost*.pem` |
| `e2e-docker.sh` | Docker available | Backend e2e vs `kc_prod` via `docker-compose.e2e.yml` host `:5433` (admin user) |
| `vm-setup.sh` | Ubuntu + sudo | Install Docker, clone repo, prod stack, smoke + journey |

### Cycle-4 SSH overlay (SoftDev / `v1.2.0` only)

```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ssh.yml up -d --build
./infra/assert-ssh-unpublished.sh
./infra/cycle4-ssh-examiner.sh
# Player: ssh -p 2222 lab@<box>   # password on ctf/v1.2.0 admin ops plant (not on v2.2.0 tip seeds)
```

### Cycle-7 Northwind Ops overlay (`v1.4.0`)

```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle7.yml up -d --build
./infra/assert-cycle7-unpublished.sh
./infra/cycle7-examiner.sh
# Optional: CYCLE7_FTP_PASV_ADDRESS=<box-ip> for Host-Only / LAN FTP PASV
```

### Full verify gate

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
./infra/smoke-test.sh
./infra/journey-test.sh
./infra/e2e-docker.sh
./infra/scripts/gen-lab-certs.sh
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.tls.yml up -d --build
./infra/tls-smoke.sh
```

---

## Security testing

Cycle-2 Blue Team: [docs/security/Cycle-2/Remediation/](../docs/security/Cycle-2/Remediation/).  
Cycle-1 (closed): [docs/security/Cycle-1/README.md](../docs/security/Cycle-1/README.md).

---

## Contents

| File | Purpose |
|------|---------|
| `compose.yml` | Dev PostgreSQL only (`kc_dev`, `:5432`) |
| `docker-compose.prod.yml` | Full stack: postgres, backend, frontend, nginx |
| `postgres/init/` | First-boot `kc_app` role (least-priv) |
| `.env.example` | Prod env template → copy to `.env` |
| `nginx.conf` | Reverse proxy `/api` → backend, `/` → frontend |
| `smoke-test.sh` | Minimal API smoke |
| `journey-test.sh` | Role + seed journey |
| `e2e-docker.sh` | Full e2e vs Docker postgres |
| `vm-setup.sh` | Ubuntu VM bootstrap |

---

## Migrations

Backend entrypoint runs `migrate-and-grant` as **DB admin**, then Nest starts as **`kc_app`** with `MIGRATIONS_RUN=false`.

```bash
cd backend && npm run migration:run   # local CLI (admin creds)
```

See [ADR-022](../docs/decisions/ADR-022-typeorm-migrations.md).
